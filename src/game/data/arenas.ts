import { ArenaData, ArenaId } from '../../types/game';

export const ARENAS: Record<ArenaId, ArenaData> = {
  bellwood: {
    id: 'bellwood',
    name: 'Bellwood City',
    subtitle: 'Earth - Plumber Base Sector',
    description: 'The familiar streets of Ben Tennyson’s hometown under a twilight sky. Neon billboards glow as Plumber HQ scans the perimeter for alien threats.',
    primaryColor: '#00ff66',
    skyColorTop: '#0a192f',
    skyColorBottom: '#1e3a5f',
    groundColor: '#1a1e24',
    accentColor: '#38bdf8',
    particleType: 'sparks',
    musicTempo: 128,
  },
  nullvoid: {
    id: 'nullvoid',
    name: 'Null Void',
    subtitle: 'Interdimensional Prison Dimension',
    description: 'A perilous, lawless pocket dimension of red perpetual storms, drifting asteroid chunks, and forgotten extradimensional penal facilities.',
    primaryColor: '#ef4444',
    skyColorTop: '#2b0707',
    skyColorBottom: '#5c1212',
    groundColor: '#361111',
    accentColor: '#f97316',
    particleType: 'void',
    musicTempo: 138,
  },
  alienplanet: {
    id: 'alienplanet',
    name: 'Galvan Prime',
    subtitle: 'Galvanic Homeworld - Tech Spires',
    description: 'The pinnacle of extraterrestrial civilization, birthplace of the Omnitrix. Gleaming chrome spires, floating magnetic rings, and rivers of living nanotech.',
    primaryColor: '#10b981',
    skyColorTop: '#041f17',
    skyColorBottom: '#064e3b',
    groundColor: '#022c22',
    accentColor: '#34d399',
    particleType: 'spores',
    musicTempo: 132,
  },
};

export const ARENA_IDS: ArenaId[] = ['bellwood', 'nullvoid', 'alienplanet'];

