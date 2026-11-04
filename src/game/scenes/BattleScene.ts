import Phaser from 'phaser';
import { useGameStore } from '../../store/gameStore';
import { Fighter } from '../entities/Fighter';
import { Projectile } from '../entities/Projectile';
import { ParticleEffectsManager } from '../entities/ParticleEffects';
import { FighterAI } from '../ai/fighterAI';
import { createArenaBackground } from '../arenas/arenaRenderer';
import { soundManager } from '../../audio/soundManager';
import { FighterInputState } from '../../types/game';

export class BattleScene extends Phaser.Scene {
  public player1!: Fighter;
  public player2!: Fighter;
  public fighterAI: FighterAI | null = null;
  public particleManager!: ParticleEffectsManager;
  private projectiles: Projectile[] = [];

  // Round & Timer
  public roundTime: number = 99;
  private timerEvent: Phaser.Time.TimerEvent | null = null;
  private roundInProgress: boolean = false;
  private groundPlatform!: Phaser.GameObjects.Rectangle;

  // Key Mappings
  private p1Keys: any = {};
  private p2Keys: any = {};

  // Mobile virtual input overrides
  public mobileInputP1: Partial<FighterInputState> = {};

  constructor() {
    super({ key: 'BattleScene' });
  }

  create() {
    const store = useGameStore.getState();
    const width = this.scale.width;
    const height = this.scale.height;

    this.particleManager = new ParticleEffectsManager(this);

    // 1. Render Arena Background & Atmospheric Visuals
    createArenaBackground(this, store.selectedArena);

    // 2. Arena Ground Collision Platform
    const floorY = height - 90;
    this.groundPlatform = this.add.rectangle(width / 2, floorY + 45, width, 90, 0x000000, 0);
    this.physics.add.existing(this.groundPlatform, true);

    // 3. Spawn Fighters
    const p1X = width * 0.28;
    const p2X = width * 0.72;
    const spawnY = floorY - 60;

    this.player1 = new Fighter(this, p1X, spawnY, store.player1Character, 1, this.particleManager);
    this.player2 = new Fighter(this, p2X, spawnY, store.player2Character, 2, this.particleManager);

    this.player1.setOpponent(this.player2);
    this.player2.setOpponent(this.player1);

    // Collisions with floor platform
    this.physics.add.collider(this.player1, this.groundPlatform);
    this.physics.add.collider(this.player2, this.groundPlatform);

    // Optional collision between fighters so they can't simply walk through each other
    this.physics.add.collider(this.player1, this.player2);

    // 4. Setup AI if vs-cpu
    if (store.gameMode === 'vs-cpu') {
      this.fighterAI = new FighterAI(this.player2, this.player1, store.aiDifficulty);
    } else {
      this.fighterAI = null;
    }

    // 5. Setup Projectile listener
    this.events.on('spawn_projectile', this.spawnProjectile, this);

    // 6. Setup Keyboard Input Controls
    this.setupKeyboardControls();

    // 7. Start Round Sequence
    this.startRoundSequence();

    // 8. Start procedural battle music
    soundManager.startBattleMusic(store.selectedArena);
  }

  private setupKeyboardControls() {
    if (!this.input.keyboard) return;

    // Player 1 Keys: W, A, S, D, J, K, I, L, Space, Shift
    this.p1Keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      punch: Phaser.Input.Keyboard.KeyCodes.J,
      kick: Phaser.Input.Keyboard.KeyCodes.K,
      grab: Phaser.Input.Keyboard.KeyCodes.I,
      special: Phaser.Input.Keyboard.KeyCodes.L,
      ultimate: Phaser.Input.Keyboard.KeyCodes.SPACE,
      block: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    });

    // Player 2 Keys (for Local 2P): Arrows, NumPad 1,2,3,5 / U,O,P
    this.p2Keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      punch: Phaser.Input.Keyboard.KeyCodes.NUMPAD_ONE,
      kick: Phaser.Input.Keyboard.KeyCodes.NUMPAD_TWO,
      grab: Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR,
      special: Phaser.Input.Keyboard.KeyCodes.NUMPAD_FIVE,
      ultimate: Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO,
      block: Phaser.Input.Keyboard.KeyCodes.NUMPAD_THREE,
      // Fallback keys if no numpad
      punchAlt: Phaser.Input.Keyboard.KeyCodes.U,
      kickAlt: Phaser.Input.Keyboard.KeyCodes.O,
      grabAlt: Phaser.Input.Keyboard.KeyCodes.Y,
      specialAlt: Phaser.Input.Keyboard.KeyCodes.P,
      ultimateAlt: Phaser.Input.Keyboard.KeyCodes.ENTER,
      blockAlt: Phaser.Input.Keyboard.KeyCodes.C,
    });
  }

  private startRoundSequence() {
    const store = useGameStore.getState();
    this.roundInProgress = false;
    this.roundTime = 99;

    const roundNum = store.currentRound;
    const roundAnnouncement = roundNum === 3 ? 'FINAL ROUND' : `ROUND ${roundNum}`;

    // Announce Round
    soundManager.announce(roundAnnouncement);

    this.time.delayedCall(1600, () => {
      soundManager.announce('FIGHT!');
      this.roundInProgress = true;

      // Start 1-second countdown timer
      if (this.timerEvent) this.timerEvent.destroy();
      this.timerEvent = this.time.addEvent({
        delay: 1000,
        callback: this.tickTimer,
        callbackScope: this,
        loop: true,
      });
    });
  }

  private tickTimer() {
    if (!this.roundInProgress) return;
    this.roundTime--;

    if (this.roundTime <= 0) {
      this.roundTime = 0;
      this.handleTimeOver();
    }
  }

  private spawnProjectile(data: {
    x: number;
    y: number;
    owner: 1 | 2;
    direction: 1 | -1;
    speed: number;
    damage: number;
    colorHex: string;
    effectType: string;
  }) {
    const p = new Projectile(
      this,
      data.x,
      data.y,
      data.owner,
      data.direction,
      data.speed,
      data.damage,
      data.colorHex,
      data.effectType
    );
    this.projectiles.push(p);

    const targetFighter = data.owner === 1 ? this.player2 : this.player1;
    const attackerFighter = data.owner === 1 ? this.player1 : this.player2;

    this.physics.add.overlap(p, targetFighter, () => {
      if (!p.isExpired) {
        p.destroyProjectile();
        targetFighter.receiveHit({
          id: 'projectile_hit',
          name: 'Energy Blast',
          type: 'special',
          damage: p.damage,
          energyCost: 0,
          cooldownMs: 0,
          range: 0,
          knockback: { x: 180, y: -90 },
          hitStopMs: 90,
          description: '',
          effectType: p.effectType as any,
        }, attackerFighter);
      }
    });
  }

  update(time: number, delta: number) {
    if (!this.roundInProgress) return;

    // Update Fighters
    this.player1.update(time, delta);
    this.player2.update(time, delta);

    // Update Projectiles
    this.projectiles = this.projectiles.filter(p => {
      if (p.isExpired) return false;
      p.update(delta);
      return !p.isExpired;
    });

    // Handle Player 1 Input (Combines keyboard and mobile controls)
    const p1Input = this.gatherP1Input();
    this.player1.handleInput(p1Input, delta);

    // Handle Player 2 Input (AI or Local Player 2)
    const store = useGameStore.getState();
    if (store.gameMode === 'vs-cpu' && this.fighterAI) {
      const aiInput = this.fighterAI.update(delta);
      this.player2.handleInput(aiInput, delta);
    } else {
      const p2Input = this.gatherP2Input();
      this.player2.handleInput(p2Input, delta);
    }

    // Check Round Finish condition (HP <= 0)
    if (this.player1.currentHealth <= 0 || this.player2.currentHealth <= 0) {
      this.handleRoundFinish();
    }
  }

  private gatherP1Input(): FighterInputState {
    const k = this.p1Keys;
    const m = this.mobileInputP1;

    // Cycle through specials (L triggers sp1, sp2 or sp3 depending on energy level)
    const specialPressed = Phaser.Input.Keyboard.JustDown(k.special) || !!m.special1;
    let sp1 = false;
    let sp2 = false;
    let sp3 = false;

    if (specialPressed) {
      if (this.player1.energy >= 50) sp3 = true;
      else if (this.player1.energy >= 35) sp2 = true;
      else sp1 = true;
    }

    return {
      left: k.left?.isDown || !!m.left,
      right: k.right?.isDown || !!m.right,
      up: k.up?.isDown || !!m.up,
      down: k.down?.isDown || !!m.down,
      punch: Phaser.Input.Keyboard.JustDown(k.punch) || !!m.punch,
      kick: Phaser.Input.Keyboard.JustDown(k.kick) || !!m.kick,
      grab: Phaser.Input.Keyboard.JustDown(k.grab) || !!m.grab,
      special1: sp1,
      special2: sp2,
      special3: sp3,
      ultimate: Phaser.Input.Keyboard.JustDown(k.ultimate) || !!m.ultimate,
      block: k.block?.isDown || !!m.block,
    };
  }

  private gatherP2Input(): FighterInputState {
    const k = this.p2Keys;
    const isSpecial = Phaser.Input.Keyboard.JustDown(k.special) || Phaser.Input.Keyboard.JustDown(k.specialAlt);
    let sp1 = false;
    let sp2 = false;
    let sp3 = false;

    if (isSpecial) {
      if (this.player2.energy >= 50) sp3 = true;
      else if (this.player2.energy >= 35) sp2 = true;
      else sp1 = true;
    }

    return {
      left: k.left?.isDown,
      right: k.right?.isDown,
      up: k.up?.isDown,
      down: k.down?.isDown,
      punch: Phaser.Input.Keyboard.JustDown(k.punch) || Phaser.Input.Keyboard.JustDown(k.punchAlt),
      kick: Phaser.Input.Keyboard.JustDown(k.kick) || Phaser.Input.Keyboard.JustDown(k.kickAlt),
      grab: Phaser.Input.Keyboard.JustDown(k.grab) || Phaser.Input.Keyboard.JustDown(k.grabAlt),
      special1: sp1,
      special2: sp2,
      special3: sp3,
      ultimate: Phaser.Input.Keyboard.JustDown(k.ultimate) || Phaser.Input.Keyboard.JustDown(k.ultimateAlt),
      block: k.block?.isDown || k.blockAlt?.isDown,
    };
  }

  private handleTimeOver() {
    this.roundInProgress = false;
    soundManager.announce('TIME OVER!');

    // Compare HP
    if (this.player1.currentHealth > this.player2.currentHealth) {
      this.concludeRound(1);
    } else {
      this.concludeRound(2);
    }
  }

  private handleRoundFinish() {
    this.roundInProgress = false;
    if (this.timerEvent) this.timerEvent.destroy();

    const winner: 1 | 2 = this.player1.currentHealth > 0 ? 1 : 2;
    this.concludeRound(winner);
  }

  private concludeRound(winner: 1 | 2) {
    const store = useGameStore.getState();

    if (winner === 1) {
      this.player1.celebrateVictory();
      this.player2.knockout();
    } else {
      this.player2.celebrateVictory();
      this.player1.knockout();
    }

    const { matchOver, winner: matchWinner } = store.recordRoundWinner(winner);

    this.time.delayedCall(3000, () => {
      if (matchOver && matchWinner) {
        soundManager.stopBattleMusic();
        const winnerChar = matchWinner === 1 ? store.player1Character : store.player2Character;
        soundManager.announce(`${winnerChar} WINS!`);

        store.finishMatch({
          winner: matchWinner,
          player1Character: store.player1Character,
          player2Character: store.player2Character,
          durationSeconds: 99 - this.roundTime,
          p1DamageDealt: this.player1.totalDamageDealt,
          p2DamageDealt: this.player2.totalDamageDealt,
          p1MaxCombo: this.player1.maxCombo,
          p2MaxCombo: this.player2.maxCombo,
          p1SpecialsUsed: this.player1.specialsUsed,
          p2SpecialsUsed: this.player2.specialsUsed,
          p1UltimatesUsed: this.player1.ultimatesUsed,
          p2UltimatesUsed: this.player2.ultimatesUsed,
        });
      } else {
        // Reset for next round
        const width = this.scale.width;
        const height = this.scale.height;
        const floorY = height - 90;
        this.player1.resetRound(width * 0.28, floorY - 60);
        this.player2.resetRound(width * 0.72, floorY - 60);
        this.startRoundSequence();
      }
    });
  }

  // Scene lifecycle cleanup
  stopScene() {
    soundManager.stopBattleMusic();
    if (this.timerEvent) this.timerEvent.destroy();
  }
}
