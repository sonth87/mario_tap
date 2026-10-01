import type { BiomeId } from '../core/biome';
import { GAME_OVER_LOCK_FRAMES, VIEW_HEIGHT } from '../core/constants';
import type { GameLabels } from '../core/options';
import type { GameTheme } from '../core/theme';
import type { GameStats } from '../core/types';
import type { GameState } from '../game/state';
import { drawSprite } from './atlas';
import { drawPixelText, GLYPH_H, pixelTextWidth } from './pixelFont';
import { COIN } from './sprites/items';
import { drawText, type TextStyle } from './text';
import { HUD_MARGIN_TOP, HUD_MARGIN_X, hudTextRight } from './uiLayout';

const pad = (n: number, len = 6): string => String(n).padStart(len, '0');

const big = (theme: GameTheme, color = theme.text, extra: Partial<TextStyle> = {}): TextStyle => ({ font: 'big', color, outline: theme.textOutline, ...extra });
const mini = (theme: GameTheme, color: string, extra: Partial<TextStyle> = {}): TextStyle => ({ font: 'mini', color, outline: theme.textOutline, ...extra });

/**
 * Top-bar HUD (world px, pixel font): score under the credit on the left; coin counter with a small
 * title in the centre; BEST label + value over the distance on the right, left of the buttons.
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
  drawText(ctx, pad(stats.score), HUD_MARGIN_X, HUD_MARGIN_TOP + (creditShown ? 11 : 1), big(theme, h.score));

  const cx = Math.round(s.viewWidth / 2);
  ctx.save();
  ctx.translate(cx - 16, HUD_MARGIN_TOP + 0.5);
  ctx.scale(0.5, 0.5);
  drawSprite(ctx, COIN, 0, 0);
  ctx.restore();
  drawText(ctx, `×${pad(stats.coins, 2)}`, cx - 6, HUD_MARGIN_TOP + 1, big(theme, h.coin));
  if (labels.title && s.viewWidth >= 260) drawText(ctx, labels.title, cx, HUD_MARGIN_TOP + 11, big(theme, h.subtitle, { align: 'center' }));

  const right = hudTextRight(s.viewWidth, buttons.portrait, buttons.sound);
  const value = pad(Math.max(stats.best.score, stats.score));
  const w = drawText(ctx, value, right, HUD_MARGIN_TOP + 1, big(theme, h.best, { align: 'right' }));
  drawText(ctx, labels.best, right - w - 4, HUD_MARGIN_TOP + 1, big(theme, h.bestLabel, { align: 'right' }));
  drawText(ctx, `${stats.distance}${labels.metres}`, right, HUD_MARGIN_TOP + 11, big(theme, h.distance, { align: 'right' }));
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

const BIOME_LABEL: Record<BiomeId, keyof GameLabels> = { grass: 'biomeGrass', desert: 'biomeDesert', snow: 'biomeSnow', castle: 'biomeCastle', sky: 'biomeSky' };
/** How long (frames) the biome / speed banner stays up. */
const BANNER_FRAMES = 150;

/** "DESERT" / "SPEED UP!" banner after a flagpole, sliding in and fading out. */
function drawBanner(ctx: CanvasRenderingContext2D, s: GameState, labels: GameLabels, theme: GameTheme): void {
  const biomeAge = s.frame - s.biomeFrame;
  const speedAge = s.frame - s.speedFrame;
  const showBiome = s.biomeFrame > 0 && biomeAge < BANNER_FRAMES;
  const showSpeed = s.speedFrame > 0 && speedAge < BANNER_FRAMES;
  if (!showBiome && !showSpeed) return;
  const age = Math.min(showBiome ? biomeAge : Infinity, showSpeed ? speedAge : Infinity);
  const cx = s.viewWidth / 2;
  ctx.save();
  ctx.globalAlpha = age > BANNER_FRAMES - 30 ? (BANNER_FRAMES - age) / 30 : 1;
  const y = 40 - Math.max(0, 12 - age) * 2;
  if (showBiome) drawText(ctx, labels[BIOME_LABEL[s.biome]], cx, y, big(theme, theme.textAccent, { cell: 2, align: 'center' }));
  if (showSpeed && Math.floor(speedAge / 8) % 2 === 0) {
    drawText(ctx, `${labels.speedUp} ${'+'.repeat(s.speedLevel)}`, cx, y + (showBiome ? 20 : 4), big(theme, '#FF7A59', { align: 'center' }));
  }
  ctx.restore();
}

function fill(template: string, values: Record<string, number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in values ? String(values[k]) : m));
}

/** Start prompt with the title board, board sliding away as a run starts, banners, game-over card, pause card. */
export function drawPrompts(ctx: CanvasRenderingContext2D, s: GameState, stats: GameStats, labels: GameLabels, theme: GameTheme, paused: boolean): void {
  const cx = s.viewWidth / 2;
  const blink = Math.floor(s.frame / 30) % 2 === 0;
  if (paused) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, s.viewWidth, VIEW_HEIGHT);
    drawText(ctx, labels.paused, cx, VIEW_HEIGHT * 0.36, big(theme, theme.textAccent, { cell: 2, align: 'center', baseline: 'middle' }));
    drawText(ctx, labels.resume, cx, VIEW_HEIGHT * 0.36 + 18, big(theme, theme.text, { align: 'center', baseline: 'middle' }));
    return;
  }
  if (s.status === 'playing') drawBanner(ctx, s, labels, theme);
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
    if (blink) drawText(ctx, labels.start, cx, below, big(theme, theme.text, { align: 'center', baseline: 'middle' }));
    if (stats.best.score > 0) drawText(ctx, `${labels.best} ${stats.best.score}`, cx, below + 13, big(theme, theme.textAccent, { align: 'center', baseline: 'middle' }));
    return;
  }
  if (s.status === 'idle') {
    const cy = VIEW_HEIGHT * 0.34;
    const hasBest = stats.best.score > 0;
    panel(ctx, theme, cx, cy, Math.min(s.viewWidth - 16, 190), hasBest ? 34 : 22);
    if (blink) drawText(ctx, labels.start, cx, cy - (hasBest ? 6 : 0), big(theme, theme.text, { align: 'center', baseline: 'middle' }));
    if (hasBest) drawText(ctx, `${labels.best} ${stats.best.score}`, cx, cy + 8, big(theme, theme.textAccent, { align: 'center', baseline: 'middle' }));
    return;
  }
  if (s.status !== 'over') return;
  ctx.fillStyle = `rgba(0,0,0,${Math.min(0.3, s.statusTimer / 60)})`;
  ctx.fillRect(0, 0, s.viewWidth, VIEW_HEIGHT);
  const cy = VIEW_HEIGHT * 0.38;
  panel(ctx, theme, cx, cy, Math.min(s.viewWidth - 16, 210), 76);
  drawText(ctx, labels.gameOver, cx, cy - 25, big(theme, '#E52521', { cell: 2, align: 'center', baseline: 'middle' }));
  drawText(ctx, `${labels.score} ${stats.score}  ${labels.best} ${stats.best.score}`, cx, cy - 7, big(theme, theme.text, { align: 'center', baseline: 'middle' }));
  const line = fill(labels.runStats, { distance: stats.distance, coins: stats.coins, kills: stats.kills, flags: stats.flags });
  drawText(ctx, line, cx, cy + 4, mini(theme, 'rgba(255,255,255,0.8)', { align: 'center', baseline: 'middle' }));
  if (stats.newRecord) drawText(ctx, labels.newRecord, cx, cy + 15, big(theme, theme.textAccent, { align: 'center', baseline: 'middle' }));
  if (s.statusTimer > GAME_OVER_LOCK_FRAMES && blink) drawText(ctx, labels.restart, cx, cy + 27, big(theme, theme.text, { align: 'center', baseline: 'middle' }));
}
