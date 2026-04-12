import { useCallback, useRef } from 'react';
import { WeaponId } from '@/lib/weapons';

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
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

  const playNoise = useCallback((duration: number, volume = 0.05) => {
    if (!enabledRef.current) return;
    try {
      const ctx = getCtx();
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 2000;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    } catch {}
  }, [getCtx]);

  const playWeaponFire = useCallback((weapon: WeaponId) => {
    if (!enabledRef.current) return;
    switch (weapon) {
      case 'pistol':
        playTone(1200, 0.06, 'sine', 0.1);
        playTone(2400, 0.04, 'sine', 0.06);
        playNoise(0.03, 0.04);
        break;
      case 'rifle':
        playTone(600, 0.1, 'sawtooth', 0.08);
        playTone(900, 0.08, 'square', 0.05);
        playNoise(0.06, 0.06);
        break;
      case 'blaster':
        playTone(200, 0.2, 'sawtooth', 0.12);
        playTone(100, 0.15, 'square', 0.08);
        playNoise(0.1, 0.08);
        setTimeout(() => playTone(150, 0.15, 'sine', 0.06), 50);
        break;
    }
  }, [playTone, playNoise]);

  const playHit = useCallback(() => {
    playTone(880, 0.08, 'sine', 0.1);
    playTone(1320, 0.06, 'sine', 0.06);
  }, [playTone]);

  const playCritical = useCallback(() => {
    playTone(1200, 0.1, 'sine', 0.12);
    playTone(1800, 0.08, 'sine', 0.08);
    setTimeout(() => playTone(2400, 0.06, 'sine', 0.06), 40);
  }, [playTone]);

  const playMiss = useCallback(() => {
    playTone(200, 0.2, 'sawtooth', 0.08);
  }, [playTone]);

  const playTrapHit = useCallback(() => {
    playTone(150, 0.3, 'square', 0.1);
    playTone(100, 0.2, 'sawtooth', 0.08);
  }, [playTone]);

  const playCombo = useCallback((level: number) => {
    const base = 600 + level * 80;
    playTone(base, 0.1, 'sine', 0.08);
    setTimeout(() => playTone(base * 1.25, 0.08, 'sine', 0.06), 50);
  }, [playTone]);

  const playButton = useCallback(() => {
    playTone(660, 0.05, 'sine', 0.05);
  }, [playTone]);

  const playGameOver = useCallback(() => {
    playTone(440, 0.3, 'sine', 0.1);
    setTimeout(() => playTone(330, 0.3, 'sine', 0.08), 150);
    setTimeout(() => playTone(220, 0.5, 'sine', 0.1), 300);
  }, [playTone]);

  const setEnabled = useCallback((v: boolean) => { enabledRef.current = v; }, []);

  return { playWeaponFire, playHit, playCritical, playMiss, playTrapHit, playCombo, playButton, playGameOver, setEnabled };
}
