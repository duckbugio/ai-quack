import { useEffect, useRef } from 'react';

interface UseGameLoopOptions {
  update: (deltaTime: number) => void;
  render: () => void;
  isRunning: boolean;
}

export const useGameLoop = ({ update, render, isRunning }: UseGameLoopOptions) => {
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  useEffect(() => {
    if (!isRunning) return;
    
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;
    let accumulatedTime = 0;
    
    const gameLoop = (currentTime: number) => {
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
      
      // Продолжить цикл
      frameRef.current = requestAnimationFrame(gameLoop);
    };
    
    frameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      lastTimeRef.current = 0;
    };
  }, [update, render, isRunning]);
};
