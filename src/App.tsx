import { GameProvider, useGame } from './contexts/GameContext';
import { GameCanvas } from './components/Game/GameCanvas';
import { MainMenu } from './components/UI/MainMenu';
import { PauseMenu } from './components/UI/PauseMenu';
import { GameOverMenu } from './components/UI/GameOverMenu';
import { PerformanceOverlay } from './components/UI/PerformanceOverlay';
import { GameState } from './types/game.types';
import { useState } from 'react';
import './App.css';

/**
 * Компонент содержимого приложения
 * Использует контекст игры для условного рендеринга
 */
const AppContent = () => {
  const { gameState } = useGame();
  
  // Проверяем, включен ли overlay производительности через localStorage
  // Можно включить через консоль: localStorage.setItem('duck-game-show-performance', 'true')
  // Используем useState для оптимизации (проверка только при монтировании компонента)
  const [showPerformance] = useState(() => {
    return localStorage.getItem('duck-game-show-performance') === 'true';
  });
  
  return (
    <div className="app-container">
      <GameCanvas />
      {gameState === GameState.MENU && <MainMenu />}
      {gameState === GameState.PAUSED && <PauseMenu />}
      {gameState === GameState.GAME_OVER && <GameOverMenu />}
      <PerformanceOverlay enabled={showPerformance} />
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
