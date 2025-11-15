/**
 * Менеджер звуков для игры
 * Управляет загрузкой и воспроизведением звуковых эффектов
 */
export class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private volume: number = 0.5;
  private enabled: boolean = true;

  /**
   * Загружает звуковой файл
   * @param name - Имя звука для последующего использования
   * @param path - Путь к звуковому файлу
   */
  loadSound(name: string, path: string): void {
    const audio = new Audio(path);
    audio.volume = this.volume;
    audio.preload = 'auto'; // Предзагрузка звука
    
    // Обработка ошибок загрузки
    audio.addEventListener('error', () => {
      console.warn(`Не удалось загрузить звук: ${name} (${path})`);
    });
    
    this.sounds.set(name, audio);
  }

  /**
   * Воспроизводит звук
   * @param name - Имя звука для воспроизведения
   * @param allowOverlap - Разрешить одновременное воспроизведение нескольких экземпляров (по умолчанию false)
   */
  play(name: string, allowOverlap: boolean = false): void {
    if (!this.enabled) return;
    const sound = this.sounds.get(name);
    if (sound) {
      if (allowOverlap) {
        // Клонируем звук для одновременного воспроизведения
        const clonedSound = sound.cloneNode() as HTMLAudioElement;
        clonedSound.volume = this.volume;
        clonedSound.currentTime = 0;
        clonedSound.play().catch(() => {
          // Игнорируем ошибки автовоспроизведения
        });
      } else {
        // Обычное воспроизведение
        sound.currentTime = 0;
        sound.play().catch(() => {
          // Игнорируем ошибки автовоспроизведения
        });
      }
    }
  }
  
  /**
   * Проверяет, загружен ли звук
   * @param name - Имя звука для проверки
   * @returns true если звук загружен
   */
  hasSound(name: string): boolean {
    return this.sounds.has(name);
  }

  /**
   * Устанавливает громкость всех звуков
   * @param volume - Громкость от 0 до 1
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((sound) => {
      sound.volume = this.volume;
    });
  }

  /**
   * Включает или выключает звуки
   * @param enabled - true для включения, false для выключения
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Проверяет, включены ли звуки
   * @returns true если звуки включены
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Получает текущую громкость
   * @returns Текущая громкость от 0 до 1
   */
  getVolume(): number {
    return this.volume;
  }
}

// Экспорт единственного экземпляра SoundManager (singleton)
export const soundManager = new SoundManager();
