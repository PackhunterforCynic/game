import React, { useState, useEffect } from 'react';
import { Smartphone, Maximize, Check } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

export const MobileOrientationGuard: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if mobile screen and portrait
      const isMobile = window.innerWidth <= 900 || 'ontouchstart' in window;
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(isMobile && portrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', checkFullscreen);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      document.removeEventListener('fullscreenchange', checkFullscreen);
    };
  }, []);

  const toggleFullscreen = async () => {
    soundManager.playOmnitrixSelect();
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        if ((screen.orientation as any)?.lock) {
          try {
            await (screen.orientation as any).lock('landscape');
          } catch {
            // Orientation lock might be unsupported or rejected
          }
        }
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen not supported or blocked
    }
  };

  // If in portrait and not dismissed, show prompt overlay
  if (isPortrait && !dismissed) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none text-white">
        
        {/* Animated Rotating Phone Graphic */}
        <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/40 animate-ping" />
          <div className="w-20 h-20 rounded-2xl border-2 border-emerald-400 bg-emerald-950/60 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,102,0.6)] animate-pulse">
            <Smartphone className="w-10 h-10 text-emerald-400 rotate-90" />
          </div>
        </div>

        <h3 className="text-2xl font-black italic tracking-wider text-emerald-400 uppercase mb-2">
          ROTATE TO LANDSCAPE
        </h3>
        
        <p className="text-xs text-neutral-300 max-w-xs leading-relaxed mb-6 font-mono">
          Ben 10 Alien Battle Arena is built for widescreen landscape arcade combat. Rotate your phone for full virtual controls.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={toggleFullscreen}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.5)] transition"
          >
            <Maximize className="w-4 h-4" />
            <span>ENABLE FULLSCREEN LANDSCAPE</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl text-xs uppercase font-bold tracking-wider border border-neutral-800 transition"
          >
            CONTINUE ANYWAY
          </button>
        </div>

      </div>
    );
  }

  // Persistent subtle fullscreen toggle button for mobile landscape
  return (
    <button
      onClick={toggleFullscreen}
      title="Toggle Fullscreen Landscape"
      className="fixed top-3 right-3 z-40 p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-emerald-500 text-neutral-400 hover:text-emerald-400 transition shadow-lg backdrop-blur-sm hidden sm:flex items-center gap-1.5 text-[11px] font-mono"
    >
      <Maximize className="w-3.5 h-3.5" />
      <span className="hidden md:inline">{isFullscreen ? 'EXIT' : 'FULLSCREEN'}</span>
    </button>
  );
};

