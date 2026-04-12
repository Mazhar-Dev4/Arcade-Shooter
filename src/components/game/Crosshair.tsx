import React, { useEffect, useState, useCallback } from 'react';
import { Weapon } from '@/lib/weapons';

interface Props {
  weapon: Weapon;
  firing: boolean;
  isMobile: boolean;
  lastTouchPos?: { x: number; y: number } | null;
}

export const Crosshair: React.FC<Props> = ({ weapon, firing, isMobile, lastTouchPos }) => {
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

  // On mobile, show crosshair at last touch position briefly
  const [mobileVisible, setMobileVisible] = useState(false);
  const [mobilePos, setMobilePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isMobile || !lastTouchPos) return;
    setMobilePos({ x: lastTouchPos.x, y: lastTouchPos.y });
    setMobileVisible(true);
    const t = setTimeout(() => setMobileVisible(false), 400);
    return () => clearTimeout(t);
  }, [isMobile, lastTouchPos]);

  const showDesktop = !isMobile && visible;
  const showMobile = isMobile && mobileVisible;

  if (!showDesktop && !showMobile) return null;

  const currentPos = isMobile ? mobilePos : pos;
  const size = isMobile ? 40 : 52;
  const recoilOffset = firing ? weapon.recoilStrength * 4 : 0;
  const spread = firing ? 3 : 0;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: currentPos.x - size / 2,
        top: currentPos.y - size / 2 - recoilOffset,
        width: size,
        height: size,
        transition: firing ? 'none' : 'transform 0.05s ease-out',
        opacity: isMobile ? (mobileVisible ? 0.9 : 0) : 1,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
        {/* Outer ring */}
        <circle cx="26" cy="26" r="20" stroke={weapon.color} strokeWidth="1.5" opacity={0.4}
          strokeDasharray="4 3"
          style={{ filter: `drop-shadow(0 0 6px ${weapon.color})` }} />
        {/* Inner ring */}
        <circle cx="26" cy="26" r={10 + spread} stroke={weapon.color} strokeWidth="1.5" opacity={0.7}
          style={{ filter: `drop-shadow(0 0 8px ${weapon.color})`, transition: 'r 0.08s ease-out' }} />
        {/* Center dot */}
        <circle cx="26" cy="26" r={firing ? 3.5 : 2} fill={weapon.color}
          style={{ filter: `drop-shadow(0 0 10px ${weapon.color})`, transition: 'r 0.05s' }} />
        {/* Crosshair lines with gap */}
        <line x1="26" y1="2" x2="26" y2="14" stroke={weapon.color} strokeWidth="1.5" opacity={0.7} />
        <line x1="26" y1="38" x2="26" y2="50" stroke={weapon.color} strokeWidth="1.5" opacity={0.7} />
        <line x1="2" y1="26" x2="14" y2="26" stroke={weapon.color} strokeWidth="1.5" opacity={0.7} />
        <line x1="38" y1="26" x2="50" y2="26" stroke={weapon.color} strokeWidth="1.5" opacity={0.7} />
        {/* Corner ticks */}
        <line x1="8" y1="8" x2="13" y2="13" stroke={weapon.color} strokeWidth="1" opacity={0.3} />
        <line x1="44" y1="8" x2="39" y2="13" stroke={weapon.color} strokeWidth="1" opacity={0.3} />
        <line x1="8" y1="44" x2="13" y2="39" stroke={weapon.color} strokeWidth="1" opacity={0.3} />
        <line x1="44" y1="44" x2="39" y2="39" stroke={weapon.color} strokeWidth="1" opacity={0.3} />
      </svg>
      {/* Firing flash */}
      {firing && (
        <div className="absolute inset-0 rounded-full" style={{
          background: `radial-gradient(circle, ${weapon.color}60 0%, transparent 60%)`,
          animation: 'muzzle-flash 0.1s ease-out',
        }} />
      )}
    </div>
  );
};
