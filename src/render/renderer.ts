import { VIEW_HEIGHT } from '../core/constants';
import type { GameCredit, GameLabels } from '../core/options';
import type { GameTheme } from '../core/theme';
import type { GameStats } from '../core/types';
import type { GameState } from '../game/state';
import { drawEffects, drawEmerging, drawEntities, drawMario } from './drawActors';
import { drawHud, drawPrompts } from './drawOverlay';
import { drawScenery } from './drawScenery';
import { drawCredit, drawPicker, drawPortrait, drawSoundButton, type UiView } from './drawUi';
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
  credit: GameCredit | null;
  theme: GameTheme;
  labels: GameLabels;
}

/** Draws one frame. `scale` = device pixels per world pixel (the canvas backing store is scaled). */
export function render(ctx: CanvasRenderingContext2D, s: GameState, stats: GameStats, opts: RenderOptions, ui: UiView, scale: number): void {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, s.viewWidth, VIEW_HEIGHT);
  drawScenery(ctx, s, opts.theme, opts.scenery);
  drawEmerging(ctx, s);
  drawTiles(ctx, s, opts.theme);
  drawEntities(ctx, s);
  drawMario(ctx, s, ui.character);
  drawEffects(ctx, s);
  if (opts.showHud) {
    drawHud(ctx, s, stats, opts.labels, opts.theme, { portrait: opts.characterButton, sound: opts.soundButton }, !!opts.credit);
  }
  if (opts.soundButton) drawSoundButton(ctx, s.viewWidth, ui.muted);
  if (opts.characterButton) drawPortrait(ctx, s.viewWidth, ui, opts.theme, opts.soundButton);
  if (opts.credit) drawCredit(ctx, opts.credit, ui.canChangeCharacter, opts.theme);
  if (ui.pickerOpen) drawPicker(ctx, s.viewWidth, ui, opts.theme, opts.labels);
  else if (opts.showPrompts) drawPrompts(ctx, s, stats, opts.labels, opts.theme);
}
