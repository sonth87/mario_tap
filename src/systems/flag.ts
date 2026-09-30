import { FLAG_HOLD_FRAMES, FLAG_POINTS, FLAG_SLIDE_SPEED, GROUND_Y, TILE } from '../core/constants';
import { isPole, Tile } from '../core/tiles';
import type { GameState } from '../game/state';

/**
 * Horizontal band (px from the pole column's left edge) that counts as touching the pole. It starts
 * 1 px left of the column so that running into the pole's 1-tile base block also grabs the pole
 * (otherwise the block would turn Mario around first).
 */
const POLE_LEFT = -1;
const POLE_RIGHT = 10;
/** Pole shaft centre, px from the column's left edge (Mario hangs with his right edge here). */
const POLE_CENTRE = 7;

export function flagPoints(heightTiles: number): number {
  for (const [min, points] of FLAG_POINTS) if (heightTiles >= min) return points;
  return FLAG_POINTS[FLAG_POINTS.length - 1][1];
}

/** Topmost pole row of the column, or -1 when there is no pole. */
function poleTopRow(s: GameState, col: number): number {
  for (let row = 0; row < GROUND_Y / TILE; row++) if (isPole(s.map.get(col, row))) return row;
  return -1;
}

/**
 * Starts the flag sequence when Mario crosses a pole's line at ANY height — jumping over the top
 * still grabs the top — so a flagpole can never be skipped. Returns true when it started.
 */
export function tryGrabFlag(s: GameState): boolean {
  const m = s.mario;
  for (let col = Math.floor(m.x / TILE); col <= Math.floor((m.x + m.w) / TILE); col++) {
    if (s.usedPoles.has(col)) continue;
    const top = poleTopRow(s, col);
    if (top < 0) continue;
    const lineL = col * TILE + POLE_LEFT;
    const lineR = col * TILE + POLE_RIGHT;
    if (m.x + m.w < lineL || m.x >= lineR) continue;
    const poleTopY = top * TILE;
    const feet = Math.max(m.y + m.h, poleTopY + TILE);
    const heightTiles = Math.max(0, Math.floor((GROUND_Y - feet) / TILE));
    const points = flagPoints(heightTiles);
    s.bonus += points;
    s.effects.push({ kind: 'score', x: col * TILE + 12, y: feet - m.h, vx: 0, vy: -0.4, life: 70, text: `+${points}` });
    s.usedPoles.add(col);
    m.x = col * TILE + POLE_CENTRE - m.w;
    m.y = feet - m.h;
    m.vy = 0;
    m.dir = 1;
    let baseRow = top;
    while (isPole(s.map.get(col, baseRow))) baseRow += 1;
    s.flag = { col, flagY: poleTopY + TILE, baseY: baseRow * TILE, phase: 'slide', timer: 0 };
    s.events.push('flag');
    return true;
  }
  return false;
}

/** Slide down with the flag, hold, then hop to the far side of the pole and run on. */
export function stepFlag(s: GameState): void {
  const f = s.flag;
  if (!f) return;
  const m = s.mario;
  if (f.phase === 'slide') {
    m.y = Math.min(m.y + FLAG_SLIDE_SPEED, f.baseY - m.h);
    f.flagY = Math.min(f.flagY + FLAG_SLIDE_SPEED, f.baseY - TILE);
    if (m.y >= f.baseY - m.h && f.flagY >= f.baseY - TILE) f.phase = 'hold';
    return;
  }
  f.timer += 1;
  if (f.timer < FLAG_HOLD_FRAMES) return;
  m.x = f.col * TILE + POLE_RIGHT;
  m.grounded = s.map.get(f.col, f.baseY / TILE) !== Tile.Empty;
  m.dir = 1;
  s.flag = null;
}
