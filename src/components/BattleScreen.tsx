import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { useGameStore } from '../store/gameStore';
import { BootScene } from '../game/scenes/BootScene';
import { BattleScene } from '../game/scenes/BattleScene';
import { CHARACTERS } from '../game/data/characters';
import { soundManager } from '../audio/soundManager';
import { MobileControls } from './MobileControls';
import { 
  Pause, 
  Play, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Home, 
  Maximize
} from 'lucide-react';

export const BattleScreen: React.FC = () => {
  const {
    player1Character,
    player2Character,
    currentRound,
    p1RoundsWon,
    p2RoundsWon,
    roundsToWin,
    isPaused,
    setPaused,
    returnToCharacterSelect,
    returnToMainMenu,
    rematch,
  } = useGameStore();

  const gameContainerRef = useRef<HTMLDivElement | null>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [battleScene, setBattleScene] = useState<BattleScene | null>(null);

  // Real-time HUD states
  const [p1Hp, setP1Hp] = useState(1000);
  const [p1MaxHp, setP1MaxHp] = useState(1000);
  const [p1Energy, setP1Energy] = useState(0);
  const [p1Combo, setP1Combo] = useState(0);

  const [p2Hp, setP2Hp] = useState(1000);
  const [p2MaxHp, setP2MaxHp] = useState(1000);
  const [p2Energy, setP2Energy] = useState(0);
  const [p2Combo, setP2Combo] = useState(0);

  const [timerVal, setTimerVal] = useState(99);
  const [isMuted, setIsMuted] = useState(false);

  const p1 = CHARACTERS[player1Character];
  const p2 = CHARACTERS[player2Character];

  // Initialize Phaser Game instance
  useEffect(() => {
    if (!gameContainerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#030706',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [BootScene, BattleScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    const game = new Phaser.Game(config);
    phaserGameRef.current = game;

    // Hook up scene references when BattleScene starts
    const checkScene = setInterval(() => {
      const bScene = game.scene.getScene('BattleScene') as BattleScene;
      if (bScene && bScene.player1 && bScene.player2) {
        setBattleScene(bScene);
        clearInterval(checkScene);
      }
    }, 200);

    return () => {
      clearInterval(checkScene);
      game.destroy(true);
      phaserGameRef.current = null;
    };
  }, []);

  // Sync real-time fighter stats with HUD
  useEffect(() => {
    if (!battleScene) return;

    const syncInterval = setInterval(() => {
      if (battleScene.player1 && battleScene.player2) {
        setP1Hp(battleScene.player1.currentHealth);
        setP1MaxHp(battleScene.player1.maxHealth);
        setP1Energy(battleScene.player1.energy);
        setP1Combo(battleScene.player1.currentCombo);

        setP2Hp(battleScene.player2.currentHealth);
        setP2MaxHp(battleScene.player2.maxHealth);
        setP2Energy(battleScene.player2.energy);
        setP2Combo(battleScene.player2.currentCombo);

        setTimerVal(battleScene.roundTime);
      }
    }, 33); // 30 FPS HUD sync

    return () => clearInterval(syncInterval);
  }, [battleScene]);

  // Pause / Resume key listener
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        togglePause();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPaused, battleScene]);

  const togglePause = () => {
    soundManager.playOmnitrixSelect();
    const newPaused = !isPaused;
    setPaused(newPaused);
    if (phaserGameRef.current) {
      if (newPaused) {
        phaserGameRef.current.scene.pause('BattleScene');
      } else {
        phaserGameRef.current.scene.resume('BattleScene');
      }
    }
  };

  const toggleMute = () => {
    soundManager.playOmnitrixSelect();
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundManager.setVolumes(0.8, 0.4, nextMute);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      
      {/* Phaser Canvas Container */}
      <div ref={gameContainerRef} className="absolute inset-0 z-0" />

      {/* TOP COMBAT HUD */}
      <div className="absolute top-0 inset-x-0 z-20 p-3 md:p-6 flex flex-col items-center pointer-events-none">
        
        {/* Top Control Bar (Pause & Mute) */}
        <div className="w-full max-w-5xl flex items-center justify-between mb-2">
          {/* Audio toggle */}
          <button
            onClick={toggleMute}
            className="pointer-events-auto p-2 rounded-lg bg-neutral-900/80 border border-neutral-800 hover:border-emerald-500 text-neutral-300 hover:text-emerald-400 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Round Indicator Badges */}
          <div className="flex items-center gap-3 bg-neutral-900/80 border border-neutral-800 px-4 py-1 rounded-full text-xs font-mono">
            <span className="text-emerald-400 font-bold uppercase">
              ROUND {currentRound}
            </span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: roundsToWin }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full ${
                    idx < p1RoundsWon ? 'bg-emerald-400 shadow-[0_0_8px_#00ff66]' : 'bg-neutral-700'
                  }`}
                />
              ))}
              <span className="text-neutral-500 mx-1">:</span>
              {Array.from({ length: roundsToWin }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full ${
                    idx < p2RoundsWon ? 'bg-cyan-400 shadow-[0_0_8px_#00d2ff]' : 'bg-neutral-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Top Actions: Fullscreen & Pause */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => {
                soundManager.playOmnitrixSelect();
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen?.();
                } else {
                  document.exitFullscreen?.();
                }
              }}
              title="Fullscreen"
              className="p-2 rounded-lg bg-neutral-900/80 border border-neutral-800 hover:border-emerald-500 text-neutral-300 hover:text-emerald-400 transition"
            >
              <Maximize className="w-4 h-4" />
            </button>

            <button
              onClick={togglePause}
              title="Pause"
              className="p-2 rounded-lg bg-neutral-900/80 border border-neutral-800 hover:border-emerald-500 text-neutral-300 hover:text-emerald-400 transition"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Health & Energy Bars Row */}
        <div className="w-full max-w-5xl grid grid-cols-12 items-center gap-2 md:gap-4">
          
          {/* Player 1 Health & Energy (Left) */}
          <div className="col-span-5 flex items-center gap-3">
            {/* P1 Portrait */}
            <div 
              className="w-12 h-12 md:w-16 md:h-16 rounded-xl border-2 flex items-center justify-center font-black text-xl shadow-lg shrink-0"
              style={{
                borderColor: p1.primaryColor,
                backgroundColor: `${p1.primaryColor}33`,
                color: p1.primaryColor,
              }}
            >
              {p1.name.charAt(0)}
            </div>

            {/* Bars */}
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-black tracking-wider">
                <span className="text-white drop-shadow">{p1.name.toUpperCase()}</span>
                <span className="text-emerald-400 font-mono text-[11px]">{Math.max(0, p1Hp)} / {p1MaxHp}</span>
              </div>

              {/* P1 Health Bar */}
              <div className="w-full h-4 bg-neutral-950 border border-neutral-700 rounded-sm overflow-hidden flex justify-end">
                <div 
                  className="h-full bg-gradient-to-l from-emerald-400 to-green-600 transition-all duration-100 shadow-[0_0_10px_rgba(0,255,102,0.8)]"
                  style={{ width: `${Math.max(0, (p1Hp / p1MaxHp) * 100)}%` }}
                />
              </div>

              {/* P1 Omnitrix Energy Bar */}
              <div className="w-full h-2 bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden flex justify-end">
                <div 
                  className={`h-full transition-all duration-150 ${
                    p1Energy >= 100 
                      ? 'bg-emerald-300 shadow-[0_0_12px_#00ff66] animate-pulse' 
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.max(0, (p1Energy / 100) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Center Round Timer */}
          <div className="col-span-2 flex flex-col items-center justify-center">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-neutral-900/90 border-2 border-emerald-500/80 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,102,0.4)]">
              <span className={`text-2xl md:text-3xl font-black font-mono tracking-tight ${
                timerVal <= 10 ? 'text-red-400 animate-ping' : 'text-emerald-300'
              }`}>
                {timerVal}
              </span>
            </div>
          </div>

          {/* Player 2 Health & Energy (Right) */}
          <div className="col-span-5 flex items-center gap-3 flex-row-reverse">
            {/* P2 Portrait */}
            <div 
              className="w-12 h-12 md:w-16 md:h-16 rounded-xl border-2 flex items-center justify-center font-black text-xl shadow-lg shrink-0"
              style={{
                borderColor: p2.primaryColor,
                backgroundColor: `${p2.primaryColor}33`,
                color: p2.primaryColor,
              }}
            >
              {p2.name.charAt(0)}
            </div>

            {/* Bars */}
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs font-black tracking-wider flex-row-reverse">
                <span className="text-white drop-shadow">{p2.name.toUpperCase()}</span>
                <span className="text-cyan-400 font-mono text-[11px]">{Math.max(0, p2Hp)} / {p2MaxHp}</span>
              </div>

              {/* P2 Health Bar */}
              <div className="w-full h-4 bg-neutral-950 border border-neutral-700 rounded-sm overflow-hidden flex justify-start">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-100 shadow-[0_0_10px_rgba(0,210,255,0.8)]"
                  style={{ width: `${Math.max(0, (p2Hp / p2MaxHp) * 100)}%` }}
                />
              </div>

              {/* P2 Energy Bar */}
              <div className="w-full h-2 bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden flex justify-start">
                <div 
                  className={`h-full transition-all duration-150 ${
                    p2Energy >= 100 
                      ? 'bg-cyan-300 shadow-[0_0_12px_#00d2ff] animate-pulse' 
                      : 'bg-cyan-600'
                  }`}
                  style={{ width: `${Math.max(0, (p2Energy / 100) * 100)}%` }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic Combo Popups */}
        <div className="w-full max-w-5xl flex justify-between mt-3 px-4">
          {p1Combo > 1 && (
            <div className="animate-bounce text-emerald-400 font-black italic text-xl md:text-2xl drop-shadow-[0_0_10px_rgba(0,255,102,1)]">
              {p1Combo} HITS COMBO!
            </div>
          )}
          <div />
          {p2Combo > 1 && (
            <div className="animate-bounce text-cyan-400 font-black italic text-xl md:text-2xl drop-shadow-[0_0_10px_rgba(0,210,255,1)]">
              {p2Combo} HITS COMBO!
            </div>
          )}
        </div>

      </div>

      {/* MOBILE TOUCH CONTROLS */}
      <MobileControls battleScene={battleScene} p1Energy={p1Energy} />

      {/* PAUSE MODAL OVERLAY */}
      {isPaused && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-950 border-2 border-emerald-500 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,255,102,0.4)] flex flex-col gap-4 text-center">
            <h3 className="text-3xl font-black italic text-white tracking-wider">
              MATCH PAUSED
            </h3>
            <p className="text-xs text-neutral-400 font-mono">
              OMNITRIX COMBAT SUSPENDED
            </p>

            <div className="flex flex-col gap-2.5 my-2">
              <button
                onClick={togglePause}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>RESUME BATTLE</span>
              </button>

              <button
                onClick={() => {
                  togglePause();
                  rematch();
                }}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs uppercase flex items-center justify-center gap-2 border border-neutral-700"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESTART MATCH</span>
              </button>

              <button
                onClick={() => {
                  togglePause();
                  returnToCharacterSelect();
                }}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs uppercase flex items-center justify-center gap-2 border border-neutral-700"
              >
                <span>CHANGE CHARACTERS</span>
              </button>

              <button
                onClick={() => {
                  togglePause();
                  returnToMainMenu();
                }}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-red-400 font-bold rounded-xl text-xs uppercase flex items-center justify-center gap-2 border border-neutral-800"
              >
                <Home className="w-4 h-4" />
                <span>QUIT TO MAIN MENU</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

