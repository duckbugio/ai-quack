import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameState } from '../types/game.types';
import { soundManager } from '../game/utils/SoundManager';

interface GameContextType {
  gameState: GameState;
  score: number;
  highScore: number;
  soundEnabled: boolean;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  gameOver: () => void;
  resetGame: () => void;
  incrementScore: () => void;
  setSoundEnabled: (enabled: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem('duck-game-highscore');
      if (saved) {
        const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed >= 0) {
          return parsed;
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Не удалось загрузить лучший результат из localStorage:', error);
      }
    }
    return 0;
  });
  
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    try {
      const saved = localStorage.getItem('duck-game-sound-enabled');
      if (saved !== null) {
        return saved === 'true';
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Не удалось загрузить настройку звуков из localStorage:', error);
      }
    }
    return true;
  });
  
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);
  
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
      soundManager.play('score');
      try {
        localStorage.setItem('duck-game-highscore', newHighScore.toString());
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Не удалось сохранить лучший результат в localStorage:', error);
        }
      }
    }
  };
  
  const resetGame = () => {
    setGameState(GameState.MENU);
    setScore(0);
  };

  const incrementScore = () => setScore((prev) => prev + 1);
  
  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    soundManager.setEnabled(enabled);
    try {
      localStorage.setItem('duck-game-sound-enabled', enabled.toString());
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Не удалось сохранить настройку звуков в localStorage:', error);
      }
    }
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        score,
        highScore,
        soundEnabled,
        startGame,
        pauseGame,
        resumeGame,
        gameOver,
        resetGame,
        incrementScore,
        setSoundEnabled,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
