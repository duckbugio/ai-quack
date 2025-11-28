import { Bounds } from '../../types/game.types';
import { Duck } from '../entities/Duck';
import { Obstacle } from '../entities/Obstacle';

export function checkCollision(rect1: Bounds, rect2: Bounds): boolean {
  if (
    rect1.width <= 0 ||
    rect1.height <= 0 ||
    rect2.width <= 0 ||
    rect2.height <= 0
  ) {
    return false;
  }

  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

export function checkDuckObstacleCollision(
  duck: Duck,
  obstacle: Obstacle
): boolean {
  if (!duck || !obstacle) {
    return false;
  }

  const duckBounds = duck.getBounds();
  const topBounds = obstacle.getTopBounds();
  const bottomBounds = obstacle.getBottomBounds();

  return (
    checkCollision(duckBounds, topBounds) ||
    checkCollision(duckBounds, bottomBounds)
  );
}

export function checkDuckBoundsCollision(
  duck: Duck,
  canvasHeight: number
): boolean {
  if (!duck || canvasHeight <= 0) {
    return false;
  }

  const bounds = duck.getBounds();
  return bounds.y < 0 || bounds.y + bounds.height > canvasHeight;
}

export function checkAllCollisions(
  duck: Duck,
  obstacles: Obstacle[],
  canvasWidth: number
): boolean {
  if (!duck || !obstacles || obstacles.length === 0 || canvasWidth <= 0) {
    return false;
  }

  const relevantObstacles = obstacles.filter(
    (obs) => obs && obs.x < canvasWidth + 50 && obs.x + obs.width > -50
  );

  for (const obstacle of relevantObstacles) {
    if (checkDuckObstacleCollision(duck, obstacle)) {
      return true;
    }
  }

  return false;
}
