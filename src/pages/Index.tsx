import React, { useState, useCallback, useEffect } from 'react';
import { GameMode, GameScreen, GameSettings, RoundDuration } from '@/lib/gameTypes';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useSound } from '@/hooks/useSound';
import { useParticles } from '@/components/game/ParticleEffects';
import { BackgroundGrid } from '@/components/game/BackgroundGrid';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { GameScreen as GamePlayScreen } from '@/components/screens/GamePlayScreen';
import { GameOverScreen } from '@/components/screens/GameOverScreen';
import { LeaderboardScreen } from '@/components/screens/LeaderboardScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';

const Index: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>('home');
  const [currentMode, setCurrentMode] = useState<GameMode>('classic');
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    themeColor: 'blue',
    roundDuration: 30,
  });

  const { playHit, playMiss, playCombo, playButton, setEnabled } = useSound();
  const { spawnHitEffect, HitEffects } = useParticles();

  useEffect(() => {
    setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled, setEnabled]);

  const onHit = useCallback(() => playHit(), [playHit]);
  const onMiss = useCallback(() => playMiss(), [playMiss]);
  const onCombo = useCallback((level: number) => playCombo(level), [playCombo]);

  const engine = useGameEngine(onHit, onMiss, onCombo);

  const handlePlay = useCallback((mode: GameMode) => {
    playButton();
    setCurrentMode(mode);
    setScreen('playing');
    engine.start(mode, mode === 'daily' ? 60 : settings.roundDuration);
  }, [engine, settings.roundDuration, playButton]);

  const handleHitTarget = useCallback((id: string) => {
    const result = engine.hitTarget(id);
    if (result) {
      const t = engine.targets.find(t => t.id === id);
      if (t) spawnHitEffect(t.x, t.y, result.points);
    }
  }, [engine, spawnHitEffect]);

  // Watch for game end
  useEffect(() => {
    if (screen === 'playing' && !engine.isRunning && engine.stats.hits + engine.stats.misses > 0) {
      setScreen('gameover');
    }
  }, [engine.isRunning, engine.stats, screen]);

  const handleReplay = useCallback(() => {
    playButton();
    handlePlay(currentMode);
  }, [currentMode, handlePlay, playButton]);

  const goHome = useCallback(() => {
    playButton();
    engine.stop();
    setScreen('home');
  }, [engine, playButton]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <BackgroundGrid />

      {screen === 'home' && (
        <HomeScreen
          onPlay={handlePlay}
          onSettings={() => { playButton(); setScreen('settings'); }}
          onLeaderboard={() => { playButton(); setScreen('leaderboard'); }}
          roundDuration={settings.roundDuration}
          setRoundDuration={(d: RoundDuration) => setSettings(s => ({ ...s, roundDuration: d }))}
          themeColor={settings.themeColor}
        />
      )}

      {screen === 'playing' && (
        <GamePlayScreen
          targets={engine.targets}
          score={engine.stats.score}
          combo={engine.stats.combo}
          multiplier={engine.stats.multiplier}
          timeLeft={engine.timeLeft}
          lives={engine.lives}
          mode={currentMode}
          onHitTarget={handleHitTarget}
          onMissTap={engine.missTap}
          hitEffects={<HitEffects />}
        />
      )}

      {screen === 'gameover' && (
        <GameOverScreen
          stats={engine.stats}
          mode={currentMode}
          onReplay={handleReplay}
          onHome={goHome}
        />
      )}

      {screen === 'leaderboard' && (
        <LeaderboardScreen onBack={goHome} />
      )}

      {screen === 'settings' && (
        <SettingsScreen settings={settings} onChange={setSettings} onBack={goHome} />
      )}
    </div>
  );
};

export default Index;
