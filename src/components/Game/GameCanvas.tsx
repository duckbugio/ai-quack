import React, { useRef, useEffect, useCallback } from 'react';
import { useGame } from '../../contexts/GameContext';
import { GameState } from '../../types/game.types';
import { useKeyboard } from '../../hooks/useKeyboard';
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
    
    // Здесь будет игровая логика
  }, [width, height]);
  
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
