import { create } from 'zustand';
import { 
  ScreenType, 
  GameMode, 
  AIDifficulty, 
  AlienId, 
  ArenaId, 
  MatchStats, 
  AudioSettings 
} from '../types/game';

interface GameState {
  currentScreen: ScreenType;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  player1Character: AlienId;
  player2Character: AlienId;
  selectedArena: ArenaId;
  isPlayer1Ready: boolean;
  isPlayer2Ready: boolean;
  
  // Round system
  currentRound: number;
  p1RoundsWon: number;
  p2RoundsWon: number;
  roundsToWin: number;
  
  // Match stats
  lastMatchStats: MatchStats | null;
  
  // Modals & overlay flags
  showHowToPlay: boolean;
  showSettings: boolean;
  showCollection: boolean;
  showOnlineModal: boolean;
  onlineRoomCode: string;
  isHost: boolean;
  isPaused: boolean;
  
  // Audio settings
  audioSettings: AudioSettings;

  // Actions
  setScreen: (screen: ScreenType) => void;
  setGameMode: (mode: GameMode) => void;
  setDifficulty: (diff: AIDifficulty) => void;
  selectCharacter: (player: 1 | 2, alien: AlienId) => void;
  randomizeCharacter: (player: 1 | 2) => void;
  setArena: (arena: ArenaId) => void;
  setPlayerReady: (player: 1 | 2, ready: boolean) => void;
  startVsTransition: () => void;
  startBattle: () => void;
  recordRoundWinner: (winner: 1 | 2) => { matchOver: boolean; winner: 1 | 2 | null };
  finishMatch: (stats: MatchStats) => void;
  rematch: () => void;
  returnToCharacterSelect: () => void;
  returnToMainMenu: () => void;
  
  // Modal toggles
  setShowHowToPlay: (val: boolean) => void;
  setShowSettings: (val: boolean) => void;
  setShowCollection: (val: boolean) => void;
  setShowOnlineModal: (val: boolean) => void;
  setOnlineRoomCode: (code: string, isHost?: boolean) => void;
  setPaused: (val: boolean) => void;
  
  // Audio
  updateAudioSettings: (settings: Partial<AudioSettings>) => void;
}

const ALIEN_LIST: AlienId[] = [
  'heatblast',
  'fourarms',
  'xlr8',
  'diamondhead',
  'wildmutt',
  'upgrade',
  'ghostfreak',
  'cannonbolt',
  'stinkfly',
  'ripjaws',
];

export const useGameStore = create<GameState>((set, get) => ({
  currentScreen: 'INTRO',
  gameMode: 'vs-cpu',
  aiDifficulty: 'normal',
  player1Character: 'heatblast',
  player2Character: 'fourarms',
  selectedArena: 'bellwood',
  isPlayer1Ready: false,
  isPlayer2Ready: false,

  currentRound: 1,
  p1RoundsWon: 0,
  p2RoundsWon: 0,
  roundsToWin: 2, // Best of 3

  lastMatchStats: null,

  showHowToPlay: false,
  showSettings: false,
  showCollection: false,
  showOnlineModal: false,
  onlineRoomCode: '',
  isHost: true,
  isPaused: false,

  audioSettings: {
    sfxVolume: 0.8,
    musicVolume: 0.5,
    voiceVolume: 0.9,
    muted: false,
  },

  setScreen: (screen) => set({ currentScreen: screen }),
  setGameMode: (gameMode) => set({ gameMode }),
  setDifficulty: (aiDifficulty) => set({ aiDifficulty }),
  
  selectCharacter: (player, alien) => {
    if (player === 1) {
      set({ player1Character: alien });
    } else {
      set({ player2Character: alien });
    }
  },

  randomizeCharacter: (player) => {
    const randomAlien = ALIEN_LIST[Math.floor(Math.random() * ALIEN_LIST.length)];
    if (player === 1) {
      set({ player1Character: randomAlien });
    } else {
      set({ player2Character: randomAlien });
    }
  },

  setArena: (selectedArena) => set({ selectedArena }),
  
  setPlayerReady: (player, ready) => {
    if (player === 1) {
      set({ isPlayer1Ready: ready });
    } else {
      set({ isPlayer2Ready: ready });
    }
  },

  startVsTransition: () => {
    set({ currentScreen: 'VS_SCREEN' });
  },

  startBattle: () => {
    set({ 
      currentScreen: 'BATTLE',
      currentRound: 1,
      p1RoundsWon: 0,
      p2RoundsWon: 0,
      isPaused: false,
    });
  },

  recordRoundWinner: (winner) => {
    const { p1RoundsWon, p2RoundsWon, roundsToWin, currentRound } = get();
    let newP1Wins = p1RoundsWon;
    let newP2Wins = p2RoundsWon;
    
    if (winner === 1) newP1Wins++;
    else newP2Wins++;

    if (newP1Wins >= roundsToWin) {
      set({ p1RoundsWon: newP1Wins });
      return { matchOver: true, winner: 1 };
    }
    if (newP2Wins >= roundsToWin) {
      set({ p2RoundsWon: newP2Wins });
      return { matchOver: true, winner: 2 };
    }

    set({ 
      p1RoundsWon: newP1Wins, 
      p2RoundsWon: newP2Wins, 
      currentRound: currentRound + 1 
    });
    return { matchOver: false, winner: null };
  },

  finishMatch: (stats) => {
    set({
      lastMatchStats: stats,
      currentScreen: 'RESULT',
      isPaused: false,
    });
  },

  rematch: () => {
    set({
      currentScreen: 'BATTLE',
      currentRound: 1,
      p1RoundsWon: 0,
      p2RoundsWon: 0,
      isPaused: false,
    });
  },

  returnToCharacterSelect: () => {
    set({
      currentScreen: 'CHARACTER_SELECT',
      isPlayer1Ready: false,
      isPlayer2Ready: false,
      isPaused: false,
    });
  },

  returnToMainMenu: () => {
    set({
      currentScreen: 'MAIN_MENU',
      isPlayer1Ready: false,
      isPlayer2Ready: false,
      isPaused: false,
    });
  },

  setShowHowToPlay: (showHowToPlay) => set({ showHowToPlay }),
  setShowSettings: (showSettings) => set({ showSettings }),
  setShowCollection: (showCollection) => set({ showCollection }),
  setShowOnlineModal: (showOnlineModal) => set({ showOnlineModal }),
  setOnlineRoomCode: (onlineRoomCode, isHost = true) => set({ onlineRoomCode, isHost }),
  setPaused: (isPaused) => set({ isPaused }),

  updateAudioSettings: (newSettings) => {
    set((state) => ({
      audioSettings: { ...state.audioSettings, ...newSettings }
    }));
  },
}));

