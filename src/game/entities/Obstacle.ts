import { Bounds } from '../../types/game.types';
import {
  PIPE_WIDTH,
  PIPE_GAP,
  OBSTACLE_SPEED,
  CANVAS_HEIGHT,
} from '../utils/constants';

export class Obstacle {
  x: number;
  topHeight: number;
  bottomHeight: number;
  width: number;
  gap: number;
  passed: boolean; // Для отслеживания прохождения уткой

  constructor(x: number, canvasHeight: number) {
    this.x = x;
    this.width = PIPE_WIDTH;
    this.gap = PIPE_GAP;

    // Случайная высота верхней части (минимум 50px, максимум 300px)
    const minHeight = 50;
    const maxHeight = canvasHeight - this.gap - minHeight;
    this.topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

    // Высота нижней части
    this.bottomHeight = canvasHeight - this.topHeight - this.gap;
    this.passed = false;
  }

  update(deltaTime: number): void {
    this.x -= OBSTACLE_SPEED * (deltaTime / 16);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Верхняя часть препятствия
    ctx.fillStyle = '#228B22'; // Зеленый цвет
    ctx.fillRect(this.x, 0, this.width, this.topHeight);

    // Нижняя часть препятствия
    ctx.fillRect(
      this.x,
      CANVAS_HEIGHT - this.bottomHeight,
      this.width,
      this.bottomHeight
    );
  }

  getTopBounds(): Bounds {
    return {
      x: this.x,
      y: 0,
      width: this.width,
      height: this.topHeight,
    };
  }

  getBottomBounds(): Bounds {
    return {
      x: this.x,
      y: CANVAS_HEIGHT - this.bottomHeight,
      width: this.width,
      height: this.bottomHeight,
    };
  }

  isOffScreen(): boolean {
    return this.x + this.width < 0;
  }
}
