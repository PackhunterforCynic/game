import Phaser from 'phaser';

export class Projectile extends Phaser.GameObjects.Arc {
  public damage: number = 50;
  public ownerPlayer: 1 | 2;
  public velocityX: number = 0;
  public effectType: string = 'energy';
  public isExpired: boolean = false;
  private lifeTimer: number = 3000;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    owner: 1 | 2,
    direction: 1 | -1,
    speed: number,
    damage: number,
    colorHex: string,
    effectType: string = 'energy'
  ) {
    const colorInt = Phaser.Display.Color.HexStringToColor(colorHex).color;
    super(scene, x, y, 12, 0, 360, false, colorInt, 0.9);

    this.ownerPlayer = owner;
    this.damage = damage;
    this.velocityX = direction * speed;
    this.effectType = effectType;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setAllowGravity(false);
      body.setVelocityX(this.velocityX);
      body.setCircle(12);
    }

    // Outer glow ring
    this.setStrokeStyle(3, 0xffffff, 0.8);
  }

  public update(delta: number) {
    this.lifeTimer -= delta;
    if (this.lifeTimer <= 0) {
      this.destroyProjectile();
      return;
    }

    // Visual pulse
    this.scale = 1 + Math.sin(this.scene.time.now * 0.02) * 0.15;
  }

  public destroyProjectile() {
    this.isExpired = true;
    this.destroy();
  }
}

