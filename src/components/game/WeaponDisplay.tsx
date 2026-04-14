import React, { useMemo } from 'react';
import { Weapon } from '@/lib/weapons';

interface AimPoint {
  x: number;
  y: number;
}

interface Viewport {
  width: number;
  height: number;
}

interface Props {
  weapon: Weapon;
  firing: boolean;
  isMobile: boolean;
  aimPosition: AimPoint | null;
  viewport: Viewport;
}

interface WeaponPose {
  width: number;
  height: number;
  wrapperLeft: number;
  wrapperTop: number;
  anchorX: number;
  anchorY: number;
  angle: number;
  muzzleX: number;
  muzzleY: number;
  recoilX: number;
  recoilY: number;
  scale: number;
}

const VIEWBOX = { width: 320, height: 160 };
const ANCHOR_LOCAL = { x: 74, y: 104 };
const MUZZLE_LOCAL = { x: 286, y: 52 };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function getWeaponPose({
  weapon,
  aimPosition,
  isMobile,
  viewport,
}: {
  weapon: Weapon;
  aimPosition: AimPoint | null;
  isMobile: boolean;
  viewport: Viewport;
}): WeaponPose {
  const width = isMobile ? 240 : 320;
  const scale = width / VIEWBOX.width;
  const height = VIEWBOX.height * scale;
  const anchorX = isMobile ? viewport.width * 0.5 : viewport.width * 0.82;
  const anchorY = viewport.height - (isMobile ? 48 : 58);
  const fallbackAim = {
    x: viewport.width * (isMobile ? 0.5 : 0.78),
    y: viewport.height * 0.42,
  };
  const target = aimPosition ?? fallbackAim;
  const rawAngle = (Math.atan2(target.y - anchorY, target.x - anchorX) * 180) / Math.PI;
  const angle = clamp(rawAngle, isMobile ? -78 : -62, isMobile ? -10 : 2);
  const angleRad = (angle * Math.PI) / 180;

  const wrapperLeft = anchorX - ANCHOR_LOCAL.x * scale;
  const wrapperTop = anchorY - ANCHOR_LOCAL.y * scale;

  const muzzleOffsetX = (MUZZLE_LOCAL.x - ANCHOR_LOCAL.x) * scale;
  const muzzleOffsetY = (MUZZLE_LOCAL.y - ANCHOR_LOCAL.y) * scale;
  const muzzleX = anchorX + muzzleOffsetX * Math.cos(angleRad) - muzzleOffsetY * Math.sin(angleRad);
  const muzzleY = anchorY + muzzleOffsetX * Math.sin(angleRad) + muzzleOffsetY * Math.cos(angleRad);

  const recoilDistance = weapon.recoilStrength * (isMobile ? 14 : 18);
  const recoilX = -Math.cos(angleRad) * recoilDistance;
  const recoilY = -Math.sin(angleRad) * recoilDistance;

  return {
    width,
    height,
    wrapperLeft,
    wrapperTop,
    anchorX,
    anchorY,
    angle,
    muzzleX,
    muzzleY,
    recoilX,
    recoilY,
    scale,
  };
}

export const WeaponDisplay: React.FC<Props> = ({ weapon, firing, isMobile, aimPosition, viewport }) => {
  const pose = useMemo(
    () => getWeaponPose({ weapon, aimPosition, isMobile, viewport }),
    [weapon, aimPosition, isMobile, viewport],
  );
  const muzzleFlashSize = (isMobile ? 42 : 54) * weapon.impactSize;

  return (
    <div
      className="fixed z-30 pointer-events-none select-none"
      style={{
        left: pose.wrapperLeft,
        top: pose.wrapperTop,
        width: pose.width,
        height: pose.height,
        filter: `drop-shadow(0 16px 28px hsl(var(--background) / 0.45)) drop-shadow(0 0 24px ${weapon.color}33)`,
      }}
    >
      <div
        style={{
          width: pose.width,
          height: pose.height,
          transformOrigin: `${ANCHOR_LOCAL.x * pose.scale}px ${ANCHOR_LOCAL.y * pose.scale}px`,
          transform: `translate(${firing ? pose.recoilX : 0}px, ${firing ? pose.recoilY : 0}px) rotate(${pose.angle}deg)`,
          transition: firing ? 'transform 0.03s linear' : 'transform 0.14s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <svg
          width={pose.width}
          height={pose.height}
          viewBox="0 0 320 160"
          fill="none"
          style={{
            overflow: 'visible',
          }}
        >
          <defs>
            <linearGradient id={`weapon-shell-${weapon.id}`} x1="52" y1="62" x2="286" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="hsl(228 20% 18%)" />
              <stop offset="0.55" stopColor="hsl(224 22% 11%)" />
              <stop offset="1" stopColor="hsl(230 25% 7%)" />
            </linearGradient>
            <linearGradient id={`weapon-edge-${weapon.id}`} x1="70" y1="40" x2="286" y2="54" gradientUnits="userSpaceOnUse">
              <stop stopColor={weapon.color} stopOpacity="0.95" />
              <stop offset="1" stopColor={weapon.color} stopOpacity="0.2" />
            </linearGradient>
          </defs>

          <path
            d="M32 92L54 72L104 62L204 58L278 44L300 54L278 70L232 76L170 78L144 92L104 104L84 138L54 136L60 104L44 98Z"
            fill={`url(#weapon-shell-${weapon.id})`}
            stroke={`url(#weapon-edge-${weapon.id})`}
            strokeWidth="3"
          />

          <path
            d="M52 70L105 60L202 56L262 46L284 54L262 62L196 66L112 70L76 84L52 88Z"
            fill="hsl(228 20% 28% / 0.42)"
          />

          <rect x="180" y="49" width="112" height="10" rx="5" fill={weapon.color} opacity="0.25" />
          <rect x="178" y="46" width="116" height="4" rx="2" fill="hsl(var(--foreground) / 0.82)" opacity="0.35" />
          <rect x="198" y="52" width="74" height="3" rx="1.5" fill={weapon.color} opacity="0.8" />

          <path d="M72 86L102 78L114 82L116 120L96 138L70 134L68 100Z" fill="hsl(230 20% 9%)" stroke={weapon.color} strokeWidth="2" opacity="0.95" />
          <path d="M118 80L146 78L152 92L132 104L116 100Z" fill="hsl(230 20% 8%)" stroke={weapon.color} strokeWidth="2" opacity="0.7" />

          <circle cx="148" cy="70" r="10" fill={weapon.color} opacity="0.18" />
          <circle cx="148" cy="70" r="5" fill={weapon.color} opacity="0.72" />
          <rect x="128" y="63" width="34" height="3" rx="1.5" fill={weapon.color} opacity="0.36" />

          {weapon.id !== 'pistol' && (
            <path d="M110 52L164 48L184 54L184 64L106 62Z" fill="hsl(224 20% 10%)" stroke={weapon.color} strokeWidth="1.5" opacity="0.8" />
          )}

          {weapon.id === 'rifle' && (
            <>
              <path d="M94 44L132 40L160 46L160 56L90 54Z" fill="hsl(224 18% 11%)" stroke={weapon.color} strokeWidth="1.5" opacity="0.88" />
              <rect x="224" y="42" width="34" height="4" rx="2" fill={weapon.color} opacity="0.4" />
            </>
          )}

          {weapon.id === 'blaster' && (
            <>
              <circle cx="208" cy="56" r="10" stroke={weapon.color} strokeWidth="2" fill="none" opacity="0.5" />
              <circle cx="232" cy="54" r="7" stroke={weapon.color} strokeWidth="1.6" fill="none" opacity="0.45" />
              <circle cx="256" cy="52" r="5" fill={weapon.color} opacity="0.62" />
            </>
          )}

          <path d="M20 88L34 82L42 98L24 104L12 98Z" fill="hsl(225 18% 8%)" stroke={weapon.color} strokeWidth="1.5" opacity="0.55" />
        </svg>

        {firing && (
          <div
            className="absolute"
            style={{
              left: MUZZLE_LOCAL.x * pose.scale - muzzleFlashSize * 0.12,
              top: MUZZLE_LOCAL.y * pose.scale - muzzleFlashSize * 0.36,
              width: muzzleFlashSize,
              height: muzzleFlashSize * 0.72,
              background: `linear-gradient(90deg, hsl(var(--foreground) / 0.96) 0%, ${weapon.color} 28%, ${weapon.color}88 55%, transparent 82%)`,
              animation: 'muzzle-flash 0.1s ease-out forwards',
              borderRadius: '50%',
              transform: 'translate(-10%, -50%)',
              filter: `blur(${2 + weapon.impactSize}px) drop-shadow(0 0 18px ${weapon.color})`,
            }}
          />
        )}

        <div
          className="absolute rounded-full"
          style={{
            left: 118 * pose.scale,
            top: 56 * pose.scale,
            width: 74 * pose.scale,
            height: 22 * pose.scale,
            background: `radial-gradient(circle, ${weapon.color}55 0%, transparent 72%)`,
            filter: `blur(${10 * pose.scale}px)`,
            opacity: firing ? 0.9 : 0.5,
            transition: 'opacity 0.12s ease-out',
          }}
        />
      </div>
    </div>
  );
};
