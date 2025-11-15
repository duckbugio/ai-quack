import { describe, it, expect, beforeEach } from 'vitest';
import { Obstacle } from '../Obstacle';
import {
  PIPE_WIDTH,
  PIPE_GAP,
  OBSTACLE_SPEED,
  CANVAS_HEIGHT,
  PIPE_MIN_HEIGHT,
  PIPE_MAX_HEIGHT,
} from '../../utils/constants';

describe('Obstacle - Генерация препятствий', () => {
  let obstacle: Obstacle;
  const canvasHeight = CANVAS_HEIGHT;
  const deltaTime = 16; // Один кадр при 60 FPS

  beforeEach(() => {
    obstacle = new Obstacle(800, canvasHeight);
  });

  describe('Инициализация', () => {
    it('должна создавать препятствие с правильными параметрами', () => {
      expect(obstacle.x).toBe(800);
      expect(obstacle.width).toBe(PIPE_WIDTH);
      expect(obstacle.gap).toBe(PIPE_GAP);
      expect(obstacle.passed).toBe(false);
      expect(obstacle.topHeight).toBeGreaterThan(0);
      expect(obstacle.bottomHeight).toBeGreaterThan(0);
    });

    it('должна генерировать случайную высоту верхней части', () => {
      const heights: number[] = [];
      
      // Создаем несколько препятствий и проверяем, что высоты разные
      for (let i = 0; i < 10; i++) {
        const obs = new Obstacle(800, canvasHeight);
        heights.push(obs.topHeight);
      }
      
      // Проверяем, что есть хотя бы два разных значения
      const uniqueHeights = new Set(heights);
      expect(uniqueHeights.size).toBeGreaterThan(1);
    });

    it('должна генерировать высоту в допустимых пределах', () => {
      for (let i = 0; i < 20; i++) {
        const obs = new Obstacle(800, canvasHeight);
        expect(obs.topHeight).toBeGreaterThanOrEqual(PIPE_MIN_HEIGHT);
        expect(obs.topHeight).toBeLessThanOrEqual(
          Math.min(canvasHeight - PIPE_GAP - PIPE_MIN_HEIGHT, PIPE_MAX_HEIGHT)
        );
      }
    });

    it('должна правильно вычислять высоту нижней части', () => {
      expect(obstacle.topHeight + obstacle.gap + obstacle.bottomHeight).toBe(
        canvasHeight
      );
    });
  });

  describe('Движение препятствий', () => {
    it('должна двигать препятствие влево при обновлении', () => {
      const initialX = obstacle.x;
      
      obstacle.update(deltaTime, 1);
      
      expect(obstacle.x).toBeLessThan(initialX);
    });

    it('должна применять множитель скорости корректно', () => {
      const initialX = obstacle.x;
      
      obstacle.update(deltaTime, 1);
      const xAfterNormal = obstacle.x;
      
      obstacle.x = initialX; // Сбрасываем позицию
      obstacle.update(deltaTime, 2); // Удваиваем скорость
      const xAfterDouble = obstacle.x;
      
      // При удвоенной скорости препятствие должно пройти большее расстояние
      const distanceNormal = initialX - xAfterNormal;
      const distanceDouble = initialX - xAfterDouble;
      
      expect(distanceDouble).toBeGreaterThan(distanceNormal);
    });
  });

  describe('Удаление препятствий за экраном', () => {
    it('должна определять, что препятствие за экраном', () => {
      obstacle.x = -100;
      
      expect(obstacle.isOffScreen()).toBe(true);
    });

    it('должна определять, что препятствие на экране', () => {
      obstacle.x = 400;
      
      expect(obstacle.isOffScreen()).toBe(false);
    });

    it('должна правильно определять границу экрана', () => {
      obstacle.x = -obstacle.width;
      
      expect(obstacle.isOffScreen()).toBe(true);
      
      obstacle.x = -obstacle.width + 1;
      
      expect(obstacle.isOffScreen()).toBe(false);
    });
  });

  describe('Границы для коллизий', () => {
    it('должна возвращать правильные границы верхней части', () => {
      obstacle.x = 200;
      obstacle.topHeight = 150;
      
      const topBounds = obstacle.getTopBounds();
      
      expect(topBounds.x).toBe(obstacle.x);
      expect(topBounds.y).toBe(0);
      expect(topBounds.width).toBe(obstacle.width);
      expect(topBounds.height).toBe(obstacle.topHeight);
    });

    it('должна возвращать правильные границы нижней части', () => {
      obstacle.x = 200;
      obstacle.bottomHeight = 200;
      
      const bottomBounds = obstacle.getBottomBounds();
      
      expect(bottomBounds.x).toBe(obstacle.x);
      expect(bottomBounds.y).toBe(canvasHeight - obstacle.bottomHeight);
      expect(bottomBounds.width).toBe(obstacle.width);
      expect(bottomBounds.height).toBe(obstacle.bottomHeight);
    });
  });
});
