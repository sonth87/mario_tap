import { GROUND_ROW, GROUND_Y, LIFT_FRAMES, LIFT_POINTS, TILE, VIEW_ROWS } from '../core/constants';
import { Tile } from '../core/tiles';
import type { GameState } from '../game/state';
import type { LayerEdge } from '../world/tileMap';
import { flagPoints, speedUp } from './flag';

/** Ground ↔ cloud pan in progress (the world is frozen meanwhile, like on the flagpole). */
export interface LiftState {
  edge: LayerEdge;
  timer: number;
  /** Mario's y when it started. */
  startY: number;
  /** Rode the vine (then slides down it after the pan). */
  vine: boolean;
}

const ease = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export function liftProgress(s: GameState): number {
  return s.lift ? ease(Math.min(1, s.lift.timer / LIFT_FRAMES)) : 0;
}

const colOf = (x: number): number => Math.floor(x / TILE);

export function isUpper(edge: LayerEdge, col: number): boolean {
  return edge.upper === 'right' ? col >= edge.col : col < edge.col;
}

/** The layer edge that matters for this frame: the one being ridden, or a pending one near the view. */
export function activeEdge(s: GameState): LayerEdge | null {
  if (s.lift) return s.lift.edge;
  const first = colOf(s.cameraX);
  return s.map.edgeNear(first, first + Math.ceil(s.viewWidth / TILE));
}

/** How far (px) the view stands above the ground layer: 0 = looking at the ground, D = at the clouds. */
export function viewRise(s: GameState, edge: LayerEdge): number {
  const d = edge.rows * TILE;
  const atClouds = edge.upper === 'left'; // before the vine we are up in the clouds
  if (s.lift?.edge !== edge) return atClouds ? d : 0;
  const p = liftProgress(s);
  return atClouds ? (1 - p) * d : p * d;
}

/** Vertical draw offset (px) of world column `col`: each layer is drawn where the view puts it. */
export function columnOffset(s: GameState, col: number): number {
  const edge = activeEdge(s);
  if (!edge) return 0;
  const v = viewRise(s, edge);
  return isUpper(edge, col) ? v - edge.rows * TILE : v;
}

/** False for things in the other layer than Mario while a border is near (they wait, untouchable). */
export function sameLayer(s: GameState, x: number): boolean {
  const edge = activeEdge(s);
  if (!edge) return true;
  return isUpper(edge, colOf(x)) === isUpper(edge, colOf(s.mario.x + s.mario.w / 2));
}

function vineTouched(s: GameState): boolean {
  const m = s.mario;
  for (let c = colOf(m.x); c <= colOf(m.x + m.w - 0.001); c++) {
    for (let r = Math.max(0, colOf(m.y)); r <= Math.min(VIEW_ROWS - 1, colOf(m.y + m.h - 0.001)); r++) if (s.map.get(c, r) === Tile.Vine) return true;
  }
  return false;
}

/**
 * Starts a pan when Mario lands on the top step of the climb / touches the vine. Fallbacks make the
 * border impossible to slip past: crossing it any other way starts the pan too.
 */
export function tryLift(s: GameState): boolean {
  const edge = activeEdge(s);
  if (!edge) return false;
  const m = s.mario;
  const centre = m.x + m.w / 2;
  if (edge.upper === 'right') {
    const onTop = m.grounded && Math.abs(m.y + m.h - edge.trigger * TILE) < 0.5 && colOf(centre) < edge.col;
    if (!onTop && centre < edge.col * TILE) return false;
    start(s, edge, false);
    s.bonus += LIFT_POINTS;
    s.effects.push({ kind: 'score', x: m.x, y: m.y - 8, vx: 0, vy: -0.4, life: 70, text: `+${LIFT_POINTS}` });
    return true;
  }
  const vine = vineTouched(s);
  if (!vine && centre < (edge.trigger + 5) * TILE) return false;
  if (vine) {
    const points = flagPoints(Math.max(0, Math.floor((GROUND_Y - (m.y + m.h)) / TILE)));
    s.bonus += points;
    s.effects.push({ kind: 'score', x: edge.trigger * TILE + 12, y: m.y, vx: 0, vy: -0.4, life: 70, text: `+${points}` });
    m.x = edge.trigger * TILE + 7 - m.w;
    m.dir = 1;
  }
  start(s, edge, vine);
  return true;
}

function start(s: GameState, edge: LayerEdge, vine: boolean): void {
  s.mario.vy = 0;
  s.lift = { edge, timer: 0, startY: s.mario.y, vine };
  s.flags += 1;
  s.events.push('lift');
}

/** One frame of the pan. Going down, Mario keeps his place on screen while the clouds rise past him. */
export function stepLift(s: GameState): void {
  const lift = s.lift;
  if (!lift) return;
  lift.timer += 1;
  const d = lift.edge.rows * TILE;
  if (lift.edge.upper === 'left') s.mario.y = lift.startY + d * liftProgress(s);
  if (lift.timer >= LIFT_FRAMES) finish(s, lift);
}

/** Surface tile of the ground biome under the clouds. */
function ground(edge: LayerEdge, row: number): number {
  return edge.lowerBiome === 'snow' && row === GROUND_ROW ? Tile.Ice : Tile.Ground;
}

/**
 * Pan done: rewrite the visible columns of the layer being left in the new layer's rows, so the
 * world is one layer again and the picture does not jump. Up: the ground side moves down `rows`
 * (the top step becomes floor-level). Down: the cloud side moves up `rows` and gets ground below.
 */
function finish(s: GameState, lift: LiftState): void {
  const { edge } = lift;
  const k = edge.rows;
  const m = s.mario;
  const from = colOf(s.cameraX) - 2;
  const up = edge.upper === 'right';
  for (let col = from; col < edge.col; col++) {
    const old = Array.from({ length: VIEW_ROWS }, (_, r) => s.map.get(col, r));
    for (let r = 0; r < VIEW_ROWS; r++) {
      const src = up ? r - k : r + k;
      s.map.set(col, r, src >= 0 && src < VIEW_ROWS ? old[src] : Tile.Empty);
    }
    if (!up) {
      s.map.set(col, GROUND_ROW, ground(edge, GROUND_ROW));
      s.map.set(col, GROUND_ROW + 1, Tile.Ground);
    }
  }
  s.entities = s.entities.filter((e) => colOf(e.x + e.w / 2) >= edge.col);
  if (up) {
    if (colOf(m.x + m.w / 2) < edge.col) m.y += k * TILE;
    else m.y = GROUND_Y - m.h;
  } else {
    m.y -= k * TILE;
  }
  s.map.moveBoundary(edge.col, from);
  s.map.removeEdge(edge);
  s.lift = null;
  if (up) {
    speedUp(s);
    return;
  }
  // Down: a vine stands from the top of the screen to a base block on the ground; slide down it.
  const vine = edge.trigger;
  for (let r = 0; r < GROUND_ROW - 1; r++) s.map.set(vine, r, Tile.Vine);
  s.map.set(vine, GROUND_ROW - 1, Tile.Hard);
  if (lift.vine) {
    s.usedPoles.add(vine);
    s.flag = { col: vine, flagY: (GROUND_ROW - 2) * TILE, baseY: (GROUND_ROW - 1) * TILE, phase: 'slide', timer: 0 };
  } else {
    speedUp(s);
  }
}
