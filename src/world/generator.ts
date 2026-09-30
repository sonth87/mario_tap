import {
  FIRST_FLAG_TILES,
  FLAG_INTERVAL_TILES,
  GROUND_ROW,
  MAX_TIER,
  SPACER_MAX_TILES,
  SPACER_MIN_TILES,
  TIER_DISTANCE,
} from '../core/constants';
import type { Rng } from '../core/rng';
import { Tile } from '../core/tiles';
import type { SpawnRequest } from '../core/types';
import type { ParsedChunk } from './chunkParser';
import { nextChunk, nextFlag } from './procedural';
import type { TileMap } from './tileMap';

/**
 * Streams the infinite level into a TileMap: flat spacer → chunk → spacer → … Chunks are mostly
 * procedural (procedural/: fresh random layout each time) plus hand-made set pieces; harder kinds
 * unlock with distance and a flagpole milestone (also randomised) comes every FLAG_INTERVAL_TILES.
 * The same seed always builds the same level.
 */
export class LevelGenerator {
  /** Next column to be written. */
  private nextCol = 0;
  private lastId = '';
  private nextFlagCol: number;

  constructor(
    private readonly map: TileMap,
    private readonly rng: Rng,
    /** Column where scoring starts (the runway start), for tier computation. */
    private readonly originCol: number,
  ) {
    this.nextFlagCol = originCol + FIRST_FLAG_TILES;
  }

  /** Writes a flat runway of `width` columns. */
  runway(width: number): void {
    for (let i = 0; i < width; i++) this.flat(this.nextCol++);
  }

  /** Generates until every column < `uptoCol` exists; returns the enemies to spawn. */
  ensure(uptoCol: number): SpawnRequest[] {
    const spawns: SpawnRequest[] = [];
    while (this.nextCol < uptoCol) {
      const spacer = this.rng.int(SPACER_MIN_TILES, SPACER_MAX_TILES);
      for (let i = 0; i < spacer; i++) this.flat(this.nextCol++);
      if (this.nextCol >= this.nextFlagCol) {
        this.place(nextFlag(this.rng), spawns);
        this.nextFlagCol += FLAG_INTERVAL_TILES;
        continue;
      }
      this.place(nextChunk(this.rng, this.tierAt(this.nextCol), this.lastId), spawns);
    }
    return spawns;
  }

  tierAt(col: number): number {
    return Math.min(MAX_TIER, Math.floor(Math.max(0, col - this.originCol) / TIER_DISTANCE));
  }

  private place(chunk: ParsedChunk, spawns: SpawnRequest[]): void {
    const base = this.nextCol;
    chunk.columns.forEach((column, dx) => column.forEach((tile, row) => this.map.set(base + dx, row, tile)));
    for (const s of chunk.spawns) spawns.push({ kind: s.kind, col: base + s.dx, row: s.row });
    this.nextCol += chunk.width;
    this.lastId = chunk.id;
  }

  private flat(col: number): void {
    this.map.set(col, GROUND_ROW, Tile.Ground);
    this.map.set(col, GROUND_ROW + 1, Tile.Ground);
  }
}
