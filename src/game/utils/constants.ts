/**
 * Константы игры "Утка"
 * Все игровые параметры централизованы здесь для удобной настройки баланса игры
 */

// Размеры canvas
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Физические константы
/** Ускорение свободного падения (пикселей за кадр при 60 FPS) */
export const GRAVITY = 0.5;
/** Сила прыжка (отрицательная = движение вверх) */
export const JUMP_FORCE = -10;
/** Максимальная скорость падения утки (пикселей за кадр) */
export const MAX_FALL_SPEED = 15;

// Скорости движения
/** Скорость движения препятствий (пикселей за кадр при 60 FPS) */
export const OBSTACLE_SPEED = 3;
/** Скорость движения земли (обычно равна скорости препятствий) */
export const GROUND_SPEED = OBSTACLE_SPEED;

// Размеры объектов
/** Ширина утки в пикселях */
export const DUCK_WIDTH = 40;
/** Высота утки в пикселях */
export const DUCK_HEIGHT = 30;
/** Ширина препятствий (труб) в пикселях */
export const PIPE_WIDTH = 60;
/** Минимальная высота части препятствия в пикселях */
export const PIPE_MIN_HEIGHT = 50;
/** Максимальная высота части препятствия в пикселях */
export const PIPE_MAX_HEIGHT = 300;

// Расстояния между препятствиями
/** Расстояние между верхней и нижней частью препятствия (проход для утки) */
export const PIPE_GAP = 150;
/** Расстояние между препятствиями по горизонтали */
export const PIPE_SPACING = 250;

// Начальная позиция утки
/** Начальная X координата утки */
export const DUCK_START_X = 100;
/** Начальная Y координата утки (центр экрана) */
export const DUCK_START_Y = CANVAS_HEIGHT / 2;

// Интервал генерации препятствий (в пикселях)
/** Интервал между появлением новых препятствий (равен PIPE_SPACING) */
export const OBSTACLE_SPAWN_INTERVAL = PIPE_SPACING;

// Background rendering constants
export const PARALLAX_SPEED_MULTIPLIER = 0.3;
export const CLOUD_SPEED = 0.1;
export const RESIZE_DEBOUNCE_MS = 150;
export const ORIENTATION_CHANGE_DELAY_MS = 100;
export const VISIBILITY_MARGIN = 50;
export const TREE_SPACING_MIN = 250;
export const TREE_SPACING_VARIANCE = 100;
export const BIRD_WING_ANIMATION_INTERVAL = 150;
export const BIRD_VERTICAL_AMPLITUDE = 0.3;
export const BIRD_MIN_Y = 50;
export const GROUND_HEIGHT = 50;

// Объект конфигурации игры
export const GAME_CONFIG = {
  canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
  physics: { gravity: GRAVITY, jumpForce: JUMP_FORCE },
  duck: { width: DUCK_WIDTH, height: DUCK_HEIGHT },
  obstacles: { width: PIPE_WIDTH, gap: PIPE_GAP, spacing: PIPE_SPACING },
} as const;
