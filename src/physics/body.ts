import { TILE } from '../core/constants';
import { isSolid, isStandable, Tile } from '../core/tiles';
import type { Body } from '../core/types';
import type { TileQuery } from '../world/tileMap';

const EPS = 0.001;

export function overlaps(a: Body, b: Body): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function rowSpan(b: Body): [number, number] {
  return [Math.floor(b.y / TILE), Math.floor((b.y + b.h - EPS) / TILE)];
}

function colSpan(b: Body): [number, number] {
  return [Math.floor(b.x / TILE), Math.floor((b.x + b.w - EPS) / TILE)];
}

/** True when any tile under the box is solid. */
export function hitsSolid(b: Body, map: TileQuery): boolean {
  const [c0, c1] = colSpan(b);
  const [r0, r1] = rowSpan(b);
  for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) if (isSolid(map.get(c, r))) return true;
  return false;
}

export interface WallHit {
  col: number;
  /** Lowest blocking row (largest index) — used to tell ground-standing obstacles from floating blocks. */
  row: number;
}

/** Moves horizontally by `dx` (|dx| < TILE); returns the blocking cell, or null when the move was free. */
export function moveXHit(b: Body, map: TileQuery, dx: number): WallHit | null {
  if (dx === 0) return null;
  b.x += dx;
  const [r0, r1] = rowSpan(b);
  const col = dx > 0 ? Math.floor((b.x + b.w - EPS) / TILE) : Math.floor(b.x / TILE);
  let hit: WallHit | null = null;
  for (let r = r0; r <= r1; r++) if (isSolid(map.get(col, r))) hit = { col, row: r };
  if (hit) b.x = dx > 0 ? col * TILE - b.w : (col + 1) * TILE;
  return hit;
}

/** Moves horizontally by `dx` (|dx| < TILE). Returns true when a wall stopped the move. */
export function moveX(b: Body, map: TileQuery, dx: number): boolean {
  return moveXHit(b, map, dx) !== null;
}

/**
 * True when the blocking cell is part of a structure that stands on the ground — every cell from
 * it down to the ground row is solid (pipes, walls, stairs). Floating block rows are not.
 */
export function standsOnGround(map: TileQuery, hit: WallHit, groundRow: number): boolean {
  for (let r = hit.row; r <= groundRow; r++) if (!isSolid(map.get(hit.col, r))) return false;
  return true;
}

export interface MoveYResult {
  landed: boolean;
  /** Row of the ceiling tile that stopped an upward move, or -1. */
  ceilingRow: number;
  /** Columns of the solid ceiling tiles that were hit. */
  ceilingCols: number[];
}

/** Applies gravity and moves vertically, resolving floor / ceiling contacts. */
export function moveY(b: Body, map: TileQuery, gravity: number, maxFall: number): MoveYResult {
  b.vy = Math.min(b.vy + gravity, maxFall);
  b.y += b.vy;
  const result: MoveYResult = { landed: false, ceilingRow: -1, ceilingCols: [] };
  const [c0, c1] = colSpan(b);
  if (b.vy > 0) {
    const row = Math.floor((b.y + b.h - EPS) / TILE);
    // One-way clouds only catch a body whose feet were above the platform top last frame.
    const wasAbove = b.y + b.h - b.vy <= row * TILE + EPS;
    for (let c = c0; c <= c1; c++) {
      const t = map.get(c, row);
      if (!isSolid(t) && !(t === Tile.Cloud && wasAbove)) continue;
      b.y = row * TILE - b.h;
      b.vy = 0;
      result.landed = true;
      break;
    }
  } else if (b.vy < 0) {
    const row = Math.floor(b.y / TILE);
    for (let c = c0; c <= c1; c++) if (isSolid(map.get(c, row))) result.ceilingCols.push(c);
    if (result.ceilingCols.length) {
      b.y = (row + 1) * TILE;
      b.vy = 0;
      result.ceilingRow = row;
    }
  }
  b.grounded = result.landed;
  return result;
}

/** True when the tile just past the leading foot cannot be stood on (used by red koopas). */
export function atLedge(b: Body, map: TileQuery): boolean {
  const footX = b.vx > 0 ? b.x + b.w + 1 : b.x - 1;
  return !isStandable(map.get(Math.floor(footX / TILE), Math.floor((b.y + b.h + 1) / TILE)));
}
