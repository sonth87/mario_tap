import type { BiomeId } from '../core/biome';
import { VIEW_ROWS } from '../core/constants';
import { Tile } from '../core/tiles';

/** Read-only view used by physics (the chunk solver passes its own implementation). */
export interface TileQuery {
  get(col: number, row: number): number;
}

/**
 * A border between the ground layer and the cloud layer (sky biome). Both are stored in the same
 * 13 rows; `rows` = how far the view has to pan between them. `upper` says which side of `col` is
 * the cloud layer: 'right' for the climb up (cloud columns start at `col`), 'left' for the vine
 * down (columns before `col` are clouds). systems/lift.ts pans the view and then rewrites the
 * on-screen columns of the side being left, so afterwards everything is one layer again.
 */
export interface LayerEdge {
  col: number;
  upper: 'left' | 'right';
  rows: number;
  /** Climb: the row of the top step (landing on it starts the lift). Vine: the vine's column. */
  trigger: number;
  /** Ground biome under the clouds (drawn below the cloud layer while the edge is on screen). */
  lowerBiome: BiomeId;
}

interface MultiCoinState {
  hits: number;
  firstFrame: number;
}

/**
 * Column-streamed tile storage. Columns are created by the generator ahead of the camera and
 * pruned behind it, so memory stays flat however far the run goes. Missing cells read as empty
 * (above the screen, below it = falling out, pruned columns are behind the left screen wall).
 */
export class TileMap implements TileQuery {
  private cols = new Map<number, Uint8Array>();
  private multiCoin = new Map<number, MultiCoinState>();
  /** Biome boundaries, ascending: each biome runs from its column to the next boundary. */
  private biomes: Array<{ col: number; biome: BiomeId }> = [{ col: -Infinity, biome: 'grass' }];
  /** Pending ground ↔ cloud borders, ascending. */
  readonly edges: LayerEdge[] = [];

  get(col: number, row: number): number {
    if (row < 0 || row >= VIEW_ROWS) return Tile.Empty;
    return this.cols.get(col)?.[row] ?? Tile.Empty;
  }

  set(col: number, row: number, tile: number): void {
    if (row < 0 || row >= VIEW_ROWS) return;
    let column = this.cols.get(col);
    if (!column) {
      column = new Uint8Array(VIEW_ROWS);
      this.cols.set(col, column);
    }
    column[row] = tile;
  }

  /** Records a hit on a multi-coin brick and returns the running hit count. */
  hitMultiCoin(col: number, row: number, frame: number): MultiCoinState {
    const key = col * VIEW_ROWS + row;
    const state = this.multiCoin.get(key) ?? { hits: 0, firstFrame: frame };
    state.hits += 1;
    this.multiCoin.set(key, state);
    return state;
  }

  /** Every column from `col` on belongs to `biome` (until a later boundary). */
  setBiome(col: number, biome: BiomeId): void {
    if (col === -Infinity || !this.biomes.length) {
      this.biomes = [{ col: -Infinity, biome }];
      return;
    }
    this.biomes = this.biomes.filter((b) => b.col < col);
    this.biomes.push({ col, biome });
  }

  biomeAt(col: number): BiomeId {
    for (let i = this.biomes.length - 1; i > 0; i--) if (col >= this.biomes[i].col) return this.biomes[i].biome;
    return this.biomes[0].biome;
  }

  /** Moves the biome boundary at `from` to `to` (the visible stretch repaints in the new biome). */
  moveBoundary(from: number, to: number): void {
    const b = this.biomes.find((x) => x.col === from);
    if (b) b.col = to;
    this.biomes.sort((a, c) => a.col - c.col);
  }

  /** The pending layer edge at / ahead of the view (null when none is near). */
  edgeNear(fromCol: number, toCol: number): LayerEdge | null {
    return this.edges.find((e) => e.col >= fromCol - 40 && e.col <= toCol + 40) ?? null;
  }

  removeEdge(edge: LayerEdge): void {
    const i = this.edges.indexOf(edge);
    if (i >= 0) this.edges.splice(i, 1);
  }

  /** First column of the biome boundary after `col`, or null. */
  nextBoundary(col: number): number | null {
    for (const b of this.biomes) if (b.col > col) return b.col;
    return null;
  }

  /** Last boundary at or before `col` (its start column), or null when `col` is in the first biome. */
  boundaryAt(col: number): number | null {
    for (let i = this.biomes.length - 1; i > 0; i--) if (col >= this.biomes[i].col) return this.biomes[i].col;
    return null;
  }

  /** Drops every column left of `minCol`. */
  pruneBefore(minCol: number): void {
    // Keep the boundary the pruned area sits in (and one before it, for the sky cross-fade).
    while (this.biomes.length > 2 && this.biomes[2].col < minCol) this.biomes.shift();
    for (const col of this.cols.keys()) if (col < minCol) this.cols.delete(col);
    for (const key of this.multiCoin.keys()) if (Math.floor(key / VIEW_ROWS) < minCol) this.multiCoin.delete(key);
  }

  get columnCount(): number {
    return this.cols.size;
  }
}
