import { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { GameState } from '../../types/game.types';
import { soundManager } from '../../game/utils/SoundManager';
import styles from './MainMenu.module.css';

/**
 * Компонент главного меню игры
 * Отображается когда gameState === MENU
 */
export const MainMenu: React.FC = () => {
  const { startGame, highScore, soundEnabled, setSoundEnabled, gameState, selectedCharacter, setSelectedCharacter } = useGame();
  const [fadeIn, setFadeIn] = useState(false);
  
  // Fade-in эффект при появлении меню
  useEffect(() => {
    if (gameState === GameState.MENU) {
      setFadeIn(false);
      // Небольшая задержка для плавного появления
      const timer = setTimeout(() => setFadeIn(true), 10);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

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
    <div 
      className={`${styles.menu} ${fadeIn ? styles.fadeIn : ''}`} 
      role="dialog" 
      aria-label="Главное меню игры"
    >
      <h1 className={styles.title}>🦆 Утка</h1>
      <div className={styles.characterSelect} role="group" aria-label="Выбор персонажа">
        <button
          type="button"
          className={`${styles.characterOption} ${selectedCharacter === 'classic' ? styles.selected : ''}`}
          onClick={() => setSelectedCharacter('classic')}
          aria-pressed={selectedCharacter === 'classic'}
        >
          <span className={styles.characterSwatch} style={{ background: 'linear-gradient(135deg,#FFA500,#FF8C00)' }} />
          Классика
        </button>
        <button
          type="button"
          className={`${styles.characterOption} ${selectedCharacter === 'orange' ? styles.selected : ''}`}
          onClick={() => setSelectedCharacter('orange')}
          aria-pressed={selectedCharacter === 'orange'}
        >
          <span className={styles.characterSwatch} style={{ background: 'linear-gradient(135deg,#FFB347,#FF8C00)' }} />
          Оранжевая
        </button>
        <button
          type="button"
          className={`${styles.characterOption} ${selectedCharacter === 'blue' ? styles.selected : ''}`}
          onClick={() => setSelectedCharacter('blue')}
          aria-pressed={selectedCharacter === 'blue'}
        >
          <span className={styles.characterSwatch} style={{ background: 'linear-gradient(135deg,#1E90FF,#00BFFF)' }} />
          Синяя
        </button>
        <button
          type="button"
          className={`${styles.characterOption} ${selectedCharacter === 'green' ? styles.selected : ''}`}
          onClick={() => setSelectedCharacter('green')}
          aria-pressed={selectedCharacter === 'green'}
        >
          <span className={styles.characterSwatch} style={{ background: 'linear-gradient(135deg,#32CD32,#228B22)' }} />
          Зелёная
        </button>
        <button
          type="button"
          className={`${styles.characterOption} ${selectedCharacter === 'red' ? styles.selected : ''}`}
          onClick={() => setSelectedCharacter('red')}
          aria-pressed={selectedCharacter === 'red'}
        >
          <span className={styles.characterSwatch} style={{ background: 'linear-gradient(135deg,#FF4D4F,#DC143C)' }} />
          Красная
        </button>
      </div>
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
