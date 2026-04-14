import React, { useEffect, useState, useRef } from 'react';
import { Target as TargetType } from '@/lib/gameTypes';
import { TARGET_CONFIGS } from '@/lib/targetTypes';

interface Props {
  target: TargetType;
  onHit: (id: string) => void;
}

export const GameTarget: React.FC<Props> = ({ target, onHit }) => {
  const [state, setState] = useState<'spawning' | 'alive' | 'hit' | 'damaged'>('spawning');
  const posRef = useRef({ x: target.x, y: target.y });
  const [motion, setMotion] = useState({ x: target.x, y: target.y, rotation: 0 });
  const frameRef = useRef<number>(0);
  const startedAtRef = useRef(performance.now());
  const seedRef = useRef(((target.x + target.y + target.size) % 97) / 10);

  useEffect(() => {
    const t = setTimeout(() => setState('alive'), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const config = TARGET_CONFIGS[target.variant];
    const animate = () => {
      const elapsed = (performance.now() - startedAtRef.current) / 1000;
      posRef.current.x += target.vx;
      posRef.current.y += target.vy;

      const edgePaddingX = Math.max(46, target.size * 0.8);
      const edgePaddingY = Math.max(110, target.size);
      if (posRef.current.x < edgePaddingX || posRef.current.x > window.innerWidth - edgePaddingX) target.vx *= -1;
      if (posRef.current.y < edgePaddingY || posRef.current.y > window.innerHeight - edgePaddingY) target.vy *= -1;

      const driftX = Math.sin(elapsed * config.driftSpeed + seedRef.current) * config.driftAmplitude;
      const driftY = Math.cos(elapsed * (config.driftSpeed * 0.82) + seedRef.current * 1.6) * config.driftAmplitude * 0.62;

      setMotion({
        x: posRef.current.x + driftX,
        y: posRef.current.y + driftY,
        rotation: Math.sin(elapsed * config.spinSpeed + seedRef.current) * (isHeavy ? 8 : isFast ? 18 : 12),
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target]);

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (state === 'hit') return;
    if (target.variant === 'heavy' && target.hitsRemaining > 1) {
      setState('damaged');
      setTimeout(() => setState('alive'), 150);
    } else {
      setState('hit');
    }
    onHit(target.id, { x: motion.x, y: motion.y });
  };

  const config = TARGET_CONFIGS[target.variant];
  const isTrap = target.variant === 'trap';
  const isHeavy = target.variant === 'heavy';
  const isFast = target.variant === 'fast';
  const isBonus = target.variant === 'bonus';
  const healthPct = isHeavy ? target.hitsRemaining / config.hitsRequired : 1;
  const hitboxSize = Math.max(54, target.size + (isMobileDevice() ? 22 : 12));

  const animName = state === 'spawning' ? 'target-spawn' : state === 'hit' ? 'target-hit' : 'target-pulse';
  const animDuration = state === 'spawning' ? '0.3s' : state === 'hit' ? '0.3s' : isFast ? '0.5s' : '1.2s';

  const borderStyle = isTrap ? '2px dashed' : isHeavy ? '3px solid' : '2px solid';

  return (
    <button
      data-target={target.id}
      onMouseDown={handleClick}
      onTouchStart={handleClick}
      className="absolute cursor-pointer z-10 focus:outline-none"
      style={{
        left: motion.x,
        top: motion.y,
        width: hitboxSize,
        height: hitboxSize,
        transform: 'translate(-50%, -50%)',
      }}
      aria-label={`${config.label} Target`}
    >
      <span
        className="absolute left-1/2 top-1/2 rounded-full"
        style={{
          width: target.size,
          height: target.size,
          transform: `translate(-50%, -50%) rotate(${motion.rotation}deg) ${state === 'damaged' ? 'scale(0.9)' : 'scale(1)'}`,
          transition: 'transform 0.12s ease-out',
          border: `${borderStyle} ${target.color}`,
          animation: `${animName} ${animDuration} ease-in-out ${state === 'alive' ? 'infinite' : 'forwards'}`,
          boxShadow: `0 0 ${target.size * 0.45}px ${target.color}, 0 0 ${target.size * 1.1}px ${target.color}22, inset 0 0 ${target.size * 0.22}px ${target.color}28`,
          background: `radial-gradient(circle at 30% 30%, hsl(var(--foreground) / 0.26), transparent 28%), radial-gradient(circle at 50% 52%, ${target.color}${isTrap ? '22' : '44'} 0%, hsl(var(--background) / 0.1) 48%, hsl(var(--background) / 0.85) 100%)`,
          color: target.color,
          overflow: 'hidden',
        }}
      >
        <span className="absolute inset-[11%] rounded-full" style={{ border: `1px solid ${target.color}55`, opacity: 0.7 }} />
        <span className="absolute inset-[19%] rounded-full" style={{ background: `radial-gradient(circle, ${target.color}48 0%, transparent 72%)` }} />
        <span className="absolute inset-x-[18%] top-1/2 h-[1px] -translate-y-1/2" style={{ background: `linear-gradient(90deg, transparent 0%, ${target.color} 50%, transparent 100%)`, opacity: 0.8 }} />
        <span className="absolute left-1/2 top-1/2 rounded-full" style={{ width: target.size * 0.32, height: target.size * 0.32, transform: 'translate(-50%, -50%)', background: `${target.color}${isTrap ? '66' : 'cc'}`, boxShadow: `0 0 ${target.size * 0.22}px ${target.color}` }} />
        <span className="absolute inset-0 flex items-center justify-center font-black" style={{ color: isTrap ? 'hsl(var(--destructive-foreground))' : 'hsl(var(--foreground))', fontSize: target.size * 0.23, textShadow: `0 0 10px ${target.color}` }}>
          {config.icon}
        </span>
      </span>

      {isHeavy && target.hitsRemaining < config.hitsRequired && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 rounded-full overflow-hidden"
          style={{ width: target.size * 0.62, backgroundColor: 'hsl(var(--foreground) / 0.18)' }}>
          <div className="h-full rounded-full transition-all duration-150"
            style={{ width: `${healthPct * 100}%`, backgroundColor: target.color }} />
        </div>
      )}

      {isBonus && state === 'alive' && (
        <span className="absolute inset-0 rounded-full" style={{
          animation: 'pulse-ring 0.8s ease-out infinite',
          border: `1px solid ${target.color}`,
        }} />
      )}

      {isTrap && state === 'alive' && (
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{
          backgroundColor: 'hsl(var(--destructive))',
          animation: 'pulse-ring 1s ease-out infinite',
        }} />
      )}
    </button>
  );
};

function isMobileDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
