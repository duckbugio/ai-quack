import { Bounds } from '../../types/game.types';
import {
  PIPE_WIDTH,
  PIPE_GAP,
  OBSTACLE_SPEED,
  CANVAS_HEIGHT,
  PIPE_MIN_HEIGHT,
  PIPE_MAX_HEIGHT,
} from '../utils/constants';

/**
 * Класс, представляющий препятствие в игре
 * Управляет позицией, отрисовкой и коллизиями препятствия
 */
export class Obstacle {
  x: number;
  topHeight: number;
  bottomHeight: number;
  width: number;
  gap: number;
  passed: boolean; // Для отслеживания прохождения уткой
  private cachedTopBounds: Bounds | null = null;
  private cachedBottomBounds: Bounds | null = null;
  private lastX: number;

  constructor(x: number, canvasHeight: number) {
    this.x = x;
    this.width = PIPE_WIDTH;
    this.gap = PIPE_GAP;
    this.lastX = x;

    // Случайная высота верхней части (используем константы из constants.ts)
    const minHeight = PIPE_MIN_HEIGHT;
    const maxHeight = Math.min(
      canvasHeight - this.gap - minHeight,
      PIPE_MAX_HEIGHT
    );
    this.topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

    // Высота нижней части
    this.bottomHeight = canvasHeight - this.topHeight - this.gap;
    this.passed = false;
  }

  update(deltaTime: number, speedMultiplier: number = 1): void {
    const currentSpeed = OBSTACLE_SPEED * speedMultiplier;
    const newX = this.x - currentSpeed * (deltaTime / 16);
    
    // Инвалидируем кэш при любом изменении позиции
    // Это гарантирует корректность кэша даже при очень медленном движении
    if (newX !== this.lastX) {
      this.cachedTopBounds = null;
      this.cachedBottomBounds = null;
    }
    
    this.x = newX;
    this.lastX = newX;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Сохраняем текущее состояние контекста
    ctx.save();

    // Настройка теней для глубины
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Верхняя часть препятствия с градиентом
    const topGradient = ctx.createLinearGradient(
      this.x,
      0,
      this.x + this.width,
      0
    );
    topGradient.addColorStop(0, '#32CD32'); // Светло-зеленый
    topGradient.addColorStop(1, '#228B22'); // Темно-зеленый
    ctx.fillStyle = topGradient;
    ctx.fillRect(this.x, 0, this.width, this.topHeight);

    // Обводка верхней части для контраста
    ctx.strokeStyle = '#006400'; // Темно-зеленый
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, 0, this.width, this.topHeight);

    // Капичка верхней части
    ctx.fillStyle = '#006400'; // Темно-зеленый
    ctx.fillRect(this.x - 5, this.topHeight - 20, this.width + 10, 20);
    ctx.strokeRect(this.x - 5, this.topHeight - 20, this.width + 10, 20);

    // Нижняя часть препятствия с градиентом
    const bottomGradient = ctx.createLinearGradient(
      this.x,
      CANVAS_HEIGHT - this.bottomHeight,
      this.x + this.width,
      CANVAS_HEIGHT
    );
    bottomGradient.addColorStop(0, '#228B22'); // Темно-зеленый
    bottomGradient.addColorStop(1, '#32CD32'); // Светло-зеленый
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(
      this.x,
      CANVAS_HEIGHT - this.bottomHeight,
      this.width,
      this.bottomHeight
    );

    // Обводка нижней части для контраста
    ctx.strokeStyle = '#006400'; // Темно-зеленый
    ctx.lineWidth = 2;
    ctx.strokeRect(
      this.x,
      CANVAS_HEIGHT - this.bottomHeight,
      this.width,
      this.bottomHeight
    );

    // Капичка нижней части
    ctx.fillStyle = '#006400'; // Темно-зеленый
    ctx.fillRect(
      this.x - 5,
      CANVAS_HEIGHT - this.bottomHeight,
      this.width + 10,
      20
    );
    ctx.strokeRect(
      this.x - 5,
      CANVAS_HEIGHT - this.bottomHeight,
      this.width + 10,
      20
    );

    // Восстанавливаем состояние контекста
    ctx.restore();
  }

  /**
   * Возвращает границы верхней части препятствия
   * Использует кэширование для оптимизации производительности
   * @returns Объект с координатами и размерами верхней части
   */
  getTopBounds(): Bounds {
    // Возвращаем кэшированные границы, если они есть
    // Кэш работает для множественных вызовов getBounds в одном кадре
    // Кэш инвалидируется в методе update при изменении позиции
    if (this.cachedTopBounds !== null) {
      return this.cachedTopBounds;
    }

    // Вычисляем и кэшируем границы
    this.cachedTopBounds = {
      x: this.x,
      y: 0,
      width: this.width,
      height: this.topHeight,
    };

    return this.cachedTopBounds;
  }

  /**
   * Возвращает границы нижней части препятствия
   * Использует кэширование для оптимизации производительности
   * @returns Объект с координатами и размерами нижней части
   */
  getBottomBounds(): Bounds {
    // Возвращаем кэшированные границы, если они есть
    // Кэш работает для множественных вызовов getBounds в одном кадре
    // Кэш инвалидируется в методе update при изменении позиции
    if (this.cachedBottomBounds !== null) {
      return this.cachedBottomBounds;
    }

    // Вычисляем и кэшируем границы
    this.cachedBottomBounds = {
      x: this.x,
      y: CANVAS_HEIGHT - this.bottomHeight,
      width: this.width,
      height: this.bottomHeight,
    };

    return this.cachedBottomBounds;
  }

  isOffScreen(): boolean {
    return this.x + this.width < 0;
  }
}
