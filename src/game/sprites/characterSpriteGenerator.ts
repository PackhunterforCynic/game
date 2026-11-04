import { AlienId } from '../../types/game';

export interface FrameInfo {
  animKey: string;
  startFrame: number;
  endFrame: number;
  frameRate: number;
  repeat: number;
}

export const ANIMATION_DEFINITIONS: Record<string, { row: number; count: number; frameRate: number; repeat: number }> = {
  idle: { row: 0, count: 4, frameRate: 6, repeat: -1 },
  walk: { row: 1, count: 6, frameRate: 8, repeat: -1 },
  run: { row: 2, count: 6, frameRate: 12, repeat: -1 },
  jump: { row: 3, count: 3, frameRate: 8, repeat: 0 },
  fall: { row: 3, count: 2, frameRate: 6, repeat: -1 }, // uses offset frames in row 3
  punch: { row: 4, count: 3, frameRate: 12, repeat: 0 },
  kick: { row: 4, count: 3, frameRate: 10, repeat: 0 }, // offset in row 4
  block: { row: 5, count: 2, frameRate: 6, repeat: -1 },
  grab: { row: 5, count: 3, frameRate: 8, repeat: 0 },
  hurt: { row: 6, count: 3, frameRate: 10, repeat: 0 },
  special1: { row: 7, count: 4, frameRate: 10, repeat: 0 },
  special2: { row: 8, count: 4, frameRate: 10, repeat: 0 },
  special3: { row: 9, count: 4, frameRate: 10, repeat: 0 },
  ultimate: { row: 10, count: 6, frameRate: 8, repeat: 0 },
  victory: { row: 11, count: 4, frameRate: 6, repeat: -1 },
  defeat: { row: 12, count: 4, frameRate: 5, repeat: 0 },
};

const FRAME_WIDTH = 128;
const FRAME_HEIGHT = 128;
const COLS = 6;
const ROWS = 13;

export function generateCharacterSpriteSheet(alienId: AlienId): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = COLS * FRAME_WIDTH;
  canvas.height = ROWS * FRAME_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Render every row and column
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * FRAME_WIDTH;
      const y = row * FRAME_HEIGHT;
      ctx.save();
      ctx.translate(x, y);
      
      // Determine pose based on row & col
      renderAlienPose(ctx, alienId, row, col);
      
      ctx.restore();
    }
  }

  return canvas;
}

function renderAlienPose(ctx: CanvasRenderingContext2D, alienId: AlienId, row: number, col: number) {
  // Center of 128x128 frame
  const cx = 64;
  const cy = 64;

  // Calculate timing parameter [0, 1]
  const t = col / 5;

  // Draw dynamic floor shadow
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  let shadowWidth = 34;
  let shadowY = 114;
  if (row === 3) {
    // Jump / fall: smaller shadow
    shadowWidth = 20;
    shadowY = 118;
  }
  ctx.ellipse(cx, shadowY, shadowWidth, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Route drawing by alien character
  switch (alienId) {
    case 'heatblast':
      drawHeatblast(ctx, cx, cy, row, col, t);
      break;
    case 'fourarms':
      drawFourArms(ctx, cx, cy, row, col, t);
      break;
    case 'xlr8':
      drawXLR8(ctx, cx, cy, row, col, t);
      break;
    case 'diamondhead':
      drawDiamondhead(ctx, cx, cy, row, col, t);
      break;
    case 'wildmutt':
      drawWildmutt(ctx, cx, cy, row, col, t);
      break;
    case 'upgrade':
      drawUpgrade(ctx, cx, cy, row, col, t);
      break;
    case 'ghostfreak':
      drawGhostfreak(ctx, cx, cy, row, col, t);
      break;
    case 'cannonbolt':
      drawCannonbolt(ctx, cx, cy, row, col, t);
      break;
    case 'stinkfly':
      drawStinkfly(ctx, cx, cy, row, col, t);
      break;
    case 'ripjaws':
      drawRipjaws(ctx, cx, cy, row, col, t);
      break;
  }
}

// Draw Omnitrix Badge on character
function drawOmnitrixBadge(ctx: CanvasRenderingContext2D, x: number, y: number, radius = 5) {
  ctx.save();
  // Outer silver/dark grey ring
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(x, y, radius + 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Green inner ring
  ctx.fillStyle = '#00ff66';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Black hourglass/hourglass triangles
  ctx.fillStyle = '#000';
  ctx.beginPath();
  // Top triangle
  ctx.moveTo(x - radius * 0.7, y - radius * 0.7);
  ctx.lineTo(x + radius * 0.7, y - radius * 0.7);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fill();

  // Bottom triangle
  ctx.beginPath();
  ctx.moveTo(x - radius * 0.7, y + radius * 0.7);
  ctx.lineTo(x + radius * 0.7, y + radius * 0.7);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// -------------------------------------------------------------
// 1. HEATBLAST (Pyronite) - Magma, Charred Rock, Animated Flame Head
// -------------------------------------------------------------
function drawHeatblast(ctx: CanvasRenderingContext2D, cx: number, cy: number, row: number, col: number, t: number) {
  const bob = Math.sin(col * 1.5) * 2;
  const isAction = row >= 4 && row <= 10;
  const isAttack = row === 4 && col <= 2;
  const isKick = row === 4 && col >= 3;
  const isHurt = row === 6;
  const isUlt = row === 10;

  // Head Flame
  ctx.save();
  const flameGradient = ctx.createRadialGradient(cx, cy - 35 + bob, 2, cx, cy - 35 + bob, 20);
  flameGradient.addColorStop(0, '#ffffff');
  flameGradient.addColorStop(0.3, '#ffe600');
  flameGradient.addColorStop(0.7, '#ff5500');
  flameGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
  ctx.fillStyle = flameGradient;
  ctx.beginPath();
  const flameFlicker = Math.sin(col * 3) * 3;
  ctx.moveTo(cx - 12, cy - 25 + bob);
  ctx.quadraticCurveTo(cx - 15 + flameFlicker, cy - 45 + bob, cx, cy - 52 + bob + flameFlicker);
  ctx.quadraticCurveTo(cx + 15 - flameFlicker, cy - 45 + bob, cx + 12, cy - 25 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Head Collar & Face Mask (Charred Rock)
  ctx.save();
  ctx.fillStyle = '#8b2500';
  ctx.strokeStyle = '#ff9900';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy - 24 + bob, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Glowing Orange Eyes
  ctx.fillStyle = '#fff455';
  ctx.beginPath();
  ctx.arc(cx - 3, cy - 24 + bob, 2.5, 0, Math.PI * 2);
  ctx.arc(cx + 3, cy - 24 + bob, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Torso (Magma rock with yellow glowing fissures)
  ctx.save();
  ctx.fillStyle = '#611600';
  ctx.strokeStyle = '#ff7700';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cx - 14, cy - 14 + bob, 28, 30, 6);
  ctx.fill();
  ctx.stroke();

  // Glowing fissure lines
  ctx.strokeStyle = '#ffe600';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy - 10 + bob);
  ctx.lineTo(cx, cy + bob);
  ctx.lineTo(cx + 8, cy - 8 + bob);
  ctx.stroke();

  // Omnitrix on Chest
  drawOmnitrixBadge(ctx, cx, cy - 6 + bob, 4.5);
  ctx.restore();

  // Legs
  ctx.save();
  ctx.fillStyle = '#611600';
  ctx.strokeStyle = '#ff5500';
  ctx.lineWidth = 1.5;
  
  let leftLegX = cx - 8;
  let rightLegX = cx + 8;
  let legY = cy + 16 + bob;

  if (row === 1 || row === 2) {
    // Walk / Run stride
    leftLegX += Math.sin(col * 1.5) * 8;
    rightLegX -= Math.sin(col * 1.5) * 8;
  } else if (isKick) {
    rightLegX += (col - 3) * 12;
    legY -= (col - 3) * 8;
  }

  // Left leg
  ctx.beginPath();
  ctx.roundRect(leftLegX - 5, legY, 10, 30, 4);
  ctx.fill();
  ctx.stroke();

  // Right leg
  ctx.beginPath();
  ctx.roundRect(rightLegX - 5, legY, 10, 30, 4);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Arms & Fire Fists
  ctx.save();
  ctx.fillStyle = '#8b2500';
  ctx.strokeStyle = '#ff7700';
  ctx.lineWidth = 1.5;

  let leftArmX = cx - 18;
  let rightArmX = cx + 18;
  let armY = cy - 8 + bob;

  if (isAttack) {
    // Punching forward with flame trail
    rightArmX += col * 14;
    // Flame blast effect on right fist
    ctx.fillStyle = 'rgba(255, 120, 0, 0.8)';
    ctx.beginPath();
    ctx.arc(rightArmX + 10, armY, 10 + col * 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (isUlt) {
    // Both arms raised summoning giant solar flare
    armY -= 15;
    ctx.fillStyle = 'rgba(255, 200, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(cx, cy - 40, 24 + col * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw Arms
  ctx.fillStyle = '#8b2500';
  ctx.beginPath();
  ctx.roundRect(leftArmX - 4, armY, 9, 24, 4);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(rightArmX - 4, armY, 9, 24, 4);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// -------------------------------------------------------------
// 2. FOUR ARMS (Tetramand) - 4 Arms, Crimson Muscle, White Tank
// -------------------------------------------------------------
function drawFourArms(ctx: CanvasRenderingContext2D, cx: number, cy: number, row: number, col: number, t: number) {
  const bob = Math.sin(col * 1.5) * 2;
  const isPunch = row === 4 && col <= 2;
  const isKick = row === 4 && col >= 3;
  const isUlt = row === 10;

  // Head & Crest
  ctx.save();
  ctx.fillStyle = '#c71f1f';
  ctx.beginPath();
  ctx.arc(cx, cy - 25 + bob, 13, 0, Math.PI * 2);
  ctx.fill();

  // Black head stripe
  ctx.fillStyle = '#111';
  ctx.fillRect(cx - 2, cy - 38 + bob, 4, 18);

  // Four golden eyes (2 upper, 2 lower)
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(cx - 5, cy - 27 + bob, 2, 0, Math.PI * 2);
  ctx.arc(cx + 5, cy - 27 + bob, 2, 0, Math.PI * 2);
  ctx.arc(cx - 4, cy - 22 + bob, 1.8, 0, Math.PI * 2);
  ctx.arc(cx + 4, cy - 22 + bob, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Torso - White tank top with bold black center stripe
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#c71f1f';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cx - 18, cy - 12 + bob, 36, 32, 6);
  ctx.fill();

  // Black vertical center stripe
  ctx.fillStyle = '#111';
  ctx.fillRect(cx - 5, cy - 12 + bob, 10, 32);

  // Omnitrix Badge on upper left shoulder/chest
  drawOmnitrixBadge(ctx, cx - 10, cy - 6 + bob, 4.5);
  ctx.restore();

  // 4 Muscular Arms!
  ctx.save();
  ctx.fillStyle = '#d62828';
  ctx.strokeStyle = '#7c0b0b';
  ctx.lineWidth = 1.5;

  let upperL = cx - 22;
  let upperR = cx + 22;
  let lowerL = cx - 20;
  let lowerR = cx + 20;
  let armY = cy - 8 + bob;

  if (isPunch) {
    upperR += col * 16;
    lowerR += col * 12;
  } else if (isUlt) {
    upperL -= 8;
    upperR += 8;
    lowerL -= 8;
    lowerR += 8;
  }

  // Upper Left & Right Arms
  ctx.beginPath();
  ctx.roundRect(upperL - 6, armY - 5, 12, 26, 6);
  ctx.roundRect(upperR - 6, armY - 5, 12, 26, 6);
  ctx.fill();
  ctx.stroke();

  // Lower Left & Right Arms
  ctx.beginPath();
  ctx.roundRect(lowerL - 5, armY + 10, 10, 22, 5);
  ctx.roundRect(lowerR - 5, armY + 10, 10, 22, 5);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Legs - Black pants with red muscle
  ctx.save();
  ctx.fillStyle = '#111';
  let legSpread = 10;
  if (row === 1 || row === 2) legSpread += Math.sin(col * 2) * 6;
  ctx.beginPath();
  ctx.roundRect(cx - legSpread - 7, cy + 20 + bob, 14, 30, 4);
  ctx.roundRect(cx + legSpread - 7, cy + 20 + bob, 14, 30, 4);
  ctx.fill();
  ctx.restore();
}

// -------------------------------------------------------------
// 3. XLR8 (Kineceleran) - Aerodynamic Blue/Black, Tail, Roller Feet
// -------------------------------------------------------------
function drawXLR8(ctx: CanvasRenderingContext2D, cx: number, cy: number, row: number, col: number, t: number) {
  const bob = Math.sin(col * 2) * 2;
  const isRunning = row === 2;
  const isSpecial = row >= 7 && row <= 9;

  // Kinetic speed lines/motion blur if running
  if (isRunning || isSpecial) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy + 10);
    ctx.lineTo(cx - 60, cy + 10);
    ctx.moveTo(cx - 20, cy - 10);
    ctx.lineTo(cx - 50, cy - 10);
    ctx.stroke();
    ctx.restore();
  }

  // Sleek Aerodynamic Tail
  ctx.save();
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = '#00d2ff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy + 15 + bob);
  ctx.quadraticCurveTo(cx - 35, cy + 10 + bob, cx - 45, cy + 30 + bob);
  ctx.lineTo(cx - 10, cy + 20 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Sleek Pointed Helmet Head
  ctx.save();
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy - 22 + bob);
  ctx.lineTo(cx + 12, cy - 24 + bob);
  ctx.lineTo(cx - 5, cy - 40 + bob); // Sleek fin back
  ctx.closePath();
  ctx.fill();

  // Blue Visor
  ctx.fillStyle = '#00d2ff';
  ctx.beginPath();
  ctx.arc(cx + 5, cy - 24 + bob, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Torso - Black & Blue bodysuit
  ctx.save();
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = '#00d2ff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cx - 10, cy - 12 + bob, 20, 30, 6);
  ctx.fill();
  ctx.stroke();

  // Blue chest chevron
  ctx.fillStyle = '#00d2ff';
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 10 + bob);
  ctx.lineTo(cx + 8, cy - 10 + bob);
  ctx.lineTo(cx, cy + bob);
  ctx.closePath();
  ctx.fill();

  // Omnitrix
  drawOmnitrixBadge(ctx, cx, cy - 2 + bob, 4);
  ctx.restore();

  // Scissor Claws
  ctx.save();
  ctx.fillStyle = '#00d2ff';
  let armOffset = row === 4 ? col * 15 : 0;
  ctx.fillRect(cx + 8 + armOffset, cy - 6 + bob, 14, 5);
  ctx.fillRect(cx - 18, cy - 6 + bob, 10, 5);
  ctx.restore();

  // Legs with Roller Balls
  ctx.save();
  ctx.fillStyle = '#111827';
  ctx.strokeStyle = '#00d2ff';
  ctx.lineWidth = 1.5;

  let lX = cx - 7;
  let rX = cx + 7;
  if (isRunning) {
    lX -= col * 3;
    rX += col * 3;
  }

  // Legs
  ctx.fillRect(lX - 3, cy + 18 + bob, 6, 26);
  ctx.fillRect(rX - 3, cy + 18 + bob, 6, 26);

  // Roller Balls on feet!
  ctx.fillStyle = '#00ffff';
  ctx.beginPath();
  ctx.arc(lX, cy + 46 + bob, 5, 0, Math.PI * 2);
  ctx.arc(rX, cy + 46 + bob, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// -------------------------------------------------------------
// 4. DIAMONDHEAD (Petrosapien) - Cyan Crystal Shards, Blades
// -------------------------------------------------------------
function drawDiamondhead(ctx: CanvasRenderingContext2D, cx: number, cy: number, row: number, col: number, t: number) {
  const bob = Math.sin(col * 1.5) * 2;
  const isAttack = row === 4 && col <= 2;

  // Back Crystal Spikes
  ctx.save();
  ctx.fillStyle = '#00ffa6';
  ctx.strokeStyle = '#008558';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  // Left giant crystal horn
  ctx.moveTo(cx - 12, cy - 10 + bob);
  ctx.lineTo(cx - 28, cy - 35 + bob);
  ctx.lineTo(cx - 6, cy - 20 + bob);
  // Right giant crystal horn
  ctx.moveTo(cx + 12, cy - 10 + bob);
  ctx.lineTo(cx + 28, cy - 35 + bob);
  ctx.lineTo(cx + 6, cy - 20 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Crystal Head
  ctx.save();
  ctx.fillStyle = '#00ffa6';
  ctx.strokeStyle = '#006644';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 40 + bob);
  ctx.lineTo(cx + 10, cy - 28 + bob);
  ctx.lineTo(cx + 6, cy - 16 + bob);
  ctx.lineTo(cx - 6, cy - 16 + bob);
  ctx.lineTo(cx - 10, cy - 28 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Yellow Eye
  ctx.fillStyle = '#ffee00';
  ctx.fillRect(cx - 4, cy - 26 + bob, 8, 3);
  ctx.restore();

  // Torso - Half Black / Half White Uniform with Crystal Core
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(cx - 14, cy - 14 + bob, 14, 30, 4);
  ctx.fill();

  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.roundRect(cx, cy - 14 + bob, 14, 30, 4);
  ctx.fill();

  // Omnitrix
  drawOmnitrixBadge(ctx, cx - 6, cy - 6 + bob, 4.5);
  ctx.restore();

  // Arms - Crystal Blade Arms
  ctx.save();
  ctx.fillStyle = '#00ffa6';
  ctx.strokeStyle = '#006644';
  ctx.lineWidth = 1.5;

  let rArm = cx + 16;
  if (isAttack) rArm += col * 16;

  // Left arm
  ctx.beginPath();
  ctx.moveTo(cx - 14, cy - 8 + bob);
  ctx.lineTo(cx - 26, cy + 12 + bob);
  ctx.lineTo(cx - 18, cy + 20 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Right Blade arm
  ctx.beginPath();
  ctx.moveTo(cx + 14, cy - 8 + bob);
  ctx.lineTo(rArm + 16, cy + bob);
  ctx.lineTo(rArm, cy + 14 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Legs - Crystal Pillars
  ctx.save();
  ctx.fillStyle = '#111';
  ctx.fillRect(cx - 12, cy + 16 + bob, 10, 32);
  ctx.fillStyle = '#00ffa6';
  ctx.fillRect(cx + 2, cy + 16 + bob, 10, 32);
  ctx.restore();
}

// -------------------------------------------------------------
// 5. WILDMUTT (Vulpimancer) - Quadruped Orange Beast, Gills, Fangs
// -------------------------------------------------------------
function drawWildmutt(ctx: CanvasRenderingContext2D, cx: number, cy: number, row: number, col: number, t: number) {
  const bob = Math.sin(col * 2) * 3;
  const isAttack = row === 4 && col <= 2;
  const isPounce = row === 8;

  // Athletic Beast Body (low quadruped hunch)
  ctx.save();
  ctx.fillStyle = '#e85d04';
  ctx.strokeStyle = '#9d0208';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 5 + bob, 26, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Omnitrix on Shoulder Harness
  drawOmnitrixBadge(ctx, cx - 12, cy - 2 + bob, 4.5);
  ctx.restore();

  // Beast Head with Big Fanged Jaws & Gills (no eyes!)
  ctx.save();
  ctx.fillStyle = '#e85d04';
  ctx.strokeStyle = '#9d0208';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx + 20, cy - 6 + bob, 14, 11, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Gills on neck
  ctx.strokeStyle = '#370617';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx + 8, cy - 10 + bob);
  ctx.lineTo(cx + 8, cy - 2 + bob);
  ctx.moveTo(cx + 12, cy - 12 + bob);
  ctx.lineTo(cx + 12, cy - 4 + bob);
  ctx.stroke();

  // Jaws with Razor Fangs
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx + 24, cy - 3 + bob);
  ctx.lineTo(cx + 32, cy - 3 + bob);
  ctx.lineTo(cx + 28, cy + 4 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Four Paws
  ctx.save();
  ctx.fillStyle = '#dc2f02';
  ctx.strokeStyle = '#6a040f';
  ctx.lineWidth = 1.5;

  // Front Paws
  let fArm = cx + 14;
  if (isAttack) fArm += col * 14;
  ctx.beginPath();
  ctx.roundRect(fArm, cy + 12 + bob, 9, 32, 4);
  ctx.roundRect(cx + 4, cy + 14 + bob, 9, 30, 4);
  // Hind Paws
  ctx.roundRect(cx - 22, cy + 12 + bob, 10, 32, 4);
  ctx.roundRect(cx - 12, cy + 14 + bob, 10, 30, 4);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// -------------------------------------------------------------
// 6. UPGRADE (Galvanic Mechamorph) - Black & Neon Green Circuitry
// -------------------------------------------------------------
function drawUpgrade(ctx: CanvasRenderingContext2D, cx: number, cy: number, row: number, col: number, t: number) {
  const bob = Math.sin(col * 1.5) * 2;
  const isLaser = row === 7;
  const isPunch = row === 4 && col <= 2;

  // Head - Cyclopean Eye
  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(cx, cy - 24 + bob, 12, 0, Math.PI * 2);
  ctx.fill();

  // Glowing Green Eye Ring & Core
  ctx.fillStyle = '#00ff66';
  ctx.beginPath();
  ctx.arc(cx, cy - 24 + bob, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy - 24 + bob, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Laser beam during special1
  if (isLaser) {
    ctx.fillStyle = 'rgba(0, 255, 102, 0.7)';
    ctx.fillRect(cx + 6, cy - 27 + bob, 50 + col * 20, 6);
  }
  ctx.restore();

  // Torso - Deep black with glowing green circuit traces
  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#00ff66';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cx - 14, cy - 12 + bob, 28, 30, 6);
  ctx.fill();
  ctx.stroke();

  // Animated Circuit Lines
  ctx.strokeStyle = '#39ff14';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy - 6 + bob);
  ctx.lineTo(cx - 2, cy - 6 + bob);
  ctx.lineTo(cx - 2, cy + 8 + bob);
  ctx.lineTo(cx + 8, cy + 8 + bob);
  ctx.stroke();

  // Circuit Nodes
  ctx.fillStyle = '#00ff66';
  ctx.beginPath();
  ctx.arc(cx - 10, cy - 6 + bob, 2, 0, Math.PI * 2);
  ctx.arc(cx + 8, cy + 8 + bob, 2, 0, Math.PI * 2);
  ctx.fill();

  // Omnitrix
  drawOmnitrixBadge(ctx, cx, cy + bob, 4.5);
  ctx.restore();

  // Morphing Arms
  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#00ff66';
  ctx.lineWidth = 1.5;

  let rArm = cx + 18;
  if (isPunch) {
    // Morphed cyber hammer
    rArm += col * 12;
    ctx.fillStyle = '#00ff66';
    ctx.fillRect(rArm + 4, cy - 14 + bob, 14, 24);
  }

  ctx.beginPath();
  ctx.roundRect(cx - 20, cy - 8 + bob, 8, 26, 4);
  ctx.roundRect(rArm - 4, cy - 8 + bob, 8, 26, 4);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Legs
  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#00ff66';
  ctx.lineWidth = 1.5;
  ctx.fillRect(cx - 10, cy + 18 + bob, 8, 30);
  ctx.fillRect(cx + 2, cy + 18 + bob, 8, 30);
  ctx.restore();
}

// -------------------------------------------------------------
// 7. GHOSTFREAK (Ectonurite) - Spectral Shroud, Eye Track, Tentacles
// -------------------------------------------------------------
function drawGhostfreak(ctx: CanvasRenderingContext2D, cx: number, cy: number, row: number, col: number, t: number) {
  const floatBob = Math.sin(col * 1.5) * 4;
  const isPhase = row === 7;
  const isTentacles = row === 8;

  // Floating Wispy Shroud (No normal legs!)
  ctx.save();
  ctx.fillStyle = isPhase ? 'rgba(200, 205, 215, 0.45)' : '#d1d5db';
  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  // Rounded ghostly hood
  ctx.arc(cx, cy - 24 + floatBob, 14, Math.PI, 0);
  // Flowing torso
  ctx.lineTo(cx + 14, cy + 10 + floatBob);
  // Tapered swirling ghost tail
  const tailSway = Math.sin(col * 2) * 8;
  ctx.quadraticCurveTo(cx + 10, cy + 35 + floatBob, cx - 4 + tailSway, cy + 46 + floatBob);
  ctx.quadraticCurveTo(cx - 12, cy + 30 + floatBob, cx - 14, cy + 10 + floatBob);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Diagonal Eye Track Groove
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy - 28 + floatBob);
  ctx.lineTo(cx + 8, cy - 14 + floatBob);
  ctx.stroke();

  // Creeping Purple Pupil inside track
  ctx.fillStyle = '#7c3aed';
  const pupilPos = Math.sin(col) * 4;
  ctx.beginPath();
  ctx.arc(cx - 2 + pupilPos, cy - 21 + floatBob + pupilPos * 0.7, 3, 0, Math.PI * 2);
  ctx.fill();

  // Omnitrix inside chest fold
  drawOmnitrixBadge(ctx, cx, cy - 4 + floatBob, 4);
  ctx.restore();

  // Dark Tentacles during special attacks
  if (isTentacles) {
    ctx.save();
    ctx.strokeStyle = '#3b0764';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy + floatBob);
    ctx.quadraticCurveTo(cx + 25, cy - 10 + floatBob, cx + 45 + col * 8, cy + 5 + floatBob);
    ctx.moveTo(cx, cy + 5 + floatBob);
    ctx.quadraticCurveTo(cx + 20, cy + 20 + floatBob, cx + 40 + col * 6, cy + 28 + floatBob);
    ctx.stroke();
    ctx.restore();
  }
}

// -------------------------------------------------------------
// 8. CANNONBOLT (Arburian Pelarota) - Bulky Shell, Ball Form
// -------------------------------------------------------------
function drawCannonbolt(ctx: CanvasRenderingContext2D, cx: number, cy: number, row: number, col: number, t: number) {
  const bob = Math.sin(col * 1.5) * 2;
  const isRolling = (row >= 7 && row <= 9) || row === 2;

  if (isRolling) {
    // Rolled into dense armored sphere!
    ctx.save();
    const rot = col * 1.2;
    ctx.translate(cx, cy + 10);
    ctx.rotate(rot);

    // Outer Armored Shell
    ctx.fillStyle = '#f4a261';
    ctx.strokeStyle = '#e76f51';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Black & White center band
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-8, -26, 16, 52);
    ctx.fillStyle = '#111111';
    ctx.fillRect(-3, -26, 6, 52);

    // Omnitrix
    drawOmnitrixBadge(ctx, 0, 0, 5);
    ctx.restore();
    return;
  }

  // Heavy Rounded Body
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#e76f51';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy + bob, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Yellow Shell Armor on back and shoulders
  ctx.fillStyle = '#f4a261';
  ctx.beginPath();
  ctx.arc(cx - 16, cy - 10 + bob, 12, 0, Math.PI * 2);
  ctx.arc(cx + 16, cy - 10 + bob, 12, 0, Math.PI * 2);
  ctx.fill();

  // Black center stripe
  ctx.fillStyle = '#111';
  ctx.fillRect(cx - 4, cy - 18 + bob, 8, 36);

  // Omnitrix on Chest
  drawOmnitrixBadge(ctx, cx, cy - 6 + bob, 4.5);
  ctx.restore();

  // Head
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy - 24 + bob, 11, 0, Math.PI * 2);
  ctx.fill();
  // Small eyes
  ctx.fillStyle = '#00ff66';
  ctx.fillRect(cx - 4, cy - 25 + bob, 2.5, 2.5);
  ctx.fillRect(cx + 2, cy - 25 + bob, 2.5, 2.5);
  ctx.restore();

  // Heavy Arms with Shell Guards
  ctx.save();
  ctx.fillStyle = '#f4a261';
  ctx.strokeStyle = '#e76f51';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cx - 28, cy - 8 + bob, 12, 28, 6);
  ctx.roundRect(cx + 16, cy - 8 + bob, 12, 28, 6);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Heavy Stumpy Legs
  ctx.save();
  ctx.fillStyle = '#111';
  ctx.fillRect(cx - 14, cy + 20 + bob, 11, 26);
  ctx.fillRect(cx + 3, cy + 20 + bob, 11, 26);
  ctx.restore();
}

// -------------------------------------------------------------
// 9. STINKFLY (Lepidopterran) - Insectoid, 4 Eye Stalks, Wings, Stinger
// -------------------------------------------------------------
function drawStinkfly(ctx: CanvasRenderingContext2D, cx: number, cy: number, row: number, col: number, t: number) {
  const hoverBob = Math.sin(col * 2.5) * 4;
  const isSlime = row === 8;

  // Fluttering Insect Wings (Animated!)
  ctx.save();
  const wingAngle = Math.sin(col * 3) * 0.4;
  ctx.fillStyle = 'rgba(180, 230, 160, 0.55)';
  ctx.strokeStyle = '#588157';
  ctx.lineWidth = 1;

  // Left Wing
  ctx.beginPath();
  ctx.ellipse(cx - 20, cy - 20 + hoverBob, 18, 9, -0.4 + wingAngle, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right Wing
  ctx.beginPath();
  ctx.ellipse(cx + 20, cy - 20 + hoverBob, 18, 9, 0.4 - wingAngle, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Curved Stinger Tail
  ctx.save();
  ctx.strokeStyle = '#386641';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy + 10 + hoverBob);
  ctx.quadraticCurveTo(cx - 25, cy + 25 + hoverBob, cx - 28, cy - 5 + hoverBob);
  ctx.stroke();

  // Tail Stinger Barb
  ctx.fillStyle = '#bc4749';
  ctx.beginPath();
  ctx.moveTo(cx - 28, cy - 5 + hoverBob);
  ctx.lineTo(cx - 22, cy - 2 + hoverBob);
  ctx.lineTo(cx - 28, cy + 4 + hoverBob);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Insect Torso
  ctx.save();
  ctx.fillStyle = '#606c38';
  ctx.strokeStyle = '#283618';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy + hoverBob, 13, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Omnitrix
  drawOmnitrixBadge(ctx, cx, cy - 2 + hoverBob, 4);
  ctx.restore();

  // 4 Eye Stalks!
  ctx.save();
  ctx.strokeStyle = '#283618';
  ctx.lineWidth = 1.5;
  ctx.fillStyle = '#ffb703';

  // 4 Stalks
  [
    { sx: -8, sy: -22, ex: -16, ey: -32 },
    { sx: -4, sy: -24, ex: -8, ey: -36 },
    { sx: 4, sy: -24, ex: 8, ey: -36 },
    { sx: 8, sy: -22, ex: 16, ey: -32 },
  ].forEach(s => {
    ctx.beginPath();
    ctx.moveTo(cx + s.sx, cy + s.sy + hoverBob);
    ctx.lineTo(cx + s.ex, cy + s.ey + hoverBob);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx + s.ex, cy + s.ey + hoverBob, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // Slime spitting effect
  if (isSlime) {
    ctx.save();
    ctx.fillStyle = 'rgba(167, 201, 87, 0.85)';
    ctx.beginPath();
    ctx.arc(cx + 18 + col * 12, cy - 10 + hoverBob, 6 + col * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 4 Insect Legs
  ctx.save();
  ctx.strokeStyle = '#283618';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + 12 + hoverBob);
  ctx.lineTo(cx - 14, cy + 32 + hoverBob);
  ctx.moveTo(cx + 6, cy + 12 + hoverBob);
  ctx.lineTo(cx + 14, cy + 32 + hoverBob);
  ctx.stroke();
  ctx.restore();
}

// -------------------------------------------------------------
// 10. RIPJAWS (Piscciss Volann) - Angler Lure, Jaws, Fin Tail
// -------------------------------------------------------------
function drawRipjaws(ctx: CanvasRenderingContext2D, cx: number, cy: number, row: number, col: number, t: number) {
  const bob = Math.sin(col * 1.5) * 2;
  const isBite = (row === 7) || (row === 4 && col <= 2);

  // Bioluminescent Angler Lure Antenna
  ctx.save();
  ctx.strokeStyle = '#0077b6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 28 + bob);
  ctx.quadraticCurveTo(cx + 8, cy - 44 + bob, cx + 18, cy - 38 + bob);
  ctx.stroke();

  // Glowing Lure Bulb
  ctx.fillStyle = '#00ffff';
  ctx.beginPath();
  ctx.arc(cx + 18, cy - 38 + bob, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Head & Massive Hinged Jaws
  ctx.save();
  ctx.fillStyle = '#0096c7';
  ctx.beginPath();
  ctx.arc(cx, cy - 22 + bob, 12, 0, Math.PI * 2);
  ctx.fill();

  // Black eyes
  ctx.fillStyle = '#000814';
  ctx.beginPath();
  ctx.arc(cx - 4, cy - 24 + bob, 2.5, 0, Math.PI * 2);
  ctx.arc(cx + 4, cy - 24 + bob, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Massive Gaping Jaws with sharp needle teeth
  ctx.fillStyle = '#ffffff';
  let jawOpen = isBite ? 10 + col * 3 : 4;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 16 + bob);
  ctx.lineTo(cx + 8, cy - 16 + bob);
  ctx.lineTo(cx, cy - 16 + jawOpen + bob);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Torso - Aquatic armor & Omnitrix
  ctx.save();
  ctx.fillStyle = '#023e8a';
  ctx.strokeStyle = '#00b4d8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cx - 12, cy - 12 + bob, 24, 28, 4);
  ctx.fill();
  ctx.stroke();

  // Omnitrix
  drawOmnitrixBadge(ctx, cx, cy - 2 + bob, 4.5);
  ctx.restore();

  // Webbed Claw Arms
  ctx.save();
  ctx.fillStyle = '#0096c7';
  ctx.strokeStyle = '#0077b6';
  ctx.lineWidth = 1.5;
  let rArm = cx + 14;
  if (isBite) rArm += col * 12;
  ctx.beginPath();
  ctx.roundRect(cx - 20, cy - 8 + bob, 9, 24, 3);
  ctx.roundRect(rArm, cy - 8 + bob, 9, 24, 3);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Legs & Aquatic Tail Fin
  ctx.save();
  ctx.fillStyle = '#0077b6';
  ctx.fillRect(cx - 9, cy + 16 + bob, 7, 28);
  ctx.fillRect(cx + 2, cy + 16 + bob, 7, 28);

  // Fin behind legs
  ctx.fillStyle = 'rgba(0, 180, 216, 0.7)';
  ctx.beginPath();
  ctx.moveTo(cx, cy + 20 + bob);
  ctx.lineTo(cx - 16, cy + 42 + bob);
  ctx.lineTo(cx + 16, cy + 42 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

