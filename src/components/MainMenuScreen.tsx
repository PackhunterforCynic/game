import React from 'react';
import { useGameStore } from '../store/gameStore';
import { soundManager } from '../audio/soundManager';
import { 
  Swords, 
  Users, 
  BookOpen, 
  HelpCircle, 
  Settings as SettingsIcon, 
  Globe2, 
  Maximize
} from 'lucide-react';

export const MainMenuScreen: React.FC = () => {
  const {
    setScreen,
    setGameMode,
    setShowHowToPlay,
    setShowSettings,
    setShowCollection,
    setShowOnlineModal,
  } = useGameStore();

  const handlePlayCpu = () => {
    soundManager.playOmnitrixSelect();
    setGameMode('vs-cpu');
    setScreen('CHARACTER_SELECT');
  };

  const handlePlayLocalPvp = () => {
    soundManager.playOmnitrixSelect();
    setGameMode('local-pvp');
    setScreen('CHARACTER_SELECT');
  };

  const handlePlayOnline = () => {
    soundManager.playOmnitrixSelect();
    setShowOnlineModal(true);
  };

  const handleOpenCollection = () => {
    soundManager.playOmnitrixSelect();
    setShowCollection(true);
  };

  const handleOpenHowToPlay = () => {
    soundManager.playOmnitrixSelect();
    setShowHowToPlay(true);
  };

  const handleOpenSettings = () => {
    soundManager.playOmnitrixSelect();
    setShowSettings(true);
  };

  const handleFullscreen = () => {
    soundManager.playOmnitrixSelect();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <div className="relative w-screen h-screen flex flex-col justify-between items-center bg-black overflow-hidden p-3 md:p-8 select-none">
      {/* Background Matrix & Green Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,102,0.12)_0%,rgba(0,0,0,0.95)_75%)] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #00ff66 1px, transparent 1px), linear-gradient(to bottom, #00ff66 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Header Bar */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between border-b border-emerald-900/60 pb-2 md:pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,102,0.5)]">
            <div className="w-3.5 h-3.5 bg-emerald-400 rotate-45" />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-black text-white tracking-wider leading-none">
              BEN 10 <span className="text-emerald-400 text-xs md:text-sm font-semibold tracking-normal">BATTLE ARENA</span>
            </h1>
            <p className="text-[10px] text-emerald-400/80 font-mono tracking-widest uppercase">
              Omnitrix V4 System Online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Fullscreen Button */}
          <button
            onClick={handleFullscreen}
            title="Fullscreen Mode"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-emerald-400 transition"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Fullscreen</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={handleOpenSettings}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-emerald-400 transition"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Arcade Menu Grid */}
      <div className="relative z-10 w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3.5 my-auto">
        
        {/* Play Single Player vs CPU */}
        <button
          onClick={handlePlayCpu}
          className="group relative flex items-center justify-between px-4 md:px-5 py-3 md:py-3.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-neutral-900 border-2 border-emerald-500 hover:border-emerald-300 text-left transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(0,255,102,0.25)] hover:shadow-[0_0_30px_rgba(0,255,102,0.6)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-400 group-hover:text-black transition shrink-0">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-white group-hover:text-emerald-300 tracking-wider">
                PLAY VS CPU
              </div>
              <div className="text-[11px] text-neutral-400 leading-tight">
                Single player vs AI alien
              </div>
            </div>
          </div>
          <div className="text-emerald-400 text-lg font-bold opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition">
            →
          </div>
        </button>

        {/* Online Friend Room */}
        <button
          onClick={handlePlayOnline}
          className="group relative flex items-center justify-between px-4 md:px-5 py-3 md:py-3.5 rounded-xl bg-gradient-to-r from-cyan-950/60 to-neutral-900 border-2 border-cyan-500/70 hover:border-cyan-400 text-left transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(0,210,255,0.2)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 group-hover:bg-cyan-400 group-hover:text-black transition shrink-0">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-white group-hover:text-cyan-300 tracking-wider">
                ONLINE 2-PLAYER
              </div>
              <div className="text-[11px] text-neutral-400 leading-tight">
                Battle friends online with room code
              </div>
            </div>
          </div>
          <div className="text-cyan-400 text-lg font-bold opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition">
            →
          </div>
        </button>

        {/* Local 2 Player */}
        <button
          onClick={handlePlayLocalPvp}
          className="group relative flex items-center justify-between px-4 md:px-5 py-3 md:py-3.5 rounded-xl bg-neutral-950/90 border border-neutral-800 hover:border-emerald-500 text-left transition-all transform hover:scale-[1.02]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-300 group-hover:border-emerald-400 group-hover:text-emerald-400 transition shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-white group-hover:text-emerald-300 tracking-wider">
                LOCAL 2-PLAYER
              </div>
              <div className="text-[11px] text-neutral-400 leading-tight">
                Duel on same keyboard
              </div>
            </div>
          </div>
          <div className="text-neutral-500 group-hover:text-emerald-400 text-lg font-bold transition">
            →
          </div>
        </button>

        {/* Character Collection Codex */}
        <button
          onClick={handleOpenCollection}
          className="group relative flex items-center justify-between px-4 md:px-5 py-3 md:py-3.5 rounded-xl bg-neutral-950/90 border border-neutral-800 hover:border-emerald-500 text-left transition-all transform hover:scale-[1.02]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-neutral-300 group-hover:text-emerald-400 transition shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-white group-hover:text-emerald-300 tracking-wider">
                ALIEN CODEX (10)
              </div>
              <div className="text-[11px] text-neutral-400 leading-tight">
                Lore, stats & move profiles
              </div>
            </div>
          </div>
          <div className="text-neutral-500 group-hover:text-emerald-400 text-lg font-bold transition">
            →
          </div>
        </button>

        {/* How To Play & Controls (Span across on desktop) */}
        <button
          onClick={handleOpenHowToPlay}
          className="sm:col-span-2 group relative flex items-center justify-between px-4 md:px-5 py-2.5 md:py-3 rounded-xl bg-neutral-950/70 border border-neutral-800 hover:border-emerald-500 text-left transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-neutral-400 group-hover:text-emerald-400 transition shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs md:text-sm font-bold text-white group-hover:text-emerald-300 tracking-wide">
                HOW TO PLAY & CONTROLS GUIDE
              </div>
            </div>
          </div>
          <div className="text-neutral-600 group-hover:text-emerald-400 text-base transition">
            →
          </div>
        </button>

      </div>

      {/* Footer Controls Tip */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between border-t border-neutral-900 pt-2 text-[10px] md:text-xs text-neutral-500 font-mono">
        <div>TOUCH CONTROLS + KEYBOARD READY</div>
        <div className="text-emerald-400/80">10 ALIEN HEROES</div>
      </div>
    </div>
  );
};
