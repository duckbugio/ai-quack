import { useEffect, useRef } from 'react';

/**
 * Опции для игрового цикла
 */
interface UseGameLoopOptions {
  update: (deltaTime: number) => void;
  render: () => void;
  isRunning: boolean;
}

/**
 * Хук для создания игрового цикла на основе requestAnimationFrame
 * Обеспечивает стабильный FPS и правильную обработку времени между кадрами
 * Оптимизирован для предотвращения утечек памяти
 */
export const useGameLoop = ({ update, render, isRunning }: UseGameLoopOptions) => {
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const isRunningRef = useRef(isRunning);
  
  // Обновляем ref при изменении isRunning для немедленной остановки цикла
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);
  
  useEffect(() => {
    if (!isRunning) {
      // Останавливаем цикл, если он был запущен
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }
      lastTimeRef.current = 0;
      return;
    }
    
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;
    let accumulatedTime = 0;
    
    const gameLoop = (currentTime: number) => {
      // Проверяем актуальное состояние через ref для немедленной остановки
      if (!isRunningRef.current) {
        return;
      }
      
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }
      
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      // Ограничение FPS
      accumulatedTime += deltaTime;
      
      if (accumulatedTime >= frameInterval) {
        // Обновление состояния игры
        update(frameInterval);
        
        // Отрисовка
        render();
        
        accumulatedTime -= frameInterval;
      }
      
      // Продолжить цикл только если игра все еще запущена
      if (isRunningRef.current) {
        frameRef.current = requestAnimationFrame(gameLoop);
      }
    };
    
    frameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (frameRef.current !== undefined) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = undefined;
      }
      lastTimeRef.current = 0;
    };
  }, [update, render, isRunning]);
};
