import { describe, it, expect, beforeEach } from 'vitest';
import { Duck } from '../../entities/Duck';
import { Obstacle } from '../../entities/Obstacle';
import {
  checkCollision,
  checkDuckObstacleCollision,
  checkDuckBoundsCollision,
  checkAllCollisions,
} from '../CollisionSystem';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../utils/constants';

describe('CollisionSystem - Коллизии', () => {
  let duck: Duck;
  let obstacle: Obstacle;
  const canvasHeight = CANVAS_HEIGHT;

  beforeEach(() => {
    duck = new Duck();
    obstacle = new Obstacle(200, canvasHeight);
  });

  describe('checkCollision - Базовая проверка коллизий', () => {
    it('должна определять пересечение двух прямоугольников', () => {
      const rect1 = { x: 0, y: 0, width: 50, height: 50 };
      const rect2 = { x: 25, y: 25, width: 50, height: 50 };
      
      expect(checkCollision(rect1, rect2)).toBe(true);
    });

    it('должна определять отсутствие пересечения', () => {
      const rect1 = { x: 0, y: 0, width: 50, height: 50 };
      const rect2 = { x: 100, y: 100, width: 50, height: 50 };
      
      expect(checkCollision(rect1, rect2)).toBe(false);
    });

    it('должна обрабатывать касание границ', () => {
      const rect1 = { x: 0, y: 0, width: 50, height: 50 };
      const rect2 = { x: 50, y: 0, width: 50, height: 50 };
      
      expect(checkCollision(rect1, rect2)).toBe(true);
    });
  });

  describe('checkDuckObstacleCollision - Коллизия утки с препятствием', () => {
    it('должна определять столкновение с верхней частью препятствия', () => {
      // Устанавливаем утку в позицию, где она столкнется с верхней частью
      duck.position.x = obstacle.x + 10;
      duck.position.y = obstacle.topHeight - 10;
      
      expect(checkDuckObstacleCollision(duck, obstacle)).toBe(true);
    });

    it('должна определять столкновение с нижней частью препятствия', () => {
      // Устанавливаем утку в позицию, где она столкнется с нижней частью
      duck.position.x = obstacle.x + 10;
      duck.position.y = CANVAS_HEIGHT - obstacle.bottomHeight - 10;
      
      expect(checkDuckObstacleCollision(duck, obstacle)).toBe(true);
    });

    it('должна определять отсутствие столкновения', () => {
      // Устанавливаем утку в проход между препятствиями
      duck.position.x = obstacle.x + 10;
      duck.position.y = obstacle.topHeight + obstacle.gap / 2;
      
      expect(checkDuckObstacleCollision(duck, obstacle)).toBe(false);
    });

    it('должна определять столкновение при касании края', () => {
      // Утка касается верхней части препятствия
      duck.position.x = obstacle.x;
      duck.position.y = obstacle.topHeight - duck.height;
      
      expect(checkDuckObstacleCollision(duck, obstacle)).toBe(true);
    });

    it('должна обрабатывать утку перед препятствием', () => {
      duck.position.x = obstacle.x - duck.width;
      
      expect(checkDuckObstacleCollision(duck, obstacle)).toBe(false);
    });

    it('должна обрабатывать утку после препятствия', () => {
      duck.position.x = obstacle.x + obstacle.width + 10;
      
      expect(checkDuckObstacleCollision(duck, obstacle)).toBe(false);
    });
  });

  describe('checkDuckBoundsCollision - Коллизия с границами экрана', () => {
    it('должна определять столкновение с верхней границей', () => {
      duck.position.y = -10;
      
      expect(checkDuckBoundsCollision(duck, canvasHeight)).toBe(true);
    });

    it('должна определять столкновение с нижней границей', () => {
      duck.position.y = canvasHeight + 10;
      
      expect(checkDuckBoundsCollision(duck, canvasHeight)).toBe(true);
    });

    it('должна определять отсутствие столкновения с границами', () => {
      duck.position.y = canvasHeight / 2;
      
      expect(checkDuckBoundsCollision(duck, canvasHeight)).toBe(false);
    });

    it('должна обрабатывать касание верхней границы', () => {
      duck.position.y = 0;
      
      expect(checkDuckBoundsCollision(duck, canvasHeight)).toBe(true);
    });

    it('должна обрабатывать касание нижней границы', () => {
      duck.position.y = canvasHeight - duck.height;
      
      expect(checkDuckBoundsCollision(duck, canvasHeight)).toBe(true);
    });
  });

  describe('checkAllCollisions - Проверка всех коллизий', () => {
    it('должна находить коллизию среди нескольких препятствий', () => {
      const obstacles: Obstacle[] = [
        new Obstacle(100, canvasHeight),
        new Obstacle(300, canvasHeight),
        new Obstacle(500, canvasHeight),
      ];
      
      // Устанавливаем утку в столкновение со вторым препятствием
      duck.position.x = obstacles[1].x + 10;
      duck.position.y = obstacles[1].topHeight - 10;
      
      expect(checkAllCollisions(duck, obstacles, CANVAS_WIDTH)).toBe(true);
    });

    it('должна возвращать false при отсутствии коллизий', () => {
      const obstacles: Obstacle[] = [
        new Obstacle(100, canvasHeight),
        new Obstacle(300, canvasHeight),
      ];
      
      // Устанавливаем утку в безопасную позицию
      duck.position.x = 50;
      duck.position.y = canvasHeight / 2;
      
      expect(checkAllCollisions(duck, obstacles, CANVAS_WIDTH)).toBe(false);
    });

    it('должна оптимизировать проверку, пропуская препятствия за экраном', () => {
      const obstacles: Obstacle[] = [
        new Obstacle(-200, canvasHeight), // За экраном
        new Obstacle(400, canvasHeight), // На экране
      ];
      
      // Устанавливаем утку в столкновение с препятствием на экране
      duck.position.x = obstacles[1].x + 10;
      duck.position.y = obstacles[1].topHeight - 10;
      
      expect(checkAllCollisions(duck, obstacles, CANVAS_WIDTH)).toBe(true);
    });

    it('должна обрабатывать пустой массив препятствий', () => {
      expect(checkAllCollisions(duck, [], CANVAS_WIDTH)).toBe(false);
    });
  });
});
