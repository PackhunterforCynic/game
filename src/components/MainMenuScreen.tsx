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
  ShieldAlert 
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

  return (
    <div className="relative w-screen h-screen flex flex-col justify-between items-center bg-black overflow-hidden p-6 md:p-10 select-none">
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
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between border-b border-emerald-900/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,102,0.5)]">
            <div className="w-4 h-4 bg-emerald-400 rotate-45" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-wider">
              BEN 10 <span className="text-emerald-400 text-sm font-semibold tracking-normal">BATTLE ARENA</span>
            </h1>
            <p className="text-[11px] text-emerald-400/80 font-mono tracking-widest uppercase">
              Omnitrix V4 System Online
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenSettings}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-emerald-400 transition"
        >
          <SettingsIcon className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Settings</span>
        </button>
      </div>

      {/* Main Arcade Menu Column */}
      <div className="relative z-10 w-full max-w-md flex flex-col gap-3.5 my-auto">
        {/* Play Single Player vs CPU */}
        <button
          onClick={handlePlayCpu}
          className="group relative flex items-center justify-between px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-neutral-900 border-2 border-emerald-500 hover:border-emerald-300 text-left transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(0,255,102,0.25)] hover:shadow-[0_0_30px_rgba(0,255,102,0.6)]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-400 group-hover:text-black transition">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-black text-white group-hover:text-emerald-300 tracking-wider">
                PLAY VS CPU
              </div>
              <div className="text-xs text-neutral-400">
                Test your skills against smart AI aliens
              </div>
            </div>
          </div>
          <div className="text-emerald-400 text-xl font-bold opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition">
            →
          </div>
        </button>

        {/* Local 2 Player */}
        <button
          onClick={handlePlayLocalPvp}
          className="group relative flex items-center justify-between px-6 py-4 rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-950 border border-neutral-800 hover:border-emerald-500 text-left transition-all transform hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 group-hover:border-emerald-400 group-hover:text-emerald-400 transition">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-black text-white group-hover:text-emerald-300 tracking-wider">
                LOCAL 2-PLAYER
              </div>
              <div className="text-xs text-neutral-400">
                Duel a friend on a single keyboard
              </div>
            </div>
          </div>
          <div className="text-neutral-500 group-hover:text-emerald-400 text-xl font-bold transition">
            →
          </div>
        </button>

        {/* Online Friend Room */}
        <button
          onClick={handlePlayOnline}
          className="group relative flex items-center justify-between px-6 py-4 rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-950 border border-neutral-800 hover:border-emerald-500 text-left transition-all transform hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 group-hover:border-emerald-400 group-hover:text-emerald-400 transition">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-black text-white group-hover:text-emerald-300 tracking-wider">
                ONLINE FRIEND ROOM
              </div>
              <div className="text-xs text-neutral-400">
                Join or host a match with room codes
              </div>
            </div>
          </div>
          <div className="text-neutral-500 group-hover:text-emerald-400 text-xl font-bold transition">
            →
          </div>
        </button>

        {/* Character Collection Codex */}
        <button
          onClick={handleOpenCollection}
          className="group relative flex items-center justify-between px-6 py-3.5 rounded-xl bg-neutral-950/90 border border-neutral-800 hover:border-emerald-500 text-left transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300 group-hover:text-emerald-400 transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white group-hover:text-emerald-300 tracking-wide">
                CHARACTER COLLECTION
              </div>
              <div className="text-xs text-neutral-500">
                Explore lore, stats & move profiles
              </div>
            </div>
          </div>
          <div className="text-neutral-600 group-hover:text-emerald-400 text-lg transition">
            →
          </div>
        </button>

        {/* How To Play & Controls */}
        <button
          onClick={handleOpenHowToPlay}
          className="group relative flex items-center justify-between px-6 py-3.5 rounded-xl bg-neutral-950/90 border border-neutral-800 hover:border-emerald-500 text-left transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300 group-hover:text-emerald-400 transition">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white group-hover:text-emerald-300 tracking-wide">
                HOW TO PLAY
              </div>
              <div className="text-xs text-neutral-500">
                Controls, combos & special moves guide
              </div>
            </div>
          </div>
          <div className="text-neutral-600 group-hover:text-emerald-400 text-lg transition">
            →
          </div>
        </button>
      </div>

      {/* Footer Controls Tip */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between border-t border-neutral-900 pt-4 text-xs text-neutral-500">
        <div>CONTROLS: WASD + J / K / I / L / SPACE / SHIFT</div>
        <div className="text-emerald-400/80 font-mono">10 ALIENS REGISTERED</div>
      </div>
    </div>
  );
};

