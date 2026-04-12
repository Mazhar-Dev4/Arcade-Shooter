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
  const [pos, setPos] = useState({ x: target.x, y: target.y });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const t = setTimeout(() => setState('alive'), 50);
    return () => clearTimeout(t);
  }, []);

  // Animate movement
  useEffect(() => {
    if (target.vx === 0 && target.vy === 0) return;
    const animate = () => {
      posRef.current.x += target.vx;
      posRef.current.y += target.vy;
      // Bounce off edges
      if (posRef.current.x < 40 || posRef.current.x > window.innerWidth - 40) target.vx *= -1;
      if (posRef.current.y < 80 || posRef.current.y > window.innerHeight - 80) target.vy *= -1;
      setPos({ x: posRef.current.x, y: posRef.current.y });
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
    onHit(target.id);
  };

  const config = TARGET_CONFIGS[target.variant];
  const isTrap = target.variant === 'trap';
  const isHeavy = target.variant === 'heavy';
  const isFast = target.variant === 'fast';
  const isBonus = target.variant === 'bonus';
  const healthPct = isHeavy ? target.hitsRemaining / config.hitsRequired : 1;

  const animName = state === 'spawning' ? 'target-spawn' : state === 'hit' ? 'target-hit' : 'target-pulse';
  const animDuration = state === 'spawning' ? '0.3s' : state === 'hit' ? '0.3s' : isFast ? '0.5s' : '1.2s';

  const borderStyle = isTrap ? '2px dashed' : isHeavy ? '3px solid' : '2px solid';

  return (
    <button
      data-target={target.id}
      onMouseDown={handleClick}
      onTouchStart={handleClick}
      className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 focus:outline-none group"
      style={{
        left: pos.x,
        top: pos.y,
        width: target.size,
        height: target.size,
        // Larger touch area on mobile
        minWidth: 44,
        minHeight: 44,
        border: `${borderStyle} ${target.color}`,
        animation: `${animName} ${animDuration} ease-in-out ${state === 'alive' ? 'infinite' : 'forwards'}`,
        boxShadow: `0 0 ${target.size * 0.4}px ${target.color}, 0 0 ${target.size}px ${target.color}30, inset 0 0 ${target.size * 0.2}px ${target.color}20`,
        transition: state === 'damaged' ? 'transform 0.1s' : undefined,
        transform: state === 'damaged' ? 'translate(-50%, -50%) scale(0.85)' : undefined,
      }}
      aria-label={`${config.label} Target`}
    >
      {/* Inner glow */}
      <span className="absolute inset-[15%] rounded-full" style={{
        background: `radial-gradient(circle, ${target.color}40 0%, transparent 70%)`,
      }} />
      {/* Center core */}
      <span className="absolute inset-[30%] rounded-full" style={{
        backgroundColor: `${target.color}${isTrap ? '60' : 'a0'}`,
        boxShadow: `0 0 ${target.size * 0.2}px ${target.color}`,
      }} />
      {/* Icon */}
      <span className="absolute inset-0 flex items-center justify-center text-xs font-black" style={{
        color: isTrap ? 'hsl(0, 84%, 70%)' : 'white',
        fontSize: target.size * 0.25,
        textShadow: `0 0 6px ${target.color}`,
      }}>
        {config.icon}
      </span>
      {/* Health bar for heavy targets */}
      {isHeavy && target.hitsRemaining < config.hitsRequired && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 rounded-full overflow-hidden"
          style={{ width: target.size * 0.6, backgroundColor: 'hsla(0,0%,100%,0.2)' }}>
          <div className="h-full rounded-full transition-all duration-150"
            style={{ width: `${healthPct * 100}%`, backgroundColor: target.color }} />
        </div>
      )}
      {/* Bonus sparkle */}
      {isBonus && state === 'alive' && (
        <span className="absolute inset-0 rounded-full" style={{
          animation: 'pulse-ring 0.8s ease-out infinite',
          border: `1px solid ${target.color}`,
        }} />
      )}
      {/* Trap warning */}
      {isTrap && state === 'alive' && (
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-neon-red" style={{
          animation: 'pulse-ring 1s ease-out infinite',
        }} />
      )}
    </button>
  );
};
