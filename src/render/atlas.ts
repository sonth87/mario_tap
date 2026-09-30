import { PALETTES, type Palette, type PaletteName } from './sprites/palettes';

/**
 * Pixel-art strings → cached offscreen canvases, one per (sprite, palette). Drawing a sprite is
 * then a single drawImage — no per-frame pixel work.
 */
const cache = new WeakMap<string[], Map<Palette, HTMLCanvasElement>>();

/** A named built-in palette or any palette object (themes, custom characters). Keep objects stable — they are cache keys. */
export type PaletteRef = PaletteName | Palette;

function build(rows: string[], colors: Palette): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = rows[0]?.length ?? 0;
  canvas.height = rows.length;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = colors[row[x]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  });
  return canvas;
}

export function sprite(rows: string[], palette: PaletteRef = 'base'): HTMLCanvasElement {
  const colors: Palette = typeof palette === 'string' ? PALETTES[palette] : palette;
  let byPalette = cache.get(rows);
  if (!byPalette) {
    byPalette = new Map();
    cache.set(rows, byPalette);
  }
  let canvas = byPalette.get(colors);
  if (!canvas) {
    canvas = build(rows, colors);
    byPalette.set(colors, canvas);
  }
  return canvas;
}

export interface DrawOpts {
  flipX?: boolean;
  flipY?: boolean;
  palette?: PaletteRef;
}

/** Draws a sprite with its top-left at screen (x, y), rounded to whole pixels. */
export function drawSprite(ctx: CanvasRenderingContext2D, rows: string[], x: number, y: number, opts: DrawOpts = {}): void {
  const img = sprite(rows, opts.palette);
  const px = Math.round(x);
  const py = Math.round(y);
  if (!opts.flipX && !opts.flipY) {
    ctx.drawImage(img, px, py);
    return;
  }
  ctx.save();
  ctx.translate(px + (opts.flipX ? img.width : 0), py + (opts.flipY ? img.height : 0));
  ctx.scale(opts.flipX ? -1 : 1, opts.flipY ? -1 : 1);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}
