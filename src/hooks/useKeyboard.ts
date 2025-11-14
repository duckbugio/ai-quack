import { useEffect } from 'react';

/**
 * Хук для обработки нажатий клавиш клавиатуры
 * Поддерживает пробел и стрелку вверх для прыжка
 * @param onKeyPress - Callback функция, вызываемая при нажатии клавиши
 */
export const useKeyboard = (onKeyPress: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.key === 'ArrowUp') {
        event.preventDefault();
        onKeyPress();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress]);
};
