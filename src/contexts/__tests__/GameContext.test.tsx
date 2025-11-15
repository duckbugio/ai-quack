import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { GameProvider, useGame } from '../GameContext';
import { GameState } from '../../types/game.types';

// Компонент для тестирования контекста
const TestComponent = () => {
  const game = useGame();
  return (
    <div>
      <div data-testid="game-state">{game.gameState}</div>
      <div data-testid="score">{game.score}</div>
      <div data-testid="high-score">{game.highScore}</div>
      <button data-testid="start" onClick={game.startGame}>
        Start
      </button>
      <button data-testid="pause" onClick={game.pauseGame}>
        Pause
      </button>
      <button data-testid="resume" onClick={game.resumeGame}>
        Resume
      </button>
      <button data-testid="game-over" onClick={game.gameOver}>
        Game Over
      </button>
      <button data-testid="reset" onClick={game.resetGame}>
        Reset
      </button>
      <button
        data-testid="increment"
        onClick={game.incrementScore}
      >
        Increment
      </button>
    </div>
  );
};

describe('GameContext - Сохранение лучшего результата', () => {
  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    localStorage.clear();
  });

  describe('Сохранение в localStorage', () => {
    it('должна сохранять лучший результат в localStorage', () => {
      const { getByTestId } = render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Увеличиваем счет
      act(() => {
        getByTestId('increment').click();
        getByTestId('increment').click();
        getByTestId('increment').click();
      });

      // Завершаем игру
      act(() => {
        getByTestId('game-over').click();
      });

      // Проверяем, что результат сохранен в localStorage
      const savedHighScore = localStorage.getItem('duck-game-highscore');
      expect(savedHighScore).toBe('3');
    });

    it('должна обновлять лучший результат при новом рекорде', () => {
      // Устанавливаем начальный рекорд
      localStorage.setItem('duck-game-highscore', '5');

      const { getByTestId } = render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Увеличиваем счет до 10
      act(() => {
        for (let i = 0; i < 10; i++) {
          getByTestId('increment').click();
        }
      });

      // Завершаем игру
      act(() => {
        getByTestId('game-over').click();
      });

      // Проверяем, что рекорд обновлен
      const savedHighScore = localStorage.getItem('duck-game-highscore');
      expect(savedHighScore).toBe('10');
    });

    it('не должна обновлять рекорд, если новый счет меньше', () => {
      // Устанавливаем начальный рекорд
      localStorage.setItem('duck-game-highscore', '10');

      const { getByTestId } = render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Увеличиваем счет до 5
      act(() => {
        for (let i = 0; i < 5; i++) {
          getByTestId('increment').click();
        }
      });

      // Завершаем игру
      act(() => {
        getByTestId('game-over').click();
      });

      // Проверяем, что рекорд не изменился
      const savedHighScore = localStorage.getItem('duck-game-highscore');
      expect(savedHighScore).toBe('10');
    });
  });

  describe('Загрузка при старте игры', () => {
    it('должна загружать лучший результат из localStorage при инициализации', () => {
      localStorage.setItem('duck-game-highscore', '25');

      const { getByTestId } = render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(getByTestId('high-score').textContent).toBe('25');
    });

    it('должна использовать 0, если в localStorage нет значения', () => {
      localStorage.clear();

      const { getByTestId } = render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      expect(getByTestId('high-score').textContent).toBe('0');
    });

    it('должна обрабатывать невалидные значения в localStorage', () => {
      localStorage.setItem('duck-game-highscore', 'invalid');

      const { getByTestId } = render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      // Должно использовать значение по умолчанию 0
      expect(getByTestId('high-score').textContent).toBe('0');
    });
  });

  describe('Управление состоянием игры', () => {
    it('должна начинать игру', () => {
      const { getByTestId } = render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      act(() => {
        getByTestId('start').click();
      });

      expect(getByTestId('game-state').textContent).toBe(GameState.PLAYING);
      expect(getByTestId('score').textContent).toBe('0');
    });

    it('должна ставить игру на паузу', () => {
      const { getByTestId } = render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      act(() => {
        getByTestId('start').click();
        getByTestId('pause').click();
      });

      expect(getByTestId('game-state').textContent).toBe(GameState.PAUSED);
    });

    it('должна возобновлять игру', () => {
      const { getByTestId } = render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      act(() => {
        getByTestId('start').click();
        getByTestId('pause').click();
        getByTestId('resume').click();
      });

      expect(getByTestId('game-state').textContent).toBe(GameState.PLAYING);
    });

    it('должна завершать игру', () => {
      const { getByTestId } = render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      act(() => {
        getByTestId('start').click();
        getByTestId('game-over').click();
      });

      expect(getByTestId('game-state').textContent).toBe(GameState.GAME_OVER);
    });

    it('должна сбрасывать игру', () => {
      const { getByTestId } = render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      act(() => {
        getByTestId('start').click();
        getByTestId('increment').click();
        getByTestId('reset').click();
      });

      expect(getByTestId('game-state').textContent).toBe(GameState.MENU);
      expect(getByTestId('score').textContent).toBe('0');
    });
  });

  describe('Подсчет очков', () => {
    it('должна увеличивать счет', () => {
      const { getByTestId } = render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      act(() => {
        getByTestId('increment').click();
      });

      expect(getByTestId('score').textContent).toBe('1');

      act(() => {
        getByTestId('increment').click();
        getByTestId('increment').click();
      });

      expect(getByTestId('score').textContent).toBe('3');
    });

    it('должна сбрасывать счет при начале новой игры', () => {
      const { getByTestId } = render(
        <GameProvider>
          <TestComponent />
        </GameProvider>
      );

      act(() => {
        getByTestId('increment').click();
        getByTestId('increment').click();
        getByTestId('start').click();
      });

      expect(getByTestId('score').textContent).toBe('0');
    });
  });
});
