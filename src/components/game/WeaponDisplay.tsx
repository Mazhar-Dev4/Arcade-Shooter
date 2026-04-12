import React from 'react';
import { Weapon } from '@/lib/weapons';

interface Props {
  weapon: Weapon;
  firing: boolean;
  isMobile: boolean;
}

export const WeaponDisplay: React.FC<Props> = ({ weapon, firing, isMobile }) => {
  const recoilY = firing ? -weapon.recoilStrength * 12 : 0;
  const recoilRotate = firing ? -weapon.recoilStrength * 4 : 0;

  return (
    <div
      className="fixed bottom-0 z-30 pointer-events-none select-none"
      style={{
        right: isMobile ? '50%' : '10%',
        transform: isMobile ? 'translateX(50%)' : undefined,
      }}
    >
      <div
        style={{
          transform: `translateY(${recoilY}px) rotate(${recoilRotate}deg)`,
          transition: firing ? 'none' : 'transform 0.12s ease-out',
        }}
      >
        {/* Weapon SVG */}
        <svg
          width={isMobile ? 140 : 180}
          height={isMobile ? 100 : 130}
          viewBox="0 0 180 130"
          fill="none"
          style={{
            filter: `drop-shadow(0 0 15px ${weapon.color}) drop-shadow(0 0 30px ${weapon.color}50)`,
          }}
        >
          {/* Barrel */}
          <rect x="60" y="30" width="110" height="12" rx="3" fill={weapon.color} opacity={0.9} />
          <rect x="60" y="33" width="110" height="6" rx="2" fill="white" opacity={0.15} />

          {/* Body */}
          <rect x="40" y="28" width="80" height="30" rx="5" fill={`${weapon.color}`} opacity={0.7} />
          <rect x="42" y="30" width="76" height="26" rx="4"
            fill="hsl(230, 25%, 8%)" stroke={weapon.color} strokeWidth="1.5" opacity={0.95} />

          {/* Details on body */}
          <rect x="50" y="36" width="30" height="3" rx="1" fill={weapon.color} opacity={0.5} />
          <rect x="50" y="42" width="20" height="2" rx="1" fill={weapon.color} opacity={0.3} />
          <circle cx="95" cy="43" r="4" fill={weapon.color} opacity={0.4} />
          <circle cx="95" cy="43" r="2" fill={weapon.color} opacity={0.8} />

          {/* Grip */}
          <rect x="55" y="58" width="22" height="40" rx="4"
            fill="hsl(230, 25%, 12%)" stroke={weapon.color} strokeWidth="1" opacity={0.8} />
          <rect x="59" y="62" width="14" height="8" rx="2" fill={weapon.color} opacity={0.15} />
          <rect x="59" y="74" width="14" height="3" rx="1" fill={weapon.color} opacity={0.1} />

          {/* Trigger guard */}
          <path d="M77 58 Q85 58 85 66 Q85 72 80 72 L77 72" stroke={weapon.color} strokeWidth="1.5" fill="none" opacity={0.6} />

          {/* Muzzle tip */}
          <rect x="168" y="32" width="6" height="8" rx="1" fill={weapon.color} opacity={0.6} />

          {/* Scope / top rail */}
          {weapon.id === 'rifle' && (
            <>
              <rect x="65" y="20" width="45" height="10" rx="3" fill="hsl(230, 25%, 12%)"
                stroke={weapon.color} strokeWidth="1" opacity={0.8} />
              <circle cx="75" cy="25" r="3" fill={weapon.color} opacity={0.4} />
              <circle cx="100" cy="25" r="3" fill={weapon.color} opacity={0.4} />
            </>
          )}

          {/* Blaster energy coils */}
          {weapon.id === 'blaster' && (
            <>
              <circle cx="130" cy="36" r="6" fill="none" stroke={weapon.color} strokeWidth="1.5" opacity={0.5} />
              <circle cx="130" cy="36" r="3" fill={weapon.color} opacity={0.6} />
              <circle cx="148" cy="36" r="4" fill="none" stroke={weapon.color} strokeWidth="1" opacity={0.4} />
            </>
          )}
        </svg>

        {/* Muzzle flash */}
        {firing && (
          <div
            className="absolute"
            style={{
              top: isMobile ? 18 : 22,
              right: isMobile ? -10 : -15,
              width: 50 + weapon.shakeIntensity * 8,
              height: 30 + weapon.shakeIntensity * 4,
              background: `radial-gradient(ellipse at left, ${weapon.color} 0%, ${weapon.color}80 30%, transparent 70%)`,
              animation: 'muzzle-flash 0.1s ease-out forwards',
              borderRadius: '50%',
            }}
          />
        )}
      </div>

      {/* Weapon name label */}
      <div
        className="text-center pb-2"
        style={{
          fontSize: 9,
          color: weapon.color,
          textShadow: `0 0 8px ${weapon.color}`,
          letterSpacing: '0.15em',
          fontWeight: 700,
          opacity: 0.7,
        }}
      >
        {weapon.name}
      </div>
    </div>
  );
};
