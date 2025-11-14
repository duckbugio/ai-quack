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
 * Оптимизированная версия - проверяет только препятствия в зоне видимости
 * @param duck - Экземпляр утки
 * @param obstacles - Массив препятствий
 * @param canvasWidth - Ширина canvas для оптимизации
 * @returns Количество новых пройденных препятствий
 */
export function checkAllObstaclesPassed(
  duck: Duck,
  obstacles: Obstacle[],
  canvasWidth: number = 800
): number {
  // Оптимизация: проверяем только препятствия в зоне видимости утки
  // и те, которые еще не были пройдены
  const relevantObstacles = obstacles.filter(
    (obs) =>
      obs &&
      !obs.passed && // Пропускаем уже пройденные препятствия
      obs.x + obs.width >= duck.position.x - 50 && // Впереди утки или рядом
      obs.x <= duck.position.x + duck.width + 50 // Не слишком далеко впереди
  );

  let passedCount = 0;
  relevantObstacles.forEach((obstacle) => {
    if (checkObstaclePassed(duck, obstacle)) {
      passedCount++;
    }
  });
  return passedCount;
}
