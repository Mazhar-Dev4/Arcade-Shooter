import React from 'react';
import { GameSettings, ThemeColor } from '@/lib/gameTypes';

interface Props {
  settings: GameSettings;
  onChange: (s: GameSettings) => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ settings, onChange, onBack }) => {
  const themes: { key: ThemeColor; label: string; color: string }[] = [
    { key: 'blue', label: 'Neon Blue', color: 'bg-neon-blue' },
    { key: 'purple', label: 'Purple Cyber', color: 'bg-neon-purple' },
    { key: 'pink', label: 'Crimson Pulse', color: 'bg-neon-pink' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 relative z-10" style={{ animation: 'screen-in 0.4s ease-out' }}>
      <button onClick={onBack} className="absolute top-3 left-3 sm:top-4 sm:left-4 glass rounded-lg px-3 py-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back
      </button>

      <h2 className="text-xl sm:text-3xl font-black mb-6 sm:mb-8 text-foreground uppercase tracking-wider">⚙️ Settings</h2>

      <div className="w-full max-w-sm space-y-4 sm:space-y-6">
        {/* Sound */}
        <ToggleRow label="Sound Effects" desc="Weapon & hit sounds"
          value={settings.soundEnabled}
          onChange={() => onChange({ ...settings, soundEnabled: !settings.soundEnabled })} />

        {/* Music */}
        <ToggleRow label="Ambient Music" desc="Background audio"
          value={settings.musicEnabled}
          onChange={() => onChange({ ...settings, musicEnabled: !settings.musicEnabled })} />

        {/* Theme */}
        <div className="glass rounded-xl p-4">
          <div className="font-bold text-sm mb-3 text-foreground">Theme Color</div>
          <div className="flex gap-3">
            {themes.map(t => (
              <button key={t.key} onClick={() => onChange({ ...settings, themeColor: t.key })}
                className={`flex-1 rounded-xl p-2.5 sm:p-3 text-center transition-all border ${
                  settings.themeColor === t.key
                    ? 'border-foreground/40 scale-105'
                    : 'border-border/50 hover:border-foreground/20'
                }`}>
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full ${t.color} mx-auto mb-1`} />
                <div className="text-[9px] sm:text-[10px] text-muted-foreground">{t.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function ToggleRow({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: () => void }) {
  return (
    <div className="glass rounded-xl p-4 flex items-center justify-between">
      <div>
        <div className="font-bold text-sm text-foreground">{label}</div>
        <div className="text-[10px] sm:text-xs text-muted-foreground">{desc}</div>
      </div>
      <button onClick={onChange}
        className={`w-11 h-6 sm:w-12 sm:h-7 rounded-full transition-all duration-200 relative ${
          value ? 'bg-primary neon-glow-blue' : 'bg-muted'
        }`}>
        <span className={`absolute top-0.5 sm:top-1 w-5 h-5 rounded-full bg-foreground transition-all duration-200 ${
          value ? 'left-5 sm:left-6' : 'left-0.5 sm:left-1'
        }`} />
      </button>
    </div>
  );
}
