import { AIDifficulty, FighterInputState } from '../../types/game';
import { Fighter } from '../entities/Fighter';

export class FighterAI {
  private difficulty: AIDifficulty;
  private fighter: Fighter;
  private opponent: Fighter;
  private decisionTimer: number = 0;
  private currentInput: FighterInputState;

  constructor(fighter: Fighter, opponent: Fighter, difficulty: AIDifficulty) {
    this.fighter = fighter;
    this.opponent = opponent;
    this.difficulty = difficulty;
    this.currentInput = this.getEmptyInput();
  }

  public setDifficulty(diff: AIDifficulty) {
    this.difficulty = diff;
  }

  private getEmptyInput(): FighterInputState {
    return {
      left: false,
      right: false,
      up: false,
      down: false,
      punch: false,
      kick: false,
      grab: false,
      special1: false,
      special2: false,
      special3: false,
      ultimate: false,
      block: false,
    };
  }

  public update(delta: number): FighterInputState {
    this.decisionTimer -= delta;

    // Reset single-frame tap inputs
    this.currentInput.punch = false;
    this.currentInput.kick = false;
    this.currentInput.grab = false;
    this.currentInput.special1 = false;
    this.currentInput.special2 = false;
    this.currentInput.special3 = false;
    this.currentInput.ultimate = false;

    // Interval between decision cycles
    const interval = this.difficulty === 'hard' ? 90 : this.difficulty === 'normal' ? 220 : 500;

    if (this.decisionTimer <= 0) {
      this.decisionTimer = interval + Math.random() * 50;
      this.makeDecision();
    }

    return this.currentInput;
  }

  private makeDecision() {
    const dist = Math.abs(this.fighter.x - this.opponent.x);
    const opponentIsAttacking = this.opponent.fighterState === 'ATTACKING';
    const opponentIsBlocking = this.opponent.fighterState === 'BLOCK';
    const isFacingLeft = this.fighter.x > this.opponent.x;

    // Clear previous direction
    this.currentInput.left = false;
    this.currentInput.right = false;
    this.currentInput.up = false;
    this.currentInput.down = false;
    this.currentInput.block = false;

    // 1. DEFENSIVE CHECK (Block or Jump)
    if (opponentIsAttacking && dist < 160) {
      const blockChance = this.difficulty === 'hard' ? 0.90 : this.difficulty === 'normal' ? 0.60 : 0.25;
      if (Math.random() < blockChance) {
        this.currentInput.block = true;
        return;
      }
    }

    // 2. ULTIMATE ATTACK CHECK
    if (this.fighter.energy >= 100 && dist < 320) {
      const ultChance = this.difficulty === 'hard' ? 0.85 : 0.60;
      if (Math.random() < ultChance) {
        this.currentInput.ultimate = true;
        return;
      }
    }

    // 3. CLOSE RANGE COMBAT (< 95px)
    if (dist < 95) {
      // If opponent is blocking, attempt Grab to break guard
      if (opponentIsBlocking && Math.random() < 0.65) {
        this.currentInput.grab = true;
        return;
      }

      // Mix between punch, kick, and close specials
      const rand = Math.random();
      if (rand < 0.38) {
        this.currentInput.punch = true;
      } else if (rand < 0.70) {
        this.currentInput.kick = true;
      } else if (rand < 0.88 && this.fighter.energy >= 25) {
        this.currentInput.special1 = true;
      } else if (this.fighter.energy >= 45) {
        this.currentInput.special3 = true;
      }
      return;
    }

    // 4. MID RANGE COMBAT (95px - 260px)
    if (dist >= 95 && dist < 260) {
      const rand = Math.random();
      // Dash specials or closing gap
      if (rand < 0.40 && this.fighter.energy >= 35) {
        this.currentInput.special2 = true;
      } else if (rand < 0.65 && this.fighter.energy >= 25) {
        this.currentInput.special1 = true;
      } else {
        // Move towards opponent
        if (isFacingLeft) this.currentInput.left = true;
        else this.currentInput.right = true;

        // Occasional jump in attack
        if (Math.random() < 0.25) {
          this.currentInput.up = true;
        }
      }
      return;
    }

    // 5. LONG RANGE COMBAT (> 260px)
    if (dist >= 260) {
      const rand = Math.random();
      // Fire projectile specials if available
      if (rand < 0.45 && this.fighter.energy >= 25) {
        this.currentInput.special1 = true;
      } else {
        // Approach opponent
        if (isFacingLeft) this.currentInput.left = true;
        else this.currentInput.right = true;
      }
    }
  }
}

