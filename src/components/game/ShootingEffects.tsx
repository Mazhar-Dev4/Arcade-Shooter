import React, { useState, useCallback } from 'react';
import { Weapon } from '@/lib/weapons';

interface MuzzleFlash {
  id: number;
  x: number;
  y: number;
  angle: number;
  color: string;
  size: number;
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
  width: number;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  size: number;
  duration: number;
}

interface ImpactBurst {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  success: boolean;
}

export function useShootingEffects() {
  const [muzzleFlashes, setMuzzleFlashes] = useState<MuzzleFlash[]>([]);
  const [hitMarkers, setHitMarkers] = useState<HitMarker[]>([]);
  const [bulletTrails, setBulletTrails] = useState<BulletTrail[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [impactBursts, setImpactBursts] = useState<ImpactBurst[]>([]);
  const [screenShake, setScreenShake] = useState({ x: 0, y: 0 });

  const triggerMuzzleFlash = useCallback((x: number, y: number, angle: number, color: string, size: number) => {
    const id = Date.now() + Math.random();
    setMuzzleFlashes(prev => [...prev, { id, x, y, angle, color, size }]);
    setTimeout(() => setMuzzleFlashes(prev => prev.filter(f => f.id !== id)), 140);
  }, []);

  const triggerHitMarker = useCallback((x: number, y: number, points: number, critical: boolean) => {
    const id = Date.now() + Math.random();
    setHitMarkers(prev => [...prev, { id, x, y, critical, points }]);
    setTimeout(() => setHitMarkers(prev => prev.filter(h => h.id !== id)), 600);
  }, []);

  const triggerBulletTrail = useCallback((x1: number, y1: number, x2: number, y2: number, color: string, width: number) => {
    const id = Date.now() + Math.random();
    const dx = x2 - x1;
    const dy = y2 - y1;
    setBulletTrails(prev => [...prev, { id, x1, y1, x2, y2, color, width }]);
    setProjectiles(prev => [...prev, { id, x: x1, y: y1, dx, dy, color, size: 7 + width * 1.8, duration: 140 }]);
    setTimeout(() => setBulletTrails(prev => prev.filter(t => t.id !== id)), 180);
    setTimeout(() => setProjectiles(prev => prev.filter(p => p.id !== id)), 170);
  }, []);

  const triggerImpactBurst = useCallback((x: number, y: number, color: string, size: number, success: boolean) => {
    const id = Date.now() + Math.random();
    setImpactBursts(prev => [...prev, { id, x, y, color, size, success }]);
    setTimeout(() => setImpactBursts(prev => prev.filter(b => b.id !== id)), 260);
  }, []);

  const triggerScreenShake = useCallback((intensity: number) => {
    const angle = Math.random() * Math.PI * 2;
    setScreenShake({
      x: Math.cos(angle) * intensity,
      y: Math.sin(angle) * intensity,
    });
    setTimeout(() => setScreenShake({ x: 0, y: 0 }), 80);
  }, []);

  const fireWeapon = useCallback((weapon: Weapon, originX: number, originY: number, targetX: number, targetY: number, success = true) => {
    const angle = (Math.atan2(targetY - originY, targetX - originX) * 180) / Math.PI;
    const width = Math.max(2, weapon.impactSize * 1.8);
    triggerScreenShake(weapon.shakeIntensity * (success ? 1 : 0.75));
    triggerMuzzleFlash(originX, originY, angle, weapon.color, 24 + weapon.impactSize * 24);
    triggerBulletTrail(originX, originY, targetX, targetY, weapon.color, width);
    triggerImpactBurst(targetX, targetY, weapon.color, 22 + weapon.impactSize * (success ? 22 : 12), success);
  }, [triggerScreenShake, triggerMuzzleFlash, triggerBulletTrail, triggerImpactBurst]);

  const EffectsLayer: React.FC = () => (
    <div className="fixed inset-0 pointer-events-none z-40">
      {muzzleFlashes.map(f => (
        <div
          key={f.id}
          className="absolute"
          style={{
            left: f.x,
            top: f.y,
            width: f.size * 1.6,
            height: f.size,
            transform: `translate(-8%, -50%) rotate(${f.angle}deg)`,
            transformOrigin: 'left center',
            background: `linear-gradient(90deg, hsl(var(--foreground) / 0.98) 0%, ${f.color} 28%, ${f.color}88 55%, transparent 82%)`,
            borderRadius: '999px',
            filter: `blur(4px) drop-shadow(0 0 18px ${f.color})`,
            animation: 'muzzle-flash 0.12s ease-out forwards',
          }}
        />
      ))}

      <svg className="absolute inset-0 w-full h-full">
        {bulletTrails.map(t => (
          <g key={t.id}>
            <line
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.color}
              strokeWidth={t.width * 2.4}
              opacity="0.12"
              strokeLinecap="round"
              style={{ filter: `blur(3px) drop-shadow(0 0 8px ${t.color})`, animation: 'bullet-trail 0.18s ease-out forwards' }}
            />
            <line
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.color}
              strokeWidth={t.width}
              opacity="0.82"
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${t.color})`, animation: 'bullet-trail 0.16s ease-out forwards' }}
            />
          </g>
        ))}
      </svg>

      {projectiles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x - p.size / 2,
            top: p.y - p.size / 2,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, hsl(var(--foreground)) 0%, ${p.color} 45%, transparent 75%)`,
            boxShadow: `0 0 12px ${p.color}`,
            animation: `projectile-flight ${p.duration}ms linear forwards`,
            ['--shot-dx' as never]: `${p.dx}px`,
            ['--shot-dy' as never]: `${p.dy}px`,
          }}
        />
      ))}

      {impactBursts.map(b => (
        <div key={b.id} className="absolute" style={{ left: b.x, top: b.y, transform: 'translate(-50%, -50%)' }}>
          <div
            className="rounded-full"
            style={{
              width: b.size,
              height: b.size,
              border: `1.5px solid ${b.color}`,
              boxShadow: `0 0 18px ${b.color}`,
              animation: 'impact-ring 0.24s ease-out forwards',
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${b.color}${b.success ? 'cc' : '88'} 0%, transparent 72%)`,
              filter: 'blur(6px)',
              animation: 'impact-burst 0.22s ease-out forwards',
            }}
          />
        </div>
      ))}

      {hitMarkers.map(h => (
        <div key={h.id} className="absolute" style={{ left: h.x, top: h.y, transform: 'translate(-50%, -50%)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" style={{ animation: 'hitmarker-pop 0.3s ease-out forwards' }}>
            <line x1="4" y1="4" x2="10" y2="10" stroke={h.critical ? 'hsl(48, 96%, 53%)' : 'hsl(var(--foreground))'} strokeWidth="2" />
            <line x1="14" y1="4" x2="20" y2="10" stroke={h.critical ? 'hsl(48, 96%, 53%)' : 'hsl(var(--foreground))'} strokeWidth="2" />
            <line x1="4" y1="20" x2="10" y2="14" stroke={h.critical ? 'hsl(48, 96%, 53%)' : 'hsl(var(--foreground))'} strokeWidth="2" />
            <line x1="14" y1="20" x2="20" y2="14" stroke={h.critical ? 'hsl(48, 96%, 53%)' : 'hsl(var(--foreground))'} strokeWidth="2" />
          </svg>
          <div
            className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-black whitespace-nowrap"
            style={{
              animation: 'float-up 0.6s ease-out forwards',
              color: h.critical ? 'hsl(var(--neon-yellow))' : 'hsl(var(--neon-green))',
              textShadow: '0 0 8px currentColor',
            }}
          >
            +{h.points}{h.critical ? ' PERFECT!' : ''}
          </div>
        </div>
      ))}
    </div>
  );

  return { fireWeapon, triggerHitMarker, triggerMuzzleFlash, screenShake, EffectsLayer };
}
