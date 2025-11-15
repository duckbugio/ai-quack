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
  private currentSpacing: number = OBSTACLE_SPAWN_INTERVAL;

  /**
   * Создает новое препятствие и добавляет его в массив
   */
  spawnObstacle(): void {
    const obstacle = new Obstacle(this.lastSpawnX, CANVAS_HEIGHT);
    this.obstacles.push(obstacle);
    this.lastSpawnX += this.currentSpacing;
  }

  /**
   * Обновляет состояние всех препятствий
   * @param deltaTime - Время, прошедшее с последнего кадра
   * @param speedMultiplier - Множитель скорости препятствий (для прогрессивной сложности)
   * @param spacing - Текущее расстояние между препятствиями (для прогрессивной сложности)
   */
  update(
    deltaTime: number,
    speedMultiplier: number = 1,
    spacing: number = OBSTACLE_SPAWN_INTERVAL
  ): void {
    // Обновляем текущее расстояние между препятствиями
    this.currentSpacing = spacing;

    // Обновление всех препятствий с учетом множителя скорости
    this.obstacles.forEach((obstacle) =>
      obstacle.update(deltaTime, speedMultiplier)
    );

    // Удаление препятствий за экраном
    this.obstacles = this.obstacles.filter(
      (obstacle) => !obstacle.isOffScreen()
    );

    // Автоматическая генерация новых препятствий
    const lastObstacle = this.obstacles[this.obstacles.length - 1];
    if (!lastObstacle || lastObstacle.x < CANVAS_WIDTH - this.currentSpacing) {
      this.spawnObstacle();
    }
  }

  /**
   * Отрисовывает все препятствия на canvas
   * Оптимизированная версия - отрисовывает только видимые препятствия
   * Добавлен небольшой запас для плавной отрисовки при движении
   * @param ctx - Контекст canvas для отрисовки
   */
  draw(ctx: CanvasRenderingContext2D): void {
    // Отрисовываем только препятствия в зоне видимости (оптимизация)
    // Добавляем небольшой запас (50px) для плавной отрисовки при движении
    const margin = 50;
    const visibleObstacles = this.obstacles.filter(
      (obs) => obs.x + obs.width > -margin && obs.x < CANVAS_WIDTH + margin
    );
    visibleObstacles.forEach((obstacle) => obstacle.draw(ctx));
  }

  /**
   * Сбрасывает состояние менеджера препятствий
   */
  reset(): void {
    this.obstacles = [];
    this.lastSpawnX = CANVAS_WIDTH;
    this.currentSpacing = OBSTACLE_SPAWN_INTERVAL;
  }

  /**
   * Возвращает массив всех препятствий
   * @returns Массив препятствий
   */
  getObstacles(): Obstacle[] {
    return this.obstacles;
  }
}
