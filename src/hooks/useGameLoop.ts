import { useEffect, useRef } from 'react';

interface UseGameLoopOptions {
  update: (deltaTime: number) => void;
  render: () => void;
  isRunning: boolean;
}

export const useGameLoop = ({ update, render, isRunning }: UseGameLoopOptions) => {
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const isRunningRef = useRef(isRunning);
  
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);
  
  useEffect(() => {
    if (!isRunning) {
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
      if (!isRunningRef.current) {
        return;
      }
      
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }
      
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      accumulatedTime += deltaTime;
      
      if (accumulatedTime >= frameInterval) {
        update(frameInterval);
        render();
        accumulatedTime -= frameInterval;
      }
      
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
