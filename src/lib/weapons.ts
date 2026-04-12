export type WeaponId = 'pistol' | 'rifle' | 'blaster';

export interface Weapon {
  id: WeaponId;
  name: string;
  description: string;
  fireRate: number; // ms between shots
  recoilStrength: number; // 0-1
  impactSize: number; // multiplier
  shakeIntensity: number; // px
  color: string; // hsl
  stats: { speed: number; power: number; precision: number }; // 0-100
}

export const WEAPONS: Record<WeaponId, Weapon> = {
  pistol: {
    id: 'pistol',
    name: 'NEON PISTOL',
    description: 'Fast & precise laser shots',
    fireRate: 120,
    recoilStrength: 0.15,
    impactSize: 1,
    shakeIntensity: 1,
    color: 'hsl(199, 89%, 48%)',
    stats: { speed: 90, power: 40, precision: 85 },
  },
  rifle: {
    id: 'rifle',
    name: 'PLASMA RIFLE',
    description: 'Balanced energy weapon',
    fireRate: 250,
    recoilStrength: 0.4,
    impactSize: 1.4,
    shakeIntensity: 3,
    color: 'hsl(270, 80%, 60%)',
    stats: { speed: 60, power: 70, precision: 65 },
  },
  blaster: {
    id: 'blaster',
    name: 'ARC BLASTER',
    description: 'Heavy charged plasma cannon',
    fireRate: 500,
    recoilStrength: 0.7,
    impactSize: 2,
    shakeIntensity: 6,
    color: 'hsl(330, 85%, 60%)',
    stats: { speed: 30, power: 95, precision: 45 },
  },
};

export const WEAPON_LIST: Weapon[] = Object.values(WEAPONS);
