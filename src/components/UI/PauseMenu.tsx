import { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import styles from './PauseMenu.module.css';

/**
 * Компонент меню паузы
 * Отображается когда gameState === PAUSED
 */
export const PauseMenu: React.FC = () => {
  const { resumeGame, resetGame, score } = useGame();
  const [fadeIn, setFadeIn] = useState(false);
  
  // Fade-in эффект при появлении меню
  useEffect(() => {
    setFadeIn(false);
    const timer = setTimeout(() => setFadeIn(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Обработка клавиши Escape для возобновления игры
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        resumeGame();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [resumeGame]);
  
  return (
    <>
      <div className={`${styles.overlay} ${fadeIn ? styles.fadeIn : ''}`} />
      <div className={`${styles.menu} ${fadeIn ? styles.fadeIn : ''}`} role="dialog" aria-label="Меню паузы">
        <h2 className={styles.title}>Пауза</h2>
        {score > 0 && (
          <div className={styles.score} aria-live="polite">
            Текущий счет: <span className={styles.scoreValue}>{score}</span>
          </div>
        )}
        <button 
          className={styles.button}
          onClick={resumeGame}
          aria-label="Продолжить игру"
          autoFocus
        >
          Продолжить
        </button>
        <button 
          className={styles.button}
          onClick={resetGame}
          aria-label="Вернуться в главное меню"
        >
          В главное меню
        </button>
        <div className={styles.instructions}>
          <p>Escape - продолжить игру</p>
        </div>
      </div>
    </>
  );
};
