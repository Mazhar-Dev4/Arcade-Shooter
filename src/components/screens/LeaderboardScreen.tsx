import React, { useState } from 'react';
import { GameMode } from '@/lib/gameTypes';
import { getLeaderboard, getDailyLeaderboard } from '@/lib/leaderboard';
import { WEAPONS } from '@/lib/weapons';

interface Props {
  onBack: () => void;
}

export const LeaderboardScreen: React.FC<Props> = ({ onBack }) => {
  const [mode, setMode] = useState<GameMode>('classic');
  const modes: { key: GameMode; label: string }[] = [
    { key: 'classic', label: 'Classic' },
    { key: 'survival', label: 'Survival' },
    { key: 'daily', label: 'Daily' },
  ];
  const entries = mode === 'daily' ? getDailyLeaderboard() : getLeaderboard(mode);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-6 pt-8 sm:pt-10 relative z-10" style={{ animation: 'screen-in 0.4s ease-out' }}>
      <button onClick={onBack} className="absolute top-3 left-3 sm:top-4 sm:left-4 glass rounded-lg px-3 py-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back
      </button>

      <h2 className="text-xl sm:text-3xl font-black mb-4 sm:mb-6 text-foreground uppercase tracking-wider">🏅 Leaderboard</h2>

      {/* Mode tabs */}
      <div className="flex gap-1 glass rounded-xl p-1 mb-4 sm:mb-6">
        {modes.map(m => (
          <button key={m.key} onClick={() => setMode(m.key)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${
              mode === m.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="w-full max-w-md glass rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-border/30 text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">
          <div className="w-7 text-center">#</div>
          <div className="flex-1">Player</div>
          <div className="w-14 text-center">Weapon</div>
          <div className="w-16 text-right">Score</div>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-10 sm:py-12 text-muted-foreground text-xs sm:text-sm">No scores yet. Be the first!</div>
        ) : (
          <div className="divide-y divide-border/30">
            {entries.map((e, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 transition-colors ${i < 3 ? 'bg-primary/5' : ''}`}
                style={{ animation: `screen-in ${0.3 + i * 0.05}s ease-out` }}>
                <div className={`w-7 text-center font-black text-xs sm:text-sm ${i < 3 ? 'text-neon-yellow' : 'text-muted-foreground'}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs sm:text-sm truncate text-foreground">{e.name}</div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground">{e.accuracy}% • x{e.bestCombo}</div>
                </div>
                <div className="w-14 text-center">
                  {e.weapon && (
                    <div className="inline-flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: WEAPONS[e.weapon]?.color }} />
                      <span className="text-[8px] text-muted-foreground">{WEAPONS[e.weapon]?.name.split(' ')[0]}</span>
                    </div>
                  )}
                </div>
                <div className="w-16 text-right">
                  <div className="font-bold text-xs sm:text-sm tabular-nums text-foreground">{e.score.toLocaleString()}</div>
                  <div className={`text-[9px] sm:text-[10px] font-bold ${
                    e.grade === 'S' ? 'text-neon-yellow' : e.grade === 'A' ? 'text-neon-green' : 'text-muted-foreground'
                  }`}>{e.grade}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
