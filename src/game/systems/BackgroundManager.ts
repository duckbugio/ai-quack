import { Bird, Flower, Tree } from '../../types/game.types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_SPEED,
  PARALLAX_SPEED_MULTIPLIER,
  CLOUD_SPEED,
  TREE_SPACING_MIN,
  TREE_SPACING_VARIANCE,
  BIRD_WING_ANIMATION_INTERVAL,
  BIRD_VERTICAL_AMPLITUDE,
  BIRD_MIN_Y,
  GROUND_HEIGHT,
} from '../utils/constants';

export class BackgroundManager {
  private cloudOffset: number = 0;
  private groundOffset: number = 0;
  private treesOffset: number = 0;
  private birds: Bird[] = [];
  private trees: Tree[] = [];
  private flowers: Flower[] = [];
  private initialized: boolean = false;

  constructor(
    private width: number = CANVAS_WIDTH,
    private height: number = CANVAS_HEIGHT
  ) {}

  initialize(): void {
    if (this.initialized) return;

    this.trees = [
      { x: 150, height: 120, type: 'medium' },
      { x: 400, height: 100, type: 'small' },
      { x: 650, height: 140, type: 'large' },
      { x: 850, height: 110, type: 'medium' },
      { x: 1100, height: 130, type: 'large' },
      { x: 1350, height: 115, type: 'medium' },
      { x: 1600, height: 125, type: 'small' },
    ];

    this.birds = [
      { x: -50, y: 150, vx: 1.5, vy: Math.sin(0) * BIRD_VERTICAL_AMPLITUDE, size: 12, wingState: 'up', wingTimer: 0 },
      { x: -100, y: 200, vx: 1.2, vy: Math.sin(0.5) * BIRD_VERTICAL_AMPLITUDE, size: 10, wingState: 'down', wingTimer: 50 },
      { x: -150, y: 100, vx: 1.8, vy: Math.sin(1) * BIRD_VERTICAL_AMPLITUDE, size: 14, wingState: 'up', wingTimer: 100 },
    ];

    const groundY = this.height - GROUND_HEIGHT;
    this.flowers = [
      { x: 200, y: groundY - 15, type: 'daisy', size: 8 },
      { x: 350, y: groundY - 12, type: 'tulip', size: 10 },
      { x: 500, y: groundY - 18, type: 'sunflower', size: 12 },
      { x: 750, y: groundY - 14, type: 'daisy', size: 9 },
      { x: 950, y: groundY - 16, type: 'tulip', size: 11 },
      { x: 1200, y: groundY - 13, type: 'sunflower', size: 10 },
      { x: 1400, y: groundY - 15, type: 'daisy', size: 8 },
      { x: 1650, y: groundY - 17, type: 'tulip', size: 9 },
    ];

    this.initialized = true;
  }

  updateClouds(deltaTime: number): void {
    this.cloudOffset += CLOUD_SPEED * (deltaTime / 16);
    if (this.cloudOffset > this.width) {
      this.cloudOffset = 0;
    }
  }

  updateGround(deltaTime: number, speedMultiplier: number = 1): void {
    const currentGroundSpeed = GROUND_SPEED * speedMultiplier;
    this.groundOffset += currentGroundSpeed * (deltaTime / 16);
    if (this.groundOffset > this.width) {
      this.groundOffset = 0;
    }
  }

  updateTrees(deltaTime: number): void {
    const parallaxSpeed = GROUND_SPEED * PARALLAX_SPEED_MULTIPLIER;
    this.treesOffset += parallaxSpeed * (deltaTime / 16);

    this.trees.forEach((tree) => {
      const treeScreenX = tree.x - this.treesOffset;
      if (treeScreenX + 100 < -this.width) {
        const rightmostTree = this.trees.reduce((max, t) => {
          const screenX = t.x - this.treesOffset;
          return screenX > max ? screenX : max;
        }, -Infinity);
        tree.x = rightmostTree + TREE_SPACING_MIN + Math.random() * TREE_SPACING_VARIANCE;
      }
    });

    if (this.treesOffset > this.width * 2) {
      this.treesOffset = 0;
    }
  }

  updateBirds(deltaTime: number): void {
    const groundY = this.height - GROUND_HEIGHT;

    this.birds.forEach((bird) => {
      bird.x += bird.vx * (deltaTime / 16);
      bird.y += bird.vy * (deltaTime / 16);

      bird.wingTimer += deltaTime;
      if (bird.wingTimer > BIRD_WING_ANIMATION_INTERVAL) {
        bird.wingState = bird.wingState === 'up' ? 'down' : 'up';
        bird.wingTimer = 0;
      }

      bird.vy = Math.sin(bird.x * 0.01) * BIRD_VERTICAL_AMPLITUDE;

      if (bird.x > this.width + 50) {
        bird.x = -50;
        bird.y = 80 + Math.random() * (groundY - 200);
      }

      if (bird.y < BIRD_MIN_Y) bird.y = BIRD_MIN_Y;
      if (bird.y > groundY - 50) bird.y = groundY - 50;
    });
  }

  getCloudOffset(): number {
    return this.cloudOffset;
  }

  getGroundOffset(): number {
    return this.groundOffset;
  }

  getTreesOffset(): number {
    return this.treesOffset;
  }

  getBirds(): Bird[] {
    return this.birds;
  }

  getTrees(): Tree[] {
    return this.trees;
  }

  getFlowers(): Flower[] {
    return this.flowers;
  }

  reset(): void {
    this.cloudOffset = 0;
    this.groundOffset = 0;
    this.treesOffset = 0;
  }
}
