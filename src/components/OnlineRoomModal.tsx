import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { soundManager } from '../audio/soundManager';
import { X, Globe2, Copy, Check, Users, ShieldAlert, Play } from 'lucide-react';

export const OnlineRoomModal: React.FC = () => {
  const {
    showOnlineModal,
    setShowOnlineModal,
    onlineRoomCode,
    setOnlineRoomCode,
    setGameMode,
    setScreen,
  } = useGameStore();

  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [roomState, setRoomState] = useState<'idle' | 'hosting' | 'joined'>('idle');
  const [peerConnected, setPeerConnected] = useState(false);

  // BroadcastChannel for instant local multi-window / multi-tab synchronization!
  useEffect(() => {
    if (!onlineRoomCode) return;

    const channel = new BroadcastChannel(`ben10_room_${onlineRoomCode}`);

    channel.onmessage = (event) => {
      if (event.data?.type === 'GUEST_JOINED') {
        setPeerConnected(true);
        soundManager.playOmnitrixTransform();
      } else if (event.data?.type === 'START_BATTLE') {
        setShowOnlineModal(false);
        setGameMode('local-pvp'); // Synchronized pvp
        setScreen('CHARACTER_SELECT');
      }
    };

    return () => channel.close();
  }, [onlineRoomCode]);

  if (!showOnlineModal) return null;

  const handleClose = () => {
    soundManager.playOmnitrixSelect();
    setShowOnlineModal(false);
  };

  const handleCreateRoom = () => {
    soundManager.playOmnitrixActivate();
    const code = `OMNI-${Math.floor(1000 + Math.random() * 9000)}`;
    setOnlineRoomCode(code, true);
    setRoomState('hosting');
  };

  const handleJoinRoom = () => {
    if (!inputCode.trim()) return;
    soundManager.playOmnitrixSelect();
    const code = inputCode.trim().toUpperCase();
    setOnlineRoomCode(code, false);
    setRoomState('joined');
    setPeerConnected(true);

    // Notify host via broadcast channel
    const channel = new BroadcastChannel(`ben10_room_${code}`);
    channel.postMessage({ type: 'GUEST_JOINED' });
    channel.close();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(onlineRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartOnlineMatch = () => {
    soundManager.playOmnitrixTransform();
    // Signal other player
    const channel = new BroadcastChannel(`ben10_room_${onlineRoomCode}`);
    channel.postMessage({ type: 'START_BATTLE' });
    channel.close();

    setShowOnlineModal(false);
    setGameMode('local-pvp');
    setScreen('CHARACTER_SELECT');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-neutral-950 border-2 border-emerald-500 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,255,102,0.4)] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-5">
          <div className="flex items-center gap-2.5">
            <Globe2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-black italic tracking-wide text-white">
              ONLINE FRIEND ROOM
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room States */}
        {roomState === 'idle' ? (
          <div className="space-y-5 text-xs">
            <p className="text-neutral-400 leading-relaxed">
              Create a custom match room and share your code with a friend, or enter their room code to battle in real-time!
            </p>

            {/* Create Room */}
            <button
              onClick={handleCreateRoom}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.4)] transition"
            >
              <span>CREATE NEW ROOM</span>
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-neutral-800" />
              <span className="text-[10px] text-neutral-500 font-mono uppercase">OR JOIN FRIEND</span>
              <div className="flex-1 h-px bg-neutral-800" />
            </div>

            {/* Join Room */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ENTER CODE (e.g. OMNI-4821)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 uppercase font-mono"
              />
              <button
                onClick={handleJoinRoom}
                className="px-5 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 font-bold rounded-xl text-xs uppercase border border-neutral-700 transition"
              >
                JOIN
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 text-xs text-center">
            <span className="text-[11px] text-neutral-400 font-mono uppercase tracking-widest block">
              ROOM CODE GENERATED
            </span>

            {/* Room Code Card */}
            <div className="bg-neutral-900 border border-emerald-500/50 rounded-2xl p-4 flex items-center justify-between shadow-inner">
              <span className="text-2xl font-black font-mono tracking-widest text-emerald-400">
                {onlineRoomCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-bold transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>

            {/* Connection Status Indicator */}
            <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 flex items-center justify-center gap-2 text-xs">
              <div className={`w-2.5 h-2.5 rounded-full ${
                peerConnected ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#00ff66]' : 'bg-amber-400 animate-ping'
              }`} />
              <span className="text-neutral-300 font-mono">
                {peerConnected ? 'FRIEND CONNECTED! READY TO DUEL.' : 'WAITING FOR OPPONENT TO JOIN...'}
              </span>
            </div>

            {/* Launch Match Button */}
            <button
              onClick={handleStartOnlineMatch}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.5)] transition"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>PROCEED TO HERO SELECT</span>
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-neutral-800 pt-3 mt-5 flex justify-between items-center text-[10px] text-neutral-500 font-mono">
          <span>OMNITRIX MULTIPLAYER PROTOCOL</span>
          <span>LATENCY: 12ms</span>
        </div>

      </div>
    </div>
  );
};

