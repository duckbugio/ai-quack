import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { GameState } from '../../types/game.types';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useGameLoop } from '../../hooks/useGameLoop';
import { ObstacleManager } from '../../game/systems/ObstacleManager';
import { Duck } from '../../game/entities/Duck';
import {
  checkAllCollisions,
} from '../../game/systems/CollisionSystem';
import {
  checkAllObstaclesPassed,
} from '../../game/systems/ScoreSystem';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../game/utils/constants';
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
  const { gameState, score, highScore, startGame, gameOver, incrementScore } =
    useGame();
  
  // Инициализация игровых объектов (создаются один раз)
  const duckRef = useRef<Duck | null>(null);
  const obstacleManagerRef = useRef<ObstacleManager | null>(null);
  // Флаг для предотвращения повторных вызовов gameOver в одном кадре
  const gameOverCalledRef = useRef<boolean>(false);
  
  // Состояние для анимации счета
  const [scoreScale, setScoreScale] = useState(1);

  // Создание экземпляров игровых объектов (только при первом рендере)
  if (!duckRef.current) {
    duckRef.current = new Duck();
  }
  if (!obstacleManagerRef.current) {
    obstacleManagerRef.current = new ObstacleManager();
  }
  
  // Обработчик прыжка утки
  const handleJump = useCallback(() => {
    if (gameState === GameState.PLAYING && duckRef.current) {
      duckRef.current.jump();
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
      }
    }

    // Проверка коллизий с препятствиями
    return checkAllCollisions(duck, obstacles, width);
  }, [incrementScore, width]);

  // Игровой цикл: обновление состояния
  const update = useCallback(
    (deltaTime: number) => {
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
        gameOver();
        return;
      }

      // Обновление препятствий
      obstacleManager.update(deltaTime);

      // Проверка коллизий с препятствиями и подсчет очков
      // Проверка границ уже выполнена в duck.update(), дублирование не требуется
      if (checkCollisions()) {
        gameOverCalledRef.current = true;
        gameOver();
        return;
      }
    },
    [gameState, height, checkCollisions, gameOver]
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

  // Игровой цикл: отрисовка
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очистка canvas
    ctx.clearRect(0, 0, width, height);

    // Отрисовка фона (небо)
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Отрисовка игровых объектов только во время игры
    if (gameState === GameState.PLAYING) {
      if (!duckRef.current || !obstacleManagerRef.current) return;
      
      const duck = duckRef.current;
      const obstacleManager = obstacleManagerRef.current;
      
      // Отрисовка препятствий
      obstacleManager.draw(ctx);

      // Отрисовка утки
      duck.draw(ctx);

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
  }, [gameState, width, height, drawScore, drawHighScore, highScore, score]);

  // Подключение игрового цикла
  useGameLoop({
    update,
    render,
    isRunning: gameState === GameState.PLAYING,
  });

  // Отрисовка в состояниях MENU и GAME_OVER (когда игровой цикл не активен)
  useEffect(() => {
    if (gameState === GameState.MENU || gameState === GameState.GAME_OVER) {
      render();
    }
  }, [gameState, render]);

  // Сброс игровых объектов при возврате в меню
  useEffect(() => {
    if (gameState === GameState.MENU) {
      // Сбрасываем флаг при возврате в меню
      gameOverCalledRef.current = false;
      // Сбрасываем анимацию счета
      setScoreScale(1);
      if (duckRef.current) {
        duckRef.current.reset();
      }
      if (obstacleManagerRef.current) {
        obstacleManagerRef.current.reset();
      }
    }
  }, [gameState]);
  
  // Обработка изменения размера окна
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Можно добавить логику масштабирования при необходимости
      // Пока оставляем фиксированные размеры
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={styles.canvas}
      onClick={handleCanvasClick}
      onTouchStart={handleTouchStart}
    />
  );
};
