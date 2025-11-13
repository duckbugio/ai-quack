import { GameProvider } from './contexts/GameContext';
import './App.css';

function App() {
  return (
    <GameProvider>
      <div>
        <h1>Duck Game</h1>
      </div>
    </GameProvider>
  );
}

export default App;
