import React from 'react';
import { GameMode, RoundDuration, ThemeColor, THEME_COLORS } from '@/lib/gameTypes';

interface Props {
  onPlay: (mode: GameMode) => void;
  onSettings: () => void;
  onLeaderboard: () => void;
  roundDuration: RoundDuration;
  setRoundDuration: (d: RoundDuration) => void;
  themeColor: ThemeColor;
}

export const HomeScreen: React.FC<Props> = ({ onPlay, onSettings, onLeaderboard, roundDuration, setRoundDuration, themeColor }) => {
  const durations: RoundDuration[] = [30, 45, 60];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10" style={{ animation: 'screen-in 0.4s ease-out' }}>
      {/* Title */}
      <div className="text-center mb-10 sm:mb-14">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-2">
          <span className="text-primary text-glow-blue">NEON</span>
        </h1>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
          <span className="text-foreground">REFLEX ARENA</span>
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Test your reflexes. Dominate the arena.
        </p>
      </div>

      {/* Mode Selection */}
      <div className="w-full max-w-sm space-y-3 mb-8">
        <ModeButton
          title="⚡ CLASSIC"
          desc={`Timed rounds • ${roundDuration}s`}
          onClick={() => onPlay('classic')}
          variant="primary"
        />
        <ModeButton
          title="💀 SURVIVAL"
          desc="3 lives • No time limit"
          onClick={() => onPlay('survival')}
          variant="accent"
        />
        <ModeButton
          title="🏆 DAILY CHALLENGE"
          desc="Same targets for everyone"
          onClick={() => onPlay('daily')}
          variant="secondary"
        />
      </div>

      {/* Duration selector for classic */}
      <div className="flex gap-2 mb-8">
        {durations.map(d => (
          <button
            key={d}
            onClick={() => setRoundDuration(d)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              roundDuration === d
                ? 'bg-primary text-primary-foreground neon-glow-blue'
                : 'glass text-muted-foreground hover:text-foreground'
            }`}
          >
            {d}s
          </button>
        ))}
      </div>

      {/* Bottom buttons */}
      <div className="flex gap-4">
        <button
          onClick={onLeaderboard}
          className="glass rounded-xl px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
        >
          🏅 Leaderboard
        </button>
        <button
          onClick={onSettings}
          className="glass rounded-xl px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105"
        >
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
};

function ModeButton({ title, desc, onClick, variant }: {
  title: string; desc: string; onClick: () => void;
  variant: 'primary' | 'accent' | 'secondary';
}) {
  const classes = {
    primary: 'border-primary/30 hover:border-primary/60 hover:neon-glow-blue',
    accent: 'border-accent/30 hover:border-accent/60 hover:neon-glow-pink',
    secondary: 'border-secondary/30 hover:border-secondary/60 hover:neon-glow-purple',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full glass rounded-xl p-4 sm:p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border ${classes[variant]}`}
    >
      <div className="text-base sm:text-lg font-bold tracking-wide">{title}</div>
      <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">{desc}</div>
    </button>
  );
}
