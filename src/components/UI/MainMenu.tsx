import { useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { soundManager } from '../../game/utils/SoundManager';
import styles from './MainMenu.module.css';

/**
 * Компонент главного меню игры
 * Отображается когда gameState === MENU
 */
export const MainMenu: React.FC = () => {
  const { startGame, highScore, soundEnabled, setSoundEnabled } = useGame();
  
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
  
  // Обработчик переключения звуков с визуальной обратной связью
  const handleSoundToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setSoundEnabled(newValue);
    
    // Проигрываем тестовый звук при включении для обратной связи
    if (newValue && soundManager.hasSound('jump')) {
      // Небольшая задержка, чтобы звук успел включиться
      setTimeout(() => {
        soundManager.play('jump');
      }, 50);
    }
  };
  
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
      <label className={styles.soundToggle}>
        <input 
          type="checkbox" 
          checked={soundEnabled}
          onChange={handleSoundToggle}
          aria-label="Включить/выключить звуки"
        />
        <span className={styles.soundToggleLabel}>
          {soundEnabled ? '🔊' : '🔇'} Звуки
        </span>
      </label>
      <div className={styles.instructions}>
        <p>Пробел или клик - прыжок</p>
        <p>Enter - начать игру</p>
        <p>Избегайте препятствий!</p>
      </div>
    </div>
  );
};
