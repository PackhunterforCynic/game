import React, { useRef, useState, useEffect } from 'react';
import { BattleScene } from '../game/scenes/BattleScene';
import { Shield, Zap, Sparkles, Hand, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileControlsProps {
  battleScene: BattleScene | null;
  p1Energy: number;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ battleScene, p1Energy }) => {
  if (!battleScene) return null;

  // Joystick touch tracking
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const activeTouchIdRef = useRef<number | null>(null);

  // Active button states for visual glow
  const [activeBtns, setActiveBtns] = useState<Record<string, boolean>>({});

  const vibrate = (ms = 15) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(ms);
      }
    } catch {
      // Ignore vibration error if restricted
    }
  };

  const setInputKey = (key: string, val: boolean) => {
    if (battleScene && battleScene.mobileInputP1) {
      (battleScene.mobileInputP1 as any)[key] = val;
    }
  };

  const handleActionDown = (key: string) => {
    vibrate(20);
    setActiveBtns(prev => ({ ...prev, [key]: true }));
    setInputKey(key, true);
  };

  const handleActionUp = (key: string) => {
    setActiveBtns(prev => ({ ...prev, [key]: false }));
    setInputKey(key, false);
  };

  // Virtual Joystick Multi-Touch Handler
  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    activeTouchIdRef.current = touch.identifier;
    setIsJoystickActive(true);
    updateJoystickPosition(touch.clientX, touch.clientY);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isJoystickActive) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchIdRef.current) {
        updateJoystickPosition(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchIdRef.current) {
        resetJoystick();
        break;
      }
    }
  };

  const updateJoystickPosition = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const maxRadius = rect.width / 2;
    const distance = Math.hypot(dx, dy);

    if (distance > maxRadius) {
      dx = (dx / distance) * maxRadius;
      dy = (dy / distance) * maxRadius;
    }

    setStickPos({ x: dx, y: dy });

    // Directional deadzone thresholds
    const deadzone = 14;
    const left = dx < -deadzone;
    const right = dx > deadzone;
    const up = dy < -deadzone;
    const down = dy > deadzone;

    setInputKey('left', left);
    setInputKey('right', right);
    setInputKey('up', up);
    setInputKey('down', down);
  };

  const resetJoystick = () => {
    setIsJoystickActive(false);
    activeTouchIdRef.current = null;
    setStickPos({ x: 0, y: 0 });
    setInputKey('left', false);
    setInputKey('right', false);
    setInputKey('up', false);
    setInputKey('down', false);
  };

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-30 flex justify-between items-end p-3 md:p-6 select-none overflow-hidden"
      style={{ touchAction: 'none' }}
    >
      
      {/* 1. LEFT: VIRTUAL ANALOG JOYSTICK & D-PAD */}
      <div className="pointer-events-auto flex items-center justify-center pb-2 pl-2">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
          onTouchCancel={resetJoystick}
          className={`relative w-36 h-36 rounded-full border-2 transition-colors flex items-center justify-center shadow-[0_0_25px_rgba(0,0,0,0.8)] backdrop-blur-md ${
            isJoystickActive 
              ? 'bg-emerald-950/70 border-emerald-400 shadow-[0_0_30px_rgba(0,255,102,0.4)]' 
              : 'bg-black/60 border-neutral-700/80'
          }`}
        >
          {/* Directional Guides / Crosshairs */}
          <div className="absolute inset-x-0 top-2 flex justify-center text-neutral-500 font-bold text-[10px]">
            <ChevronUp className="w-4 h-4 text-emerald-400/60" />
          </div>
          <div className="absolute inset-x-0 bottom-2 flex justify-center text-neutral-500 font-bold text-[10px]">
            <ChevronDown className="w-4 h-4 text-emerald-400/60" />
          </div>
          <div className="absolute inset-y-0 left-2 flex items-center text-neutral-500 font-bold text-[10px]">
            <ChevronLeft className="w-4 h-4 text-emerald-400/60" />
          </div>
          <div className="absolute inset-y-0 right-2 flex items-center text-neutral-500 font-bold text-[10px]">
            <ChevronRight className="w-4 h-4 text-emerald-400/60" />
          </div>

          {/* Center Movable Thumbstick Knob */}
          <div
            className={`w-16 h-16 rounded-full border-2 flex items-center justify-center shadow-2xl transition-transform duration-75 ${
              isJoystickActive 
                ? 'bg-emerald-500 text-black border-white shadow-[0_0_20px_#00ff66]' 
                : 'bg-neutral-800 text-neutral-400 border-neutral-600'
            }`}
            style={{
              transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
            }}
          >
            {/* Omnitrix center hourglass mark */}
            <div className="w-6 h-6 flex flex-col items-center justify-center pointer-events-none opacity-80">
              <div className="w-4 h-2 bg-current" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
              <div className="w-4 h-2 bg-current" style={{ clipPath: 'polygon(50% 0, 0 100%, 100% 100%)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. RIGHT: ARCADE ACTION DIAMOND BUTTONS */}
      <div className="pointer-events-auto flex flex-col items-end gap-2 pb-2 pr-2">
        
        {/* Top Mini Buttons: Grab & Guard */}
        <div className="flex gap-2.5 mr-3 mb-1">
          {/* Grab Button */}
          <button
            onTouchStart={() => handleActionDown('grab')}
            onTouchEnd={() => handleActionUp('grab')}
            onTouchCancel={() => handleActionUp('grab')}
            onMouseDown={() => handleActionDown('grab')}
            onMouseUp={() => handleActionUp('grab')}
            className={`w-12 h-12 rounded-full border flex flex-col items-center justify-center text-[10px] font-black uppercase shadow-lg transition active:scale-95 ${
              activeBtns.grab
                ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_15px_#f59e0b]'
                : 'bg-neutral-900/80 text-amber-300 border-neutral-700/80 backdrop-blur-sm'
            }`}
          >
            <Hand className="w-4 h-4 mb-0.5" />
            <span>GRAB</span>
          </button>

          {/* Block / Guard Button */}
          <button
            onTouchStart={() => handleActionDown('block')}
            onTouchEnd={() => handleActionUp('block')}
            onTouchCancel={() => handleActionUp('block')}
            onMouseDown={() => handleActionDown('block')}
            onMouseUp={() => handleActionUp('block')}
            className={`w-12 h-12 rounded-full border flex flex-col items-center justify-center text-[10px] font-black uppercase shadow-lg transition active:scale-95 ${
              activeBtns.block
                ? 'bg-blue-500 text-black border-blue-300 shadow-[0_0_15px_#3b82f6]'
                : 'bg-neutral-900/80 text-blue-300 border-neutral-700/80 backdrop-blur-sm'
            }`}
          >
            <Shield className="w-4 h-4 mb-0.5" />
            <span>GUARD</span>
          </button>
        </div>

        {/* Core Diamond: Punch & Kick & Special */}
        <div className="flex items-center gap-3">
          
          {/* Special Attack Button */}
          <button
            onTouchStart={() => handleActionDown('special1')}
            onTouchEnd={() => handleActionUp('special1')}
            onTouchCancel={() => handleActionUp('special1')}
            onMouseDown={() => handleActionDown('special1')}
            onMouseUp={() => handleActionUp('special1')}
            className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center shadow-lg transition active:scale-95 ${
              activeBtns.special1
                ? 'bg-cyan-400 text-black border-cyan-200 shadow-[0_0_20px_#00d2ff]'
                : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/80 backdrop-blur-sm'
            }`}
          >
            <Zap className="w-5 h-5 mb-0.5 fill-current" />
            <span className="text-[9px] font-black tracking-wider uppercase">SPECIAL</span>
          </button>

          {/* Punch Button */}
          <button
            onTouchStart={() => handleActionDown('punch')}
            onTouchEnd={() => handleActionUp('punch')}
            onTouchCancel={() => handleActionUp('punch')}
            onMouseDown={() => handleActionDown('punch')}
            onMouseUp={() => handleActionUp('punch')}
            className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center shadow-xl transition active:scale-95 ${
              activeBtns.punch
                ? 'bg-emerald-400 text-black border-white shadow-[0_0_25px_#00ff66]'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500 backdrop-blur-sm'
            }`}
          >
            <span className="text-sm font-black tracking-wider">PUNCH</span>
            <span className="text-[8px] text-emerald-400/80 font-mono">[ J ]</span>
          </button>

          {/* Kick Button */}
          <button
            onTouchStart={() => handleActionDown('kick')}
            onTouchEnd={() => handleActionUp('kick')}
            onTouchCancel={() => handleActionUp('kick')}
            onMouseDown={() => handleActionDown('kick')}
            onMouseUp={() => handleActionUp('kick')}
            className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center shadow-xl transition active:scale-95 ${
              activeBtns.kick
                ? 'bg-emerald-400 text-black border-white shadow-[0_0_25px_#00ff66]'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500 backdrop-blur-sm'
            }`}
          >
            <span className="text-sm font-black tracking-wider">KICK</span>
            <span className="text-[8px] text-emerald-400/80 font-mono">[ K ]</span>
          </button>
        </div>

        {/* Bottom Omnitrix Ultimate Power Button */}
        <div className="w-full flex justify-end mt-1 mr-2">
          <button
            onTouchStart={() => p1Energy >= 100 && handleActionDown('ultimate')}
            onTouchEnd={() => handleActionUp('ultimate')}
            onTouchCancel={() => handleActionUp('ultimate')}
            onMouseDown={() => p1Energy >= 100 && handleActionDown('ultimate')}
            onMouseUp={() => handleActionUp('ultimate')}
            disabled={p1Energy < 100}
            className={`h-14 px-6 rounded-full border-2 flex items-center justify-center gap-2 font-black uppercase text-xs tracking-wider shadow-2xl transition transform active:scale-95 ${
              p1Energy >= 100
                ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-black border-white shadow-[0_0_30px_#00ff66] animate-pulse cursor-pointer'
                : 'bg-neutral-900/80 text-neutral-500 border-neutral-800 opacity-60 cursor-not-allowed backdrop-blur-sm'
            }`}
          >
            <Sparkles className="w-5 h-5 fill-current" />
            <span>{p1Energy >= 100 ? 'OMNITRIX ULTIMATE (100%)' : `ULTIMATE (${p1Energy}%)`}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
