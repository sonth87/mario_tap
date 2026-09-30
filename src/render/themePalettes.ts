import type { GameTheme } from '../core/theme';
import { PALETTES, type Palette } from './sprites/palettes';

/** Block-sprite palettes with the theme's `blocks` overrides applied (base + ? block shimmer). */
export interface TilePalettes {
  base: Palette;
  dim: Palette;
  dark: Palette;
}

const cache = new WeakMap<GameTheme, TilePalettes>();

/**
 * Stable per theme object, so the sprite atlas caches each recoloured block once. A theme that sets
 * its own ? block face colour (`blocks.Y`) gets no shimmer.
 */
export function tilePalettes(theme: GameTheme): TilePalettes {
  let p = cache.get(theme);
  if (!p) {
    const base: Palette = { ...PALETTES.base, ...theme.blocks };
    const shimmer = (from: Palette): Palette => (theme.blocks.Y ? base : { ...base, Y: from.Y, W: from.W });
    p = { base, dim: shimmer(PALETTES.dim), dark: shimmer(PALETTES.dark) };
    cache.set(theme, p);
  }
  return p;
}
