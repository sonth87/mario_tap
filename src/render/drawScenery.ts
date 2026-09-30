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

/** Column heights of a shape: `top(x)` / `bottom(x)` in screen px for each column `x` of `[0, w)`. */
type Column = (x: number) => number;

/**
 * Fills a column-described shape in `fill`, ringed by a 1 px `outline` taken from the shape dilated
 * by one pixel (so steps between columns get joined) — the chunky edged look of the NES
 * backgrounds. The ring never overlaps the fill, so translucent colours work too.
 */
function blob(ctx: CanvasRenderingContext2D, x0: number, w: number, top: Column, bottom: Column, fill: string, outline: string | null): void {
  if (outline) {
    ctx.fillStyle = outline;
    for (let x = -1; x <= w; x++) {
      const t = Math.min(top(x - 1), top(x), top(x + 1)) - 1;
      const b = Math.max(bottom(x - 1), bottom(x), bottom(x + 1)) + 1;
      if (!(b > t) || !Number.isFinite(t)) continue;
      const inner = x >= 0 && x < w && bottom(x) > top(x);
      if (!inner) {
        ctx.fillRect(x0 + x, t, 1, b - t);
        continue;
      }
      ctx.fillRect(x0 + x, t, 1, top(x) - t);
      ctx.fillRect(x0 + x, bottom(x), 1, b - bottom(x));
    }
  }
  ctx.fillStyle = fill;
  for (let x = 0; x < w; x++) {
    const t = top(x);
    const b = bottom(x);
    if (b > t) ctx.fillRect(x0 + x, t, 1, b - t);
  }
}

/** A lobe row: `count` big bumps flanked by two smaller ones (the NES cloud / bush silhouette). */
function lobes(count: number): number[] {
  return [5, ...Array.from({ length: count }, () => 8), 5];
}

/** Placed lobes: centre x (from the shape's left edge) and radius. */
function place(radii: number[]): Array<[cx: number, r: number]> {
  const out: Array<[number, number]> = [];
  let cx = radii[0];
  radii.forEach((r, i) => {
    if (i > 0) cx += Math.round((radii[i - 1] + r) * 0.7);
    out.push([cx, r]);
  });
  return out;
}

const lobesWidth = (radii: number[]): number => {
  const last = place(radii).at(-1);
  return last ? last[0] + last[1] + 1 : 0;
};

/** Upper edge of overlapping round lobes whose centres sit on `cy`. */
function lobeTop(radii: number[], cy: number): Column {
  const placed = place(radii);
  return (x) => {
    let best = Infinity;
    for (const [cx, r] of placed) {
      const dx = x - cx;
      if (Math.abs(dx) <= r) best = Math.min(best, Math.round(cy - Math.sqrt(r * r - dx * dx)));
    }
    return best;
  };
}

/** Rounded-top hill with 45° flanks and a few dark spots, standing on the ground line. */
function hill(ctx: CanvasRenderingContext2D, cx: number, h: number, fill: string, outline: string | null): void {
  const r = Math.min(10, h);
  const half = r + (h - r);
  const top: Column = (x) => {
    const dx = Math.abs(x - half);
    if (dx > half) return Infinity;
    if (dx <= r) return Math.round(GROUND_Y - h + r - Math.sqrt(r * r - dx * dx));
    return GROUND_Y - h + r + (dx - r);
  };
  const x0 = cx - half;
  blob(ctx, x0, half * 2 + 1, top, (x) => (Number.isFinite(top(x)) ? GROUND_Y + 1 : -Infinity), fill, outline);
  if (!outline) return;
  // Spots: small upright ovals, like the original's.
  ctx.fillStyle = outline;
  const spots: Array<[number, number]> = h > 24 ? [[-6, 8], [4, 12], [-12, 20], [0, 22], [10, 24]] : [[-3, 6], [3, 10]];
  for (const [dx, dy] of spots) {
    if (dy > h - 4) continue;
    const sx = x0 + half + dx;
    const sy = GROUND_Y - h + dy;
    ctx.fillRect(sx, sy, 1, 3);
    ctx.fillRect(sx + 1, sy - 1, 1, 5);
    ctx.fillRect(sx + 2, sy, 1, 3);
  }
}

/** Bush: 1–3 big lobes sitting on the ground. */
function bush(ctx: CanvasRenderingContext2D, x: number, count: number, fill: string, outline: string | null): void {
  const radii = lobes(count);
  const top = lobeTop(radii, GROUND_Y - 2);
  blob(ctx, x, lobesWidth(radii), top, (c) => (Number.isFinite(top(c)) ? GROUND_Y + 1 : -Infinity), fill, outline);
}

/** Cloud: bumpy top, rounded underside, outlined, with a pale shade along the bottom. */
function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, count: number, fill: string, shade: string | null, outline: string | null): void {
  const radii = lobes(count);
  const w = lobesWidth(radii);
  const top = lobeTop(radii, y + 8);
  const bottom: Column = (c) => {
    if (!Number.isFinite(top(c))) return -Infinity;
    const edge = Math.min(c, w - 1 - c);
    return y + 14 - (edge < 4 ? 4 - edge : 0);
  };
  blob(ctx, x, w, top, bottom, fill, outline);
  if (!shade) return;
  ctx.fillStyle = shade;
  for (let c = 3; c < w - 3; c++) ctx.fillRect(x + c, bottom(c) - 2, 1, 2);
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
  const outline = theme.sceneryOutline;
  if (mountains) {
    ctx.fillStyle = mountains;
    layer(ctx, s, 0.15, 11 * TILE, 0.7, 101, (c, x, k) => triangle(c, x, GROUND_Y, 56 + Math.round(hash(k) * 48), 4));
  }
  if (clouds) {
    layer(ctx, s, 0.3, 7 * TILE, 0.65, 203, (c, x, k) =>
      cloud(c, x, Math.round(2 * TILE + hash(k) * 3 * TILE), 1 + Math.floor(hash(k + 5) * 3), clouds, theme.cloudShade, outline),
    );
  }
  if (hills) {
    layer(ctx, s, 0.5, 9 * TILE, 0.7, 307, (c, x, k) => hill(c, x, hash(k) < 0.5 ? 20 : 36, hills, outline));
  }
  if (trees) {
    layer(ctx, s, 0.7, 6 * TILE, 0.35, 409, (c, x, k) =>
      hash(k + 3) < 0.5 ? roundTree(c, trees, x, 18 + Math.round(hash(k) * 22)) : pineTree(c, trees, x, 26 + Math.round(hash(k) * 18)),
    );
  }
  if (bushes) {
    layer(ctx, s, 0.85, 5 * TILE, 0.6, 503, (c, x, k) => bush(c, x, 1 + Math.floor(hash(k) * 3), bushes, outline));
  }
}
