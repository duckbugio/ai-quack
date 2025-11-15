# TODO: Разработка веб-игры "Утка" (Flappy Bird Clone)

## Стек технологий

### Основные технологии:
- **React 18+** - UI библиотека для создания компонентов
- **TypeScript 5+** - Типизированный JavaScript для надежности кода
- **Vite** - Современный сборщик для быстрой разработки
- **Canvas API** - Рендеринг игровой графики и анимаций
- **CSS Modules** - Стилизация компонентов

### Дополнительные инструменты:
- **ESLint** - Линтинг кода
- **Prettier** - Форматирование кода
- **React Testing Library** - Тестирование компонентов (опционально)

---

## Этап 1: Инициализация проекта и настройка окружения

### 1.1 Создание проекта
- [x] Инициализировать React + TypeScript проект через Vite
  - Команда: `npm create vite@latest duck-game -- --template react-ts`
  - Перейти в директорию проекта
  - Установить зависимости: `npm install`

### 1.2 Настройка структуры проекта
- [x] Создать структуру директорий:
  - **Шаг 1:** Создать директории через терминал или файловый менеджер:
    ```bash
    mkdir -p src/components/Game
    mkdir -p src/components/UI
    mkdir -p src/game/entities
    mkdir -p src/game/systems
    mkdir -p src/game/utils
    mkdir -p src/assets/images
    mkdir -p src/assets/sounds
    mkdir -p src/hooks
    mkdir -p src/types
    mkdir -p src/styles
    mkdir -p src/contexts
    ```
  - **Шаг 2:** Проверить структуру командой `tree src` или `find src -type d`
  - **Шаг 3:** Убедиться, что все директории созданы корректно
  ```
  /src
    /components      - React компоненты
      /Game          - Основной игровой компонент
      /UI            - UI компоненты (кнопки, меню)
    /game            - Игровая логика
      /entities      - Игровые сущности (Утка, Препятствия)
      /systems       - Игровые системы (физика, коллизии)
      /utils         - Утилиты (константы, хелперы)
    /assets          - Ресурсы (изображения, звуки)
      /images
      /sounds
    /hooks           - Кастомные React хуки
    /types           - TypeScript типы и интерфейсы
    /styles          - Глобальные стили
    /contexts        - React контексты для состояния
  ```

### 1.3 Настройка инструментов разработки
- [x] Настроить ESLint конфигурацию
  - **Шаг 1:** Установить зависимости: `npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks`
  - **Шаг 2:** Создать файл `.eslintrc.json` в корне проекта со следующим содержимым:
    ```json
    {
      "parser": "@typescript-eslint/parser",
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended"
      ],
      "parserOptions": {
        "ecmaVersion": 2020,
        "sourceType": "module",
        "ecmaFeatures": {
          "jsx": true
        }
      },
      "settings": {
        "react": {
          "version": "detect"
        }
      },
      "rules": {
        "react/react-in-jsx-scope": "off"
      }
    }
    ```
  - **Шаг 3:** Добавить скрипт в `package.json`: `"lint": "eslint src --ext .ts,.tsx"`
  - **Шаг 4:** Проверить работу: `npm run lint`
- [x] Настроить Prettier
  - **Шаг 1:** Установить: `npm install -D prettier`
  - **Шаг 2:** Создать файл `.prettierrc` в корне проекта:
    ```json
    {
      "semi": true,
      "trailingComma": "es5",
      "singleQuote": true,
      "printWidth": 80,
      "tabWidth": 2,
      "useTabs": false
    }
    ```
  - **Шаг 3:** Создать файл `.prettierignore`:
    ```
    node_modules
    dist
    build
    *.min.js
    ```
  - **Шаг 4:** Добавить скрипты в `package.json`: `"format": "prettier --write \"src/**/*.{ts,tsx,css}\""`
- [x] Настроить `.gitignore` для исключения node_modules, dist, и т.д.
  - **Шаг 1:** Проверить наличие `.gitignore` в корне проекта
  - **Шаг 2:** Убедиться, что в нем есть следующие записи:
    ```
    node_modules
    dist
    dist-ssr
    *.local
    .DS_Store
    .env
    .env.local
    .vite
    ```
  - **Шаг 3:** Если файла нет, создать его с указанным содержимым

### 1.4 Настройка базовых типов
- [x] Создать файл `src/types/game.types.ts` с базовыми типами:
  - **Шаг 1:** Создать файл `src/types/game.types.ts`
  - **Шаг 2:** Добавить следующие типы и интерфейсы:
    ```typescript
    // Состояние игры
    export enum GameState {
      MENU = 'MENU',
      PLAYING = 'PLAYING',
      PAUSED = 'PAUSED',
      GAME_OVER = 'GAME_OVER',
    }

    // Позиция объекта на canvas
    export interface Position {
      x: number;
      y: number;
    }

    // Скорость объекта
    export interface Velocity {
      vx: number;
      vy: number;
    }

    // Границы объекта для коллизий
    export interface Bounds {
      x: number;
      y: number;
      width: number;
      height: number;
    }

    // Конфигурация игры
    export interface GameConfig {
      gravity: number;
      jumpForce: number;
      obstacleSpeed: number;
      canvasWidth: number;
      canvasHeight: number;
      duckWidth: number;
      duckHeight: number;
      pipeWidth: number;
      pipeGap: number;
      pipeSpacing: number;
    }
    ```
  - **Шаг 3:** Экспортировать все типы для использования в других файлах
  - **Шаг 4:** Проверить, что файл компилируется без ошибок: `npm run build` или через IDE

---

## Этап 2: Создание базовой структуры игры

### 2.1 Создание игрового Canvas компонента
- [x] Создать компонент `src/components/Game/GameCanvas.tsx`
  - **Шаг 1:** Создать файл `src/components/Game/GameCanvas.tsx`
  - **Шаг 2:** Импортировать необходимые зависимости:
    ```typescript
    import { useRef, useEffect } from 'react';
    ```
  - **Шаг 3:** Создать интерфейс пропсов компонента:
    ```typescript
    interface GameCanvasProps {
      width?: number;
      height?: number;
    }
    ```
  - **Шаг 4:** Реализовать компонент с использованием useRef:
    ```typescript
    export const GameCanvas: React.FC<GameCanvasProps> = ({ 
      width = 800, 
      height = 600 
    }) => {
      const canvasRef = useRef<HTMLCanvasElement>(null);
      
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
        
        // Здесь будет игровая логика
      }, [width, height]);
      
      return <canvas ref={canvasRef} />;
    };
    ```
  - **Шаг 5:** Добавить обработку изменения размера окна:
    ```typescript
    useEffect(() => {
      const handleResize = () => {
        // Логика адаптации размеров
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    ```
  - **Шаг 6:** Добавить базовые стили для canvas (опционально через CSS модуль)

### 2.2 Создание игрового цикла
- [x] Создать хук `src/hooks/useGameLoop.ts`
  - **Шаг 1:** Создать файл `src/hooks/useGameLoop.ts`
  - **Шаг 2:** Определить интерфейс для параметров хука:
    ```typescript
    interface UseGameLoopOptions {
      update: (deltaTime: number) => void;
      render: () => void;
      isRunning: boolean;
    }
    ```
  - **Шаг 3:** Реализовать хук с использованием requestAnimationFrame:
    ```typescript
    import { useEffect, useRef } from 'react';

    export const useGameLoop = ({ update, render, isRunning }: UseGameLoopOptions) => {
      const frameRef = useRef<number>();
      const lastTimeRef = useRef<number>(0);
      
      useEffect(() => {
        if (!isRunning) return;
        
        const gameLoop = (currentTime: number) => {
          const deltaTime = currentTime - lastTimeRef.current;
          lastTimeRef.current = currentTime;
          
          // Обновление состояния игры
          update(deltaTime);
          
          // Отрисовка
          render();
          
          // Продолжить цикл
          frameRef.current = requestAnimationFrame(gameLoop);
        };
        
        frameRef.current = requestAnimationFrame(gameLoop);
        
        return () => {
          if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
          }
        };
      }, [update, render, isRunning]);
    };
    ```
  - **Шаг 4:** Добавить ограничение FPS (опционально):
    ```typescript
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;
    if (deltaTime >= frameInterval) {
      update(frameInterval);
      render();
    }
    ```
  - **Шаг 5:** Протестировать хук в компоненте GameCanvas

### 2.3 Создание системы управления состоянием игры
- [x] Создать контекст `src/contexts/GameContext.tsx`
  - **Шаг 1:** Создать файл `src/contexts/GameContext.tsx`
  - **Шаг 2:** Импортировать необходимые зависимости:
    ```typescript
    import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
    import { GameState } from '../types/game.types';
    ```
  - **Шаг 3:** Определить интерфейс контекста:
    ```typescript
    interface GameContextType {
      gameState: GameState;
      score: number;
      highScore: number;
      startGame: () => void;
      pauseGame: () => void;
      resumeGame: () => void;
      gameOver: () => void;
      resetGame: () => void;
      incrementScore: () => void;
    }
    ```
  - **Шаг 4:** Создать контекст и провайдер:
    ```typescript
    const GameContext = createContext<GameContextType | undefined>(undefined);

    export const GameProvider = ({ children }: { children: ReactNode }) => {
      const [gameState, setGameState] = useState<GameState>(GameState.MENU);
      const [score, setScore] = useState(0);
      const [highScore, setHighScore] = useState(() => {
        const saved = localStorage.getItem('duck-game-highscore');
        return saved ? parseInt(saved, 10) : 0;
      });
      
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
          localStorage.setItem('duck-game-highscore', newHighScore.toString());
        }
      };
      
      const resetGame = () => {
        setGameState(GameState.MENU);
        setScore(0);
      };
      
      const incrementScore = () => setScore(prev => prev + 1);
      
      return (
        <GameContext.Provider value={{
          gameState, score, highScore,
          startGame, pauseGame, resumeGame, gameOver, resetGame, incrementScore
        }}>
          {children}
        </GameContext.Provider>
      );
    };
    ```
  - **Шаг 5:** Создать хук для использования контекста:
    ```typescript
    export const useGame = () => {
      const context = useContext(GameContext);
      if (!context) {
        throw new Error('useGame must be used within GameProvider');
      }
      return context;
    };
    ```
  - **Шаг 6:** Обернуть приложение в GameProvider в `main.tsx` или `App.tsx`

### 2.4 Создание констант игры
- [x] Создать файл `src/game/utils/constants.ts`
  - **Шаг 1:** Создать файл `src/game/utils/constants.ts`
  - **Шаг 2:** Определить все константы игры:
    ```typescript
    // Размеры canvas
    export const CANVAS_WIDTH = 800;
    export const CANVAS_HEIGHT = 600;

    // Физические константы
    export const GRAVITY = 0.5; // Ускорение свободного падения
    export const JUMP_FORCE = -10; // Сила прыжка (отрицательная = вверх)
    export const MAX_FALL_SPEED = 15; // Максимальная скорость падения

    // Скорости движения
    export const OBSTACLE_SPEED = 3; // Скорость движения препятствий
    export const GROUND_SPEED = OBSTACLE_SPEED; // Скорость движения земли

    // Размеры объектов
    export const DUCK_WIDTH = 40;
    export const DUCK_HEIGHT = 30;
    export const PIPE_WIDTH = 60;
    export const PIPE_MIN_HEIGHT = 50;
    export const PIPE_MAX_HEIGHT = 300;

    // Расстояния между препятствиями
    export const PIPE_GAP = 150; // Расстояние между верхней и нижней частью препятствия
    export const PIPE_SPACING = 250; // Расстояние между препятствиями по горизонтали

    // Начальная позиция утки
    export const DUCK_START_X = 100;
    export const DUCK_START_Y = CANVAS_HEIGHT / 2;

    // Интервал генерации препятствий (в пикселях)
    export const OBSTACLE_SPAWN_INTERVAL = PIPE_SPACING;
    ```
  - **Шаг 3:** Экспортировать все константы для использования в других модулях
  - **Шаг 4:** Создать объект конфигурации (опционально):
    ```typescript
    export const GAME_CONFIG = {
      canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
      physics: { gravity: GRAVITY, jumpForce: JUMP_FORCE },
      duck: { width: DUCK_WIDTH, height: DUCK_HEIGHT },
      obstacles: { width: PIPE_WIDTH, gap: PIPE_GAP, spacing: PIPE_SPACING },
    } as const;
    ```

---

## Этап 3: Реализация главного персонажа - Утка

### 3.1 Создание класса Утки
- [x] Создать файл `src/game/entities/Duck.ts`
  - **Шаг 1:** Создать файл `src/game/entities/Duck.ts`
  - **Шаг 2:** Импортировать необходимые типы и константы:
    ```typescript
    import { Position, Velocity, Bounds } from '../../types/game.types';
    import { GRAVITY, JUMP_FORCE, MAX_FALL_SPEED, DUCK_WIDTH, DUCK_HEIGHT, DUCK_START_X, DUCK_START_Y } from '../utils/constants';
    ```
  - **Шаг 3:** Создать класс Duck:
    ```typescript
    export class Duck {
      position: Position;
      velocity: Velocity;
      width: number;
      height: number;
      
      constructor() {
        this.position = { x: DUCK_START_X, y: DUCK_START_Y };
        this.velocity = { vx: 0, vy: 0 };
        this.width = DUCK_WIDTH;
        this.height = DUCK_HEIGHT;
      }
      
      update(deltaTime: number): void {
        // Применение гравитации
        this.velocity.vy += GRAVITY * (deltaTime / 16); // Нормализация к 60 FPS
        
        // Ограничение максимальной скорости падения
        if (this.velocity.vy > MAX_FALL_SPEED) {
          this.velocity.vy = MAX_FALL_SPEED;
        }
        
        // Обновление позиции
        this.position.y += this.velocity.vy * (deltaTime / 16);
      }
      
      jump(): void {
        this.velocity.vy = JUMP_FORCE;
      }
      
      draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#FFA500'; // Оранжевый цвет для утки
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        
        // Простой глаз
        ctx.fillStyle = '#000';
        ctx.fillRect(this.position.x + 25, this.position.y + 8, 5, 5);
      }
      
      getBounds(): Bounds {
        return {
          x: this.position.x,
          y: this.position.y,
          width: this.width,
          height: this.height,
        };
      }
      
      reset(): void {
        this.position = { x: DUCK_START_X, y: DUCK_START_Y };
        this.velocity = { vx: 0, vy: 0 };
      }
    }
    ```
  - **Шаг 4:** Протестировать класс, создав экземпляр и вызвав методы

### 3.2 Визуализация Утки
- [x] Создать простую графику утки (можно начать с прямоугольника/эллипса)
  - **Шаг 1:** В методе `draw()` класса Duck нарисовать базовую форму:
    ```typescript
    draw(ctx: CanvasRenderingContext2D): void {
      // Тело утки (эллипс)
      ctx.fillStyle = '#FFA500';
      ctx.beginPath();
      ctx.ellipse(
        this.position.x + this.width / 2,
        this.position.y + this.height / 2,
        this.width / 2,
        this.height / 2,
        0, 0, Math.PI * 2
      );
      ctx.fill();
      
      // Клюв
      ctx.fillStyle = '#FF8C00';
      ctx.fillRect(this.position.x + this.width - 10, this.position.y + 10, 8, 6);
    }
    ```
- [x] Реализовать анимацию крыльев:
  - **Шаг 1:** Добавить поле в класс Duck: `private wingState: 'up' | 'down' = 'up';`
  - **Шаг 2:** Добавить поле для таймера анимации: `private wingAnimationTimer: number = 0;`
  - **Шаг 3:** Обновить метод jump() для переключения состояния крыльев:
    ```typescript
    jump(): void {
      this.velocity.vy = JUMP_FORCE;
      this.wingState = this.wingState === 'up' ? 'down' : 'up';
    }
    ```
  - **Шаг 4:** Обновить метод update() для автоматической анимации крыльев:
    ```typescript
    update(deltaTime: number): void {
      // ... существующий код ...
      
      // Анимация крыльев
      this.wingAnimationTimer += deltaTime;
      if (this.wingAnimationTimer > 100) { // Каждые 100ms
        this.wingState = this.wingState === 'up' ? 'down' : 'up';
        this.wingAnimationTimer = 0;
      }
    }
    ```
  - **Шаг 5:** Обновить метод draw() для отрисовки крыльев:
    ```typescript
    // Крылья
    const wingOffset = this.wingState === 'up' ? -5 : 5;
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(
      this.position.x + 5,
      this.position.y + 10 + wingOffset,
      15,
      8
    );
    ```
- [ ] Добавить спрайты утки (опционально):
  - **Шаг 1:** Поместить изображения утки в `src/assets/images/duck/`
  - **Шаг 2:** Создать класс SpriteManager для загрузки и управления спрайтами
  - **Шаг 3:** Загрузить изображения в Duck через Image API
  - **Шаг 4:** Использовать ctx.drawImage() вместо fillRect в методе draw()

### 3.3 Физика движения Утки
- [x] Реализовать гравитацию:
  - **Шаг 1:** В методе `update()` класса Duck добавить применение гравитации:
    ```typescript
    this.velocity.vy += GRAVITY * (deltaTime / 16);
    ```
  - **Шаг 2:** Добавить ограничение максимальной скорости падения:
    ```typescript
    if (this.velocity.vy > MAX_FALL_SPEED) {
      this.velocity.vy = MAX_FALL_SPEED;
    }
    ```
  - **Шаг 3:** Протестировать, что утка падает с ускорением
- [x] Реализовать прыжок:
  - **Шаг 1:** В методе `jump()` установить вертикальную скорость:
    ```typescript
    jump(): void {
      this.velocity.vy = JUMP_FORCE; // Отрицательное значение = движение вверх
    }
    ```
  - **Шаг 2:** Убедиться, что после прыжка гравитация постепенно замедляет движение
  - **Шаг 3:** Настроить значение JUMP_FORCE для комфортного управления
- [x] Добавить границы экрана:
  - **Шаг 1:** Импортировать CANVAS_HEIGHT в класс Duck
  - **Шаг 2:** Добавить проверку границ в метод update():
    ```typescript
    update(deltaTime: number, canvasHeight: number): boolean {
      // ... существующий код обновления ...
      
      // Проверка верхней границы
      if (this.position.y < 0) {
        this.position.y = 0;
        return true; // Возвращает true если достигнута граница
      }
      
      // Проверка нижней границы
      if (this.position.y + this.height > canvasHeight) {
        this.position.y = canvasHeight - this.height;
        return true; // Игра окончена
      }
      
      return false;
    }
    ```
  - **Шаг 3:** В игровом цикле обработать возвращаемое значение и вызвать gameOver()

### 3.4 Управление Уткой
- [x] Добавить обработку клавиатуры:
  - **Шаг 1:** Создать хук `src/hooks/useKeyboard.ts`:
    ```typescript
    import { useEffect } from 'react';

    export const useKeyboard = (onKeyPress: (key: string) => void) => {
      useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.code === 'Space' || event.key === 'ArrowUp') {
            event.preventDefault();
            onKeyPress(event.code);
          }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
      }, [onKeyPress]);
    };
    ```
  - **Шаг 2:** Использовать хук в компоненте GameCanvas:
    ```typescript
    const handleJump = () => {
      if (gameState === GameState.PLAYING) {
        duck.jump();
      }
    };
    
    useKeyboard(handleJump);
    ```
  - **Шаг 3:** Протестировать управление клавиатурой
- [x] Добавить обработку мыши/тача:
  - **Шаг 1:** Добавить обработчик клика на canvas:
    ```typescript
    const handleCanvasClick = () => {
      if (gameState === GameState.PLAYING) {
        duck.jump();
      } else if (gameState === GameState.MENU) {
        startGame();
      }
    };
    
    return <canvas ref={canvasRef} onClick={handleCanvasClick} />;
    ```
  - **Шаг 2:** Добавить обработку touch событий:
    ```typescript
    const handleTouchStart = (e: React.TouchEvent) => {
      e.preventDefault();
      if (gameState === GameState.PLAYING) {
        duck.jump();
      }
    };
    
    return (
      <canvas 
        ref={canvasRef} 
        onClick={handleCanvasClick}
        onTouchStart={handleTouchStart}
      />
    );
    ```
  - **Шаг 3:** Протестировать на мобильном устройстве или в эмуляторе

---

## Этап 4: Реализация препятствий (трубы/преграды)

### 4.1 Создание класса Препятствия
- [x] Создать файл `src/game/entities/Obstacle.ts`
  - **Шаг 1:** Создать файл `src/game/entities/Obstacle.ts`
  - **Шаг 2:** Импортировать необходимые типы и константы:
    ```typescript
    import { Bounds } from '../../types/game.types';
    import { PIPE_WIDTH, PIPE_GAP, OBSTACLE_SPEED, CANVAS_HEIGHT } from '../utils/constants';
    ```
  - **Шаг 3:** Создать класс Obstacle:
    ```typescript
    export class Obstacle {
      x: number;
      topHeight: number;
      bottomHeight: number;
      width: number;
      gap: number;
      passed: boolean; // Для отслеживания прохождения уткой
      
      constructor(x: number, canvasHeight: number) {
        this.x = x;
        this.width = PIPE_WIDTH;
        this.gap = PIPE_GAP;
        
        // Случайная высота верхней части (минимум 50px, максимум 300px)
        const minHeight = 50;
        const maxHeight = canvasHeight - this.gap - minHeight;
        this.topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        // Высота нижней части
        this.bottomHeight = canvasHeight - this.topHeight - this.gap;
        this.passed = false;
      }
      
      update(deltaTime: number): void {
        this.x -= OBSTACLE_SPEED * (deltaTime / 16);
      }
      
      draw(ctx: CanvasRenderingContext2D): void {
        // Верхняя часть препятствия
        ctx.fillStyle = '#228B22'; // Зеленый цвет
        ctx.fillRect(this.x, 0, this.width, this.topHeight);
        
        // Нижняя часть препятствия
        ctx.fillRect(
          this.x,
          CANVAS_HEIGHT - this.bottomHeight,
          this.width,
          this.bottomHeight
        );
      }
      
      getTopBounds(): Bounds {
        return {
          x: this.x,
          y: 0,
          width: this.width,
          height: this.topHeight,
        };
      }
      
      getBottomBounds(): Bounds {
        return {
          x: this.x,
          y: CANVAS_HEIGHT - this.bottomHeight,
          width: this.width,
          height: this.bottomHeight,
        };
      }
      
      isOffScreen(): boolean {
        return this.x + this.width < 0;
      }
    }
    ```
  - **Шаг 4:** Протестировать создание и отрисовку препятствия

### 4.2 Система генерации препятствий
- [x] Создать файл `src/game/systems/ObstacleManager.ts`
  - **Шаг 1:** Создать файл `src/game/systems/ObstacleManager.ts`
  - **Шаг 2:** Импортировать класс Obstacle и константы:
    ```typescript
    import { Obstacle } from '../entities/Obstacle';
    import { CANVAS_WIDTH, CANVAS_HEIGHT, OBSTACLE_SPAWN_INTERVAL } from '../utils/constants';
    ```
  - **Шаг 3:** Создать класс ObstacleManager:
    ```typescript
    export class ObstacleManager {
      obstacles: Obstacle[] = [];
      private lastSpawnX: number = CANVAS_WIDTH;
      
      spawnObstacle(): void {
        const obstacle = new Obstacle(this.lastSpawnX, CANVAS_HEIGHT);
        this.obstacles.push(obstacle);
        this.lastSpawnX += OBSTACLE_SPAWN_INTERVAL;
      }
      
      update(deltaTime: number): void {
        // Обновление всех препятствий
        this.obstacles.forEach(obstacle => obstacle.update(deltaTime));
        
        // Удаление препятствий за экраном
        this.obstacles = this.obstacles.filter(obstacle => !obstacle.isOffScreen());
        
        // Автоматическая генерация новых препятствий
        const lastObstacle = this.obstacles[this.obstacles.length - 1];
        if (!lastObstacle || lastObstacle.x < CANVAS_WIDTH - OBSTACLE_SPAWN_INTERVAL) {
          this.spawnObstacle();
        }
      }
      
      draw(ctx: CanvasRenderingContext2D): void {
        this.obstacles.forEach(obstacle => obstacle.draw(ctx));
      }
      
      reset(): void {
        this.obstacles = [];
        this.lastSpawnX = CANVAS_WIDTH;
      }
      
      getObstacles(): Obstacle[] {
        return this.obstacles;
      }
    }
    ```
  - **Шаг 4:** Интегрировать ObstacleManager в игровой цикл
  - **Шаг 5:** Протестировать генерацию и движение препятствий

### 4.3 Визуализация препятствий
- [x] Реализовать отрисовку препятствий:
  - **Шаг 1:** Улучшить метод `draw()` в классе Obstacle:
    ```typescript
    draw(ctx: CanvasRenderingContext2D): void {
      // Градиент для верхней части
      const topGradient = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0);
      topGradient.addColorStop(0, '#32CD32');
      topGradient.addColorStop(1, '#228B22');
      ctx.fillStyle = topGradient;
      ctx.fillRect(this.x, 0, this.width, this.topHeight);
      
      // Градиент для нижней части
      const bottomGradient = ctx.createLinearGradient(this.x, CANVAS_HEIGHT - this.bottomHeight, this.x + this.width, CANVAS_HEIGHT);
      bottomGradient.addColorStop(0, '#228B22');
      bottomGradient.addColorStop(1, '#32CD32');
      ctx.fillStyle = bottomGradient;
      ctx.fillRect(this.x, CANVAS_HEIGHT - this.bottomHeight, this.width, this.bottomHeight);
    }
    ```
  - **Шаг 2:** Добавить обводку для контраста:
    ```typescript
    ctx.strokeStyle = '#006400';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, 0, this.width, this.topHeight);
    ctx.strokeRect(this.x, CANVAS_HEIGHT - this.bottomHeight, this.width, this.bottomHeight);
    ```
- [x] Добавить визуальные эффекты:
  - **Шаг 1:** Добавить тени для глубины:
    ```typescript
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ```
  - **Шаг 2:** Добавить капички (верхние части препятствий):
    ```typescript
    // Капичка верхней части
    ctx.fillStyle = '#006400';
    ctx.fillRect(this.x - 5, this.topHeight - 20, this.width + 10, 20);
    
    // Капичка нижней части
    ctx.fillRect(this.x - 5, CANVAS_HEIGHT - this.bottomHeight, this.width + 10, 20);
    ```
  - **Шаг 3:** Опционально: загрузить спрайты препятствий и использовать drawImage()

---

## Этап 5: Система коллизий

### 5.1 Реализация детекции коллизий
- [x] Создать файл `src/game/systems/CollisionSystem.ts` ✅
  - **Шаг 1:** Создать файл `src/game/systems/CollisionSystem.ts`
  - **Шаг 2:** Импортировать необходимые типы:
    ```typescript
    import { Bounds } from '../../types/game.types';
    import { Duck } from '../entities/Duck';
    import { Obstacle } from '../entities/Obstacle';
    ```
  - **Шаг 3:** Реализовать функцию проверки пересечения прямоугольников:
    ```typescript
    export function checkCollision(rect1: Bounds, rect2: Bounds): boolean {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    }
    ```
  - **Шаг 4:** Реализовать проверку коллизии утки с препятствием:
    ```typescript
    export function checkDuckObstacleCollision(duck: Duck, obstacle: Obstacle): boolean {
      const duckBounds = duck.getBounds();
      const topBounds = obstacle.getTopBounds();
      const bottomBounds = obstacle.getBottomBounds();
      
      return (
        checkCollision(duckBounds, topBounds) ||
        checkCollision(duckBounds, bottomBounds)
      );
    }
    ```
  - **Шаг 5:** Реализовать проверку выхода за границы:
    ```typescript
    export function checkDuckBoundsCollision(duck: Duck, canvasHeight: number): boolean {
      const bounds = duck.getBounds();
      return bounds.y < 0 || bounds.y + bounds.height > canvasHeight;
    }
    ```
  - **Шаг 6:** Протестировать функции коллизий с различными сценариями

### 5.2 Интеграция коллизий в игровой цикл
- [x] Добавить проверку коллизий в каждый кадр игры ✅
  - **Шаг 1:** Импортировать функции коллизий в компонент GameCanvas:
    ```typescript
    import { checkDuckObstacleCollision, checkDuckBoundsCollision } from '../../game/systems/CollisionSystem';
    ```
  - **Шаг 2:** Добавить проверку в функцию update игрового цикла:
    ```typescript
    const update = (deltaTime: number) => {
      if (gameState !== GameState.PLAYING) return;
      
      // Обновление утки
      const hitBoundary = duck.update(deltaTime, CANVAS_HEIGHT);
      if (hitBoundary) {
        gameOver();
        return;
      }
      
      // Обновление препятствий
      obstacleManager.update(deltaTime);
      
      // Проверка коллизий с препятствиями
      const obstacles = obstacleManager.getObstacles();
      for (const obstacle of obstacles) {
        if (checkDuckObstacleCollision(duck, obstacle)) {
          gameOver();
          return;
        }
      }
      
      // Проверка границ (дополнительная проверка)
      if (checkDuckBoundsCollision(duck, CANVAS_HEIGHT)) {
        gameOver();
        return;
      }
    };
    ```
- [x] При обнаружении коллизии: ✅
  - **Шаг 1:** Убедиться, что функция `gameOver()` из контекста вызывается ✅
  - **Шаг 2:** Проверить, что состояние игры меняется на GAME_OVER ✅
  - **Шаг 3:** Убедиться, что игровой цикл останавливается при gameState !== PLAYING ✅
  - **Шаг 4:** Добавить визуальную индикацию столкновения (опционально: мигание экрана) - отложено

### 5.3 Оптимизация коллизий
- [x] Использовать пространственное разделение (spatial partitioning) при необходимости ✅
  - **Шаг 1:** Для небольшого количества препятствий (до 10) текущая реализация достаточна ✅
  - **Шаг 2:** Если препятствий много, реализовать простую оптимизацию: ✅
    ```typescript
    // Проверять только препятствия в зоне видимости утки
    const visibleObstacles = obstacles.filter(obs => 
      obs.x + obs.width > duck.position.x - 50 && 
      obs.x < duck.position.x + duck.width + 50
    );
    ```
- [x] Проверять коллизии только с видимыми препятствиями ✅
  - **Шаг 1:** Модифицировать проверку коллизий:
    ```typescript
    const obstacles = obstacleManager.getObstacles();
    const relevantObstacles = obstacles.filter(obs => 
      obs.x < CANVAS_WIDTH + 50 && obs.x + obs.width > -50
    );
    
    for (const obstacle of relevantObstacles) {
      if (checkDuckObstacleCollision(duck, obstacle)) {
        gameOver();
        return;
      }
    }
    ```
  - **Шаг 2:** Прекратить проверку после первого столкновения (использовать break)
- [x] Оптимизировать вычисления границ объектов ✅
  - **Шаг 1:** Кэшировать границы объектов, если они не изменились: ✅
    ```typescript
    // В классе Duck добавлен кэш
    private cachedBounds: Bounds | null = null;
    private lastPositionX: number;
    private lastPositionY: number;
    
    getBounds(): Bounds {
      if (this.cachedBounds !== null) {
        return this.cachedBounds;
      }
      this.cachedBounds = {
        x: this.position.x,
        y: this.position.y,
        width: this.width,
        height: this.height,
      };
      return this.cachedBounds;
    }
    ```
  - **Шаг 2:** Обновлять кэш только при изменении позиции ✅
    - Реализовано в методе update() класса Duck
    - Реализовано в методе update() класса Obstacle для getTopBounds() и getBottomBounds()
    - Кэш инвалидируется при изменении позиции и работает для множественных вызовов getBounds в одном кадре

---

## Этап 6: Система подсчета очков

### 6.1 Логика подсчета очков
- [x] Создать файл `src/game/systems/ScoreSystem.ts` ✅
  - **Шаг 1:** Создать файл `src/game/systems/ScoreSystem.ts`
  - **Шаг 2:** Реализовать функцию проверки прохождения препятствия:
    ```typescript
    import { Duck } from '../entities/Duck';
    import { Obstacle } from '../entities/Obstacle';

    export function checkObstaclePassed(duck: Duck, obstacle: Obstacle): boolean {
      // Препятствие считается пройденным, если утка прошла его центр
      if (!obstacle.passed && duck.position.x > obstacle.x + obstacle.width) {
        obstacle.passed = true;
        return true;
      }
      return false;
    }
    ```
  - **Шаг 3:** Интегрировать в игровой цикл:
    ```typescript
    const obstacles = obstacleManager.getObstacles();
    obstacles.forEach(obstacle => {
      if (checkObstaclePassed(duck, obstacle)) {
        incrementScore(); // Из контекста игры
      }
    });
    ```
  - **Шаг 4:** Опционально: добавить увеличение сложности:
    ```typescript
    export function getDifficultyMultiplier(score: number): number {
      // Увеличиваем скорость каждые 10 очков
      return 1 + Math.floor(score / 10) * 0.1;
    }
    ```

### 6.2 Отображение счета
- [x] Добавить отрисовку счета на canvas: ✅
  - **Шаг 1:** Создать функцию отрисовки счета в компоненте GameCanvas:
    ```typescript
    const drawScore = (ctx: CanvasRenderingContext2D) => {
      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      
      const scoreText = score.toString();
      const textX = CANVAS_WIDTH / 2;
      const textY = 60;
      
      // Обводка для читаемости
      ctx.strokeText(scoreText, textX, textY);
      ctx.fillText(scoreText, textX, textY);
    };
    ```
  - **Шаг 2:** Вызывать drawScore в функции render:
    ```typescript
    const render = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      
      // Очистка canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Отрисовка фона, препятствий, утки
      // ...
      
      // Отрисовка счета
      drawScore(ctx);
    };
    ```
  - **Шаг 3:** Добавить выравнивание текста по центру:
    ```typescript
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ```
- [ ] Анимация при изменении счета (опционально):
  - **Шаг 1:** Добавить состояние для анимации:
    ```typescript
    const [scoreScale, setScoreScale] = useState(1);
    ```
  - **Шаг 2:** При изменении счета запускать анимацию:
    ```typescript
    useEffect(() => {
      setScoreScale(1.3);
      const timer = setTimeout(() => setScoreScale(1), 200);
      return () => clearTimeout(timer);
    }, [score]);
    ```
  - **Шаг 3:** Применить масштаб при отрисовке:
    ```typescript
    ctx.save();
    ctx.scale(scoreScale, scoreScale);
    ctx.fillText(scoreText, textX / scoreScale, textY / scoreScale);
    ctx.restore();
    ```

### 6.3 Сохранение лучшего результата
- [x] Реализовать сохранение лучшего результата в localStorage ✅
  - **Шаг 1:** Убедиться, что в GameContext уже реализовано сохранение (см. этап 2.3)
  - **Шаг 2:** Проверить, что при gameOver() происходит сравнение и сохранение:
    ```typescript
    const gameOver = () => {
      setGameState(GameState.GAME_OVER);
      if (score > highScore) {
        const newHighScore = score;
        setHighScore(newHighScore);
        localStorage.setItem('duck-game-highscore', newHighScore.toString());
      }
    };
    ```
  - **Шаг 3:** Добавить отображение лучшего результата на canvas:
    ```typescript
    const drawHighScore = (ctx: CanvasRenderingContext2D) => {
      ctx.font = '24px Arial';
      ctx.fillStyle = '#FFFF00';
      ctx.textAlign = 'right';
      ctx.fillText(`Best: ${highScore}`, CANVAS_WIDTH - 20, 30);
    };
    ```
  - **Шаг 4:** Отображать лучший результат в главном меню (см. этап 8.1)

---

## Этап 7: Фон и окружение

### 7.1 Создание фона
- [x] Реализовать отрисовку фона:
  - **Шаг 1:** Создать функцию отрисовки неба с градиентом:
    ```typescript
    const drawSky = (ctx: CanvasRenderingContext2D) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#87CEEB'); // Небесно-голубой
      gradient.addColorStop(1, '#E0F6FF'); // Светло-голубой
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    };
    ```
  - **Шаг 2:** Добавить облака (простые эллипсы):
    ```typescript
    const drawClouds = (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      // Облако 1
      ctx.beginPath();
      ctx.arc(200, 100, 30, 0, Math.PI * 2);
      ctx.arc(230, 100, 35, 0, Math.PI * 2);
      ctx.arc(260, 100, 30, 0, Math.PI * 2);
      ctx.fill();
      // Добавить еще несколько облаков
    };
    ```
  - **Шаг 3:** Добавить движение облаков (опционально):
    ```typescript
    let cloudOffset = 0;
    const updateClouds = (deltaTime: number) => {
      cloudOffset += 0.1 * (deltaTime / 16);
      if (cloudOffset > CANVAS_WIDTH) cloudOffset = 0;
    };
    ```
  - **Шаг 4:** Вызывать drawSky и drawClouds в начале функции render

### 7.2 Создание земли
- [x] Реализовать отрисовку земли:
  - **Шаг 1:** Создать функцию отрисовки земли:
    ```typescript
    let groundOffset = 0;
    
    const drawGround = (ctx: CanvasRenderingContext2D) => {
      const groundHeight = 50;
      const groundY = CANVAS_HEIGHT - groundHeight;
      
      // Трава
      ctx.fillStyle = '#90EE90';
      ctx.fillRect(0, groundY, CANVAS_WIDTH, groundHeight);
      
      // Земля
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, groundY + 30, CANVAS_WIDTH, 20);
    };
    ```
  - **Шаг 2:** Добавить анимацию прокрутки:
    ```typescript
    const updateGround = (deltaTime: number) => {
      groundOffset += GROUND_SPEED * (deltaTime / 16);
      if (groundOffset > CANVAS_WIDTH) groundOffset = 0;
    };
    ```
  - **Шаг 3:** Добавить текстуру травы (опционально):
    ```typescript
    const drawGrassTexture = (ctx: CanvasRenderingContext2D) => {
      ctx.strokeStyle = '#228B22';
      ctx.lineWidth = 2;
      for (let i = 0; i < CANVAS_WIDTH; i += 10) {
        ctx.beginPath();
        ctx.moveTo(i, CANVAS_HEIGHT - 50);
        ctx.lineTo(i + 5, CANVAS_HEIGHT - 60);
        ctx.stroke();
      }
    };
    ```
  - **Шаг 4:** Вызывать drawGround в функции render после фона

### 7.3 Декоративные элементы
- [x] Добавить декоративные элементы:
  - Деревья на заднем плане ✅
  - Птицы (не интерактивные) ✅
  - Другие элементы для атмосферы ✅

---

## Этап 8: UI компоненты и меню

### 8.1 Главное меню
- [x] Создать компонент `src/components/UI/MainMenu.tsx`
  - **Шаг 1:** Создать файл `src/components/UI/MainMenu.tsx`
  - **Шаг 2:** Импортировать необходимые зависимости:
    ```typescript
    import { useGame } from '../../contexts/GameContext';
    import styles from './MainMenu.module.css';
    ```
  - **Шаг 3:** Создать компонент:
    ```typescript
    export const MainMenu: React.FC = () => {
      const { startGame, highScore } = useGame();
      
      return (
        <div className={styles.menu}>
          <h1 className={styles.title}>Утка</h1>
          <div className={styles.highScore}>Лучший результат: {highScore}</div>
          <button className={styles.startButton} onClick={startGame}>
            Начать игру
          </button>
          <div className={styles.instructions}>
            <p>Пробел или клик - прыжок</p>
            <p>Избегайте препятствий!</p>
          </div>
        </div>
      );
    };
    ```
  - **Шаг 4:** Создать CSS модуль `MainMenu.module.css` со стилями
  - **Шаг 5:** Отображать MainMenu когда gameState === MENU

### 8.2 Экран паузы
- [x] Создать компонент `src/components/UI/PauseMenu.tsx`
  - **Шаг 1:** Создать файл `src/components/UI/PauseMenu.tsx`
  - **Шаг 2:** Реализовать компонент:
    ```typescript
    import { useGame } from '../../contexts/GameContext';
    import styles from './PauseMenu.module.css';

    export const PauseMenu: React.FC = () => {
      const { resumeGame, resetGame } = useGame();
      
      return (
        <>
          <div className={styles.overlay} />
          <div className={styles.menu}>
            <h2>Пауза</h2>
            <button onClick={resumeGame}>Продолжить</button>
            <button onClick={resetGame}>В главное меню</button>
          </div>
        </>
      );
    };
    ```
  - **Шаг 3:** Добавить стили с затемнением:
    ```css
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 1;
    }
    
    .menu {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2;
      /* стили меню */
    }
    ```
  - **Шаг 4:** Добавить обработку клавиши Escape для паузы

### 8.3 Экран окончания игры
- [x] Создать компонент `src/components/UI/GameOverMenu.tsx` ✅
  - **Шаг 1:** Создать файл `src/components/UI/GameOverMenu.tsx` ✅
  - **Шаг 2:** Реализовать компонент: ✅
    ```typescript
    import { useGame } from '../../contexts/GameContext';
    import styles from './GameOverMenu.module.css';

    export const GameOverMenu: React.FC = () => {
      const { score, highScore, startGame, resetGame } = useGame();
      const isNewRecord = score === highScore && score > 0;
      
      return (
        <>
          <div className={styles.overlay} />
          <div className={styles.menu}>
            <h2>Игра окончена!</h2>
            <div className={styles.score}>Ваш счет: {score}</div>
            {isNewRecord && <div className={styles.newRecord}>Новый рекорд!</div>}
            <div className={styles.highScore}>Лучший результат: {highScore}</div>
            <button onClick={startGame}>Играть снова</button>
            <button onClick={resetGame}>В главное меню</button>
          </div>
        </>
      );
    };
    ```
  - **Шаг 3:** Добавить анимацию появления: ✅
    ```css
    .menu {
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from {
        transform: translate(-50%, -60%);
        opacity: 0;
      }
      to {
        transform: translate(-50%, -50%);
        opacity: 1;
      }
    }
    ```
  - **Шаг 4:** Отображать GameOverMenu когда gameState === GAME_OVER ✅

### 8.4 Стилизация UI
- [x] Создать стили для всех UI компонентов:
  - Современный дизайн ✅
  - Анимации при наведении ✅
  - Адаптивность для мобильных устройств ✅
  - Использование CSS Modules ✅

---

## Этап 9: Звуковые эффекты и музыка

### 9.1 Подготовка звуковых файлов
- [x] Найти или создать звуковые эффекты:
  - Звук прыжка утки ✅
  - Звук столкновения ✅
  - Звук набора очков ✅
  - Фоновая музыка (опционально) ✅
  - **Выполнено:** Создана директория `src/assets/sounds/` с README инструкциями и скриптом для генерации звуков (`generate-sounds.js`)

### 9.2 Интеграция звуков
- [ ] Создать файл `src/game/utils/SoundManager.ts`
  - **Шаг 1:** Создать файл `src/game/utils/SoundManager.ts`
  - **Шаг 2:** Реализовать класс SoundManager:
    ```typescript
    export class SoundManager {
      private sounds: Map<string, HTMLAudioElement> = new Map();
      private volume: number = 0.5;
      private enabled: boolean = true;
      
      loadSound(name: string, path: string): void {
        const audio = new Audio(path);
        audio.volume = this.volume;
        this.sounds.set(name, audio);
      }
      
      play(name: string): void {
        if (!this.enabled) return;
        const sound = this.sounds.get(name);
        if (sound) {
          sound.currentTime = 0;
          sound.play().catch(() => {
            // Игнорируем ошибки автовоспроизведения
          });
        }
      }
      
      setVolume(volume: number): void {
        this.volume = Math.max(0, Math.min(1, volume));
        this.sounds.forEach(sound => {
          sound.volume = this.volume;
        });
      }
      
      setEnabled(enabled: boolean): void {
        this.enabled = enabled;
      }
    }
    
    export const soundManager = new SoundManager();
    ```
  - **Шаг 3:** Загрузить звуки при инициализации игры:
    ```typescript
    soundManager.loadSound('jump', '/sounds/jump.mp3');
    soundManager.loadSound('hit', '/sounds/hit.mp3');
    soundManager.loadSound('score', '/sounds/score.mp3');
    ```

### 9.3 Добавление звуков в игру
- [ ] Воспроизведение звука прыжка при нажатии
  - **Шаг 1:** В функции handleJump добавить:
    ```typescript
    duck.jump();
    soundManager.play('jump');
    ```
- [ ] Воспроизведение звука при столкновении
  - **Шаг 1:** В функции gameOver добавить:
    ```typescript
    soundManager.play('hit');
    gameOver();
    ```
- [ ] Воспроизведение звука при наборе очков
  - **Шаг 1:** При увеличении счета:
    ```typescript
    if (checkObstaclePassed(duck, obstacle)) {
      incrementScore();
      soundManager.play('score');
    }
    ```
- [ ] Добавить настройку включения/выключения звуков в меню
  - **Шаг 1:** Добавить состояние в GameContext:
    ```typescript
    const [soundEnabled, setSoundEnabled] = useState(true);
    ```
  - **Шаг 2:** Добавить переключатель в MainMenu:
    ```typescript
    <label>
      <input 
        type="checkbox" 
        checked={soundEnabled}
        onChange={(e) => {
          setSoundEnabled(e.target.checked);
          soundManager.setEnabled(e.target.checked);
        }}
      />
      Звуки
    </label>
    ```

---

## Этап 10: Оптимизация и полировка

### 10.1 Оптимизация производительности
- [ ] Оптимизировать отрисовку:
  - **Шаг 1:** Проверить, что отрисовываются только видимые объекты:
    ```typescript
    // В ObstacleManager.draw() фильтровать видимые препятствия
    const visibleObstacles = this.obstacles.filter(obs => 
      obs.x + obs.width > 0 && obs.x < CANVAS_WIDTH
    );
    visibleObstacles.forEach(obstacle => obstacle.draw(ctx));
    ```
  - **Шаг 2:** Использовать requestAnimationFrame эффективно:
    ```typescript
    // Убедиться, что игровой цикл останавливается при паузе
    if (gameState !== GameState.PLAYING) return;
    ```
  - **Шаг 3:** Минимизировать перерисовки - отрисовывать только при изменениях:
    ```typescript
    // Использовать useMemo для кэширования вычислений
    const gameObjects = useMemo(() => ({
      duck, obstacles: obstacleManager.getObstacles()
    }), [duck, obstacles]);
    ```
- [ ] Оптимизировать память:
  - **Шаг 1:** Убедиться, что препятствия удаляются при выходе за экран:
    ```typescript
    // В ObstacleManager.update() уже реализовано:
    this.obstacles = this.obstacles.filter(obstacle => !obstacle.isOffScreen());
    ```
  - **Шаг 2:** Очищать обработчики событий в useEffect:
    ```typescript
    useEffect(() => {
      const handler = () => { /* ... */ };
      window.addEventListener('resize', handler);
      return () => window.removeEventListener('resize', handler); // Важно!
    }, []);
    ```
  - **Шаг 3:** Проверить отсутствие утечек в игровом цикле:
    ```typescript
    // Убедиться, что cancelAnimationFrame вызывается при размонтировании
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
    ```

### 10.2 Улучшение игрового процесса
- [ ] Настроить баланс сложности:
  - **Шаг 1:** Протестировать текущие значения констант в `constants.ts`
  - **Шаг 2:** Настроить скорость препятствий для комфортной игры:
    ```typescript
    // Начать с OBSTACLE_SPEED = 3, увеличивать постепенно
    export const OBSTACLE_SPEED = 3; // Пикселей за кадр при 60 FPS
    ```
  - **Шаг 3:** Настроить расстояние между препятствиями:
    ```typescript
    // PIPE_SPACING должен быть достаточным для реакции игрока
    export const PIPE_SPACING = 250; // Увеличить если слишком сложно
    ```
  - **Шаг 4:** Настроить высоту gap между препятствиями:
    ```typescript
    // PIPE_GAP должен быть проходимым, но не слишком легким
    export const PIPE_GAP = 150; // Уменьшить для увеличения сложности
    ```
- [ ] Добавить прогрессивное увеличение сложности:
  - **Шаг 1:** Создать функцию расчета текущей сложности:
    ```typescript
    export function getCurrentDifficulty(score: number): number {
      // Увеличиваем скорость каждые 10 очков на 5%
      return 1 + (Math.floor(score / 10) * 0.05);
    }
    ```
  - **Шаг 2:** Применить множитель к скорости препятствий:
    ```typescript
    const difficulty = getCurrentDifficulty(score);
    const currentSpeed = OBSTACLE_SPEED * difficulty;
    ```
  - **Шаг 3:** Опционально: уменьшать расстояние между препятствиями:
    ```typescript
    const currentSpacing = Math.max(
      PIPE_SPACING * (1 - score / 200),
      PIPE_SPACING * 0.7 // Минимум 70% от исходного
    );
    ```

### 10.3 Анимации и эффекты
- [ ] Добавить плавные переходы между состояниями
  - **Шаг 1:** Использовать CSS transitions для UI компонентов:
    ```css
    .menu {
      transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
    }
    ```
  - **Шаг 2:** Добавить fade-in эффект при смене состояний:
    ```typescript
    const [fadeIn, setFadeIn] = useState(false);
    useEffect(() => {
      setFadeIn(true);
    }, [gameState]);
    ```
- [ ] Добавить эффекты частиц при столкновении (опционально)
  - **Шаг 1:** Создать класс Particle:
    ```typescript
    class Particle {
      x: number; y: number; vx: number; vy: number; life: number;
      update() { /* движение и уменьшение life */ }
      draw(ctx: CanvasRenderingContext2D) { /* отрисовка */ }
    }
    ```
  - **Шаг 2:** Создать ParticleSystem для управления частицами:
    ```typescript
    class ParticleSystem {
      particles: Particle[] = [];
      emit(x: number, y: number) { /* создание частиц */ }
      update() { /* обновление всех частиц */ }
      draw(ctx: CanvasRenderingContext2D) { /* отрисовка */ }
    }
    ```
  - **Шаг 3:** Вызывать emit при столкновении:
    ```typescript
    if (checkDuckObstacleCollision(duck, obstacle)) {
      particleSystem.emit(duck.position.x, duck.position.y);
      gameOver();
    }
    ```
- [ ] Улучшить анимацию утки (более плавные движения)
  - **Шаг 1:** Добавить интерполяцию позиции для плавности:
    ```typescript
    // Использовать lerp для плавного движения
    function lerp(start: number, end: number, factor: number): number {
      return start + (end - start) * factor;
    }
    ```
  - **Шаг 2:** Добавить вращение утки в зависимости от скорости:
    ```typescript
    const rotation = Math.min(Math.max(duck.velocity.vy * 3, -30), 30);
    ctx.save();
    ctx.translate(duck.position.x + duck.width/2, duck.position.y + duck.height/2);
    ctx.rotate(rotation * Math.PI / 180);
    // Отрисовка утки
    ctx.restore();
    ```

### 10.4 Адаптивность
- [ ] Обеспечить работу на разных размерах экрана:
  - **Шаг 1:** Добавить функцию масштабирования canvas:
    ```typescript
    const scaleCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const container = canvas.parentElement;
      if (!container) return;
      
      const scale = Math.min(
        container.clientWidth / CANVAS_WIDTH,
        container.clientHeight / CANVAS_HEIGHT
      );
      
      canvas.style.width = `${CANVAS_WIDTH * scale}px`;
      canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
    };
    ```
  - **Шаг 2:** Вызывать scaleCanvas при изменении размера окна:
    ```typescript
    useEffect(() => {
      scaleCanvas();
      window.addEventListener('resize', scaleCanvas);
      return () => window.removeEventListener('resize', scaleCanvas);
    }, []);
    ```
  - **Шаг 3:** Адаптировать размеры элементов для мобильных:
    ```typescript
    const isMobile = window.innerWidth < 768;
    const adjustedDuckSize = isMobile ? { width: 30, height: 22 } : { width: 40, height: 30 };
    ```
  - **Шаг 4:** Убедиться, что touch events работают (уже реализовано в этапе 3.4)

---

## Этап 11: Тестирование

### 11.1 Функциональное тестирование
- [ ] Протестировать все игровые механики:
  - **Шаг 1:** Движение утки:
    - Проверить, что утка падает под действием гравитации
    - Проверить, что прыжок работает корректно
    - Проверить границы экрана (верх и низ)
  - **Шаг 2:** Генерация препятствий:
    - Проверить, что препятствия появляются регулярно
    - Проверить, что препятствия удаляются за экраном
    - Проверить случайную высоту препятствий
  - **Шаг 3:** Коллизии:
    - Проверить столкновение с верхней частью препятствия
    - Проверить столкновение с нижней частью препятствия
    - Проверить столкновение с границами экрана
    - Убедиться, что коллизии определяются точно
  - **Шаг 4:** Подсчет очков:
    - Проверить, что счет увеличивается при прохождении препятствия
    - Проверить, что одно препятствие дает только одно очко
    - Проверить отображение счета на экране
  - **Шаг 5:** Сохранение лучшего результата:
    - Проверить сохранение в localStorage
    - Проверить загрузку при старте игры
    - Проверить обновление при новом рекорде

### 11.2 Тестирование на разных устройствах
- [ ] Протестировать на десктопе (разные браузеры)
  - **Шаг 1:** Chrome/Edge - проверить работу игры и производительность
  - **Шаг 2:** Firefox - проверить совместимость Canvas API
  - **Шаг 3:** Safari - проверить работу на macOS
  - **Шаг 4:** Проверить работу клавиатуры во всех браузерах
- [ ] Протестировать на мобильных устройствах
  - **Шаг 1:** iOS Safari - проверить touch события и производительность
  - **Шаг 2:** Android Chrome - проверить работу на разных размерах экрана
  - **Шаг 3:** Проверить ориентацию экрана (портретная/ландшафтная)
  - **Шаг 4:** Убедиться, что игра работает без задержек
- [ ] Проверить производительность на слабых устройствах
  - **Шаг 1:** Использовать Chrome DevTools Performance для профилирования
  - **Шаг 2:** Проверить FPS (должно быть стабильно 60 FPS)
  - **Шаг 3:** Проверить использование памяти (не должно расти)
  - **Шаг 4:** Оптимизировать проблемные участки при необходимости

### 11.3 Исправление багов
- [ ] Исправить найденные ошибки
  - **Шаг 1:** Ведение списка найденных багов (можно в комментариях или отдельном файле)
  - **Шаг 2:** Приоритизация багов (критические, важные, мелкие)
  - **Шаг 3:** Исправление по приоритету
  - **Шаг 4:** Повторное тестирование после исправлений
- [ ] Оптимизировать проблемные участки кода
  - **Шаг 1:** Использовать Chrome DevTools для поиска узких мест
  - **Шаг 2:** Оптимизировать функции, которые выполняются часто
  - **Шаг 3:** Упростить сложные вычисления
  - **Шаг 4:** Проверить улучшение производительности после оптимизации

---

## Этап 12: Финальная полировка и документация

### 12.1 Документация кода
- [ ] Добавить JSDoc комментарии к основным функциям и классам
  - **Шаг 1:** Добавить JSDoc к классу Duck:
    ```typescript
    /**
     * Класс, представляющий игрового персонажа - утку
     * Управляет позицией, скоростью и отрисовкой утки
     */
    export class Duck {
      /**
       * Обновляет позицию утки с учетом гравитации
       * @param deltaTime - Время, прошедшее с последнего кадра (в миллисекундах)
       * @param canvasHeight - Высота canvas для проверки границ
       * @returns true если утка достигла границы экрана
       */
      update(deltaTime: number, canvasHeight: number): boolean {
        // ...
      }
    }
    ```
  - **Шаг 2:** Добавить комментарии к основным функциям и классам
  - **Шаг 3:** Описать параметры и возвращаемые значения
- [ ] Описать архитектуру проекта в README.md
  - **Шаг 1:** Создать раздел "Архитектура" в README.md
  - **Шаг 2:** Описать структуру директорий и назначение каждой
  - **Шаг 3:** Описать основные компоненты и их взаимодействие
  - **Шаг 4:** Добавить диаграмму потока данных (опционально)
- [ ] Добавить инструкции по запуску и сборке
  - **Шаг 1:** Описать установку зависимостей: `npm install`
  - **Шаг 2:** Описать запуск dev-сервера: `npm run dev`
  - **Шаг 3:** Описать сборку для production: `npm run build`
  - **Шаг 4:** Описать предпросмотр production сборки: `npm run preview`

### 12.2 README.md
- [ ] Создать подробный README.md с:
  - **Шаг 1:** Описание проекта:
    ```markdown
    # Утка - Flappy Bird Clone
    
    Веб-игра в стиле Flappy Bird, разработанная на React и TypeScript.
    Цель игры - управлять уткой, избегая препятствий и набирая очки.
    ```
  - **Шаг 2:** Инструкции по установке:
    ```markdown
    ## Установка
    
    1. Клонировать репозиторий
    2. Установить зависимости: `npm install`
    3. Запустить dev-сервер: `npm run dev`
    ```
  - **Шаг 3:** Инструкции по запуску:
    ```markdown
    ## Запуск
    
    - Разработка: `npm run dev`
    - Production сборка: `npm run build`
    - Предпросмотр: `npm run preview`
    ```
  - **Шаг 4:** Описание управления:
    ```markdown
    ## Управление
    
    - **Пробел** или **Стрелка вверх** - прыжок
    - **Клик мыши** или **Тап** - прыжок
    - **Escape** - пауза (во время игры)
    ```
  - **Шаг 5:** Добавить скриншоты игры (сделать и вставить в README)
  - **Шаг 6:** Информация о технологиях:
    ```markdown
    ## Технологии
    
    - React 18+
    - TypeScript 5+
    - Vite
    - Canvas API
    - CSS Modules
    ```

### 12.3 Финальная проверка
- [ ] Проверить все чекбоксы в этом TODO
  - **Шаг 1:** Пройтись по всем этапам и отметить выполненные задачи
  - **Шаг 2:** Убедиться, что все критичные функции реализованы
  - **Шаг 3:** Проверить, что опциональные функции либо реализованы, либо отложены
- [ ] Убедиться, что код чистый и читаемый
  - **Шаг 1:** Запустить линтер: `npm run lint`
  - **Шаг 2:** Исправить все ошибки линтера
  - **Шаг 3:** Отформатировать код: `npm run format`
  - **Шаг 4:** Проверить именование переменных и функций (должны быть понятными)
- [ ] Проверить отсутствие console.log в production коде
  - **Шаг 1:** Найти все console.log: `grep -r "console.log" src/`
  - **Шаг 2:** Удалить или закомментировать отладочные console.log
  - **Шаг 3:** Оставить только необходимые для production (если есть)
  - **Шаг 4:** Использовать условную компиляцию для dev-режима:
    ```typescript
    if (import.meta.env.DEV) {
      console.log('Debug info');
    }
    ```
- [ ] Оптимизировать размер bundle (если необходимо)
  - **Шаг 1:** Проверить размер bundle: `npm run build` и посмотреть размер dist/
  - **Шаг 2:** Использовать анализ bundle: `npm run build -- --analyze` (если доступно)
  - **Шаг 3:** Удалить неиспользуемые импорты
  - **Шаг 4:** Использовать code splitting для больших компонентов (если необходимо)

---

## Дополнительные улучшения (опционально)

### Дополнительные функции:
- [ ] Добавить разные темы оформления (день/ночь)
  - **Шаг 1:** Создать контекст ThemeContext для управления темой
  - **Шаг 2:** Создать цветовые схемы для дня и ночи
  - **Шаг 3:** Добавить переключатель темы в меню
  - **Шаг 4:** Применить тему к фону, препятствиям и другим элементам
- [ ] Добавить систему достижений
  - **Шаг 1:** Создать файл `src/game/systems/AchievementSystem.ts`
  - **Шаг 2:** Определить список достижений (например, "Набрать 10 очков", "Пролететь 100 препятствий")
  - **Шаг 3:** Отслеживать прогресс достижений во время игры
  - **Шаг 4:** Сохранять достижения в localStorage
  - **Шаг 5:** Отображать уведомления о получении достижений
- [ ] Добавить таблицу лидеров (с использованием backend)
  - **Шаг 1:** Создать API endpoint для сохранения результатов
  - **Шаг 2:** Реализовать отправку результата на сервер
  - **Шаг 3:** Создать компонент Leaderboard для отображения топ-10
  - **Шаг 4:** Добавить страницу/меню с таблицей лидеров
- [ ] Добавить разные персонажи на выбор
  - **Шаг 1:** Создать интерфейс Character с разными спрайтами
  - **Шаг 2:** Создать меню выбора персонажа
  - **Шаг 3:** Сохранять выбранного персонажа в localStorage
  - **Шаг 4:** Применить выбранного персонажа в игре
- [ ] Добавить power-ups (временные улучшения)
  - **Шаг 1:** Создать класс PowerUp с различными типами (замедление, щит, двойные очки)
  - **Шаг 2:** Добавить генерацию power-ups между препятствиями
  - **Шаг 3:** Реализовать сбор power-ups уткой
  - **Шаг 4:** Применить эффекты power-ups на определенное время
- [ ] Добавить режим "выживание" с бесконечной сложностью
  - **Шаг 1:** Создать режим EndlessMode с прогрессивной сложностью
  - **Шаг 2:** Увеличивать скорость и уменьшать расстояния со временем
  - **Шаг 3:** Отслеживать время выживания
  - **Шаг 4:** Добавить переключатель режима в главное меню

---

## Примечания по разработке

### Рекомендации:
1. Начинать с простых форм (прямоугольники) для быстрого прототипирования
2. Постепенно улучшать визуальную часть после реализации логики
3. Регулярно тестировать игру в процессе разработки
4. Использовать Git для версионирования с осмысленными коммитами
5. Разбивать задачи на небольшие, выполнимые части

### Важные моменты:
- Игровой цикл должен работать стабильно на 60 FPS
- Коллизии должны быть точными и отзывчивыми
- Управление должно быть мгновенным и предсказуемым
- UI должен быть интуитивно понятным

---

**Дата создания:** [Текущая дата]
**Статус:** В разработке
**Приоритет:** Высокий
