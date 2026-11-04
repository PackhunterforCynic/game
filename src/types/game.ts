export type ScreenType = 
  | 'INTRO'
  | 'MAIN_MENU'
  | 'CHARACTER_SELECT'
  | 'ARENA_SELECT'
  | 'VS_SCREEN'
  | 'BATTLE'
  | 'RESULT';

export type GameMode = 'vs-cpu' | 'local-pvp' | 'online-pvp';

export type AIDifficulty = 'easy' | 'normal' | 'hard';

export type AlienId = 
  | 'heatblast'
  | 'fourarms'
  | 'xlr8'
  | 'diamondhead'
  | 'wildmutt'
  | 'upgrade'
  | 'ghostfreak'
  | 'cannonbolt'
  | 'stinkfly'
  | 'ripjaws';

export type ArenaId = 'bellwood' | 'nullvoid' | 'alienplanet';

export interface AttackMove {
  id: string;
  name: string;
  type: 'punch' | 'kick' | 'grab' | 'special' | 'ultimate';
  damage: number;
  energyCost: number;
  cooldownMs: number;
  range: number;
  knockback: { x: number; y: number };
  hitStopMs: number;
  description: string;
  isProjectile?: boolean;
  projectileSpeed?: number;
  projectileColor?: string;
  effectType?: 'fire' | 'smash' | 'sonic' | 'crystal' | 'beast' | 'tech' | 'ghost' | 'roll' | 'slime' | 'water';
}

export interface CharacterStats {
  health: number;      // e.g. 900 - 1300
  attack: number;      // 1 - 10 rating
  defense: number;     // 1 - 10 rating
  speed: number;       // walk/run speed multiplier
  jumpForce: number;   // jump vertical impulse
}

export interface CharacterData {
  id: AlienId;
  name: string;
  species: string;
  homeworld: string;
  element: string;
  quote: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  glowColor: string;
  stats: CharacterStats;
  punch: AttackMove;
  kick: AttackMove;
  grab: AttackMove;
  special1: AttackMove;
  special2: AttackMove;
  special3: AttackMove;
  ultimate: AttackMove;
}

export interface ArenaData {
  id: ArenaId;
  name: string;
  subtitle: string;
  description: string;
  primaryColor: string;
  skyColorTop: string;
  skyColorBottom: string;
  groundColor: string;
  accentColor: string;
  particleType: 'sparks' | 'void' | 'spores';
  musicTempo: number;
}

export interface FighterInputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  punch: boolean;
  kick: boolean;
  grab: boolean;
  special1: boolean;
  special2: boolean;
  special3: boolean;
  ultimate: boolean;
  block: boolean;
}

export interface MatchStats {
  winner: 1 | 2;
  player1Character: AlienId;
  player2Character: AlienId;
  durationSeconds: number;
  p1DamageDealt: number;
  p2DamageDealt: number;
  p1MaxCombo: number;
  p2MaxCombo: number;
  p1SpecialsUsed: number;
  p2SpecialsUsed: number;
  p1UltimatesUsed: number;
  p2UltimatesUsed: number;
}

export interface AudioSettings {
  sfxVolume: number; // 0 to 1
  musicVolume: number; // 0 to 1
  voiceVolume: number; // 0 to 1
  muted: boolean;
}

