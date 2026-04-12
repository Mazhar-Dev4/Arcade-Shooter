import React from 'react';
import { GameMode } from '@/lib/gameTypes';

interface Props {
  score: number;
  combo: number;
  multiplier: number;
  timeLeft: number;
  lives: number;
  mode: GameMode;
}

export const HUD: React.FC<Props> = ({ score, combo, multiplier, timeLeft, lives, mode }) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
      <div className="flex items-start justify-between p-3 sm:p-4">
        {/* Score */}
        <div className="glass rounded-lg px-3 py-2 sm:px-4 sm:py-2">
          <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Score</div>
          <div className="text-lg sm:text-2xl font-bold text-primary tabular-nums">{score.toLocaleString()}</div>
        </div>

        {/* Combo */}
        {combo > 1 && (
          <div
            className="glass rounded-lg px-3 py-2 text-center"
            style={{ animation: 'combo-pop 0.3s ease-out' }}
            key={combo}
          >
            <div className="text-lg sm:text-2xl font-black text-neon-yellow">
              x{multiplier} {combo >= 5 ? '🔥' : combo >= 10 ? '💥' : ''}
            </div>
            <div className="text-[10px] text-muted-foreground">{combo} COMBO</div>
          </div>
        )}

        {/* Timer / Lives */}
        <div className="glass rounded-lg px-3 py-2 sm:px-4 sm:py-2 text-right">
          {mode === 'survival' ? (
            <>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Lives</div>
              <div className="text-lg sm:text-2xl font-bold text-neon-red">
                {'❤️'.repeat(lives)}
              </div>
            </>
          ) : (
            <>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Time</div>
              <div className={`text-lg sm:text-2xl font-bold tabular-nums ${timeLeft <= 5 ? 'text-neon-red' : 'text-foreground'}`}>
                {timeLeft}s
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
