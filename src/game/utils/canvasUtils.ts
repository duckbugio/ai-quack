export interface TextStyle {
  font?: string;
  fillStyle?: string;
  strokeStyle?: string;
  lineWidth?: number;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
}

export interface ShadowStyle {
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

export function drawTextWithShadow(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  style: TextStyle = {},
  shadow: ShadowStyle = {}
): void {
  ctx.save();

  ctx.font = style.font || 'bold 48px Arial';
  ctx.fillStyle = style.fillStyle || '#FFFFFF';
  ctx.strokeStyle = style.strokeStyle || '#000000';
  ctx.lineWidth = style.lineWidth ?? 3;
  ctx.textAlign = style.textAlign || 'center';
  ctx.textBaseline = style.textBaseline || 'middle';

  if (shadow.shadowColor) {
    ctx.shadowColor = shadow.shadowColor;
    ctx.shadowBlur = shadow.shadowBlur ?? 4;
    ctx.shadowOffsetX = shadow.shadowOffsetX ?? 2;
    ctx.shadowOffsetY = shadow.shadowOffsetY ?? 2;
  }

  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);

  ctx.restore();
}

export function resetShadow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}
