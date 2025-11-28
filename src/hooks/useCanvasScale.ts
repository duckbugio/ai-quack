import { useEffect, useCallback, RefObject } from 'react';

interface UseCanvasScaleOptions {
  canvasRef: RefObject<HTMLCanvasElement>;
  width: number;
  height: number;
}

export const useCanvasScale = ({ canvasRef, width, height }: UseCanvasScaleOptions): void => {
  const scaleCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const isMobile = window.innerWidth < 768;

    const containerWidth = container.clientWidth;
    const containerHeight = isMobile
      ? window.innerHeight - 20
      : window.innerHeight - 100;

    if (width <= 0 || height <= 0 || containerWidth <= 0 || containerHeight <= 0) {
      return;
    }

    const scaleX = containerWidth / width;
    const scaleY = containerHeight / height;

    const scale = Math.max(0.01, Math.min(scaleX, scaleY, isMobile ? Infinity : 1));

    canvas.style.width = `${width * scale}px`;
    canvas.style.height = `${height * scale}px`;
  }, [canvasRef, width, height]);

  useEffect(() => {
    scaleCanvas();

    let resizeTimeoutId: number | undefined;
    const handleResize = () => {
      if (resizeTimeoutId) {
        clearTimeout(resizeTimeoutId);
      }
      resizeTimeoutId = window.setTimeout(() => {
        scaleCanvas();
      }, 150);
    };

    const handleOrientationChange = () => {
      setTimeout(scaleCanvas, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      if (resizeTimeoutId) {
        clearTimeout(resizeTimeoutId);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [scaleCanvas]);
};
