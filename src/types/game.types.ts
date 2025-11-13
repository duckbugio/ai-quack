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
