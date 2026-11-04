import React from 'react';
import { BattleScene } from '../game/scenes/BattleScene';
import { Shield, Zap, Sparkles } from 'lucide-react';

interface MobileControlsProps {
  battleScene: BattleScene | null;
  p1Energy: number;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ battleScene, p1Energy }) => {
  if (!battleScene) return null;

  const setInput = (key: string, val: boolean) => {
    if (battleScene.mobileInputP1) {
      (battleScene.mobileInputP1 as any)[key] = val;
    }
  };

  const handleButtonDown = (key: string) => {
    setInput(key, true);
  };

  const handleButtonUp = (key: string) => {
    setInput(key, false);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex justify-between items-end p-4 md:hidden select-none">
      
      {/* Left D-Pad: Left, Right, Jump, Crouch */}
      <div className="pointer-events-auto flex flex-col items-center gap-1.5 pb-2">
        {/* Jump Button */}
        <button
          onTouchStart={() => handleButtonDown('up')}
          onTouchEnd={() => handleButtonUp('up')}
          onMouseDown={() => handleButtonDown('up')}
          onMouseUp={() => handleButtonUp('up')}
          className="w-14 h-12 bg-neutral-900/80 active:bg-emerald-500 active:text-black border border-neutral-700 active:border-emerald-400 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
        >
          ▲
        </button>

        {/* Left & Right Buttons */}
        <div className="flex gap-4">
          <button
            onTouchStart={() => handleButtonDown('left')}
            onTouchEnd={() => handleButtonUp('left')}
            onMouseDown={() => handleButtonDown('left')}
            onMouseUp={() => handleButtonUp('left')}
            className="w-14 h-12 bg-neutral-900/80 active:bg-emerald-500 active:text-black border border-neutral-700 active:border-emerald-400 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
          >
            ◀
          </button>
          <button
            onTouchStart={() => handleButtonDown('right')}
            onTouchEnd={() => handleButtonUp('right')}
            onMouseDown={() => handleButtonDown('right')}
            onMouseUp={() => handleButtonUp('right')}
            className="w-14 h-12 bg-neutral-900/80 active:bg-emerald-500 active:text-black border border-neutral-700 active:border-emerald-400 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
          >
            ▶
          </button>
        </div>

        {/* Crouch Button */}
        <button
          onTouchStart={() => handleButtonDown('down')}
          onTouchEnd={() => handleButtonUp('down')}
          onMouseDown={() => handleButtonDown('down')}
          onMouseUp={() => handleButtonUp('down')}
          className="w-14 h-12 bg-neutral-900/80 active:bg-emerald-500 active:text-black border border-neutral-700 active:border-emerald-400 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
        >
          ▼
        </button>
      </div>

      {/* Right Action Diamond Buttons: Punch, Kick, Grab, Block, Special, Ultimate */}
      <div className="pointer-events-auto flex flex-col items-end gap-2 pb-2">
        {/* Row 1: Grab & Block */}
        <div className="flex gap-2">
          <button
            onTouchStart={() => handleButtonDown('grab')}
            onTouchEnd={() => handleButtonUp('grab')}
            onMouseDown={() => handleButtonDown('grab')}
            onMouseUp={() => handleButtonUp('grab')}
            className="w-12 h-12 bg-neutral-900/80 active:bg-amber-500 active:text-black border border-neutral-700 rounded-full flex flex-col items-center justify-center text-xs font-bold text-amber-300 shadow-md"
          >
            <span>GRAB</span>
          </button>

          <button
            onTouchStart={() => handleButtonDown('block')}
            onTouchEnd={() => handleButtonUp('block')}
            onMouseDown={() => handleButtonDown('block')}
            onMouseUp={() => handleButtonUp('block')}
            className="w-12 h-12 bg-neutral-900/80 active:bg-blue-500 active:text-black border border-neutral-700 rounded-full flex flex-col items-center justify-center text-xs font-bold text-blue-300 shadow-md"
          >
            <Shield className="w-4 h-4 mb-0.5" />
            <span className="text-[9px]">BLOCK</span>
          </button>
        </div>

        {/* Row 2: Punch & Kick */}
        <div className="flex gap-2.5">
          <button
            onTouchStart={() => handleButtonDown('punch')}
            onTouchEnd={() => handleButtonUp('punch')}
            onMouseDown={() => handleButtonDown('punch')}
            onMouseUp={() => handleButtonUp('punch')}
            className="w-14 h-14 bg-neutral-900/90 active:bg-emerald-500 active:text-black border-2 border-emerald-500/80 rounded-2xl flex flex-col items-center justify-center font-black text-emerald-400 shadow-lg"
          >
            <span className="text-sm">PUNCH</span>
            <span className="text-[8px] text-neutral-400 font-normal">[J]</span>
          </button>

          <button
            onTouchStart={() => handleButtonDown('kick')}
            onTouchEnd={() => handleButtonUp('kick')}
            onMouseDown={() => handleButtonDown('kick')}
            onMouseUp={() => handleButtonUp('kick')}
            className="w-14 h-14 bg-neutral-900/90 active:bg-emerald-500 active:text-black border-2 border-emerald-500/80 rounded-2xl flex flex-col items-center justify-center font-black text-emerald-400 shadow-lg"
          >
            <span className="text-sm">KICK</span>
            <span className="text-[8px] text-neutral-400 font-normal">[K]</span>
          </button>
        </div>

        {/* Row 3: Special & Ultimate */}
        <div className="flex gap-2.5 items-center">
          <button
            onTouchStart={() => handleButtonDown('special1')}
            onTouchEnd={() => handleButtonUp('special1')}
            onMouseDown={() => handleButtonDown('special1')}
            onMouseUp={() => handleButtonUp('special1')}
            className="w-14 h-14 bg-cyan-950/80 active:bg-cyan-400 active:text-black border-2 border-cyan-400 rounded-2xl flex flex-col items-center justify-center font-black text-cyan-300 shadow-lg"
          >
            <Zap className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">SPECIAL</span>
          </button>

          <button
            onTouchStart={() => handleButtonDown('ultimate')}
            onTouchEnd={() => handleButtonUp('ultimate')}
            onMouseDown={() => handleButtonDown('ultimate')}
            onMouseUp={() => handleButtonUp('ultimate')}
            disabled={p1Energy < 100}
            className={`w-16 h-16 rounded-full flex flex-col items-center justify-center font-black shadow-2xl transition transform active:scale-95 ${
              p1Energy >= 100
                ? 'bg-emerald-500 text-black border-4 border-white animate-pulse shadow-[0_0_25px_rgba(0,255,102,1)] cursor-pointer'
                : 'bg-neutral-900 text-neutral-600 border border-neutral-800 opacity-60 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-black">ULTIMATE</span>
          </button>
        </div>

      </div>
    </div>
  );
};

