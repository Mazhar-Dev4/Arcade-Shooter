import React, { useState } from 'react';
import { GameMode } from '@/lib/gameTypes';
import { getLeaderboard, getDailyLeaderboard } from '@/lib/leaderboard';

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
    <div className="flex flex-col items-center min-h-screen p-6 pt-10 relative z-10" style={{ animation: 'screen-in 0.4s ease-out' }}>
      <button onClick={onBack} className="absolute top-4 left-4 glass rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back
      </button>

      <h2 className="text-2xl sm:text-3xl font-black mb-6 text-foreground">🏅 LEADERBOARD</h2>

      {/* Mode tabs */}
      <div className="flex gap-1 glass rounded-xl p-1 mb-6">
        {modes.map(m => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              mode === m.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="w-full max-w-md glass rounded-2xl overflow-hidden">
        {entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No scores yet. Be the first!</div>
        ) : (
          <div className="divide-y divide-border/50">
            {entries.map((e, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-7 text-center font-black text-sm ${i < 3 ? 'text-neon-yellow' : 'text-muted-foreground'}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate text-foreground">{e.name}</div>
                  <div className="text-[10px] text-muted-foreground">{e.accuracy}% • x{e.bestCombo}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm tabular-nums text-foreground">{e.score.toLocaleString()}</div>
                  <div className={`text-[10px] font-bold ${
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
