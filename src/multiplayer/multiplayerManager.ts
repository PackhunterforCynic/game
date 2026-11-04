import Peer, { DataConnection } from 'peerjs';
import { AlienId, ArenaId, FighterInputState, MultiplayerRole, NetPacket, OnlineConnectionStatus } from '../types/game';

type PacketHandler = (packet: NetPacket) => void;
type StatusHandler = (status: OnlineConnectionStatus, pingMs: number) => void;

class MultiplayerManager {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;
  private broadcastChannel: BroadcastChannel | null = null;

  public role: MultiplayerRole = 'none';
  public roomCode: string = '';
  public status: OnlineConnectionStatus = 'disconnected';
  public pingMs: number = 0;

  private packetHandlers: Set<PacketHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private pingInterval: any = null;
  private lastPingSentAt: number = 0;

  public onPacket(handler: PacketHandler) {
    this.packetHandlers.add(handler);
    return () => {
      this.packetHandlers.delete(handler);
    };
  }

  public onStatus(handler: StatusHandler) {
    this.statusHandlers.add(handler);
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  private notifyStatus(status: OnlineConnectionStatus) {
    this.status = status;
    this.statusHandlers.forEach(h => h(status, this.pingMs));
  }

  private notifyPacket(packet: NetPacket) {
    this.packetHandlers.forEach(h => h(packet));
  }

  // 1. HOST: CREATE ROOM
  public async createRoom(): Promise<string> {
    this.cleanup();
    this.role = 'host';
    const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
    this.roomCode = `OMNI-${randomDigits}`;
    const peerId = `ben10-arena-${randomDigits}`;

    this.notifyStatus('connecting');

    // Setup BroadcastChannel for local fallback / testing
    this.setupBroadcastChannel(this.roomCode);

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(peerId, {
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' },
            ],
          },
        });

        this.peer.on('open', (id) => {
          this.notifyStatus('connecting'); // Waiting for client to connect
          resolve(this.roomCode);
        });

        this.peer.on('connection', (conn) => {
          this.setupConnection(conn);
        });

        this.peer.on('error', (err) => {
          // If ID is taken or server issue, still allow BroadcastChannel fallback
          console.warn('[PeerJS] Notice:', err);
          resolve(this.roomCode);
        });
      } catch (e) {
        resolve(this.roomCode);
      }
    });
  }

  // 2. CLIENT: JOIN ROOM
  public async joinRoom(code: string): Promise<boolean> {
    this.cleanup();
    this.role = 'client';
    const normalizedCode = code.trim().toUpperCase();
    this.roomCode = normalizedCode;
    const digitsOnly = normalizedCode.replace(/[^0-9]/g, '');
    const targetPeerId = `ben10-arena-${digitsOnly}`;

    this.notifyStatus('connecting');

    // Setup BroadcastChannel
    this.setupBroadcastChannel(this.roomCode);
    this.broadcastChannel?.postMessage({
      type: 'BROADCAST_JOIN',
      roomCode: this.roomCode,
    });

    return new Promise((resolve) => {
      try {
        this.peer = new Peer({
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' },
            ],
          },
        });

        this.peer.on('open', () => {
          const conn = this.peer!.connect(targetPeerId, {
            reliable: false, // low latency UDP mode for fighting game
          });
          this.setupConnection(conn);
          resolve(true);
        });

        this.peer.on('error', () => {
          resolve(true); // BroadcastChannel remains active
        });
      } catch {
        resolve(true);
      }
    });
  }

  private setupConnection(conn: DataConnection) {
    this.connection = conn;

    conn.on('open', () => {
      this.notifyStatus('connected');
      this.startPingMonitor();
    });

    conn.on('data', (data: any) => {
      this.handleIncomingData(data);
    });

    conn.on('close', () => {
      this.notifyStatus('disconnected');
    });

    conn.on('error', () => {
      this.notifyStatus('error');
    });
  }

  private setupBroadcastChannel(code: string) {
    if (typeof BroadcastChannel === 'undefined') return;
    this.broadcastChannel = new BroadcastChannel(`ben10_net_${code}`);

    this.broadcastChannel.onmessage = (event) => {
      const data = event.data;
      if (!data) return;

      if (data.type === 'BROADCAST_JOIN' && this.role === 'host') {
        this.notifyStatus('connected');
        this.sendPacket('PING', { time: Date.now() });
      } else if (data.netPacket) {
        this.handleIncomingData(data.netPacket);
      }
    };
  }

  private handleIncomingData(packet: NetPacket) {
    if (!packet || !packet.type) return;

    if (packet.type === 'PING') {
      this.sendPacket('PONG', { time: packet.payload.time });
      return;
    }

    if (packet.type === 'PONG') {
      const roundTrip = Date.now() - packet.payload.time;
      this.pingMs = Math.round(roundTrip / 2);
      this.notifyStatus('connected');
      return;
    }

    this.notifyPacket(packet);
  }

  private startPingMonitor() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.pingInterval = setInterval(() => {
      if (this.status === 'connected') {
        this.lastPingSentAt = Date.now();
        this.sendPacket('PING', { time: this.lastPingSentAt });
      }
    }, 1500);
  }

  // 3. SEND PACKETS (Sends over WebRTC DataConnection + BroadcastChannel)
  public sendPacket(type: NetPacket['type'], payload: any) {
    const packet: NetPacket = {
      type,
      sender: this.role === 'host' ? 'host' : 'client',
      payload,
      timestamp: Date.now(),
    };

    if (this.connection && this.connection.open) {
      this.connection.send(packet);
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ netPacket: packet });
    }
  }

  // Convenience methods
  public sendSelection(character: AlienId) {
    this.sendPacket('SELECTION', { character });
  }

  public sendLockIn(ready: boolean) {
    this.sendPacket('LOCK_IN', { ready });
  }

  public sendArena(arena: ArenaId) {
    this.sendPacket('ARENA', { arena });
  }

  public sendStartBattle() {
    this.sendPacket('START_BATTLE', {});
  }

  public sendInput(input: FighterInputState) {
    this.sendPacket('INPUT', { input });
  }

  public sendStateSync(state: {
    p1Hp: number;
    p1Energy: number;
    p1X: number;
    p1Y: number;
    p1State: string;
    p2Hp: number;
    p2Energy: number;
    p2X: number;
    p2Y: number;
    p2State: string;
    roundTimer: number;
  }) {
    this.sendPacket('STATE_SYNC', state);
  }

  public cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    this.role = 'none';
    this.roomCode = '';
    this.status = 'disconnected';
    this.pingMs = 0;
  }
}

export const multiplayerManager = new MultiplayerManager();
