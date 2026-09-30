import type { CharacterDef } from '../core/character';
import type { GameCredit, GameLabels } from '../core/options';
import type { GameTheme } from '../core/theme';
import { drawSprite } from './atlas';
import { creditRect, pickerLayout, portraitRect, soundRect, type Rect } from './uiLayout';

const FONT = 'ui-monospace, Menlo, Consolas, monospace';

export interface UiView {
  characters: CharacterDef[];
  character: CharacterDef;
  pickerOpen: boolean;
  muted: boolean;
  /** Portrait is clickable (before the first press / on game over). */
  canChangeCharacter: boolean;
  frame: number;
}

function box(ctx: CanvasRenderingContext2D, r: Rect, fill: string, stroke: string | null, radius = 3): void {
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }
}

/** Round, glassy HUD icon button. */
function roundButton(ctx: CanvasRenderingContext2D, r: Rect, ring: string): void {
  ctx.beginPath();
  ctx.arc(r.x + r.w / 2, r.y + r.h / 2, r.w / 2 - 0.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fill();
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = ring;
  ctx.stroke();
}

/** Current character's face in a round button; amber ring + a blinking arrow while it can be changed. */
export function drawPortrait(ctx: CanvasRenderingContext2D, viewWidth: number, ui: UiView, theme: GameTheme, withSound: boolean): void {
  const r = portraitRect(viewWidth, withSound);
  ctx.save();
  ctx.globalAlpha = ui.canChangeCharacter ? 1 : 0.5;
  roundButton(ctx, r, ui.canChangeCharacter ? theme.hud.credit : 'rgba(255,255,255,0.35)');
  ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
  ctx.scale(0.72, 0.72);
  drawSprite(ctx, ui.character.sprites.smallStand, -8, -8, { palette: ui.character.palette });
  ctx.restore();
  if (ui.canChangeCharacter && Math.floor(ui.frame / 30) % 2 === 0) {
    ctx.fillStyle = theme.hud.credit;
    ctx.fillRect(r.x + r.w / 2 - 2, r.y + r.h + 1, 4, 1);
    ctx.fillRect(r.x + r.w / 2 - 1, r.y + r.h + 2, 2, 1);
  }
}

/** Speaker button (strike-through bar when muted). */
export function drawSoundButton(ctx: CanvasRenderingContext2D, viewWidth: number, muted: boolean): void {
  const r = soundRect(viewWidth);
  roundButton(ctx, r, 'rgba(255,255,255,0.35)');
  const x = r.x + 4.5;
  const y = r.y + 4.5;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y + 2, 2, 3);
  ctx.fillRect(x + 2, y + 1, 1, 5);
  ctx.fillRect(x + 3, y, 1, 7);
  if (muted) {
    // Red ✕ where the sound waves would be.
    ctx.fillStyle = '#F87171';
    for (const [dx, dy] of [[5, 1.5], [6.3, 2.8], [5, 4.1], [6.3, 5.4], [6.3, 1.5], [5, 5.4]]) ctx.fillRect(x + dx, y + dy, 1.1, 1.1);
  } else {
    ctx.fillRect(x + 5, y + 2, 1, 3);
    ctx.fillRect(x + 6, y + 1, 1, 5);
  }
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string, theme: GameTheme): void {
  ctx.font = `bold ${size}px ${FONT}`;
  ctx.lineJoin = 'round';
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = theme.textOutline;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

/** Modal character picker: one card per character (big sprite + name), current one highlighted. */
export function drawPicker(ctx: CanvasRenderingContext2D, viewWidth: number, ui: UiView, theme: GameTheme, labels: GameLabels): void {
  const { panel, cards, compact } = pickerLayout(viewWidth, ui.characters.length);
  box(ctx, panel, theme.panel, 'rgba(255,255,255,0.25)', 5);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  label(ctx, labels.chooseCharacter, panel.x + panel.w / 2, panel.y + 7, 8, theme.textAccent, theme);
  ui.characters.forEach((c, i) => {
    const r = cards[i];
    const selected = c.id === ui.character.id;
    box(ctx, r, selected ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)', selected ? theme.textAccent : null);
    drawSprite(ctx, compact ? c.sprites.smallStand : c.sprites.bigStand, r.x + (r.w - 16) / 2, r.y + (compact ? 2 : 3), { palette: c.palette });
    label(ctx, c.name, r.x + r.w / 2, r.y + r.h - 10, 6, selected ? theme.textAccent : theme.text, theme);
  });
}

/** GitHub-style cat mark, 8×8. */
const CAT_MARK = [
  '.X....X.',
  '.XXXXXX.',
  'XX.XX.XX',
  'XXXXXXXX',
  'XXXXXXXX',
  '.XXXXXX.',
  '..X..X..',
  '..X..X..',
];

/** One palette object per colour: the sprite atlas caches by palette identity. */
const markPalettes = new Map<string, Record<string, string>>();
function markPalette(color: string): Record<string, string> {
  let p = markPalettes.get(color);
  if (!p) {
    p = { X: color };
    markPalettes.set(color, p);
  }
  return p;
}

/** Credit link (top-left): cat mark + amber text, underlined while clickable (between runs). */
export function drawCredit(ctx: CanvasRenderingContext2D, credit: GameCredit, clickable: boolean, theme: GameTheme): void {
  const r = creditRect(credit.text);
  ctx.save();
  ctx.globalAlpha = clickable ? 1 : 0.8;
  drawSprite(ctx, CAT_MARK, r.x + 2, r.y + 1, { palette: markPalette(theme.hud.credit) });
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `bold 6.6px ${FONT}`;
  ctx.fillStyle = theme.hud.credit;
  ctx.fillText(credit.text, r.x + 12, r.y + r.h / 2 + 0.5);
  if (clickable && credit.url) ctx.fillRect(r.x + 12, r.y + r.h - 0.5, r.w - 13, 0.7);
  ctx.restore();
}
