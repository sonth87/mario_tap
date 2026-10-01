import { GROUND_ROW, MARIO_BIG_HEIGHT, MARIO_SMALL_HEIGHT, MARIO_WIDTH, RUN_SPEED, TILE, VIEW_HEIGHT, VIEW_ROWS } from '../core/constants';
import { isGround, isPickup, isSolid, isStandable, Tile } from '../core/tiles';
import type { MarioBody } from '../core/types';
import { stepMarioBody } from '../physics/marioPhysics';
import type { ParsedChunk } from './chunkParser';
import type { TileQuery } from './tileMap';

const MAX_AIR_FRAMES = 600;
const PAD = 6;

/** Static column map for headless simulation. */
export class ColumnMap implements TileQuery {
  constructor(readonly columns: Uint8Array[]) {}
  get(col: number, row: number): number {
    if (row < 0 || row >= VIEW_ROWS) return Tile.Empty;
    return this.columns[col]?.[row] ?? Tile.Empty;
  }
}

export function flatColumn(): Uint8Array {
  const c = new Uint8Array(VIEW_ROWS);
  c[GROUND_ROW] = Tile.Ground;
  c[GROUND_ROW + 1] = Tile.Ground;
  return c;
}

/** Keeps only the ground rows of a column (pads a chunk with flat ground of the same kind). */
function flatten(column: Uint8Array): Uint8Array {
  const out = new Uint8Array(VIEW_ROWS);
  out[GROUND_ROW] = column[GROUND_ROW] || Tile.Ground;
  out[GROUND_ROW + 1] = Tile.Ground;
  return out;
}

export interface SolveResult {
  /** Mario can reach the right end. */
  passable: boolean;
  /** "col,row" of every solid tile Mario stood on. */
  stoodOn: Set<string>;
  states: number;
}

function clone(m: MarioBody): MarioBody {
  return { ...m };
}

/** Simulates without input until Mario is grounded again; null if he falls out of the world. */
function fly(m: MarioBody, map: TileQuery, touch?: (m: MarioBody) => void): MarioBody | null {
  for (let i = 0; i < MAX_AIR_FRAMES; i++) {
    stepMarioBody(m, map, false, 0);
    touch?.(m);
    if (m.y > VIEW_HEIGHT) return null;
    if (m.grounded) return m;
  }
  return null;
}

/** True when the body overlaps a cell holding `tile`. */
export function touchesTile(m: MarioBody, map: TileQuery, tile: number): boolean {
  for (let c = Math.floor(m.x / TILE); c <= Math.floor((m.x + m.w - 0.001) / TILE); c++) {
    for (let r = Math.floor(m.y / TILE); r <= Math.floor((m.y + m.h - 0.001) / TILE); r++) if (map.get(c, r) === tile) return true;
  }
  return false;
}

/**
 * Exhaustive search over "jump on this frame or not" from every grounded state.
 * Airborne motion is deterministic (one button, fixed jump), so the graph stays small.
 * Enemies and breakable bricks are ignored — terrain alone must be passable.
 */
/**
 * @param goalTile when set, touching a cell of this tile at any moment (in the air too) also counts
 *                 as getting through — the vine at the end of the sky.
 */
export function solve(map: ColumnMap, big: boolean, goalX: number, speed = RUN_SPEED, goalTile?: number): SolveResult {
  const h = big ? MARIO_BIG_HEIGHT : MARIO_SMALL_HEIGHT;
  const start: MarioBody = {
    x: TILE, y: GROUND_ROW * TILE - h, w: MARIO_WIDTH, h, vx: speed, vy: 0, grounded: true, dir: 1, jumpBuffer: 0, coyote: 0, speed, grip: 0,
  };
  const seen = new Set<string>();
  const stoodOn = new Set<string>();
  const queue: MarioBody[] = [start];
  let passable = false;
  const touch = goalTile === undefined ? undefined : (m: MarioBody): void => {
    if (!passable && touchesTile(m, map, goalTile)) passable = true;
  };
  while (queue.length) {
    const s = queue.pop() as MarioBody;
    const key = `${Math.round(s.x * 100)}|${Math.round(s.y)}|${s.dir}|${Math.round(s.vx * 100)}|${s.grip}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (s.x >= goalX) passable = true;
    touch?.(s);
    markFeet(s, map, stoodOn);
    const walk = clone(s);
    stepMarioBody(walk, map, false, 0);
    const walked = walk.grounded ? walk : fly(walk, map, touch);
    if (walked) queue.push(walked);
    const jump = clone(s);
    stepMarioBody(jump, map, true, 0);
    touch?.(jump);
    const landed = fly(jump, map, touch);
    if (landed) queue.push(landed);
  }
  return { passable, stoodOn, states: seen.size };
}

function markFeet(m: MarioBody, map: TileQuery, out: Set<string>): void {
  const row = Math.floor((m.y + m.h + 0.5) / TILE);
  for (let c = Math.floor(m.x / TILE); c <= Math.floor((m.x + m.w - 0.001) / TILE); c++) {
    if (isStandable(map.get(c, row))) out.add(`${c},${row}`);
  }
}

export interface ChunkReport {
  id: string;
  errors: string[];
}

export interface CheckOptions {
  /** Run speed to check at (default: the starting speed). */
  speed?: number;
  /** Touching this tile counts as getting through (the sky's exit vine). */
  goalTile?: number;
  /**
   * Also require every block top / prize to be reachable (default true). Faster runs only have to
   * stay passable: a prize that is easy at the start speed may be overshot later, which is fine.
   */
  reach?: boolean;
}

/**
 * Checks one chunk: passable small & big, and every exposed top of a block / pipe / stair / wall /
 * cloud platform can be stood on. Ground tiles are exempt: landing past the foot of a tall obstacle legitimately
 * skips the ground cell right behind it.
 */
export function checkChunk(chunk: ParsedChunk, opts: CheckOptions = {}): ChunkReport {
  const { speed = RUN_SPEED, reach = true, goalTile } = opts;
  // Padding matches the chunk's own surface (ice chunks sit between ice).
  const cols = [
    ...Array.from({ length: PAD }, () => flatten(chunk.columns[0])),
    ...chunk.columns,
    ...Array.from({ length: PAD }, () => flatten(chunk.columns[chunk.width - 1])),
  ];
  const map = new ColumnMap(cols);
  const goalX = (PAD + chunk.width + 1) * TILE;
  const errors: string[] = [];
  // With a goal tile, walking out past the end does not count (the vine must be reached).
  const end = goalTile === undefined ? goalX : Infinity;
  const small = solve(map, false, end, speed, goalTile);
  if (!small.passable) errors.push('small Mario cannot pass');
  if (!solve(map, true, end, speed, goalTile).passable) errors.push('big Mario cannot pass');
  if (!reach) return { id: chunk.id, errors };
  for (let dx = 0; dx < chunk.width; dx++) {
    for (let row = 1; row <= GROUND_ROW; row++) {
      const col = PAD + dx;
      const tile = map.get(col, row);
      // Empty blocks (fire bar hubs) are scenery, not something the player is meant to reach.
      if (!isStandable(tile) || isGround(tile) || tile === Tile.Used || isSolid(map.get(col, row - 1))) continue;
      if (!small.stoodOn.has(`${col},${row}`)) errors.push(`top of col ${dx} row ${row} is unreachable`);
    }
  }
  // A stationary power-up must sit on a platform Mario can actually stand on (that is how it is eaten).
  for (let dx = 0; dx < chunk.width; dx++) {
    for (let row = 0; row < GROUND_ROW; row++) {
      const col = PAD + dx;
      if (!isPickup(map.get(col, row))) continue;
      if (!isStandable(map.get(col, row + 1))) errors.push(`pickup at col ${dx} row ${row} is floating in mid-air`);
      else if (!small.stoodOn.has(`${col},${row + 1}`)) errors.push(`pickup at col ${dx} row ${row} is unreachable`);
    }
  }
  return { id: chunk.id, errors };
}
