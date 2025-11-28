export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const GRAVITY = 0.5;
export const JUMP_FORCE = -10;
export const MAX_FALL_SPEED = 15;

export const OBSTACLE_SPEED = 3;
export const GROUND_SPEED = OBSTACLE_SPEED;

export const DUCK_WIDTH = 40;
export const DUCK_HEIGHT = 30;
export const PIPE_WIDTH = 60;
export const PIPE_MIN_HEIGHT = 50;
export const PIPE_MAX_HEIGHT = 300;

export const PIPE_GAP = 150;
export const PIPE_SPACING = 250;

export const DUCK_START_X = 100;
export const DUCK_START_Y = CANVAS_HEIGHT / 2;

export const OBSTACLE_SPAWN_INTERVAL = PIPE_SPACING;

export const GAME_CONFIG = {
  canvas: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
  physics: { gravity: GRAVITY, jumpForce: JUMP_FORCE },
  duck: { width: DUCK_WIDTH, height: DUCK_HEIGHT },
  obstacles: { width: PIPE_WIDTH, gap: PIPE_GAP, spacing: PIPE_SPACING },
} as const;
