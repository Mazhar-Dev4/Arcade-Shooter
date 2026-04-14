import React, { useEffect, useState, useCallback } from 'react';
import { Weapon } from '@/lib/weapons';

interface Props {
  weapon: Weapon;
  firing: boolean;
  isMobile: boolean;
  aimPosition: { x: number; y: number } | null;
}

export const Crosshair: React.FC<Props> = ({ weapon, firing, isMobile, aimPosition }) => {
  const [mobileVisible, setMobileVisible] = useState(false);

  useEffect(() => {
    if (!isMobile) {
      document.body.style.cursor = 'none';
      return () => {
        document.body.style.cursor = '';
      };
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || !aimPosition) return;
    setMobileVisible(true);
    const t = setTimeout(() => setMobileVisible(false), 520);
    return () => clearTimeout(t);
  }, [isMobile, aimPosition]);

  const showDesktop = !isMobile && Boolean(aimPosition);
  const showMobile = isMobile && mobileVisible && Boolean(aimPosition);

  if ((!showDesktop && !showMobile) || !aimPosition) return null;

  const size = isMobile ? 44 : 58;
  const recoilOffset = firing ? weapon.recoilStrength * 4 : 0;
  const spread = firing ? 4 + weapon.recoilStrength * 3 : 0;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: aimPosition.x - size / 2,
        top: aimPosition.y - size / 2 - recoilOffset,
        width: size,
        height: size,
        transition: firing ? 'none' : 'transform 0.05s ease-out',
        opacity: isMobile ? (mobileVisible ? 0.9 : 0) : 1,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
        <circle
          cx="26"
          cy="26"
          r="19"
          stroke={weapon.color}
          strokeWidth="1.25"
          opacity="0.26"
          strokeDasharray="6 5"
          style={{ filter: `drop-shadow(0 0 8px ${weapon.color})` }}
        />
        <circle
          cx="26"
          cy="26"
          r={10 + spread}
          stroke={weapon.color}
          strokeWidth="1.6"
          opacity="0.8"
          style={{ filter: `drop-shadow(0 0 10px ${weapon.color})`, transition: 'r 0.08s ease-out' }}
        />
        <circle cx="26" cy="26" r={firing ? 3.8 : 2.2} fill="hsl(var(--foreground))" opacity="0.92" />
        <circle
          cx="26"
          cy="26"
          r={firing ? 2.8 : 1.6}
          fill={weapon.color}
          style={{ filter: `drop-shadow(0 0 10px ${weapon.color})`, transition: 'r 0.05s ease-out' }}
        />
        <path d="M26 2V11" stroke={weapon.color} strokeWidth="1.6" strokeLinecap="round" opacity="0.78" />
        <path d="M26 41V50" stroke={weapon.color} strokeWidth="1.6" strokeLinecap="round" opacity="0.78" />
        <path d="M2 26H11" stroke={weapon.color} strokeWidth="1.6" strokeLinecap="round" opacity="0.78" />
        <path d="M41 26H50" stroke={weapon.color} strokeWidth="1.6" strokeLinecap="round" opacity="0.78" />
        <path d="M8 8L13 13" stroke={weapon.color} strokeWidth="1.1" strokeLinecap="round" opacity="0.32" />
        <path d="M44 8L39 13" stroke={weapon.color} strokeWidth="1.1" strokeLinecap="round" opacity="0.32" />
        <path d="M8 44L13 39" stroke={weapon.color} strokeWidth="1.1" strokeLinecap="round" opacity="0.32" />
        <path d="M44 44L39 39" stroke={weapon.color} strokeWidth="1.1" strokeLinecap="round" opacity="0.32" />
      </svg>

      {firing && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${weapon.color}66 0%, transparent 62%)`,
            animation: 'crosshair-pulse 0.12s ease-out',
          }}
        />
      )}
    </div>
  );
};
