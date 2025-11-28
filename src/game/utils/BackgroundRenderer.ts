import { DecorativeElements } from '../systems/DecorativeElements';

interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  decorativeElements: DecorativeElements;
}

export function drawSky(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(1, '#E0F6FF');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const sunX = width - 150;
  const sunY = 80;
  const sunRadius = 40;

  const sunGradient = ctx.createRadialGradient(
    sunX, sunY, 0,
    sunX, sunY, sunRadius * 1.5
  );
  sunGradient.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
  sunGradient.addColorStop(0.7, 'rgba(255, 255, 150, 0.3)');
  sunGradient.addColorStop(1, 'rgba(255, 255, 100, 0)');
  ctx.fillStyle = sunGradient;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius * 1.5, 0, Math.PI * 2);
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

export function drawClouds(ctx: CanvasRenderingContext2D, width: number, cloudOffset: number): void {
  const margin = 100;

  const drawSingleCloud = (
    x: number,
    y: number,
    size: number,
    opacity: number = 0.8
  ) => {
    if (x + size < -margin || x - size > width + margin) {
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

  drawSingleCloud(200 + cloudOffset, 100, 35, 0.85);
  drawSingleCloud(500 + cloudOffset, 80, 30, 0.75);
  drawSingleCloud(700 + cloudOffset, 120, 32, 0.8);
  drawSingleCloud(350 + cloudOffset, 150, 25, 0.6);
  drawSingleCloud(600 + cloudOffset, 60, 28, 0.7);

  drawSingleCloud(200 + cloudOffset - width, 100, 35, 0.85);
  drawSingleCloud(500 + cloudOffset - width, 80, 30, 0.75);
  drawSingleCloud(700 + cloudOffset - width, 120, 32, 0.8);
  drawSingleCloud(350 + cloudOffset - width, 150, 25, 0.6);
  drawSingleCloud(600 + cloudOffset - width, 60, 28, 0.7);
}

function drawGrassTexture(ctx: CanvasRenderingContext2D, groundY: number, offset: number, width: number): void {
  ctx.save();

  const grassColors = ['#228B22', '#32CD32', '#2E8B57'];

  for (let i = -offset; i < width + 20; i += 10) {
    const x = (i + offset) % (width + 20);
    const colorIndex = Math.floor((x / 10) % grassColors.length);
    const height = 8 + Math.sin(x * 0.1) * 3;

    ctx.strokeStyle = grassColors[colorIndex];
    ctx.lineWidth = 1.5 + Math.abs(Math.sin(x * 0.15)) * 0.5;

    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x + 4 + Math.sin(x * 0.2) * 2, groundY - height);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawGround(ctx: CanvasRenderingContext2D, width: number, height: number, groundOffset: number): void {
  const groundHeight = 50;
  const groundY = height - groundHeight;

  const grassGradient = ctx.createLinearGradient(0, groundY, 0, groundY + 30);
  grassGradient.addColorStop(0, '#90EE90');
  grassGradient.addColorStop(0.5, '#7CCD7C');
  grassGradient.addColorStop(1, '#6B8E6B');
  ctx.fillStyle = grassGradient;
  ctx.fillRect(0, groundY, width, 30);

  const earthGradient = ctx.createLinearGradient(0, groundY + 30, 0, height);
  earthGradient.addColorStop(0, '#8B4513');
  earthGradient.addColorStop(1, '#654321');
  ctx.fillStyle = earthGradient;
  ctx.fillRect(0, groundY + 30, width, 20);

  drawGrassTexture(ctx, groundY, groundOffset, width);

  ctx.save();
  ctx.fillStyle = '#696969';
  ctx.globalAlpha = 0.3;
  for (let i = 0; i < 3; i++) {
    const stoneX = (groundOffset + i * 250) % (width + 50);
    const stoneY = groundY + 25;
    ctx.beginPath();
    ctx.arc(stoneX, stoneY, 3 + Math.sin(stoneX) * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawTrees(ctx: CanvasRenderingContext2D, width: number, height: number, trees: any[], treesOffset: number): void {
  const groundY = height - 50;
  const margin = 100;
  const visibleTrees = trees.filter((tree) => {
    const treeScreenX = tree.x - treesOffset;
    return treeScreenX + 100 > -margin && treeScreenX < width + margin;
  });

  visibleTrees.forEach((tree) => {
    const treeX = tree.x - treesOffset;
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

export function drawFlowers(ctx: CanvasRenderingContext2D, width: number, height: number, flowers: any[], groundOffset: number): void {
  const groundY = height - 50;
  const margin = 50;
  const visibleFlowers = flowers.filter((flower) => {
    const flowerScreenX = (flower.x - groundOffset) % (width + 100);
    return flowerScreenX > -margin && flowerScreenX < width + margin;
  });

  visibleFlowers.forEach((flower) => {
    const flowerX = ((flower.x - groundOffset) % (width + 100) + width + 100) % (width + 100);
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

export function drawBirds(ctx: CanvasRenderingContext2D, width: number, birds: any[]): void {
  const margin = 50;
  const visibleBirds = birds.filter((bird) => {
    return bird.x > -margin && bird.x < width + margin;
  });

  visibleBirds.forEach((bird) => {
    ctx.save();

    const birdX = bird.x;
    const birdY = bird.y;
    const size = bird.size;

    const angle = Math.atan2(bird.vy, bird.vx);
    const wingOffset = bird.wingState === 'up' ? -size * 0.3 : size * 0.3;

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
