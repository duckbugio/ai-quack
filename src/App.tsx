import { GameProvider, useGame } from './contexts/GameContext';
import { GameCanvas } from './components/Game/GameCanvas';
import { MainMenu } from './components/UI/MainMenu';
import { GameState } from './types/game.types';
import './App.css';

/**
 * Компонент содержимого приложения
 * Использует контекст игры для условного рендеринга
 */
const AppContent = () => {
  const { gameState } = useGame();
  
  return (
    <div className="app-container">
      <GameCanvas />
      {gameState === GameState.MENU && <MainMenu />}
    </div>
  );
};

/**
 * Главный компонент приложения
 */
function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
