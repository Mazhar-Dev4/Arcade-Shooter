import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameMode, GameScreen, GameSettings, RoundDuration } from '@/lib/gameTypes';
import { WEAPONS } from '@/lib/weapons';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useSound } from '@/hooks/useSound';
import { useParticles } from '@/components/game/ParticleEffects';
import { useShootingEffects } from '@/components/game/ShootingEffects';
import { BackgroundGrid } from '@/components/game/BackgroundGrid';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { GameScreen as GamePlayScreen } from '@/components/screens/GamePlayScreen';
import { GameOverScreen } from '@/components/screens/GameOverScreen';
import { LeaderboardScreen } from '@/components/screens/LeaderboardScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';
import { updateAchievementStats } from '@/lib/achievements';

const Index: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>('home');
  const [currentMode, setCurrentMode] = useState<GameMode>('classic');
  const [firing, setFiring] = useState(false);
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    musicEnabled: false,
    themeColor: 'blue',
    roundDuration: 30,
    selectedWeapon: 'pistol',
  });

  const { playWeaponFire, playHit, playCritical, playMiss, playTrapHit, playCombo, playButton, playGameOver, setEnabled } = useSound();
  const { spawnHitEffect, HitEffects } = useParticles();
  const { fireWeapon, triggerHitMarker, screenShake, EffectsLayer } = useShootingEffects();
  const lastFireRef = useRef(0);

  useEffect(() => {
    setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled, setEnabled]);

  const onHit = useCallback(() => playHit(), [playHit]);
  const onMiss = useCallback(() => playMiss(), [playMiss]);
  const onCombo = useCallback((level: number) => playCombo(level), [playCombo]);
  const onTrapHit = useCallback(() => playTrapHit(), [playTrapHit]);

  const engine = useGameEngine(onHit, onMiss, onCombo, onTrapHit);
  const weapon = WEAPONS[settings.selectedWeapon];

  const handlePlay = useCallback((mode: GameMode) => {
    playButton();
    setCurrentMode(mode);
    setScreen('playing');
    engine.start(mode, mode === 'daily' ? 60 : settings.roundDuration, settings.selectedWeapon);
  }, [engine, settings.roundDuration, settings.selectedWeapon, playButton]);

  const handleFire = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastFireRef.current < weapon.fireRate) return;
    lastFireRef.current = now;
    playWeaponFire(weapon.id);
    fireWeapon(weapon, x, y);
    setFiring(true);
    setTimeout(() => setFiring(false), 80);
  }, [weapon, playWeaponFire, fireWeapon]);

  const handleHitTarget = useCallback((id: string) => {
    const now = Date.now();
    if (now - lastFireRef.current < weapon.fireRate) {
      lastFireRef.current = now;
    }
    playWeaponFire(weapon.id);
    setFiring(true);
    setTimeout(() => setFiring(false), 80);

    const result = engine.hitTarget(id);
    if (result) {
      const t = engine.targets.find(t => t.id === id);
      if (t) {
        fireWeapon(weapon, window.innerWidth / 2, window.innerHeight, t.x, t.y);
        if (result.points > 0) {
          spawnHitEffect(t.x, t.y, result.points, t.color);
          triggerHitMarker(t.x, t.y, result.points, result.critical);
          if (result.critical) playCritical();
        }
      }
    }
  }, [engine, weapon, spawnHitEffect, triggerHitMarker, fireWeapon, playWeaponFire, playCritical]);

  // Watch for game end
  useEffect(() => {
    if (screen === 'playing' && !engine.isRunning && engine.stats.hits + engine.stats.misses > 0) {
      playGameOver();
      // Update achievements
      updateAchievementStats({
        totalHits: engine.stats.hits,
        bestAccuracy: engine.stats.accuracy,
        bestCombo: engine.stats.bestCombo,
        gamesPlayed: 1,
        survivalBestTime: currentMode === 'survival' ? engine.stats.timeElapsed : 0,
      });
      setScreen('gameover');
    }
  }, [engine.isRunning, engine.stats, screen, playGameOver, currentMode]);

  const handleReplay = useCallback(() => {
    playButton();
    handlePlay(currentMode);
  }, [currentMode, handlePlay, playButton]);

  const goHome = useCallback(() => {
    playButton();
    engine.stop();
    setScreen('home');
  }, [engine, playButton]);

  const accuracy = engine.stats.hits + engine.stats.misses > 0
    ? Math.round((engine.stats.hits / (engine.stats.hits + engine.stats.misses)) * 100)
    : 100;

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
          selectedWeapon={settings.selectedWeapon}
          onSelectWeapon={(w) => setSettings(s => ({ ...s, selectedWeapon: w }))}
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
          accuracy={accuracy}
          weapon={weapon}
          wave={engine.wave}
          isPaused={engine.isPaused}
          onHitTarget={handleHitTarget}
          onMissTap={engine.missTap}
          onPause={engine.togglePause}
          onToggleSound={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
          soundEnabled={settings.soundEnabled}
          hitEffects={<HitEffects />}
          shootingEffects={<EffectsLayer />}
          screenShake={screenShake}
          onFire={handleFire}
          firing={firing}
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
