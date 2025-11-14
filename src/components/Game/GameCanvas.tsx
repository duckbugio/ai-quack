import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { GameState } from '../../types/game.types';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useGameLoop } from '../../hooks/useGameLoop';
import { ObstacleManager } from '../../game/systems/ObstacleManager';
import { Duck } from '../../game/entities/Duck';
import { checkAllCollisions } from '../../game/systems/CollisionSystem';
import { checkAllObstaclesPassed } from '../../game/systems/ScoreSystem';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../game/utils/constants';
import {
  drawScore,
  drawHighScore,
  drawGameOverScore,
  drawNewRecord,
  drawSky,
  drawClouds,
  updateCloudOffset,
} from '../../game/utils/renderUtils';
import { SCORE_ANIMATION } from '../../game/utils/uiConstants';
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
  
  // Состояние для движения облаков
  const [cloudOffset, setCloudOffset] = useState(0);

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
      // Обновление облаков (работает всегда для плавной анимации)
      setCloudOffset((prev) => updateCloudOffset(prev, deltaTime, width));
      
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
      if (checkCollisions()) {
        gameOverCalledRef.current = true;
        gameOver();
        return;
      }
    },
    [gameState, height, width, checkCollisions, gameOver]
  );

  // Анимация счета при изменении
  const prevScoreRef = useRef(score);
  useEffect(() => {
    if (gameState === GameState.PLAYING && score > prevScoreRef.current) {
      setScoreScale(SCORE_ANIMATION.SCALE);
      const timer = setTimeout(() => setScoreScale(1), SCORE_ANIMATION.DURATION);
      prevScoreRef.current = score;
      return () => clearTimeout(timer);
    } else if (gameState === GameState.MENU) {
      prevScoreRef.current = 0;
    }
  }, [score, gameState]);


  // Игровой цикл: отрисовка
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очистка canvas
    ctx.clearRect(0, 0, width, height);

    // Отрисовка фона (небо с градиентом)
    drawSky(ctx, width, height);
    
    // Отрисовка облаков
    drawClouds(ctx, width, cloudOffset);

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
      drawScore(ctx, score, width, scoreScale);

      // Отрисовка лучшего результата
      if (highScore > 0) {
        drawHighScore(ctx, highScore, width, height, false);
      }
    }

    // Отрисовка в меню и при окончании игры
    if (gameState === GameState.MENU || gameState === GameState.GAME_OVER) {
      // Отрисовка лучшего результата
      if (highScore > 0) {
        drawHighScore(ctx, highScore, width, height, true);
      }
      
      // Отрисовка текущего счета при окончании игры
      if (gameState === GameState.GAME_OVER && score > 0) {
        drawGameOverScore(ctx, score, width, height);

        // Отображение индикации нового рекорда
        const isNewRecord = score === highScore && score > 0;
        if (isNewRecord) {
          drawNewRecord(ctx, width, height);
        }
      }
    }
  }, [gameState, width, height, score, scoreScale, highScore, cloudOffset]);

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
      
      // Анимация облаков в меню
      let animationFrameId: number;
      let lastTime = performance.now();
      
      const animateClouds = (currentTime: number) => {
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        setCloudOffset((prev) => updateCloudOffset(prev, deltaTime, width));
        render();
        
        if (gameState === GameState.MENU || gameState === GameState.GAME_OVER) {
          animationFrameId = requestAnimationFrame(animateClouds);
        }
      };
      
      animationFrameId = requestAnimationFrame(animateClouds);
      
      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, [gameState, render, width]);

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
