import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { GameState } from '../../types/game.types';
import { useKeyboard } from '../../hooks/useKeyboard';
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
  PIPE_SPACING,
} from '../../game/utils/constants';
import { soundManager } from '../../game/utils/SoundManager';
import { performanceMonitor } from '../../game/utils/PerformanceMonitor';
import { BackgroundRenderer } from '../../game/systems/BackgroundRenderer';
import { drawTextWithShadow } from '../../game/utils/canvasUtils';
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
  const { gameState, score, highScore, startGame, gameOver, incrementScore, pauseGame, resumeGame } =
    useGame();
  
  const duckRef = useRef<Duck | null>(null);
  const obstacleManagerRef = useRef<ObstacleManager | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  const backgroundRendererRef = useRef<BackgroundRenderer | null>(null);
  const gameOverCalledRef = useRef<boolean>(false);
  
  const [scoreScale, setScoreScale] = useState(1);

  if (!duckRef.current) {
    duckRef.current = new Duck();
  }
  if (!obstacleManagerRef.current) {
    obstacleManagerRef.current = new ObstacleManager();
  }
  if (!particleSystemRef.current) {
    particleSystemRef.current = new ParticleSystem();
  }
  if (!backgroundRendererRef.current) {
    backgroundRendererRef.current = new BackgroundRenderer(width, height);
  }
  
  // Обработчик прыжка утки
  const handleJump = useCallback(() => {
    if (gameState === GameState.PLAYING && duckRef.current) {
      duckRef.current.jump();
      soundManager.play('jump');
    }
  }, [gameState]);
  
  // Обработчик клика по canvas
  const handleCanvasClick = useCallback(() => {
    if (gameState === GameState.PLAYING) {
      handleJump();
    } else if (gameState === GameState.MENU) {
      startGame();
    }
  }, [gameState, handleJump, startGame]);
  
  // Обработчик touch событий для мобильных устройств
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (gameState === GameState.PLAYING) {
      handleJump();
    } else if (gameState === GameState.MENU) {
      startGame();
    }
  }, [gameState, handleJump, startGame]);
  
  // Подключение обработки клавиатуры
  useKeyboard(handleJump);
  
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


  const update = useCallback(
    (deltaTime: number) => {
      const difficultyMultiplier = getDifficultyMultiplier(score);
      const currentSpacing = getCurrentSpacing(score, PIPE_SPACING);
      const backgroundRenderer = backgroundRendererRef.current;
      
      if (backgroundRenderer) {
        backgroundRenderer.updateClouds(deltaTime);
        backgroundRenderer.updateGround(deltaTime, difficultyMultiplier);
        backgroundRenderer.updateTrees(deltaTime);
        backgroundRenderer.updateBirds(deltaTime);
      }
      
      if (gameState !== GameState.PLAYING) {
        // Сбрасываем флаг при выходе из состояния PLAYING
        gameOverCalledRef.current = false;
        return;
      }
      
      if (!duckRef.current || !obstacleManagerRef.current) return;
      
      // Сбрасываем флаг в начале каждого кадра
      gameOverCalledRef.current = false;
      
      const duck = duckRef.current;
      const obstacleManager = obstacleManagerRef.current;
      
      // Обновление утки (включает проверку границ)
      const hitBoundary = duck.update(deltaTime, height);
      if (hitBoundary) {
        gameOverCalledRef.current = true;
        // Создаем взрыв частиц в позиции утки при столкновении с границей
        if (particleSystemRef.current) {
          const centerX = duck.position.x + duck.width / 2;
          const centerY = duck.position.y + duck.height / 2;
          particleSystemRef.current.emit(centerX, centerY, 20, '#FF4500');
        }
        soundManager.play('hit');
        gameOver();
        return;
      }

      // Обновление препятствий с учетом прогрессивной сложности
      obstacleManager.update(deltaTime, difficultyMultiplier, currentSpacing);

      // Обновление системы частиц
      if (particleSystemRef.current) {
        particleSystemRef.current.update(deltaTime);
      }

      // Проверка коллизий с препятствиями и подсчет очков
      // Проверка границ уже выполнена в duck.update(), дублирование не требуется
      if (checkCollisions()) {
        gameOverCalledRef.current = true;
        // Создаем взрыв частиц в позиции утки при столкновении
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
    [gameState, height, score, checkCollisions, gameOver]
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

  const drawScore = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const scoreText = score.toString();
      const textX = width / 2;
      const textY = 60;

      ctx.save();
      ctx.translate(textX, textY);
      ctx.scale(scoreScale, scoreScale);
      ctx.translate(-textX, -textY);

      drawTextWithShadow(
        ctx,
        scoreText,
        textX,
        textY,
        {
          font: 'bold 48px Arial',
          fillStyle: '#FFFFFF',
          strokeStyle: '#000000',
          lineWidth: 3,
          textAlign: 'center',
          textBaseline: 'middle',
        },
        {
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          shadowBlur: 4,
          shadowOffsetX: 2,
          shadowOffsetY: 2,
        }
      );
      
      ctx.restore();
    },
    [score, width, scoreScale]
  );

  const drawHighScore = useCallback(
    (ctx: CanvasRenderingContext2D, isMenu: boolean = false) => {
      if (isMenu) {
        const highScoreText = `Лучший результат: ${highScore}`;
        drawTextWithShadow(
          ctx,
          highScoreText,
          width / 2,
          height / 2 - 50,
          {
            font: 'bold 32px Arial',
            fillStyle: '#FFD700',
            strokeStyle: '#000000',
            lineWidth: 3,
            textAlign: 'center',
            textBaseline: 'middle',
          },
          {
            shadowColor: 'rgba(0, 0, 0, 0.5)',
            shadowBlur: 4,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
          }
        );
      } else {
        drawTextWithShadow(
          ctx,
          `Best: ${highScore}`,
          width - 20,
          20,
          {
            font: '24px Arial',
            fillStyle: '#FFFF00',
            strokeStyle: '#000000',
            lineWidth: 2,
            textAlign: 'right',
            textBaseline: 'top',
          }
        );
      }
    },
    [highScore, width, height]
  );


  // Игровой цикл: отрисовка
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Обновляем мониторинг производительности (если включен)
    if (performanceMonitor.isEnabled()) {
      performanceMonitor.update();
    }

    ctx.clearRect(0, 0, width, height);

    const backgroundRenderer = backgroundRendererRef.current;
    if (backgroundRenderer) {
      backgroundRenderer.drawSky(ctx);
      backgroundRenderer.drawClouds(ctx);
      backgroundRenderer.drawTrees(ctx);
      backgroundRenderer.drawGround(ctx);
      backgroundRenderer.drawFlowers(ctx);
      backgroundRenderer.drawBirds(ctx);
    }

    // Отрисовка игровых объектов во время игры и паузы
    if (gameState === GameState.PLAYING || gameState === GameState.PAUSED) {
      if (!duckRef.current || !obstacleManagerRef.current) return;
      
      const duck = duckRef.current;
      const obstacleManager = obstacleManagerRef.current;
      
      // Отрисовка препятствий
      obstacleManager.draw(ctx);

      // Отрисовка утки (поверх всего)
      duck.draw(ctx);

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
    }

    // Отрисовка в меню и при окончании игры
    if (gameState === GameState.MENU || gameState === GameState.GAME_OVER) {
      // Отрисовка лучшего результата
      if (highScore > 0) {
        drawHighScore(ctx, true);
      }
      
      if (gameState === GameState.GAME_OVER && score > 0) {
        drawTextWithShadow(
          ctx,
          `Ваш счет: ${score}`,
          width / 2,
          height / 2 + 20,
          {
            font: 'bold 36px Arial',
            fillStyle: '#FFFFFF',
            strokeStyle: '#000000',
            lineWidth: 3,
            textAlign: 'center',
            textBaseline: 'middle',
          },
          {
            shadowColor: 'rgba(0, 0, 0, 0.5)',
            shadowBlur: 4,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
          }
        );

        const isNewRecord = score === highScore && score > 0;
        if (isNewRecord) {
          drawTextWithShadow(
            ctx,
            '🎉 Новый рекорд! 🎉',
            width / 2,
            height / 2 + 70,
            {
              font: 'bold 32px Arial',
              fillStyle: '#FFD700',
              strokeStyle: '#000000',
              lineWidth: 4,
              textAlign: 'center',
              textBaseline: 'middle',
            },
            {
              shadowColor: 'rgba(255, 215, 0, 0.6)',
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowOffsetY: 0,
            }
          );
        }
      }
    }
  }, [gameState, width, height, drawScore, drawHighScore, highScore, score]);

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
          
          const backgroundRenderer = backgroundRendererRef.current;
          if (backgroundRenderer) {
            backgroundRenderer.updateClouds(deltaTime);
            backgroundRenderer.updateGround(deltaTime, 1);
            backgroundRenderer.updateTrees(deltaTime);
            backgroundRenderer.updateBirds(deltaTime);
          }
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
  }, [gameState, render]);

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
      if (backgroundRendererRef.current) {
        backgroundRendererRef.current.reset();
      }
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
