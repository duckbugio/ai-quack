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
  const { gameState, score, highScore, startGame, gameOver, incrementScore, pauseGame, resumeGame, selectedCharacter } =
    useGame();
  
  // Инициализация игровых объектов (создаются один раз)
  const duckRef = useRef<Duck | null>(null);
  const obstacleManagerRef = useRef<ObstacleManager | null>(null);
  const particleSystemRef = useRef<ParticleSystem | null>(null);
  // Флаг для предотвращения повторных вызовов gameOver в одном кадре
  const gameOverCalledRef = useRef<boolean>(false);
  
  // Состояние для анимации счета
  const [scoreScale, setScoreScale] = useState(1);
  
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
    duckRef.current = new Duck(selectedCharacter);
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

  // Игровой цикл: обновление состояния
  const update = useCallback(
    (deltaTime: number) => {
      // Вычисляем множитель сложности на основе текущего счета
      const difficultyMultiplier = getDifficultyMultiplier(score);
      const currentSpacing = getCurrentSpacing(score, PIPE_SPACING);
      
      // Обновление облаков (работает всегда для плавной анимации)
      updateClouds(deltaTime);
      
      // Обновление земли с учетом сложности (работает всегда для плавной анимации)
      updateGround(deltaTime, difficultyMultiplier);
      
      // Обновление деревьев (параллакс-эффект)
      // Деревья движутся медленнее, но тоже с учетом сложности для согласованности
      updateTrees(deltaTime);
      
      // Обновление птиц (работает всегда для плавной анимации)
      updateBirds(deltaTime);
      
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
    [gameState, height, score, checkCollisions, gameOver, updateClouds, updateGround, updateTrees, updateBirds]
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
    },
    [width, height]
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

    // Очистка canvas
    ctx.clearRect(0, 0, width, height);

    // Отрисовка фона (небо с градиентом)
    drawSky(ctx);
    
    // Отрисовка облаков
    drawClouds(ctx);
    
    // Отрисовка деревьев на заднем плане (перед препятствиями)
    drawTrees(ctx);
    
    // Отрисовка земли
    drawGround(ctx);
    
    // Отрисовка цветов на земле
    drawFlowers(ctx);
    
    // Отрисовка птиц (на переднем плане, но за препятствиями)
    drawBirds(ctx);

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
  }, [gameState, width, height, drawScore, drawHighScore, highScore, score, drawSky, drawClouds, drawGround, drawTrees, drawFlowers, drawBirds]);

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
      // Пересоздаем утку с текущей конфигурацией персонажа
      duckRef.current = new Duck(selectedCharacter);
      if (obstacleManagerRef.current) {
        obstacleManagerRef.current.reset();
      }
      if (particleSystemRef.current) {
        particleSystemRef.current.clear();
      }
    }
  }, [gameState, selectedCharacter]);
  
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
