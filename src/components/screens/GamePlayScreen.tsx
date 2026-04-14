import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Target as TargetType, GameMode } from '@/lib/gameTypes';
import { Weapon } from '@/lib/weapons';
import { GameTarget } from '@/components/game/GameTarget';
import { HUD } from '@/components/game/HUD';
import { Crosshair } from '@/components/game/Crosshair';
import { WeaponDisplay, getWeaponPose } from '@/components/game/WeaponDisplay';

interface ShotData {
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
}

interface Props {
  targets: TargetType[];
  score: number;
  combo: number;
  multiplier: number;
  timeLeft: number;
  lives: number;
  mode: GameMode;
  accuracy: number;
  weapon: Weapon;
  wave: number;
  elapsedTime: number;
  isPaused: boolean;
  onHitTarget: (id: string, shot: ShotData) => void;
  onMissShot: (shot: ShotData) => void;
  onPause: () => void;
  onToggleSound: () => void;
  soundEnabled: boolean;
  hitEffects: React.ReactNode;
  shootingEffects: React.ReactNode;
  screenShake: { x: number; y: number };
  firing: boolean;
}

export const GameScreen: React.FC<Props> = ({
  targets, score, combo, multiplier, timeLeft, lives, mode,
  accuracy, weapon, wave, elapsedTime, isPaused,
  onHitTarget, onMissShot, onPause, onToggleSound, soundEnabled,
  hitEffects, shootingEffects, screenShake, firing,
}) => {
  const [isMobile] = useState(() => 'ontouchstart' in window || navigator.maxTouchPoints > 0);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [aimPosition, setAimPosition] = useState<{ x: number; y: number } | null>({
    x: window.innerWidth * (isMobile ? 0.5 : 0.75),
    y: window.innerHeight * 0.45,
  });
  const touchAimRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      setAimPosition(prev => prev ?? { x: window.innerWidth * 0.75, y: window.innerHeight * 0.45 });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const weaponPose = useMemo(
    () => getWeaponPose({ weapon, aimPosition, isMobile, viewport }),
    [weapon, aimPosition, isMobile, viewport],
  );

  const buildShot = useCallback((targetX: number, targetY: number): ShotData => {
    const pose = getWeaponPose({
      weapon,
      aimPosition: { x: targetX, y: targetY },
      isMobile,
      viewport,
    });

    return {
      originX: pose.muzzleX,
      originY: pose.muzzleY,
      targetX,
      targetY,
    };
  }, [weapon, isMobile, viewport]);

  const updateAim = useCallback((x: number, y: number) => {
    setAimPosition({ x, y });
    touchAimRef.current = { x, y };
  }, []);

  const handleBgClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if ((e.target as HTMLElement).closest('[data-hud]')) return;
    updateAim(e.clientX, e.clientY);
    onMissShot(buildShot(e.clientX, e.clientY));
  };

  const handleBgTouch = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if ((e.target as HTMLElement).closest('[data-hud]')) return;
    const touch = e.touches[0];
    if (touch) {
      updateAim(touch.clientX, touch.clientY);
      onMissShot(buildShot(touch.clientX, touch.clientY));
    }
  };

  const handleTargetHit = (id: string, point: { x: number; y: number }) => {
    updateAim(point.x, point.y);
    onHitTarget(id, buildShot(point.x, point.y));
  };

  return (
    <div
      className="fixed inset-0 z-10 select-none animate-fade-in"
      style={{
        touchAction: 'manipulation',
        transform: `translate(${screenShake.x}px, ${screenShake.y}px)`,
        transition: 'transform 0.05s ease-out',
      }}
      onMouseMove={isMobile ? undefined : (e) => updateAim(e.clientX, e.clientY)}
      onClick={isMobile ? undefined : handleBgClick}
      onTouchStart={isMobile ? handleBgTouch : undefined}
      onTouchMove={isMobile ? (e) => {
        const touch = e.touches[0];
        if (touch) updateAim(touch.clientX, touch.clientY);
      } : undefined}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 40%, hsl(var(--primary) / 0.08), transparent 35%), radial-gradient(circle at 50% 120%, hsl(var(--background) / 0), hsl(var(--background) / 0.45) 45%, hsl(var(--background) / 0.88) 100%)',
        }}
      />

      <HUD
        score={score} combo={combo} multiplier={multiplier}
        timeLeft={timeLeft} lives={lives} mode={mode}
        accuracy={accuracy} weapon={weapon} wave={wave} elapsedTime={elapsedTime}
        isPaused={isPaused} onPause={onPause}
        onToggleSound={onToggleSound} soundEnabled={soundEnabled}
      />

      {isPaused && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="glass rounded-[1.75rem] border border-primary/20 px-8 py-7 text-center" style={{ animation: 'screen-in 0.2s ease-out' }}>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.35em] text-muted-foreground">Combat Paused</div>
            <div className="text-4xl font-black text-foreground mb-5 text-glow-blue">PAUSED</div>
            <button onClick={onPause}
              className="rounded-2xl bg-primary px-8 py-3 font-bold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95">
              RESUME
            </button>
          </div>
        </div>
      )}

      {!isPaused && targets.map(t => (
        <GameTarget key={t.id} target={t} onHit={(id) => {
          const el = document.querySelector(`[data-target="${id}"]`) as HTMLElement;
          if (el) {
            const rect = el.getBoundingClientRect();
            handleTargetHit(id, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
          }
        }} />
      ))}

      {hitEffects}
      {shootingEffects}

      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none" style={{ background: 'linear-gradient(180deg, transparent 0%, hsl(var(--background) / 0.08) 22%, hsl(var(--background) / 0.6) 100%)' }} />

      <WeaponDisplay weapon={weapon} firing={firing} isMobile={isMobile} aimPosition={aimPosition} viewport={viewport} />

      <Crosshair weapon={weapon} firing={firing} isMobile={isMobile} aimPosition={aimPosition} />

      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          left: weaponPose.muzzleX - 22,
          top: weaponPose.muzzleY - 22,
          width: 44,
          height: 44,
          background: `radial-gradient(circle, ${weapon.color}55 0%, transparent 72%)`,
          filter: 'blur(10px)',
          opacity: firing ? 0.9 : 0.45,
          transition: 'opacity 0.14s ease-out',
        }}
      />
    </div>
  );
};
