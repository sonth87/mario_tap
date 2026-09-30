import { GROUND_Y, TILE, VIEW_HEIGHT } from '../core/constants';
import type { GameTheme, TreeColors } from '../core/theme';
import type { GameState } from '../game/state';

/** Deterministic 0..1 hash so scenery is stable between frames. */
function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

type Painter = (ctx: CanvasRenderingContext2D, x: number, k: number) => void;

/**
 * One parallax layer: slot `k` sits at `k * span` in layer space; the layer scrolls at
 * `factor` × camera speed. `density` = share of slots that hold something.
 */
function layer(ctx: CanvasRenderingContext2D, s: GameState, factor: number, span: number, density: number, seed: number, paint: Painter): void {
  const shift = s.cameraX * factor;
  for (let k = Math.floor(shift / span) - 2; k * span - shift < s.viewWidth + span; k++) {
    if (hash(k + seed) > density) continue;
    paint(ctx, Math.round(k * span - shift + hash(k + seed + 1) * span * 0.4), k + seed);
  }
}

/** Stepped (pixel) triangle standing on `baseY`. */
function triangle(ctx: CanvasRenderingContext2D, cx: number, baseY: number, h: number, step: number): void {
  for (let i = 0; i < h; i += step) ctx.fillRect(cx - i - step, baseY - h + i, 2 * (i + step), step);
}

function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.fillRect(x + 6, y, 10 * size, 8);
  ctx.fillRect(x, y + 5, 10 * size + 12, 8);
  ctx.fillRect(x + 3, y + 11, 10 * size + 6, 4);
}

function roundTree(ctx: CanvasRenderingContext2D, c: TreeColors, cx: number, h: number): void {
  ctx.fillStyle = c.trunk;
  ctx.fillRect(cx - 2, GROUND_Y - h, 4, h);
  const r = Math.round(h * 0.45);
  const top = GROUND_Y - h - r;
  ctx.fillStyle = c.leaf;
  for (let dy = 0; dy < r * 2; dy += 2) {
    const half = Math.round(Math.sqrt(r * r - (dy - r) * (dy - r)));
    ctx.fillRect(cx - half, top + dy, half * 2, 2);
  }
  ctx.fillStyle = c.leafLight;
  ctx.fillRect(cx - Math.round(r * 0.5), top + Math.round(r * 0.4), Math.round(r * 0.5), Math.round(r * 0.4));
}

function pineTree(ctx: CanvasRenderingContext2D, c: TreeColors, cx: number, h: number): void {
  ctx.fillStyle = c.trunk;
  ctx.fillRect(cx - 2, GROUND_Y - 8, 4, 8);
  // Slim canopy: widens 1 px every 2 rows (a plain `triangle` would be twice as wide as tall).
  ctx.fillStyle = c.leaf;
  const top = GROUND_Y - 6 - h;
  for (let i = 0; i < h; i += 2) ctx.fillRect(cx - (i >> 1) - 1, top + i, (i >> 1) * 2 + 2, 2);
  ctx.fillStyle = c.leafLight;
  ctx.fillRect(cx - 1, top + 4, 1, Math.round(h * 0.6));
}

function sky(ctx: CanvasRenderingContext2D, s: GameState, theme: GameTheme): void {
  if (!theme.sky) return;
  if (typeof theme.sky === 'string') {
    ctx.fillStyle = theme.sky;
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
    g.addColorStop(0, theme.sky[0]);
    g.addColorStop(1, theme.sky[1]);
    ctx.fillStyle = g;
  }
  ctx.fillRect(0, 0, s.viewWidth, VIEW_HEIGHT);
}

/**
 * Sky + five parallax layers, far → near: mountains (0.15), clouds (0.3), hills (0.5),
 * trees (0.7), bushes (0.85). Purely decorative — nothing here collides.
 */
export function drawScenery(ctx: CanvasRenderingContext2D, s: GameState, theme: GameTheme, layers: boolean): void {
  sky(ctx, s, theme);
  if (!layers) return;
  const { mountains, clouds, hills, trees, bushes } = theme;
  if (mountains) {
    ctx.fillStyle = mountains;
    layer(ctx, s, 0.15, 11 * TILE, 0.7, 101, (c, x, k) => triangle(c, x, GROUND_Y, 56 + Math.round(hash(k) * 48), 4));
  }
  if (clouds) {
    ctx.fillStyle = clouds;
    layer(ctx, s, 0.3, 7 * TILE, 0.65, 203, (c, x, k) => cloud(c, x, 2 * TILE + hash(k) * 3 * TILE, 1 + Math.floor(hash(k + 5) * 3)));
  }
  if (hills) {
    ctx.fillStyle = hills;
    layer(ctx, s, 0.5, 9 * TILE, 0.6, 307, (c, x, k) => triangle(c, x, GROUND_Y, 18 + Math.floor(hash(k) * 2) * 14, 2));
  }
  if (trees) {
    layer(ctx, s, 0.7, 4 * TILE, 0.55, 409, (c, x, k) =>
      hash(k + 3) < 0.5 ? roundTree(c, trees, x, 18 + Math.round(hash(k) * 22)) : pineTree(c, trees, x, 26 + Math.round(hash(k) * 18)),
    );
  }
  if (bushes) {
    ctx.fillStyle = bushes;
    layer(ctx, s, 0.85, 5 * TILE, 0.5, 503, (c, x, k) => {
      const w = 16 + Math.floor(hash(k) * 3) * 10;
      c.fillRect(x, GROUND_Y - 6, w, 6);
      c.fillRect(x + 3, GROUND_Y - 10, w - 6, 4);
      c.fillRect(x + 7, GROUND_Y - 12, w - 14, 2);
    });
  }
}
