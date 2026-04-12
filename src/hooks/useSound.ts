import { useCallback, useRef } from 'react';

// All sounds generated via Web Audio API — no external files needed
export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) => {
    if (!enabledRef.current) return;
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, [getCtx]);

  const playHit = useCallback(() => {
    playTone(880, 0.1, 'sine', 0.12);
    playTone(1320, 0.08, 'sine', 0.08);
  }, [playTone]);

  const playMiss = useCallback(() => {
    playTone(200, 0.25, 'sawtooth', 0.1);
  }, [playTone]);

  const playCombo = useCallback((level: number) => {
    const base = 600 + level * 80;
    playTone(base, 0.12, 'sine', 0.1);
    setTimeout(() => playTone(base * 1.25, 0.1, 'sine', 0.08), 60);
  }, [playTone]);

  const playButton = useCallback(() => {
    playTone(660, 0.06, 'sine', 0.06);
  }, [playTone]);

  const setEnabled = useCallback((v: boolean) => { enabledRef.current = v; }, []);

  return { playHit, playMiss, playCombo, playButton, setEnabled };
}
