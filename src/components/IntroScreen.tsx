import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { soundManager } from '../audio/soundManager';
import { Zap, Play } from 'lucide-react';

export const IntroScreen: React.FC = () => {
  const setScreen = useGameStore((state) => state.setScreen);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background floating green energy particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 1.5,
      speedY: -Math.random() * 2 - 0.5,
      alpha: Math.random() * 0.7 + 0.3,
    }));

    const render = () => {
      ctx.fillStyle = 'rgba(2, 6, 4, 0.25)';
      ctx.fillRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.y < 0) p.y = h;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;

        ctx.fillStyle = `rgba(0, 255, 102, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  const handleStart = () => {
    soundManager.playOmnitrixActivate();
    soundManager.announce('BEN 10 ALIEN BATTLE ARENA');
    setScreen('MAIN_MENU');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      className="relative w-screen h-screen flex flex-col items-center justify-center bg-black overflow-hidden cursor-pointer select-none"
      onClick={handleStart}
    >
      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Futuristic Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #00ff66 1px, transparent 1px), linear-gradient(to bottom, #00ff66 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Omnitrix Core Dial Animation */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-28 h-28 md:w-44 md:h-44 mb-3 md:mb-8 flex items-center justify-center group">
          {/* Outer Rotating Silver Bezel */}
          <div className="absolute inset-0 rounded-full border-4 border-neutral-700 bg-neutral-900 shadow-2xl animate-spin" style={{ animationDuration: '20s' }}>
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-3 bg-neutral-500 rounded-sm" />
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-3 bg-neutral-500 rounded-sm" />
            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-3 h-4 bg-neutral-500 rounded-sm" />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-4 bg-neutral-500 rounded-sm" />
          </div>

          {/* Glowing Green Core */}
          <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-full bg-emerald-950/80 border-4 border-emerald-400 flex items-center justify-center shadow-[0_0_50px_rgba(0,255,102,0.8)] omnitrix-glow">
            {/* Hourglass Silhouette */}
            <div className="w-14 h-14 md:w-20 md:h-20 relative flex flex-col items-center justify-center">
              <div 
                className="w-10 md:w-16 h-5 md:h-8 bg-emerald-400"
                style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
              />
              <div 
                className="w-10 md:w-16 h-5 md:h-8 bg-emerald-400"
                style={{ clipPath: 'polygon(50% 0, 0 100%, 100% 100%)' }}
              />
            </div>
          </div>
        </div>

        {/* BEN 10 Title Logo */}
        <div className="text-center">
          <div className="inline-block bg-emerald-500 text-black font-black text-[10px] md:text-xs px-2.5 py-0.5 rounded tracking-widest uppercase mb-1 shadow-[0_0_15px_rgba(0,255,102,0.6)]">
            Galvan Prime Tournament
          </div>
          <h1 className="text-4xl md:text-7xl font-black italic tracking-wider text-white drop-shadow-[0_0_25px_rgba(0,255,102,0.9)] leading-none">
            BEN <span className="text-emerald-400">10</span>
          </h1>
          <h2 className="text-lg md:text-3xl font-bold tracking-widest text-emerald-300 mt-0.5 uppercase border-b-2 border-emerald-500 pb-1">
            Alien Battle Arena
          </h2>
        </div>

        {/* Start Prompt Button */}
        <div className="mt-4 md:mt-10 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2.5 px-6 md:px-8 py-2.5 md:py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-full text-xs md:text-sm tracking-wider shadow-[0_0_30px_rgba(0,255,102,0.7)] transition-all transform hover:scale-105 active:scale-95">
            <Play className="w-4 h-4 fill-black" />
            <span>TAP TO ACTIVATE</span>
          </div>
          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">or press enter to play</span>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-4 text-xs text-neutral-500 tracking-wider">
        INSPIRED BY FIGHTKARO • POWERED BY OMNITRIX V4.2
      </div>
    </div>
  );
};

