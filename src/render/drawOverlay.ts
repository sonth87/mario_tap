import { GAME_OVER_LOCK_FRAMES, VIEW_HEIGHT } from '../core/constants';
import type { GameLabels } from '../core/options';
import type { GameTheme } from '../core/theme';
import type { GameStats } from '../core/types';
import type { GameState } from '../game/state';
import { drawSprite } from './atlas';
import { drawPixelText, GLYPH_H, pixelTextWidth } from './pixelFont';
import { COIN } from './sprites/items';
import { HUD_MARGIN_TOP, HUD_MARGIN_X, hudTextRight } from './uiLayout';

const FONT = 'ui-monospace, Menlo, Consolas, monospace';

function text(ctx: CanvasRenderingContext2D, theme: GameTheme, value: string, x: number, y: number, size: number, color = theme.text): void {
  ctx.font = `bold ${size}px ${FONT}`;
  ctx.lineJoin = 'round';
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = theme.textOutline;
  ctx.strokeText(value, x, y);
  ctx.fillStyle = color;
  ctx.fillText(value, x, y);
}

const pad = (n: number, len = 6): string => String(n).padStart(len, '0');

function spaced(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, tracking: number): void {
  let cx = x;
  for (const ch of value) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + tracking;
  }
}

/**
 * Top-bar HUD (all sizes are world px): score under the credit on the
 * left; coin counter with a small title in the centre; BEST label + value over the distance on the
 * right, left of the portrait / speaker buttons. No "SCORE" caption — the credit line fills that role.
 */
export function drawHud(
  ctx: CanvasRenderingContext2D,
  s: GameState,
  stats: GameStats,
  labels: GameLabels,
  theme: GameTheme,
  buttons: { portrait: boolean; sound: boolean },
  creditShown: boolean,
): void {
  const h = theme.hud;
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.font = `bold 6.3px ${FONT}`;
  ctx.fillStyle = h.score;
  ctx.fillText(pad(stats.score), HUD_MARGIN_X, HUD_MARGIN_TOP + (creditShown ? 11 : 1));

  const cx = s.viewWidth / 2;
  ctx.save();
  ctx.translate(cx - 15, HUD_MARGIN_TOP + 0.5);
  ctx.scale(0.42, 0.42);
  drawSprite(ctx, COIN, 0, 0);
  ctx.restore();
  ctx.font = `bold 7.6px ${FONT}`;
  ctx.fillStyle = h.coin;
  ctx.fillText(`×${pad(stats.coins, 2)}`, cx - 7, HUD_MARGIN_TOP - 0.5);
  if (labels.title && s.viewWidth >= 260) {
    ctx.font = `bold 4.6px ${FONT}`;
    ctx.fillStyle = h.subtitle;
    ctx.textAlign = 'center';
    spaced(ctx, labels.title.toUpperCase(), cx - (labels.title.length * 3.5) / 2, HUD_MARGIN_TOP + 9.5, 0.45);
    ctx.textAlign = 'left';
  }

  const right = hudTextRight(s.viewWidth, buttons.portrait, buttons.sound);
  ctx.textAlign = 'right';
  const value = pad(Math.max(stats.best.score, stats.score));
  ctx.font = `bold 6.3px ${FONT}`;
  const valueWidth = ctx.measureText(value).width;
  ctx.fillStyle = h.best;
  ctx.fillText(value, right, HUD_MARGIN_TOP + 1);
  ctx.font = `4.8px ${FONT}`;
  ctx.fillStyle = h.bestLabel;
  ctx.fillText(labels.best, right - valueWidth - 2.5, HUD_MARGIN_TOP + 2.4);
  ctx.font = `bold 6.3px ${FONT}`;
  ctx.fillStyle = h.distance;
  ctx.fillText(`${stats.distance}${labels.metres}`, right, HUD_MARGIN_TOP + 9.5);
}

function panel(ctx: CanvasRenderingContext2D, theme: GameTheme, cx: number, cy: number, w: number, h: number): void {
  ctx.fillStyle = theme.panel;
  ctx.beginPath();
  ctx.roundRect(Math.round(cx - w / 2), Math.round(cy - h / 2), w, h, 4);
  ctx.fill();
}

/** Title board: top edge while shown, frames it takes to slide up and out once a run starts. */
const BOARD_TOP = 28;
export const BOARD_SLIDE_FRAMES = 40;
const BOARD = { fill: '#C84C0C', light: '#FCBCB0', dark: '#000000' };

interface BoardBox {
  x: number;
  y: number;
  w: number;
  h: number;
  /** World px per font pixel. */
  cell: number;
}

function boardBox(viewWidth: number, logo: string): BoardBox {
  const units = pixelTextWidth(logo);
  // Letters are 3 px per font pixel (2 or 1 when the view is too narrow for the name).
  const cell = Math.max(1, Math.min(3, Math.floor((viewWidth - 48) / units)));
  const w = units * cell + 28;
  const h = GLYPH_H * cell * 1.34 + 22;
  return { x: Math.round((viewWidth - w) / 2), y: BOARD_TOP, w: Math.round(w), h: Math.round(h), cell };
}

/** The title sign (like the 1985 logo board): rivets, bevel, drop shadow and chunky shadowed letters. */
function drawBoard(ctx: CanvasRenderingContext2D, b: BoardBox, logo: string): void {
  const { x, y, w, h, cell } = b;
  ctx.fillStyle = BOARD.dark;
  ctx.fillRect(x + 2, y + 2, w, h);
  ctx.fillStyle = BOARD.light;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = BOARD.fill;
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x + 1, y + h - 2, w - 2, 1);
  ctx.fillRect(x + w - 2, y + 1, 1, h - 2);
  ctx.fillStyle = BOARD.light;
  for (const [rx, ry] of [[4, 4], [w - 6, 4], [4, h - 6], [w - 6, h - 6]]) {
    ctx.fillRect(x + rx, y + ry, 2, 2);
    ctx.fillStyle = BOARD.dark;
    ctx.fillRect(x + rx + 1, y + ry + 1, 1, 1);
    ctx.fillStyle = BOARD.light;
  }
  const ch = Math.round(cell * 1.34);
  const tx = x + Math.round((w - pixelTextWidth(logo) * cell) / 2);
  const ty = y + Math.round((h - GLYPH_H * ch) / 2);
  ctx.fillStyle = BOARD.dark;
  drawPixelText(ctx, logo, tx + cell, ty + cell, cell, ch);
  ctx.fillStyle = BOARD.light;
  drawPixelText(ctx, logo, tx, ty, cell, ch);
}

/** Start prompt with the title board, board sliding away as a run starts, game-over card. */
export function drawPrompts(ctx: CanvasRenderingContext2D, s: GameState, stats: GameStats, labels: GameLabels, theme: GameTheme): void {
  const cx = s.viewWidth / 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (labels.logo && (s.status === 'idle' || (s.status === 'playing' && s.statusTimer < BOARD_SLIDE_FRAMES))) {
    const b = boardBox(s.viewWidth, labels.logo);
    if (s.status === 'playing') {
      // Ease-in slide up and out of the top edge.
      const t = s.statusTimer / BOARD_SLIDE_FRAMES;
      b.y = Math.round(BOARD_TOP - t * t * (BOARD_TOP + b.h + 4));
    }
    drawBoard(ctx, b, labels.logo);
    if (s.status === 'playing') return;
    const below = b.y + b.h + 14;
    if (Math.floor(s.frame / 30) % 2 === 0) text(ctx, theme, labels.start, cx, below, 8);
    if (stats.best.score > 0) text(ctx, theme, `${labels.best} ${stats.best.score}`, cx, below + 13, 7, theme.textAccent);
    return;
  }
  if (s.status === 'idle') {
    const blink = Math.floor(s.frame / 30) % 2 === 0;
    const cy = VIEW_HEIGHT * 0.34;
    const hasBest = stats.best.score > 0;
    panel(ctx, theme, cx, cy, Math.min(s.viewWidth - 16, 180), hasBest ? 34 : 22);
    if (blink) text(ctx, theme, labels.start, cx, cy - (hasBest ? 6 : 0), 8);
    if (hasBest) text(ctx, theme, `${labels.best} ${stats.best.score}`, cx, cy + 8, 7, theme.textAccent);
    return;
  }
  if (s.status !== 'over') return;
  const cy = VIEW_HEIGHT * 0.36;
  panel(ctx, theme, cx, cy, Math.min(s.viewWidth - 16, 190), 60);
  text(ctx, theme, labels.gameOver, cx, cy - 19, 11, '#E52521');
  text(ctx, theme, `${labels.score} ${stats.score}  ·  ${labels.best} ${stats.best.score}`, cx, cy - 4, 7);
  if (stats.newRecord) text(ctx, theme, labels.newRecord, cx, cy + 8, 8, theme.textAccent);
  if (s.statusTimer > GAME_OVER_LOCK_FRAMES && Math.floor(s.frame / 30) % 2 === 0) text(ctx, theme, labels.restart, cx, cy + 20, 7);
}
