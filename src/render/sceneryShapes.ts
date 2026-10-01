import { GROUND_Y } from '../core/constants';
import type { TreeColors } from '../core/theme';

/**
 * Background shapes, drawn in a shape-local frame (x = 0 at the anchor, y in world px). They are
 * pixel-by-pixel fills, so drawScenery renders each variant once into an offscreen canvas.
 */
/** Stepped (pixel) triangle standing on `baseY`. */
export function triangle(ctx: CanvasRenderingContext2D, cx: number, baseY: number, h: number, step: number): void {
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
export function lobes(count: number): number[] {
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

export const lobesWidth = (radii: number[]): number => {
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
export function hill(ctx: CanvasRenderingContext2D, cx: number, h: number, fill: string, outline: string | null): void {
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
export function bush(ctx: CanvasRenderingContext2D, x: number, count: number, fill: string, outline: string | null): void {
  const radii = lobes(count);
  const top = lobeTop(radii, GROUND_Y - 2);
  blob(ctx, x, lobesWidth(radii), top, (c) => (Number.isFinite(top(c)) ? GROUND_Y + 1 : -Infinity), fill, outline);
}

/** Cloud: bumpy top, rounded underside, outlined, with a pale shade along the bottom. */
export function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, count: number, fill: string, shade: string | null, outline: string | null): void {
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

export function roundTree(ctx: CanvasRenderingContext2D, c: TreeColors, cx: number, h: number): void {
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

export function pineTree(ctx: CanvasRenderingContext2D, c: TreeColors, cx: number, h: number): void {
  ctx.fillStyle = c.trunk;
  ctx.fillRect(cx - 2, GROUND_Y - 8, 4, 8);
  // Slim canopy: widens 1 px every 2 rows (a plain `triangle` would be twice as wide as tall).
  ctx.fillStyle = c.leaf;
  const top = GROUND_Y - 6 - h;
  for (let i = 0; i < h; i += 2) ctx.fillRect(cx - (i >> 1) - 1, top + i, (i >> 1) * 2 + 2, 2);
  ctx.fillStyle = c.leafLight;
  ctx.fillRect(cx - 1, top + 4, 1, Math.round(h * 0.6));
}


/** Snowy peak: a stepped triangle with a white cap over the top third. */
export function snowcap(ctx: CanvasRenderingContext2D, cx: number, h: number, fill: string): void {
  ctx.fillStyle = fill;
  triangle(ctx, cx, GROUND_Y, h, 4);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  const cap = Math.round(h * 0.32 / 4) * 4;
  for (let i = 0; i < cap; i += 4) ctx.fillRect(cx - i - 4, GROUND_Y - h + i, 2 * (i + 4), 4);
  // Ragged lower edge of the snow.
  for (let i = -cap; i < cap; i += 8) ctx.fillRect(cx + i, GROUND_Y - h + cap, 4, 3);
}

/** Pyramid: stepped triangle, the right half in shade, a dark doorway. */
export function pyramid(ctx: CanvasRenderingContext2D, cx: number, h: number, fill: string): void {
  ctx.fillStyle = fill;
  triangle(ctx, cx, GROUND_Y, h, 4);
  ctx.fillStyle = 'rgba(90,40,0,0.22)';
  for (let i = 0; i < h; i += 4) ctx.fillRect(cx, GROUND_Y - h + i, i + 4, 4);
  ctx.fillStyle = 'rgba(60,24,0,0.45)';
  ctx.fillRect(cx - 3, GROUND_Y - 8, 6, 8);
}

/** Castle silhouette: keep with battlements and two towers, a few lit windows. */
export function castle(ctx: CanvasRenderingContext2D, x: number, h: number, w: number, fill: string): void {
  ctx.fillStyle = fill;
  ctx.fillRect(x, GROUND_Y - h, w, h);
  for (let i = 0; i < w; i += 6) ctx.fillRect(x + i, GROUND_Y - h - 4, 3, 4);
  const tower = Math.round(h * 0.35);
  for (const tx of [x - 4, x + w - 8]) {
    ctx.fillRect(tx, GROUND_Y - h - tower, 12, h + tower);
    for (let i = 0; i < 12; i += 4) ctx.fillRect(tx + i, GROUND_Y - h - tower - 3, 2, 3);
  }
  ctx.fillStyle = 'rgba(248,184,0,0.75)';
  for (let wy = GROUND_Y - h + 8; wy < GROUND_Y - 10; wy += 14) for (let wx = x + 8; wx < x + w - 10; wx += 12) ctx.fillRect(wx, wy, 2, 4);
  ctx.fillRect(x - 1, GROUND_Y - h - tower + 6, 2, 3);
  ctx.fillRect(x + w - 3, GROUND_Y - h - tower + 6, 2, 3);
}

/** Saguaro cactus with one or two arms. */
export function cactus(ctx: CanvasRenderingContext2D, c: TreeColors, cx: number, h: number): void {
  ctx.fillStyle = c.leaf;
  ctx.fillRect(cx - 3, GROUND_Y - h, 6, h);
  ctx.fillRect(cx - 2, GROUND_Y - h - 1, 4, 1);
  const armY = GROUND_Y - Math.round(h * 0.55);
  ctx.fillRect(cx - 9, armY, 6, 3);
  ctx.fillRect(cx - 9, armY - 8, 3, 8);
  if (h > 24) {
    ctx.fillRect(cx + 3, armY + 5, 6, 3);
    ctx.fillRect(cx + 6, armY - 3, 3, 8);
  }
  ctx.fillStyle = c.leafLight;
  ctx.fillRect(cx - 2, GROUND_Y - h + 2, 1, h - 4);
  ctx.fillRect(cx - 8, armY - 7, 1, 6);
}

/** Pine with snow lying on each tier of branches. */
export function snowyPine(ctx: CanvasRenderingContext2D, c: TreeColors, cx: number, h: number): void {
  pineTree(ctx, c, cx, h);
  ctx.fillStyle = c.leafLight;
  const top = GROUND_Y - 6 - h;
  for (let i = 4; i < h; i += 6) {
    const half = (i >> 1) + 1;
    ctx.fillRect(cx - half, top + i, 2, 1);
    ctx.fillRect(cx + half - 2, top + i, 2, 1);
  }
  ctx.fillRect(cx - 1, top, 2, 2);
}

/** Cloud bank: a wide soft mound of cloud far away, rising from below the horizon (sky biome). */
export function cloudBank(ctx: CanvasRenderingContext2D, cx: number, h: number, fill: string): void {
  const r = h * 2;
  for (let x = -r; x <= r; x++) {
    const round = Math.sqrt(1 - (x / r) ** 2);
    const bumps = Math.abs(Math.sin(x / 9)) * 6 + Math.abs(Math.sin(x / 4)) * 2;
    const top = Math.round(GROUND_Y - h * round - bumps * round);
    ctx.fillStyle = fill;
    ctx.fillRect(cx + x, top, 1, GROUND_Y + 12 - top);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillRect(cx + x, top, 1, 2);
  }
}
