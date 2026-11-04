import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { CHARACTERS } from '../game/data/characters';
import { ARENAS } from '../game/data/arenas';
import { soundManager } from '../audio/soundManager';
import { Swords } from 'lucide-react';

export const VSScreen: React.FC = () => {
  const {
    player1Character,
    player2Character,
    selectedArena,
    startBattle,
  } = useGameStore();

  const p1 = CHARACTERS[player1Character];
  const p2 = CHARACTERS[player2Character];
  const arena = ARENAS[selectedArena];

  useEffect(() => {
    // Announce fighters
    soundManager.announce(`${p1.name} VERSUS ${p2.name}`);

    // Auto transition to Battle
    const timer = setTimeout(() => {
      startBattle();
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="relative w-screen h-screen flex flex-col items-center justify-between bg-black text-white overflow-hidden cursor-pointer select-none"
      onClick={startBattle}
    >
      {/* Background Arena Tint */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${arena.primaryColor}33 0%, #000 85%)`,
        }}
      />

      {/* Top Banner: Arena Name */}
      <div className="relative z-10 pt-6 text-center">
        <div className="inline-block bg-neutral-900/80 border border-neutral-700 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1">
          ARENA: {arena.name} • {arena.subtitle}
        </div>
      </div>

      {/* Main Split Screen Clash */}
      <div className="relative z-10 w-full max-w-6xl flex-1 flex flex-col md:flex-row items-center justify-between px-6 md:px-12">
        
        {/* Player 1 Left Side */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="text-xs font-black tracking-widest text-emerald-400 uppercase mb-2">
            PLAYER 1
          </div>
          <div 
            className="w-32 h-32 md:w-44 md:h-44 rounded-3xl border-4 flex items-center justify-center font-black text-4xl shadow-2xl mb-4 transition transform hover:scale-105"
            style={{ 
              borderColor: p1.primaryColor,
              backgroundColor: `${p1.primaryColor}22`,
              color: p1.primaryColor,
              boxShadow: `0 0 35px ${p1.glowColor}`,
            }}
          >
            {p1.name.charAt(0)}
          </div>
          <h2 className="text-3xl md:text-5xl font-black italic tracking-wider text-white">
            {p1.name}
          </h2>
          <span className="text-sm text-neutral-400 font-mono mt-1">
            {p1.species} • {p1.element}
          </span>
          <p className="text-xs text-neutral-300 italic mt-3 max-w-xs">
            "{p1.quote}"
          </p>
        </div>

        {/* Center Glowing VS Emblem */}
        <div className="my-4 md:my-0 flex flex-col items-center">
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-emerald-500/20 border-4 border-emerald-400 flex items-center justify-center shadow-[0_0_50px_rgba(0,255,102,0.8)] omnitrix-glow">
            <span className="text-3xl md:text-5xl font-black italic text-emerald-300 drop-shadow-[0_0_15px_rgba(0,255,102,1)]">
              VS
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 uppercase tracking-widest mt-2 font-mono">
            TAP TO SKIP
          </span>
        </div>

        {/* Player 2 Right Side */}
        <div className="flex-1 flex flex-col items-center md:items-end text-center md:text-right">
          <div className="text-xs font-black tracking-widest text-cyan-400 uppercase mb-2">
            PLAYER 2
          </div>
          <div 
            className="w-32 h-32 md:w-44 md:h-44 rounded-3xl border-4 flex items-center justify-center font-black text-4xl shadow-2xl mb-4 transition transform hover:scale-105"
            style={{ 
              borderColor: p2.primaryColor,
              backgroundColor: `${p2.primaryColor}22`,
              color: p2.primaryColor,
              boxShadow: `0 0 35px ${p2.glowColor}`,
            }}
          >
            {p2.name.charAt(0)}
          </div>
          <h2 className="text-3xl md:text-5xl font-black italic tracking-wider text-white">
            {p2.name}
          </h2>
          <span className="text-sm text-neutral-400 font-mono mt-1">
            {p2.species} • {p2.element}
          </span>
          <p className="text-xs text-neutral-300 italic mt-3 max-w-xs">
            "{p2.quote}"
          </p>
        </div>

      </div>

      {/* Footer */}
      <div className="relative z-10 pb-6 text-xs text-neutral-500 font-mono tracking-widest uppercase">
        BEST OF 3 ROUNDS • ARENA INITIALIZATION COMPLETE
      </div>
    </div>
  );
};

