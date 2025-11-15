/**
 * Скрипт для генерации простых звуковых эффектов программно
 * Использует Node.js для создания WAV файлов
 * 
 * Запуск: node generate-sounds.js
 * 
 * Примечание: Скрипт создает WAV файлы. Для использования в браузере
 * рекомендуется конвертировать их в MP3 (см. README.md)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Создает WAV файл из массива сэмплов
 */
function createWavFile(samples, sampleRate, filename) {
  const numChannels = 1; // Моно
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = samples.length * 2;
  const fileSize = 36 + dataSize;

  const buffer = Buffer.alloc(44 + dataSize);

  // WAV заголовок
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Размер fmt chunk
  buffer.writeUInt16LE(1, 20); // Audio format (PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Запись сэмплов
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(sample * 32767), 44 + i * 2);
  }

  const filePath = path.join(__dirname, filename);
  
  try {
    // Проверка существования файла
    if (fs.existsSync(filePath)) {
      console.log(`⚠ Файл ${filename} уже существует, перезаписываем...`);
    }
    
    fs.writeFileSync(filePath, buffer);
    const fileSize = (buffer.length / 1024).toFixed(2);
    console.log(`✓ Создан файл: ${filename} (${fileSize} KB)`);
  } catch (error) {
    console.error(`✗ Ошибка при создании файла ${filename}:`, error.message);
    throw error;
  }
}

/**
 * Генерирует звук прыжка (короткий высокий звук)
 */
function generateJumpSound() {
  const sampleRate = 44100;
  const duration = 0.15; // 150ms
  const frequency = 800; // Гц
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    // Быстро затухающий синусоидальный сигнал с небольшой модуляцией
    const envelope = Math.exp(-t * 15); // Быстрое затухание
    const wave = Math.sin(2 * Math.PI * frequency * t);
    const modulation = Math.sin(2 * Math.PI * frequency * 1.5 * t) * 0.3;
    samples.push((wave + modulation) * envelope * 0.5);
  }

  createWavFile(samples, sampleRate, 'jump.wav');
}

/**
 * Генерирует звук столкновения (резкий низкий звук)
 */
function generateHitSound() {
  const sampleRate = 44100;
  const duration = 0.3; // 300ms
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    // Низкочастотный шум с быстрым затуханием
    const envelope = Math.exp(-t * 8);
    const noise = (Math.random() * 2 - 1) * 0.5;
    const lowFreq = Math.sin(2 * Math.PI * 150 * t) * 0.5;
    samples.push((noise + lowFreq) * envelope * 0.6);
  }

  createWavFile(samples, sampleRate, 'hit.wav');
}

/**
 * Генерирует звук набора очков (приятный короткий звук)
 */
function generateScoreSound() {
  const sampleRate = 44100;
  const duration = 0.2; // 200ms
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    // Две ноты с плавным переходом
    const envelope = Math.exp(-t * 5);
    const note1 = Math.sin(2 * Math.PI * 523.25 * t); // C5
    const note2 = Math.sin(2 * Math.PI * 659.25 * t); // E5
    const transition = t < duration / 2 ? note1 : note2;
    samples.push(transition * envelope * 0.4);
  }

  createWavFile(samples, sampleRate, 'score.wav');
}

// Генерация всех звуков
console.log('Генерация звуковых эффектов...\n');

try {
  generateJumpSound();
  generateHitSound();
  generateScoreSound();
  
  console.log('\n✓ Все звуки успешно созданы!');
  console.log('\n📝 Примечания:');
  console.log('1. Для лучшего качества рекомендуется заменить эти файлы');
  console.log('   на профессиональные звуки из бесплатных ресурсов (см. README.md)');
  console.log('2. Для использования в браузере рекомендуется конвертировать WAV в MP3');
  console.log('   Используйте: ffmpeg -i jump.wav jump.mp3 (или онлайн-конвертеры)');
  console.log('3. Звуки созданы в формате WAV для максимального качества');
} catch (error) {
  console.error('\n✗ Ошибка при генерации звуков:', error.message);
  process.exit(1);
}
