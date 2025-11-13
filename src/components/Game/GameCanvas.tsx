import React, { useRef, useEffect } from 'react';
import styles from './GameCanvas.module.css';

interface GameCanvasProps {
  width?: number;
  height?: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  width = 800, 
  height = 600 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
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
  
  return <canvas ref={canvasRef} className={styles.canvas} />;
};
