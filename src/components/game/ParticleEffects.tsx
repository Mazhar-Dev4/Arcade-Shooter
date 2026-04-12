import React, { useState, useEffect } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  color: string;
}

interface HitEffect {
  id: number;
  x: number;
  y: number;
  points: number;
}

export const ParticleLayer: React.FC = () => null; // Managed inline

export function useParticles() {
  const [effects, setEffects] = useState<HitEffect[]>([]);

  const spawnHitEffect = (x: number, y: number, points: number) => {
    const id = Date.now() + Math.random();
    setEffects(prev => [...prev, { id, x, y, points }]);
    setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), 800);
  };

  const HitEffects: React.FC = () => (
    <>
      {effects.map(e => (
        <div
          key={e.id}
          className="absolute z-30 pointer-events-none font-bold text-sm sm:text-base text-neon-green"
          style={{
            left: e.x,
            top: e.y,
            animation: 'float-up 0.8s ease-out forwards',
          }}
        >
          +{e.points}
        </div>
      ))}
    </>
  );

  return { spawnHitEffect, HitEffects };
}
