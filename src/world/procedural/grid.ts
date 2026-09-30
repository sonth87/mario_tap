import type { Rng } from '../../core/rng';
import type { ChunkDef } from '../chunkParser';

/** Highest line a chunk may use (line 0 = ground surface; the parser allows 12 rows). */
export const MAX_LINE = 11;

/**
 * Mutable chunk canvas addressed by (x, line) where line 0 is the ground-surface row and line k is
 * k tiles above it (a block on line 4 has 3 empty tiles under it). Starts as flat ground; `toDef`
 * emits the bottom-aligned `rows` format the chunk parser reads (docs/level-design.md).
 */
export class ChunkGrid {
  private readonly lines: string[][];

  constructor(readonly width: number) {
    this.lines = Array.from({ length: MAX_LINE + 1 }, (_, line) => Array.from({ length: width }, () => (line === 0 ? '#' : '.')));
  }

  get(x: number, line: number): string {
    return this.lines[line]?.[x] ?? '.';
  }

  set(x: number, line: number, ch: string): void {
    if (x < 0 || x >= this.width || line < 0 || line > MAX_LINE) return;
    this.lines[line][x] = ch;
  }

  /** Horizontal run on one line. */
  row(x: number, line: number, len: number, ch: string): void {
    for (let i = 0; i < len; i++) this.set(x + i, line, ch);
  }

  /** Vertical run from line 1 up to `height` (a column standing on the ground). */
  column(x: number, height: number, ch: string): void {
    for (let line = 1; line <= height; line++) this.set(x, line, ch);
  }

  pit(x: number, width: number): void {
    for (let i = 0; i < width; i++) this.set(x + i, 0, ' ');
  }

  isEmpty(x: number, line: number): boolean {
    return this.get(x, line) === '.';
  }

  /** Columns with ground and 3 free tiles above (room for a walker and the player). */
  groundSpots(from = 2, to = this.width - 2): number[] {
    const spots: number[] = [];
    for (let x = from; x < to; x++) {
      if (this.get(x, 0) === '#' && this.isEmpty(x, 1) && this.isEmpty(x, 2) && this.isEmpty(x, 3)) spots.push(x);
    }
    return spots;
  }

  toDef(id: string, tier: number): ChunkDef {
    let top = 0;
    this.lines.forEach((cells, line) => {
      if (cells.some((c) => c !== '.' && c !== '#' && c !== ' ')) top = Math.max(top, line);
    });
    const rows: string[] = [];
    for (let line = top; line >= 0; line--) rows.push(this.lines[line].join(''));
    return { id, tier, rows };
  }
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng.next() * items.length)];
}

export function chance(rng: Rng, p: number): boolean {
  return rng.next() < p;
}
