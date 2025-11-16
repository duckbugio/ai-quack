import { useEffect, useMemo, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { GameState, CHARACTERS, CharacterId } from '../../types/game.types';
import { soundManager } from '../../game/utils/SoundManager';
import styles from './MainMenu.module.css';

/**
 * Компонент главного меню игры
 * Отображается когда gameState === MENU
 */
export const MainMenu: React.FC = () => {
  const { startGame, highScore, soundEnabled, setSoundEnabled, gameState, selectedCharacterId, setSelectedCharacterId } = useGame();
  const [fadeIn, setFadeIn] = useState(false);
  const characterList = useMemo(() => Object.values(CHARACTERS), []);
  
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
      {highScore > 0 && (
        <div className={styles.highScore} aria-live="polite">
          Лучший результат: <span className={styles.highScoreValue}>{highScore}</span>
        </div>
      )}
      <div className={styles.characterSection} aria-label="Выбор персонажа">
        <h2 className={styles.subtitle}>Выберите персонажа</h2>
        <div className={styles.characterGrid} role="radiogroup" aria-label="Персонажи">
          {characterList.map((ch) => (
            <label key={ch.id} className={`${styles.characterCard} ${selectedCharacterId === ch.id ? styles.characterSelected : ''}`}>
              <input
                type="radio"
                name="character"
                value={ch.id}
                checked={selectedCharacterId === ch.id}
                onChange={() => setSelectedCharacterId(ch.id as CharacterId)}
                aria-label={ch.name}
              />
              <div className={styles.characterPreview}>
                <div
                  className={styles.characterAvatar}
                  style={{
                    background: ch.bodyColor,
                    boxShadow: `0 0 0 4px ${selectedCharacterId === ch.id ? '#ffffffaa' : 'transparent'}`,
                  }}
                  aria-hidden
                />
              </div>
              <div className={styles.characterInfo}>
                <div className={styles.characterName}>{ch.name}</div>
                <div className={styles.characterDesc}>{ch.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
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
