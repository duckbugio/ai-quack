import { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import styles from './GameOverMenu.module.css';

/**
 * Компонент меню окончания игры
 * Отображается когда gameState === GAME_OVER
 */
export const GameOverMenu: React.FC = () => {
  const { score, highScore, startGame, resetGame } = useGame();
  const isNewRecord = score === highScore && score > 0;
  const [fadeIn, setFadeIn] = useState(false);
  
  // Fade-in эффект при появлении меню
  useEffect(() => {
    setFadeIn(false);
    const timer = setTimeout(() => setFadeIn(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Обработка клавиши Enter для начала новой игры
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
    <>
      <div className={`${styles.overlay} ${fadeIn ? styles.fadeIn : ''}`} />
      <div className={`${styles.menu} ${fadeIn ? styles.fadeIn : ''}`} role="dialog" aria-label="Экран окончания игры">
        <h2 className={styles.title}>Игра окончена!</h2>
        <div className={styles.score} aria-live="polite">
          Ваш счет: <span className={styles.scoreValue}>{score}</span>
        </div>
        {isNewRecord && (
          <div className={styles.newRecord} aria-live="polite" role="status">
            🎉 Новый рекорд! 🎉
          </div>
        )}
        <div className={styles.highScore}>
          Лучший результат: <span className={styles.highScoreValue}>{highScore}</span>
        </div>
        {!isNewRecord && score > 0 && highScore > score && (
          <div className={styles.scoreDifference} aria-live="polite">
            До рекорда: <span>{highScore - score}</span>
          </div>
        )}
        <button 
          className={styles.button}
          onClick={startGame}
          aria-label="Играть снова"
          autoFocus
        >
          Играть снова
        </button>
        <button 
          className={styles.button}
          onClick={resetGame}
          aria-label="Вернуться в главное меню"
        >
          В главное меню
        </button>
        <div className={styles.instructions}>
          <p>Enter - играть снова</p>
        </div>
      </div>
    </>
  );
};
