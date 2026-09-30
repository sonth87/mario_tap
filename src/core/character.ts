import type { Palette } from './types';

/**
 * A playable character: pixel-art frames (strings, one char per pixel, '.' = transparent — see
 * render/sprites/*) plus palettes. Hosts can pass their own via the `characters` option.
 * Small frames are 16×16, big frames 16×32, all facing right.
 */
export interface CharacterSprites {
  smallStand: string[];
  /** Exactly 3 run frames. */
  smallRun: string[][];
  smallJump: string[];
  /** Optional; defaults to `smallStand` drawn upside down. */
  smallDead?: string[];
  bigStand: string[];
  bigRun: string[][];
  bigJump: string[];
}

export interface CharacterDef {
  id: string;
  /** Shown in the character picker. */
  name: string;
  sprites: CharacterSprites;
  palette: Palette;
  /** Fire-flower colours. */
  firePalette: Palette;
  /** Star-power colour cycle (the base palette is shown in between). */
  starPalettes: Palette[];
}
