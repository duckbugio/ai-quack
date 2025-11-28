import { Duck } from '../entities/Duck';
import { Obstacle } from '../entities/Obstacle';

export function checkObstaclePassed(
  duck: Duck,
  obstacle: Obstacle
): boolean {
  if (!duck || !obstacle || obstacle.passed) {
    return false;
  }
  
  if (duck.position.x > obstacle.x + obstacle.width) {
    obstacle.passed = true;
    return true;
  }
  return false;
}

export function getDifficultyMultiplier(score: number): number {
  const safeScore = Math.max(0, score);
  const multiplier = 1 + Math.floor(safeScore / 10) * 0.05;
  return Math.min(multiplier, 2.5);
}

export function getCurrentSpacing(score: number, baseSpacing: number): number {
  const safeScore = Math.max(0, score);
  const spacingMultiplier = Math.max(
    1 - Math.floor(safeScore / 20) * 0.02,
    0.7
  );
  return baseSpacing * spacingMultiplier;
}

export function checkAllObstaclesPassed(
  duck: Duck,
  obstacles: Obstacle[],
  canvasWidth: number
): number {
  if (!duck || !obstacles || obstacles.length === 0) {
    return 0;
  }
  
  const relevantObstacles = obstacles.filter(
    (obs) =>
      obs &&
      !obs.passed &&
      obs.x + obs.width >= duck.position.x - 100 &&
      obs.x <= duck.position.x + duck.width + 50
  );

  let passedCount = 0;
  relevantObstacles.forEach((obstacle) => {
    if (checkObstaclePassed(duck, obstacle)) {
      passedCount++;
    }
  });
  return passedCount;
}
