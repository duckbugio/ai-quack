import { createContext, useContext, useState, ReactNode } from 'react';
import { GameState } from '../types/game.types';

interface GameContextType {
  gameState: GameState;
  score: number;
  highScore: number;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  gameOver: () => void;
  resetGame: () => void;
  incrementScore: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('duck-game-highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const startGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
  };
  
  const pauseGame = () => setGameState(GameState.PAUSED);
  const resumeGame = () => setGameState(GameState.PLAYING);
  
  const gameOver = () => {
    setGameState(GameState.GAME_OVER);
    if (score > highScore) {
      const newHighScore = score;
      setHighScore(newHighScore);
      localStorage.setItem('duck-game-highscore', newHighScore.toString());
    }
  };
  
  const resetGame = () => {
    setGameState(GameState.MENU);
    setScore(0);
  };
  
  const incrementScore = () => setScore(prev => prev + 1);
  
  return (
    <GameContext.Provider value={{
      gameState, score, highScore,
      startGame, pauseGame, resumeGame, gameOver, resetGame, incrementScore
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
