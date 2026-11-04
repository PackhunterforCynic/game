import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { CHARACTERS } from '../game/data/characters';
import { soundManager } from '../audio/soundManager';
import { multiplayerManager } from '../multiplayer/multiplayerManager';
import { Trophy, RotateCcw, Users, Home, Wifi } from 'lucide-react';

export const ResultScreen: React.FC = () => {
  const {
    gameMode,
    multiplayerRole,
    lastMatchStats,
    rematch,
    returnToCharacterSelect,
    returnToMainMenu,
  } = useGameStore();

  const isOnline = gameMode === 'online-pvp';

  // Listen for opponent rematch or change character packets
  useEffect(() => {
    if (!isOnline) return;

    const unsub = multiplayerManager.onPacket((packet) => {
      if (packet.type === 'REMATCH') {
        soundManager.playOmnitrixTransform();
        rematch();
      }
    });

    return () => {
      unsub();
    };
  }, [isOnline]);

  if (!lastMatchStats) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        Loading match results...
      </div>
    );
  }

  const isP1Winner = lastMatchStats.winner === 1;
  const winnerAlienId = isP1Winner ? lastMatchStats.player1Character : lastMatchStats.player2Character;
  const winner = CHARACTERS[winnerAlienId];

  const handleRematch = () => {
    soundManager.playOmnitrixTransform();
    if (isOnline) {
      multiplayerManager.sendPacket('REMATCH', {});
    }
    rematch();
  };

  const handleChangeChar = () => {
    soundManager.playOmnitrixSelect();
    returnToCharacterSelect();
  };

  const handleMainMenu = () => {
    soundManager.playOmnitrixSelect();
    if (isOnline) {
      multiplayerManager.cleanup();
    }
    returnToMainMenu();
  };

  return (
    <div className="relative w-screen h-screen flex flex-col justify-between items-center bg-black text-white p-6 md:p-10 select-none overflow-hidden">
      {/* Dynamic Victor Ambient Glow */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${winner.primaryColor}44 0%, #000 80%)`,
        }}
      />

      {/* Top Banner: VICTORY / DEFEAT */}
      <div className="relative z-10 text-center pt-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
            MATCH CONCLUSION
          </span>
          {isOnline && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
              <Wifi className="w-3 h-3" /> ONLINE MATCH
            </span>
          )}
        </div>
        <h1 className="text-4xl md:text-6xl font-black italic tracking-wider text-white drop-shadow-[0_0_20px_rgba(0,255,102,0.6)]">
          {isOnline 
            ? ((isP1Winner && multiplayerRole === 'host') || (!isP1Winner && multiplayerRole === 'client') 
                ? 'VICTORY - YOU WIN!' 
                : 'DEFEAT - OPPONENT WINS!')
            : (isP1Winner ? 'VICTORY - PLAYER 1 WINS!' : 'PLAYER 2 WINS!')}
        </h1>
        <p className="text-xs text-neutral-400 font-mono uppercase tracking-widest mt-1">
          {winner.name.toUpperCase()} DOMINATES THE ARENA
        </p>
      </div>

      {/* Winner Display & Match Statistics Card */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 my-auto items-center">
        
        {/* Winner Hero Card */}
        <div className="md:col-span-5 flex flex-col items-center bg-neutral-950/80 border-2 border-emerald-500/80 rounded-2xl p-6 shadow-[0_0_35px_rgba(0,255,102,0.3)]">
          <div 
            className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 flex items-center justify-center font-black text-4xl shadow-2xl mb-4"
            style={{
              borderColor: winner.primaryColor,
              backgroundColor: `${winner.primaryColor}22`,
              color: winner.primaryColor,
              boxShadow: `0 0 30px ${winner.glowColor}`,
            }}
          >
            {winner.name.charAt(0)}
          </div>
          <h2 className="text-2xl md:text-3xl font-black italic text-white tracking-wide" style={{ color: winner.primaryColor }}>
            {winner.name}
          </h2>
          <span className="text-xs text-neutral-400 font-mono mt-0.5">
            {winner.species} • {winner.homeworld}
          </span>
          <p className="text-xs text-neutral-300 italic text-center mt-3 max-w-xs">
            "{winner.quote}"
          </p>
        </div>

        {/* Detailed Match Statistics Breakdown */}
        <div className="md:col-span-7 bg-neutral-950/80 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
            <span className="text-xs font-mono font-black uppercase text-emerald-400 tracking-wider">
              COMBAT PERFORMANCE
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              DURATION: {lastMatchStats.durationSeconds}s
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Damage Dealt */}
            <div>
              <div className="flex justify-between text-neutral-300 mb-1">
                <span>P1 DAMAGE ({lastMatchStats.player1Character.toUpperCase()})</span>
                <span className="font-mono text-emerald-400 font-bold">{lastMatchStats.p1DamageDealt}</span>
              </div>
              <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, (lastMatchStats.p1DamageDealt / 2000) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-neutral-300 mb-1">
                <span>P2 DAMAGE ({lastMatchStats.player2Character.toUpperCase()})</span>
                <span className="font-mono text-cyan-400 font-bold">{lastMatchStats.p2DamageDealt}</span>
              </div>
              <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-400 h-full rounded-full"
                  style={{ width: `${Math.min(100, (lastMatchStats.p2DamageDealt / 2000) * 100)}%` }}
                />
              </div>
            </div>

            {/* Combos & Specials Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 font-mono uppercase block mb-1">
                  MAX COMBO
                </span>
                <div className="flex justify-between items-center text-sm font-black">
                  <span className="text-emerald-400">P1: {lastMatchStats.p1MaxCombo} HITS</span>
                  <span className="text-cyan-400">P2: {lastMatchStats.p2MaxCombo} HITS</span>
                </div>
              </div>

              <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800">
                <span className="text-[10px] text-neutral-400 font-mono uppercase block mb-1">
                  SPECIALS EXECUTED
                </span>
                <div className="flex justify-between items-center text-sm font-black">
                  <span className="text-emerald-400">P1: {lastMatchStats.p1SpecialsUsed}</span>
                  <span className="text-cyan-400">P2: {lastMatchStats.p2SpecialsUsed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Action Buttons */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={handleRematch}
          className="flex items-center gap-2.5 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm rounded-xl uppercase tracking-wider shadow-[0_0_25px_rgba(0,255,102,0.6)] transition-all transform hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>REMATCH</span>
        </button>

        <button
          onClick={handleChangeChar}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm rounded-xl uppercase tracking-wider border border-neutral-700 hover:border-emerald-500 transition-all"
        >
          <Users className="w-4 h-4" />
          <span>CHANGE CHARACTERS</span>
        </button>

        <button
          onClick={handleMainMenu}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-bold text-sm rounded-xl uppercase tracking-wider border border-neutral-800 hover:border-neutral-600 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>MAIN MENU</span>
        </button>
      </div>

    </div>
  );
};
