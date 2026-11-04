import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { CHARACTERS, CHARACTER_IDS } from '../game/data/characters';
import { AlienId } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { multiplayerManager } from '../multiplayer/multiplayerManager';
import { Shuffle, ArrowLeft, CheckCircle2, Wifi, Info } from 'lucide-react';

export const CharacterSelectScreen: React.FC = () => {
  const {
    gameMode,
    multiplayerRole,
    player1Character,
    player2Character,
    selectCharacter,
    randomizeCharacter,
    setScreen,
  } = useGameStore();

  const isOnline = gameMode === 'online-pvp';
  const isHost = multiplayerRole === 'host';
  const isClient = multiplayerRole === 'client';

  const [localActivePlayer, setLocalActivePlayer] = useState<1 | 2>(1);
  const [p1Locked, setP1Locked] = useState(false);
  const [p2Locked, setP2Locked] = useState(gameMode === 'vs-cpu');
  const [showMobileStats, setShowMobileStats] = useState(false);

  const currentHoverId = isOnline
    ? (isHost ? player1Character : player2Character)
    : (localActivePlayer === 1 ? player1Character : player2Character);
  const currentAlien = CHARACTERS[currentHoverId];

  // Online Packet Synchronization
  useEffect(() => {
    if (!isOnline) return;

    const unsub = multiplayerManager.onPacket((packet) => {
      if (packet.type === 'SELECTION') {
        const char = packet.payload.character as AlienId;
        if (isHost) {
          selectCharacter(2, char);
        } else {
          selectCharacter(1, char);
        }
      } else if (packet.type === 'LOCK_IN') {
        if (isHost) {
          setP2Locked(packet.payload.ready);
        } else {
          setP1Locked(packet.payload.ready);
        }
      } else if (packet.type === 'ARENA') {
        setScreen('ARENA_SELECT');
      }
    });

    return () => {
      unsub();
    };
  }, [isOnline, isHost]);

  const handleSelect = (id: AlienId) => {
    soundManager.playOmnitrixSelect();
    if (isOnline) {
      if (isHost) {
        selectCharacter(1, id);
      } else {
        selectCharacter(2, id);
      }
      multiplayerManager.sendSelection(id);
    } else {
      selectCharacter(localActivePlayer, id);
    }
  };

  const handleRandom = () => {
    soundManager.playOmnitrixActivate();
    if (isOnline) {
      randomizeCharacter(isHost ? 1 : 2);
      const chosen = isHost ? player1Character : player2Character;
      multiplayerManager.sendSelection(chosen);
    } else {
      randomizeCharacter(localActivePlayer);
    }
  };

  const handleConfirmLockIn = () => {
    soundManager.playOmnitrixTransform();

    if (isOnline) {
      if (isHost) {
        setP1Locked(true);
        multiplayerManager.sendLockIn(true);
        if (p2Locked) {
          setScreen('ARENA_SELECT');
          multiplayerManager.sendPacket('ARENA', {});
        }
      } else {
        setP2Locked(true);
        multiplayerManager.sendLockIn(true);
      }
      return;
    }

    if (localActivePlayer === 1) {
      setP1Locked(true);
      if (gameMode === 'local-pvp') {
        setLocalActivePlayer(2);
      } else {
        setScreen('ARENA_SELECT');
      }
    } else {
      setP2Locked(true);
      setScreen('ARENA_SELECT');
    }
  };

  return (
    <div className="relative w-screen h-screen flex flex-col justify-between bg-black text-white p-2.5 md:p-6 overflow-hidden select-none">
      {/* Background Ambience */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${currentAlien.primaryColor}22 0%, #000 80%)`,
        }}
      />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-neutral-800 pb-2">
        <button
          onClick={() => {
            soundManager.playOmnitrixSelect();
            setScreen('MAIN_MENU');
          }}
          className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-base md:text-xl font-black italic tracking-widest text-emerald-400 leading-tight">
              SELECT ALIEN HERO
            </h2>
            {isOnline && (
              <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                <Wifi className="w-3 h-3" /> ONLINE
              </span>
            )}
          </div>
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest leading-none">
            {isOnline
              ? (isHost ? 'YOU ARE PLAYER 1 (HOST)' : 'YOU ARE PLAYER 2 (GUEST)')
              : (gameMode === 'vs-cpu' ? 'PLAYER 1 SELECTING' : `PLAYER ${localActivePlayer} SELECTING`)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Specs Toggle */}
          <button
            onClick={() => setShowMobileStats(!showMobileStats)}
            className="lg:hidden p-1.5 rounded-lg border border-neutral-700 bg-neutral-900 text-xs font-bold text-neutral-300"
          >
            <Info className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={handleRandom}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 hover:border-emerald-400 text-xs font-bold text-neutral-200 transition"
          >
            <Shuffle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] hidden sm:inline">RANDOM</span>
          </button>
        </div>
      </div>

      {/* Main Selection Area */}
      <div className="relative z-10 flex-1 grid grid-cols-12 gap-2 md:gap-4 items-center my-1.5 overflow-hidden">
        
        {/* Left Column: Player Cards & Confirm Button */}
        <div className="col-span-4 lg:col-span-3 flex flex-col justify-between h-full py-1">
          <div className="flex flex-col gap-2">
            {/* P1 Card */}
            <div className={`p-2 md:p-3.5 rounded-xl border-2 transition-all ${
              (isOnline ? isHost : localActivePlayer === 1)
                ? 'border-emerald-400 bg-emerald-950/40 shadow-[0_0_15px_rgba(0,255,102,0.3)]' 
                : 'border-neutral-800 bg-neutral-950/80'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                  P1 {isOnline && isHost && '(YOU)'}
                </span>
                {p1Locked && (
                  <span className="flex items-center gap-0.5 text-[9px] text-emerald-400 font-bold bg-emerald-900/60 px-1.5 py-0.2 rounded">
                    <CheckCircle2 className="w-2.5 h-2.5" /> LOCKED
                  </span>
                )}
              </div>
              <div className="text-sm md:text-lg font-black text-white leading-tight">{CHARACTERS[player1Character].name}</div>
              <div className="text-[10px] text-neutral-400 font-mono">{CHARACTERS[player1Character].species}</div>
            </div>

            {/* P2 Card */}
            <div className={`p-2 md:p-3.5 rounded-xl border-2 transition-all ${
              (isOnline ? isClient : localActivePlayer === 2)
                ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,210,255,0.3)]' 
                : 'border-neutral-800 bg-neutral-950/80'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">
                  {isOnline ? `P2 ${isClient ? '(YOU)' : '(OPPONENT)'}` : (gameMode === 'vs-cpu' ? 'CPU' : 'P2')}
                </span>
                {p2Locked && (
                  <span className="flex items-center gap-0.5 text-[9px] text-cyan-400 font-bold bg-cyan-900/60 px-1.5 py-0.2 rounded">
                    <CheckCircle2 className="w-2.5 h-2.5" /> LOCKED
                  </span>
                )}
              </div>
              <div className="text-sm md:text-lg font-black text-white leading-tight">{CHARACTERS[player2Character].name}</div>
              <div className="text-[10px] text-neutral-400 font-mono">{CHARACTERS[player2Character].species}</div>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirmLockIn}
            className="w-full mt-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs md:text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(0,255,102,0.6)] transition-all transform hover:scale-[1.02] active:scale-95"
          >
            {isOnline 
              ? (isHost ? (p2Locked ? 'PROCEED →' : 'LOCK IN') : (p2Locked ? 'LOCKED IN!' : 'LOCK IN')) 
              : 'LOCK IN →'}
          </button>
        </div>

        {/* Center Column: 10 Alien Grid */}
        <div className="col-span-8 lg:col-span-5 flex flex-col items-center justify-center h-full">
          <div className="grid grid-cols-5 gap-1.5 md:gap-2.5 w-full">
            {CHARACTER_IDS.map((id) => {
              const alien = CHARACTERS[id];
              const isP1 = player1Character === id;
              const isP2 = player2Character === id;

              return (
                <button
                  key={id}
                  onClick={() => handleSelect(id)}
                  className={`group relative aspect-square rounded-xl border-2 p-1 md:p-2 flex flex-col items-center justify-between transition-all transform active:scale-95 ${
                    isP1 
                      ? 'border-emerald-400 bg-emerald-950/70 shadow-[0_0_15px_rgba(0,255,102,0.7)]' 
                      : isP2 
                        ? 'border-cyan-400 bg-cyan-950/70 shadow-[0_0_15px_rgba(0,210,255,0.7)]' 
                        : 'border-neutral-800 bg-neutral-900/90 hover:border-neutral-500'
                  }`}
                >
                  <div 
                    className="w-7 h-7 md:w-9 md:h-9 rounded-full border flex items-center justify-center font-bold text-xs"
                    style={{ 
                      borderColor: alien.primaryColor,
                      backgroundColor: `${alien.primaryColor}22`,
                      color: alien.primaryColor,
                    }}
                  >
                    {alien.name.charAt(0)}
                  </div>

                  <span className="text-[9px] md:text-[10px] font-bold text-center uppercase tracking-tight text-neutral-200 line-clamp-1 leading-none">
                    {alien.name}
                  </span>

                  {isP1 && (
                    <span className="absolute -top-1.5 -left-1 bg-emerald-500 text-black text-[8px] font-black px-1 rounded shadow">
                      P1
                    </span>
                  )}
                  {isP2 && (
                    <span className="absolute -top-1.5 -right-1 bg-cyan-500 text-black text-[8px] font-black px-1 rounded shadow">
                      P2
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Alien Details & Moves (Visible on desktop or when toggled on mobile) */}
        <div className={`col-span-12 lg:col-span-4 bg-neutral-950/95 border border-neutral-800 rounded-2xl p-3 md:p-4 flex-col justify-between h-full overflow-y-auto ${
          showMobileStats ? 'fixed inset-4 z-40 flex shadow-2xl' : 'hidden lg:flex'
        }`}>
          <div>
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-white tracking-wide" style={{ color: currentAlien.primaryColor }}>
                  {currentAlien.name}
                </h3>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {currentAlien.species} • {currentAlien.homeworld}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div 
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  style={{ 
                    backgroundColor: `${currentAlien.primaryColor}22`,
                    color: currentAlien.primaryColor,
                    border: `1px solid ${currentAlien.primaryColor}`,
                  }}
                >
                  {currentAlien.element}
                </div>

                {showMobileStats && (
                  <button 
                    onClick={() => setShowMobileStats(false)}
                    className="p-1 rounded bg-neutral-800 text-xs text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-neutral-300 italic my-2">
              "{currentAlien.quote}"
            </p>

            {/* Combat Stats Bars */}
            <div className="space-y-1.5 mb-2.5">
              <div>
                <div className="flex justify-between text-[10px] text-neutral-300 mb-0.5">
                  <span>HEALTH</span>
                  <span className="font-mono text-emerald-400">{currentAlien.stats.health}</span>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${(currentAlien.stats.health / 1300) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-neutral-300 mb-0.5">
                  <span>ATTACK</span>
                  <span className="font-mono text-red-400">{currentAlien.stats.attack} / 10</span>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-red-500 h-full rounded-full"
                    style={{ width: `${(currentAlien.stats.attack / 10) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-neutral-300 mb-0.5">
                  <span>SPEED</span>
                  <span className="font-mono text-cyan-400">{currentAlien.stats.speed} / 10</span>
                </div>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-cyan-400 h-full rounded-full"
                    style={{ width: `${(currentAlien.stats.speed / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Specials & Ultimate */}
            <div className="border-t border-neutral-900 pt-2">
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
                SPECIAL ABILITIES & ULTIMATE
              </span>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div className="bg-neutral-900 p-1 rounded border border-neutral-800">
                  <span className="text-emerald-400 font-bold block">{currentAlien.special1.name}</span>
                </div>
                <div className="bg-neutral-900 p-1 rounded border border-neutral-800">
                  <span className="text-emerald-400 font-bold block">{currentAlien.special2.name}</span>
                </div>
                <div className="bg-neutral-900 p-1 rounded border border-neutral-800">
                  <span className="text-emerald-400 font-bold block">{currentAlien.special3.name}</span>
                </div>
                <div className="bg-amber-950/40 p-1 rounded border border-amber-600/50">
                  <span className="text-amber-400 font-bold block">{currentAlien.ultimate.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 flex items-center justify-between border-t border-neutral-900 pt-1.5 text-[10px] text-neutral-500 font-mono">
        <div>TAP TO SELECT HERO • CONFIRM TO ADVANCE</div>
        <div className="text-emerald-400 uppercase">OMNITRIX MATRIX ACTIVE</div>
      </div>
    </div>
  );
};
