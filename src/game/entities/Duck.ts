import { Position, Velocity, Bounds } from '../../types/game.types';
import {
  GRAVITY,
  JUMP_FORCE,
  MAX_FALL_SPEED,
  DUCK_WIDTH,
  DUCK_HEIGHT,
  DUCK_START_X,
  DUCK_START_Y,
} from '../utils/constants';

/**
 * Класс, представляющий игрового персонажа - утку
 * Управляет позицией, скоростью, физикой и отрисовкой утки
 */
export class Duck {
  position: Position;
  velocity: Velocity;
  width: number;
  height: number;
  private wingState: 'up' | 'down' = 'up';
  private wingAnimationTimer: number = 0;
  private cachedBounds: Bounds | null = null;
  private lastPositionX: number = DUCK_START_X;
  private lastPositionY: number = DUCK_START_Y;

  constructor() {
    this.position = { x: DUCK_START_X, y: DUCK_START_Y };
    this.velocity = { vx: 0, vy: 0 };
    this.width = DUCK_WIDTH;
    this.height = DUCK_HEIGHT;
    this.lastPositionX = DUCK_START_X;
    this.lastPositionY = DUCK_START_Y;
  }

  /**
   * Обновляет позицию утки с учетом гравитации и границ экрана
   * @param deltaTime - Время, прошедшее с последнего кадра (в миллисекундах)
   * @param canvasHeight - Высота canvas для проверки границ
   * @returns true если утка достигла границы экрана (игра окончена)
   */
  update(deltaTime: number, canvasHeight: number): boolean {
    // Применение гравитации (нормализация к 60 FPS)
    this.velocity.vy += GRAVITY * (deltaTime / 16);

    // Ограничение максимальной скорости падения
    if (this.velocity.vy > MAX_FALL_SPEED) {
      this.velocity.vy = MAX_FALL_SPEED;
    }

    // Обновление позиции
    this.position.y += this.velocity.vy * (deltaTime / 16);

    // Проверка верхней границы
    if (this.position.y < 0) {
      this.position.y = 0;
      // Инвалидируем кэш при изменении позиции
      this.cachedBounds = null;
      return true;
    }

    // Проверка нижней границы
    if (this.position.y + this.height > canvasHeight) {
      this.position.y = canvasHeight - this.height;
      // Инвалидируем кэш при изменении позиции
      this.cachedBounds = null;
      return true;
    }

    // Инвалидируем кэш, если позиция изменилась
    if (this.position.x !== this.lastPositionX || this.position.y !== this.lastPositionY) {
      this.cachedBounds = null;
      this.lastPositionX = this.position.x;
      this.lastPositionY = this.position.y;
    }

    // Анимация крыльев (каждые 100ms)
    this.wingAnimationTimer += deltaTime;
    if (this.wingAnimationTimer > 100) {
      this.wingState = this.wingState === 'up' ? 'down' : 'up';
      this.wingAnimationTimer = 0;
    }

    return false;
  }

  /**
   * Выполняет прыжок утки
   * Устанавливает вертикальную скорость вверх и меняет состояние крыльев
   */
  jump(): void {
    this.velocity.vy = JUMP_FORCE;
    this.wingState = this.wingState === 'up' ? 'down' : 'up';
  }

  /**
   * Отрисовывает утку на canvas
   * @param ctx - Контекст canvas для отрисовки
   */
  draw(ctx: CanvasRenderingContext2D): void {
    // Тело утки (эллипс)
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.ellipse(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
      this.width / 2,
      this.height / 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Клюв
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(
      this.position.x + this.width - 10,
      this.position.y + 10,
      8,
      6
    );

    // Крылья (с анимацией)
    const wingOffset = this.wingState === 'up' ? -5 : 5;
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(
      this.position.x + 5,
      this.position.y + 10 + wingOffset,
      15,
      8
    );

    // Глаз
    ctx.fillStyle = '#000';
    ctx.fillRect(this.position.x + 25, this.position.y + 8, 5, 5);
  }

  /**
   * Возвращает границы утки для проверки коллизий
   * Использует кэширование для оптимизации производительности
   * @returns Объект с координатами и размерами утки
   */
  getBounds(): Bounds {
    // Возвращаем кэшированные границы, если позиция не изменилась
    if (this.cachedBounds !== null) {
      return this.cachedBounds;
    }

    // Вычисляем и кэшируем границы
    this.cachedBounds = {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };

    return this.cachedBounds;
  }

  /**
   * Сбрасывает утку в начальное состояние
   */
  reset(): void {
    this.position = { x: DUCK_START_X, y: DUCK_START_Y };
    this.velocity = { vx: 0, vy: 0 };
    this.wingState = 'up';
    this.wingAnimationTimer = 0;
    this.cachedBounds = null;
    this.lastPositionX = DUCK_START_X;
    this.lastPositionY = DUCK_START_Y;
  }
}
