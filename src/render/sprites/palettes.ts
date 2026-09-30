import type { Palette } from '../../core/types';

export type { Palette };

const BASE: Palette = {
  R: '#E52521',
  B: '#0058F8',
  S: '#FCD8A8',
  Y: '#F8D800',
  D: '#4E2800',
  W: '#FFFFFF',
  K: '#000000',
  G: '#00A800',
  L: '#80D010',
  O: '#C84C0C',
  H: '#E4A672',
};

export const PALETTES = {
  base: BASE,
  /** Fire Mario: white cap & shirt, red overalls. */
  fire: { ...BASE, R: '#F8F8F8', B: '#E52521' },
  /** Star-power colour cycle. */
  star1: { ...BASE, R: '#00A800', B: '#F8D800', D: '#C84C0C' },
  star2: { ...BASE, R: '#000000', B: '#C84C0C', S: '#F8B878' },
  star3: { ...BASE, R: '#F8F8F8', B: '#E52521', D: '#00A800' },
  /** Red koopa. */
  red: { ...BASE, G: '#E52521', L: '#F87858' },
  /** Question-block / coin shimmer frames. */
  dim: { ...BASE, Y: '#E8B400', W: '#F8E8A0' },
  dark: { ...BASE, Y: '#D89C00', W: '#F8D878' },
} satisfies Record<string, Palette>;

export type PaletteName = keyof typeof PALETTES;

export const STAR_CYCLE: PaletteName[] = ['base', 'star1', 'star2', 'star3'];
export const SHIMMER_CYCLE: PaletteName[] = ['base', 'base', 'dim', 'dark', 'dim'];
