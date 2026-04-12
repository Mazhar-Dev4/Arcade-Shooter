import React, { useState, useCallback } from 'react';
import { Weapon } from '@/lib/weapons';

interface MuzzleFlash {
  id: number;
  x: number;
  y: number;
}

interface HitMarker {
  id: number;
  x: number;
  y: number;
  critical: boolean;
  points: number;
}

interface BulletTrail {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

export function useShootingEffects() {
  const [muzzleFlashes, setMuzzleFlashes] = useState<MuzzleFlash[]>([]);
  const [hitMarkers, setHitMarkers] = useState<HitMarker[]>([]);
  const [bulletTrails, setBulletTrails] = useState<BulletTrail[]>([]);
  const [screenShake, setScreenShake] = useState({ x: 0, y: 0 });

  const triggerMuzzleFlash = useCallback((x: number, y: number) => {
    const id = Date.now() + Math.random();
    setMuzzleFlashes(prev => [...prev, { id, x, y }]);
    setTimeout(() => setMuzzleFlashes(prev => prev.filter(f => f.id !== id)), 120);
  }, []);

  const triggerHitMarker = useCallback((x: number, y: number, points: number, critical: boolean) => {
    const id = Date.now() + Math.random();
    setHitMarkers(prev => [...prev, { id, x, y, critical, points }]);
    setTimeout(() => setHitMarkers(prev => prev.filter(h => h.id !== id)), 600);
  }, []);

  const triggerBulletTrail = useCallback((x1: number, y1: number, x2: number, y2: number, color: string) => {
    const id = Date.now() + Math.random();
    setBulletTrails(prev => [...prev, { id, x1, y1, x2, y2, color }]);
    setTimeout(() => setBulletTrails(prev => prev.filter(t => t.id !== id)), 200);
  }, []);

  const triggerScreenShake = useCallback((intensity: number) => {
    const angle = Math.random() * Math.PI * 2;
    setScreenShake({
      x: Math.cos(angle) * intensity,
      y: Math.sin(angle) * intensity,
    });
    setTimeout(() => setScreenShake({ x: 0, y: 0 }), 80);
  }, []);

  const fireWeapon = useCallback((weapon: Weapon, clickX: number, clickY: number, targetX?: number, targetY?: number) => {
    triggerScreenShake(weapon.shakeIntensity);
    if (targetX !== undefined && targetY !== undefined) {
      triggerBulletTrail(clickX, clickY, targetX, targetY, weapon.color);
    }
  }, [triggerScreenShake, triggerBulletTrail]);

  const EffectsLayer: React.FC = () => (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Muzzle flashes */}
      {muzzleFlashes.map(f => (
        <div key={f.id} className="absolute" style={{
          left: f.x - 20, top: f.y - 20, width: 40, height: 40,
          background: 'radial-gradient(circle, hsla(48, 96%, 53%, 0.8) 0%, transparent 70%)',
          animation: 'muzzle-flash 0.12s ease-out forwards',
        }} />
      ))}
      {/* Bullet trails */}
      <svg className="absolute inset-0 w-full h-full">
        {bulletTrails.map(t => (
          <line key={t.id} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.color} strokeWidth="2" opacity="0.6"
            style={{ filter: `drop-shadow(0 0 4px ${t.color})`, animation: 'bullet-trail 0.2s ease-out forwards' }} />
        ))}
      </svg>
      {/* Hit markers */}
      {hitMarkers.map(h => (
        <div key={h.id} className="absolute" style={{ left: h.x, top: h.y, transform: 'translate(-50%, -50%)' }}>
          {/* X marker */}
          <svg width="24" height="24" viewBox="0 0 24 24" style={{ animation: 'hitmarker-pop 0.3s ease-out forwards' }}>
            <line x1="4" y1="4" x2="10" y2="10" stroke={h.critical ? 'hsl(48, 96%, 53%)' : 'white'} strokeWidth="2" />
            <line x1="14" y1="4" x2="20" y2="10" stroke={h.critical ? 'hsl(48, 96%, 53%)' : 'white'} strokeWidth="2" />
            <line x1="4" y1="20" x2="10" y2="14" stroke={h.critical ? 'hsl(48, 96%, 53%)' : 'white'} strokeWidth="2" />
            <line x1="14" y1="20" x2="20" y2="14" stroke={h.critical ? 'hsl(48, 96%, 53%)' : 'white'} strokeWidth="2" />
          </svg>
          {/* Points */}
          <div className={`absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-black whitespace-nowrap ${h.critical ? 'text-neon-yellow' : 'text-neon-green'}`}
            style={{ animation: 'float-up 0.6s ease-out forwards', textShadow: '0 0 8px currentColor' }}>
            +{h.points}{h.critical ? ' PERFECT!' : ''}
          </div>
        </div>
      ))}
    </div>
  );

  return { fireWeapon, triggerHitMarker, triggerMuzzleFlash, screenShake, EffectsLayer };
}
