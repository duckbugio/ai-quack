import { GameProvider } from './contexts/GameContext';
import { GameCanvas } from './components/Game/GameCanvas';
import './App.css';

/**
 * Главный компонент приложения
 */
function App() {
  return (
    <GameProvider>
      <div className="app-container">
        <h1>Duck Game</h1>
        <GameCanvas />
      </div>
    </GameProvider>
  );
}

export default App;
