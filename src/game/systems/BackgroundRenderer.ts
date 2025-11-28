import { Bird, Flower, Tree } from '../../types/decorative.types';
import {
  CLOUD_CONFIG,
  TREE_CONFIG,
  BIRD_CONFIG,
  SUN_CONFIG,
  GRASS_COLORS,
} from '../utils/decorativeConstants';
import { GROUND_SPEED } from '../utils/constants';

export class BackgroundRenderer {
  private cloudOffset: number = 0;
  private groundOffset: number = 0;
  private treesOffset: number = 0;
  private birds: Bird[] = [];
  private trees: Tree[] = [];
  private flowers: Flower[] = [];
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initializeDecorativeElements();
  }

  private initializeDecorativeElements(): void {
    this.trees = [...TREE_CONFIG.trees];
    this.birds = BIRD_CONFIG.initialBirds.map(bird => ({ ...bird }));
    const groundY = this.height - 50;
    this.flowers = [
      { x: 200, y: groundY - 15, type: 'daisy', size: 8 },
      { x: 350, y: groundY - 12, type: 'tulip', size: 10 },
      { x: 500, y: groundY - 18, type: 'sunflower', size: 12 },
      { x: 750, y: groundY - 14, type: 'daisy', size: 9 },
      { x: 950, y: groundY - 16, type: 'tulip', size: 11 },
      { x: 1200, y: groundY - 13, type: 'sunflower', size: 10 },
      { x: 1400, y: groundY - 15, type: 'daisy', size: 8 },
      { x: 1650, y: groundY - 17, type: 'tulip', size: 9 },
    ];
  }

  updateClouds(deltaTime: number): void {
    this.cloudOffset += CLOUD_CONFIG.speed * (deltaTime / 16);
    if (this.cloudOffset > this.width) {
      this.cloudOffset = 0;
    }
  }

  updateGround(deltaTime: number, speedMultiplier: number = 1): void {
    const currentGroundSpeed = GROUND_SPEED * speedMultiplier;
    this.groundOffset += currentGroundSpeed * (deltaTime / 16);
    if (this.groundOffset > this.width) {
      this.groundOffset = 0;
    }
  }

  updateTrees(deltaTime: number): void {
    const parallaxSpeed = GROUND_SPEED * TREE_CONFIG.parallaxSpeed;
    this.treesOffset += parallaxSpeed * (deltaTime / 16);

    this.trees.forEach((tree) => {
      const treeScreenX = tree.x - this.treesOffset;
      if (treeScreenX + 100 < -this.width) {
        const rightmostTree = this.trees.reduce((max, t) => {
          const screenX = t.x - this.treesOffset;
          return screenX > max ? screenX : max;
        }, -Infinity);
        tree.x = rightmostTree + 250 + Math.random() * 100;
      }
    });

    if (this.treesOffset > this.width * 2) {
      this.treesOffset = 0;
    }
  }

  updateBirds(deltaTime: number): void {
    const groundY = this.height - 50;

    this.birds.forEach((bird) => {
      bird.x += bird.vx * (deltaTime / 16);
      bird.y += bird.vy * (deltaTime / 16);

      bird.wingTimer += deltaTime;
      if (bird.wingTimer > BIRD_CONFIG.wingAnimationInterval) {
        bird.wingState = bird.wingState === 'up' ? 'down' : 'up';
        bird.wingTimer = 0;
      }

      bird.vy = Math.sin(bird.x * BIRD_CONFIG.verticalSpeedFrequency) * BIRD_CONFIG.verticalSpeedAmplitude;

      if (bird.x > this.width + 50) {
        bird.x = -50;
        bird.y = 80 + Math.random() * (groundY - 200);
      }

      if (bird.y < 50) bird.y = 50;
      if (bird.y > groundY - 50) bird.y = groundY - 50;
    });
  }

  drawSky(ctx: CanvasRenderingContext2D): void {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    const sunX = this.width - 150;
    const sunY = SUN_CONFIG.y;
    const sunRadius = SUN_CONFIG.radius;

    const sunGradient = ctx.createRadialGradient(
      sunX, sunY, 0,
      sunX, sunY, SUN_CONFIG.glowRadius
    );
    sunGradient.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
    sunGradient.addColorStop(0.7, 'rgba(255, 255, 150, 0.3)');
    sunGradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(sunX, sunY, SUN_CONFIG.glowRadius, 0, Math.PI * 2);
    ctx.fill();

    const sunMainGradient = ctx.createRadialGradient(
      sunX, sunY, 0,
      sunX, sunY, sunRadius
    );
    sunMainGradient.addColorStop(0, '#FFEB3B');
    sunMainGradient.addColorStop(1, '#FFC107');
    ctx.fillStyle = sunMainGradient;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  drawClouds(ctx: CanvasRenderingContext2D): void {
    const offset = this.cloudOffset;
    const margin = 100;

    const drawSingleCloud = (
      x: number,
      y: number,
      size: number,
      opacity: number = 0.8
    ) => {
      if (x + size < -margin || x - size > this.width + margin) {
        return;
      }

      ctx.save();

      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      const cloudGradient = ctx.createLinearGradient(x - size, y, x + size, y);
      cloudGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.9})`);
      cloudGradient.addColorStop(0.5, `rgba(255, 255, 255, ${opacity})`);
      cloudGradient.addColorStop(1, `rgba(255, 255, 255, ${opacity * 0.9})`);
      ctx.fillStyle = cloudGradient;

      ctx.beginPath();
      const r1 = size * 0.8;
      const r2 = size;
      const r3 = size * 0.9;
      ctx.arc(x - size * 0.3, y, r1, 0, Math.PI * 2);
      ctx.arc(x, y, r2, 0, Math.PI * 2);
      ctx.arc(x + size * 0.3, y, r3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    CLOUD_CONFIG.clouds.forEach(cloud => {
      drawSingleCloud(cloud.x + offset, cloud.y, cloud.size, cloud.opacity);
      drawSingleCloud(cloud.x + offset - this.width, cloud.y, cloud.size, cloud.opacity);
    });
  }

  drawTrees(ctx: CanvasRenderingContext2D): void {
    const groundY = this.height - 50;
    const offset = this.treesOffset;
    const margin = 100;

    const visibleTrees = this.trees.filter((tree) => {
      const treeScreenX = tree.x - offset;
      return treeScreenX + 100 > -margin && treeScreenX < this.width + margin;
    });

    visibleTrees.forEach((tree) => {
      const treeX = tree.x - offset;
      const treeBaseY = groundY;
      const treeHeight = tree.height;
      const treeTopY = treeBaseY - treeHeight;

      let trunkWidth: number;
      let crownSize: number;

      switch (tree.type) {
        case 'small':
          trunkWidth = 8;
          crownSize = 25;
          break;
        case 'medium':
          trunkWidth = 12;
          crownSize = 35;
          break;
        case 'large':
          trunkWidth = 16;
          crownSize = 45;
          break;
      }

      ctx.save();

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(
        treeX + trunkWidth / 2,
        treeBaseY + 5,
        crownSize * 0.6,
        8,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      const trunkGradient = ctx.createLinearGradient(
        treeX,
        treeTopY + crownSize,
        treeX + trunkWidth,
        treeBaseY
      );
      trunkGradient.addColorStop(0, '#8B4513');
      trunkGradient.addColorStop(1, '#654321');
      ctx.fillStyle = trunkGradient;
      ctx.fillRect(
        treeX,
        treeTopY + crownSize,
        trunkWidth,
        treeHeight - crownSize
      );

      const crownY = treeTopY + crownSize * 0.3;

      const crownGradient1 = ctx.createRadialGradient(
        treeX + trunkWidth / 2,
        crownY,
        0,
        treeX + trunkWidth / 2,
        crownY,
        crownSize
      );
      crownGradient1.addColorStop(0, '#228B22');
      crownGradient1.addColorStop(0.7, '#32CD32');
      crownGradient1.addColorStop(1, '#228B22');
      ctx.fillStyle = crownGradient1;
      ctx.beginPath();
      ctx.arc(
        treeX + trunkWidth / 2,
        crownY,
        crownSize,
        0,
        Math.PI * 2
      );
      ctx.fill();

      const crownGradient2 = ctx.createRadialGradient(
        treeX + trunkWidth / 2,
        crownY - crownSize * 0.2,
        0,
        treeX + trunkWidth / 2,
        crownY - crownSize * 0.2,
        crownSize * 0.7
      );
      crownGradient2.addColorStop(0, '#90EE90');
      crownGradient2.addColorStop(1, '#32CD32');
      ctx.fillStyle = crownGradient2;
      ctx.beginPath();
      ctx.arc(
        treeX + trunkWidth / 2,
        crownY - crownSize * 0.2,
        crownSize * 0.7,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.restore();
    });
  }

  drawFlowers(ctx: CanvasRenderingContext2D): void {
    const groundY = this.height - 50;
    const offset = this.groundOffset;
    const margin = 50;

    const visibleFlowers = this.flowers.filter((flower) => {
      const flowerScreenX = (flower.x - offset) % (this.width + 100);
      return flowerScreenX > -margin && flowerScreenX < this.width + margin;
    });

    visibleFlowers.forEach((flower) => {
      const flowerX = ((flower.x - offset) % (this.width + 100) + this.width + 100) % (this.width + 100);
      const flowerY = flower.y;
      const size = flower.size;

      ctx.save();

      switch (flower.type) {
        case 'daisy': {
          ctx.fillStyle = '#FFFFFF';
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const petalX = flowerX + Math.cos(angle) * size * 0.6;
            const petalY = flowerY + Math.sin(angle) * size * 0.6;
            ctx.beginPath();
            ctx.ellipse(petalX, petalY, size * 0.3, size * 0.5, angle, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(flowerX, flowerY, size * 0.3, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'tulip': {
          ctx.fillStyle = '#228B22';
          ctx.beginPath();
          ctx.ellipse(flowerX - size * 0.4, flowerY + size * 0.3, size * 0.2, size * 0.6, -0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(flowerX + size * 0.4, flowerY + size * 0.3, size * 0.2, size * 0.6, 0.3, 0, Math.PI * 2);
          ctx.fill();
          const tulipGradient = ctx.createLinearGradient(flowerX, flowerY - size, flowerX, flowerY);
          tulipGradient.addColorStop(0, '#FF1493');
          tulipGradient.addColorStop(1, '#DC143C');
          ctx.fillStyle = tulipGradient;
          ctx.beginPath();
          ctx.ellipse(flowerX, flowerY - size * 0.2, size * 0.4, size * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'sunflower': {
          ctx.fillStyle = '#FFD700';
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const petalX = flowerX + Math.cos(angle) * size * 0.7;
            const petalY = flowerY + Math.sin(angle) * size * 0.7;
            ctx.beginPath();
            ctx.ellipse(petalX, petalY, size * 0.25, size * 0.6, angle, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#8B4513';
          ctx.beginPath();
          ctx.arc(flowerX, flowerY, size * 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#654321';
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const dotX = flowerX + Math.cos(angle) * size * 0.2;
            const dotY = flowerY + Math.sin(angle) * size * 0.2;
            ctx.beginPath();
            ctx.arc(dotX, dotY, size * 0.08, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
      }

      ctx.restore();
    });
  }

  drawBirds(ctx: CanvasRenderingContext2D): void {
    const margin = 50;

    const visibleBirds = this.birds.filter((bird) => {
      return bird.x > -margin && bird.x < this.width + margin;
    });

    visibleBirds.forEach((bird) => {
      const birdX = bird.x;
      const birdY = bird.y;
      const size = bird.size;

      const angle = Math.atan2(bird.vy, bird.vx);
      const wingOffset = bird.wingState === 'up' ? -size * 0.3 : size * 0.3;

      ctx.save();
      ctx.translate(birdX, birdY);
      ctx.rotate(angle);

      ctx.fillStyle = '#4A4A4A';
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#6B6B6B';
      ctx.beginPath();
      ctx.ellipse(
        -size * 0.2,
        wingOffset,
        size * 0.5,
        size * 0.3,
        -0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(
        -size * 0.2,
        -wingOffset,
        size * 0.5,
        size * 0.3,
        0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.fillStyle = '#4A4A4A';
      ctx.beginPath();
      ctx.arc(size * 0.4, 0, size * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(size * 0.45, -size * 0.1, size * 0.08, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(size * 0.47, -size * 0.1, size * 0.05, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FF8C00';
      ctx.beginPath();
      ctx.moveTo(size * 0.55, 0);
      ctx.lineTo(size * 0.7, -size * 0.1);
      ctx.lineTo(size * 0.7, size * 0.1);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });
  }

  drawGrassTexture(ctx: CanvasRenderingContext2D, groundY: number): void {
    ctx.save();

    const offset = this.groundOffset;
    for (let i = -offset; i < this.width + 20; i += 10) {
      const x = (i + offset) % (this.width + 20);
      const colorIndex = Math.floor((x / 10) % GRASS_COLORS.length);
      const height = 8 + Math.sin(x * 0.1) * 3;

      ctx.strokeStyle = GRASS_COLORS[colorIndex];
      ctx.lineWidth = 1.5 + Math.abs(Math.sin(x * 0.15)) * 0.5;

      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x + 4 + Math.sin(x * 0.2) * 2, groundY - height);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawGround(ctx: CanvasRenderingContext2D): void {
    const groundHeight = 50;
    const groundY = this.height - groundHeight;

    const grassGradient = ctx.createLinearGradient(0, groundY, 0, groundY + 30);
    grassGradient.addColorStop(0, '#90EE90');
    grassGradient.addColorStop(0.5, '#7CCD7C');
    grassGradient.addColorStop(1, '#6B8E6B');
    ctx.fillStyle = grassGradient;
    ctx.fillRect(0, groundY, this.width, 30);

    const earthGradient = ctx.createLinearGradient(0, groundY + 30, 0, this.height);
    earthGradient.addColorStop(0, '#8B4513');
    earthGradient.addColorStop(1, '#654321');
    ctx.fillStyle = earthGradient;
    ctx.fillRect(0, groundY + 30, this.width, 20);

    this.drawGrassTexture(ctx, groundY);

    ctx.save();
    ctx.fillStyle = '#696969';
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 3; i++) {
      const stoneX = (this.groundOffset + i * 250) % (this.width + 50);
      const stoneY = groundY + 25;
      ctx.beginPath();
      ctx.arc(stoneX, stoneY, 3 + Math.sin(stoneX) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  reset(): void {
    this.cloudOffset = 0;
    this.groundOffset = 0;
    this.treesOffset = 0;
    this.initializeDecorativeElements();
  }
}
