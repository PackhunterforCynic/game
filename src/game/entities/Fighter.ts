import Phaser from 'phaser';
import { AlienId, AttackMove, CharacterData, FighterInputState } from '../../types/game';
import { CHARACTERS } from '../data/characters';
import { soundManager } from '../../audio/soundManager';
import { ParticleEffectsManager } from './ParticleEffects';

export type FighterState = 
  | 'IDLE'
  | 'WALK'
  | 'RUN'
  | 'JUMP'
  | 'FALL'
  | 'CROUCH'
  | 'BLOCK'
  | 'ATTACKING'
  | 'HURT'
  | 'KNOCKDOWN'
  | 'VICTORY'
  | 'DEFEAT';

export class Fighter extends Phaser.Physics.Arcade.Sprite {
  public playerNumber: 1 | 2;
  public characterData: CharacterData;
  public fighterState: FighterState = 'IDLE';

  // Combat Stats
  public maxHealth: number;
  public currentHealth: number;
  public energy: number = 0; // 0 to 100
  public maxEnergy: number = 100;

  // Combo & Score Tracking
  public currentCombo: number = 0;
  public maxCombo: number = 0;
  public totalDamageDealt: number = 0;
  public specialsUsed: number = 0;
  public ultimatesUsed: number = 0;
  private comboResetTimer: number = 0;

  // Active Attack Information
  public currentAttack: AttackMove | null = null;
  private attackTimer: number = 0;
  private attackHasHit: boolean = false;
  private attackHitbox: Phaser.Geom.Rectangle | null = null;

  // Cooldowns
  private cooldowns: Record<string, number> = {};

  // Status Timers
  private hurtTimer: number = 0;
  private knockdownTimer: number = 0;
  private ghostTrailTimer: number = 0;

  // References
  public opponent: Fighter | null = null;
  private particleManager: ParticleEffectsManager;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    alienId: AlienId,
    playerNum: 1 | 2,
    particleManager: ParticleEffectsManager
  ) {
    super(scene, x, y, `char_${alienId}`, 0);
    this.playerNumber = playerNum;
    this.characterData = CHARACTERS[alienId];
    this.particleManager = particleManager;

    this.maxHealth = this.characterData.stats.health;
    this.currentHealth = this.maxHealth;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setCollideWorldBounds(true);
      body.setSize(52, 96);
      body.setOffset(38, 30);
      body.setGravityY(1100);
      body.setBounce(0, 0);
    }

    this.playAnimation('idle');
  }

  public setOpponent(opp: Fighter) {
    this.opponent = opp;
  }

  public resetRound(x: number, y: number) {
    this.setPosition(x, y);
    this.currentHealth = this.maxHealth;
    this.energy = Math.min(this.energy, 40); // Keep some energy across rounds
    this.fighterState = 'IDLE';
    this.currentAttack = null;
    this.attackTimer = 0;
    this.hurtTimer = 0;
    this.currentCombo = 0;
    this.setVelocity(0, 0);
    this.playAnimation('idle');
  }

  public handleInput(input: FighterInputState, delta: number) {
    // Cannot act while hurt, knocked down, or during victory/defeat
    if (this.fighterState === 'HURT' || this.fighterState === 'KNOCKDOWN' || 
        this.fighterState === 'VICTORY' || this.fighterState === 'DEFEAT') {
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body) return;

    const onGround = body.blocked.down || body.touching.down;

    // Turn to face opponent if not attacking
    if (this.opponent && this.fighterState !== 'ATTACKING') {
      const shouldFlip = this.x > this.opponent.x;
      this.setFlipX(shouldFlip);
    }

    // Handle Attack input triggers (if not currently attacking)
    if (this.fighterState !== 'ATTACKING') {
      // 1. Ultimate
      if (input.ultimate && this.energy >= 100 && this.isMoveReady(this.characterData.ultimate.id)) {
        this.executeAttack(this.characterData.ultimate);
        return;
      }

      // 2. Specials
      if (input.special3 && this.energy >= this.characterData.special3.energyCost && this.isMoveReady(this.characterData.special3.id)) {
        this.executeAttack(this.characterData.special3);
        return;
      }
      if (input.special2 && this.energy >= this.characterData.special2.energyCost && this.isMoveReady(this.characterData.special2.id)) {
        this.executeAttack(this.characterData.special2);
        return;
      }
      if (input.special1 && this.energy >= this.characterData.special1.energyCost && this.isMoveReady(this.characterData.special1.id)) {
        this.executeAttack(this.characterData.special1);
        return;
      }

      // 3. Grab
      if (input.grab && this.isMoveReady(this.characterData.grab.id)) {
        this.executeAttack(this.characterData.grab);
        return;
      }

      // 4. Punch
      if (input.punch && this.isMoveReady(this.characterData.punch.id)) {
        this.executeAttack(this.characterData.punch);
        return;
      }

      // 5. Kick
      if (input.kick && this.isMoveReady(this.characterData.kick.id)) {
        this.executeAttack(this.characterData.kick);
        return;
      }

      // 6. Block
      if (input.block && onGround) {
        this.fighterState = 'BLOCK';
        body.setVelocityX(0);
        this.playAnimation('block');
        return;
      }
    }

    // Movement if not attacking or blocking
    if (this.fighterState !== 'ATTACKING' && this.fighterState !== 'BLOCK') {
      const baseSpeed = 220 * (this.characterData.stats.speed / 7);

      if (onGround) {
        if (input.up) {
          // Jump
          const jumpImpulse = -540 * (this.characterData.stats.jumpForce / 13);
          body.setVelocityY(jumpImpulse);
          this.fighterState = 'JUMP';
          this.playAnimation('jump');
          soundManager.playPunch(); // air whoosh
        } else if (input.down) {
          // Crouch
          body.setVelocityX(0);
          this.fighterState = 'CROUCH';
        } else if (input.left) {
          body.setVelocityX(-baseSpeed);
          this.fighterState = 'WALK';
          this.playAnimation('walk');
        } else if (input.right) {
          body.setVelocityX(baseSpeed);
          this.fighterState = 'WALK';
          this.playAnimation('walk');
        } else {
          body.setVelocityX(0);
          this.fighterState = 'IDLE';
          this.playAnimation('idle');
        }
      } else {
        // In Air (JUMP / FALL)
        if (input.left) body.setVelocityX(-baseSpeed * 0.85);
        else if (input.right) body.setVelocityX(baseSpeed * 0.85);

        if (body.velocity.y > 0) {
          this.fighterState = 'FALL';
          this.playAnimation('fall');
        }
      }
    }
  }

  private isMoveReady(moveId: string): boolean {
    const cd = this.cooldowns[moveId] || 0;
    return cd <= 0;
  }

  private executeAttack(move: AttackMove) {
    this.fighterState = 'ATTACKING';
    this.currentAttack = move;
    this.attackTimer = move.cooldownMs * 0.65; // active attack duration
    this.attackHasHit = false;
    this.cooldowns[move.id] = move.cooldownMs;

    // Deduct energy
    if (move.energyCost > 0) {
      this.energy = Math.max(0, this.energy - move.energyCost);
    }

    // Stats
    if (move.type === 'special') this.specialsUsed++;
    if (move.type === 'ultimate') this.ultimatesUsed++;

    // Audio & Visual SFX
    if (move.type === 'punch') {
      soundManager.playPunch();
      this.playAnimation('punch');
    } else if (move.type === 'kick') {
      soundManager.playKick();
      this.playAnimation('kick');
    } else if (move.type === 'grab') {
      soundManager.playHit(false);
      this.playAnimation('grab');
    } else if (move.type === 'special') {
      soundManager.playSpecial(move.effectType);
      if (move.id.endsWith('sp1')) this.playAnimation('sp1');
      else if (move.id.endsWith('sp2')) this.playAnimation('sp2');
      else this.playAnimation('sp3');
    } else if (move.type === 'ultimate') {
      soundManager.playUltimate();
      this.particleManager.screenFlash(0x00ff66, 250);
      this.particleManager.shakeCamera(0.03, 400);
      this.playAnimation('ultimate');
    }

    // Projectile spawning
    if (move.isProjectile) {
      const dir = this.flipX ? -1 : 1;
      const spawnX = this.x + dir * 45;
      const spawnY = this.y - 10;
      
      this.scene.events.emit('spawn_projectile', {
        x: spawnX,
        y: spawnY,
        owner: this.playerNumber,
        direction: dir,
        speed: move.projectileSpeed || 600,
        damage: move.damage,
        colorHex: move.projectileColor || '#00ff66',
        effectType: move.effectType || 'energy',
      });
    }

    // Forward dash impulse for rush attacks (e.g. Flame Dash, XLR8 Speed Dash, Cannonbolt Roll)
    if (move.name.includes('Dash') || move.name.includes('Roll') || move.name.includes('Pounce')) {
      const dir = this.flipX ? -1 : 1;
      const body = this.body as Phaser.Physics.Arcade.Body;
      if (body) body.setVelocityX(dir * 500);
    }
  }

  public update(time: number, delta: number) {
    super.update(time, delta);

    // Update cooldown timers
    for (const id in this.cooldowns) {
      if (this.cooldowns[id] > 0) {
        this.cooldowns[id] -= delta;
      }
    }

    // Combo timer decay
    if (this.currentCombo > 0) {
      this.comboResetTimer -= delta;
      if (this.comboResetTimer <= 0) {
        this.currentCombo = 0;
      }
    }

    // Ghost trail during dash / high velocity
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body && Math.abs(body.velocity.x) > 350) {
      this.ghostTrailTimer += delta;
      if (this.ghostTrailTimer > 70) {
        this.ghostTrailTimer = 0;
        this.particleManager.createGhostTrail(this.x, this.y, this.texture.key, this.frame.name as any, this.flipX);
      }
    }

    // Hurt State processing
    if (this.fighterState === 'HURT') {
      this.hurtTimer -= delta;
      if (this.hurtTimer <= 0) {
        this.fighterState = 'IDLE';
        this.playAnimation('idle');
      }
      return;
    }

    // Knockdown State processing
    if (this.fighterState === 'KNOCKDOWN') {
      this.knockdownTimer -= delta;
      if (this.knockdownTimer <= 0) {
        this.fighterState = 'IDLE';
        this.playAnimation('idle');
      }
      return;
    }

    // Attack State processing & Active Hitbox check
    if (this.fighterState === 'ATTACKING') {
      this.attackTimer -= delta;

      if (!this.attackHasHit && this.currentAttack && !this.currentAttack.isProjectile) {
        this.checkAttackCollision();
      }

      if (this.attackTimer <= 0) {
        this.fighterState = 'IDLE';
        this.currentAttack = null;
        this.playAnimation('idle');
      }
    }
  }

  private checkAttackCollision() {
    if (!this.opponent || !this.currentAttack) return;

    const dir = this.flipX ? -1 : 1;
    const reach = this.currentAttack.range;
    
    // Check horizontal distance
    const dx = this.opponent.x - this.x;
    const dy = Math.abs(this.opponent.y - this.y);

    // Correct direction facing check
    const isFacingOpponent = (dir === 1 && dx > 0) || (dir === -1 && dx < 0);
    const inRange = Math.abs(dx) <= reach && dy <= 70;

    if (isFacingOpponent && inRange) {
      this.attackHasHit = true;
      this.opponent.receiveHit(this.currentAttack, this);
    }
  }

  public receiveHit(attack: AttackMove, attacker: Fighter) {
    if (this.fighterState === 'DEFEAT') return;

    let damage = attack.damage * (attacker.characterData.stats.attack / 8);
    const isBlocking = this.fighterState === 'BLOCK' && attack.type !== 'grab';

    if (isBlocking) {
      // 80% damage reduction & block sound
      damage *= 0.2;
      soundManager.playBlock();
      this.particleManager.createImpactSparks(this.x, this.y - 10, 'tech');
    } else {
      // Clean impact
      soundManager.playHit(attack.type === 'ultimate' || attack.type === 'grab');
      this.particleManager.createImpactSparks(this.x, this.y - 15, attack.effectType || 'smash');
      this.particleManager.hitStop(attack.hitStopMs);

      // Camera shake based on attack severity
      if (attack.type === 'ultimate') {
        this.particleManager.shakeCamera(0.035, 450);
        this.particleManager.screenFlash(0xffffff, 200);
      } else {
        this.particleManager.shakeCamera(0.015, 180);
      }
    }

    // Apply Damage
    this.currentHealth = Math.max(0, this.currentHealth - Math.round(damage));
    attacker.totalDamageDealt += Math.round(damage);

    // Build Omnitrix Energy for both fighters (fighting game meter build!)
    attacker.energy = Math.min(attacker.maxEnergy, attacker.energy + (isBlocking ? 8 : 16));
    this.energy = Math.min(this.maxEnergy, this.energy + 10);

    // Update Attacker's Combo
    attacker.currentCombo++;
    attacker.comboResetTimer = 1600; // 1.6s combo window
    if (attacker.currentCombo > attacker.maxCombo) {
      attacker.maxCombo = attacker.currentCombo;
    }

    // Knockback
    const hitDir = attacker.x < this.x ? 1 : -1;
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      const kbX = attack.knockback.x * hitDir * (isBlocking ? 0.35 : 1);
      const kbY = isBlocking ? 0 : attack.knockback.y;
      body.setVelocity(kbX, kbY);
    }

    // Check Knockout / Hurt
    if (this.currentHealth <= 0) {
      this.knockout();
    } else if (!isBlocking) {
      if (attack.type === 'ultimate' || attack.knockback.y < -180) {
        this.fighterState = 'KNOCKDOWN';
        this.knockdownTimer = 800;
        this.playAnimation('defeat');
      } else {
        this.fighterState = 'HURT';
        this.hurtTimer = 350;
        this.playAnimation('hurt');
      }
    }
  }

  public knockout() {
    this.fighterState = 'DEFEAT';
    this.currentHealth = 0;
    this.playAnimation('defeat');
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) body.setVelocity(0, 0);

    // Announce K.O.
    soundManager.announce('K.O.!');
  }

  public celebrateVictory() {
    this.fighterState = 'VICTORY';
    this.playAnimation('victory');
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) body.setVelocity(0, 0);
  }

  private playAnimation(animType: string) {
    const animKey = `${this.characterData.id}_${animType}`;
    if (this.anims && this.scene.anims.exists(animKey)) {
      if (this.anims.currentAnim?.key !== animKey) {
        this.play(animKey, true);
      }
    }
  }
}

