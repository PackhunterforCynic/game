import Phaser from 'phaser';

export class ParticleEffectsManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // Camera Shake
  public shakeCamera(intensity = 0.015, duration = 180) {
    this.scene.cameras.main.shake(duration, intensity);
  }

  // Hit-stop effect (momentary world slowdown / freeze frame for arcade impact feel)
  public hitStop(durationMs = 80) {
    const physics = this.scene.physics;
    physics.world.isPaused = true;
    this.scene.time.delayedCall(durationMs, () => {
      physics.world.isPaused = false;
    });
  }

  // Screen flash
  public screenFlash(colorHex = 0xffffff, duration = 120, alpha = 0.5) {
    this.scene.cameras.main.flash(duration, (colorHex >> 16) & 0xff, (colorHex >> 8) & 0xff, colorHex & 0xff, false);
  }

  // Impact Sparks & Particle Explosions
  public createImpactSparks(x: number, y: number, effectType: string = 'smash') {
    let color = 0xffcc00;
    let particleCount = 12;

    switch (effectType) {
      case 'fire':
        color = 0xff5500;
        particleCount = 18;
        break;
      case 'sonic':
        color = 0x00d2ff;
        particleCount = 16;
        break;
      case 'crystal':
        color = 0x00ffa6;
        particleCount = 15;
        break;
      case 'tech':
        color = 0x00ff66;
        particleCount = 14;
        break;
      case 'ghost':
        color = 0xa855f7;
        particleCount = 14;
        break;
      case 'water':
        color = 0x00b4d8;
        particleCount = 16;
        break;
      case 'slime':
        color = 0xa7c957;
        particleCount = 14;
        break;
      case 'roll':
        color = 0xf4a261;
        particleCount = 12;
        break;
      case 'beast':
        color = 0xff3300;
        particleCount = 14;
        break;
    }

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 240;
      const size = 3 + Math.random() * 5;

      const p = this.scene.add.circle(x, y, size, color);
      p.setAlpha(0.9);

      this.scene.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed * 0.35,
        y: y + Math.sin(angle) * speed * 0.35,
        alpha: 0,
        scale: 0.2,
        duration: 250 + Math.random() * 200,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy(),
      });
    }
  }

  // Motion blur / afterimage trail
  public createGhostTrail(x: number, y: number, textureKey: string, frameNumber: number, flipX: boolean, colorTint = 0x00ff66) {
    const ghost = this.scene.add.sprite(x, y, textureKey, frameNumber);
    ghost.setFlipX(flipX);
    ghost.setTint(colorTint);
    ghost.setAlpha(0.5);

    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scaleX: ghost.scaleX * 1.05,
      scaleY: ghost.scaleY * 1.05,
      duration: 220,
      onComplete: () => ghost.destroy(),
    });
  }

  // Energy shockwave ring
  public createShockwave(x: number, y: number, color = 0x00ff66, maxRadius = 120) {
    const ring = this.scene.add.circle(x, y, 10);
    ring.setStrokeStyle(4, color, 1);
    ring.setFillStyle(0, 0);

    this.scene.tweens.add({
      targets: ring,
      radius: maxRadius,
      alpha: 0,
      duration: 350,
      ease: 'Cubic.easeOut',
      onComplete: () => ring.destroy(),
    });
  }
}

