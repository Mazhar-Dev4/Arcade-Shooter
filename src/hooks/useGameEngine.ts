import { useState, useCallback, useRef, useEffect } from 'react';
import { Target, GameMode, GameStats, RoundDuration } from '@/lib/gameTypes';
import { WeaponId, WEAPONS } from '@/lib/weapons';
import { TargetVariant, TARGET_CONFIGS, pickTargetVariant } from '@/lib/targetTypes';
import { calcScore, MISS_PENALTY, calcGrade } from '@/lib/scoring';
import { dailySeed, seededRandom } from '@/lib/dailyChallenge';

let idCounter = 0;
const genId = () => `t${++idCounter}`;

interface GameEngine {
  targets: Target[];
  stats: GameStats;
  timeLeft: number;
  lives: number;
  isRunning: boolean;
  isPaused: boolean;
  wave: number;
  start: (mode: GameMode, duration: RoundDuration, weapon: WeaponId) => void;
  hitTarget: (id: string) => { points: number; reaction: number; critical: boolean; variant: TargetVariant } | null;
  missTap: () => void;
  stop: () => void;
  togglePause: () => void;
}

export function useGameEngine(
  onHit?: () => void,
  onMiss?: () => void,
  onCombo?: (level: number) => void,
  onTrapHit?: () => void,
): GameEngine {
  const [targets, setTargets] = useState<Target[]>([]);
  const [stats, setStats] = useState<GameStats>(emptyStats());
  const [timeLeft, setTimeLeft] = useState(0);
  const [lives, setLives] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [wave, setWave] = useState(1);

  const modeRef = useRef<GameMode>('classic');
  const durationRef = useRef<RoundDuration>(30);
  const weaponRef = useRef<WeaponId>('pistol');
  const tickRef = useRef<number>(0);
  const elapsedRef = useRef(0);
  const pausedRef = useRef(false);
  const pauseTimeRef = useRef(0);
  const randRef = useRef<(() => number) | null>(null);
  const statsRef = useRef(emptyStats());
  const livesRef = useRef(3);
  const runningRef = useRef(false);
  const waveRef = useRef(1);
  const startTimeRef = useRef(0);
  const lastSpawnRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (tickRef.current) cancelAnimationFrame(tickRef.current);
    tickRef.current = 0;
  }, []);

  const getDifficulty = useCallback(() => {
    const t = elapsedRef.current;
    const mode = modeRef.current;
    // Much slower difficulty ramp so targets stay longer and players can aim
    const factor = mode === 'survival' ? t / 30 : t / 45;
    const w = Math.floor(factor) + 1;
    if (w !== waveRef.current) {
      waveRef.current = w;
      setWave(w);
    }
    return {
      minSize: Math.max(36, 70 - factor * 4),
      maxSize: Math.max(50, 95 - factor * 4),
      lifetime: Math.max(1800, 4000 - factor * 200),
      spawnInterval: Math.max(600, 1500 - factor * 70),
      maxTargets: Math.min(5, 2 + Math.floor(factor * 0.3)),
    };
  }, []);

  const spawnTarget = useCallback(() => {
    if (!runningRef.current || pausedRef.current) return;
    const diff = getDifficulty();
    const rand = randRef.current || Math.random;

    setTargets(prev => {
      if (prev.length >= diff.maxTargets) return prev;

      const variant = pickTargetVariant(elapsedRef.current, rand);
      const config = TARGET_CONFIGS[variant];
      const baseSize = diff.minSize + rand() * (diff.maxSize - diff.minSize);
      const size = baseSize * config.sizeMultiplier;
      const padding = size / 2 + 10;
      const x = padding + rand() * (window.innerWidth - padding * 2);
      const yMin = 70;
      const yMax = window.innerHeight - 70;
      const y = yMin + rand() * Math.max(yMax - yMin, 100);

      const speed = (0.3 + rand() * 0.5) * config.speedMultiplier;
      const angle = rand() * Math.PI * 2;

      const target: Target = {
        id: genId(),
        x, y, size,
        spawnTime: Date.now(),
        lifetime: diff.lifetime * config.lifetimeMultiplier,
        color: config.color,
        glowColor: config.glowColor,
        variant,
        hitsRemaining: config.hitsRequired,
        icon: config.icon,
        vx: Math.cos(angle) * speed * (variant === 'standard' ? 0.3 : 1),
        vy: Math.sin(angle) * speed * (variant === 'standard' ? 0.3 : 1),
      };
      return [...prev, target];
    });
  }, [getDifficulty]);

  const start = useCallback((mode: GameMode, duration: RoundDuration, weapon: WeaponId) => {
    clearTimers();
    modeRef.current = mode;
    durationRef.current = duration;
    weaponRef.current = weapon;
    elapsedRef.current = 0;
    const s = emptyStats();
    s.weaponUsed = weapon;
    statsRef.current = s;
    livesRef.current = 3;
    runningRef.current = true;
    pausedRef.current = false;
    waveRef.current = 1;
    idCounter = 0;

    if (mode === 'daily') {
      randRef.current = seededRandom(dailySeed());
    } else {
      randRef.current = null;
    }

    setTargets([]);
    setStats(s);
    setTimeLeft(mode === 'survival' ? 0 : duration);
    setLives(3);
    setIsRunning(true);
    setIsPaused(false);
    setWave(1);

    startTimeRef.current = Date.now();
    lastSpawnRef.current = 0;

    const tick = () => {
      if (!runningRef.current) return;
      if (pausedRef.current) {
        tickRef.current = requestAnimationFrame(tick);
        return;
      }

      const now = Date.now();
      elapsedRef.current = (now - startTimeRef.current - pauseTimeRef.current) / 1000;
      statsRef.current.timeElapsed = Math.floor(elapsedRef.current);

      // Timer
      if (modeRef.current !== 'survival') {
        const remaining = Math.max(0, durationRef.current - elapsedRef.current);
        setTimeLeft(Math.ceil(remaining));
        if (remaining <= 0) {
          endGame();
          return;
        }
      } else {
        setTimeLeft(Math.floor(elapsedRef.current));
      }

      // Remove expired targets
      setTargets(prev => {
        const expired = prev.filter(t => !t.hit && now - t.spawnTime > t.lifetime);
        if (expired.length > 0) {
          expired.forEach(t => {
            if (t.variant !== 'trap') {
              statsRef.current.misses++;
              statsRef.current.combo = 0;
              statsRef.current.multiplier = 1;
              statsRef.current.score = Math.max(0, statsRef.current.score - MISS_PENALTY);
              if (modeRef.current === 'survival') {
                livesRef.current--;
                setLives(livesRef.current);
                if (livesRef.current <= 0) {
                  endGame();
                  return;
                }
              }
              onMiss?.();
            }
          });
          setStats({ ...statsRef.current });
        }
        return prev.filter(t => !(now - t.spawnTime > t.lifetime && !t.hit));
      });

      // Spawn
      const diff = getDifficulty();
      if (now - lastSpawnRef.current > diff.spawnInterval) {
        spawnTarget();
        lastSpawnRef.current = now;
      }

      tickRef.current = requestAnimationFrame(tick);
    };

    tickRef.current = requestAnimationFrame(tick);
  }, [clearTimers, getDifficulty, spawnTarget, onMiss]);

  const endGame = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    clearTimers();
    const s = statsRef.current;
    const total = s.hits + s.misses;
    s.accuracy = total > 0 ? Math.round((s.hits / total) * 100) : 0;
    s.avgReactionTime = s.reactionTimes.length > 0
      ? Math.round(s.reactionTimes.reduce((a, b) => a + b, 0) / s.reactionTimes.length)
      : 0;
    s.grade = calcGrade(s.accuracy, s.avgReactionTime, s.bestCombo);
    s.waveReached = waveRef.current;
    setStats({ ...s });
  }, [clearTimers]);

  const hitTarget = useCallback((id: string) => {
    let result: { points: number; reaction: number; critical: boolean; variant: TargetVariant } | null = null;
    setTargets(prev => {
      const t = prev.find(t => t.id === id);
      if (!t || t.hit) return prev;

      const config = TARGET_CONFIGS[t.variant];
      const reaction = Date.now() - t.spawnTime;
      const s = statsRef.current;
      const critical = reaction < 300;

      if (config.penalty) {
        // Trap target
        s.misses++;
        s.combo = 0;
        s.multiplier = 1;
        s.score = Math.max(0, s.score + config.baseScore); // negative
        if (modeRef.current === 'survival') {
          livesRef.current--;
          setLives(livesRef.current);
          if (livesRef.current <= 0) endGame();
        }
        onTrapHit?.();
        result = { points: config.baseScore, reaction, critical: false, variant: t.variant };
        setStats({ ...s });
        return prev.map(target => target.id === id ? { ...target, hit: true } : target);
      }

      // Heavy target - reduce hits
      if (t.hitsRemaining > 1) {
        result = { points: 25, reaction, critical, variant: t.variant };
        s.score += 25;
        s.hits++;
        setStats({ ...s });
        onHit?.();
        return prev.map(target => target.id === id ? { ...target, hitsRemaining: target.hitsRemaining - 1 } : target);
      }

      s.hits++;
      s.targetsDestroyed++;
      s.combo++;
      s.multiplier = Math.min(s.combo, 10);
      if (s.combo > s.bestCombo) s.bestCombo = s.combo;
      const points = calcScore(s.hits, s.multiplier, reaction) + (config.baseScore - 100);
      s.score += points;
      s.reactionTimes.push(reaction);
      result = { points, reaction, critical, variant: t.variant };
      setStats({ ...s });
      onHit?.();
      if (s.combo > 1) onCombo?.(s.combo);
      return prev.map(target => target.id === id ? { ...target, hit: true } : target);
    });
    // Clean up hit target
    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== id));
    }, 300);
    return result;
  }, [onHit, onCombo, onTrapHit, endGame]);

  const missTap = useCallback(() => {
    if (!runningRef.current || pausedRef.current) return;
    const s = statsRef.current;
    s.misses++;
    s.combo = 0;
    s.multiplier = 1;
    s.score = Math.max(0, s.score - MISS_PENALTY);
    if (modeRef.current === 'survival') {
      livesRef.current--;
      setLives(livesRef.current);
      if (livesRef.current <= 0) endGame();
    }
    setStats({ ...s });
    onMiss?.();
  }, [endGame, onMiss]);

  const togglePause = useCallback(() => {
    pausedRef.current = !pausedRef.current;
    setIsPaused(pausedRef.current);
    if (pausedRef.current) {
      pauseTimeRef.current = Date.now();
    } else {
      const pauseDuration = Date.now() - pauseTimeRef.current;
      startTimeRef.current += pauseDuration;
    }
  }, []);

  const stop = useCallback(() => {
    endGame();
  }, [endGame]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return { targets, stats, timeLeft, lives, isRunning, isPaused, wave, start, hitTarget, missTap, stop, togglePause };
}

function emptyStats(): GameStats {
  return {
    score: 0, hits: 0, misses: 0, combo: 0, bestCombo: 0,
    multiplier: 1, reactionTimes: [], accuracy: 0, avgReactionTime: 0, grade: 'C',
    weaponUsed: 'pistol', timeElapsed: 0, waveReached: 1, targetsDestroyed: 0,
  };
}
