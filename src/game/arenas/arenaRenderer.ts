import Phaser from 'phaser';
import { ArenaId } from '../../types/game';
import { ARENAS } from '../data/arenas';

export function createArenaBackground(scene: Phaser.Scene, arenaId: ArenaId) {
  const width = scene.scale.width;
  const height = scene.scale.height;
  const arena = ARENAS[arenaId];

  // 1. SKY GRADIENT
  const skyGraphics = scene.add.graphics();
  skyGraphics.fillGradientStyle(
    Phaser.Display.Color.HexStringToColor(arena.skyColorTop).color,
    Phaser.Display.Color.HexStringToColor(arena.skyColorTop).color,
    Phaser.Display.Color.HexStringToColor(arena.skyColorBottom).color,
    Phaser.Display.Color.HexStringToColor(arena.skyColorBottom).color,
    1
  );
  skyGraphics.fillRect(0, 0, width, height);
  skyGraphics.setDepth(-10);

  // 2. PARALLAX DISTANT LAYER
  const distantLayer = scene.add.graphics();
  distantLayer.setDepth(-8);

  // 3. MIDGROUND ARCHITECTURE
  const midLayer = scene.add.graphics();
  midLayer.setDepth(-5);

  // 4. ARENA-SPECIFIC SCENERY
  if (arenaId === 'bellwood') {
    renderBellwoodLayers(scene, distantLayer, midLayer, width, height);
  } else if (arenaId === 'nullvoid') {
    renderNullVoidLayers(scene, distantLayer, midLayer, width, height);
  } else if (arenaId === 'alienplanet') {
    renderGalvanPrimeLayers(scene, distantLayer, midLayer, width, height);
  }

  // 5. COMBAT FLOOR PLATFORM
  const floorY = height - 90;
  const floorGraphics = scene.add.graphics();
  floorGraphics.setDepth(-2);

  // Concrete / Metallic battle arena deck
  floorGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(arena.groundColor).color, 1);
  floorGraphics.fillRect(0, floorY, width, 90);

  // Neon glowing floor perimeter line
  floorGraphics.lineStyle(4, Phaser.Display.Color.HexStringToColor(arena.primaryColor).color, 0.9);
  floorGraphics.lineBetween(0, floorY, width, floorY);

  // Sub-floor grid lines
  floorGraphics.lineStyle(1, Phaser.Display.Color.HexStringToColor(arena.primaryColor).color, 0.25);
  for (let x = 0; x < width; x += 40) {
    floorGraphics.lineBetween(x, floorY, x, height);
  }

  // 6. ATMOSPHERIC PARTICLES
  createAtmosphericParticles(scene, arenaId, width, height);
}

function renderBellwoodLayers(
  scene: Phaser.Scene, 
  dist: Phaser.GameObjects.Graphics, 
  mid: Phaser.GameObjects.Graphics, 
  w: number, 
  h: number
) {
  // Distant City Skyline Silhouettes
  dist.fillStyle(0x0e1b2e, 0.85);
  for (let x = 0; x < w; x += 60) {
    const bh = 140 + Math.sin(x * 0.05) * 80;
    dist.fillRect(x, h - 90 - bh, 55, bh);
  }

  // Midground Plumber Base Tower & Billboards
  mid.fillStyle(0x152642, 1);
  mid.fillRect(w * 0.45, h - 90 - 320, 110, 320); // Plumber HQ main tower
  
  // Plumber glowing beacon
  const beacon = scene.add.circle(w * 0.45 + 55, h - 90 - 325, 8, 0x00ff66);
  beacon.setDepth(-4);
  scene.tweens.add({
    targets: beacon,
    scale: 1.8,
    alpha: 0.3,
    duration: 1200,
    yoyo: true,
    repeat: -1,
  });

  // Neon Billboard sign
  const billboard = scene.add.rectangle(w * 0.18, h - 90 - 180, 140, 50, 0x0b132b);
  billboard.setStrokeStyle(3, 0x38bdf8);
  billboard.setDepth(-4);
  const billText = scene.add.text(w * 0.18, h - 90 - 180, 'MR. SMOOTHY', {
    fontFamily: 'Orbitron, sans-serif',
    fontSize: '12px',
    color: '#38bdf8',
  }).setOrigin(0.5).setDepth(-3);

  scene.tweens.add({
    targets: billText,
    alpha: 0.5,
    duration: 800,
    yoyo: true,
    repeat: -1,
  });
}

function renderNullVoidLayers(
  scene: Phaser.Scene, 
  dist: Phaser.GameObjects.Graphics, 
  mid: Phaser.GameObjects.Graphics, 
  w: number, 
  h: number
) {
  // Central Swirling Void Portal
  const portal = scene.add.circle(w * 0.5, h * 0.35, 120, 0x880022, 0.5);
  portal.setStrokeStyle(8, 0xff2244, 0.7);
  portal.setDepth(-9);
  scene.tweens.add({
    targets: portal,
    scale: 1.15,
    rotation: Math.PI * 2,
    duration: 6000,
    yoyo: true,
    repeat: -1,
  });

  // Floating Asteroids & Null Void Prison Cubes
  mid.fillStyle(0x421010, 0.9);
  const rocks = [
    { x: w * 0.15, y: h * 0.45, s: 60 },
    { x: w * 0.3, y: h * 0.28, s: 45 },
    { x: w * 0.75, y: h * 0.4, s: 70 },
    { x: w * 0.88, y: h * 0.25, s: 50 },
  ];

  rocks.forEach(r => {
    const rock = scene.add.polygon(r.x, r.y, [
      0, 10,
      r.s * 0.5, 0,
      r.s, 15,
      r.s * 0.8, r.s * 0.7,
      r.s * 0.3, r.s * 0.8,
    ], 0x3a0d0d);
    rock.setStrokeStyle(2, 0xff4444, 0.5);
    rock.setDepth(-6);

    // Subtle floating bob
    scene.tweens.add({
      targets: rock,
      y: r.y + 15,
      duration: 2500 + Math.random() * 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  });
}

function renderGalvanPrimeLayers(
  scene: Phaser.Scene, 
  dist: Phaser.GameObjects.Graphics, 
  mid: Phaser.GameObjects.Graphics, 
  w: number, 
  h: number
) {
  // Galvan Twin Moons
  const moon1 = scene.add.circle(w * 0.75, h * 0.22, 38, 0x10b981, 0.3);
  moon1.setStrokeStyle(2, 0x34d399, 0.6);
  moon1.setDepth(-9);

  const moon2 = scene.add.circle(w * 0.82, h * 0.18, 20, 0x065f46, 0.5);
  moon2.setStrokeStyle(1.5, 0x10b981, 0.7);
  moon2.setDepth(-9);

  // Chrome Spires with Living Nanotech Traces
  mid.fillStyle(0x064e3b, 0.9);
  for (let x = 40; x < w; x += 120) {
    const spireH = 220 + (x % 70) * 3;
    mid.fillRect(x, h - 90 - spireH, 30, spireH);

    // Glowing circuit ring
    const ring = scene.add.ellipse(x + 15, h - 90 - spireH + 40, 48, 12);
    ring.setStrokeStyle(2, 0x00ff66, 0.8);
    ring.setFillStyle(0, 0);
    ring.setDepth(-4);

    scene.tweens.add({
      targets: ring,
      y: ring.y - 30,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}

function createAtmosphericParticles(scene: Phaser.Scene, arenaId: ArenaId, w: number, h: number) {
  const count = 30;
  let color = 0x00ff66;
  if (arenaId === 'nullvoid') color = 0xff4444;
  if (arenaId === 'bellwood') color = 0x38bdf8;

  for (let i = 0; i < count; i++) {
    const px = Math.random() * w;
    const py = Math.random() * (h - 100);
    const particle = scene.add.circle(px, py, 1.5 + Math.random() * 2, color, 0.4 + Math.random() * 0.4);
    particle.setDepth(-3);

    scene.tweens.add({
      targets: particle,
      y: py - 40 - Math.random() * 60,
      x: px + (Math.random() - 0.5) * 50,
      alpha: 0.1,
      duration: 2500 + Math.random() * 2500,
      repeat: -1,
      yoyo: true,
    });
  }
}
