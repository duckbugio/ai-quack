import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { GameState } from '../../types/game.types';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useGameLoop } from '../../hooks/useGameLoop';
import { ObstacleManager } from '../../game/systems/ObstacleManager';
import { Duck } from '../../game/entities/Duck';
import { checkAllCollisions } from '../../game/systems/CollisionSystem';
import { ParticleSystem } from '../../game/systems/ParticleSystem';
import {
  checkAllObstaclesPassed,
  getDifficultyMultiplier,
  getCurrentSpacing,
} from '../../game/systems/ScoreSystem';
import { BackgroundManager } from '../../game/systems/BackgroundManager';
import { BackgroundRenderer } from '../../game/systems/BackgroundRenderer';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PIPE_SPACING,
  RESIZE_DEBOUNCE_MS,
  ORIENTATION_CHANGE_DELAY_MS,
} from '../../game/utils/constants';
import { soundManager } from '../../game/utils/SoundManager';
import { performanceMonitor } from '../../game/utils/PerformanceMonitor';
import styles from './GameCanvas.module.css';

interface GameCanvasProps {
  width?: number;
  height?: number;
}

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
  const backgroundManagerRef = useRef<BackgroundManager | null>(null);
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
  if (!backgroundManagerRef.current) {
    backgroundManagerRef.current = new BackgroundManager(width, height);
    backgroundManagerRef.current.initialize();
  }
  if (!backgroundRendererRef.current) {
    backgroundRendererRef.current = new BackgroundRenderer(width, height);
  }
  
  const handleJump = useCallback(() => {
    if (gameState === GameState.PLAYING && duckRef.current) {
      duckRef.current.jump();
      soundManager.play('jump');
    }
  }, [gameState]);
  
  const handleCanvasClick = useCallback(() => {
    if (gameState === GameState.PLAYING) {
      handleJump();
    } else if (gameState === GameState.MENU) {
      startGame();
    }
  }, [gameState, handleJump, startGame]);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (gameState === GameState.PLAYING) {
      handleJump();
    } else if (gameState === GameState.MENU) {
      startGame();
    }
  }, [gameState, handleJump, startGame]);
  
  useKeyboard(handleJump);
  
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
      
      if (backgroundManagerRef.current) {
        backgroundManagerRef.current.updateClouds(deltaTime);
        backgroundManagerRef.current.updateGround(deltaTime, difficultyMultiplier);
        backgroundManagerRef.current.updateTrees(deltaTime);
        backgroundManagerRef.current.updateBirds(deltaTime);
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
        if (particleSystemRef.current) {
          const centerX = duck.position.x + duck.width / 2;
          const centerY = duck.position.y + duck.height / 2;
          particleSystemRef.current.emit(centerX, centerY, 20, '#FF4500');
        }
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


  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (performanceMonitor.isEnabled()) {
      performanceMonitor.update();
    }

    ctx.clearRect(0, 0, width, height);

    if (backgroundManagerRef.current && backgroundRendererRef.current) {
      const bgManager = backgroundManagerRef.current;
      const bgRenderer = backgroundRendererRef.current;

      bgRenderer.drawSky(ctx);
      bgRenderer.drawClouds(ctx, bgManager.getCloudOffset());
      bgRenderer.drawTrees(ctx, bgManager.getTrees(), bgManager.getTreesOffset());
      bgRenderer.drawGround(ctx, bgManager.getGroundOffset());
      bgRenderer.drawFlowers(ctx, bgManager.getFlowers(), bgManager.getGroundOffset());
      bgRenderer.drawBirds(ctx, bgManager.getBirds());
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

        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        ctx.strokeText(scoreText, textX, textY);
        ctx.fillText(scoreText, textX, textY);
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.restore();

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

          ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          ctx.strokeText(newRecordText, recordTextX, recordTextY);
          ctx.fillText(newRecordText, recordTextX, recordTextY);
          
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.restore();
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

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

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
        
        const animateBackground = (currentTime: number) => {
          const currentState = gameStateRef.current;
          if (!isRunning || (currentState !== GameState.MENU && currentState !== GameState.GAME_OVER)) {
            return;
          }
          
          const deltaTime = currentTime - lastTime;
          lastTime = currentTime;
          
          if (backgroundManagerRef.current) {
            backgroundManagerRef.current.updateClouds(deltaTime);
            backgroundManagerRef.current.updateGround(deltaTime, 1);
            backgroundManagerRef.current.updateTrees(deltaTime);
            backgroundManagerRef.current.updateBirds(deltaTime);
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
      if (backgroundManagerRef.current) {
        backgroundManagerRef.current.reset();
      }
    }
  }, [gameState]);
  
  const scaleCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (!container) return;
    
    const isMobile = window.innerWidth < 768;
    const containerWidth = container.clientWidth;
    const containerHeight = isMobile 
      ? window.innerHeight - 20
      : window.innerHeight - 100;
    
    if (width <= 0 || height <= 0 || containerWidth <= 0 || containerHeight <= 0) {
      return;
    }
    
    const scaleX = containerWidth / width;
    const scaleY = containerHeight / height;
    const scale = Math.max(0.01, Math.min(scaleX, scaleY, isMobile ? Infinity : 1));
    
    canvas.style.width = `${width * scale}px`;
    canvas.style.height = `${height * scale}px`;
  }, [width, height]);
  
  useEffect(() => {
    scaleCanvas();
    
    let resizeTimeoutId: number | undefined;
    const handleResize = () => {
      if (resizeTimeoutId) {
        clearTimeout(resizeTimeoutId);
      }
      resizeTimeoutId = window.setTimeout(() => {
        scaleCanvas();
      }, RESIZE_DEBOUNCE_MS);
    };
    
    window.addEventListener('resize', handleResize);
    const handleOrientationChange = () => {
      setTimeout(scaleCanvas, ORIENTATION_CHANGE_DELAY_MS);
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
