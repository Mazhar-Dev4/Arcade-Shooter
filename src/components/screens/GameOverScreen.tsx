import React, { useState } from 'react';
import { GameStats, GameMode } from '@/lib/gameTypes';
import { WeaponId, WEAPONS } from '@/lib/weapons';
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
  const weapon = WEAPONS[stats.weaponUsed];

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
      weapon: stats.weaponUsed,
    });
    setSaved(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 relative z-10 overflow-y-auto"
      style={{ animation: 'screen-in 0.5s ease-out' }}>
      {/* Grade */}
      <div className="mb-4 text-center" style={{ animation: 'grade-reveal 0.8s ease-out' }}>
        <div className={`text-6xl sm:text-8xl font-black ${GRADE_COLORS[stats.grade] || 'text-foreground'}`}
          style={{ textShadow: '0 0 40px currentColor, 0 0 80px currentColor' }}>
          {stats.grade}
        </div>
        <div className="text-muted-foreground text-xs mt-1 uppercase tracking-widest">Performance Grade</div>
      </div>

      {/* Score */}
      <div className="text-2xl sm:text-4xl font-black text-foreground mb-6 tabular-nums"
        style={{ textShadow: '0 0 20px hsl(var(--primary) / 0.3)' }}>
        {stats.score.toLocaleString()}
      </div>

      {/* Stats grid */}
      <div className="glass rounded-2xl p-4 sm:p-5 w-full max-w-sm mb-6">
        <div className="grid grid-cols-2 gap-3">
          <StatItem label="Accuracy" value={`${stats.accuracy}%`} highlight={stats.accuracy >= 90} />
          <StatItem label="Avg Reaction" value={`${stats.avgReactionTime}ms`} highlight={stats.avgReactionTime < 400} />
          <StatItem label="Best Combo" value={`x${stats.bestCombo}`} highlight={stats.bestCombo >= 10} />
          <StatItem label="Targets Destroyed" value={`${stats.targetsDestroyed}`} />
          <StatItem label="Hits" value={`${stats.hits}`} />
          <StatItem label="Misses" value={`${stats.misses}`} />
          {mode === 'survival' && (
            <>
              <StatItem label="Survived" value={`${stats.timeElapsed}s`} highlight />
              <StatItem label="Wave Reached" value={`${stats.waveReached}`} highlight />
            </>
          )}
          {mode !== 'survival' && (
            <StatItem label="Wave" value={`${stats.waveReached}`} />
          )}
        </div>
        {/* Weapon used */}
        <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: weapon.color }} />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Weapon: {weapon.name}</span>
        </div>
      </div>

      {/* Save score */}
      {!saved ? (
        <div className="flex gap-2 w-full max-w-sm mb-5">
          <input type="text" placeholder="Enter your name" value={name}
            onChange={e => setName(e.target.value)} maxLength={12}
            className="flex-1 glass rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary" />
          <button onClick={handleSave}
            className="bg-primary text-primary-foreground rounded-xl px-5 py-3 text-sm font-bold hover:scale-105 transition-transform active:scale-95">
            Save
          </button>
        </div>
      ) : (
        <div className="text-neon-green text-sm mb-5 font-medium">✓ Score saved!</div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onReplay}
          className="bg-primary text-primary-foreground rounded-xl px-6 py-3 font-bold text-sm hover:scale-105 transition-all active:scale-95 neon-glow-blue">
          ▶ Play Again
        </button>
        <button onClick={onHome}
          className="glass rounded-xl px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95">
          Home
        </button>
      </div>
    </div>
  );
};

function StatItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`text-sm sm:text-base font-bold tabular-nums ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</div>
    </div>
  );
}
