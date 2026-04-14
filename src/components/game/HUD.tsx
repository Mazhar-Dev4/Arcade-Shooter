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
  const modeLabel = mode === 'daily' ? 'Daily Challenge' : mode === 'survival' ? 'Survival' : 'Classic';
  const integrity = Math.max(0, (lives / 3) * 100);

  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none px-2 pt-2 sm:px-4 sm:pt-4" data-hud>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 sm:gap-3">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="glass rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 min-w-[108px] sm:min-w-[142px]">
            <div className="mb-1 flex items-center gap-2 text-[9px] uppercase tracking-[0.28em] text-muted-foreground sm:text-[10px]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              {modeLabel}
            </div>
            <div className="text-base font-black text-primary tabular-nums sm:text-2xl" style={{ textShadow: '0 0 16px hsl(var(--primary) / 0.45)' }}>
              {score.toLocaleString()}
            </div>
            <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">Score</div>
          </div>

          <div className="glass rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-center min-w-[124px] sm:min-w-[164px]">
            <div className="flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.3em] text-muted-foreground sm:text-[10px]">
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: weapon.color, boxShadow: `0 0 8px ${weapon.color}` }} />
              Weapon
            </div>
            <div className="mt-1 text-xs font-black tracking-[0.24em] text-foreground sm:text-sm">{weapon.name}</div>
            <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[9px] uppercase tracking-[0.18em] text-muted-foreground sm:text-[10px]">
              <div><span className="block text-foreground">{weapon.stats.speed}</span>SPD</div>
              <div><span className="block text-foreground">{weapon.stats.power}</span>PWR</div>
              <div><span className="block text-foreground">{weapon.stats.precision}</span>AIM</div>
            </div>
          </div>

          <div className="flex items-start gap-1.5 sm:gap-2">
            <div className={`glass rounded-2xl px-3 py-2.5 text-right sm:px-4 sm:py-3 ${dangerState ? 'border-destructive/40' : ''}`}
              style={dangerState ? { boxShadow: '0 0 20px hsl(var(--destructive) / 0.18)' } : undefined}>
              <div className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground sm:text-[10px]">
                {mode === 'survival' ? 'Survived' : mode === 'daily' ? 'Challenge' : 'Time Left'}
              </div>
              <div className={`text-lg font-black tabular-nums sm:text-2xl ${mode !== 'survival' && timeLeft <= 5 ? 'text-destructive' : 'text-foreground'}`}
                style={mode !== 'survival' && timeLeft <= 5 ? { textShadow: '0 0 14px hsl(var(--destructive) / 0.35)' } : undefined}>
                {mode === 'survival' ? `${timeLeft}s` : `${timeLeft}s`}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
                ACC {accuracy}% {mode === 'survival' ? `• WAVE ${wave}` : ''}
              </div>
            </div>

            <div className="flex gap-1 pointer-events-auto">
              <button onClick={onToggleSound}
                className="glass flex h-10 w-10 items-center justify-center rounded-2xl text-sm text-muted-foreground transition-colors hover:text-foreground sm:h-11 sm:w-11">
                {soundEnabled ? '🔊' : '🔇'}
              </button>
              <button onClick={onPause}
                className="glass flex h-10 w-10 items-center justify-center rounded-2xl text-sm text-muted-foreground transition-colors hover:text-foreground sm:h-11 sm:w-11">
                {isPaused ? '▶' : '⏸'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          <div className="glass rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[10px]">Accuracy</div>
            <div className="mt-1 text-lg font-black tabular-nums text-foreground sm:text-2xl">{accuracy}%</div>
          </div>

          <div className="glass rounded-2xl px-3 py-2.5 text-center sm:px-4 sm:py-3">
            <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[10px]">Streak</div>
            <div className="mt-1 text-lg font-black sm:text-2xl" style={{ color: combo > 1 ? 'hsl(var(--neon-yellow))' : 'hsl(var(--foreground))', textShadow: combo > 1 ? '0 0 16px hsl(var(--neon-yellow) / 0.45)' : undefined }}>
              x{multiplier}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{combo} combo</div>
          </div>

          {mode === 'survival' ? (
            <div className={`glass col-span-2 rounded-2xl px-3 py-2.5 sm:col-span-1 sm:px-4 sm:py-3 ${dangerState ? 'border-destructive/40' : ''}`}>
              <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[10px]">
                <span>Integrity</span>
                <span>{lives}/3</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted/70 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${integrity}%`,
                    background: dangerState
                      ? 'linear-gradient(90deg, hsl(var(--destructive)) 0%, hsl(var(--accent)) 100%)'
                      : 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
                    boxShadow: dangerState
                      ? '0 0 18px hsl(var(--destructive) / 0.35)'
                      : '0 0 18px hsl(var(--primary) / 0.3)',
                  }}
                />
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
                Wave {wave} • {timeLeft}s alive
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3">
              <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[10px]">Mode Pace</div>
              <div className="mt-1 text-lg font-black text-foreground sm:text-2xl">{mode === 'daily' ? 'Seeded' : 'Ranked'}</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{timeLeft}s left</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
