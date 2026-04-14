import { useCallback, useRef } from 'react';
import { WeaponId } from '@/lib/weapons';

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume().catch(() => undefined);
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15, detune = 0) => {
    if (!enabledRef.current) return;
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.detune.setValueAtTime(detune, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.01);
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
    const detune = (Math.random() * 2 - 1) * 18;
    switch (weapon) {
      case 'pistol':
        playTone(980, 0.05, 'triangle', 0.07, detune);
        playTone(1480, 0.04, 'sine', 0.05, detune * 0.6);
        playNoise(0.025, 0.03);
        break;
      case 'rifle':
        playTone(420, 0.08, 'sawtooth', 0.08, detune);
        playTone(760, 0.06, 'square', 0.05, detune * 0.4);
        playTone(1180, 0.04, 'triangle', 0.03, detune * 0.3);
        playNoise(0.04, 0.04);
        break;
      case 'blaster':
        playTone(180, 0.16, 'sawtooth', 0.1, detune * 0.5);
        playTone(96, 0.18, 'square', 0.06, detune * 0.2);
        playNoise(0.08, 0.06);
        setTimeout(() => playTone(240, 0.1, 'triangle', 0.05, detune * 0.4), 35);
        break;
    }
  }, [playTone, playNoise]);

  const playHit = useCallback(() => {
    playTone(920, 0.05, 'triangle', 0.08);
    playTone(1480, 0.04, 'sine', 0.06);
  }, [playTone]);

  const playCritical = useCallback(() => {
    playTone(1120, 0.08, 'triangle', 0.09);
    playTone(1680, 0.07, 'sine', 0.07);
    setTimeout(() => playTone(2240, 0.05, 'sine', 0.05), 35);
  }, [playTone]);

  const playMiss = useCallback(() => {
    playTone(180, 0.15, 'sawtooth', 0.05);
    playNoise(0.04, 0.02);
  }, [playTone, playNoise]);

  const playTrapHit = useCallback(() => {
    playTone(150, 0.3, 'square', 0.1);
    playTone(100, 0.2, 'sawtooth', 0.08);
  }, [playTone]);

  const playCombo = useCallback((level: number) => {
    const base = 600 + level * 80;
    playTone(base, 0.08, 'triangle', 0.06);
    setTimeout(() => playTone(base * 1.22, 0.06, 'sine', 0.05), 38);
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
