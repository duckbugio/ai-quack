import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { GameState } from '../../types/game.types';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useCanvasScale } from '../../hooks/useCanvasScale';
import { ObstacleManager } from '../../game/systems/ObstacleManager';
import { Duck } from '../../game/entities/Duck';
import { checkAllCollisions } from '../../game/systems/CollisionSystem';
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
import { BackgroundElements } from '../../game/decorations/BackgroundElements';
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
  const backgroundElementsRef = useRef<BackgroundElements | null>(null);
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
  if (!backgroundElementsRef.current) {
    backgroundElementsRef.current = new BackgroundElements(width, height);
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
  
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.clearRect(0, 0, width, height);
  }, [width, height]);

  useCanvasScale({ canvasRef, width, height });

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

  const createParticleExplosion = useCallback((duck: Duck) => {
    if (particleSystemRef.current) {
      const centerX = duck.position.x + duck.width / 2;
      const centerY = duck.position.y + duck.height / 2;
      particleSystemRef.current.emit(centerX, centerY, 20, '#FF4500');
    }
  }, []);

  const update = useCallback(
    (deltaTime: number) => {
      const difficultyMultiplier = getDifficultyMultiplier(score);
      const currentSpacing = getCurrentSpacing(score, PIPE_SPACING);
      const background = backgroundElementsRef.current;
      
      if (background) {
        background.updateClouds(deltaTime);
        background.updateGround(deltaTime, difficultyMultiplier);
        background.updateTrees(deltaTime);
        background.updateBirds(deltaTime);
      }
      
      if (gameState !== GameState.PLAYING) {
        gameOverCalledRef.current = false;
        return;
      }
      
      if (!duckRef.current || !obstacleManagerRef.current) return;
      
      gameOverCalledRef.current = false;
      
      const duck = duckRef.current;
      const obstacleManager = obstacleManagerRef.current;
      
      const hitBoundary = duck.update(deltaTime, height);
      if (hitBoundary) {
        gameOverCalledRef.current = true;
        createParticleExplosion(duck);
        soundManager.play('hit');
        gameOver();
        return;
      }

      obstacleManager.update(deltaTime, difficultyMultiplier, currentSpacing);

      if (particleSystemRef.current) {
        particleSystemRef.current.update(deltaTime);
      }

      if (checkCollisions()) {
        gameOverCalledRef.current = true;
        createParticleExplosion(duck);
        soundManager.play('hit');
        gameOver();
        return;
      }
    },
    [gameState, height, score, checkCollisions, gameOver, createParticleExplosion]
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
      ctx.save();
      ctx.translate(width / 2, 60);
      ctx.scale(scoreScale, scoreScale);
      ctx.translate(-width / 2, -60);

      drawTextWithShadow(ctx, score.toString(), width / 2, 60, {
        font: 'bold 48px Arial',
        fillStyle: '#FFFFFF',
        strokeStyle: '#000000',
        lineWidth: 3,
        textAlign: 'center',
        textBaseline: 'middle',
        shadow: { color: 'rgba(0, 0, 0, 0.5)', blur: 4, offsetX: 2, offsetY: 2 },
      });
      
      ctx.restore();
    },
    [score, width, scoreScale]
  );

  const drawHighScore = useCallback(
    (ctx: CanvasRenderingContext2D, isMenu: boolean = false) => {
      if (isMenu) {
        drawTextWithShadow(ctx, `Лучший результат: ${highScore}`, width / 2, height / 2 - 50, {
          font: 'bold 32px Arial',
          fillStyle: '#FFD700',
          strokeStyle: '#000000',
          lineWidth: 3,
          textAlign: 'center',
          textBaseline: 'middle',
          shadow: { color: 'rgba(0, 0, 0, 0.5)', blur: 4, offsetX: 2, offsetY: 2 },
        });
      } else {
        drawTextWithShadow(ctx, `Best: ${highScore}`, width - 20, 20, {
          font: '24px Arial',
          fillStyle: '#FFFF00',
          strokeStyle: '#000000',
          lineWidth: 2,
          textAlign: 'right',
          textBaseline: 'top',
        });
      }
    },
    [highScore, width, height]
  );


  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (performanceMonitor.isEnabled()) {
      performanceMonitor.update();
    }

    ctx.clearRect(0, 0, width, height);

    const background = backgroundElementsRef.current;
    if (background) {
      background.drawSky(ctx);
      background.drawClouds(ctx);
      background.drawTrees(ctx);
      background.drawGround(ctx);
      background.drawFlowers(ctx);
      background.drawBirds(ctx);
    }

    if (gameState === GameState.PLAYING || gameState === GameState.PAUSED) {
      if (!duckRef.current || !obstacleManagerRef.current) return;
      
      const duck = duckRef.current;
      const obstacleManager = obstacleManagerRef.current;
      
      obstacleManager.draw(ctx);
      duck.draw(ctx);

      if (particleSystemRef.current) {
        particleSystemRef.current.draw(ctx);
      }

      drawScore(ctx);

      if (highScore > 0) {
        drawHighScore(ctx, false);
      }
    }

    if (gameState === GameState.MENU || gameState === GameState.GAME_OVER) {
      if (highScore > 0) {
        drawHighScore(ctx, true);
      }
      
      if (gameState === GameState.GAME_OVER && score > 0) {
        drawTextWithShadow(ctx, `Ваш счет: ${score}`, width / 2, height / 2 + 20, {
          font: 'bold 36px Arial',
          fillStyle: '#FFFFFF',
          strokeStyle: '#000000',
          lineWidth: 3,
          textAlign: 'center',
          textBaseline: 'middle',
          shadow: { color: 'rgba(0, 0, 0, 0.5)', blur: 4, offsetX: 2, offsetY: 2 },
        });

        const isNewRecord = score === highScore && score > 0;
        if (isNewRecord) {
          drawTextWithShadow(ctx, '🎉 Новый рекорд! 🎉', width / 2, height / 2 + 70, {
            font: 'bold 32px Arial',
            fillStyle: '#FFD700',
            strokeStyle: '#000000',
            lineWidth: 4,
            textAlign: 'center',
            textBaseline: 'middle',
            shadow: { color: 'rgba(255, 215, 0, 0.6)', blur: 10, offsetX: 0, offsetY: 0 },
          });
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
      
      if (gameState === GameState.MENU || gameState === GameState.GAME_OVER) {
        let animationFrameId: number | undefined;
        let lastTime = performance.now();
        let isRunning = true;
        const background = backgroundElementsRef.current;
        
        const animateBackground = (currentTime: number) => {
          const currentState = gameStateRef.current;
          if (!isRunning || (currentState !== GameState.MENU && currentState !== GameState.GAME_OVER)) {
            return;
          }
          
          const deltaTime = currentTime - lastTime;
          lastTime = currentTime;
          
          if (background) {
            background.updateClouds(deltaTime);
            background.updateGround(deltaTime, 1);
            background.updateTrees(deltaTime);
            background.updateBirds(deltaTime);
          }
          renderRef.current();
          
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
  }, [gameState]);

  useEffect(() => {
    if (gameState === GameState.MENU) {
      gameOverCalledRef.current = false;
      setScoreScale(1);
      if (duckRef.current) {
        duckRef.current.reset();
      }
      if (obstacleManagerRef.current) {
        obstacleManagerRef.current.reset();
      }
      if (particleSystemRef.current) {
        particleSystemRef.current.clear();
      }
    }
  }, [gameState]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={styles.canvas}
      onClick={handleCanvasClick}
      onTouchStart={handleTouchStart}
    />
  );
};
