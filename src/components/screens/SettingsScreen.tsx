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
    { key: 'purple', label: 'Neon Purple', color: 'bg-neon-purple' },
    { key: 'pink', label: 'Neon Pink', color: 'bg-neon-pink' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10" style={{ animation: 'screen-in 0.4s ease-out' }}>
      <button onClick={onBack} className="absolute top-4 left-4 glass rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Back
      </button>

      <h2 className="text-2xl sm:text-3xl font-black mb-8 text-foreground">⚙️ SETTINGS</h2>

      <div className="w-full max-w-sm space-y-6">
        {/* Sound */}
        <div className="glass rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="font-bold text-sm text-foreground">Sound Effects</div>
            <div className="text-xs text-muted-foreground">Toggle game sounds</div>
          </div>
          <button
            onClick={() => onChange({ ...settings, soundEnabled: !settings.soundEnabled })}
            className={`w-12 h-7 rounded-full transition-all duration-200 relative ${
              settings.soundEnabled ? 'bg-primary neon-glow-blue' : 'bg-muted'
            }`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-foreground transition-all duration-200 ${
              settings.soundEnabled ? 'left-6' : 'left-1'
            }`} />
          </button>
        </div>

        {/* Theme */}
        <div className="glass rounded-xl p-4">
          <div className="font-bold text-sm mb-3 text-foreground">Theme Color</div>
          <div className="flex gap-3">
            {themes.map(t => (
              <button
                key={t.key}
                onClick={() => onChange({ ...settings, themeColor: t.key })}
                className={`flex-1 rounded-xl p-3 text-center transition-all border ${
                  settings.themeColor === t.key
                    ? 'border-foreground/40 scale-105'
                    : 'border-border/50 hover:border-foreground/20'
                }`}
              >
                <div className={`w-6 h-6 rounded-full ${t.color} mx-auto mb-1`} />
                <div className="text-[10px] text-muted-foreground">{t.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
