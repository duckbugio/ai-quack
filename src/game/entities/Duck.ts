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

export class Duck {
  position: Position;
  velocity: Velocity;
  width: number;
  height: number;

  constructor() {
    this.position = { x: DUCK_START_X, y: DUCK_START_Y };
    this.velocity = { vx: 0, vy: 0 };
    this.width = DUCK_WIDTH;
    this.height = DUCK_HEIGHT;
  }

  update(deltaTime: number): void {
    // Применение гравитации
    this.velocity.vy += GRAVITY * (deltaTime / 16); // Нормализация к 60 FPS

    // Ограничение максимальной скорости падения
    if (this.velocity.vy > MAX_FALL_SPEED) {
      this.velocity.vy = MAX_FALL_SPEED;
    }

    // Обновление позиции
    this.position.y += this.velocity.vy * (deltaTime / 16);
  }

  jump(): void {
    this.velocity.vy = JUMP_FORCE;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#FFA500'; // Оранжевый цвет для утки
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    // Простой глаз
    ctx.fillStyle = '#000';
    ctx.fillRect(this.position.x + 25, this.position.y + 8, 5, 5);
  }

  getBounds(): Bounds {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }

  reset(): void {
    this.position = { x: DUCK_START_X, y: DUCK_START_Y };
    this.velocity = { vx: 0, vy: 0 };
  }
}
