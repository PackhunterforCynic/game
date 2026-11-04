import React from 'react';
import { useGameStore } from '../store/gameStore';
import { soundManager } from '../audio/soundManager';
import { X, Volume2, VolumeX, Cpu, ShieldCheck } from 'lucide-react';
import { AIDifficulty } from '../types/game';

export const SettingsModal: React.FC = () => {
  const {
    showSettings,
    setShowSettings,
    aiDifficulty,
    setDifficulty,
    audioSettings,
    updateAudioSettings,
  } = useGameStore();

  if (!showSettings) return null;

  const handleClose = () => {
    soundManager.playOmnitrixSelect();
    setShowSettings(false);
  };

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    updateAudioSettings({ sfxVolume: val });
    soundManager.setVolumes(val, audioSettings.musicVolume, audioSettings.muted);
  };

  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    updateAudioSettings({ musicVolume: val });
    soundManager.setVolumes(audioSettings.sfxVolume, val, audioSettings.muted);
  };

  const handleToggleMute = () => {
    const nextMute = !audioSettings.muted;
    updateAudioSettings({ muted: nextMute });
    soundManager.setVolumes(audioSettings.sfxVolume, audioSettings.musicVolume, nextMute);
  };

  const handleDifficulty = (diff: AIDifficulty) => {
    soundManager.playOmnitrixSelect();
    setDifficulty(diff);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-neutral-950 border-2 border-emerald-500 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,255,102,0.4)] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-5">
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl font-black italic tracking-wide text-white">
              GAME & AUDIO SETTINGS
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 text-xs">
          
          {/* Audio Controls */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span>AUDIO LEVELS</span>
              </span>
              <button
                onClick={handleToggleMute}
                className={`px-3 py-1 rounded text-[11px] font-bold uppercase transition ${
                  audioSettings.muted ? 'bg-red-950 text-red-400 border border-red-700' : 'bg-neutral-800 text-neutral-300'
                }`}
              >
                {audioSettings.muted ? 'MUTED' : 'UNMUTED'}
              </button>
            </div>

            {/* SFX Volume */}
            <div>
              <div className="flex justify-between text-neutral-300 mb-1">
                <span>SOUND EFFECTS VOLUME</span>
                <span className="font-mono">{Math.round(audioSettings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioSettings.sfxVolume}
                onChange={handleSfxChange}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Music Volume */}
            <div>
              <div className="flex justify-between text-neutral-300 mb-1">
                <span>SYNTH BATTLE MUSIC VOLUME</span>
                <span className="font-mono">{Math.round(audioSettings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioSettings.musicVolume}
                onChange={handleMusicChange}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* CPU AI Difficulty */}
          <div className="border-t border-neutral-900 pt-4">
            <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4" />
              <span>CPU AI DIFFICULTY</span>
            </span>

            <div className="grid grid-cols-3 gap-2.5">
              {(['easy', 'normal', 'hard'] as AIDifficulty[]).map((diff) => {
                const isSelected = aiDifficulty === diff;
                return (
                  <button
                    key={diff}
                    onClick={() => handleDifficulty(diff)}
                    className={`py-3 rounded-xl font-bold uppercase tracking-wider text-xs border transition ${
                      isSelected
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(0,255,102,0.5)]'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-600'
                    }`}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-neutral-800 pt-4 mt-6 flex justify-end">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-lg text-xs tracking-wider uppercase transition shadow-md"
          >
            SAVE & CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};

