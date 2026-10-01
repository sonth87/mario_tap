import { fillGlyphs, fontHeight, hasGlyphs, textWidth, type PixelFontName } from './pixelFont';

export interface TextStyle {
  font: PixelFontName;
  /** World px per font pixel (default 1). */
  cell?: number;
  color: string;
  /** 1 px ring for legibility over any background (big font only: any ring or shadow smears the 3×5 font, so it is ignored there); null for none. */
  outline?: string | null;
  align?: 'left' | 'center' | 'right';
  /** y is the top edge (default) or the vertical middle. */
  baseline?: 'top' | 'middle';
}

/** Rendered strings (glyphs + outline) — one drawImage per draw. Bounded: cleared when it grows large. */
const cache = new Map<string, HTMLCanvasElement>();
const MAX_CACHED = 400;
const RING = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];

function render(text: string, st: TextStyle, cell: number): HTMLCanvasElement {
  const pad = st.outline && st.font === 'big' ? 1 : 0;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, textWidth(text, st.font, cell) + 2 * pad);
  canvas.height = fontHeight(st.font) * cell + 2 * pad;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  if (pad) {
    ctx.fillStyle = st.outline as string;
    for (const [dx, dy] of RING) fillGlyphs(ctx, text, st.font, pad + dx, pad + dy, cell);
  }
  ctx.fillStyle = st.color;
  fillGlyphs(ctx, text, st.font, pad, pad, cell);
  return canvas;
}

/** Same layout rules with the browser's monospace font, for strings the pixel fonts cannot spell (e.g. accents). */
function fallback(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, st: TextStyle, cell: number): number {
  const size = fontHeight(st.font) * cell * 1.15;
  ctx.save();
  ctx.font = `bold ${size}px ui-monospace, Menlo, Consolas, monospace`;
  ctx.textAlign = st.align ?? 'left';
  ctx.textBaseline = st.baseline === 'middle' ? 'middle' : 'top';
  if (st.outline) {
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = st.outline;
    ctx.strokeText(text, x, y);
  }
  ctx.fillStyle = st.color;
  ctx.fillText(text, x, y);
  const w = ctx.measureText(text).width;
  ctx.restore();
  return w;
}

/** Draws pixel text; returns its width in world px. */
export function drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, st: TextStyle): number {
  const cell = st.cell ?? 1;
  if (!text) return 0;
  if (!hasGlyphs(text, st.font)) return fallback(ctx, text, x, y, st, cell);
  const key = `${st.font}|${cell}|${st.color}|${st.font === 'big' ? st.outline ?? '' : ''}|${text}`;
  let img = cache.get(key);
  if (!img) {
    if (cache.size >= MAX_CACHED) cache.clear();
    img = render(text, st, cell);
    cache.set(key, img);
  }
  const pad = st.outline && st.font === 'big' ? 1 : 0;
  const w = img.width - 2 * pad;
  const left = st.align === 'center' ? x - w / 2 : st.align === 'right' ? x - w : x;
  const top = st.baseline === 'middle' ? y - (img.height - 2 * pad) / 2 : y;
  ctx.drawImage(img, Math.round(left) - pad, Math.round(top) - pad);
  return w;
}

/** Width a `drawText` call would take (pixel font; approximate for the fallback). */
export function measureText(text: string, st: Pick<TextStyle, 'font' | 'cell'>): number {
  return textWidth(text, st.font, st.cell ?? 1);
}
