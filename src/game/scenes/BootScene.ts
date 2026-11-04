import Phaser from 'phaser';
import { CHARACTER_IDS } from '../data/characters';
import { generateCharacterSpriteSheet } from '../sprites/characterSpriteGenerator';
import { registerFighterAnimations } from '../sprites/animationHelper';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    // Show quick loading text
    const text = this.add.text(
      this.scale.width / 2, 
      this.scale.height / 2, 
      'SYNCHRONIZING OMNITRIX DNA...', 
      {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '18px',
        color: '#00ff66',
      }
    ).setOrigin(0.5);

    // Generate sprite sheets for all 10 aliens
    for (const alienId of CHARACTER_IDS) {
      const textureKey = `char_${alienId}`;
      if (!this.textures.exists(textureKey)) {
        const canvas = generateCharacterSpriteSheet(alienId);
        this.textures.addSpriteSheet(textureKey, canvas as any, {
          frameWidth: 128,
          frameHeight: 128,
        });
        registerFighterAnimations(this, alienId);
      }
    }

    // Done generating, start battle scene
    this.time.delayedCall(100, () => {
      text.destroy();
      this.scene.start('BattleScene');
    });
  }
}

