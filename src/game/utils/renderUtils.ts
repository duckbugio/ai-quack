import { COLORS, TEXT_STYLES, UI_POSITIONS, CLOUD_CONFIG, CLOUD_POSITIONS } from './uiConstants';

/**
 * Утилиты для отрисовки UI элементов на canvas
 */

/**
 * Тип для стилей текста
 */
type TextStyle = typeof TEXT_STYLES[keyof typeof TEXT_STYLES];

/**
 * Отрисовывает текст с тенью и обводкой
 * @param ctx - Контекст canvas для отрисовки
 * @param text - Текст для отрисовки
 * @param x - Координата X центра текста
 * @param y - Координата Y центра текста
 * @param style - Стиль текста из TEXT_STYLES
 */
export function drawTextWithShadow(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  style: TextStyle
): void {
  ctx.save();
  
  ctx.font = style.font;
  ctx.fillStyle = style.fillStyle;
  ctx.strokeStyle = style.strokeStyle;
  ctx.lineWidth = style.lineWidth;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if ('shadowColor' in style && style.shadowColor) {
    ctx.shadowColor = style.shadowColor;
    ctx.shadowBlur = style.shadowBlur || 0;
    ctx.shadowOffsetX = style.shadowOffsetX || 0;
    ctx.shadowOffsetY = style.shadowOffsetY || 0;
  }
  
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
  
  // Сброс тени
  if ('shadowColor' in style && style.shadowColor) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  
  ctx.restore();
}

/**
 * Отрисовывает счет игры
 * @param ctx - Контекст canvas для отрисовки
 * @param score - Текущий счет игры
 * @param canvasWidth - Ширина canvas для центрирования текста
 * @param scale - Масштаб для анимации (по умолчанию 1)
 */
export function drawScore(
  ctx: CanvasRenderingContext2D,
  score: number,
  canvasWidth: number,
  scale: number = 1
): void {
  ctx.save();
  
  const textX = canvasWidth / 2;
  const textY = UI_POSITIONS.SCORE_Y;
  
  // Применение масштабирования
  ctx.translate(textX, textY);
  ctx.scale(scale, scale);
  ctx.translate(-textX, -textY);
  
  drawTextWithShadow(ctx, score.toString(), textX, textY, TEXT_STYLES.SCORE);
  
  ctx.restore();
}

/**
 * Отрисовывает лучший результат
 * @param ctx - Контекст canvas для отрисовки
 * @param highScore - Лучший результат
 * @param canvasWidth - Ширина canvas
 * @param canvasHeight - Высота canvas
 * @param isMenu - Флаг отображения в меню (true) или во время игры (false)
 */
export function drawHighScore(
  ctx: CanvasRenderingContext2D,
  highScore: number,
  canvasWidth: number,
  canvasHeight: number,
  isMenu: boolean = false
): void {
  ctx.save();
  
  if (isMenu) {
    const textX = canvasWidth / 2;
    const textY = canvasHeight / 2 + UI_POSITIONS.HIGH_SCORE_MENU_Y_OFFSET;
    const text = `Лучший результат: ${highScore}`;
    
    drawTextWithShadow(ctx, text, textX, textY, TEXT_STYLES.HIGH_SCORE_MENU);
  } else {
    ctx.font = TEXT_STYLES.HIGH_SCORE_GAME.font;
    ctx.fillStyle = TEXT_STYLES.HIGH_SCORE_GAME.fillStyle;
    ctx.strokeStyle = TEXT_STYLES.HIGH_SCORE_GAME.strokeStyle;
    ctx.lineWidth = TEXT_STYLES.HIGH_SCORE_GAME.lineWidth;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    
    const textX = canvasWidth + UI_POSITIONS.HIGH_SCORE_GAME_X_OFFSET;
    const textY = UI_POSITIONS.HIGH_SCORE_GAME_Y;
    const text = `Best: ${highScore}`;
    
    ctx.strokeText(text, textX, textY);
    ctx.fillText(text, textX, textY);
  }
  
  ctx.restore();
}

/**
 * Отрисовывает счет при окончании игры
 * @param ctx - Контекст canvas для отрисовки
 * @param score - Финальный счет игры
 * @param canvasWidth - Ширина canvas для центрирования
 * @param canvasHeight - Высота canvas для позиционирования
 */
export function drawGameOverScore(
  ctx: CanvasRenderingContext2D,
  score: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  const textX = canvasWidth / 2;
  const textY = canvasHeight / 2 + UI_POSITIONS.GAME_OVER_SCORE_Y_OFFSET;
  const text = `Ваш счет: ${score}`;
  
  drawTextWithShadow(ctx, text, textX, textY, TEXT_STYLES.GAME_OVER_SCORE);
}

/**
 * Отрисовывает индикацию нового рекорда
 * @param ctx - Контекст canvas для отрисовки
 * @param canvasWidth - Ширина canvas для центрирования
 * @param canvasHeight - Высота canvas для позиционирования
 */
export function drawNewRecord(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
): void {
  const textX = canvasWidth / 2;
  const textY = canvasHeight / 2 + UI_POSITIONS.NEW_RECORD_Y_OFFSET;
  const text = '🎉 Новый рекорд! 🎉';
  
  drawTextWithShadow(ctx, text, textX, textY, TEXT_STYLES.NEW_RECORD);
}

/**
 * Отрисовывает небо с градиентом и солнцем
 * @param ctx - Контекст canvas для отрисовки
 * @param canvasWidth - Ширина canvas
 * @param canvasHeight - Высота canvas
 */
export function drawSky(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Градиент неба
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, COLORS.SKY_TOP);
  gradient.addColorStop(1, COLORS.SKY_BOTTOM);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Солнце
  const sunX = canvasWidth - 150;
  const sunY = 80;
  const sunRadius = 40;
  
  // Внешнее свечение солнца
  const sunGradient = ctx.createRadialGradient(
    sunX, sunY, 0,
    sunX, sunY, sunRadius * 1.5
  );
  sunGradient.addColorStop(0, COLORS.SUN_OUTER);
  sunGradient.addColorStop(0.7, COLORS.SUN_MIDDLE);
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
  sunMainGradient.addColorStop(0, COLORS.SUN_INNER);
  sunMainGradient.addColorStop(1, COLORS.SUN_OUTER_EDGE);
  ctx.fillStyle = sunMainGradient;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Отрисовывает одно облако
 */
function drawSingleCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  opacity: number = 0.8
): void {
  ctx.save();
  
  // Тень облака
  ctx.shadowColor = COLORS.CLOUD_SHADOW;
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  // Градиент для облака
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
}

/**
 * Отрисовывает все облака с учетом смещения для бесшовной прокрутки
 * @param ctx - Контекст canvas для отрисовки
 * @param canvasWidth - Ширина canvas для бесшовной прокрутки
 * @param cloudOffset - Текущее смещение облаков для анимации
 */
export function drawClouds(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  cloudOffset: number
): void {
  // Отрисовка основных облаков
  CLOUD_POSITIONS.forEach((cloud) => {
    drawSingleCloud(ctx, cloud.x + cloudOffset, cloud.y, cloud.size, cloud.opacity);
  });
  
  // Отрисовка облаков для бесшовной прокрутки
  CLOUD_POSITIONS.forEach((cloud) => {
    drawSingleCloud(ctx, cloud.x + cloudOffset - canvasWidth, cloud.y, cloud.size, cloud.opacity);
  });
}

/**
 * Обновляет смещение облаков для анимации
 * @param currentOffset - Текущее смещение облаков
 * @param deltaTime - Время, прошедшее с последнего кадра (в миллисекундах)
 * @param canvasWidth - Ширина canvas для сброса смещения
 * @returns Новое значение смещения облаков
 */
export function updateCloudOffset(
  currentOffset: number,
  deltaTime: number,
  canvasWidth: number
): number {
  let newOffset = currentOffset + CLOUD_CONFIG.SPEED * (deltaTime / 16);
  if (newOffset > canvasWidth) {
    newOffset = 0;
  }
  return newOffset;
}
