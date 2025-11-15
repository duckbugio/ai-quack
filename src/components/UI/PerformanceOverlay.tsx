import React, { useEffect, useState } from 'react';
import { performanceMonitor, PerformanceMetrics } from '../../game/utils/PerformanceMonitor';
import styles from './PerformanceOverlay.module.css';

interface PerformanceOverlayProps {
  enabled?: boolean;
}

/**
 * Компонент для отображения метрик производительности
 * Показывает FPS, время кадра, использование памяти и другую информацию
 */
export const PerformanceOverlay: React.FC<PerformanceOverlayProps> = ({
  enabled = false,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      performanceMonitor.disable();
      setVisible(false);
      return;
    }

    // Включаем мониторинг с callback для обновления состояния
    performanceMonitor.enable((currentMetrics) => {
      setMetrics(currentMetrics);
    });

    setVisible(true);

    // Обновляем метрики каждый кадр через requestAnimationFrame
    let animationFrameId: number;
    const updateMetrics = () => {
      performanceMonitor.update();
      animationFrameId = requestAnimationFrame(updateMetrics);
    };
    animationFrameId = requestAnimationFrame(updateMetrics);

    return () => {
      cancelAnimationFrame(animationFrameId);
      performanceMonitor.disable();
    };
  }, [enabled]);

  if (!visible || !metrics) {
    return null;
  }

  // Определяем цвет FPS в зависимости от значения
  const getFPSColor = (fps: number): string => {
    if (fps >= 55) return '#4CAF50'; // Зеленый - отлично
    if (fps >= 45) return '#FFC107'; // Желтый - хорошо
    if (fps >= 30) return '#FF9800'; // Оранжевый - приемлемо
    return '#F44336'; // Красный - плохо
  };

  // Определяем цвет времени кадра
  const getFrameTimeColor = (frameTime: number): string => {
    if (frameTime <= 16.67) return '#4CAF50'; // Зеленый - 60 FPS
    if (frameTime <= 33.33) return '#FFC107'; // Желтый - 30 FPS
    if (frameTime <= 50) return '#FF9800'; // Оранжевый - 20 FPS
    return '#F44336'; // Красный - < 20 FPS
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.label}>FPS:</span>
          <span
            className={styles.value}
            style={{ color: getFPSColor(metrics.fps) }}
          >
            {metrics.fps}
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>Avg FPS:</span>
          <span
            className={styles.value}
            style={{ color: getFPSColor(metrics.averageFPS) }}
          >
            {metrics.averageFPS}
          </span>
        </div>
        <div className={styles.metric}>
          <span className={styles.label}>Frame Time:</span>
          <span
            className={styles.value}
            style={{ color: getFrameTimeColor(metrics.frameTime) }}
          >
            {metrics.frameTime.toFixed(2)}ms
          </span>
        </div>
        {metrics.memoryUsage !== undefined && (
          <div className={styles.metric}>
            <span className={styles.label}>Memory:</span>
            <span className={styles.value}>
              {metrics.memoryUsage.toFixed(1)} MB
              {metrics.memoryLimit && ` / ${metrics.memoryLimit.toFixed(1)} MB`}
            </span>
          </div>
        )}
        {metrics.droppedFrames > 0 && (
          <div className={styles.metric}>
            <span className={styles.label}>Dropped:</span>
            <span className={styles.value} style={{ color: '#F44336' }}>
              {metrics.droppedFrames}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
