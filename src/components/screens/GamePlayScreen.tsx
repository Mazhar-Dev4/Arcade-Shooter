import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Target as TargetType, GameMode } from '@/lib/gameTypes';
import { Weapon } from '@/lib/weapons';
import { GameTarget } from '@/components/game/GameTarget';
import { HUD } from '@/components/game/HUD';
import { Crosshair } from '@/components/game/Crosshair';

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
      onFire(touch.clientX, touch.clientY);
      onMissTap();
    }
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
          const rect = document.querySelector(`[data-target="${id}"]`);
          onHitTarget(id);
        }} />
      ))}

      {hitEffects}
      {shootingEffects}
      <Crosshair weapon={weapon} firing={firing} isMobile={isMobile} />
    </div>
  );
};
