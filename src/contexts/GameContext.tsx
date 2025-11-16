import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameState } from '../types/game.types';
import { soundManager } from '../game/utils/SoundManager';

/**
 * Интерфейс контекста игры
 * Содержит состояние игры и методы для управления им
 */
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
  selectedCharacter: import('../types/game.types').CharacterType;
  setSelectedCharacter: (character: import('../types/game.types').CharacterType) => void;
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
    return true; // По умолчанию звуки включены
  });
  
  const [selectedCharacter, setSelectedCharacterState] = useState<import('../types/game.types').CharacterType>(() => {
    try {
      const saved = localStorage.getItem('duck-game-character');
      if (saved === 'classic' || saved === 'blue' || saved === 'green' || saved === 'red' || saved === 'orange') {
        return saved as import('../types/game.types').CharacterType;
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Не удалось загрузить выбранного персонажа из localStorage:', error);
      }
    }
    return 'classic';
  });
  
  // Синхронизация состояния звуков с SoundManager при инициализации и изменении
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
      // Проигрываем звук при установке нового рекорда
      // Используем звук score, так как это достижение
      soundManager.play('score');
      try {
        localStorage.setItem('duck-game-highscore', newHighScore.toString());
      } catch (error) {
        // localStorage может быть недоступен (например, переполнение или приватный режим)
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

  const setSelectedCharacter = (character: import('../types/game.types').CharacterType) => {
    setSelectedCharacterState(character);
    try {
      localStorage.setItem('duck-game-character', character);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('Не удалось сохранить выбранного персонажа в localStorage:', error);
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
        selectedCharacter,
        setSelectedCharacter,
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
