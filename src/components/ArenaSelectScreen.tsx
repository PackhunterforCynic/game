import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { ARENAS, ARENA_IDS } from '../game/data/arenas';
import { ArenaId } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { multiplayerManager } from '../multiplayer/multiplayerManager';
import { ArrowLeft, MapPin, Play, Wind, Sparkles, Orbit, Wifi } from 'lucide-react';

export const ArenaSelectScreen: React.FC = () => {
  const {
    gameMode,
    multiplayerRole,
    selectedArena,
    setArena,
    setScreen,
    startVsTransition,
  } = useGameStore();

  const isOnline = gameMode === 'online-pvp';
  const isHost = multiplayerRole === 'host';
  const activeArena = ARENAS[selectedArena];

  // Client listens for host stage select and battle launch
  useEffect(() => {
    if (!isOnline) return;

    const unsub = multiplayerManager.onPacket((packet) => {
      if (packet.type === 'ARENA') {
        if (packet.payload?.arena) {
          setArena(packet.payload.arena);
        }
      } else if (packet.type === 'START_BATTLE') {
        soundManager.playOmnitrixTransform();
        startVsTransition();
      }
    });

    return () => {
      unsub();
    };
  }, [isOnline]);

  const handleSelectArena = (id: ArenaId) => {
    if (isOnline && !isHost) return; // Only host chooses arena in online mode
    soundManager.playOmnitrixSelect();
    setArena(id);
    if (isOnline) {
      multiplayerManager.sendArena(id);
    }
  };

  const handleConfirmArena = () => {
    soundManager.playOmnitrixTransform();
    if (isOnline) {
      multiplayerManager.sendStartBattle();
    }
    startVsTransition();
  };

  return (
    <div className="relative w-screen h-screen flex flex-col justify-between bg-black text-white p-6 md:p-10 select-none overflow-hidden">
      {/* Dynamic Background Atmosphere */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${activeArena.primaryColor}33 0%, #000 80%)`,
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-neutral-800 pb-3">
        <button
          onClick={() => {
            soundManager.playOmnitrixSelect();
            setScreen('CHARACTER_SELECT');
          }}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition text-sm font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Characters</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl md:text-2xl font-black italic tracking-widest text-emerald-400">
              SELECT BATTLE ARENA
            </h2>
            {isOnline && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                <Wifi className="w-3 h-3" /> ONLINE SYNC
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 uppercase tracking-widest">
            {isOnline 
              ? (isHost ? 'HOST SELECTING ARENA' : 'WAITING FOR HOST TO PICK ARENA...') 
              : 'CHOOSE COMBAT ENVIRONMENT'}
          </p>
        </div>

        <div className="w-24" />
      </div>

      {/* 3 Arena Cards Row */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 my-auto max-w-5xl mx-auto w-full">
        {ARENA_IDS.map((id) => {
          const arena = ARENAS[id];
          const isSelected = selectedArena === id;

          return (
            <div
              key={id}
              onClick={() => handleSelectArena(id)}
              className={`group cursor-pointer rounded-2xl border-2 p-6 flex flex-col justify-between transition-all transform hover:scale-[1.03] ${
                isSelected
                  ? 'border-emerald-400 bg-neutral-900/90 shadow-[0_0_35px_rgba(0,255,102,0.4)] ring-2 ring-emerald-500/30'
                  : 'border-neutral-800 bg-neutral-950/70 hover:border-neutral-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                    style={{ 
                      backgroundColor: `${arena.primaryColor}22`,
                      color: arena.primaryColor,
                      border: `1px solid ${arena.primaryColor}`,
                    }}
                  >
                    {id === 'bellwood' && <MapPin className="w-5 h-5" />}
                    {id === 'nullvoid' && <Orbit className="w-5 h-5" />}
                    {id === 'alienplanet' && <Sparkles className="w-5 h-5" />}
                  </div>

                  {isSelected && (
                    <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-500/40">
                      SELECTED
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-black text-white tracking-wide group-hover:text-emerald-300 transition">
                  {arena.name}
                </h3>
                <span className="text-xs text-neutral-400 block mb-3 font-mono">
                  {arena.subtitle}
                </span>

                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  {arena.description}
                </p>
              </div>

              {/* Environmental Properties */}
              <div className="border-t border-neutral-800/80 pt-3 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{arena.particleType.toUpperCase()} ATMOSPHERE</span>
                </span>
                <span>{arena.musicTempo} BPM</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm & Launch Battle Button */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        {(!isOnline || isHost) ? (
          <button
            onClick={handleConfirmArena}
            className="flex items-center gap-3 px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-base rounded-full uppercase tracking-wider shadow-[0_0_35px_rgba(0,255,102,0.7)] transition-all transform hover:scale-105 active:scale-95"
          >
            <Play className="w-5 h-5 fill-black" />
            <span>START BATTLE IN {activeArena.name.toUpperCase()}</span>
          </button>
        ) : (
          <div className="px-8 py-3.5 bg-neutral-900 border border-neutral-800 rounded-full text-xs font-mono text-neutral-400">
            WAITING FOR HOST TO LAUNCH BATTLE IN {activeArena.name.toUpperCase()}...
          </div>
        )}
        <span className="text-xs text-neutral-400 uppercase tracking-widest">
          PREPARE FOR ROUND 1
        </span>
      </div>
    </div>
  );
};
