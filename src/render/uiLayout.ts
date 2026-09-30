import { VIEW_HEIGHT } from '../core/constants';

/** In-canvas UI geometry (world px), shared by the renderer and the engine's pointer hit-testing. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const PORTRAIT_SIZE = 16;
/** HUD margins (world px) of the built-in top bar. */
export const HUD_MARGIN_X = 10;
export const HUD_MARGIN_TOP = 5;
const BUTTON_GAP = 6;
const CARD_W = 36;
const CARD_H = 46;
const CARD_GAP = 6;
const PANEL_PAD = 8;
const TITLE_H = 14;

export function inside(r: Rect, x: number, y: number): boolean {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

/** Top-right button row, right to left: speaker, then character portrait (each 16 px, 6 px apart). */
export function soundRect(viewWidth: number): Rect {
  return { x: viewWidth - HUD_MARGIN_X - PORTRAIT_SIZE, y: HUD_MARGIN_TOP, w: PORTRAIT_SIZE, h: PORTRAIT_SIZE };
}

/** Character portrait button; sits left of the speaker (or at the corner when there is none). */
export function portraitRect(viewWidth: number, withSound = true): Rect {
  const x = viewWidth - HUD_MARGIN_X - PORTRAIT_SIZE - (withSound ? PORTRAIT_SIZE + BUTTON_GAP : 0);
  return { x, y: HUD_MARGIN_TOP, w: PORTRAIT_SIZE, h: PORTRAIT_SIZE };
}

/** Right edge (x) of the BEST / distance text block: just left of the buttons. */
export function hudTextRight(viewWidth: number, portrait: boolean, sound: boolean): number {
  const buttons = (portrait ? 1 : 0) + (sound ? 1 : 0);
  return viewWidth - HUD_MARGIN_X - (buttons ? buttons * PORTRAIT_SIZE + buttons * BUTTON_GAP : 0);
}

export interface PickerLayout {
  panel: Rect;
  cards: Rect[];
  /** Short cards (small sprite) used when full cards would not fit the screen height. */
  compact: boolean;
}

const CARD_H_COMPACT = 30;
/** Smallest compact card: 16 px sprite + name line. */
const CARD_H_MIN = 26;

/**
 * Centered panel. Cards wrap into evenly filled rows (11 cards → 6 + 5, never 10 + 1); when the
 * rows would not fit the view height the cards switch to a compact form.
 */
export function pickerLayout(viewWidth: number, count: number): PickerLayout {
  const maxPerRow = Math.max(1, Math.floor((viewWidth - 2 * PANEL_PAD - 8) / (CARD_W + CARD_GAP)));
  const rows = Math.ceil(count / Math.min(count, maxPerRow));
  // Row sizes differ by at most one card: the first `count % rows` rows get the extra one.
  const sizes = Array.from({ length: rows }, (_, r) => Math.floor(count / rows) + (r < count % rows ? 1 : 0));
  const perRow = Math.max(...sizes);
  const heightFor = (cardH: number): number => TITLE_H + rows * cardH + (rows - 1) * CARD_GAP + 2 * PANEL_PAD;
  const compact = heightFor(CARD_H) > VIEW_HEIGHT - 34;
  // Many rows on a narrow view: compact cards shrink further (never below the sprite + name) to fit.
  const fitH = Math.floor((VIEW_HEIGHT - 12 - TITLE_H - 2 * PANEL_PAD - (rows - 1) * CARD_GAP) / rows);
  const cardH = compact ? Math.max(CARD_H_MIN, Math.min(CARD_H_COMPACT, fitH)) : CARD_H;
  const w = perRow * CARD_W + (perRow - 1) * CARD_GAP + 2 * PANEL_PAD;
  const h = heightFor(cardH);
  const panel = { x: Math.round((viewWidth - w) / 2), y: Math.round(Math.min(VIEW_HEIGHT - h - 6, Math.max(26, (VIEW_HEIGHT - h) / 2 - 6))), w, h };
  const cards: Rect[] = [];
  let row = 0;
  let used = 0;
  for (let i = 0; i < count; i++) {
    if (i - used >= sizes[row]) {
      used += sizes[row];
      row += 1;
    }
    const rowW = sizes[row] * CARD_W + (sizes[row] - 1) * CARD_GAP;
    cards.push({
      x: Math.round(panel.x + (w - rowW) / 2) + (i - used) * (CARD_W + CARD_GAP),
      y: panel.y + PANEL_PAD + TITLE_H + row * (cardH + CARD_GAP),
      w: CARD_W,
      h: cardH,
    });
  }
  return { panel, cards, compact };
}

/** Credit link (cat mark + text), top-left; the score sits below it. */
export function creditRect(text: string): Rect {
  return { x: HUD_MARGIN_X - 2, y: HUD_MARGIN_TOP - 1, w: 13 + Math.ceil(text.length * 4.3), h: 10 };
}
