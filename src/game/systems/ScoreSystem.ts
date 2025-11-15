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
  // Защита от edge cases
  if (!duck || !obstacle || obstacle.passed) {
    return false;
  }
  
  // Препятствие считается пройденным, если утка прошла его правую границу
  if (duck.position.x > obstacle.x + obstacle.width) {
    obstacle.passed = true;
    return true;
  }
  return false;
}

/**
 * Вычисляет множитель сложности на основе счета
 * Увеличивает сложность постепенно для более плавного игрового процесса
 * @param score - Текущий счет
 * @returns Множитель сложности (начинается с 1.0)
 */
export function getDifficultyMultiplier(score: number): number {
  // Защита от отрицательных значений
  const safeScore = Math.max(0, score);
  // Увеличиваем скорость каждые 10 очков на 5%
  // Максимальный множитель ограничен 2.5 (150% увеличение скорости)
  const multiplier = 1 + Math.floor(safeScore / 10) * 0.05;
  return Math.min(multiplier, 2.5);
}

/**
 * Вычисляет текущее расстояние между препятствиями с учетом сложности
 * Уменьшает расстояние между препятствиями при увеличении счета
 * @param score - Текущий счет
 * @param baseSpacing - Базовое расстояние между препятствиями
 * @returns Текущее расстояние между препятствиями
 */
export function getCurrentSpacing(score: number, baseSpacing: number): number {
  // Защита от отрицательных значений
  const safeScore = Math.max(0, score);
  // Уменьшаем расстояние каждые 20 очков на 2%
  // Минимальное расстояние - 70% от базового
  const spacingMultiplier = Math.max(
    1 - Math.floor(safeScore / 20) * 0.02,
    0.7
  );
  return baseSpacing * spacingMultiplier;
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
  // Защита от edge cases
  if (!duck || !obstacles || obstacles.length === 0) {
    return 0;
  }
  
  // Оптимизация: проверяем только препятствия, которые еще не были пройдены
  // и находятся в зоне проверки (впереди утки или недавно пройденные)
  const relevantObstacles = obstacles.filter(
    (obs) =>
      obs &&
      !obs.passed && // Пропускаем уже пройденные препятствия
      // Проверяем препятствия, которые утка может пройти или уже прошла
      // Расширяем зону проверки, чтобы не пропустить быстрое прохождение
      obs.x + obs.width >= duck.position.x - 100 && // Включаем препятствия немного позади
      obs.x <= duck.position.x + duck.width + 50 // И впереди утки
  );

  let passedCount = 0;
  relevantObstacles.forEach((obstacle) => {
    if (checkObstaclePassed(duck, obstacle)) {
      passedCount++;
    }
  });
  return passedCount;
}
