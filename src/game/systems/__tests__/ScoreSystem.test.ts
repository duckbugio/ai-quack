import { describe, it, expect, beforeEach } from 'vitest';
import { Duck } from '../../entities/Duck';
import { Obstacle } from '../../entities/Obstacle';
import {
  checkObstaclePassed,
  checkAllObstaclesPassed,
  getDifficultyMultiplier,
  getCurrentSpacing,
} from '../ScoreSystem';
import { CANVAS_HEIGHT, PIPE_SPACING } from '../../utils/constants';

describe('ScoreSystem - Подсчет очков', () => {
  let duck: Duck;
  let obstacle: Obstacle;
  const canvasHeight = CANVAS_HEIGHT;

  beforeEach(() => {
    duck = new Duck();
    obstacle = new Obstacle(200, canvasHeight);
  });

  describe('checkObstaclePassed - Проверка прохождения препятствия', () => {
    it('должна определять, что препятствие пройдено', () => {
      // Устанавливаем утку после препятствия
      duck.position.x = obstacle.x + obstacle.width + 10;
      
      expect(checkObstaclePassed(duck, obstacle)).toBe(true);
      expect(obstacle.passed).toBe(true);
    });

    it('должна определять, что препятствие еще не пройдено', () => {
      // Устанавливаем утку перед препятствием
      duck.position.x = obstacle.x - 10;
      
      expect(checkObstaclePassed(duck, obstacle)).toBe(false);
      expect(obstacle.passed).toBe(false);
    });

    it('должна давать только одно очко за одно препятствие', () => {
      duck.position.x = obstacle.x + obstacle.width + 10;
      
      // Первый раз - должно вернуть true
      expect(checkObstaclePassed(duck, obstacle)).toBe(true);
      
      // Второй раз - должно вернуть false (уже пройдено)
      expect(checkObstaclePassed(duck, obstacle)).toBe(false);
    });

    it('должна правильно определять момент прохождения', () => {
      // Утка точно на границе препятствия
      duck.position.x = obstacle.x + obstacle.width;
      
      expect(checkObstaclePassed(duck, obstacle)).toBe(false);
      
      // Утка немного после границы
      duck.position.x = obstacle.x + obstacle.width + 1;
      
      expect(checkObstaclePassed(duck, obstacle)).toBe(true);
    });
  });

  describe('checkAllObstaclesPassed - Проверка всех препятствий', () => {
    it('должна подсчитывать количество пройденных препятствий', () => {
      const obstacles: Obstacle[] = [
        new Obstacle(50, canvasHeight),
        new Obstacle(200, canvasHeight),
        new Obstacle(350, canvasHeight),
      ];
      
      // Проходим первое препятствие
      duck.position.x = obstacles[0].x + obstacles[0].width + 10;
      let passedCount = checkAllObstaclesPassed(duck, obstacles, 800);
      expect(passedCount).toBe(1);
      
      // Проходим второе препятствие
      duck.position.x = obstacles[1].x + obstacles[1].width + 10;
      passedCount = checkAllObstaclesPassed(duck, obstacles, 800);
      expect(passedCount).toBe(1);
      
      // Проходим третье препятствие
      duck.position.x = obstacles[2].x + obstacles[2].width + 10;
      passedCount = checkAllObstaclesPassed(duck, obstacles, 800);
      expect(passedCount).toBe(1);
    });

    it('должна возвращать 0, если препятствия не пройдены', () => {
      const obstacles: Obstacle[] = [
        new Obstacle(200, canvasHeight),
        new Obstacle(400, canvasHeight),
      ];
      
      duck.position.x = 100; // Перед всеми препятствиями
      
      expect(checkAllObstaclesPassed(duck, obstacles, 800)).toBe(0);
    });

    it('должна обрабатывать пустой массив препятствий', () => {
      expect(checkAllObstaclesPassed(duck, [], 800)).toBe(0);
    });

    it('должна оптимизировать проверку, пропуская уже пройденные препятствия', () => {
      const obstacles: Obstacle[] = [
        new Obstacle(50, canvasHeight),
        new Obstacle(200, canvasHeight),
      ];
      
      // Проходим первое препятствие
      duck.position.x = obstacles[0].x + obstacles[0].width + 10;
      checkAllObstaclesPassed(duck, obstacles, 800);
      
      // Проверяем еще раз - не должно быть новых пройденных
      const passedCount = checkAllObstaclesPassed(duck, obstacles, 800);
      expect(passedCount).toBe(0);
    });
  });

  describe('getDifficultyMultiplier - Множитель сложности', () => {
    it('должна возвращать 1.0 для нулевого счета', () => {
      expect(getDifficultyMultiplier(0)).toBe(1.0);
    });

    it('должна увеличивать множитель каждые 10 очков', () => {
      expect(getDifficultyMultiplier(10)).toBe(1.05);
      expect(getDifficultyMultiplier(20)).toBe(1.1);
      expect(getDifficultyMultiplier(30)).toBe(1.15);
    });

    it('должна ограничивать максимальный множитель', () => {
      const highScore = 1000;
      const multiplier = getDifficultyMultiplier(highScore);
      
      expect(multiplier).toBeLessThanOrEqual(2.5);
    });

    it('должна обрабатывать отрицательные значения', () => {
      expect(getDifficultyMultiplier(-10)).toBe(1.0);
    });
  });

  describe('getCurrentSpacing - Расстояние между препятствиями', () => {
    it('должна возвращать базовое расстояние для нулевого счета', () => {
      expect(getCurrentSpacing(0, PIPE_SPACING)).toBe(PIPE_SPACING);
    });

    it('должна уменьшать расстояние при увеличении счета', () => {
      const spacingAt0 = getCurrentSpacing(0, PIPE_SPACING);
      const spacingAt20 = getCurrentSpacing(20, PIPE_SPACING);
      const spacingAt40 = getCurrentSpacing(40, PIPE_SPACING);
      
      expect(spacingAt20).toBeLessThan(spacingAt0);
      expect(spacingAt40).toBeLessThan(spacingAt20);
    });

    it('должна ограничивать минимальное расстояние', () => {
      const highScore = 1000;
      const spacing = getCurrentSpacing(highScore, PIPE_SPACING);
      const minSpacing = PIPE_SPACING * 0.7;
      
      expect(spacing).toBeGreaterThanOrEqual(minSpacing);
    });

    it('должна обрабатывать отрицательные значения', () => {
      expect(getCurrentSpacing(-10, PIPE_SPACING)).toBe(PIPE_SPACING);
    });
  });
});
