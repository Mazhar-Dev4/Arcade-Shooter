import React, { useState } from 'react';
import { GameStats, GameMode } from '@/lib/gameTypes';
import { saveScore } from '@/lib/leaderboard';

interface Props {
  stats: GameStats;
  mode: GameMode;
  onReplay: () => void;
  onHome: () => void;
}

const GRADE_COLORS: Record<string, string> = {
  S: 'text-neon-yellow',
  A: 'text-neon-green',
  B: 'text-primary',
  C: 'text-muted-foreground',
};

export const GameOverScreen: React.FC<Props> = ({ stats, mode, onReplay, onHome }) => {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    saveScore({
      name: name.trim(),
      score: stats.score,
      accuracy: stats.accuracy,
      bestCombo: stats.bestCombo,
      grade: stats.grade,
      date: new Date().toISOString().slice(0, 10),
      mode,
    });
    setSaved(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10" style={{ animation: 'screen-in 0.4s ease-out' }}>
      {/* Grade */}
      <div className="mb-6 text-center">
        <div className={`text-7xl sm:text-9xl font-black ${GRADE_COLORS[stats.grade] || 'text-foreground'}`}
          style={{ textShadow: '0 0 40px currentColor' }}>
          {stats.grade}
        </div>
        <div className="text-muted-foreground text-sm mt-1">PERFORMANCE GRADE</div>
      </div>

      {/* Score */}
      <div className="text-3xl sm:text-5xl font-black text-foreground mb-8 tabular-nums">
        {stats.score.toLocaleString()}
      </div>

      {/* Stats grid */}
      <div className="glass rounded-2xl p-5 sm:p-6 w-full max-w-sm mb-8">
        <div className="grid grid-cols-2 gap-4">
          <StatItem label="Accuracy" value={`${stats.accuracy}%`} />
          <StatItem label="Avg Reaction" value={`${stats.avgReactionTime}ms`} />
          <StatItem label="Best Combo" value={`x${stats.bestCombo}`} />
          <StatItem label="Hits" value={`${stats.hits}`} />
          <StatItem label="Misses" value={`${stats.misses}`} />
          <StatItem label="Total" value={`${stats.hits + stats.misses}`} />
        </div>
      </div>

      {/* Save score */}
      {!saved ? (
        <div className="flex gap-2 w-full max-w-sm mb-6">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={12}
            className="flex-1 glass rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleSave}
            className="bg-primary text-primary-foreground rounded-xl px-5 py-3 text-sm font-bold hover:scale-105 transition-transform active:scale-95"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="text-neon-green text-sm mb-6">✓ Score saved!</div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onReplay}
          className="bg-primary text-primary-foreground rounded-xl px-6 py-3 font-bold text-sm hover:scale-105 transition-all active:scale-95 neon-glow-blue"
        >
          ▶ Play Again
        </button>
        <button
          onClick={onHome}
          className="glass rounded-xl px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-all hover:scale-105"
        >
          Home
        </button>
      </div>
    </div>
  );
};

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-base sm:text-lg font-bold text-foreground tabular-nums">{value}</div>
    </div>
  );
}
