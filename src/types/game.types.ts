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

// Персонажи и их конфигурации
export enum CharacterId {
  CLASSIC_DUCK = 'CLASSIC_DUCK',
  FAST_SWIFT = 'FAST_SWIFT',
  BIG_TANK = 'BIG_TANK',
}

export interface CharacterConfig {
  id: CharacterId;
  name: string;
  description: string;
  // Визуальные параметры
  bodyColor: string;
  accentColor: string;
  eyeColor: string;
  // Физические параметры (модификаторы)
  width: number; // переопределяет DUCK_WIDTH
  height: number; // переопределяет DUCK_HEIGHT
  jumpForceMultiplier: number; // множитель к JUMP_FORCE
  gravityMultiplier: number; // множитель к GRAVITY
}

export const CHARACTERS: Record<CharacterId, CharacterConfig> = {
  [CharacterId.CLASSIC_DUCK]: {
    id: CharacterId.CLASSIC_DUCK,
    name: 'Классика',
    description: 'Сбалансированная утка без модификаторов',
    bodyColor: '#FFA500',
    accentColor: '#FF8C00',
    eyeColor: '#000000',
    width: 50,
    height: 35,
    jumpForceMultiplier: 1,
    gravityMultiplier: 1,
  },
  [CharacterId.FAST_SWIFT]: {
    id: CharacterId.FAST_SWIFT,
    name: 'Стрела',
    description: 'Легкая и быстрая: прыгает выше, падает быстрее',
    bodyColor: '#1E90FF',
    accentColor: '#187bcd',
    eyeColor: '#001a33',
    width: 44,
    height: 30,
    jumpForceMultiplier: 1.15,
    gravityMultiplier: 1.1,
  },
  [CharacterId.BIG_TANK]: {
    id: CharacterId.BIG_TANK,
    name: 'Танк',
    description: 'Крупная: ниже прыжок, но инерция меньше',
    bodyColor: '#32CD32',
    accentColor: '#2E8B57',
    eyeColor: '#003300',
    width: 56,
    height: 40,
    jumpForceMultiplier: 0.9,
    gravityMultiplier: 0.95,
  },
};
