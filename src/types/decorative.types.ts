export interface Bird {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  wingState: 'up' | 'down';
  wingTimer: number;
}

export interface Flower {
  x: number;
  y: number;
  type: 'daisy' | 'tulip' | 'sunflower';
  size: number;
}

export interface Tree {
  x: number;
  height: number;
  type: 'small' | 'medium' | 'large';
}
