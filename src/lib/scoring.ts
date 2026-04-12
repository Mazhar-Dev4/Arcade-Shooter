export function calcGrade(accuracy: number, avgReaction: number, bestCombo: number): string {
  let points = 0;
  if (accuracy >= 95) points += 3;
  else if (accuracy >= 85) points += 2;
  else if (accuracy >= 70) points += 1;

  if (avgReaction < 300) points += 3;
  else if (avgReaction < 500) points += 2;
  else if (avgReaction < 700) points += 1;

  if (bestCombo >= 20) points += 3;
  else if (bestCombo >= 10) points += 2;
  else if (bestCombo >= 5) points += 1;

  if (points >= 8) return 'S';
  if (points >= 6) return 'A';
  if (points >= 4) return 'B';
  return 'C';
}

export function calcScore(baseHits: number, combo: number, reactionMs: number): number {
  const base = 100;
  const multiplier = Math.min(combo, 10);
  const speedBonus = reactionMs < 300 ? 50 : reactionMs < 500 ? 25 : 0;
  return (base + speedBonus) * Math.max(multiplier, 1);
}

export const MISS_PENALTY = 50;
