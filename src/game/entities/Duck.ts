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

  update(deltaTime: number, canvasHeight: number): boolean {
    this.velocity.vy += GRAVITY * (deltaTime / 16);

    if (this.velocity.vy > MAX_FALL_SPEED) {
      this.velocity.vy = MAX_FALL_SPEED;
    }

    this.position.y += this.velocity.vy * (deltaTime / 16);

    if (this.position.y < 0) {
      this.position.y = 0;
      this.cachedBounds = null;
      return true;
    }

    if (this.position.y + this.height > canvasHeight) {
      this.position.y = canvasHeight - this.height;
      this.cachedBounds = null;
      return true;
    }

    if (this.position.x !== this.lastPositionX || this.position.y !== this.lastPositionY) {
      this.cachedBounds = null;
      this.lastPositionX = this.position.x;
      this.lastPositionY = this.position.y;
    }

    this.wingAnimationTimer += deltaTime;
    if (this.wingAnimationTimer > 100) {
      this.wingState = this.wingState === 'up' ? 'down' : 'up';
      this.wingAnimationTimer = 0;
    }

    return false;
  }

  jump(): void {
    this.velocity.vy = JUMP_FORCE;
    this.wingState = this.wingState === 'up' ? 'down' : 'up';
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const rotation = Math.min(Math.max(this.velocity.vy * 3, -30), 30);
    const rotationRad = (rotation * Math.PI) / 180;

    const centerX = this.position.x + this.width / 2;
    const centerY = this.position.y + this.height / 2;

    ctx.save();

    ctx.translate(centerX, centerY);
    ctx.rotate(rotationRad);

    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.ellipse(
      0,
      0,
      this.width / 2,
      this.height / 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(
      this.width / 2 - 10,
      -3,
      8,
      6
    );

    const wingOffset = this.wingState === 'up' ? -5 : 5;
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(
      -this.width / 2 + 5,
      -5 + wingOffset,
      15,
      8
    );

    ctx.fillStyle = '#000';
    ctx.fillRect(
      this.width / 2 - 15,
      -7,
      5,
      5
    );

    ctx.restore();
  }

  getBounds(): Bounds {
    if (this.cachedBounds !== null) {
      return this.cachedBounds;
    }

    this.cachedBounds = {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };

    return this.cachedBounds;
  }

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
