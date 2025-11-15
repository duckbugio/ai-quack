import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GameProvider } from './contexts/GameContext'
import { soundManager } from './game/utils/SoundManager'

// Загрузка звуков при инициализации приложения
soundManager.loadSound('jump', '/sounds/jump.mp3');
soundManager.loadSound('hit', '/sounds/hit.mp3');
soundManager.loadSound('score', '/sounds/score.mp3');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>,
)
