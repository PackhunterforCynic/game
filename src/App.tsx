import React from 'react';
import { useGameStore } from './store/gameStore';
import { IntroScreen } from './components/IntroScreen';
import { MainMenuScreen } from './components/MainMenuScreen';
import { CharacterSelectScreen } from './components/CharacterSelectScreen';
import { ArenaSelectScreen } from './components/ArenaSelectScreen';
import { VSScreen } from './components/VSScreen';
import { BattleScreen } from './components/BattleScreen';
import { ResultScreen } from './components/ResultScreen';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { CharacterCollectionModal } from './components/CharacterCollectionModal';
import { OnlineRoomModal } from './components/OnlineRoomModal';
import { MobileOrientationGuard } from './components/MobileOrientationGuard';

export const App: React.FC = () => {
  const currentScreen = useGameStore((state) => state.currentScreen);

  return (
    <main className="w-screen h-screen bg-black text-white overflow-hidden relative font-sans">
      {/* Dynamic Screen Routing */}
      {currentScreen === 'INTRO' && <IntroScreen />}
      {currentScreen === 'MAIN_MENU' && <MainMenuScreen />}
      {currentScreen === 'CHARACTER_SELECT' && <CharacterSelectScreen />}
      {currentScreen === 'ARENA_SELECT' && <ArenaSelectScreen />}
      {currentScreen === 'VS_SCREEN' && <VSScreen />}
      {currentScreen === 'BATTLE' && <BattleScreen />}
      {currentScreen === 'RESULT' && <ResultScreen />}

      {/* Global Modals & Mobile Orientation Guard */}
      <MobileOrientationGuard />
      <HowToPlayModal />
      <SettingsModal />
      <CharacterCollectionModal />
      <OnlineRoomModal />
    </main>
  );
};

export default App;
