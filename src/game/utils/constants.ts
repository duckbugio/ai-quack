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

// Объект конфигурации игры
export const GAME_CONFIG = {
  canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
  physics: { gravity: GRAVITY, jumpForce: JUMP_FORCE },
  duck: { width: DUCK_WIDTH, height: DUCK_HEIGHT },
  obstacles: { width: PIPE_WIDTH, gap: PIPE_GAP, spacing: PIPE_SPACING },
} as const;
