import { GAME_OVER_LOCK_FRAMES, VIEW_HEIGHT } from '../core/constants';
import type { GameLabels } from '../core/options';
import type { GameTheme } from '../core/theme';
import type { GameStats } from '../core/types';
import type { GameState } from '../game/state';
import { drawSprite } from './atlas';
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

/** Start prompt, game-over card. */
export function drawPrompts(ctx: CanvasRenderingContext2D, s: GameState, stats: GameStats, labels: GameLabels, theme: GameTheme): void {
  const cx = s.viewWidth / 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
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
