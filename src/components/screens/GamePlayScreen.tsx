import React, { useState, useRef } from 'react';
import { Target as TargetType, GameMode } from '@/lib/gameTypes';
import { Weapon } from '@/lib/weapons';
import { GameTarget } from '@/components/game/GameTarget';
import { HUD } from '@/components/game/HUD';
import { Crosshair } from '@/components/game/Crosshair';
import { WeaponDisplay } from '@/components/game/WeaponDisplay';

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
  isPaused: boolean;
  onHitTarget: (id: string) => void;
  onMissTap: () => void;
  onPause: () => void;
  onToggleSound: () => void;
  soundEnabled: boolean;
  hitEffects: React.ReactNode;
  shootingEffects: React.ReactNode;
  screenShake: { x: number; y: number };
  onFire: (x: number, y: number) => void;
  firing: boolean;
}

export const GameScreen: React.FC<Props> = ({
  targets, score, combo, multiplier, timeLeft, lives, mode,
  accuracy, weapon, wave, isPaused,
  onHitTarget, onMissTap, onPause, onToggleSound, soundEnabled,
  hitEffects, shootingEffects, screenShake, onFire, firing,
}) => {
  const [isMobile] = useState(() => 'ontouchstart' in window || navigator.maxTouchPoints > 0);
  const [lastTouchPos, setLastTouchPos] = useState<{ x: number; y: number } | null>(null);
  const touchIdRef = useRef(0);

  const handleBgClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if ((e.target as HTMLElement).closest('[data-hud]')) return;
    onFire(e.clientX, e.clientY);
    onMissTap();
  };

  const handleBgTouch = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if ((e.target as HTMLElement).closest('[data-hud]')) return;
    const touch = e.touches[0];
    if (touch) {
      const pos = { x: touch.clientX, y: touch.clientY };
      setLastTouchPos({ ...pos });
      touchIdRef.current++;
      onFire(pos.x, pos.y);
      onMissTap();
    }
  };

  const handleTargetHit = (id: string, x?: number, y?: number) => {
    if (x !== undefined && y !== undefined) {
      setLastTouchPos({ x, y });
      touchIdRef.current++;
    }
    onHitTarget(id);
  };

  return (
    <div
      className="fixed inset-0 z-10 select-none"
      style={{
        touchAction: 'manipulation',
        transform: `translate(${screenShake.x}px, ${screenShake.y}px)`,
        transition: 'transform 0.05s ease-out',
      }}
      onClick={isMobile ? undefined : handleBgClick}
      onTouchStart={isMobile ? handleBgTouch : undefined}
    >
      <HUD
        score={score} combo={combo} multiplier={multiplier}
        timeLeft={timeLeft} lives={lives} mode={mode}
        accuracy={accuracy} weapon={weapon} wave={wave}
        isPaused={isPaused} onPause={onPause}
        onToggleSound={onToggleSound} soundEnabled={soundEnabled}
      />

      {/* Pause overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center" style={{ animation: 'screen-in 0.2s ease-out' }}>
            <div className="text-4xl font-black text-foreground mb-4">PAUSED</div>
            <button onClick={onPause}
              className="bg-primary text-primary-foreground rounded-xl px-8 py-3 font-bold hover:scale-105 transition-transform active:scale-95">
              RESUME
            </button>
          </div>
        </div>
      )}

      {!isPaused && targets.map(t => (
        <GameTarget key={t.id} target={t} onHit={(id) => {
          // Get target position for mobile crosshair
          const el = document.querySelector(`[data-target="${id}"]`) as HTMLElement;
          if (el) {
            const rect = el.getBoundingClientRect();
            handleTargetHit(id, rect.left + rect.width / 2, rect.top + rect.height / 2);
          } else {
            handleTargetHit(id);
          }
        }} />
      ))}

      {hitEffects}
      {shootingEffects}

      {/* Weapon display at bottom */}
      <WeaponDisplay weapon={weapon} firing={firing} isMobile={isMobile} />

      {/* Crosshair - works on both desktop and mobile */}
      <Crosshair weapon={weapon} firing={firing} isMobile={isMobile} lastTouchPos={lastTouchPos} />
    </div>
  );
};
