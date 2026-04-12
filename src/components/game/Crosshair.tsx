import React, { useEffect, useState, useCallback } from 'react';
import { Weapon } from '@/lib/weapons';

interface Props {
  weapon: Weapon;
  firing: boolean;
  isMobile: boolean;
}

export const Crosshair: React.FC<Props> = ({ weapon, firing, isMobile }) => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);

  const handleMove = useCallback((e: MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
    if (!visible) setVisible(true);
  }, [visible]);

  useEffect(() => {
    if (isMobile) return;
    document.body.style.cursor = 'none';
    window.addEventListener('mousemove', handleMove);
    return () => {
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMove);
    };
  }, [isMobile, handleMove]);

  if (isMobile || !visible) return null;

  const size = 48;
  const recoilOffset = firing ? weapon.recoilStrength * 4 : 0;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: pos.x - size / 2,
        top: pos.y - size / 2 - recoilOffset,
        width: size,
        height: size,
        transition: firing ? 'none' : 'transform 0.05s ease-out',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        {/* Outer ring */}
        <circle cx="24" cy="24" r="18" stroke={weapon.color} strokeWidth="1.5" opacity={0.5}
          style={{ filter: `drop-shadow(0 0 4px ${weapon.color})` }} />
        {/* Inner ring */}
        <circle cx="24" cy="24" r="8" stroke={weapon.color} strokeWidth="1" opacity={0.7}
          style={{ filter: `drop-shadow(0 0 6px ${weapon.color})` }} />
        {/* Center dot */}
        <circle cx="24" cy="24" r={firing ? 3 : 2} fill={weapon.color}
          style={{ filter: `drop-shadow(0 0 8px ${weapon.color})`, transition: 'r 0.05s' }} />
        {/* Crosshair lines */}
        <line x1="24" y1="2" x2="24" y2="14" stroke={weapon.color} strokeWidth="1" opacity={0.6} />
        <line x1="24" y1="34" x2="24" y2="46" stroke={weapon.color} strokeWidth="1" opacity={0.6} />
        <line x1="2" y1="24" x2="14" y2="24" stroke={weapon.color} strokeWidth="1" opacity={0.6} />
        <line x1="34" y1="24" x2="46" y2="24" stroke={weapon.color} strokeWidth="1" opacity={0.6} />
        {/* Corner brackets */}
        <path d="M6 18 L6 6 L18 6" stroke={weapon.color} strokeWidth="1" opacity={0.3} fill="none" />
        <path d="M30 6 L42 6 L42 18" stroke={weapon.color} strokeWidth="1" opacity={0.3} fill="none" />
        <path d="M42 30 L42 42 L30 42" stroke={weapon.color} strokeWidth="1" opacity={0.3} fill="none" />
        <path d="M18 42 L6 42 L6 30" stroke={weapon.color} strokeWidth="1" opacity={0.3} fill="none" />
      </svg>
      {/* Firing flash */}
      {firing && (
        <div className="absolute inset-0 rounded-full" style={{
          background: `radial-gradient(circle, ${weapon.color}40 0%, transparent 70%)`,
          animation: 'muzzle-flash 0.1s ease-out',
        }} />
      )}
    </div>
  );
};
