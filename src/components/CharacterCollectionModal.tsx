import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CHARACTERS, CHARACTER_IDS } from '../game/data/characters';
import { AlienId } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { X, BookOpen, Shield, Zap, Sparkles, Flame, Orbit } from 'lucide-react';

export const CharacterCollectionModal: React.FC = () => {
  const { showCollection, setShowCollection } = useGameStore();
  const [selectedId, setSelectedId] = useState<AlienId>('heatblast');

  if (!showCollection) return null;

  const handleClose = () => {
    soundManager.playOmnitrixSelect();
    setShowCollection(false);
  };

  const alien = CHARACTERS[selectedId];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-4xl bg-neutral-950 border-2 border-emerald-500 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,255,102,0.4)] flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-black italic tracking-wide text-white">
              OMNITRIX ALIEN DATABASE • 10 HEROES
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Alien selector tabs + Detailed view */}
        <div className="flex-1 flex flex-col md:flex-row gap-5 overflow-hidden">
          
          {/* Alien list tabs */}
          <div className="w-full md:w-56 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto shrink-0 pr-1">
            {CHARACTER_IDS.map((id) => {
              const a = CHARACTERS[id];
              const isSelected = selectedId === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    soundManager.playOmnitrixSelect();
                    setSelectedId(id);
                  }}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition text-left shrink-0 md:shrink ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_15px_rgba(0,255,102,0.4)]'
                      : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-600'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: `${a.primaryColor}22`,
                      color: a.primaryColor,
                      border: `1px solid ${a.primaryColor}`,
                    }}
                  >
                    {a.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{a.name}</span>
                    <span className="text-[10px] text-neutral-400">{a.species}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Alien Details Card */}
          <div className="flex-1 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 overflow-y-auto space-y-4">
            
            {/* Top Alien Identity Banner */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h4 className="text-2xl font-black italic tracking-wide" style={{ color: alien.primaryColor }}>
                  {alien.name}
                </h4>
                <span className="text-xs text-neutral-400 font-mono">
                  SPECIES: {alien.species} • HOMEWORLD: {alien.homeworld}
                </span>
              </div>
              <div 
                className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider"
                style={{ 
                  backgroundColor: `${alien.primaryColor}22`,
                  color: alien.primaryColor,
                  border: `1px solid ${alien.primaryColor}`,
                }}
              >
                {alien.element}
              </div>
            </div>

            <p className="text-xs text-neutral-300 italic">
              "{alien.quote}"
            </p>

            <p className="text-xs text-neutral-400 leading-relaxed">
              {alien.description}
            </p>

            {/* Combat Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-neutral-950/80 p-3 rounded-xl border border-neutral-800 text-xs">
              <div>
                <span className="text-neutral-500 text-[10px] font-mono block">HEALTH</span>
                <span className="text-emerald-400 font-black text-sm">{alien.stats.health}</span>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px] font-mono block">ATTACK</span>
                <span className="text-red-400 font-black text-sm">{alien.stats.attack} / 10</span>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px] font-mono block">DEFENSE</span>
                <span className="text-blue-400 font-black text-sm">{alien.stats.defense} / 10</span>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px] font-mono block">SPEED</span>
                <span className="text-cyan-400 font-black text-sm">{alien.stats.speed} / 10</span>
              </div>
            </div>

            {/* Complete Moves Breakdown */}
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block mb-2">
                COMPLETE MOVESET & ARSENAL
              </span>

              <div className="space-y-2 text-xs">
                {/* Specials */}
                <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-emerald-400 font-bold">{alien.special1.name} (Special 1)</span>
                    <span className="text-[10px] text-neutral-400 font-mono">Cost: {alien.special1.energyCost} Energy • Damage: {alien.special1.damage}</span>
                  </div>
                  <p className="text-neutral-400 text-[11px]">{alien.special1.description}</p>
                </div>

                <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-emerald-400 font-bold">{alien.special2.name} (Special 2)</span>
                    <span className="text-[10px] text-neutral-400 font-mono">Cost: {alien.special2.energyCost} Energy • Damage: {alien.special2.damage}</span>
                  </div>
                  <p className="text-neutral-400 text-[11px]">{alien.special2.description}</p>
                </div>

                <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-emerald-400 font-bold">{alien.special3.name} (Special 3)</span>
                    <span className="text-[10px] text-neutral-400 font-mono">Cost: {alien.special3.energyCost} Energy • Damage: {alien.special3.damage}</span>
                  </div>
                  <p className="text-neutral-400 text-[11px]">{alien.special3.description}</p>
                </div>

                {/* Ultimate */}
                <div className="bg-amber-950/40 p-3 rounded-lg border border-amber-600/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-amber-400 font-black">{alien.ultimate.name} (ULTIMATE ATTACK)</span>
                    <span className="text-[10px] text-amber-300 font-mono">Cost: 100 Energy • Damage: {alien.ultimate.damage}</span>
                  </div>
                  <p className="text-neutral-300 text-[11px]">{alien.ultimate.description}</p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 pt-3 mt-4 flex justify-end">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-lg text-xs tracking-wider uppercase transition shadow-md"
          >
            CLOSE CODEX
          </button>
        </div>

      </div>
    </div>
  );
};

