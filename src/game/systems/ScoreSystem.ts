import { Duck } from '../entities/Duck';
import { Obstacle } from '../entities/Obstacle';

/**
 * Проверяет, прошла ли утка препятствие
 * @param duck - Экземпляр утки
 * @param obstacle - Экземпляр препятствия
 * @returns true если препятствие было пройдено впервые
 */
export function checkObstaclePassed(
  duck: Duck,
  obstacle: Obstacle
): boolean {
  // Препятствие считается пройденным, если утка прошла его центр
  if (!obstacle.passed && duck.position.x > obstacle.x + obstacle.width) {
    obstacle.passed = true;
    return true;
  }
  return false;
}

/**
 * Вычисляет множитель сложности на основе счета
 * @param score - Текущий счет
 * @returns Множитель сложности (начинается с 1.0)
 */
export function getDifficultyMultiplier(score: number): number {
  // Увеличиваем скорость каждые 10 очков на 5%
  return 1 + Math.floor(score / 10) * 0.05;
}

/**
 * Проверяет все препятствия и возвращает количество новых пройденных
 * @param duck - Экземпляр утки
 * @param obstacles - Массив препятствий
 * @returns Количество новых пройденных препятствий
 */
export function checkAllObstaclesPassed(
  duck: Duck,
  obstacles: Obstacle[]
): number {
  let passedCount = 0;
  obstacles.forEach((obstacle) => {
    if (checkObstaclePassed(duck, obstacle)) {
      passedCount++;
    }
  });
  return passedCount;
}
