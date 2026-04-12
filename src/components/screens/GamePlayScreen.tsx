import React from 'react';
import { Target as TargetType, GameMode } from '@/lib/gameTypes';
import { GameTarget } from '@/components/game/GameTarget';
import { HUD } from '@/components/game/HUD';

interface Props {
  targets: TargetType[];
  score: number;
  combo: number;
  multiplier: number;
  timeLeft: number;
  lives: number;
  mode: GameMode;
  onHitTarget: (id: string) => void;
  onMissTap: () => void;
  hitEffects: React.ReactNode;
}

export const GameScreen: React.FC<Props> = ({
  targets, score, combo, multiplier, timeLeft, lives, mode,
  onHitTarget, onMissTap, hitEffects,
}) => {
  const handleBgClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    onMissTap();
  };

  return (
    <div
      className="fixed inset-0 z-10 select-none"
      onClick={handleBgClick}
      style={{ touchAction: 'manipulation' }}
    >
      <HUD score={score} combo={combo} multiplier={multiplier} timeLeft={timeLeft} lives={lives} mode={mode} />
      {targets.map(t => (
        <GameTarget key={t.id} target={t} onHit={onHitTarget} />
      ))}
      {hitEffects}
    </div>
  );
};
