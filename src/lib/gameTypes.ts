import { TargetVariant } from './targetTypes';
import { WeaponId } from './weapons';

export type GameMode = 'classic' | 'survival' | 'daily';
export type GameScreen = 'home' | 'playing' | 'gameover' | 'leaderboard' | 'settings';
export type ThemeColor = 'blue' | 'purple' | 'pink';
export type RoundDuration = 30 | 45 | 60;

export interface Target {
  id: string;
  x: number;
  y: number;
  size: number;
  spawnTime: number;
  lifetime: number;
  color: string;
  glowColor: string;
  hit?: boolean;
  variant: TargetVariant;
  hitsRemaining: number;
  icon: string;
  vx: number;
  vy: number;
}

export interface GameStats {
  score: number;
  hits: number;
  misses: number;
  combo: number;
  bestCombo: number;
  multiplier: number;
  reactionTimes: number[];
  accuracy: number;
  avgReactionTime: number;
  grade: string;
  weaponUsed: WeaponId;
  timeElapsed: number;
  waveReached: number;
  targetsDestroyed: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  accuracy: number;
  bestCombo: number;
  grade: string;
  date: string;
  mode: GameMode;
  weapon?: WeaponId;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  themeColor: ThemeColor;
  roundDuration: RoundDuration;
  selectedWeapon: WeaponId;
}

export const THEME_COLORS: Record<ThemeColor, { hue: string; class: string }> = {
  blue: { hue: '199', class: 'text-neon-blue' },
  purple: { hue: '270', class: 'text-neon-purple' },
  pink: { hue: '330', class: 'text-neon-pink' },
};

export const TARGET_COLORS = [
  'hsl(199, 89%, 48%)',
  'hsl(270, 80%, 60%)',
  'hsl(330, 85%, 60%)',
  'hsl(142, 76%, 50%)',
  'hsl(48, 96%, 53%)',
];
