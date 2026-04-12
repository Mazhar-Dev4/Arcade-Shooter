import React, { useEffect, useState } from 'react';
import { Target as TargetType } from '@/lib/gameTypes';

interface Props {
  target: TargetType;
  onHit: (id: string) => void;
}

export const GameTarget: React.FC<Props> = ({ target, onHit }) => {
  const [state, setState] = useState<'spawning' | 'alive' | 'hit'>('spawning');

  useEffect(() => {
    const t = setTimeout(() => setState('alive'), 50);
    return () => clearTimeout(t);
  }, []);

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (state === 'hit') return;
    setState('hit');
    onHit(target.id);
  };

  const animStyle: React.CSSProperties = {
    left: target.x,
    top: target.y,
    width: target.size,
    height: target.size,
    animation: state === 'spawning'
      ? 'target-spawn 0.3s ease-out forwards'
      : state === 'hit'
      ? 'target-hit 0.3s ease-out forwards'
      : 'target-pulse 1s ease-in-out infinite',
    borderColor: target.color,
    color: target.color,
    boxShadow: `0 0 ${target.size * 0.3}px ${target.color}, 0 0 ${target.size * 0.6}px ${target.color}40`,
  };

  return (
    <button
      onMouseDown={handleClick}
      onTouchStart={handleClick}
      className="absolute rounded-full border-2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 focus:outline-none"
      style={animStyle}
      aria-label="Target"
    >
      <span
        className="absolute inset-[25%] rounded-full"
        style={{ backgroundColor: `${target.color}60` }}
      />
      <span
        className="absolute inset-[40%] rounded-full"
        style={{ backgroundColor: target.color }}
      />
    </button>
  );
};
