import { Bird, Flower, Tree } from '../../types/game.types';

export class DecorativeElementsManager {
  private birds: Bird[] = [];
  private trees: Tree[] = [];
  private flowers: Flower[] = [];
  private cloudOffset: number = 0;
  private groundOffset: number = 0;
  private treesOffset: number = 0;

  constructor(
    private canvasWidth: number,
    private canvasHeight: number
  ) {
    this.initializeTrees();
    this.initializeBirds();
    this.initializeFlowers();
  }

  private initializeTrees(): void {
    this.trees = [
      { x: 150, height: 120, type: 'medium' },
      { x: 400, height: 100, type: 'small' },
      { x: 650, height: 140, type: 'large' },
      { x: 850, height: 110, type: 'medium' },
      { x: 1100, height: 130, type: 'large' },
      { x: 1350, height: 115, type: 'medium' },
      { x: 1600, height: 125, type: 'small' },
    ];
  }

  private initializeBirds(): void {
    this.birds = [
      { x: -50, y: 150, vx: 1.5, vy: Math.sin(0) * 0.3, size: 12, wingState: 'up', wingTimer: 0 },
      { x: -100, y: 200, vx: 1.2, vy: Math.sin(0.5) * 0.3, size: 10, wingState: 'down', wingTimer: 50 },
      { x: -150, y: 100, vx: 1.8, vy: Math.sin(1) * 0.3, size: 14, wingState: 'up', wingTimer: 100 },
    ];
  }

  private initializeFlowers(): void {
    const groundY = this.canvasHeight - 50;
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
  }

  updateClouds(deltaTime: number): void {
    this.cloudOffset += 0.1 * (deltaTime / 16);
    if (this.cloudOffset > this.canvasWidth) {
      this.cloudOffset = 0;
    }
  }

  updateGround(deltaTime: number, speedMultiplier: number = 1): void {
    const GROUND_SPEED = 3;
    const currentGroundSpeed = GROUND_SPEED * speedMultiplier;
    this.groundOffset += currentGroundSpeed * (deltaTime / 16);
    if (this.groundOffset > this.canvasWidth) {
      this.groundOffset = 0;
    }
  }

  updateTrees(deltaTime: number): void {
    const GROUND_SPEED = 3;
    const parallaxSpeed = GROUND_SPEED * 0.3;
    this.treesOffset += parallaxSpeed * (deltaTime / 16);

    this.trees.forEach((tree) => {
      const treeScreenX = tree.x - this.treesOffset;
      if (treeScreenX + 100 < -this.canvasWidth) {
        const rightmostTree = this.trees.reduce((max, t) => {
          const screenX = t.x - this.treesOffset;
          return screenX > max ? screenX : max;
        }, -Infinity);
        tree.x = rightmostTree + 250 + Math.random() * 100;
      }
    });

    if (this.treesOffset > this.canvasWidth * 2) {
      this.treesOffset = 0;
    }
  }

  updateBirds(deltaTime: number): void {
    const groundY = this.canvasHeight - 50;

    this.birds.forEach((bird) => {
      bird.x += bird.vx * (deltaTime / 16);
      bird.y += bird.vy * (deltaTime / 16);

      bird.wingTimer += deltaTime;
      if (bird.wingTimer > 150) {
        bird.wingState = bird.wingState === 'up' ? 'down' : 'up';
        bird.wingTimer = 0;
      }

      bird.vy = Math.sin(bird.x * 0.01) * 0.3;

      if (bird.x > this.canvasWidth + 50) {
        bird.x = -50;
        bird.y = 80 + Math.random() * (groundY - 200);
      }

      if (bird.y < 50) bird.y = 50;
      if (bird.y > groundY - 50) bird.y = groundY - 50;
    });
  }

  update(deltaTime: number, speedMultiplier: number = 1): void {
    this.updateClouds(deltaTime);
    this.updateGround(deltaTime, speedMultiplier);
    this.updateTrees(deltaTime);
    this.updateBirds(deltaTime);
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
    this.initializeTrees();
    this.initializeBirds();
    this.initializeFlowers();
  }
}
