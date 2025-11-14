import { Bounds } from '../../types/game.types';
import { Duck } from '../entities/Duck';
import { Obstacle } from '../entities/Obstacle';

/**
 * Проверяет пересечение двух прямоугольников
 * @param rect1 - Первый прямоугольник
 * @param rect2 - Второй прямоугольник
 * @returns true если прямоугольники пересекаются
 */
export function checkCollision(rect1: Bounds, rect2: Bounds): boolean {
  // Валидация входных данных
  if (
    rect1.width <= 0 ||
    rect1.height <= 0 ||
    rect2.width <= 0 ||
    rect2.height <= 0
  ) {
    return false;
  }

  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * Проверяет коллизию утки с препятствием
 * @param duck - Экземпляр утки
 * @param obstacle - Экземпляр препятствия
 * @returns true если утка столкнулась с препятствием
 */
export function checkDuckObstacleCollision(
  duck: Duck,
  obstacle: Obstacle
): boolean {
  // Валидация входных данных
  if (!duck || !obstacle) {
    return false;
  }

  const duckBounds = duck.getBounds();
  const topBounds = obstacle.getTopBounds();
  const bottomBounds = obstacle.getBottomBounds();

  return (
    checkCollision(duckBounds, topBounds) ||
    checkCollision(duckBounds, bottomBounds)
  );
}

/**
 * Проверяет выход утки за границы экрана
 * @param duck - Экземпляр утки
 * @param canvasHeight - Высота canvas
 * @returns true если утка вышла за границы
 */
export function checkDuckBoundsCollision(
  duck: Duck,
  canvasHeight: number
): boolean {
  // Валидация входных данных
  if (!duck || canvasHeight <= 0) {
    return false;
  }

  const bounds = duck.getBounds();
  return bounds.y < 0 || bounds.y + bounds.height > canvasHeight;
}

/**
 * Проверяет все коллизии утки с препятствиями
 * Оптимизированная версия, проверяющая только видимые препятствия
 * @param duck - Экземпляр утки
 * @param obstacles - Массив препятствий
 * @param canvasWidth - Ширина canvas для оптимизации
 * @returns true если обнаружена коллизия
 */
export function checkAllCollisions(
  duck: Duck,
  obstacles: Obstacle[],
  canvasWidth: number
): boolean {
  // Валидация входных данных
  if (!duck || !obstacles || obstacles.length === 0 || canvasWidth <= 0) {
    return false;
  }

  // Оптимизация: проверяем только препятствия в зоне видимости
  // Добавляем небольшой запас (50px) для учета движения утки
  const relevantObstacles = obstacles.filter(
    (obs) => obs && obs.x < canvasWidth + 50 && obs.x + obs.width > -50
  );

  // Ранний выход после первого обнаруженного столкновения
  for (const obstacle of relevantObstacles) {
    if (checkDuckObstacleCollision(duck, obstacle)) {
      return true; // Прекращаем проверку после первого столкновения
    }
  }

  return false;
}
