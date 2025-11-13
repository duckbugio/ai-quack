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
  private wingState: 'up' | 'down' = 'up';
  private wingAnimationTimer: number = 0;

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

    // Анимация крыльев
    this.wingAnimationTimer += deltaTime;
    if (this.wingAnimationTimer > 100) {
      // Каждые 100ms
      this.wingState = this.wingState === 'up' ? 'down' : 'up';
      this.wingAnimationTimer = 0;
    }
  }

  jump(): void {
    this.velocity.vy = JUMP_FORCE;
    this.wingState = this.wingState === 'up' ? 'down' : 'up';
  }

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

    // Крылья
    const wingOffset = this.wingState === 'up' ? -5 : 5;
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(
      this.position.x + 5,
      this.position.y + 10 + wingOffset,
      15,
      8
    );

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
    this.wingState = 'up';
    this.wingAnimationTimer = 0;
  }
}
