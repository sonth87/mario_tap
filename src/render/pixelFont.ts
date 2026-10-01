/** Chunky 5×7 bitmap font (title board, HUD numbers, prompts). Unknown characters render as blanks. */
const GLYPHS: Record<string, string> = {
  A: '01110 10001 10001 11111 10001 10001 10001',
  B: '11110 10001 10001 11110 10001 10001 11110',
  C: '01111 10000 10000 10000 10000 10000 01111',
  D: '11110 10001 10001 10001 10001 10001 11110',
  E: '11111 10000 10000 11110 10000 10000 11111',
  F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01111 10000 10000 10011 10001 10001 01111',
  H: '10001 10001 10001 11111 10001 10001 10001',
  I: '11111 00100 00100 00100 00100 00100 11111',
  J: '00111 00001 00001 00001 10001 10001 01110',
  K: '10001 10010 10100 11000 10100 10010 10001',
  L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001',
  N: '10001 11001 10101 10011 10001 10001 10001',
  O: '01110 10001 10001 10001 10001 10001 01110',
  P: '11110 10001 10001 11110 10000 10000 10000',
  Q: '01110 10001 10001 10001 10101 10010 01101',
  R: '11110 10001 10001 11110 10100 10010 10001',
  S: '01111 10000 10000 01110 00001 00001 11110',
  T: '11111 00100 00100 00100 00100 00100 00100',
  U: '10001 10001 10001 10001 10001 10001 01110',
  V: '10001 10001 10001 10001 10001 01010 00100',
  W: '10001 10001 10001 10101 10101 11011 10001',
  X: '10001 10001 01010 00100 01010 10001 10001',
  Y: '10001 10001 01010 00100 00100 00100 00100',
  Z: '11111 00001 00010 00100 01000 10000 11111',
  0: '01110 10011 10101 10101 10101 11001 01110',
  1: '00100 01100 00100 00100 00100 00100 01110',
  2: '01110 10001 00001 00110 01000 10000 11111',
  3: '11110 00001 00001 01110 00001 00001 11110',
  4: '10010 10010 10010 11111 00010 00010 00010',
  5: '11111 10000 11110 00001 00001 10001 01110',
  6: '01110 10000 10000 11110 10001 10001 01110',
  7: '11111 00001 00010 00100 01000 01000 01000',
  8: '01110 10001 10001 01110 10001 10001 01110',
  9: '01110 10001 10001 01111 00001 00001 01110',
  '.': '00000 00000 00000 00000 00000 00000 00100',
  '!': '00100 00100 00100 00100 00100 00000 00100',
  '-': '00000 00000 00000 11111 00000 00000 00000',
  "'": '00100 00100 00000 00000 00000 00000 00000',
  '+': '00000 00100 00100 11111 00100 00100 00000',
  '×': '00000 10001 01010 00100 01010 10001 00000',
  ':': '00000 00100 00100 00000 00100 00100 00000',
  '/': '00001 00010 00010 00100 01000 01000 10000',
  '·': '00000 00000 00000 00100 00000 00000 00000',
  '?': '01110 10001 00001 00110 00100 00000 00100',
  ',': '00000 00000 00000 00000 00100 00100 01000',
  '(': '00010 00100 01000 01000 01000 00100 00010',
  ')': '01000 00100 00010 00010 00010 00100 01000',
  '%': '11001 11010 00010 00100 01000 01011 10011',
  ' ': '00000 00000 00000 00000 00000 00000 00000',
};

/** Compact 3×5 font for small labels (BEST, names, credit, floating points). */
const MINI: Record<string, string> = {
  A: '010 101 111 101 101', B: '110 101 110 101 110', C: '011 100 100 100 011', D: '110 101 101 101 110',
  E: '111 100 110 100 111', F: '111 100 110 100 100', G: '011 100 101 101 011', H: '101 101 111 101 101',
  I: '111 010 010 010 111', J: '001 001 001 101 010', K: '101 101 110 101 101', L: '100 100 100 100 111',
  M: '101 111 111 101 101', N: '110 101 101 101 101', O: '010 101 101 101 010', P: '110 101 110 100 100',
  Q: '010 101 101 110 011', R: '110 101 110 101 101', S: '011 100 010 001 110', T: '111 010 010 010 010',
  U: '101 101 101 101 111', V: '101 101 101 101 010', W: '101 101 111 111 101', X: '101 101 010 101 101',
  Y: '101 101 010 010 010', Z: '111 001 010 100 111',
  0: '111 101 101 101 111', 1: '010 110 010 010 111', 2: '110 001 010 100 111', 3: '110 001 010 001 110',
  4: '101 101 111 001 001', 5: '111 100 110 001 110', 6: '011 100 111 101 111', 7: '111 001 010 010 010',
  8: '111 101 111 101 111', 9: '111 101 111 001 110',
  '.': '000 000 000 000 010', '!': '010 010 010 000 010', '-': '000 000 111 000 000', "'": '010 010 000 000 000',
  '+': '000 010 111 010 000', '×': '000 101 010 101 000', ':': '000 010 000 010 000', '/': '001 001 010 100 100',
  '·': '000 000 010 000 000', '?': '110 001 010 000 010', ',': '000 000 000 010 100', '(': '010 100 100 100 010',
  ')': '010 001 001 001 010', '%': '101 001 010 100 101', ' ': '000 000 000 000 000',
};

export type PixelFontName = 'big' | 'mini';

interface FontDef {
  glyphs: Record<string, string>;
  w: number;
  h: number;
}

const FONTS: Record<PixelFontName, FontDef> = {
  big: { glyphs: GLYPHS, w: 5, h: 7 },
  mini: { glyphs: MINI, w: 3, h: 5 },
};

export function fontHeight(font: PixelFontName): number {
  return FONTS[font].h;
}

/** True when every character of `text` (uppercased) has a glyph — otherwise callers fall back to a system font. */
export function hasGlyphs(text: string, font: PixelFontName = 'big'): boolean {
  const glyphs = FONTS[font].glyphs;
  for (const ch of text.toUpperCase()) if (!(ch in glyphs)) return false;
  return true;
}

/** Width in world px of `text` drawn with `cell`-px font pixels. */
export function textWidth(text: string, font: PixelFontName, cell = 1): number {
  const { w } = FONTS[font];
  return text.length ? (text.length * (w + 1) - 1) * cell : 0;
}

/** Fills the font pixels of `text` at (x, y) with the current fillStyle. */
export function fillGlyphs(ctx: CanvasRenderingContext2D, text: string, font: PixelFontName, x: number, y: number, cell: number): void {
  const { glyphs, w } = FONTS[font];
  let cx = x;
  for (const char of text.toUpperCase()) {
    const rows = glyphs[char]?.split(' ');
    rows?.forEach((row, r) => {
      for (let c = 0; c < w; c++) if (row[c] === '1') ctx.fillRect(cx + c * cell, y + r * cell, cell, cell);
    });
    cx += (w + 1) * cell;
  }
}

export const GLYPH_W = 5;
export const GLYPH_H = 7;
/** Blank font columns between letters. */
export const GLYPH_GAP = 1;

/** Width in font pixels of `text` (uppercased). */
export function pixelTextWidth(text: string): number {
  return text.length ? text.length * (GLYPH_W + GLYPH_GAP) - GLYPH_GAP : 0;
}

/** Draws `text` (uppercased) with its top-left at (x, y); each font pixel is `cw`×`ch` world px. */
export function drawPixelText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, cw: number, ch: number): void {
  let cx = x;
  for (const char of text.toUpperCase()) {
    const rows = GLYPHS[char]?.split(' ');
    if (rows) {
      rows.forEach((row, r) => {
        for (let c = 0; c < GLYPH_W; c++) if (row[c] === '1') ctx.fillRect(cx + c * cw, y + r * ch, cw, ch);
      });
    }
    cx += (GLYPH_W + GLYPH_GAP) * cw;
  }
}
