import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { GameState } from '../../types/game.types';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useSecretSequence } from '../../hooks/useSecretSequence';
import { useGameLoop } from '../../hooks/useGameLoop';
import { ObstacleManager } from '../../game/systems/ObstacleManager';
import { Duck } from '../../game/entities/Duck';
import {
  checkAllCollisions,
} from '../../game/systems/CollisionSystem';
import { ParticleSystem } from '../../game/systems/ParticleSystem';
import {
  checkAllObstaclesPassed,
  getDifficultyMultiplier,
  getCurrentSpacing,
} from '../../game/systems/ScoreSystem';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_SPEED,
  OBSTACLE_SPEED,
  PIPE_SPACING,
} from '../../game/utils/constants';
import { soundManager } from '../../game/utils/SoundManager';
import { performanceMonitor } from '../../game/utils/PerformanceMonitor';
import styles from './GameCanvas.module.css';

interface GameCanvasProps {
  width?: number;
  height?: number;
}

/**
 * Основной компонент игрового canvas
 * Управляет игровым циклом, отрисовкой и взаимодействием с пользователем
 */
export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  width = CANVAS_WIDTH, 
  height = CANVAS_HEIGHT,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, score, highScore, startGame, gameOver, incrementScore, pauseGame, resumeGame, easterEggs, setPartyMode, unlockSunglasses, setRainbowMode, setSlowmoMode, setGodMode, setInvertColors, setMatrixMode, setNightMode, setSpeedMode, setBigDuck, setTinyDuck, setFlipMode, setDoubleJump, setReverseGravity, setChaosMode, setZenMode, setGlowMode, setNinjaMode, setShuffleMode, setBounceMode } =
    useGame();
  
  // Инициализация игровых объектов (создаются один раз)
  const duckRef = useRef<Duck | null>(null);
  const obstacleManagerRef = useRef<ObstacleManager | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  // Флаг для предотвращения повторных вызовов gameOver в одном кадре
  const gameOverCalledRef = useRef<boolean>(false);
  
  // Состояние для анимации счета
  const [scoreScale, setScoreScale] = useState(1);
  // Таймер для party mode конфетти
  const partyTimerRef = useRef<number>(0);
  
  // Состояние для двойного прыжка
  const doubleJumpUsedRef = useRef<boolean>(false);
  const lastJumpTimeRef = useRef<number>(0);
  
  // Состояние для движения облаков
  const cloudOffsetRef = useRef<number>(0);
  
  // Состояние для движения земли
  const groundOffsetRef = useRef<number>(0);
  
  // Состояние для движения деревьев (параллакс-эффект)
  const treesOffsetRef = useRef<number>(0);
  
  // Состояние для декоративных элементов
  // Птицы: массив объектов с позицией и скоростью
  interface Bird {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    wingState: 'up' | 'down';
    wingTimer: number;
  }
  
  // Цветы на земле
  interface Flower {
    x: number;
    y: number;
    type: 'daisy' | 'tulip' | 'sunflower';
    size: number;
  }
  
  const birdsRef = useRef<Bird[]>([]);
  const treesRef = useRef<Array<{ x: number; height: number; type: 'small' | 'medium' | 'large' }>>([]);
  const flowersRef = useRef<Flower[]>([]);

  // Создание экземпляров игровых объектов (только при первом рендере)
  if (!duckRef.current) {
    duckRef.current = new Duck();
  }
  if (!obstacleManagerRef.current) {
    obstacleManagerRef.current = new ObstacleManager();
  }
  if (!particleSystemRef.current) {
    particleSystemRef.current = new ParticleSystem();
  }
  
  // Обработчик прыжка утки
  const handleJump = useCallback(() => {
    if (gameState === GameState.PLAYING && duckRef.current) {
      const now = Date.now();
      const timeSinceLastJump = now - lastJumpTimeRef.current;
      
      if (easterEggs.doubleJump && timeSinceLastJump < 300 && !doubleJumpUsedRef.current) {
        doubleJumpUsedRef.current = true;
        duckRef.current.jump();
        soundManager.play('jump');
        if (particleSystemRef.current && duckRef.current) {
          const centerX = duckRef.current.position.x + duckRef.current.width / 2;
          const centerY = duckRef.current.position.y + duckRef.current.height / 2;
          particleSystemRef.current.emit(centerX, centerY, 8, '#00FFFF');
        }
      } else if (!easterEggs.doubleJump || !doubleJumpUsedRef.current) {
        duckRef.current.jump();
        soundManager.play('jump');
        doubleJumpUsedRef.current = easterEggs.doubleJump;
        lastJumpTimeRef.current = now;
      }
    }
  }, [gameState, easterEggs.doubleJump]);
  
  // Обработчик клика по canvas
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState === GameState.PLAYING) {
      handleJump();
    } else if (gameState === GameState.MENU) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const canvasX = x * scaleX;
        const canvasY = y * scaleY;
        
        // Пасхалка: клик по солнцу
        const sunX = width - 150;
        const sunY = 80;
        const sunRadius = 40;
        const distance = Math.sqrt(Math.pow(canvasX - sunX, 2) + Math.pow(canvasY - sunY, 2));
        if (distance < sunRadius * 1.5) {
          setPartyMode(true);
          setRainbowMode(true);
          soundManager.play('score');
          return;
        }

        // Пасхалка: клик по облакам
        const offset = cloudOffsetRef.current;
        const cloudPositions = [
          { x: 200 + offset, y: 100, size: 35 },
          { x: 500 + offset, y: 80, size: 30 },
          { x: 700 + offset, y: 120, size: 32 },
          { x: 350 + offset, y: 150, size: 25 },
          { x: 600 + offset, y: 60, size: 28 },
        ];
        for (const cloud of cloudPositions) {
          const cloudScreenX = ((cloud.x % width) + width) % width;
          const distance = Math.sqrt(Math.pow(canvasX - cloudScreenX, 2) + Math.pow(canvasY - cloud.y, 2));
          if (distance < cloud.size * 1.5) {
            setMatrixMode(!easterEggs.matrixMode);
            soundManager.play('score');
            return;
          }
        }

        // Пасхалка: клик по деревьям
        const trees = treesRef.current;
        const groundY = height - 50;
        const treeOffset = treesOffsetRef.current;
        for (const tree of trees) {
          const treeScreenX = tree.x - treeOffset;
          if (treeScreenX > -100 && treeScreenX < width + 100) {
            const treeBaseY = groundY;
            const treeTopY = treeBaseY - tree.height;
            if (canvasX >= treeScreenX - 50 && canvasX <= treeScreenX + 50 && 
                canvasY >= treeTopY && canvasY <= treeBaseY) {
              setNightMode(!easterEggs.nightMode);
              soundManager.play('score');
              return;
            }
          }
        }

        // Пасхалка: клик по птицам
        const birds = birdsRef.current;
        for (const bird of birds) {
          if (bird.x > -50 && bird.x < width + 50) {
            const distance = Math.sqrt(Math.pow(canvasX - bird.x, 2) + Math.pow(canvasY - bird.y, 2));
            if (distance < bird.size * 3) {
              setGlowMode(!easterEggs.glowMode);
              if (particleSystemRef.current) {
                particleSystemRef.current.emit(bird.x, bird.y, 15, '#FFD700');
              }
              soundManager.play('score');
              return;
            }
          }
        }

        // Пасхалка: клик по цветам
        const flowers = flowersRef.current;
        const flowerOffset = groundOffsetRef.current;
        for (const flower of flowers) {
          const flowerScreenX = ((flower.x - flowerOffset) % (width + 100) + width + 100) % (width + 100);
          if (flowerScreenX > -50 && flowerScreenX < width + 50) {
            const distance = Math.sqrt(Math.pow(canvasX - flowerScreenX, 2) + Math.pow(canvasY - flower.y, 2));
            if (distance < flower.size * 3) {
              setShuffleMode(!easterEggs.shuffleMode);
              if (particleSystemRef.current) {
                const colors = ['#FF1493', '#FFD700', '#32CD32'];
                particleSystemRef.current.emit(flowerScreenX, flower.y, 12, colors[Math.floor(Math.random() * colors.length)]);
              }
              soundManager.play('score');
              return;
            }
          }
        }
      }
      startGame();
    }
  }, [gameState, handleJump, startGame, width, height, easterEggs.matrixMode, easterEggs.nightMode, easterEggs.glowMode, easterEggs.shuffleMode, setPartyMode, setRainbowMode, setMatrixMode, setNightMode, setGlowMode, setShuffleMode]);
  
  // Обработчик touch событий для мобильных устройств
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (gameState === GameState.PLAYING) {
      handleJump();
    } else if (gameState === GameState.MENU) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const canvasX = x * scaleX;
        const canvasY = y * scaleY;
        
        // Пасхалка: клик по солнцу
        const sunX = width - 150;
        const sunY = 80;
        const sunRadius = 40;
        const distance = Math.sqrt(Math.pow(canvasX - sunX, 2) + Math.pow(canvasY - sunY, 2));
        if (distance < sunRadius * 1.5) {
          setPartyMode(true);
          setRainbowMode(true);
          soundManager.play('score');
          return;
        }

        // Пасхалка: клик по облакам
        const offset = cloudOffsetRef.current;
        const cloudPositions = [
          { x: 200 + offset, y: 100, size: 35 },
          { x: 500 + offset, y: 80, size: 30 },
          { x: 700 + offset, y: 120, size: 32 },
          { x: 350 + offset, y: 150, size: 25 },
          { x: 600 + offset, y: 60, size: 28 },
        ];
        for (const cloud of cloudPositions) {
          const cloudScreenX = ((cloud.x % width) + width) % width;
          const distance = Math.sqrt(Math.pow(canvasX - cloudScreenX, 2) + Math.pow(canvasY - cloud.y, 2));
          if (distance < cloud.size * 1.5) {
            setMatrixMode(!easterEggs.matrixMode);
            soundManager.play('score');
            return;
          }
        }

        // Пасхалка: клик по деревьям
        const trees = treesRef.current;
        const groundY = height - 50;
        const treeOffset = treesOffsetRef.current;
        for (const tree of trees) {
          const treeScreenX = tree.x - treeOffset;
          if (treeScreenX > -100 && treeScreenX < width + 100) {
            const treeBaseY = groundY;
            const treeTopY = treeBaseY - tree.height;
            if (canvasX >= treeScreenX - 50 && canvasX <= treeScreenX + 50 && 
                canvasY >= treeTopY && canvasY <= treeBaseY) {
              setNightMode(!easterEggs.nightMode);
              soundManager.play('score');
              return;
            }
          }
        }

        // Пасхалка: клик по птицам
        const birds = birdsRef.current;
        for (const bird of birds) {
          if (bird.x > -50 && bird.x < width + 50) {
            const distance = Math.sqrt(Math.pow(canvasX - bird.x, 2) + Math.pow(canvasY - bird.y, 2));
            if (distance < bird.size * 3) {
              setGlowMode(!easterEggs.glowMode);
              if (particleSystemRef.current) {
                particleSystemRef.current.emit(bird.x, bird.y, 15, '#FFD700');
              }
              soundManager.play('score');
              return;
            }
          }
        }

        // Пасхалка: клик по цветам
        const flowers = flowersRef.current;
        const flowerOffset = groundOffsetRef.current;
        for (const flower of flowers) {
          const flowerScreenX = ((flower.x - flowerOffset) % (width + 100) + width + 100) % (width + 100);
          if (flowerScreenX > -50 && flowerScreenX < width + 50) {
            const distance = Math.sqrt(Math.pow(canvasX - flowerScreenX, 2) + Math.pow(canvasY - flower.y, 2));
            if (distance < flower.size * 3) {
              setShuffleMode(!easterEggs.shuffleMode);
              if (particleSystemRef.current) {
                const colors = ['#FF1493', '#FFD700', '#32CD32'];
                particleSystemRef.current.emit(flowerScreenX, flower.y, 12, colors[Math.floor(Math.random() * colors.length)]);
              }
              soundManager.play('score');
              return;
            }
          }
        }
      }
      startGame();
    }
  }, [gameState, handleJump, startGame, width, height, easterEggs.matrixMode, easterEggs.nightMode, easterEggs.glowMode, easterEggs.shuffleMode, setPartyMode, setRainbowMode, setMatrixMode, setNightMode, setGlowMode, setShuffleMode]);
  
  // Подключение обработки клавиатуры
  useKeyboard(handleJump);

  // Пасхалка: Konami code включает party mode
  useSecretSequence(
    ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'],
    () => {
      setPartyMode(true);
      soundManager.play('score');
    }
  );

  // Пасхалка: слово "party" также включает режим для удобства
  useSecretSequence(['p','a','r','t','y'], () => {
    setPartyMode(true);
    soundManager.play('score');
  });

  // Пасхалка: слово "quack" - мгновенно выдает утке солнечные очки
  useSecretSequence(['q','u','a','c','k'], () => {
    unlockSunglasses();
    if (particleSystemRef.current && duckRef.current) {
      const centerX = duckRef.current.position.x + duckRef.current.width / 2;
      const centerY = duckRef.current.position.y + duckRef.current.height / 2;
      particleSystemRef.current.emit(centerX, centerY - 10, 12, '#FFD700');
    }
    soundManager.play('score');
  });

  // Пасхалка: слово "rainbow" - включает радужный режим
  useSecretSequence(['r','a','i','n','b','o','w'], () => {
    setRainbowMode(!easterEggs.rainbowMode);
    soundManager.play('score');
  });

  // Пасхалка: слово "slowmo" - включает режим замедления
  useSecretSequence(['s','l','o','w','m','o'], () => {
    setSlowmoMode(!easterEggs.slowmoMode);
    soundManager.play('score');
  });

  // Пасхалка: слово "godmode" - включает режим бога (неуязвимость)
  useSecretSequence(['g','o','d','m','o','d','e'], () => {
    setGodMode(!easterEggs.godMode);
    soundManager.play('score');
  });

  // Пасхалка: слово "invert" - инвертирует цвета
  useSecretSequence(['i','n','v','e','r','t'], () => {
    setInvertColors(!easterEggs.invertColors);
    soundManager.play('score');
  });

  // Пасхалка: слово "duck" - комбо эффект
  useSecretSequence(['d','u','c','k'], () => {
    unlockSunglasses();
    setRainbowMode(true);
    if (particleSystemRef.current && duckRef.current) {
      const centerX = duckRef.current.position.x + duckRef.current.width / 2;
      const centerY = duckRef.current.position.y + duckRef.current.height / 2;
      particleSystemRef.current.emit(centerX, centerY, 20, '#FF00FF');
    }
    soundManager.play('score');
  });

  // Пасхалка: "1337" - для геймеров
  useSecretSequence(['1','3','3','7'], () => {
    setGodMode(true);
    setRainbowMode(true);
    soundManager.play('score');
  });

  // Пасхалка: слово "matrix" - включает эффект матрицы
  useSecretSequence(['m','a','t','r','i','x'], () => {
    setMatrixMode(!easterEggs.matrixMode);
    soundManager.play('score');
  });

  // Пасхалка: слово "moon" - включает ночной режим
  useSecretSequence(['m','o','o','n'], () => {
    setNightMode(!easterEggs.nightMode);
    soundManager.play('score');
  });

  // Пасхалка: слово "speed" - включает ускорение игры
  useSecretSequence(['s','p','e','e','d'], () => {
    setSpeedMode(!easterEggs.speedMode);
    soundManager.play('score');
  });

  // Пасхалка: слово "big" - увеличивает утку
  useSecretSequence(['b','i','g'], () => {
    setBigDuck(!easterEggs.bigDuck);
    if (easterEggs.bigDuck) {
      setTinyDuck(false);
    }
    soundManager.play('score');
  });

  // Пасхалка: слово "tiny" - уменьшает утку
  useSecretSequence(['t','i','n','y'], () => {
    setTinyDuck(!easterEggs.tinyDuck);
    if (easterEggs.tinyDuck) {
      setBigDuck(false);
    }
    soundManager.play('score');
  });

  // Пасхалка: слово "flip" - переворачивает экран
  useSecretSequence(['f','l','i','p'], () => {
    setFlipMode(!easterEggs.flipMode);
    soundManager.play('score');
  });

  // Пасхалка: слово "doublejump" - включает двойной прыжок
  useSecretSequence(['d','o','u','b','l','e','j','u','m','p'], () => {
    setDoubleJump(!easterEggs.doubleJump);
    doubleJumpUsedRef.current = false;
    soundManager.play('score');
  });

  // Пасхалка: слово "gravity" - обратная гравитация
  useSecretSequence(['g','r','a','v','i','t','y'], () => {
    setReverseGravity(!easterEggs.reverseGravity);
    soundManager.play('score');
  });

  // Пасхалка: слово "chaos" - включает хаос режим
  useSecretSequence(['c','h','a','o','s'], () => {
    const newChaos = !easterEggs.chaosMode;
    setChaosMode(newChaos);
    if (newChaos) {
      setRainbowMode(true);
      setMatrixMode(true);
      setSpeedMode(true);
      setGlowMode(true);
      if (particleSystemRef.current && duckRef.current) {
        const centerX = duckRef.current.position.x + duckRef.current.width / 2;
        const centerY = duckRef.current.position.y + duckRef.current.height / 2;
        particleSystemRef.current.emit(centerX, centerY, 30, '#FF00FF');
      }
    }
    soundManager.play('score');
  });

  // Пасхалка: слово "zen" - спокойный режим
  useSecretSequence(['z','e','n'], () => {
    const newZen = !easterEggs.zenMode;
    setZenMode(newZen);
    if (newZen) {
      setSlowmoMode(true);
      setRainbowMode(true);
    } else {
      setSlowmoMode(false);
    }
    soundManager.play('score');
  });

  // Пасхалка: слово "glow" - свечение утки
  useSecretSequence(['g','l','o','w'], () => {
    setGlowMode(!easterEggs.glowMode);
    soundManager.play('score');
  });

  // Пасхалка: слово "ninja" - невидимость препятствий
  useSecretSequence(['n','i','n','j','a'], () => {
    setNinjaMode(!easterEggs.ninjaMode);
    soundManager.play('score');
  });

  // Пасхалка: слово "shuffle" - перемешивание цветов
  useSecretSequence(['s','h','u','f','f','l','e'], () => {
    setShuffleMode(!easterEggs.shuffleMode);
    soundManager.play('score');
  });

  // Пасхалка: слово "bounce" - отскок от границ
  useSecretSequence(['b','o','u','n','c','e'], () => {
    setBounceMode(!easterEggs.bounceMode);
    soundManager.play('score');
  });

  // Пасхалка: слово "secret" - комбо эффект
  useSecretSequence(['s','e','c','r','e','t'], () => {
    unlockSunglasses();
    setGlowMode(true);
    setRainbowMode(true);
    if (particleSystemRef.current && duckRef.current) {
      const centerX = duckRef.current.position.x + duckRef.current.width / 2;
      const centerY = duckRef.current.position.y + duckRef.current.height / 2;
      particleSystemRef.current.emit(centerX, centerY, 25, '#FF00FF');
    }
    soundManager.play('score');
  });

  // Пасхалка: слово "magic" - волшебный эффект
  useSecretSequence(['m','a','g','i','c'], () => {
    setMatrixMode(true);
    setGlowMode(true);
    setRainbowMode(true);
    if (particleSystemRef.current && duckRef.current) {
      const centerX = duckRef.current.position.x + duckRef.current.width / 2;
      const centerY = duckRef.current.position.y + duckRef.current.height / 2;
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          if (particleSystemRef.current) {
            const colors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF00FF'];
            particleSystemRef.current.emit(centerX, centerY, 15, colors[i % colors.length]);
          }
        }, i * 100);
      }
    }
    soundManager.play('score');
  });

  // Пасхалка: слово "reset" - сброс всех эффектов
  useSecretSequence(['r','e','s','e','t'], () => {
    setPartyMode(false);
    setRainbowMode(false);
    setSlowmoMode(false);
    setGodMode(false);
    setInvertColors(false);
    setMatrixMode(false);
    setNightMode(false);
    setSpeedMode(false);
    setBigDuck(false);
    setTinyDuck(false);
    setFlipMode(false);
    setDoubleJump(false);
    setReverseGravity(false);
    setChaosMode(false);
    setZenMode(false);
    setGlowMode(false);
    setNinjaMode(false);
    setShuffleMode(false);
    setBounceMode(false);
    soundManager.play('score');
  });

  // Пасхалка: слово "super" - супер режим
  useSecretSequence(['s','u','p','e','r'], () => {
    setGodMode(true);
    setRainbowMode(true);
    setGlowMode(true);
    setDoubleJump(true);
    unlockSunglasses();
    if (particleSystemRef.current && duckRef.current) {
      const centerX = duckRef.current.position.x + duckRef.current.width / 2;
      const centerY = duckRef.current.position.y + duckRef.current.height / 2;
      particleSystemRef.current.emit(centerX, centerY, 30, '#FFD700');
    }
    soundManager.play('score');
  });

  // Пасхалка: слово "fun" - веселый режим
  useSecretSequence(['f','u','n'], () => {
    setPartyMode(true);
    setRainbowMode(true);
    setBounceMode(true);
    if (particleSystemRef.current && duckRef.current) {
      const centerX = duckRef.current.position.x + duckRef.current.width / 2;
      const centerY = duckRef.current.position.y + duckRef.current.height / 2;
      const colors = ['#FF3B30','#FF9500','#FFCC00','#34C759','#5AC8FA','#007AFF','#AF52DE'];
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          if (particleSystemRef.current) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            particleSystemRef.current.emit(centerX, centerY, 12, color);
          }
        }, i * 50);
      }
    }
    soundManager.play('score');
  });
  
  // Обработка клавиши Escape для паузы/возобновления игры
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (gameState === GameState.PLAYING) {
          pauseGame();
        } else if (gameState === GameState.PAUSED) {
          resumeGame();
        }
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [gameState, pauseGame, resumeGame]);
  
  // Инициализация декоративных элементов
  useEffect(() => {
    // Инициализация деревьев на заднем плане
    if (treesRef.current.length === 0) {
      treesRef.current = [
        { x: 150, height: 120, type: 'medium' },
        { x: 400, height: 100, type: 'small' },
        { x: 650, height: 140, type: 'large' },
        { x: 850, height: 110, type: 'medium' },
        { x: 1100, height: 130, type: 'large' },
        { x: 1350, height: 115, type: 'medium' },
        { x: 1600, height: 125, type: 'small' },
      ];
    }
    
    // Инициализация птиц
    if (birdsRef.current.length === 0) {
      birdsRef.current = [
        { x: -50, y: 150, vx: 1.5, vy: Math.sin(0) * 0.3, size: 12, wingState: 'up', wingTimer: 0 },
        { x: -100, y: 200, vx: 1.2, vy: Math.sin(0.5) * 0.3, size: 10, wingState: 'down', wingTimer: 50 },
        { x: -150, y: 100, vx: 1.8, vy: Math.sin(1) * 0.3, size: 14, wingState: 'up', wingTimer: 100 },
      ];
    }
    
    // Инициализация цветов на земле
    if (flowersRef.current.length === 0) {
      const groundY = height - 50;
      flowersRef.current = [
        { x: 200, y: groundY - 15, type: 'daisy', size: 8 },
        { x: 350, y: groundY - 12, type: 'tulip', size: 10 },
        { x: 500, y: groundY - 18, type: 'sunflower', size: 12 },
        { x: 750, y: groundY - 14, type: 'daisy', size: 9 },
        { x: 950, y: groundY - 16, type: 'tulip', size: 11 },
        { x: 1200, y: groundY - 13, type: 'sunflower', size: 10 },
        { x: 1400, y: groundY - 15, type: 'daisy', size: 8 },
        { x: 1650, y: groundY - 17, type: 'tulip', size: 9 },
      ];
    }
  }, [height]);
  
  // Инициализация canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Настройка размеров canvas
    canvas.width = width;
    canvas.height = height;
    
    // Очистка canvas
    ctx.clearRect(0, 0, width, height);
  }, [width, height]);

  // Функция проверки коллизий и подсчета очков
  const checkCollisions = useCallback(() => {
    // Не проверяем коллизии, если игра уже окончена в этом кадре
    if (gameOverCalledRef.current || !duckRef.current || !obstacleManagerRef.current) {
      return false;
    }
    
    const duck = duckRef.current;
    const obstacles = obstacleManagerRef.current.getObstacles();

    // Проверка прохождения препятствий для подсчета очков
    const passedCount = checkAllObstaclesPassed(duck, obstacles, width);
    if (passedCount > 0) {
      // Увеличиваем счет на количество пройденных препятствий
      for (let i = 0; i < passedCount; i++) {
        incrementScore();
        // Разрешаем одновременное воспроизведение для быстрых последовательных очков
        soundManager.play('score', true);
      }
    }

    // Проверка коллизий с препятствиями
    return checkAllCollisions(duck, obstacles, width);
  }, [incrementScore, width]);

  // Функция обновления движения земли
  // Земля движется с учетом сложности для визуальной согласованности
  const updateGround = useCallback(
    (deltaTime: number, speedMultiplier: number = 1) => {
      const currentGroundSpeed = GROUND_SPEED * speedMultiplier;
      groundOffsetRef.current += currentGroundSpeed * (deltaTime / 16);
      if (groundOffsetRef.current > width) {
        groundOffsetRef.current = 0;
      }
    },
    [width]
  );
  
  // Функция обновления движения деревьев (параллакс - медленнее препятствий)
  const updateTrees = useCallback(
    (deltaTime: number) => {
      // Деревья двигаются медленнее для эффекта глубины (параллакс)
      const parallaxSpeed = GROUND_SPEED * 0.3; // 30% от скорости земли
      treesOffsetRef.current += parallaxSpeed * (deltaTime / 16);
      
      // Обновляем позиции деревьев для бесшовной прокрутки
      const trees = treesRef.current;
      trees.forEach((tree) => {
        // Если дерево ушло за левую границу, перемещаем его вправо
        const treeScreenX = tree.x - treesOffsetRef.current;
        if (treeScreenX + 100 < -width) {
          // Находим самое правое дерево
          const rightmostTree = trees.reduce((max, t) => {
            const screenX = t.x - treesOffsetRef.current;
            return screenX > max ? screenX : max;
          }, -Infinity);
          tree.x = rightmostTree + 250 + Math.random() * 100;
        }
      });
      
      // Сбрасываем offset для бесшовной прокрутки (если нужно)
      if (treesOffsetRef.current > width * 2) {
        treesOffsetRef.current = 0;
      }
    },
    [width]
  );
  
  // Функция обновления птиц
  const updateBirds = useCallback(
    (deltaTime: number) => {
      const birds = birdsRef.current;
      const groundY = height - 50;
      
      birds.forEach((bird) => {
        // Обновление позиции
        bird.x += bird.vx * (deltaTime / 16);
        bird.y += bird.vy * (deltaTime / 16);
        
        // Обновление анимации крыльев
        bird.wingTimer += deltaTime;
        if (bird.wingTimer > 150) {
          bird.wingState = bird.wingState === 'up' ? 'down' : 'up';
          bird.wingTimer = 0;
        }
        
        // Плавное движение вверх-вниз (синусоидальное)
        bird.vy = Math.sin(bird.x * 0.01) * 0.3;
        
        // Если птица улетела за экран, переместить её в начало
        if (bird.x > width + 50) {
          bird.x = -50;
          bird.y = 80 + Math.random() * (groundY - 200);
        }
        
        // Ограничение по вертикали (не слишком высоко и не слишком низко)
        if (bird.y < 50) bird.y = 50;
        if (bird.y > groundY - 50) bird.y = groundY - 50;
      });
    },
    [width, height]
  );

  // Эмиссия конфетти в party mode вынесена отдельно
  const emitPartyModeConfetti = useCallback(
    (deltaTime: number) => {
      if (!particleSystemRef.current || !easterEggs.partyMode) return;
      partyTimerRef.current += deltaTime;
      if (partyTimerRef.current > 150) {
        partyTimerRef.current = 0;
        const colors = ['#FF3B30','#FF9500','#FFCC00','#34C759','#5AC8FA','#007AFF','#AF52DE'];
        const x = Math.random() * width;
        const y = 80 + Math.random() * (height * 0.5);
        const color = colors[Math.floor(Math.random() * colors.length)];
        // Несколько пульсаций для плотности
        particleSystemRef.current.emit(x, y, 10, color);
      }
    },
    [easterEggs.partyMode, width, height]
  );

  // Игровой цикл: обновление состояния
  const update = useCallback(
    (deltaTime: number) => {
      // Применяем slowmo, speed и zen эффекты
      let effectiveDeltaTime = deltaTime;
      if (easterEggs.zenMode || easterEggs.slowmoMode) {
        effectiveDeltaTime *= 0.5;
      }
      if (easterEggs.speedMode && !easterEggs.zenMode) {
        effectiveDeltaTime *= 1.5;
      }
      
      // Вычисляем множитель сложности на основе текущего счета
      const difficultyMultiplier = getDifficultyMultiplier(score);
      const currentSpacing = getCurrentSpacing(score, PIPE_SPACING);
      
      // Обновление облаков (работает всегда для плавной анимации)
      updateClouds(deltaTime);
      
      // Обновление земли с учетом сложности и speed mode (работает всегда для плавной анимации)
      const groundSpeedMultiplier = easterEggs.speedMode ? difficultyMultiplier * 1.5 : difficultyMultiplier;
      updateGround(deltaTime, groundSpeedMultiplier);
      
      // Обновление деревьев (параллакс-эффект)
      updateTrees(deltaTime);
      
      // Обновление птиц (работает всегда для плавной анимации)
      updateBirds(deltaTime);
      
      if (gameState !== GameState.PLAYING) {
        gameOverCalledRef.current = false;
        return;
      }
      
      if (!duckRef.current || !obstacleManagerRef.current) return;
      
      gameOverCalledRef.current = false;
      
      const duck = duckRef.current;
      const obstacleManager = obstacleManagerRef.current;
      
      // Сброс двойного прыжка при касании земли или потолка
      const isOnGround = duck.position.y + duck.height >= height - 5;
      const isOnCeiling = duck.position.y <= 5;
      if (isOnGround || isOnCeiling) {
        doubleJumpUsedRef.current = false;
      }
      
      // Обновление утки (включает проверку границ)
      let hitBoundary = duck.update(effectiveDeltaTime, height, easterEggs.reverseGravity);
      
      // Bounce mode - отскок от границ
      if (easterEggs.bounceMode && hitBoundary) {
        hitBoundary = false;
        if (duck.position.y <= 0) {
          duck.position.y = 5;
          duck.velocity.vy = Math.abs(duck.velocity.vy) * 0.7;
          if (particleSystemRef.current) {
            particleSystemRef.current.emit(duck.position.x + duck.width / 2, 0, 10, '#00FFFF');
          }
        } else if (duck.position.y + duck.height >= height) {
          duck.position.y = height - duck.height - 5;
          duck.velocity.vy = -Math.abs(duck.velocity.vy) * 0.7;
          if (particleSystemRef.current) {
            particleSystemRef.current.emit(duck.position.x + duck.width / 2, height, 10, '#00FFFF');
          }
        }
        doubleJumpUsedRef.current = false;
      }
      
      if (hitBoundary && !easterEggs.godMode && !easterEggs.bounceMode) {
        gameOverCalledRef.current = true;
        if (particleSystemRef.current) {
          const centerX = duck.position.x + duck.width / 2;
          const centerY = duck.position.y + duck.height / 2;
          particleSystemRef.current.emit(centerX, centerY, 20, '#FF4500');
        }
        soundManager.play('hit');
        gameOver();
        return;
      }

      // Обновление препятствий с учетом прогрессивной сложности и speed mode
      const obstacleSpeedMultiplier = easterEggs.speedMode ? difficultyMultiplier * 1.5 : difficultyMultiplier;
      obstacleManager.update(effectiveDeltaTime, obstacleSpeedMultiplier, currentSpacing);

      // Обновление системы частиц
      if (particleSystemRef.current) {
        particleSystemRef.current.update(deltaTime);
      }

      // Эмиссия конфетти в party mode
      emitPartyModeConfetti(deltaTime);

      // Проверка коллизий с препятствиями и подсчет очков
      if (!easterEggs.godMode && checkCollisions()) {
        gameOverCalledRef.current = true;
        if (particleSystemRef.current && duck) {
          const centerX = duck.position.x + duck.width / 2;
          const centerY = duck.position.y + duck.height / 2;
          particleSystemRef.current.emit(centerX, centerY, 20, '#FF4500');
        }
        soundManager.play('hit');
        gameOver();
        return;
      }
    },
    [gameState, height, score, checkCollisions, gameOver, updateClouds, updateGround, updateTrees, updateBirds, emitPartyModeConfetti, easterEggs.slowmoMode, easterEggs.speedMode, easterEggs.godMode, easterEggs.zenMode, easterEggs.reverseGravity, easterEggs.bounceMode]
  );

  // Анимация счета при изменении
  const prevScoreRef = useRef(score);
  useEffect(() => {
    if (gameState === GameState.PLAYING && score > prevScoreRef.current) {
      setScoreScale(1.3);
      const timer = setTimeout(() => setScoreScale(1), 200);
      prevScoreRef.current = score;
      return () => clearTimeout(timer);
    } else if (gameState === GameState.MENU) {
      prevScoreRef.current = 0;
    }
  }, [score, gameState]);

  // Функция отрисовки счета
  const drawScore = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.save();
      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const scoreText = score.toString();
      const textX = width / 2;
      const textY = 60;

      // Применение анимации масштабирования
      ctx.translate(textX, textY);
      ctx.scale(scoreScale, scoreScale);
      ctx.translate(-textX, -textY);

      // Тень для лучшей читаемости
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Обводка для читаемости
      ctx.strokeText(scoreText, textX, textY);
      ctx.fillText(scoreText, textX, textY);
      
      // Сброс тени
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      ctx.restore();
    },
    [score, width, scoreScale]
  );

  // Функция отрисовки лучшего результата
  const drawHighScore = useCallback(
    (ctx: CanvasRenderingContext2D, isMenu: boolean = false) => {
      ctx.save();
      
      if (isMenu) {
        // Отображение в меню - более крупный и заметный текст
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const highScoreText = `Лучший результат: ${highScore}`;
        const textX = width / 2;
        const textY = height / 2 - 50;

        // Тень для лучшей читаемости
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Обводка для читаемости
        ctx.strokeText(highScoreText, textX, textY);
        ctx.fillText(highScoreText, textX, textY);
        
        // Сброс тени
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      } else {
        // Отображение во время игры - компактный текст в углу
        ctx.font = '24px Arial';
        ctx.fillStyle = '#FFFF00';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';

        const highScoreText = `Best: ${highScore}`;
        const textX = width - 20;
        const textY = 20;

        // Обводка для читаемости
        ctx.strokeText(highScoreText, textX, textY);
        ctx.fillText(highScoreText, textX, textY);
      }
      
      ctx.restore();
    },
    [highScore, width, height]
  );

  // Функция отрисовки неба с градиентом
  const drawSky = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (easterEggs.nightMode) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#0A0A2E'); // Темно-синий
        gradient.addColorStop(1, '#16213E'); // Темно-серый
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Отрисовка луны
        const moonX = width - 150;
        const moonY = 80;
        const moonRadius = 35;
        
        // Свечение луны
        const moonGradient = ctx.createRadialGradient(
          moonX, moonY, 0,
          moonX, moonY, moonRadius * 1.5
        );
        moonGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        moonGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
        moonGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = moonGradient;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Основная луна
        const moonMainGradient = ctx.createRadialGradient(
          moonX, moonY, 0,
          moonX, moonY, moonRadius
        );
        moonMainGradient.addColorStop(0, '#E8E8E8'); // Светло-серый
        moonMainGradient.addColorStop(1, '#C0C0C0'); // Серый
        ctx.fillStyle = moonMainGradient;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Звезды
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 50; i++) {
          const starX = (i * 37) % width;
          const starY = (i * 23) % (height * 0.7);
          const starSize = Math.random() * 2;
          ctx.beginPath();
          ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#87CEEB'); // Небесно-голубой
        gradient.addColorStop(1, '#E0F6FF'); // Светло-голубой
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Отрисовка солнца
        const sunX = width - 150;
        const sunY = 80;
        const sunRadius = 40;
        
        // Внешнее свечение солнца
        const sunGradient = ctx.createRadialGradient(
          sunX, sunY, 0,
          sunX, sunY, sunRadius * 1.5
        );
        sunGradient.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
        sunGradient.addColorStop(0.7, 'rgba(255, 255, 150, 0.3)');
        sunGradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Основное солнце
        const sunMainGradient = ctx.createRadialGradient(
          sunX, sunY, 0,
          sunX, sunY, sunRadius
        );
        sunMainGradient.addColorStop(0, '#FFEB3B'); // Ярко-желтый
        sunMainGradient.addColorStop(1, '#FFC107'); // Золотистый
        ctx.fillStyle = sunMainGradient;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [width, height, easterEggs.nightMode]
  );

  // Функция отрисовки облаков с улучшенной визуализацией
  // Оптимизирована для отрисовки только видимых облаков
  const drawClouds = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const offset = cloudOffsetRef.current;
      const margin = 100; // Запас для плавной отрисовки

      // Вспомогательная функция для отрисовки одного облака
      const drawSingleCloud = (
        x: number,
        y: number,
        size: number,
        opacity: number = 0.8
      ) => {
        // Проверяем, видимо ли облако (оптимизация)
        if (x + size < -margin || x - size > width + margin) {
          return; // Пропускаем невидимые облака
        }

        ctx.save();
        
        // Тень облака для объема
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Градиент для облака (более реалистичный вид)
        const cloudGradient = ctx.createLinearGradient(x - size, y, x + size, y);
        cloudGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.9})`);
        cloudGradient.addColorStop(0.5, `rgba(255, 255, 255, ${opacity})`);
        cloudGradient.addColorStop(1, `rgba(255, 255, 255, ${opacity * 0.9})`);
        ctx.fillStyle = cloudGradient;
        
        // Отрисовка облака из нескольких кругов
        ctx.beginPath();
        const r1 = size * 0.8;
        const r2 = size;
        const r3 = size * 0.9;
        ctx.arc(x - size * 0.3, y, r1, 0, Math.PI * 2);
        ctx.arc(x, y, r2, 0, Math.PI * 2);
        ctx.arc(x + size * 0.3, y, r3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      };

      // Облако 1 (большое)
      drawSingleCloud(200 + offset, 100, 35, 0.85);
      
      // Облако 2 (среднее)
      drawSingleCloud(500 + offset, 80, 30, 0.75);
      
      // Облако 3 (большое)
      drawSingleCloud(700 + offset, 120, 32, 0.8);
      
      // Облако 4 (маленькое, дальнее)
      drawSingleCloud(350 + offset, 150, 25, 0.6);
      
      // Облако 5 (среднее)
      drawSingleCloud(600 + offset, 60, 28, 0.7);

      // Облака для бесшовной прокрутки
      drawSingleCloud(200 + offset - width, 100, 35, 0.85);
      drawSingleCloud(500 + offset - width, 80, 30, 0.75);
      drawSingleCloud(700 + offset - width, 120, 32, 0.8);
      drawSingleCloud(350 + offset - width, 150, 25, 0.6);
      drawSingleCloud(600 + offset - width, 60, 28, 0.7);
    },
    [width]
  );

  // Функция обновления движения облаков
  const updateClouds = useCallback(
    (deltaTime: number) => {
      cloudOffsetRef.current += 0.1 * (deltaTime / 16);
      if (cloudOffsetRef.current > width) {
        cloudOffsetRef.current = 0;
      }
    },
    [width]
  );

  // Функция отрисовки текстуры травы с улучшенной визуализацией
  const drawGrassTexture = useCallback(
    (ctx: CanvasRenderingContext2D, groundY: number, offset: number) => {
      ctx.save();
      
      // Вариативность цвета травинок для более реалистичного вида
      const grassColors = ['#228B22', '#32CD32', '#2E8B57'];
      
      // Отрисовка травинок с учетом смещения для анимации
      for (let i = -offset; i < width + 20; i += 10) {
        const x = (i + offset) % (width + 20);
        const colorIndex = Math.floor((x / 10) % grassColors.length);
        const height = 8 + Math.sin(x * 0.1) * 3; // Вариативность высоты
        
        ctx.strokeStyle = grassColors[colorIndex];
        // Детерминированная вариативность толщины на основе позиции
        ctx.lineWidth = 1.5 + Math.abs(Math.sin(x * 0.15)) * 0.5;
        
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x + 4 + Math.sin(x * 0.2) * 2, groundY - height);
        ctx.stroke();
      }
      
      ctx.restore();
    },
    [width]
  );

  // Функция отрисовки деревьев на заднем плане
  // Оптимизирована для отрисовки только видимых деревьев
  const drawTrees = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const trees = treesRef.current;
      const groundY = height - 50;
      const offset = treesOffsetRef.current;
      
      // Фильтруем только видимые деревья для оптимизации
      // Увеличиваем запас для плавной отрисовки при движении
      const margin = 100;
      const visibleTrees = trees.filter((tree) => {
        const treeScreenX = tree.x - offset;
        return treeScreenX + 100 > -margin && treeScreenX < width + margin;
      });
      
      visibleTrees.forEach((tree) => {
        const treeX = tree.x - offset; // Применяем параллакс-смещение
        const treeBaseY = groundY;
        const treeHeight = tree.height;
        const treeTopY = treeBaseY - treeHeight;
        
        // Определение размеров в зависимости от типа дерева
        let trunkWidth: number;
        let crownSize: number;
        
        switch (tree.type) {
          case 'small':
            trunkWidth = 8;
            crownSize = 25;
            break;
          case 'medium':
            trunkWidth = 12;
            crownSize = 35;
            break;
          case 'large':
            trunkWidth = 16;
            crownSize = 45;
            break;
        }
        
        ctx.save();
        
        // Тень дерева
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(
          treeX + trunkWidth / 2,
          treeBaseY + 5,
          crownSize * 0.6,
          8,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // Ствол дерева
        const trunkGradient = ctx.createLinearGradient(
          treeX,
          treeTopY + crownSize,
          treeX + trunkWidth,
          treeBaseY
        );
        trunkGradient.addColorStop(0, '#8B4513'); // Коричневый
        trunkGradient.addColorStop(1, '#654321'); // Темно-коричневый
        ctx.fillStyle = trunkGradient;
        ctx.fillRect(
          treeX,
          treeTopY + crownSize,
          trunkWidth,
          treeHeight - crownSize
        );
        
        // Крона дерева (несколько слоев для объема)
        const crownY = treeTopY + crownSize * 0.3;
        
        // Внешний слой (темнее)
        const crownGradient1 = ctx.createRadialGradient(
          treeX + trunkWidth / 2,
          crownY,
          0,
          treeX + trunkWidth / 2,
          crownY,
          crownSize
        );
        crownGradient1.addColorStop(0, '#228B22'); // Темно-зеленый
        crownGradient1.addColorStop(0.7, '#32CD32'); // Зеленый
        crownGradient1.addColorStop(1, '#228B22'); // Темно-зеленый
        ctx.fillStyle = crownGradient1;
        ctx.beginPath();
        ctx.arc(
          treeX + trunkWidth / 2,
          crownY,
          crownSize,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // Внутренний слой (светлее)
        const crownGradient2 = ctx.createRadialGradient(
          treeX + trunkWidth / 2,
          crownY - crownSize * 0.2,
          0,
          treeX + trunkWidth / 2,
          crownY - crownSize * 0.2,
          crownSize * 0.7
        );
        crownGradient2.addColorStop(0, '#90EE90'); // Светло-зеленый
        crownGradient2.addColorStop(1, '#32CD32'); // Зеленый
        ctx.fillStyle = crownGradient2;
        ctx.beginPath();
        ctx.arc(
          treeX + trunkWidth / 2,
          crownY - crownSize * 0.2,
          crownSize * 0.7,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
      });
    },
    [width, height]
  );
  
  // Функция отрисовки цветов на земле
  // Оптимизирована для отрисовки только видимых цветов
  const drawFlowers = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const flowers = flowersRef.current;
      const groundY = height - 50;
      const offset = groundOffsetRef.current;
      
      // Фильтруем только видимые цветы для оптимизации
      // Увеличиваем запас для плавной отрисовки при движении
      const margin = 50;
      const visibleFlowers = flowers.filter((flower) => {
        const flowerScreenX = (flower.x - offset) % (width + 100);
        return flowerScreenX > -margin && flowerScreenX < width + margin;
      });
      
      visibleFlowers.forEach((flower) => {
        const flowerX = ((flower.x - offset) % (width + 100) + width + 100) % (width + 100);
        const flowerY = flower.y;
        const size = flower.size;
        
        ctx.save();
        
        switch (flower.type) {
          case 'daisy': {
            // Ромашка - белые лепестки с желтой серединкой
            // Лепестки
            ctx.fillStyle = '#FFFFFF';
            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * Math.PI * 2;
              const petalX = flowerX + Math.cos(angle) * size * 0.6;
              const petalY = flowerY + Math.sin(angle) * size * 0.6;
              ctx.beginPath();
              ctx.ellipse(petalX, petalY, size * 0.3, size * 0.5, angle, 0, Math.PI * 2);
              ctx.fill();
            }
            // Серединка
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(flowerX, flowerY, size * 0.3, 0, Math.PI * 2);
            ctx.fill();
            break;
          }
          case 'tulip': {
            // Тюльпан - красный с листьями
            // Листья
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.ellipse(flowerX - size * 0.4, flowerY + size * 0.3, size * 0.2, size * 0.6, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(flowerX + size * 0.4, flowerY + size * 0.3, size * 0.2, size * 0.6, 0.3, 0, Math.PI * 2);
            ctx.fill();
            // Цветок
            const tulipGradient = ctx.createLinearGradient(flowerX, flowerY - size, flowerX, flowerY);
            tulipGradient.addColorStop(0, '#FF1493');
            tulipGradient.addColorStop(1, '#DC143C');
            ctx.fillStyle = tulipGradient;
            ctx.beginPath();
            ctx.ellipse(flowerX, flowerY - size * 0.2, size * 0.4, size * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
            break;
          }
          case 'sunflower': {
            // Подсолнух - желтый с коричневой серединкой
            // Лепестки
            ctx.fillStyle = '#FFD700';
            for (let i = 0; i < 12; i++) {
              const angle = (i / 12) * Math.PI * 2;
              const petalX = flowerX + Math.cos(angle) * size * 0.7;
              const petalY = flowerY + Math.sin(angle) * size * 0.7;
              ctx.beginPath();
              ctx.ellipse(petalX, petalY, size * 0.25, size * 0.6, angle, 0, Math.PI * 2);
              ctx.fill();
            }
            // Серединка
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.arc(flowerX, flowerY, size * 0.4, 0, Math.PI * 2);
            ctx.fill();
            // Текстура на серединке
            ctx.fillStyle = '#654321';
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2;
              const dotX = flowerX + Math.cos(angle) * size * 0.2;
              const dotY = flowerY + Math.sin(angle) * size * 0.2;
              ctx.beginPath();
              ctx.arc(dotX, dotY, size * 0.08, 0, Math.PI * 2);
              ctx.fill();
            }
            break;
          }
        }
        
        ctx.restore();
      });
    },
    [width, height]
  );
  
  // Функция отрисовки птиц
  // Оптимизирована для отрисовки только видимых птиц
  const drawBirds = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const birds = birdsRef.current;
      const margin = 50; // Запас для плавной отрисовки
      
      // Фильтруем только видимые птицы для оптимизации
      const visibleBirds = birds.filter((bird) => {
        return bird.x > -margin && bird.x < width + margin;
      });
      
      visibleBirds.forEach((bird) => {
        ctx.save();
        
        // Позиция птицы
        const birdX = bird.x;
        const birdY = bird.y;
        const size = bird.size;
        
        // Определение угла наклона в зависимости от направления движения
        const angle = Math.atan2(bird.vy, bird.vx);
        
        // Смещение крыльев для анимации
        const wingOffset = bird.wingState === 'up' ? -size * 0.3 : size * 0.3;
        
        ctx.translate(birdX, birdY);
        ctx.rotate(angle);
        
        // Тело птицы (эллипс)
        ctx.fillStyle = '#4A4A4A'; // Темно-серый
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Крылья
        ctx.fillStyle = '#6B6B6B'; // Серый
        ctx.beginPath();
        // Верхнее крыло
        ctx.ellipse(
          -size * 0.2,
          wingOffset,
          size * 0.5,
          size * 0.3,
          -0.3,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // Нижнее крыло
        ctx.beginPath();
        ctx.ellipse(
          -size * 0.2,
          -wingOffset,
          size * 0.5,
          size * 0.3,
          0.3,
          0,
          Math.PI * 2
        );
        ctx.fill();
        
        // Голова птицы
        ctx.fillStyle = '#4A4A4A';
        ctx.beginPath();
        ctx.arc(size * 0.4, 0, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Глаз
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(size * 0.45, -size * 0.1, size * 0.08, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(size * 0.47, -size * 0.1, size * 0.05, 0, Math.PI * 2);
        ctx.fill();
        
        // Клюв
        ctx.fillStyle = '#FF8C00'; // Оранжевый
        ctx.beginPath();
        ctx.moveTo(size * 0.55, 0);
        ctx.lineTo(size * 0.7, -size * 0.1);
        ctx.lineTo(size * 0.7, size * 0.1);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
      });
    },
    [width]
  );
  
  // Функция отрисовки земли с улучшенной визуализацией
  const drawGround = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const groundHeight = 50;
      const groundY = height - groundHeight;
      const offset = groundOffsetRef.current;
      
      // Градиент для травы (более реалистичный вид)
      const grassGradient = ctx.createLinearGradient(0, groundY, 0, groundY + 30);
      grassGradient.addColorStop(0, '#90EE90'); // Светло-зеленый сверху
      grassGradient.addColorStop(0.5, '#7CCD7C'); // Средний зеленый
      grassGradient.addColorStop(1, '#6B8E6B'); // Темно-зеленый снизу
      ctx.fillStyle = grassGradient;
      ctx.fillRect(0, groundY, width, 30);
      
      // Земля (нижний слой) с градиентом
      const earthGradient = ctx.createLinearGradient(0, groundY + 30, 0, height);
      earthGradient.addColorStop(0, '#8B4513'); // Коричневый сверху
      earthGradient.addColorStop(1, '#654321'); // Темно-коричневый снизу
      ctx.fillStyle = earthGradient;
      ctx.fillRect(0, groundY + 30, width, 20);
      
      // Текстура травы
      drawGrassTexture(ctx, groundY, offset);
      
      // Декоративные элементы: небольшие камни (опционально, для атмосферы)
      ctx.save();
      ctx.fillStyle = '#696969';
      ctx.globalAlpha = 0.3;
      // Рисуем несколько небольших камней
      for (let i = 0; i < 3; i++) {
        const stoneX = (offset + i * 250) % (width + 50);
        const stoneY = groundY + 25;
        ctx.beginPath();
        ctx.arc(stoneX, stoneY, 3 + Math.sin(stoneX) * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    },
    [width, height, drawGrassTexture]
  );

  // Функция для получения радужного цвета
  const getRainbowColor = useCallback((hue: number) => {
    const h = (hue % 360) / 60;
    const c = 1;
    const x = c * (1 - Math.abs((h % 2) - 1));
    let r = 0, g = 0, b = 0;
    if (h < 1) { r = c; g = x; b = 0; }
    else if (h < 2) { r = x; g = c; b = 0; }
    else if (h < 3) { r = 0; g = c; b = x; }
    else if (h < 4) { r = 0; g = x; b = c; }
    else if (h < 5) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return `rgb(${Math.floor(r * 255)}, ${Math.floor(g * 255)}, ${Math.floor(b * 255)})`;
  }, []);

  // Игровой цикл: отрисовка
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (performanceMonitor.isEnabled()) {
      performanceMonitor.update();
    }

    ctx.clearRect(0, 0, width, height);

    // Радужный эффект для фона
    const rainbowHue = easterEggs.rainbowMode ? (Date.now() / 20) % 360 : 0;

    drawSky(ctx);
    drawClouds(ctx);
    drawTrees(ctx);
    drawGround(ctx);
    drawFlowers(ctx);
    drawBirds(ctx);

    // Отрисовка игровых объектов во время игры и паузы
    if (gameState === GameState.PLAYING || gameState === GameState.PAUSED) {
      if (!duckRef.current || !obstacleManagerRef.current) return;
      
      const duck = duckRef.current;
      const obstacleManager = obstacleManagerRef.current;
      
      // Отрисовка препятствий (с учетом ninja mode)
      if (!easterEggs.ninjaMode) {
        obstacleManager.draw(ctx);
      }

      // Отрисовка утки (поверх всего) с изменением размера
      ctx.save();
      if (easterEggs.bigDuck) {
        const centerX = duck.position.x + duck.width / 2;
        const centerY = duck.position.y + duck.height / 2;
        ctx.translate(centerX, centerY);
        ctx.scale(1.5, 1.5);
        ctx.translate(-centerX, -centerY);
      } else if (easterEggs.tinyDuck) {
        const centerX = duck.position.x + duck.width / 2;
        const centerY = duck.position.y + duck.height / 2;
        ctx.translate(centerX, centerY);
        ctx.scale(0.6, 0.6);
        ctx.translate(-centerX, -centerY);
      }
      duck.draw(ctx);
      ctx.restore();

      // Easter egg: sunglasses on the duck
      if (easterEggs.sunglassesUnlocked || easterEggs.partyMode) {
        ctx.save();
        const centerX = duck.position.x + duck.width / 2;
        const centerY = duck.position.y + duck.height / 2;
        ctx.translate(centerX, centerY);
        // Offset towards the "eyes" relative to the duck center
        ctx.translate(duck.width / 2 - 15, -5);
        ctx.fillStyle = '#000000';
        // Lenses
        ctx.fillRect(-6, -3, 6, 6);
        ctx.fillRect(2, -3, 6, 6);
        // Bridge
        ctx.fillRect(0, -1, 2, 2);
        // Temple (arm)
        ctx.fillRect(8, -1, 6, 2);
        ctx.restore();
      }

      // Отрисовка системы частиц (поверх утки для эффекта взрыва)
      if (particleSystemRef.current) {
        particleSystemRef.current.draw(ctx);
      }

      // Отрисовка счета
      drawScore(ctx);

      // Отрисовка лучшего результата
      if (highScore > 0) {
        drawHighScore(ctx, false);
      }

      // Индикатор godmode
      if (easterEggs.godMode) {
        ctx.save();
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const godModeText = 'GOD MODE';
        ctx.strokeText(godModeText, 20, height - 40);
        ctx.fillText(godModeText, 20, height - 40);
        ctx.restore();
      }

      // Индикатор slowmo
      if (easterEggs.slowmoMode) {
        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#00FFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const slowmoText = 'SLOWMO';
        ctx.strokeText(slowmoText, 20, height - 70);
        ctx.fillText(slowmoText, 20, height - 70);
        ctx.restore();
      }

      // Индикатор speed mode
      if (easterEggs.speedMode) {
        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#FF00FF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const speedText = 'SPEED';
        ctx.strokeText(speedText, 20, height - 100);
        ctx.fillText(speedText, 20, height - 100);
        ctx.restore();
      }

      // Индикатор matrix mode
      if (easterEggs.matrixMode) {
        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#00FF00';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const matrixText = 'MATRIX';
        ctx.strokeText(matrixText, 20, height - 130);
        ctx.fillText(matrixText, 20, height - 130);
        ctx.restore();
      }

      // Индикатор night mode
      if (easterEggs.nightMode) {
        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#8B00FF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const nightText = 'NIGHT';
        ctx.strokeText(nightText, 20, height - 160);
        ctx.fillText(nightText, 20, height - 160);
        ctx.restore();
      }

      // Индикатор double jump
      if (easterEggs.doubleJump) {
        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#00FFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const doubleJumpText = 'DOUBLE JUMP';
        ctx.strokeText(doubleJumpText, 20, height - 190);
        ctx.fillText(doubleJumpText, 20, height - 190);
        ctx.restore();
      }

      // Индикатор reverse gravity
      if (easterEggs.reverseGravity) {
        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#FF00FF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const gravityText = 'REVERSE GRAVITY';
        ctx.strokeText(gravityText, 20, height - 220);
        ctx.fillText(gravityText, 20, height - 220);
        ctx.restore();
      }

      // Индикатор chaos mode
      if (easterEggs.chaosMode) {
        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#FF0000';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const chaosText = 'CHAOS';
        ctx.strokeText(chaosText, 20, height - 250);
        ctx.fillText(chaosText, 20, height - 250);
        ctx.restore();
      }

      // Индикатор zen mode
      if (easterEggs.zenMode) {
        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#00FF00';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const zenText = 'ZEN';
        ctx.strokeText(zenText, 20, height - 280);
        ctx.fillText(zenText, 20, height - 280);
        ctx.restore();
      }

      // Индикатор glow mode
      if (easterEggs.glowMode) {
        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#FFFF00';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const glowText = 'GLOW';
        ctx.strokeText(glowText, 20, height - 310);
        ctx.fillText(glowText, 20, height - 310);
        ctx.restore();
      }

      // Индикатор ninja mode
      if (easterEggs.ninjaMode) {
        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#808080';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const ninjaText = 'NINJA';
        ctx.strokeText(ninjaText, 20, height - 340);
        ctx.fillText(ninjaText, 20, height - 340);
        ctx.restore();
      }

      // Индикатор bounce mode
      if (easterEggs.bounceMode) {
        ctx.save();
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#00FF00';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const bounceText = 'BOUNCE';
        ctx.strokeText(bounceText, 20, height - 370);
        ctx.fillText(bounceText, 20, height - 370);
        ctx.restore();
      }

      // Glow эффект для утки
      if (easterEggs.glowMode && duckRef.current) {
        ctx.save();
        const duck = duckRef.current;
        const centerX = duck.position.x + duck.width / 2;
        const centerY = duck.position.y + duck.height / 2;
        const glowHue = (Date.now() / 30) % 360;
        const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, duck.width * 2);
        glowGradient.addColorStop(0, getRainbowColor(glowHue));
        glowGradient.addColorStop(0.5, getRainbowColor((glowHue + 60) % 360));
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(centerX - duck.width * 2, centerY - duck.height * 2, duck.width * 4, duck.height * 4);
        ctx.restore();
      }

      // Радужный эффект для утки
      if (easterEggs.rainbowMode && duckRef.current && !easterEggs.glowMode) {
        ctx.save();
        const duck = duckRef.current;
        const centerX = duck.position.x + duck.width / 2;
        const centerY = duck.position.y + duck.height / 2;
        const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, duck.width);
        glowGradient.addColorStop(0, getRainbowColor(rainbowHue));
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(centerX - duck.width, centerY - duck.height, duck.width * 2, duck.height * 2);
        ctx.restore();
      }
    }

    // Отрисовка в меню и при окончании игры
    if (gameState === GameState.MENU || gameState === GameState.GAME_OVER) {
      // Отрисовка лучшего результата
      if (highScore > 0) {
        drawHighScore(ctx, true);
      }
      
      // Отрисовка текущего счета при окончании игры
      if (gameState === GameState.GAME_OVER && score > 0) {
        ctx.save();
        ctx.font = 'bold 36px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const scoreText = `Ваш счет: ${score}`;
        const textX = width / 2;
        const textY = height / 2 + 20;

        // Тень для лучшей читаемости
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Обводка для читаемости
        ctx.strokeText(scoreText, textX, textY);
        ctx.fillText(scoreText, textX, textY);
        
        // Сброс тени
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.restore();

        // Отображение индикации нового рекорда
        const isNewRecord = score === highScore && score > 0;
        if (isNewRecord) {
          ctx.save();
          ctx.font = 'bold 32px Arial';
          ctx.fillStyle = '#FFD700';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 4;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const newRecordText = '🎉 Новый рекорд! 🎉';
          const recordTextX = width / 2;
          const recordTextY = height / 2 + 70;

          // Эффектная тень для выделения нового рекорда
          ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          // Обводка для читаемости
          ctx.strokeText(newRecordText, recordTextX, recordTextY);
          ctx.fillText(newRecordText, recordTextX, recordTextY);
          
          // Сброс тени
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      }
    }

    // Применяем переворот экрана если включен
    if (easterEggs.flipMode) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const flippedData = new Uint8ClampedArray(data.length);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const srcIndex = (y * width + x) * 4;
          const dstIndex = (y * width + (width - 1 - x)) * 4;
          flippedData[dstIndex] = data[srcIndex];
          flippedData[dstIndex + 1] = data[srcIndex + 1];
          flippedData[dstIndex + 2] = data[srcIndex + 2];
          flippedData[dstIndex + 3] = data[srcIndex + 3];
        }
      }
      const flippedImageData = new ImageData(flippedData, width, height);
      ctx.putImageData(flippedImageData, 0, 0);
    }

    // Применяем эффект матрицы если включен
    if (easterEggs.matrixMode) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#00FF00';
      ctx.font = '12px monospace';
      const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
      for (let i = 0; i < 100; i++) {
        const x = (i * 37 + Date.now() / 10) % width;
        const y = (i * 23 + Date.now() / 5) % height;
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, x, y);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // Применяем shuffle mode - перемешивание цветов
    if (easterEggs.shuffleMode) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const time = Date.now();
      for (let i = 0; i < data.length; i += 4) {
        const offset = Math.sin(time / 100 + i / 1000) * 50;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i] = Math.max(0, Math.min(255, g + offset));
        data[i + 1] = Math.max(0, Math.min(255, b + offset));
        data[i + 2] = Math.max(0, Math.min(255, r + offset));
      }
      ctx.putImageData(imageData, 0, 0);
    }

    // Применяем инверсию цветов если включена (в конце всей отрисовки)
    if (easterEggs.invertColors) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      ctx.putImageData(imageData, 0, 0);
    }
    }, [gameState, width, height, drawScore, drawHighScore, highScore, score, drawSky, drawClouds, drawGround, drawTrees, drawFlowers, drawBirds, easterEggs.sunglassesUnlocked, easterEggs.partyMode, easterEggs.rainbowMode, easterEggs.invertColors, easterEggs.godMode, easterEggs.slowmoMode, easterEggs.matrixMode, easterEggs.flipMode, easterEggs.bigDuck, easterEggs.tinyDuck, easterEggs.glowMode, easterEggs.ninjaMode, easterEggs.shuffleMode, getRainbowColor]);
  
  // Unlock sunglasses when the score reaches 42
  useEffect(() => {
    if (gameState === GameState.PLAYING && score >= 42 && !easterEggs.sunglassesUnlocked) {
      unlockSunglasses();
      soundManager.play('score');
    }
  }, [score, gameState, easterEggs.sunglassesUnlocked, unlockSunglasses]);

  // Easter egg: score milestones
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      if (score === 69) {
        setPartyMode(true);
        setRainbowMode(true);
        unlockSunglasses();
        if (particleSystemRef.current && duckRef.current) {
          const centerX = duckRef.current.position.x + duckRef.current.width / 2;
          const centerY = duckRef.current.position.y + duckRef.current.height / 2;
          particleSystemRef.current.emit(centerX, centerY, 20, '#FF00FF');
        }
        soundManager.play('score');
      }
      if (score === 100 && !easterEggs.rainbowMode) {
        setRainbowMode(true);
        soundManager.play('score');
        if (particleSystemRef.current && duckRef.current) {
          const centerX = duckRef.current.position.x + duckRef.current.width / 2;
          const centerY = duckRef.current.position.y + duckRef.current.height / 2;
          for (let i = 0; i < 5; i++) {
            setTimeout(() => {
              if (particleSystemRef.current) {
                particleSystemRef.current.emit(centerX, centerY, 15, '#FF00FF');
              }
            }, i * 50);
          }
        }
      }
      if (score === 200 && !easterEggs.slowmoMode) {
        setSlowmoMode(true);
        soundManager.play('score');
      }
      if (score === 420) {
        setMatrixMode(true);
        setGlowMode(true);
        if (particleSystemRef.current && duckRef.current) {
          const centerX = duckRef.current.position.x + duckRef.current.width / 2;
          const centerY = duckRef.current.position.y + duckRef.current.height / 2;
          for (let i = 0; i < 10; i++) {
            setTimeout(() => {
              if (particleSystemRef.current) {
                particleSystemRef.current.emit(centerX, centerY, 12, '#00FF00');
              }
            }, i * 30);
          }
        }
        soundManager.play('score');
      }
      if (score === 500) {
        setGodMode(true);
        setRainbowMode(true);
        soundManager.play('score');
        if (particleSystemRef.current && duckRef.current) {
          const centerX = duckRef.current.position.x + duckRef.current.width / 2;
          const centerY = duckRef.current.position.y + duckRef.current.height / 2;
          particleSystemRef.current.emit(centerX, centerY, 30, '#FFD700');
        }
      }
      if (score === 777) {
        setChaosMode(true);
        setRainbowMode(true);
        setGlowMode(true);
        setDoubleJump(true);
        unlockSunglasses();
        if (particleSystemRef.current && duckRef.current) {
          const centerX = duckRef.current.position.x + duckRef.current.width / 2;
          const centerY = duckRef.current.position.y + duckRef.current.height / 2;
          for (let i = 0; i < 15; i++) {
            setTimeout(() => {
              if (particleSystemRef.current) {
                const colors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000', '#00FF00', '#0000FF'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                particleSystemRef.current.emit(centerX, centerY, 15, color);
              }
            }, i * 50);
          }
        }
        soundManager.play('score');
      }
      if (score === 1000) {
        setGodMode(true);
        setRainbowMode(true);
        setGlowMode(true);
        setDoubleJump(true);
        setBounceMode(true);
        unlockSunglasses();
        if (particleSystemRef.current && duckRef.current) {
          const centerX = duckRef.current.position.x + duckRef.current.width / 2;
          const centerY = duckRef.current.position.y + duckRef.current.height / 2;
          for (let i = 0; i < 20; i++) {
            setTimeout(() => {
              if (particleSystemRef.current) {
                const colors = ['#FF3B30','#FF9500','#FFCC00','#34C759','#5AC8FA','#007AFF','#AF52DE'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                particleSystemRef.current.emit(centerX, centerY, 18, color);
              }
            }, i * 40);
          }
        }
        soundManager.play('score');
      }
    }
  }, [score, gameState, easterEggs.rainbowMode, easterEggs.slowmoMode, easterEggs.matrixMode, easterEggs.glowMode, easterEggs.chaosMode, setRainbowMode, setSlowmoMode, setGodMode, setMatrixMode, setGlowMode, setChaosMode, setDoubleJump, setBounceMode, unlockSunglasses, setPartyMode]);

  // Подключение игрового цикла
  useGameLoop({
    update,
    render,
    isRunning: gameState === GameState.PLAYING,
  });

  // Отрисовка в состояниях MENU, PAUSED и GAME_OVER (когда игровой цикл не активен)
  // Используем ref для отслеживания gameState, чтобы избежать проблем с замыканием
  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Ref для функции render, чтобы избежать пересоздания анимации
  const renderRef = useRef(render);
  useEffect(() => {
    renderRef.current = render;
  }, [render]);

  useEffect(() => {
    if (gameState === GameState.MENU || gameState === GameState.GAME_OVER || gameState === GameState.PAUSED) {
      renderRef.current();
      
      // Анимация облаков и земли в меню (но не во время паузы - игра должна быть заморожена)
      if (gameState === GameState.MENU || gameState === GameState.GAME_OVER) {
        let animationFrameId: number | undefined;
        let lastTime = performance.now();
        let isRunning = true;
        
        const animateBackground = (currentTime: number) => {
          // Проверяем актуальное состояние через ref для предотвращения утечек
          const currentState = gameStateRef.current;
          if (!isRunning || (currentState !== GameState.MENU && currentState !== GameState.GAME_OVER)) {
            return;
          }
          
          const deltaTime = currentTime - lastTime;
          lastTime = currentTime;
          
          updateClouds(deltaTime);
          // В меню и при окончании игры используем базовую скорость
          updateGround(deltaTime, 1);
          updateTrees(deltaTime);
          updateBirds(deltaTime);
          renderRef.current();
          
          // Продолжаем анимацию только если состояние не изменилось
          if (isRunning && (gameStateRef.current === GameState.MENU || gameStateRef.current === GameState.GAME_OVER)) {
            animationFrameId = requestAnimationFrame(animateBackground);
          }
        };
        
        animationFrameId = requestAnimationFrame(animateBackground);
        
        return () => {
          isRunning = false;
          if (animationFrameId !== undefined) {
            cancelAnimationFrame(animationFrameId);
          }
        };
      }
    }
  }, [gameState, updateClouds, updateGround, updateTrees, updateBirds]);

  // Сброс игровых объектов при возврате в меню
  useEffect(() => {
    if (gameState === GameState.MENU) {
      // Сбрасываем флаг при возврате в меню
      gameOverCalledRef.current = false;
      // Сбрасываем анимацию счета
      setScoreScale(1);
      // Сбрасываем смещение земли (опционально, можно оставить для непрерывной анимации)
      // groundOffsetRef.current = 0;
      if (duckRef.current) {
        duckRef.current.reset();
      }
      if (obstacleManagerRef.current) {
        obstacleManagerRef.current.reset();
      }
      if (particleSystemRef.current) {
        particleSystemRef.current.clear();
      }
      doubleJumpUsedRef.current = false;
      lastJumpTimeRef.current = 0;
    }
  }, [gameState]);
  
  // Функция масштабирования canvas для адаптивности
  const scaleCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (!container) return;
    
    // Определяем, является ли устройство мобильным
    const isMobile = window.innerWidth < 768;
    
    // Вычисляем масштаб на основе доступного пространства контейнера
    const containerWidth = container.clientWidth;
    // Для мобильных устройств используем всю высоту экрана с небольшим отступом
    // Для десктопа учитываем отступы
    const containerHeight = isMobile 
      ? window.innerHeight - 20 // Минимальный отступ для мобильных
      : window.innerHeight - 100; // Больше отступов для десктопа
    
    // Защита от деления на ноль и некорректных значений
    if (width <= 0 || height <= 0 || containerWidth <= 0 || containerHeight <= 0) {
      return;
    }
    
    const scaleX = containerWidth / width;
    const scaleY = containerHeight / height;
    
    // Используем минимальный масштаб для сохранения пропорций
    // На мобильных разрешаем масштабирование меньше 1, если необходимо
    // Math.max(0.01, ...) предотвращает отрицательные или нулевые значения scale,
    // что может произойти при очень маленькой высоте окна или нулевой ширине/высоте
    const scale = Math.max(0.01, Math.min(scaleX, scaleY, isMobile ? Infinity : 1));
    
    // Применяем масштаб к стилям canvas (размер отображения)
    canvas.style.width = `${width * scale}px`;
    canvas.style.height = `${height * scale}px`;
    
    // Внутренние размеры canvas остаются фиксированными (width x height)
    // Это обеспечивает правильную отрисовку независимо от размера экрана
  }, [width, height]);
  
  // Обработка изменения размера окна
  useEffect(() => {
    // Масштабируем при монтировании
    scaleCanvas();
    
    // Debounce для resize события для оптимизации производительности
    let resizeTimeoutId: number | undefined;
    const handleResize = () => {
      if (resizeTimeoutId) {
        clearTimeout(resizeTimeoutId);
      }
      resizeTimeoutId = window.setTimeout(() => {
        scaleCanvas();
      }, 150); // Задержка 150ms для оптимизации
    };
    
    window.addEventListener('resize', handleResize);
    // Также обрабатываем изменение ориентации на мобильных устройствах
    const handleOrientationChange = () => {
      // Небольшая задержка для корректного определения новых размеров
      setTimeout(scaleCanvas, 100);
    };
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      if (resizeTimeoutId) {
        clearTimeout(resizeTimeoutId);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [scaleCanvas]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={styles.canvas}
      onClick={handleCanvasClick}
      onTouchStart={handleTouchStart}
    />
  );
};
