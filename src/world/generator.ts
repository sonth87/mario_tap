import { BIOME_IDS, type BiomeId } from '../core/biome';
import {
  ASCENT_TOP_LINE,
  FIRST_FLAG_TILES,
  FLAG_INTERVAL_TILES,
  GROUND_ROW,
  MAX_TIER,
  SPACER_MAX_TILES,
  SPACER_MIN_TILES,
  TIER_DISTANCE,
  VINE_DROP_ROWS,
} from '../core/constants';
import type { Rng } from '../core/rng';
import { isPole, Tile } from '../core/tiles';
import type { SpawnRequest } from '../core/types';
import { decorateChunk } from './biomeDecor';
import type { ParsedChunk } from './chunkParser';
import { nextAscent, nextChunk, nextFlag, nextVine } from './procedural';
import type { TileMap } from './tileMap';

/**
 * Streams the infinite level into a TileMap: flat spacer → chunk → spacer → … Chunks are mostly
 * procedural (procedural/: fresh random layout each time) plus hand-made set pieces; harder kinds
 * unlock with distance and a flagpole milestone (also randomised) comes every FLAG_INTERVAL_TILES.
 * Each flagpole also moves the level on to the next biome (core/biome.ts) right past its pole.
 * The same seed always builds the same level.
 */
export class LevelGenerator {
  /** Next column to be written. */
  private nextCol = 0;
  private lastId = '';
  private nextFlagCol: number;
  private biomeIndex = 0;

  constructor(
    private readonly map: TileMap,
    private readonly rng: Rng,
    /** Column where scoring starts (the runway start), for tier computation. */
    private readonly originCol: number,
    /** Biome cycle; one entry = the whole run stays in that biome. */
    private readonly biomes: readonly BiomeId[] = BIOME_IDS,
  ) {
    this.nextFlagCol = originCol + FIRST_FLAG_TILES;
    map.setBiome(-Infinity, this.biome);
  }

  get biome(): BiomeId {
    return this.biomeAt(this.biomeIndex);
  }

  private biomeAt(index: number): BiomeId {
    return this.biomes[index % this.biomes.length] ?? 'grass';
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
        this.milestone(spawns);
        this.nextFlagCol += FLAG_INTERVAL_TILES;
        continue;
      }
      const tier = this.tierAt(this.nextCol);
      const chunk = nextChunk(this.rng, tier, this.lastId, this.biome);
      this.place(decorateChunk(chunk, this.rng, tier, this.biome), spawns);
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

  /**
   * End of a biome: a flagpole, or — into / out of the sky — the climb to the clouds / the vine back
   * down, which also register a layer edge for systems/lift.ts.
   */
  private milestone(spawns: SpawnRequest[]): void {
    const next = this.biomeAt(this.biomeIndex + 1);
    const cur = this.biome;
    if (next === 'sky' && cur !== 'sky') {
      this.place(this.surfaced(nextAscent(this.rng, this.tierAt(this.nextCol))), spawns);
      this.map.edges.push({ col: this.nextCol, upper: 'right', rows: ASCENT_TOP_LINE, trigger: GROUND_ROW - ASCENT_TOP_LINE, lowerBiome: cur });
      this.biomeIndex += 1;
      this.map.setBiome(this.nextCol, next);
      return;
    }
    if (cur === 'sky' && next !== 'sky') {
      const chunk = this.surfaced(nextVine(this.rng));
      const vineDx = chunk.columns.findIndex((column) => column.includes(Tile.Vine));
      const base = this.nextCol;
      this.place(chunk, spawns);
      this.map.edges.push({ col: this.nextCol, upper: 'left', rows: VINE_DROP_ROWS, trigger: base + vineDx, lowerBiome: next });
      this.biomeIndex += 1;
      this.map.setBiome(this.nextCol, next);
      return;
    }
    this.placeFlag(nextFlag(this.rng));
  }

  /** The chunk with its ground in this biome's material. */
  private surfaced(chunk: ParsedChunk): ParsedChunk {
    return { ...chunk, columns: chunk.columns.map((column) => column.map((tile, row) => this.surface(tile, row))) };
  }

  /** The flagpole chunk: the next biome starts on the column right after the pole. */
  private placeFlag(chunk: ParsedChunk): void {
    const poleDx = chunk.columns.findIndex((column) => column.some(isPole));
    const base = this.nextCol;
    chunk.columns.forEach((column, dx) => {
      if (dx === poleDx + 1) {
        this.biomeIndex += 1;
        this.map.setBiome(base + dx, this.biome);
      }
      column.forEach((tile, row) => this.map.set(base + dx, row, this.surface(tile, row)));
    });
    this.nextCol += chunk.width;
    this.lastId = chunk.id;
  }

  private flat(col: number): void {
    this.map.set(col, GROUND_ROW, this.surface(Tile.Ground, GROUND_ROW));
    this.map.set(col, GROUND_ROW + 1, this.surface(Tile.Ground, GROUND_ROW + 1));
  }

  /** Ground is ice on top in the snow biome, cloud in the sky. */
  private surface(tile: number, row: number): number {
    if (tile !== Tile.Ground) return tile;
    if (this.biome === 'sky') return Tile.CloudFloor;
    return row === GROUND_ROW && this.biome === 'snow' ? Tile.Ice : tile;
  }
}
