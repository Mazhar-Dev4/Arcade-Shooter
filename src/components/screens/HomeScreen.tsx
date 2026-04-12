import React, { useState } from 'react';
import { GameMode, RoundDuration, ThemeColor } from '@/lib/gameTypes';
import { WeaponId, WEAPON_LIST, Weapon } from '@/lib/weapons';

interface Props {
  onPlay: (mode: GameMode) => void;
  onSettings: () => void;
  onLeaderboard: () => void;
  roundDuration: RoundDuration;
  setRoundDuration: (d: RoundDuration) => void;
  themeColor: ThemeColor;
  selectedWeapon: WeaponId;
  onSelectWeapon: (w: WeaponId) => void;
}

export const HomeScreen: React.FC<Props> = ({
  onPlay, onSettings, onLeaderboard, roundDuration, setRoundDuration, themeColor,
  selectedWeapon, onSelectWeapon,
}) => {
  const durations: RoundDuration[] = [30, 45, 60];
  const [showWeapons, setShowWeapons] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 relative z-10" style={{ animation: 'screen-in 0.5s ease-out' }}>
      {/* Title */}
      <div className="text-center mb-6 sm:mb-10">
        <div className="inline-block mb-2" style={{ animation: 'title-glow 3s ease-in-out infinite alternate' }}>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-none">
            <span className="text-primary" style={{ textShadow: '0 0 30px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.2)' }}>NEON</span>
          </h1>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none mt-1">
            <span className="text-foreground">REFLEX ARENA</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm uppercase tracking-[0.3em]">
          TARGET • SHOOT • DOMINATE
        </p>
      </div>

      {/* Weapon Loadout */}
      <div className="w-full max-w-sm mb-6">
        <button onClick={() => setShowWeapons(!showWeapons)}
          className="w-full glass rounded-xl p-3 flex items-center justify-between transition-all hover:scale-[1.01] active:scale-[0.99]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
              backgroundColor: `${WEAPON_LIST.find(w => w.id === selectedWeapon)?.color}20`,
              border: `1px solid ${WEAPON_LIST.find(w => w.id === selectedWeapon)?.color}40`,
            }}>
              <WeaponIcon weapon={selectedWeapon} size={18} />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-foreground">{WEAPON_LIST.find(w => w.id === selectedWeapon)?.name}</div>
              <div className="text-[10px] text-muted-foreground">{WEAPON_LIST.find(w => w.id === selectedWeapon)?.description}</div>
            </div>
          </div>
          <span className="text-muted-foreground text-xs">{showWeapons ? '▲' : '▼'}</span>
        </button>

        {showWeapons && (
          <div className="mt-2 space-y-2" style={{ animation: 'screen-in 0.2s ease-out' }}>
            {WEAPON_LIST.map(w => (
              <WeaponCard key={w.id} weapon={w} selected={selectedWeapon === w.id}
                onSelect={() => { onSelectWeapon(w.id); setShowWeapons(false); }} />
            ))}
          </div>
        )}
      </div>

      {/* Mode Selection */}
      <div className="w-full max-w-sm space-y-2 sm:space-y-3 mb-6">
        <ModeButton title="⚡ CLASSIC" desc={`Timed rounds • ${roundDuration}s`}
          onClick={() => onPlay('classic')} variant="primary" />
        <ModeButton title="💀 SURVIVAL" desc="3 lives • Survive as long as you can"
          onClick={() => onPlay('survival')} variant="accent" />
        <ModeButton title="🏆 DAILY CHALLENGE" desc="Same targets for everyone today"
          onClick={() => onPlay('daily')} variant="secondary" />
      </div>

      {/* Duration selector */}
      <div className="flex gap-2 mb-6">
        {durations.map(d => (
          <button key={d} onClick={() => setRoundDuration(d)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              roundDuration === d
                ? 'bg-primary text-primary-foreground neon-glow-blue'
                : 'glass text-muted-foreground hover:text-foreground'
            }`}>
            {d}s
          </button>
        ))}
      </div>

      {/* Bottom buttons */}
      <div className="flex gap-3">
        <button onClick={onLeaderboard}
          className="glass rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95">
          🏅 Leaderboard
        </button>
        <button onClick={onSettings}
          className="glass rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95">
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
};

function WeaponCard({ weapon, selected, onSelect }: { weapon: Weapon; selected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect}
      className={`w-full glass rounded-xl p-3 sm:p-4 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] border ${
        selected ? 'border-primary/50 neon-glow-blue' : 'border-border/30 hover:border-primary/30'
      }`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${weapon.color}15`, border: `1px solid ${weapon.color}30` }}>
          <WeaponIcon weapon={weapon.id} size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-foreground">{weapon.name}</div>
          <div className="text-[10px] text-muted-foreground mb-2">{weapon.description}</div>
          <div className="flex gap-3">
            <StatBar label="SPD" value={weapon.stats.speed} color={weapon.color} />
            <StatBar label="PWR" value={weapon.stats.power} color={weapon.color} />
            <StatBar label="ACC" value={weapon.stats.precision} color={weapon.color} />
          </div>
        </div>
      </div>
    </button>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex-1">
      <div className="text-[8px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</div>
      <div className="h-1 rounded-full bg-muted/50 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function WeaponIcon({ weapon, size }: { weapon: WeaponId; size: number }) {
  const icons: Record<WeaponId, string> = { pistol: '🔫', rifle: '⚡', blaster: '💥' };
  return <span style={{ fontSize: size * 0.8 }}>{icons[weapon]}</span>;
}

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
    <button onClick={onClick}
      className={`w-full glass rounded-xl p-3 sm:p-4 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border ${classes[variant]}`}>
      <div className="text-sm sm:text-base font-bold tracking-wide">{title}</div>
      <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{desc}</div>
    </button>
  );
}
