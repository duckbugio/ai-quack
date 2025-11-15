/**
 * Утилита для проверки совместимости браузеров
 * Определяет возможности браузера и предоставляет информацию о совместимости
 */

export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  isMobile: boolean;
  isTablet: boolean;
  os: string;
}

export interface CompatibilityReport {
  browser: BrowserInfo;
  canvasSupported: boolean;
  requestAnimationFrameSupported: boolean;
  touchEventsSupported: boolean;
  localStorageSupported: boolean;
  audioContextSupported: boolean;
  performanceApiSupported: boolean;
  memoryApiSupported: boolean;
  issues: string[];
  warnings: string[];
}

/**
 * Определяет информацию о браузере
 */
export function detectBrowser(): BrowserInfo {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform.toLowerCase();

  let name = 'Unknown';
  let version = 'Unknown';
  let engine = 'Unknown';
  const isMobile = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /tablet|ipad|playbook|silk/i.test(userAgent);
  let os = 'Unknown';

  // Определение операционной системы
  if (/win/i.test(platform)) {
    os = 'Windows';
  } else if (/mac/i.test(platform)) {
    os = 'macOS';
  } else if (/linux/i.test(platform)) {
    os = 'Linux';
  } else if (/android/i.test(userAgent)) {
    os = 'Android';
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = 'iOS';
  }

  // Определение браузера и движка
  if (/edg/i.test(userAgent)) {
    name = 'Edge';
    const match = userAgent.match(/edg\/(\d+)/i);
    version = match ? match[1] : 'Unknown';
    engine = 'Chromium';
  } else if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) {
    name = 'Chrome';
    const match = userAgent.match(/chrome\/(\d+)/i);
    version = match ? match[1] : 'Unknown';
    engine = 'Blink';
  } else if (/firefox/i.test(userAgent)) {
    name = 'Firefox';
    const match = userAgent.match(/firefox\/(\d+)/i);
    version = match ? match[1] : 'Unknown';
    engine = 'Gecko';
  } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
    name = 'Safari';
    const match = userAgent.match(/version\/(\d+)/i);
    version = match ? match[1] : 'Unknown';
    engine = 'WebKit';
  } else if (/opera|opr/i.test(userAgent)) {
    name = 'Opera';
    const match = userAgent.match(/(?:opera|opr)\/(\d+)/i);
    version = match ? match[1] : 'Unknown';
    engine = 'Blink';
  }

  return {
    name,
    version,
    engine,
    isMobile,
    isTablet,
    os,
  };
}

/**
 * Проверяет совместимость браузера с игрой
 */
export function checkCompatibility(): CompatibilityReport {
  const browser = detectBrowser();
  const issues: string[] = [];
  const warnings: string[] = [];

  // Проверка Canvas API
  const canvasSupported = !!document.createElement('canvas').getContext;
  if (!canvasSupported) {
    issues.push('Canvas API не поддерживается. Игра не может работать.');
  }

  // Проверка requestAnimationFrame
  const requestAnimationFrameSupported = !!(
    window.requestAnimationFrame || (window as any).webkitRequestAnimationFrame
  );
  if (!requestAnimationFrameSupported) {
    issues.push('requestAnimationFrame не поддерживается. Производительность может быть низкой.');
  }

  // Проверка Touch Events
  const touchEventsSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!touchEventsSupported && browser.isMobile) {
    warnings.push('Touch события не поддерживаются. Управление может быть ограничено.');
  }

  // Проверка localStorage
  let localStorageSupported = false;
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    localStorageSupported = true;
  } catch (e) {
    issues.push('localStorage не доступен. Лучшие результаты не будут сохраняться.');
  }

  // Проверка AudioContext
  const audioContextSupported = !!(
    (window as any).AudioContext ||
    (window as any).webkitAudioContext ||
    (window as any).mozAudioContext
  );
  if (!audioContextSupported) {
    warnings.push('Web Audio API не поддерживается. Звуки могут не работать.');
  }

  // Проверка Performance API
  const performanceApiSupported = !!window.performance && !!window.performance.now;
  if (!performanceApiSupported) {
    warnings.push('Performance API не поддерживается. Мониторинг производительности ограничен.');
  }

  // Проверка Memory API (только в Chrome)
  let memoryApiSupported = false;
  // @ts-ignore
  if (performance.memory) {
    memoryApiSupported = true;
  } else {
    warnings.push('Memory API не доступен (только в Chrome). Мониторинг памяти ограничен.');
  }

  // Проверка версии браузера (предупреждения для старых версий)
  const versionNum = parseInt(browser.version, 10);
  if (!isNaN(versionNum)) {
    if (browser.name === 'Chrome' && versionNum < 90) {
      warnings.push('Рекомендуется использовать Chrome 90 или новее для лучшей производительности.');
    } else if (browser.name === 'Firefox' && versionNum < 88) {
      warnings.push('Рекомендуется использовать Firefox 88 или новее для лучшей производительности.');
    } else if (browser.name === 'Safari' && versionNum < 14) {
      warnings.push('Рекомендуется использовать Safari 14 или новее для лучшей производительности.');
    } else if (browser.name === 'Edge' && versionNum < 90) {
      warnings.push('Рекомендуется использовать Edge 90 или новее для лучшей производительности.');
    }
  }

  return {
    browser,
    canvasSupported,
    requestAnimationFrameSupported,
    touchEventsSupported,
    localStorageSupported,
    audioContextSupported,
    performanceApiSupported,
    memoryApiSupported,
    issues,
    warnings,
  };
}

/**
 * Выводит отчет о совместимости в консоль
 */
export function logCompatibilityReport(): void {
  const report = checkCompatibility();
  
  console.group('🔍 Отчет о совместимости браузера');
  console.log('Браузер:', `${report.browser.name} ${report.browser.version}`);
  console.log('Движок:', report.browser.engine);
  console.log('ОС:', report.browser.os);
  console.log('Устройство:', report.browser.isMobile ? 'Мобильное' : report.browser.isTablet ? 'Планшет' : 'Десктоп');
  
  console.group('Поддержка функций:');
  console.log('Canvas API:', report.canvasSupported ? '✅' : '❌');
  console.log('requestAnimationFrame:', report.requestAnimationFrameSupported ? '✅' : '❌');
  console.log('Touch Events:', report.touchEventsSupported ? '✅' : '❌');
  console.log('localStorage:', report.localStorageSupported ? '✅' : '❌');
  console.log('Web Audio API:', report.audioContextSupported ? '✅' : '❌');
  console.log('Performance API:', report.performanceApiSupported ? '✅' : '❌');
  console.log('Memory API:', report.memoryApiSupported ? '✅' : '⚠️ (только Chrome)');
  console.groupEnd();
  
  if (report.issues.length > 0) {
    console.group('❌ Критические проблемы:');
    report.issues.forEach((issue) => console.error(issue));
    console.groupEnd();
  }
  
  if (report.warnings.length > 0) {
    console.group('⚠️ Предупреждения:');
    report.warnings.forEach((warning) => console.warn(warning));
    console.groupEnd();
  }
  
  if (report.issues.length === 0 && report.warnings.length === 0) {
    console.log('✅ Все проверки пройдены! Браузер полностью совместим.');
  }
  
  console.groupEnd();
}
