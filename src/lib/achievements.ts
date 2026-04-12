export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  totalHits: number;
  bestAccuracy: number;
  bestCombo: number;
  gamesPlayed: number;
  survivalBestTime: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'hits_100', title: 'Sharpshooter', description: '100 total hits', icon: '🎯', check: s => s.totalHits >= 100 },
  { id: 'hits_500', title: 'Marksman', description: '500 total hits', icon: '🔫', check: s => s.totalHits >= 500 },
  { id: 'accuracy_95', title: 'Precision Master', description: '95%+ accuracy in a round', icon: '💎', check: s => s.bestAccuracy >= 95 },
  { id: 'combo_20', title: 'Combo King', description: '20+ combo streak', icon: '🔥', check: s => s.bestCombo >= 20 },
  { id: 'combo_50', title: 'Unstoppable', description: '50+ combo streak', icon: '💥', check: s => s.bestCombo >= 50 },
  { id: 'survival_60', title: 'Survivor', description: 'Survive 60+ seconds', icon: '🛡️', check: s => s.survivalBestTime >= 60 },
  { id: 'games_10', title: 'Dedicated', description: 'Play 10 games', icon: '⭐', check: s => s.gamesPlayed >= 10 },
];

const STATS_KEY = 'neon-reflex-achievements';
const UNLOCKED_KEY = 'neon-reflex-unlocked';

export function getAchievementStats(): AchievementStats {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY) || '{}') as AchievementStats;
  } catch {
    return { totalHits: 0, bestAccuracy: 0, bestCombo: 0, gamesPlayed: 0, survivalBestTime: 0 };
  }
}

export function updateAchievementStats(partial: Partial<AchievementStats>): string[] {
  const current = getAchievementStats();
  const updated: AchievementStats = {
    totalHits: Math.max(current.totalHits || 0, partial.totalHits || 0),
    bestAccuracy: Math.max(current.bestAccuracy || 0, partial.bestAccuracy || 0),
    bestCombo: Math.max(current.bestCombo || 0, partial.bestCombo || 0),
    gamesPlayed: (current.gamesPlayed || 0) + (partial.gamesPlayed || 0),
    survivalBestTime: Math.max(current.survivalBestTime || 0, partial.survivalBestTime || 0),
  };
  localStorage.setItem(STATS_KEY, JSON.stringify(updated));

  // Check for new unlocks
  const unlocked = getUnlocked();
  const newUnlocks: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (!unlocked.includes(a.id) && a.check(updated)) {
      newUnlocks.push(a.id);
    }
  }
  if (newUnlocks.length > 0) {
    localStorage.setItem(UNLOCKED_KEY, JSON.stringify([...unlocked, ...newUnlocks]));
  }
  return newUnlocks;
}

export function getUnlocked(): string[] {
  try {
    return JSON.parse(localStorage.getItem(UNLOCKED_KEY) || '[]');
  } catch { return []; }
}
