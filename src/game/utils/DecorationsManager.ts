import { Bird, Flower, Tree } from '../../types/game.types';

export class DecorationsManager {
  private birds: Bird[] = [];
  private trees: Tree[] = [];
  private flowers: Flower[] = [];
  private initialized: boolean = false;

  initialize(width: number, height: number): void {
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
      { x: -50, y: 150, vx: 1.5, vy: Math.sin(0) * 0.3, size: 12, wingState: 'up', wingTimer: 0 },
      { x: -100, y: 200, vx: 1.2, vy: Math.sin(0.5) * 0.3, size: 10, wingState: 'down', wingTimer: 50 },
      { x: -150, y: 100, vx: 1.8, vy: Math.sin(1) * 0.3, size: 14, wingState: 'up', wingTimer: 100 },
    ];

    const groundY = height - 50;
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

  updateBirds(deltaTime: number, width: number, height: number): void {
    const groundY = height - 50;

    this.birds.forEach((bird) => {
      bird.x += bird.vx * (deltaTime / 16);
      bird.y += bird.vy * (deltaTime / 16);

      bird.wingTimer += deltaTime;
      if (bird.wingTimer > 150) {
        bird.wingState = bird.wingState === 'up' ? 'down' : 'up';
        bird.wingTimer = 0;
      }

      bird.vy = Math.sin(bird.x * 0.01) * 0.3;

      if (bird.x > width + 50) {
        bird.x = -50;
        bird.y = 80 + Math.random() * (groundY - 200);
      }

      if (bird.y < 50) bird.y = 50;
      if (bird.y > groundY - 50) bird.y = groundY - 50;
    });
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
    this.birds = [];
    this.trees = [];
    this.flowers = [];
    this.initialized = false;
  }
}
