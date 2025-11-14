import { createContext, useContext, useState, ReactNode } from 'react';
import { GameState } from '../types/game.types';

/**
 * Интерфейс контекста игры
 * Содержит состояние игры и методы для управления им
 */
interface GameContextType {
  gameState: GameState;
  score: number;
  highScore: number;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  gameOver: () => void;
  resetGame: () => void;
  incrementScore: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

/**
 * Провайдер контекста игры
 * Управляет состоянием игры, счетом и лучшим результатом
 */
export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem('duck-game-highscore');
      if (saved) {
        const parsed = parseInt(saved, 10);
        // Валидация: проверяем, что это валидное неотрицательное число
        if (!isNaN(parsed) && parsed >= 0) {
          return parsed;
        }
      }
    } catch (error) {
      // localStorage может быть недоступен (например, в приватном режиме)
      console.warn('Не удалось загрузить лучший результат из localStorage:', error);
    }
    return 0;
  });
  
  const startGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
  };
  
  const pauseGame = () => setGameState(GameState.PAUSED);
  const resumeGame = () => setGameState(GameState.PLAYING);
  
  const gameOver = () => {
    setGameState(GameState.GAME_OVER);
    if (score > highScore) {
      const newHighScore = score;
      setHighScore(newHighScore);
      try {
        localStorage.setItem('duck-game-highscore', newHighScore.toString());
      } catch (error) {
        // localStorage может быть недоступен (например, переполнение или приватный режим)
        console.warn('Не удалось сохранить лучший результат в localStorage:', error);
      }
    }
  };
  
  const resetGame = () => {
    setGameState(GameState.MENU);
    setScore(0);
  };

  const incrementScore = () => setScore((prev) => prev + 1);

  return (
    <GameContext.Provider
      value={{
        gameState,
        score,
        highScore,
        startGame,
        pauseGame,
        resumeGame,
        gameOver,
        resetGame,
        incrementScore,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

/**
 * Хук для использования контекста игры
 * @throws Error если используется вне GameProvider
 * @returns Контекст игры
 */
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
