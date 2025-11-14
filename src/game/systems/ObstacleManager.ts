import { Obstacle } from '../entities/Obstacle';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  OBSTACLE_SPAWN_INTERVAL,
} from '../utils/constants';

/**
 * Класс для управления препятствиями в игре
 * Отвечает за генерацию, обновление и отрисовку препятствий
 */
export class ObstacleManager {
  obstacles: Obstacle[] = [];
  private lastSpawnX: number = CANVAS_WIDTH;

  /**
   * Создает новое препятствие и добавляет его в массив
   */
  spawnObstacle(): void {
    const obstacle = new Obstacle(this.lastSpawnX, CANVAS_HEIGHT);
    this.obstacles.push(obstacle);
    this.lastSpawnX += OBSTACLE_SPAWN_INTERVAL;
  }

  /**
   * Обновляет состояние всех препятствий
   * @param deltaTime - Время, прошедшее с последнего кадра
   */
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

  /**
   * Отрисовывает все препятствия на canvas
   * Оптимизированная версия - отрисовывает только видимые препятствия
   * @param ctx - Контекст canvas для отрисовки
   */
  draw(ctx: CanvasRenderingContext2D): void {
    // Отрисовываем только препятствия в зоне видимости (оптимизация)
    const visibleObstacles = this.obstacles.filter(
      (obs) => obs.x + obs.width > 0 && obs.x < CANVAS_WIDTH
    );
    visibleObstacles.forEach((obstacle) => obstacle.draw(ctx));
  }

  /**
   * Сбрасывает состояние менеджера препятствий
   */
  reset(): void {
    this.obstacles = [];
    this.lastSpawnX = CANVAS_WIDTH;
  }

  /**
   * Возвращает массив всех препятствий
   * @returns Массив препятствий
   */
  getObstacles(): Obstacle[] {
    return this.obstacles;
  }
}
