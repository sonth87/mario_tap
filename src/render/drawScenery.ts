import { GROUND_Y, TILE, VIEW_HEIGHT } from '../core/constants';
import type { GameTheme } from '../core/theme';
import type { GameState } from '../game/state';
import { bush, cactus, castle, cloud, cloudBank, hill, lobes, lobesWidth, pineTree, pyramid, roundTree, snowcap, snowyPine, triangle } from './sceneryShapes';
import { drawWeather } from './weather';

/** Deterministic 0..1 hash so scenery is stable between frames. */
function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Box (shape-local, world px) a cached shape is rendered into. */
interface Box {
  x0: number;
  y0: number;
  w: number;
  h: number;
}

/** Pre-rendered shape variants per theme (a shape is many 1-px fills; drawing it is one drawImage). */
const stamps = new WeakMap<GameTheme, Map<string, HTMLCanvasElement>>();

function stamp(ctx: CanvasRenderingContext2D, theme: GameTheme, key: string, box: Box, x: number, y: number, paint: (c: CanvasRenderingContext2D) => void): void {
  let byKey = stamps.get(theme);
  if (!byKey) {
    byKey = new Map();
    stamps.set(theme, byKey);
  }
  let img = byKey.get(key);
  if (!img) {
    img = document.createElement('canvas');
    img.width = box.w;
    img.height = box.h;
    const c = img.getContext('2d');
    if (c) {
      c.translate(-box.x0, -box.y0);
      paint(c);
    }
    byKey.set(key, img);
  }
  ctx.drawImage(img, Math.round(x + box.x0), Math.round(y + box.y0));
}

type Painter = (x: number, k: number) => void;

/**
 * One parallax layer: slot `k` sits at `k * span` in layer space; the layer scrolls at
 * `factor` × camera speed. `density` = share of slots that hold something.
 */
function layer(s: GameState, factor: number, span: number, density: number, seed: number, paint: Painter): void {
  const shift = s.cameraX * factor;
  for (let k = Math.floor(shift / span) - 2; k * span - shift < s.viewWidth + span; k++) {
    if (hash(k + seed) > density) continue;
    paint(Math.round(k * span - shift + hash(k + seed + 1) * span * 0.4), k + seed);
  }
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

function mountains(ctx: CanvasRenderingContext2D, s: GameState, t: GameTheme, fill: string): void {
  const style = t.style.mountains;
  if (style === 'cloudbanks') {
    layer(s, 0.15, 12 * TILE, 0.8, 101, (x, k) => {
      const h = 28 + Math.round(hash(k) * 6) * 4;
      stamp(ctx, t, `bank${h}`, { x0: -2 * h - 2, y0: GROUND_Y - h - 10, w: 4 * h + 4, h: h + 24 }, x, 0, (c) => cloudBank(c, 0, h, fill));
    });
    return;
  }
  if (style === 'castles') {
    layer(s, 0.15, 13 * TILE, 0.6, 101, (x, k) => {
      const h = 30 + Math.round(hash(k) * 6) * 5;
      const w = 40 + Math.round(hash(k + 4) * 3) * 8;
      const tower = Math.round(h * 0.35);
      stamp(ctx, t, `castle${h}-${w}`, { x0: -6, y0: GROUND_Y - h - tower - 4, w: w + 12, h: h + tower + 4 }, x, 0, (c) => castle(c, 0, h, w, fill));
    });
    return;
  }
  layer(s, 0.15, 11 * TILE, 0.7, 101, (x, k) => {
    const h = 56 + Math.round(hash(k) * 12) * 4;
    const box = { x0: -h - 8, y0: GROUND_Y - h - 4, w: 2 * h + 16, h: h + 4 };
    stamp(ctx, t, `${style}${h}`, box, x, 0, (c) => {
      if (style === 'snowcaps') snowcap(c, 0, h, fill);
      else if (style === 'pyramids') pyramid(c, 0, h, fill);
      else {
        c.fillStyle = fill;
        triangle(c, 0, GROUND_Y, h, 4);
      }
    });
  });
}

function trees(ctx: CanvasRenderingContext2D, s: GameState, t: GameTheme): void {
  const colors = t.trees;
  if (!colors) return;
  const style = t.style.trees;
  layer(s, 0.7, 6 * TILE, style === 'cacti' ? 0.3 : 0.35, 409, (x, k) => {
    const pine = style === 'pines' || (style === 'mixed' && hash(k + 3) >= 0.5);
    if (style === 'cacti') {
      const h = 16 + Math.round(hash(k) * 8) * 2;
      stamp(ctx, t, `cactus${h}`, { x0: -12, y0: GROUND_Y - h - 4, w: 24, h: h + 4 }, x, 0, (c) => cactus(c, colors, 0, h));
    } else if (pine) {
      const h = 26 + Math.round(hash(k) * 9) * 2;
      stamp(ctx, t, `pine${h}`, { x0: -h / 2 - 4, y0: GROUND_Y - h - 8, w: h + 8, h: h + 8 }, x, 0, (c) =>
        style === 'pines' ? snowyPine(c, colors, 0, h) : pineTree(c, colors, 0, h),
      );
    } else {
      const h = 18 + Math.round(hash(k) * 11) * 2;
      const r = Math.round(h * 0.45);
      stamp(ctx, t, `round${h}`, { x0: -r - 4, y0: GROUND_Y - h - r - 2, w: 2 * r + 8, h: h + r + 2 }, x, 0, (c) => roundTree(c, colors, 0, h));
    }
  });
}

/**
 * Sky + layers of one theme: mountains (0.15), clouds (0.3), hills (0.5), trees (0.7), bushes (0.85).
 * `dy` shifts the layers (not the sky) while the view pans between the ground and the clouds.
 */
function paintTheme(ctx: CanvasRenderingContext2D, s: GameState, t: GameTheme, layers: boolean, weather: boolean, dy: number): void {
  sky(ctx, s, t);
  if (!layers) return;
  ctx.save();
  ctx.translate(0, Math.round(dy));
  paintLayers(ctx, s, t, weather);
  ctx.restore();
}

function paintLayers(ctx: CanvasRenderingContext2D, s: GameState, t: GameTheme, weather: boolean): void {
  const outline = t.sceneryOutline;
  if (t.mountains) mountains(ctx, s, t, t.mountains);
  const clouds = t.clouds;
  if (clouds) {
    layer(s, 0.3, 7 * TILE, 0.65, 203, (x, k) => {
      const n = 1 + Math.floor(hash(k + 5) * 3);
      const w = lobesWidth(lobes(n));
      stamp(ctx, t, `cloud${n}`, { x0: -2, y0: -2, w: w + 4, h: 20 }, x, Math.round(2 * TILE + hash(k) * 3 * TILE), (c) =>
        cloud(c, 0, 0, n, clouds, t.cloudShade, outline),
      );
    });
  }
  const hills = t.hills;
  if (hills) {
    layer(s, 0.5, 9 * TILE, 0.7, 307, (x, k) => {
      const h = hash(k) < 0.5 ? 20 : 36;
      stamp(ctx, t, `hill${h}`, { x0: -h - 3, y0: GROUND_Y - h - 3, w: 2 * h + 7, h: h + 5 }, x, 0, (c) => hill(c, 0, h, hills, outline));
    });
  }
  trees(ctx, s, t);
  const bushes = t.bushes;
  if (bushes) {
    layer(s, 0.85, 5 * TILE, 0.6, 503, (x, k) => {
      const n = 1 + Math.floor(hash(k) * 3);
      const w = lobesWidth(lobes(n));
      stamp(ctx, t, `bush${n}`, { x0: -2, y0: GROUND_Y - 14, w: w + 4, h: 16 }, x, 0, (c) => bush(c, 0, n, bushes, outline));
    });
  }
  if (weather) drawWeather(ctx, t.weather, s.frame, s.cameraX, s.viewWidth);
}

/**
 * Background of the current biome; while a biome border crosses the screen the next biome's
 * background fades in over it (`blend` 0 → 1). Purely decorative — nothing here collides.
 */
export interface SceneryBlend {
  from: GameTheme;
  to: GameTheme | null;
  /** 0 → 1: how far `to` has faded in. */
  blend: number;
  /** Vertical shift (px) of each background's layers (ground ↔ cloud pan). */
  dyFrom?: number;
  dyTo?: number;
}

export function drawScenery(ctx: CanvasRenderingContext2D, s: GameState, bg: SceneryBlend, layers: boolean, weather: boolean): void {
  paintTheme(ctx, s, bg.from, layers, weather, bg.dyFrom ?? 0);
  if (!bg.to || bg.blend <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, bg.blend);
  paintTheme(ctx, s, bg.to, layers, weather, bg.dyTo ?? 0);
  ctx.restore();
}
