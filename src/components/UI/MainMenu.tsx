import { useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import styles from './MainMenu.module.css';

/**
 * Компонент главного меню игры
 * Отображается когда gameState === MENU
 */
export const MainMenu: React.FC = () => {
  const { startGame, highScore } = useGame();
  
  // Обработка клавиши Enter для начала игры
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        startGame();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [startGame]);
  
  return (
    <div className={styles.menu} role="dialog" aria-label="Главное меню игры">
      <h1 className={styles.title}>🦆 Утка</h1>
      {highScore > 0 && (
        <div className={styles.highScore} aria-live="polite">
          Лучший результат: <span className={styles.highScoreValue}>{highScore}</span>
        </div>
      )}
      <button 
        className={styles.startButton} 
        onClick={startGame}
        aria-label="Начать игру"
        autoFocus
      >
        Начать игру
      </button>
      <div className={styles.instructions}>
        <p>Пробел или клик - прыжок</p>
        <p>Enter - начать игру</p>
        <p>Избегайте препятствий!</p>
      </div>
    </div>
  );
};
