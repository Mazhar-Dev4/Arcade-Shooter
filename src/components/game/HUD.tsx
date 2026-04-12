import React from 'react';
import { GameMode } from '@/lib/gameTypes';
import { Weapon } from '@/lib/weapons';

interface Props {
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
  onPause: () => void;
  onToggleSound: () => void;
  soundEnabled: boolean;
}

export const HUD: React.FC<Props> = ({
  score, combo, multiplier, timeLeft, lives, mode,
  accuracy, weapon, wave, isPaused, onPause, onToggleSound, soundEnabled,
}) => {
  const dangerState = mode === 'survival' && lives <= 1;

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
      <div className="flex items-start justify-between p-2 sm:p-3 gap-1">
        {/* Left: Score + Accuracy */}
        <div className="flex flex-col gap-1">
          <div className="glass rounded-lg px-2 py-1.5 sm:px-3 sm:py-2">
            <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">Score</div>
            <div className="text-base sm:text-xl font-black text-primary tabular-nums" style={{ textShadow: '0 0 10px hsl(var(--primary) / 0.5)' }}>
              {score.toLocaleString()}
            </div>
          </div>
          <div className="glass rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-2">
            <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase">ACC</div>
            <div className="text-xs sm:text-sm font-bold text-foreground tabular-nums">{accuracy}%</div>
          </div>
        </div>

        {/* Center: Combo */}
        <div className="flex flex-col items-center gap-1">
          {combo > 1 && (
            <div className="glass rounded-lg px-3 py-1.5 text-center" key={combo}
              style={{ animation: 'combo-pop 0.3s ease-out' }}>
              <div className="text-lg sm:text-2xl font-black text-neon-yellow" style={{ textShadow: '0 0 12px hsl(var(--neon-yellow) / 0.6)' }}>
                x{multiplier} {combo >= 10 ? '💥' : combo >= 5 ? '🔥' : ''}
              </div>
              <div className="text-[9px] text-muted-foreground">{combo} COMBO</div>
            </div>
          )}
          {/* Weapon indicator */}
          <div className="glass rounded-md px-2 py-0.5 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: weapon.color, boxShadow: `0 0 4px ${weapon.color}` }} />
            <div className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{weapon.name}</div>
          </div>
        </div>

        {/* Right: Timer / Lives + Controls */}
        <div className="flex flex-col items-end gap-1">
          <div className={`glass rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 text-right ${dangerState ? 'border-neon-red/50' : ''}`}
            style={dangerState ? { animation: 'pulse-ring 1s infinite', boxShadow: '0 0 15px hsl(0 84% 60% / 0.3)' } : undefined}>
            {mode === 'survival' ? (
              <>
                <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">Lives</div>
                <div className="text-base sm:text-xl font-bold text-neon-red">
                  {'❤️'.repeat(Math.max(0, lives))}
                </div>
                <div className="text-[9px] text-muted-foreground">Wave {wave} • {timeLeft}s</div>
              </>
            ) : (
              <>
                <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">
                  {mode === 'daily' ? '🏆 Daily' : 'Time'}
                </div>
                <div className={`text-base sm:text-xl font-black tabular-nums ${timeLeft <= 5 ? 'text-neon-red' : 'text-foreground'}`}
                  style={timeLeft <= 5 ? { animation: 'pulse-ring 0.5s infinite', textShadow: '0 0 10px hsl(0 84% 60% / 0.5)' } : undefined}>
                  {timeLeft}s
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-1 pointer-events-auto">
            <button onClick={onToggleSound}
              className="glass rounded-md w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs text-muted-foreground hover:text-foreground transition-colors">
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button onClick={onPause}
              className="glass rounded-md w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs text-muted-foreground hover:text-foreground transition-colors">
              {isPaused ? '▶' : '⏸'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
