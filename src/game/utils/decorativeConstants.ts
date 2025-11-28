export const CLOUD_CONFIG = {
  speed: 0.1,
  clouds: [
    { x: 200, y: 100, size: 35, opacity: 0.85 },
    { x: 500, y: 80, size: 30, opacity: 0.75 },
    { x: 700, y: 120, size: 32, opacity: 0.8 },
    { x: 350, y: 150, size: 25, opacity: 0.6 },
    { x: 600, y: 60, size: 28, opacity: 0.7 },
  ],
} as const;

export const TREE_CONFIG = {
  parallaxSpeed: 0.3,
  trees: [
    { x: 150, height: 120, type: 'medium' as const },
    { x: 400, height: 100, type: 'small' as const },
    { x: 650, height: 140, type: 'large' as const },
    { x: 850, height: 110, type: 'medium' as const },
    { x: 1100, height: 130, type: 'large' as const },
    { x: 1350, height: 115, type: 'medium' as const },
    { x: 1600, height: 125, type: 'small' as const },
  ],
} as const;

export const BIRD_CONFIG = {
  initialBirds: [
    { x: -50, y: 150, vx: 1.5, vy: Math.sin(0) * 0.3, size: 12, wingState: 'up' as const, wingTimer: 0 },
    { x: -100, y: 200, vx: 1.2, vy: Math.sin(0.5) * 0.3, size: 10, wingState: 'down' as const, wingTimer: 50 },
    { x: -150, y: 100, vx: 1.8, vy: Math.sin(1) * 0.3, size: 14, wingState: 'up' as const, wingTimer: 100 },
  ],
  wingAnimationInterval: 150,
  verticalSpeedAmplitude: 0.3,
  verticalSpeedFrequency: 0.01,
} as const;

export const FLOWER_CONFIG = {
  types: ['daisy', 'tulip', 'sunflower'] as const,
  sizes: { daisy: 8, tulip: 10, sunflower: 12 },
} as const;

export const SUN_CONFIG = {
  x: 650,
  y: 80,
  radius: 40,
  glowRadius: 60,
} as const;

export const GRASS_COLORS = ['#228B22', '#32CD32', '#2E8B57'] as const;
