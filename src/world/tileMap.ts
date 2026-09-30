import { VIEW_ROWS } from '../core/constants';
import { Tile } from '../core/tiles';

/** Read-only view used by physics (the chunk solver passes its own implementation). */
export interface TileQuery {
  get(col: number, row: number): number;
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

  /** Drops every column left of `minCol`. */
  pruneBefore(minCol: number): void {
    for (const col of this.cols.keys()) if (col < minCol) this.cols.delete(col);
    for (const key of this.multiCoin.keys()) if (Math.floor(key / VIEW_ROWS) < minCol) this.multiCoin.delete(key);
  }

  get columnCount(): number {
    return this.cols.size;
  }
}
