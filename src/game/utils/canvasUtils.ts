/**
 * Utility functions for canvas operations
 */

export interface ShadowConfig {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export function applyShadow(ctx: CanvasRenderingContext2D, config: ShadowConfig): void {
  ctx.shadowColor = config.color;
  ctx.shadowBlur = config.blur;
  ctx.shadowOffsetX = config.offsetX;
  ctx.shadowOffsetY = config.offsetY;
}

export function clearShadow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

export function drawTextWithShadow(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    font?: string;
    fillStyle?: string;
    strokeStyle?: string;
    lineWidth?: number;
    textAlign?: CanvasTextAlign;
    textBaseline?: CanvasTextBaseline;
    shadow?: ShadowConfig;
  } = {}
): void {
  ctx.save();
  
  if (options.font) ctx.font = options.font;
  if (options.fillStyle) ctx.fillStyle = options.fillStyle;
  if (options.strokeStyle) ctx.strokeStyle = options.strokeStyle;
  if (options.lineWidth !== undefined) ctx.lineWidth = options.lineWidth;
  if (options.textAlign) ctx.textAlign = options.textAlign;
  if (options.textBaseline) ctx.textBaseline = options.textBaseline;
  
  if (options.shadow) {
    applyShadow(ctx, options.shadow);
  }
  
  if (options.strokeStyle) {
    ctx.strokeText(text, x, y);
  }
  if (options.fillStyle) {
    ctx.fillText(text, x, y);
  }
  
  if (options.shadow) {
    clearShadow(ctx);
  }
  
  ctx.restore();
}
