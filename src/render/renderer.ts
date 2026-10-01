import type { BiomeId } from '../core/biome';
import { TILE, VIEW_HEIGHT } from '../core/constants';
import type { GameCredit, GameLabels } from '../core/options';
import type { GameTheme } from '../core/theme';
import type { GameStats } from '../core/types';
import type { GameState } from '../game/state';
import { drawEffects, drawEmerging, drawEntities, drawMario } from './drawActors';
import { drawHud, drawPrompts } from './drawOverlay';
import { drawScenery, type SceneryBlend } from './drawScenery';
import { liftProgress } from '../systems/lift';
import { drawCredit, drawPauseButton, drawPicker, drawPortrait, drawSoundButton, type UiView } from './drawUi';
import { drawTiles } from './drawWorld';

export interface RenderOptions {
  showHud: boolean;
  showPrompts: boolean;
  /** Parallax layers (the sky is always drawn when the theme has one). */
  scenery: boolean;
  /** In-canvas character portrait button. */
  characterButton: boolean;
  /** In-canvas speaker button. */
  soundButton: boolean;
  /** In-canvas pause button (in the portrait's slot while a run is on). */
  pauseButton: boolean;
  credit: GameCredit | null;
  /** One resolved theme per biome. */
  themes: Record<BiomeId, GameTheme>;
  labels: GameLabels;
  /** No screen shake, no weather particles. */
  reducedMotion: boolean;
}

/**
 * Background themes for this frame: while a biome border is on screen the next one fades in. At a
 * ground ↔ cloud border the switch waits for the pan instead, and slides with it.
 */
function sceneryThemes(s: GameState, themes: Record<BiomeId, GameTheme>): SceneryBlend {
  if (s.lift) {
    const { edge } = s.lift;
    const p = liftProgress(s);
    const d = (edge.rows * TILE) / 2;
    const up = edge.upper === 'right';
    const ground = themes[edge.lowerBiome];
    const clouds = themes.sky;
    return up
      ? { from: ground, to: clouds, blend: p, dyFrom: p * d, dyTo: -(1 - p) * d }
      : { from: clouds, to: ground, blend: p, dyFrom: -p * d, dyTo: (1 - p) * d };
  }
  const camCol = Math.floor(s.cameraX / TILE);
  const border = s.map.nextBoundary(camCol);
  if (border !== null && border * TILE < s.cameraX + s.viewWidth && !s.map.edges.some((e) => e.col === border)) {
    const from = themes[s.map.biomeAt(border - 1)];
    const to = themes[s.map.biomeAt(border)];
    return { from, to: to === from ? null : to, blend: (s.cameraX + s.viewWidth - border * TILE) / s.viewWidth };
  }
  return { from: themes[s.map.biomeAt(camCol)], to: null, blend: 0 };
}

/** Draws one frame. `scale` = device pixels per world pixel; `shake` = world-layer offset (px). */
export function render(
  ctx: CanvasRenderingContext2D,
  s: GameState,
  stats: GameStats,
  opts: RenderOptions,
  ui: UiView,
  scale: number,
  shake: { x: number; y: number } = { x: 0, y: 0 },
): void {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, s.viewWidth, VIEW_HEIGHT);
  const bg = sceneryThemes(s, opts.themes);
  const theme = opts.themes[s.biome];
  ctx.translate(Math.round(shake.x), Math.round(shake.y));
  drawScenery(ctx, s, bg, opts.scenery, !opts.reducedMotion);
  drawEmerging(ctx, s);
  drawTiles(ctx, s, opts.themes);
  drawEntities(ctx, s);
  drawMario(ctx, s, ui.character);
  drawEffects(ctx, s);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  if (opts.showHud) {
    const portraitSlot = opts.characterButton || opts.pauseButton;
    drawHud(ctx, s, stats, opts.labels, theme, { portrait: portraitSlot, sound: opts.soundButton }, !!opts.credit);
  }
  if (opts.soundButton) drawSoundButton(ctx, s.viewWidth, ui.muted);
  const running = s.status === 'playing';
  if (opts.pauseButton && running) drawPauseButton(ctx, s.viewWidth, ui.paused, opts.soundButton);
  else if (opts.characterButton) drawPortrait(ctx, s.viewWidth, ui, theme, opts.soundButton);
  if (opts.credit) drawCredit(ctx, opts.credit, ui.canChangeCharacter, theme);
  if (ui.pickerOpen) drawPicker(ctx, s.viewWidth, ui, theme, opts.labels);
  else if (opts.showPrompts) drawPrompts(ctx, s, stats, opts.labels, theme, ui.paused);
}
