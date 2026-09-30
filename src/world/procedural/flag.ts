import type { Rng } from '../../core/rng';
import { ChunkGrid, pick } from './grid';

/**
 * Flagpole milestone with variety: staircase 3–5 high (2-wide top), 2–3 tiles of ground, then a
 * pole whose top is 6–9 tiles up. A lower pole caps the bonus lower (points follow grab height).
 */
export function flagpole(rng: Rng): ChunkGrid {
  const h = rng.int(3, 5);
  const pole = rng.int(Math.max(6, h + 2), 9);
  const gap = pick(rng, [2, 3]);
  const poleX = 3 + h + 1 + gap;
  const grid = new ChunkGrid(poleX + 6);
  for (let i = 1; i <= h; i++) grid.column(2 + i, i, 'S');
  grid.column(3 + h, h, 'S');
  grid.set(poleX, 1, 'S');
  for (let line = 2; line < pole; line++) grid.set(poleX, line, '|');
  grid.set(poleX, pole, '^');
  return grid;
}
