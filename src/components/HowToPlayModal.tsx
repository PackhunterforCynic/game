import React from 'react';
import { useGameStore } from '../store/gameStore';
import { soundManager } from '../audio/soundManager';
import { X, Keyboard, Smartphone, Swords, Shield, Zap, Sparkles } from 'lucide-react';

export const HowToPlayModal: React.FC = () => {
  const { showHowToPlay, setShowHowToPlay } = useGameStore();

  if (!showHowToPlay) return null;

  const handleClose = () => {
    soundManager.playOmnitrixSelect();
    setShowHowToPlay(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-neutral-950 border-2 border-emerald-500 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,255,102,0.4)] flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <Swords className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-black italic tracking-wide text-white">
              HOW TO PLAY & CONTROLS GUIDE
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-2 text-xs">
          
          {/* Keyboard Controls Section */}
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold tracking-wider uppercase mb-2">
              <Keyboard className="w-4 h-4" />
              <span>KEYBOARD CONTROLS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Player 1 Controls */}
              <div className="bg-neutral-900/80 p-3.5 rounded-xl border border-neutral-800">
                <span className="text-emerald-400 font-bold block mb-2 uppercase">PLAYER 1</span>
                <div className="space-y-1.5 font-mono text-neutral-300">
                  <div className="flex justify-between"><span>MOVE LEFT / RIGHT:</span><span className="text-white font-bold">A / D</span></div>
                  <div className="flex justify-between"><span>JUMP:</span><span className="text-white font-bold">W</span></div>
                  <div className="flex justify-between"><span>CROUCH:</span><span className="text-white font-bold">S</span></div>
                  <div className="flex justify-between"><span>PUNCH:</span><span className="text-emerald-400 font-bold">J</span></div>
                  <div className="flex justify-between"><span>KICK:</span><span className="text-emerald-400 font-bold">K</span></div>
                  <div className="flex justify-between"><span>GRAB:</span><span className="text-amber-400 font-bold">I</span></div>
                  <div className="flex justify-between"><span>SPECIAL ATTACK:</span><span className="text-cyan-400 font-bold">L</span></div>
                  <div className="flex justify-between"><span>ULTIMATE ATTACK:</span><span className="text-yellow-400 font-bold">SPACE</span></div>
                  <div className="flex justify-between"><span>BLOCK:</span><span className="text-blue-400 font-bold">SHIFT</span></div>
                  <div className="flex justify-between"><span>PAUSE:</span><span className="text-neutral-400">ESC</span></div>
                </div>
              </div>

              {/* Player 2 Controls (Local PvP) */}
              <div className="bg-neutral-900/80 p-3.5 rounded-xl border border-neutral-800">
                <span className="text-cyan-400 font-bold block mb-2 uppercase">PLAYER 2 (LOCAL DUEL)</span>
                <div className="space-y-1.5 font-mono text-neutral-300">
                  <div className="flex justify-between"><span>MOVE:</span><span className="text-white font-bold">ARROW KEYS</span></div>
                  <div className="flex justify-between"><span>PUNCH:</span><span className="text-cyan-400 font-bold">NUM 1 or U</span></div>
                  <div className="flex justify-between"><span>KICK:</span><span className="text-cyan-400 font-bold">NUM 2 or O</span></div>
                  <div className="flex justify-between"><span>GRAB:</span><span className="text-amber-400 font-bold">NUM 4 or Y</span></div>
                  <div className="flex justify-between"><span>SPECIAL:</span><span className="text-cyan-400 font-bold">NUM 5 or P</span></div>
                  <div className="flex justify-between"><span>ULTIMATE:</span><span className="text-yellow-400 font-bold">NUM 0 or ENTER</span></div>
                  <div className="flex justify-between"><span>BLOCK:</span><span className="text-blue-400 font-bold">NUM 3 or CTRL</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Combat Mechanics */}
          <div>
            <span className="text-emerald-400 font-bold tracking-wider uppercase block mb-2">
              CORE COMBAT MECHANICS
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>BLOCKING & GRABS</span>
                </div>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Hold Block (Shift) to reduce damage by 80% and prevent flinching. However, Grabs (I) are unblockable and shatter guarding opponents!
                </p>
              </div>

              <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-1.5 text-yellow-400 font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>OMNITRIX ENERGY & ULTIMATES</span>
                </div>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Landing and receiving hits builds the green Omnitrix energy gauge. At 100 energy, press Space to unleash cinematic alien devastation!
                </p>
              </div>

              <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>SPECIAL MOVES & COMBOS</span>
                </div>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Each alien has 3 special attacks (Projectiles, Dashes, and AoE bursts). Chain rapid punches into kicks and specials for huge combo damage!
                </p>
              </div>

              <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>MOBILE & TOUCH SCREEN</span>
                </div>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  Play seamlessly on phones and tablets with responsive on-screen virtual joystick and action diamond buttons!
                </p>
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
            GOT IT
          </button>
        </div>

      </div>
    </div>
  );
};

