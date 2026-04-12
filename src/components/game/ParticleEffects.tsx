import React, { useState } from 'react';

interface HitEffect {
  id: number;
  x: number;
  y: number;
  points: number;
  particles: { angle: number; distance: number; color: string; size: number }[];
}

export function useParticles() {
  const [effects, setEffects] = useState<HitEffect[]>([]);

  const spawnHitEffect = (x: number, y: number, points: number, color?: string) => {
    const id = Date.now() + Math.random();
    const particles = Array.from({ length: 8 }, () => ({
      angle: Math.random() * 360,
      distance: 20 + Math.random() * 40,
      color: color || 'hsl(199, 89%, 48%)',
      size: 2 + Math.random() * 4,
    }));
    setEffects(prev => [...prev, { id, x, y, points, particles }]);
    setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), 800);
  };

  const HitEffects: React.FC = () => (
    <>
      {effects.map(e => (
        <div key={e.id} className="absolute z-30 pointer-events-none" style={{ left: e.x, top: e.y }}>
          {/* Burst ring */}
          <div className="absolute -inset-4 rounded-full" style={{
            border: '1px solid hsla(199, 89%, 48%, 0.4)',
            animation: 'pulse-ring 0.5s ease-out forwards',
          }} />
          {/* Particles */}
          {e.particles.map((p, i) => (
            <div key={i} className="absolute rounded-full" style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              left: 0, top: 0,
              animation: `particle-fly-${i % 4} 0.5s ease-out forwards`,
              '--px': `${Math.cos(p.angle * Math.PI / 180) * p.distance}px`,
              '--py': `${Math.sin(p.angle * Math.PI / 180) * p.distance}px`,
            } as React.CSSProperties} />
          ))}
          {/* Score popup */}
          <div className="absolute font-black text-sm text-neon-green whitespace-nowrap"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
              top: -8,
              animation: 'float-up 0.8s ease-out forwards',
              textShadow: '0 0 8px hsl(142 76% 50% / 0.6)',
            }}>
            +{e.points}
          </div>
        </div>
      ))}
    </>
  );

  return { spawnHitEffect, HitEffects };
}
