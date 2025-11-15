import { describe, it, expect, beforeEach } from 'vitest';
import { Duck } from '../Duck';
import {
  GRAVITY,
  JUMP_FORCE,
  MAX_FALL_SPEED,
  DUCK_START_X,
  DUCK_START_Y,
  CANVAS_HEIGHT,
} from '../../utils/constants';

describe('Duck - Движение утки', () => {
  let duck: Duck;
  const canvasHeight = CANVAS_HEIGHT;
  const deltaTime = 16; // Один кадр при 60 FPS

  beforeEach(() => {
    duck = new Duck();
  });

  describe('Инициализация', () => {
    it('должна создавать утку с правильными начальными параметрами', () => {
      expect(duck.position.x).toBe(DUCK_START_X);
      expect(duck.position.y).toBe(DUCK_START_Y);
      expect(duck.velocity.vx).toBe(0);
      expect(duck.velocity.vy).toBe(0);
      expect(duck.width).toBeGreaterThan(0);
      expect(duck.height).toBeGreaterThan(0);
    });
  });

  describe('Гравитация', () => {
    it('должна заставлять утку падать под действием гравитации', () => {
      const initialY = duck.position.y;
      
      // Обновляем несколько кадров
      for (let i = 0; i < 10; i++) {
        duck.update(deltaTime, canvasHeight);
      }
      
      expect(duck.position.y).toBeGreaterThan(initialY);
      expect(duck.velocity.vy).toBeGreaterThan(0);
    });

    it('должна ограничивать максимальную скорость падения', () => {
      // Обновляем много кадров, чтобы достичь максимальной скорости
      for (let i = 0; i < 100; i++) {
        duck.update(deltaTime, canvasHeight);
      }
      
      expect(duck.velocity.vy).toBeLessThanOrEqual(MAX_FALL_SPEED);
    });

    it('должна постепенно увеличивать скорость падения', () => {
      const initialVelocity = duck.velocity.vy;
      
      duck.update(deltaTime, canvasHeight);
      const velocityAfterFirst = duck.velocity.vy;
      
      duck.update(deltaTime, canvasHeight);
      const velocityAfterSecond = duck.velocity.vy;
      
      expect(velocityAfterFirst).toBeGreaterThan(initialVelocity);
      expect(velocityAfterSecond).toBeGreaterThan(velocityAfterFirst);
    });
  });

  describe('Прыжок', () => {
    it('должен устанавливать вертикальную скорость вверх при прыжке', () => {
      // Сначала утка падает
      duck.update(deltaTime, canvasHeight);
      const velocityBeforeJump = duck.velocity.vy;
      
      // Выполняем прыжок
      duck.jump();
      
      expect(duck.velocity.vy).toBe(JUMP_FORCE);
      expect(duck.velocity.vy).toBeLessThan(0); // Отрицательное значение = движение вверх
      expect(duck.velocity.vy).toBeLessThan(velocityBeforeJump);
    });

    it('должен изменять направление движения утки вверх после прыжка', () => {
      // Утка падает
      duck.update(deltaTime, canvasHeight);
      const yBeforeJump = duck.position.y;
      
      // Прыжок
      duck.jump();
      
      // Обновляем позицию
      duck.update(deltaTime, canvasHeight);
      
      // После прыжка утка должна двигаться вверх (или замедляться)
      expect(duck.velocity.vy).toBeLessThan(0);
    });

    it('должен работать корректно при множественных прыжках', () => {
      for (let i = 0; i < 5; i++) {
        duck.jump();
        expect(duck.velocity.vy).toBe(JUMP_FORCE);
      }
    });
  });

  describe('Границы экрана', () => {
    it('должна возвращать true при достижении верхней границы', () => {
      // Устанавливаем утку в верхнюю часть экрана
      duck.position.y = -10;
      
      const hitBoundary = duck.update(deltaTime, canvasHeight);
      
      expect(hitBoundary).toBe(true);
      expect(duck.position.y).toBe(0);
    });

    it('должна возвращать true при достижении нижней границы', () => {
      // Устанавливаем утку в нижнюю часть экрана
      duck.position.y = canvasHeight + 10;
      
      const hitBoundary = duck.update(deltaTime, canvasHeight);
      
      expect(hitBoundary).toBe(true);
      expect(duck.position.y).toBe(canvasHeight - duck.height);
    });

    it('должна корректно обрабатывать утку, которая не достигает границ', () => {
      // Устанавливаем утку в центр экрана
      duck.position.y = canvasHeight / 2;
      
      const hitBoundary = duck.update(deltaTime, canvasHeight);
      
      expect(hitBoundary).toBe(false);
      expect(duck.position.y).toBeGreaterThan(0);
      expect(duck.position.y + duck.height).toBeLessThan(canvasHeight);
    });

    it('должна предотвращать выход утки за верхнюю границу', () => {
      duck.position.y = -5;
      duck.velocity.vy = -10; // Движение вверх
      
      duck.update(deltaTime, canvasHeight);
      
      expect(duck.position.y).toBeGreaterThanOrEqual(0);
    });

    it('должна предотвращать выход утки за нижнюю границу', () => {
      duck.position.y = canvasHeight - duck.height + 5;
      duck.velocity.vy = 20; // Движение вниз
      
      duck.update(deltaTime, canvasHeight);
      
      expect(duck.position.y + duck.height).toBeLessThanOrEqual(canvasHeight);
    });
  });

  describe('Сброс состояния', () => {
    it('должен сбрасывать утку в начальное состояние', () => {
      // Изменяем состояние утки
      duck.position.y = 100;
      duck.velocity.vy = 10;
      duck.jump();
      
      // Сбрасываем
      duck.reset();
      
      expect(duck.position.x).toBe(DUCK_START_X);
      expect(duck.position.y).toBe(DUCK_START_Y);
      expect(duck.velocity.vx).toBe(0);
      expect(duck.velocity.vy).toBe(0);
    });
  });

  describe('Границы для коллизий', () => {
    it('должна возвращать правильные границы утки', () => {
      duck.position.x = 100;
      duck.position.y = 200;
      
      const bounds = duck.getBounds();
      
      expect(bounds.x).toBe(duck.position.x);
      expect(bounds.y).toBe(duck.position.y);
      expect(bounds.width).toBe(duck.width);
      expect(bounds.height).toBe(duck.height);
    });

    it('должна обновлять границы при изменении позиции', () => {
      const bounds1 = duck.getBounds();
      
      duck.position.y = 300;
      duck.update(deltaTime, canvasHeight);
      const bounds2 = duck.getBounds();
      
      expect(bounds2.y).not.toBe(bounds1.y);
    });
  });
});
