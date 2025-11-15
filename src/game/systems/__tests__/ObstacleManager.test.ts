import { describe, it, expect, beforeEach } from 'vitest';
import { ObstacleManager } from '../ObstacleManager';
import { CANVAS_WIDTH, OBSTACLE_SPAWN_INTERVAL } from '../../utils/constants';

describe('ObstacleManager - Генерация препятствий', () => {
  let manager: ObstacleManager;
  const deltaTime = 16; // Один кадр при 60 FPS

  beforeEach(() => {
    manager = new ObstacleManager();
  });

  describe('Генерация препятствий', () => {
    it('должна создавать препятствие при вызове spawnObstacle', () => {
      expect(manager.getObstacles().length).toBe(0);
      
      manager.spawnObstacle();
      
      expect(manager.getObstacles().length).toBe(1);
    });

    it('должна генерировать препятствия регулярно при обновлении', () => {
      // Обновляем менеджер несколько раз
      for (let i = 0; i < 10; i++) {
        manager.update(deltaTime, 1, OBSTACLE_SPAWN_INTERVAL);
      }
      
      // Должно быть создано несколько препятствий
      expect(manager.getObstacles().length).toBeGreaterThan(0);
    });

    it('должна создавать препятствия с правильным интервалом', () => {
      manager.spawnObstacle();
      const firstObstacle = manager.getObstacles()[0];
      
      manager.spawnObstacle();
      const secondObstacle = manager.getObstacles()[1];
      
      const spacing = secondObstacle.x - firstObstacle.x;
      expect(spacing).toBe(OBSTACLE_SPAWN_INTERVAL);
    });
  });

  describe('Удаление препятствий', () => {
    it('должна удалять препятствия за экраном', () => {
      // Создаем препятствие
      manager.spawnObstacle();
      const obstacle = manager.getObstacles()[0];
      
      // Перемещаем препятствие за экран
      obstacle.x = -100;
      
      // Обновляем менеджер
      manager.update(deltaTime, 1, OBSTACLE_SPAWN_INTERVAL);
      
      // Препятствие должно быть удалено
      expect(manager.getObstacles().length).toBe(0);
    });

    it('должна сохранять препятствия на экране', () => {
      manager.spawnObstacle();
      const obstacle = manager.getObstacles()[0];
      
      // Препятствие на экране
      obstacle.x = 400;
      
      manager.update(deltaTime, 1, OBSTACLE_SPAWN_INTERVAL);
      
      expect(manager.getObstacles().length).toBeGreaterThan(0);
    });
  });

  describe('Автоматическая генерация', () => {
    it('должна автоматически создавать новые препятствия', () => {
      // Обновляем менеджер много раз, чтобы препятствия прошли экран
      for (let i = 0; i < 100; i++) {
        manager.update(deltaTime, 1, OBSTACLE_SPAWN_INTERVAL);
      }
      
      // Должны быть созданы новые препятствия
      expect(manager.getObstacles().length).toBeGreaterThan(0);
    });

    it('должна использовать текущее расстояние между препятствиями', () => {
      const customSpacing = 200;
      
      // Обновляем с кастомным расстоянием
      manager.update(deltaTime, 1, customSpacing);
      manager.spawnObstacle();
      
      const obstacles = manager.getObstacles();
      if (obstacles.length >= 2) {
        const spacing = obstacles[1].x - obstacles[0].x;
        expect(spacing).toBe(customSpacing);
      }
    });
  });

  describe('Сброс состояния', () => {
    it('должна очищать все препятствия при сбросе', () => {
      manager.spawnObstacle();
      manager.spawnObstacle();
      
      expect(manager.getObstacles().length).toBe(2);
      
      manager.reset();
      
      expect(manager.getObstacles().length).toBe(0);
    });
  });
});
