/**
 * Система мониторинга производительности игры
 * Отслеживает FPS, использование памяти и другие метрики производительности
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number; // Время отрисовки кадра в миллисекундах
  memoryUsage?: number; // Использование памяти в MB (если доступно)
  memoryLimit?: number; // Лимит памяти в MB (если доступно)
  droppedFrames: number; // Количество пропущенных кадров
  averageFPS: number; // Средний FPS за последние 60 кадров
}

/**
 * Класс для мониторинга производительности игры
 */
export class PerformanceMonitor {
  private frameCount: number = 0;
  private lastTime: number = performance.now();
  private fpsHistory: number[] = [];
  private readonly historySize: number = 60; // Храним последние 60 кадров
  private frameTimes: number[] = [];
  private droppedFrames: number = 0;
  private lastFrameTime: number = performance.now();
  private enabled: boolean = false;
  private metricsCallback?: (metrics: PerformanceMetrics) => void;

  /**
   * Включает мониторинг производительности
   */
  enable(callback?: (metrics: PerformanceMetrics) => void): void {
    this.enabled = true;
    this.metricsCallback = callback;
    this.reset();
  }

  /**
   * Выключает мониторинг производительности
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Сбрасывает все метрики
   */
  reset(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsHistory = [];
    this.frameTimes = [];
    this.droppedFrames = 0;
    this.lastFrameTime = performance.now();
  }

  /**
   * Обновляет метрики производительности (вызывать каждый кадр)
   */
  update(): PerformanceMetrics | null {
    if (!this.enabled) {
      return null;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    const frameTime = currentTime - this.lastFrameTime;

    // Обновляем счетчик кадров
    this.frameCount++;

    // Вычисляем FPS
    const fps = deltaTime > 0 ? 1000 / deltaTime : 0;

    // Сохраняем FPS в историю
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > this.historySize) {
      this.fpsHistory.shift();
    }

    // Сохраняем время кадра
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.historySize) {
      this.frameTimes.shift();
    }

    // Проверяем пропущенные кадры (если время кадра больше 20ms, значит пропущен кадр при 60 FPS)
    if (frameTime > 20) {
      const missedFrames = Math.floor((frameTime - 16.67) / 16.67);
      this.droppedFrames += missedFrames;
    }

    // Вычисляем средний FPS
    const averageFPS =
      this.fpsHistory.length > 0
        ? this.fpsHistory.reduce((sum, f) => sum + f, 0) / this.fpsHistory.length
        : 0;

    // Вычисляем среднее время кадра
    const avgFrameTime =
      this.frameTimes.length > 0
        ? this.frameTimes.reduce((sum, t) => sum + t, 0) / this.frameTimes.length
        : 0;

    // Получаем информацию о памяти (если доступно)
    let memoryUsage: number | undefined;
    let memoryLimit: number | undefined;

    // @ts-ignore - performance.memory доступно только в Chrome
    if (performance.memory) {
      // @ts-ignore
      memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
      // @ts-ignore
      memoryLimit = performance.memory.jsHeapSizeLimit / 1024 / 1024; // MB
    }

    const metrics: PerformanceMetrics = {
      fps: Math.round(fps),
      frameTime: Math.round(avgFrameTime * 100) / 100,
      memoryUsage,
      memoryLimit,
      droppedFrames: this.droppedFrames,
      averageFPS: Math.round(averageFPS),
    };

    // Вызываем callback, если он установлен
    if (this.metricsCallback) {
      this.metricsCallback(metrics);
    }

    this.lastTime = currentTime;
    this.lastFrameTime = currentTime;

    return metrics;
  }

  /**
   * Получает текущие метрики без обновления
   */
  getMetrics(): PerformanceMetrics {
    const averageFPS =
      this.fpsHistory.length > 0
        ? this.fpsHistory.reduce((sum, f) => sum + f, 0) / this.fpsHistory.length
        : 0;

    const avgFrameTime =
      this.frameTimes.length > 0
        ? this.frameTimes.reduce((sum, t) => sum + t, 0) / this.frameTimes.length
        : 0;

    let memoryUsage: number | undefined;
    let memoryLimit: number | undefined;

    // @ts-ignore - performance.memory доступно только в Chrome
    if (performance.memory) {
      // @ts-ignore
      memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
      // @ts-ignore
      memoryLimit = performance.memory.jsHeapSizeLimit / 1024 / 1024; // MB
    }

    return {
      fps: this.fpsHistory[this.fpsHistory.length - 1] || 0,
      frameTime: Math.round(avgFrameTime * 100) / 100,
      memoryUsage,
      memoryLimit,
      droppedFrames: this.droppedFrames,
      averageFPS: Math.round(averageFPS),
    };
  }

  /**
   * Проверяет, включен ли мониторинг
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

/**
 * Глобальный экземпляр монитора производительности
 */
export const performanceMonitor = new PerformanceMonitor();
