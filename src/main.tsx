import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GameProvider } from './contexts/GameContext'
import { soundManager } from './game/utils/SoundManager'
import { logCompatibilityReport } from './game/utils/BrowserCompatibility'

// Загрузка звуков при инициализации приложения
// Используем import.meta.env.BASE_URL для поддержки деплоя в подпапки (например, GitHub Pages)
// BASE_URL всегда заканчивается на '/', поэтому просто конкатенируем пути
const getSoundPath = (filename: string): string => {
  return `${import.meta.env.BASE_URL}sounds/${filename}`;
};

// Конфигурация звуков для загрузки
const soundsToLoad: Array<{ name: string; filename: string }> = [
  { name: 'jump', filename: 'jump.mp3' },
  { name: 'hit', filename: 'hit.mp3' },
  { name: 'score', filename: 'score.mp3' },
];

// Загружаем все звуки
soundsToLoad.forEach(({ name, filename }) => {
  soundManager.loadSound(name, getSoundPath(filename));
});

// Проверка совместимости браузера (только в dev режиме или если включен флаг)
if (import.meta.env.DEV || localStorage.getItem('duck-game-show-compatibility') === 'true') {
  logCompatibilityReport();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>,
)
