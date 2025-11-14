/**
 * Константы для UI элементов игры
 */

// Цвета
export const COLORS = {
  // Фон
  SKY_TOP: '#87CEEB',
  SKY_BOTTOM: '#E0F6FF',
  
  // Солнце
  SUN_OUTER: 'rgba(255, 255, 200, 0.6)',
  SUN_MIDDLE: 'rgba(255, 255, 150, 0.3)',
  SUN_INNER: '#FFEB3B',
  SUN_OUTER_EDGE: '#FFC107',
  
  // Облака
  CLOUD: 'rgba(255, 255, 255, 0.8)',
  CLOUD_SHADOW: 'rgba(0, 0, 0, 0.1)',
  
  // Текст
  TEXT_WHITE: '#FFFFFF',
  TEXT_GOLD: '#FFD700',
  TEXT_YELLOW: '#FFFF00',
  TEXT_BLACK: '#000000',
  
  // Тени
  SHADOW_DARK: 'rgba(0, 0, 0, 0.5)',
  SHADOW_GOLD: 'rgba(255, 215, 0, 0.6)',
} as const;

// Размеры шрифтов
export const FONT_SIZES = {
  SCORE_LARGE: 48,
  SCORE_MEDIUM: 36,
  HIGH_SCORE_MENU: 32,
  HIGH_SCORE_GAME: 24,
  NEW_RECORD: 32,
} as const;

// Настройки текста
export const TEXT_STYLES = {
  SCORE: {
    font: `bold ${FONT_SIZES.SCORE_LARGE}px Arial`,
    fillStyle: COLORS.TEXT_WHITE,
    strokeStyle: COLORS.TEXT_BLACK,
    lineWidth: 3,
    shadowColor: COLORS.SHADOW_DARK,
    shadowBlur: 4,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
  },
  HIGH_SCORE_MENU: {
    font: `bold ${FONT_SIZES.HIGH_SCORE_MENU}px Arial`,
    fillStyle: COLORS.TEXT_GOLD,
    strokeStyle: COLORS.TEXT_BLACK,
    lineWidth: 3,
    shadowColor: COLORS.SHADOW_DARK,
    shadowBlur: 4,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
  },
  HIGH_SCORE_GAME: {
    font: `${FONT_SIZES.HIGH_SCORE_GAME}px Arial`,
    fillStyle: COLORS.TEXT_YELLOW,
    strokeStyle: COLORS.TEXT_BLACK,
    lineWidth: 2,
  },
  GAME_OVER_SCORE: {
    font: `bold ${FONT_SIZES.SCORE_MEDIUM}px Arial`,
    fillStyle: COLORS.TEXT_WHITE,
    strokeStyle: COLORS.TEXT_BLACK,
    lineWidth: 3,
    shadowColor: COLORS.SHADOW_DARK,
    shadowBlur: 4,
    shadowOffsetX: 2,
    shadowOffsetY: 2,
  },
  NEW_RECORD: {
    font: `bold ${FONT_SIZES.NEW_RECORD}px Arial`,
    fillStyle: COLORS.TEXT_GOLD,
    strokeStyle: COLORS.TEXT_BLACK,
    lineWidth: 4,
    shadowColor: COLORS.SHADOW_GOLD,
    shadowBlur: 10,
  },
} as const;

// Позиции UI элементов
export const UI_POSITIONS = {
  SCORE_Y: 60,
  HIGH_SCORE_MENU_Y_OFFSET: -50,
  HIGH_SCORE_GAME_X_OFFSET: -20,
  HIGH_SCORE_GAME_Y: 20,
  GAME_OVER_SCORE_Y_OFFSET: 20,
  NEW_RECORD_Y_OFFSET: 70,
} as const;

// Анимация счета
export const SCORE_ANIMATION = {
  SCALE: 1.3,
  DURATION: 200,
} as const;

// Облака
export const CLOUD_CONFIG = {
  SPEED: 0.1,
  OPACITY: {
    LARGE: 0.85,
    MEDIUM: 0.75,
    SMALL: 0.6,
  },
} as const;

/**
 * Конфигурация позиций облаков для отрисовки
 */
export const CLOUD_POSITIONS = [
  { x: 200, y: 100, size: 35, opacity: CLOUD_CONFIG.OPACITY.LARGE },
  { x: 500, y: 80, size: 30, opacity: CLOUD_CONFIG.OPACITY.MEDIUM },
  { x: 700, y: 120, size: 32, opacity: CLOUD_CONFIG.OPACITY.LARGE },
  { x: 350, y: 150, size: 25, opacity: CLOUD_CONFIG.OPACITY.SMALL },
  { x: 600, y: 60, size: 28, opacity: CLOUD_CONFIG.OPACITY.MEDIUM },
] as const;
