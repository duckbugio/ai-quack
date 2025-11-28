import { Obstacle } from '../entities/Obstacle';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  OBSTACLE_SPAWN_INTERVAL,
} from '../utils/constants';

export class ObstacleManager {
  obstacles: Obstacle[] = [];
  private lastSpawnX: number = CANVAS_WIDTH;
  private currentSpacing: number = OBSTACLE_SPAWN_INTERVAL;

  spawnObstacle(): void {
    const obstacle = new Obstacle(this.lastSpawnX, CANVAS_HEIGHT);
    this.obstacles.push(obstacle);
    this.lastSpawnX += this.currentSpacing;
  }

  update(
    deltaTime: number,
    speedMultiplier: number = 1,
    spacing: number = OBSTACLE_SPAWN_INTERVAL
  ): void {
    this.currentSpacing = spacing;

    this.obstacles.forEach((obstacle) =>
      obstacle.update(deltaTime, speedMultiplier)
    );

    this.obstacles = this.obstacles.filter(
      (obstacle) => !obstacle.isOffScreen()
    );

    const lastObstacle = this.obstacles[this.obstacles.length - 1];
    if (!lastObstacle || lastObstacle.x < CANVAS_WIDTH - this.currentSpacing) {
      this.spawnObstacle();
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const margin = 50;
    const visibleObstacles = this.obstacles.filter(
      (obs) => obs.x + obs.width > -margin && obs.x < CANVAS_WIDTH + margin
    );
    visibleObstacles.forEach((obstacle) => obstacle.draw(ctx));
  }

  reset(): void {
    this.obstacles = [];
    this.lastSpawnX = CANVAS_WIDTH;
    this.currentSpacing = OBSTACLE_SPAWN_INTERVAL;
  }

  getObstacles(): Obstacle[] {
    return this.obstacles;
  }
}
