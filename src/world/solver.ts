import { GROUND_ROW, MARIO_BIG_HEIGHT, MARIO_SMALL_HEIGHT, MARIO_WIDTH, TILE, VIEW_HEIGHT, VIEW_ROWS } from '../core/constants';
import { isPickup, isSolid, isStandable, Tile } from '../core/tiles';
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
function fly(m: MarioBody, map: TileQuery): MarioBody | null {
  for (let i = 0; i < MAX_AIR_FRAMES; i++) {
    stepMarioBody(m, map, false, 0);
    if (m.y > VIEW_HEIGHT) return null;
    if (m.grounded) return m;
  }
  return null;
}

/**
 * Exhaustive search over "jump on this frame or not" from every grounded state.
 * Airborne motion is deterministic (one button, fixed jump), so the graph stays small.
 * Enemies and breakable bricks are ignored — terrain alone must be passable.
 */
export function solve(map: ColumnMap, big: boolean, goalX: number): SolveResult {
  const h = big ? MARIO_BIG_HEIGHT : MARIO_SMALL_HEIGHT;
  const start: MarioBody = {
    x: TILE, y: GROUND_ROW * TILE - h, w: MARIO_WIDTH, h, vx: 0, vy: 0, grounded: true, dir: 1, jumpBuffer: 0, coyote: 0,
  };
  const seen = new Set<string>();
  const stoodOn = new Set<string>();
  const queue: MarioBody[] = [start];
  let passable = false;
  while (queue.length) {
    const s = queue.pop() as MarioBody;
    const key = `${Math.round(s.x * 100)}|${Math.round(s.y)}|${s.dir}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (s.x >= goalX) passable = true;
    markFeet(s, map, stoodOn);
    const walk = clone(s);
    stepMarioBody(walk, map, false, 0);
    const walked = walk.grounded ? walk : fly(walk, map);
    if (walked) queue.push(walked);
    const jump = clone(s);
    stepMarioBody(jump, map, true, 0);
    const landed = fly(jump, map);
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

/**
 * Checks one chunk: passable small & big, and every exposed top of a block / pipe / stair / wall /
 * cloud platform can be stood on. Ground tiles are exempt: landing past the foot of a tall obstacle legitimately
 * skips the ground cell right behind it.
 */
export function checkChunk(chunk: ParsedChunk): ChunkReport {
  const cols = [
    ...Array.from({ length: PAD }, flatColumn),
    ...chunk.columns,
    ...Array.from({ length: PAD }, flatColumn),
  ];
  const map = new ColumnMap(cols);
  const goalX = (PAD + chunk.width + 1) * TILE;
  const errors: string[] = [];
  const small = solve(map, false, goalX);
  if (!small.passable) errors.push('small Mario cannot pass');
  if (!solve(map, true, goalX).passable) errors.push('big Mario cannot pass');
  for (let dx = 0; dx < chunk.width; dx++) {
    for (let row = 1; row <= GROUND_ROW; row++) {
      const col = PAD + dx;
      const tile = map.get(col, row);
      if (!isStandable(tile) || tile === Tile.Ground || isSolid(map.get(col, row - 1))) continue;
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
