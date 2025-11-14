import { Obstacle } from '../entities/Obstacle';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  OBSTACLE_SPAWN_INTERVAL,
} from '../utils/constants';

export class ObstacleManager {
  obstacles: Obstacle[] = [];
  private lastSpawnX: number = CANVAS_WIDTH;

  spawnObstacle(): void {
    const obstacle = new Obstacle(this.lastSpawnX, CANVAS_HEIGHT);
    this.obstacles.push(obstacle);
    this.lastSpawnX += OBSTACLE_SPAWN_INTERVAL;
  }

  update(deltaTime: number): void {
    // Обновление всех препятствий
    this.obstacles.forEach((obstacle) => obstacle.update(deltaTime));

    // Удаление препятствий за экраном
    this.obstacles = this.obstacles.filter(
      (obstacle) => !obstacle.isOffScreen()
    );

    // Автоматическая генерация новых препятствий
    const lastObstacle = this.obstacles[this.obstacles.length - 1];
    if (
      !lastObstacle ||
      lastObstacle.x < CANVAS_WIDTH - OBSTACLE_SPAWN_INTERVAL
    ) {
      this.spawnObstacle();
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.obstacles.forEach((obstacle) => obstacle.draw(ctx));
  }

  reset(): void {
    this.obstacles = [];
    this.lastSpawnX = CANVAS_WIDTH;
  }

  getObstacles(): Obstacle[] {
    return this.obstacles;
  }
}
