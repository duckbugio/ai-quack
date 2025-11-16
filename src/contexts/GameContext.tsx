import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameState, CharacterOption } from '../types/game.types';
import { soundManager } from '../game/utils/SoundManager';
import { CHARACTERS, DEFAULT_CHARACTER_ID } from '../game/utils/characters';

/**
 * Интерфейс контекста игры
 * Содержит состояние игры и методы для управления им
 */
interface GameContextType {
  gameState: GameState;
  score: number;
  highScore: number;
  soundEnabled: boolean;
  selectedCharacter: CharacterOption;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  gameOver: () => void;
  resetGame: () => void;
  incrementScore: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSelectedCharacter: (characterId: string) => void;
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

  // Выбранный персонаж (палитра)
  const [selectedCharacter, setSelectedCharacterState] = useState<CharacterOption>(() => {
    try {
      const saved = localStorage.getItem('duck-game-selected-character');
      const fallback = CHARACTERS.find((c) => c.id === DEFAULT_CHARACTER_ID) || CHARACTERS[0];
      if (saved) {
        const found = CHARACTERS.find((c) => c.id === saved);
        return found || fallback;
      }
      return fallback;
    } catch {
      return CHARACTERS[0];
    }
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

  const setSelectedCharacter = (characterId: string) => {
    const found = CHARACTERS.find((c) => c.id === characterId);
    if (!found) return;
    setSelectedCharacterState(found);
    try {
      localStorage.setItem('duck-game-selected-character', found.id);
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
        selectedCharacter,
        startGame,
        pauseGame,
        resumeGame,
        gameOver,
        resetGame,
        incrementScore,
        setSoundEnabled,
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
