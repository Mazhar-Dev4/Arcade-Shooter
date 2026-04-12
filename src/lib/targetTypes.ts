export type TargetVariant = 'standard' | 'fast' | 'heavy' | 'bonus' | 'trap';

export interface TargetConfig {
  variant: TargetVariant;
  label: string;
  baseScore: number;
  hitsRequired: number;
  sizeMultiplier: number;
  lifetimeMultiplier: number;
  speedMultiplier: number;
  color: string;
  glowColor: string;
  icon: string;
  penalty?: boolean;
}

export const TARGET_CONFIGS: Record<TargetVariant, TargetConfig> = {
  standard: {
    variant: 'standard',
    label: 'Standard',
    baseScore: 100,
    hitsRequired: 1,
    sizeMultiplier: 1,
    lifetimeMultiplier: 1,
    speedMultiplier: 1,
    color: 'hsl(199, 89%, 48%)',
    glowColor: 'hsl(199, 89%, 48%)',
    icon: '◎',
  },
  fast: {
    variant: 'fast',
    label: 'Fast',
    baseScore: 200,
    hitsRequired: 1,
    sizeMultiplier: 0.7,
    lifetimeMultiplier: 0.8,
    speedMultiplier: 1.4,
    color: 'hsl(48, 96%, 53%)',
    glowColor: 'hsl(48, 96%, 53%)',
    icon: '⚡',
  },
  heavy: {
    variant: 'heavy',
    label: 'Heavy',
    baseScore: 300,
    hitsRequired: 3,
    sizeMultiplier: 1.4,
    lifetimeMultiplier: 1.5,
    speedMultiplier: 0.5,
    color: 'hsl(270, 80%, 60%)',
    glowColor: 'hsl(270, 80%, 60%)',
    icon: '⬡',
  },
  bonus: {
    variant: 'bonus',
    label: 'Bonus',
    baseScore: 500,
    hitsRequired: 1,
    sizeMultiplier: 0.85,
    lifetimeMultiplier: 0.7,
    speedMultiplier: 1.0,
    color: 'hsl(142, 76%, 50%)',
    glowColor: 'hsl(142, 76%, 50%)',
    icon: '★',
  },
  trap: {
    variant: 'trap',
    label: 'Trap',
    baseScore: -200,
    hitsRequired: 1,
    sizeMultiplier: 1,
    lifetimeMultiplier: 0.8,
    speedMultiplier: 1,
    color: 'hsl(0, 84%, 60%)',
    glowColor: 'hsl(0, 84%, 55%)',
    icon: '✕',
    penalty: true,
  },
};

export function pickTargetVariant(elapsed: number, rand: () => number): TargetVariant {
  const r = rand();
  // Gradually introduce harder types
  if (elapsed < 5) return 'standard';
  if (elapsed < 10) {
    if (r < 0.15) return 'fast';
    return 'standard';
  }
  // After 10s, full distribution
  if (r < 0.05) return 'trap';
  if (r < 0.10) return 'bonus';
  if (r < 0.22) return 'heavy';
  if (r < 0.40) return 'fast';
  return 'standard';
}
