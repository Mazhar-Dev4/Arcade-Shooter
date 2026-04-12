import { useState, useCallback, useRef, useEffect } from 'react';
import { Target, GameMode, GameStats, RoundDuration, TARGET_COLORS } from '@/lib/gameTypes';
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
  start: (mode: GameMode, duration: RoundDuration) => void;
  hitTarget: (id: string) => { points: number; reaction: number } | null;
  missTarget: (id: string) => void;
  missTap: () => void;
  stop: () => void;
}

export function useGameEngine(
  onHit?: () => void,
  onMiss?: () => void,
  onCombo?: (level: number) => void,
): GameEngine {
  const [targets, setTargets] = useState<Target[]>([]);
  const [stats, setStats] = useState<GameStats>(emptyStats());
  const [timeLeft, setTimeLeft] = useState(0);
  const [lives, setLives] = useState(3);
  const [isRunning, setIsRunning] = useState(false);

  const modeRef = useRef<GameMode>('classic');
  const durationRef = useRef<RoundDuration>(30);
  const tickRef = useRef<number>(0);
  const spawnRef = useRef<number>(0);
  const elapsedRef = useRef(0);
  const randRef = useRef<(() => number) | null>(null);
  const statsRef = useRef(emptyStats());
  const livesRef = useRef(3);
  const runningRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (tickRef.current) cancelAnimationFrame(tickRef.current);
    if (spawnRef.current) clearInterval(spawnRef.current);
    tickRef.current = 0;
    spawnRef.current = 0;
  }, []);

  const getDifficulty = useCallback(() => {
    const t = elapsedRef.current;
    const mode = modeRef.current;
    const factor = mode === 'survival' ? t / 20 : t / 30;
    return {
      minSize: Math.max(30, 70 - factor * 8),
      maxSize: Math.max(40, 90 - factor * 6),
      lifetime: Math.max(800, 2200 - factor * 200),
      spawnInterval: Math.max(400, 1200 - factor * 100),
      maxTargets: Math.min(5, 1 + Math.floor(factor * 0.5)),
    };
  }, []);

  const spawnTarget = useCallback(() => {
    if (!runningRef.current) return;
    const diff = getDifficulty();
    const rand = randRef.current || Math.random;

    setTargets(prev => {
      if (prev.length >= diff.maxTargets) return prev;
      const size = diff.minSize + rand() * (diff.maxSize - diff.minSize);
      const padding = size / 2 + 10;
      const x = padding + rand() * (window.innerWidth - padding * 2);
      const yMin = 80;
      const yMax = window.innerHeight - 80;
      const y = yMin + rand() * (Math.max(yMax - yMin, 100));
      const color = TARGET_COLORS[Math.floor(rand() * TARGET_COLORS.length)];
      const target: Target = {
        id: genId(),
        x, y, size,
        spawnTime: Date.now(),
        lifetime: diff.lifetime,
        color,
      };
      return [...prev, target];
    });
  }, [getDifficulty]);

  const start = useCallback((mode: GameMode, duration: RoundDuration) => {
    clearTimers();
    modeRef.current = mode;
    durationRef.current = duration;
    elapsedRef.current = 0;
    statsRef.current = emptyStats();
    livesRef.current = 3;
    runningRef.current = true;
    idCounter = 0;

    if (mode === 'daily') {
      randRef.current = seededRandom(dailySeed());
    } else {
      randRef.current = null;
    }

    setTargets([]);
    setStats(emptyStats());
    setTimeLeft(mode === 'survival' ? 0 : duration);
    setLives(3);
    setIsRunning(true);

    // Spawn loop
    const startTime = Date.now();
    let lastSpawn = 0;

    const tick = () => {
      if (!runningRef.current) return;
      const now = Date.now();
      elapsedRef.current = (now - startTime) / 1000;

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
          expired.forEach(() => {
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
          });
          setStats({ ...statsRef.current });
        }
        return prev.filter(t => !(now - t.spawnTime > t.lifetime && !t.hit));
      });

      // Spawn
      const diff = getDifficulty();
      if (now - lastSpawn > diff.spawnInterval) {
        spawnTarget();
        lastSpawn = now;
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
    setStats({ ...s });
  }, [clearTimers]);

  const hitTarget = useCallback((id: string) => {
    let result: { points: number; reaction: number } | null = null;
    setTargets(prev => {
      const t = prev.find(t => t.id === id);
      if (!t || t.hit) return prev;
      const reaction = Date.now() - t.spawnTime;
      const s = statsRef.current;
      s.hits++;
      s.combo++;
      s.multiplier = Math.min(s.combo, 10);
      if (s.combo > s.bestCombo) s.bestCombo = s.combo;
      const points = calcScore(s.hits, s.multiplier, reaction);
      s.score += points;
      s.reactionTimes.push(reaction);
      result = { points, reaction };
      setStats({ ...s });
      onHit?.();
      if (s.combo > 1) onCombo?.(s.combo);
      return prev.map(target => target.id === id ? { ...target, hit: true } : target);
    });
    // Clean up hit target after animation
    setTimeout(() => {
      setTargets(prev => prev.filter(t => t.id !== id));
    }, 300);
    return result;
  }, [onHit, onCombo]);

  const missTarget = useCallback((id: string) => {
    // handled by expiry
  }, []);

  const missTap = useCallback(() => {
    if (!runningRef.current) return;
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

  const stop = useCallback(() => {
    endGame();
  }, [endGame]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return { targets, stats, timeLeft, lives, isRunning, start, hitTarget, missTarget, missTap, stop };
}

function emptyStats(): GameStats {
  return {
    score: 0, hits: 0, misses: 0, combo: 0, bestCombo: 0,
    multiplier: 1, reactionTimes: [], accuracy: 0, avgReactionTime: 0, grade: 'C',
  };
}
