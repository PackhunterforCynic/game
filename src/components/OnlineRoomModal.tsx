import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { soundManager } from '../audio/soundManager';
import { multiplayerManager } from '../multiplayer/multiplayerManager';
import { X, Globe2, Copy, Check, Play, Link, Wifi, RefreshCw } from 'lucide-react';

export const OnlineRoomModal: React.FC = () => {
  const {
    showOnlineModal,
    setShowOnlineModal,
    setGameMode,
    setScreen,
    setMultiplayerRole,
  } = useGameStore();

  const [inputCode, setInputCode] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [role, setRole] = useState<'none' | 'host' | 'client'>('none');
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [ping, setPing] = useState(0);

  // Check URL query parameters for auto-join link (?room=OMNI-xxxx)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setInputCode(roomParam.toUpperCase());
      setShowOnlineModal(true);
    }
  }, []);

  // Listen for multiplayer status & packets
  useEffect(() => {
    const unsubStatus = multiplayerManager.onStatus((newStatus, pingMs) => {
      setStatus(newStatus);
      setPing(pingMs);
      if (newStatus === 'connected') {
        soundManager.playOmnitrixTransform();
      }
    });

    const unsubPacket = multiplayerManager.onPacket((packet) => {
      if (packet.type === 'START_BATTLE') {
        setShowOnlineModal(false);
        setGameMode('online-pvp');
        setScreen('CHARACTER_SELECT');
      }
    });

    return () => {
      unsubStatus();
      unsubPacket();
    };
  }, []);

  if (!showOnlineModal) return null;

  const handleClose = () => {
    soundManager.playOmnitrixSelect();
    multiplayerManager.cleanup();
    setRole('none');
    setStatus('disconnected');
    setShowOnlineModal(false);
  };

  const handleCreateRoom = async () => {
    soundManager.playOmnitrixActivate();
    setRole('host');
    setMultiplayerRole('host');
    const code = await multiplayerManager.createRoom();
    setRoomCode(code);
  };

  const handleJoinRoom = async () => {
    if (!inputCode.trim()) return;
    soundManager.playOmnitrixSelect();
    const code = inputCode.trim().toUpperCase();
    setRole('client');
    setMultiplayerRole('client');
    setRoomCode(code);
    await multiplayerManager.joinRoom(code);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?room=${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleProceedToCharacterSelect = () => {
    soundManager.playOmnitrixTransform();
    multiplayerManager.sendPacket('START_BATTLE', {});
    setShowOnlineModal(false);
    setGameMode('online-pvp');
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
              ONLINE 2-PLAYER ROOM
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
        {role === 'none' ? (
          <div className="space-y-5 text-xs">
            <p className="text-neutral-400 leading-relaxed">
              Play with a friend online anywhere in the world! Create a custom match room or join your friend's room using their room code or invite link.
            </p>

            {/* Create Room Button */}
            <button
              onClick={handleCreateRoom}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.4)] transition transform hover:scale-[1.02] active:scale-95"
            >
              <span>CREATE HOST ROOM</span>
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
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 uppercase font-mono"
              />
              <button
                onClick={handleJoinRoom}
                className="px-6 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 font-bold rounded-xl text-xs uppercase border border-neutral-700 transition"
              >
                JOIN
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-center">
            <span className="text-[11px] text-neutral-400 font-mono uppercase tracking-widest block">
              {role === 'host' ? 'HOSTING LOBBY' : 'JOINING LOBBY'}
            </span>

            {/* Room Code Display */}
            <div className="bg-neutral-900 border border-emerald-500/50 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-inner">
              <span className="text-xs text-neutral-400 font-mono">ROOM CODE</span>
              <span className="text-3xl font-black font-mono tracking-widest text-emerald-400">
                {roomCode}
              </span>

              {/* Action Buttons: Copy Code & Copy Link */}
              <div className="flex gap-2 mt-2 w-full">
                <button
                  onClick={handleCopyCode}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-bold transition border border-neutral-700"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'CODE COPIED' : 'COPY CODE'}</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 rounded-lg text-xs font-bold transition border border-neutral-700"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'LINK COPIED' : 'INVITE LINK'}</span>
                </button>
              </div>
            </div>

            {/* Connection Status Card */}
            <div className="p-3.5 bg-neutral-900/60 rounded-xl border border-neutral-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  status === 'connected' 
                    ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#00ff66]' 
                    : 'bg-amber-400 animate-ping'
                }`} />
                <span className="text-neutral-300 font-mono text-[11px]">
                  {status === 'connected' 
                    ? 'OPPONENT CONNECTED!' 
                    : role === 'host' 
                      ? 'WAITING FOR FRIEND TO JOIN...' 
                      : 'CONNECTING TO HOST...'}
                </span>
              </div>

              {status === 'connected' && (
                <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>{ping > 0 ? `${ping}ms` : '<10ms'}</span>
                </span>
              )}
            </div>

            {/* Host: Proceed to Character Select */}
            {role === 'host' && (
              <button
                onClick={handleProceedToCharacterSelect}
                disabled={status !== 'connected'}
                className={`w-full py-4 rounded-xl uppercase tracking-wider text-xs font-black flex items-center justify-center gap-2 transition transform ${
                  status === 'connected'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_25px_rgba(0,255,102,0.6)] cursor-pointer hover:scale-[1.02] active:scale-95'
                    : 'bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed opacity-60'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START CHARACTER SELECT</span>
              </button>
            )}

            {/* Client: Waiting for Host */}
            {role === 'client' && (
              <div className="p-3 bg-neutral-900/40 rounded-xl border border-neutral-800/60 text-neutral-400 font-mono text-[11px]">
                {status === 'connected' 
                  ? 'CONNECTED! WAITING FOR HOST TO START...' 
                  : 'ESTABLISHING WEBRTC PEER CONNECTION...'}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-neutral-800 pt-3 mt-5 flex justify-between items-center text-[10px] text-neutral-500 font-mono">
          <span>PEER-TO-PEER WEBRTC PROTOCOL</span>
          <span>LOW-LATENCY UDP</span>
        </div>

      </div>
    </div>
  );
};
