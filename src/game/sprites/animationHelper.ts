import Phaser from 'phaser';
import { AlienId } from '../../types/game';

export function registerFighterAnimations(scene: Phaser.Scene, alienId: AlienId) {
  const textureKey = `char_${alienId}`;
  
  if (!scene.textures.exists(textureKey)) {
    return;
  }

  const anims = scene.anims;

  const defs = [
    { key: `${alienId}_idle`, frames: [0, 1, 2, 3], frameRate: 6, repeat: -1 },
    { key: `${alienId}_walk`, frames: [6, 7, 8, 9, 10, 11], frameRate: 8, repeat: -1 },
    { key: `${alienId}_run`, frames: [12, 13, 14, 15, 16, 17], frameRate: 12, repeat: -1 },
    { key: `${alienId}_jump`, frames: [18, 19, 20], frameRate: 8, repeat: 0 },
    { key: `${alienId}_fall`, frames: [21, 22], frameRate: 6, repeat: -1 },
    { key: `${alienId}_punch`, frames: [24, 25, 26], frameRate: 14, repeat: 0 },
    { key: `${alienId}_kick`, frames: [27, 28, 29], frameRate: 12, repeat: 0 },
    { key: `${alienId}_block`, frames: [30, 31], frameRate: 6, repeat: -1 },
    { key: `${alienId}_grab`, frames: [32, 33, 34], frameRate: 10, repeat: 0 },
    { key: `${alienId}_hurt`, frames: [36, 37, 38], frameRate: 12, repeat: 0 },
    { key: `${alienId}_sp1`, frames: [42, 43, 44, 45], frameRate: 10, repeat: 0 },
    { key: `${alienId}_sp2`, frames: [48, 49, 50, 51], frameRate: 10, repeat: 0 },
    { key: `${alienId}_sp3`, frames: [54, 55, 56, 57], frameRate: 10, repeat: 0 },
    { key: `${alienId}_ultimate`, frames: [60, 61, 62, 63, 64, 65], frameRate: 8, repeat: 0 },
    { key: `${alienId}_victory`, frames: [66, 67, 68, 69], frameRate: 6, repeat: -1 },
    { key: `${alienId}_defeat`, frames: [72, 73, 74, 75], frameRate: 6, repeat: 0 },
  ];

  for (const def of defs) {
    if (!anims.exists(def.key)) {
      anims.create({
        key: def.key,
        frames: anims.generateFrameNumbers(textureKey, { frames: def.frames }),
        frameRate: def.frameRate,
        repeat: def.repeat,
      });
    }
  }
}

