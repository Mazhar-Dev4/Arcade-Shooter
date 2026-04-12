import { LeaderboardEntry, GameMode } from './gameTypes';

const STORAGE_KEY = 'neon-reflex-leaderboard';

export function getLeaderboard(mode: GameMode): LeaderboardEntry[] {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return (data as LeaderboardEntry[])
      .filter(e => e.mode === mode)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  } catch { return []; }
}

export function saveScore(entry: LeaderboardEntry): void {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as LeaderboardEntry[];
    data.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function getDailyLeaderboard(): LeaderboardEntry[] {
  const today = new Date().toISOString().slice(0, 10);
  return getLeaderboard('daily').filter(e => e.date === today);
}
