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
  easterEggs: {
    partyMode: boolean;
    sunglassesUnlocked: boolean;
    rainbowMode: boolean;
    slowmoMode: boolean;
    godMode: boolean;
    invertColors: boolean;
    matrixMode: boolean;
    nightMode: boolean;
    speedMode: boolean;
    bigDuck: boolean;
    tinyDuck: boolean;
    flipMode: boolean;
    doubleJump: boolean;
    reverseGravity: boolean;
    chaosMode: boolean;
    zenMode: boolean;
    glowMode: boolean;
    ninjaMode: boolean;
    shuffleMode: boolean;
    bounceMode: boolean;
    wingsMode: boolean;
    teleportMode: boolean;
    mirrorMode: boolean;
    pixelMode: boolean;
    retroMode: boolean;
    spaceMode: boolean;
    waterMode: boolean;
  };
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  gameOver: () => void;
  resetGame: () => void;
  incrementScore: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setPartyMode: (enabled: boolean) => void;
  unlockSunglasses: () => void;
  setRainbowMode: (enabled: boolean) => void;
  setSlowmoMode: (enabled: boolean) => void;
  setGodMode: (enabled: boolean) => void;
  setInvertColors: (enabled: boolean) => void;
  setMatrixMode: (enabled: boolean) => void;
  setNightMode: (enabled: boolean) => void;
  setSpeedMode: (enabled: boolean) => void;
  setBigDuck: (enabled: boolean) => void;
  setTinyDuck: (enabled: boolean) => void;
  setFlipMode: (enabled: boolean) => void;
  setDoubleJump: (enabled: boolean) => void;
  setReverseGravity: (enabled: boolean) => void;
  setChaosMode: (enabled: boolean) => void;
  setZenMode: (enabled: boolean) => void;
  setGlowMode: (enabled: boolean) => void;
  setNinjaMode: (enabled: boolean) => void;
  setShuffleMode: (enabled: boolean) => void;
  setBounceMode: (enabled: boolean) => void;
  setWingsMode: (enabled: boolean) => void;
  setTeleportMode: (enabled: boolean) => void;
  setMirrorMode: (enabled: boolean) => void;
  setPixelMode: (enabled: boolean) => void;
  setRetroMode: (enabled: boolean) => void;
  setSpaceMode: (enabled: boolean) => void;
  setWaterMode: (enabled: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

/**
 * Провайдер контекста игры
 * Управляет состоянием игры, счетом и лучшим результатом
 */
export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [partyMode, setPartyModeState] = useState<boolean>(false);
  const [sunglassesUnlocked, setSunglassesUnlocked] = useState<boolean>(false);
  const [rainbowMode, setRainbowModeState] = useState<boolean>(false);
  const [slowmoMode, setSlowmoModeState] = useState<boolean>(false);
  const [godMode, setGodModeState] = useState<boolean>(false);
  const [invertColors, setInvertColorsState] = useState<boolean>(false);
  const [matrixMode, setMatrixModeState] = useState<boolean>(false);
  const [nightMode, setNightModeState] = useState<boolean>(false);
  const [speedMode, setSpeedModeState] = useState<boolean>(false);
  const [bigDuck, setBigDuckState] = useState<boolean>(false);
  const [tinyDuck, setTinyDuckState] = useState<boolean>(false);
  const [flipMode, setFlipModeState] = useState<boolean>(false);
  const [doubleJump, setDoubleJumpState] = useState<boolean>(false);
  const [reverseGravity, setReverseGravityState] = useState<boolean>(false);
  const [chaosMode, setChaosModeState] = useState<boolean>(false);
  const [zenMode, setZenModeState] = useState<boolean>(false);
  const [glowMode, setGlowModeState] = useState<boolean>(false);
  const [ninjaMode, setNinjaModeState] = useState<boolean>(false);
  const [shuffleMode, setShuffleModeState] = useState<boolean>(false);
  const [bounceMode, setBounceModeState] = useState<boolean>(false);
  const [wingsMode, setWingsModeState] = useState<boolean>(false);
  const [teleportMode, setTeleportModeState] = useState<boolean>(false);
  const [mirrorMode, setMirrorModeState] = useState<boolean>(false);
  const [pixelMode, setPixelModeState] = useState<boolean>(false);
  const [retroMode, setRetroModeState] = useState<boolean>(false);
  const [spaceMode, setSpaceModeState] = useState<boolean>(false);
  const [waterMode, setWaterModeState] = useState<boolean>(false);
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
    setSunglassesUnlocked(false);
    setRainbowModeState(false);
    setSlowmoModeState(false);
    setGodModeState(false);
    setInvertColorsState(false);
    setMatrixModeState(false);
    setNightModeState(false);
    setSpeedModeState(false);
    setBigDuckState(false);
    setTinyDuckState(false);
    setFlipModeState(false);
    setDoubleJumpState(false);
    setReverseGravityState(false);
    setChaosModeState(false);
    setZenModeState(false);
    setGlowModeState(false);
    setNinjaModeState(false);
    setShuffleModeState(false);
    setBounceModeState(false);
    setWingsModeState(false);
    setTeleportModeState(false);
    setMirrorModeState(false);
    setPixelModeState(false);
    setRetroModeState(false);
    setSpaceModeState(false);
    setWaterModeState(false);
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

  const setPartyMode = (enabled: boolean) => {
    setPartyModeState(enabled);
  };

  const unlockSunglasses = () => {
    setSunglassesUnlocked(true);
  };

  const setRainbowMode = (enabled: boolean) => {
    setRainbowModeState(enabled);
  };

  const setSlowmoMode = (enabled: boolean) => {
    setSlowmoModeState(enabled);
  };

  const setGodMode = (enabled: boolean) => {
    setGodModeState(enabled);
  };

  const setInvertColors = (enabled: boolean) => {
    setInvertColorsState(enabled);
  };

  const setMatrixMode = (enabled: boolean) => {
    setMatrixModeState(enabled);
  };

  const setNightMode = (enabled: boolean) => {
    setNightModeState(enabled);
  };

  const setSpeedMode = (enabled: boolean) => {
    setSpeedModeState(enabled);
  };

  const setBigDuck = (enabled: boolean) => {
    setBigDuckState(enabled);
  };

  const setTinyDuck = (enabled: boolean) => {
    setTinyDuckState(enabled);
  };

  const setFlipMode = (enabled: boolean) => {
    setFlipModeState(enabled);
  };

  const setDoubleJump = (enabled: boolean) => {
    setDoubleJumpState(enabled);
  };

  const setReverseGravity = (enabled: boolean) => {
    setReverseGravityState(enabled);
  };

  const setChaosMode = (enabled: boolean) => {
    setChaosModeState(enabled);
  };

  const setZenMode = (enabled: boolean) => {
    setZenModeState(enabled);
  };

  const setGlowMode = (enabled: boolean) => {
    setGlowModeState(enabled);
  };

  const setNinjaMode = (enabled: boolean) => {
    setNinjaModeState(enabled);
  };

  const setShuffleMode = (enabled: boolean) => {
    setShuffleModeState(enabled);
  };

  const setBounceMode = (enabled: boolean) => {
    setBounceModeState(enabled);
  };

  const setWingsMode = (enabled: boolean) => {
    setWingsModeState(enabled);
  };

  const setTeleportMode = (enabled: boolean) => {
    setTeleportModeState(enabled);
  };

  const setMirrorMode = (enabled: boolean) => {
    setMirrorModeState(enabled);
  };

  const setPixelMode = (enabled: boolean) => {
    setPixelModeState(enabled);
  };

  const setRetroMode = (enabled: boolean) => {
    setRetroModeState(enabled);
  };

  const setSpaceMode = (enabled: boolean) => {
    setSpaceModeState(enabled);
  };

  const setWaterMode = (enabled: boolean) => {
    setWaterModeState(enabled);
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        score,
        highScore,
        soundEnabled,
        easterEggs: {
          partyMode,
          sunglassesUnlocked,
          rainbowMode,
          slowmoMode,
          godMode,
          invertColors,
          matrixMode,
          nightMode,
          speedMode,
          bigDuck,
          tinyDuck,
          flipMode,
          doubleJump,
          reverseGravity,
          chaosMode,
          zenMode,
          glowMode,
          ninjaMode,
          shuffleMode,
          bounceMode,
          wingsMode,
          teleportMode,
          mirrorMode,
          pixelMode,
          retroMode,
          spaceMode,
          waterMode,
        },
        startGame,
        pauseGame,
        resumeGame,
        gameOver,
        resetGame,
        incrementScore,
        setSoundEnabled,
        setPartyMode,
        unlockSunglasses,
        setRainbowMode,
        setSlowmoMode,
        setGodMode,
        setInvertColors,
        setMatrixMode,
        setNightMode,
        setSpeedMode,
        setBigDuck,
        setTinyDuck,
        setFlipMode,
        setDoubleJump,
        setReverseGravity,
        setChaosMode,
        setZenMode,
        setGlowMode,
        setNinjaMode,
        setShuffleMode,
        setBounceMode,
        setWingsMode,
        setTeleportMode,
        setMirrorMode,
        setPixelMode,
        setRetroMode,
        setSpaceMode,
        setWaterMode,
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
