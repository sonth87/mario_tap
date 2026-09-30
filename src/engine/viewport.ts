import { MAX_VIEW_WIDTH, MIN_VIEW_WIDTH, VIEW_HEIGHT } from '../core/constants';

export interface Viewport {
  /** World pixels visible horizontally (height is always VIEW_HEIGHT). */
  viewWidth: number;
  /** Canvas backing-store pixels per world pixel. */
  scale: number;
}

/**
 * Fits the fixed-height world to the host box: the world height fills the box, the world width
 * follows the aspect ratio (clamped). The backing store uses a whole-number scale near the CSS
 * size × devicePixelRatio so pixel art stays crisp.
 */
export function computeViewport(cssWidth: number, cssHeight: number, dpr: number): Viewport | null {
  if (cssWidth < 1 || cssHeight < 1) return null;
  const viewWidth = Math.round(Math.min(MAX_VIEW_WIDTH, Math.max(MIN_VIEW_WIDTH, (cssWidth * VIEW_HEIGHT) / cssHeight)));
  const scale = Math.max(1, Math.round((cssHeight / VIEW_HEIGHT) * dpr));
  return { viewWidth, scale };
}

/**
 * Client (CSS px) point → world px. The canvas uses `object-fit: contain`, so the drawn area may be
 * letter-boxed inside the element box.
 */
export function clientToWorld(rect: DOMRect, viewWidth: number, clientX: number, clientY: number): { x: number; y: number } {
  const scale = Math.min(rect.width / viewWidth, rect.height / VIEW_HEIGHT);
  const offX = (rect.width - viewWidth * scale) / 2;
  const offY = (rect.height - VIEW_HEIGHT * scale) / 2;
  return { x: (clientX - rect.left - offX) / scale, y: (clientY - rect.top - offY) / scale };
}
