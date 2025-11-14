import React, { useRef, useEffect, useCallback } from 'react';
import { useGame } from '../../contexts/GameContext';
import { GameState } from '../../types/game.types';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useGameLoop } from '../../hooks/useGameLoop';
import { ObstacleManager } from '../../game/systems/ObstacleManager';
import styles from './GameCanvas.module.css';

interface GameCanvasProps {
  width?: number;
  height?: number;
  onJump?: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  width = 800, 
  height = 600,
  onJump
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, startGame } = useGame();
  const obstacleManagerRef = useRef<ObstacleManager | null>(null);
  
  // Инициализация ObstacleManager
  if (!obstacleManagerRef.current) {
    obstacleManagerRef.current = new ObstacleManager();
  }
  
  const handleJump = useCallback(() => {
    if (gameState === GameState.PLAYING && onJump) {
      onJump();
    }
  }, [gameState, onJump]);
  
  const handleCanvasClick = useCallback(() => {
    if (gameState === GameState.PLAYING && onJump) {
      onJump();
    } else if (gameState === GameState.MENU) {
      startGame();
    }
  }, [gameState, onJump, startGame]);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (gameState === GameState.PLAYING && onJump) {
      onJump();
    } else if (gameState === GameState.MENU) {
      startGame();
    }
  }, [gameState, onJump, startGame]);
  
  useKeyboard(handleJump);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Настройка размеров canvas
    canvas.width = width;
    canvas.height = height;
    
    // Очистка canvas
    ctx.clearRect(0, 0, width, height);
  }, [width, height]);

  // Игровой цикл с ObstacleManager
  const update = useCallback(
    (deltaTime: number) => {
      if (gameState !== GameState.PLAYING || !obstacleManagerRef.current) return;
      obstacleManagerRef.current.update(deltaTime);
    },
    [gameState]
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очистка canvas
    ctx.clearRect(0, 0, width, height);

    // Отрисовка препятствий
    if (gameState === GameState.PLAYING && obstacleManagerRef.current) {
      obstacleManagerRef.current.draw(ctx);
    }
  }, [gameState, width, height]);

  useGameLoop({
    update,
    render,
    isRunning: gameState === GameState.PLAYING,
  });

  // Сброс ObstacleManager при перезапуске игры
  useEffect(() => {
    if (gameState === GameState.MENU && obstacleManagerRef.current) {
      obstacleManagerRef.current.reset();
    }
  }, [gameState]);
  
  useEffect(() => {
    const handleResize = () => {
      // Логика адаптации размеров
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Можно добавить логику масштабирования при необходимости
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={styles.canvas}
      onClick={handleCanvasClick}
      onTouchStart={handleTouchStart}
    />
  );
};
