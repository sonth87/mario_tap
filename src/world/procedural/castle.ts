import type { Rng } from '../../core/rng';
import { addEnemies } from './enemies';
import { chance, ChunkGrid, pick } from './grid';

/**
 * Castle fire bars ('x' = hub block the bar turns around, line 5: its reach stops 2¼ tiles above
 * the ground, so running past is safe and only JUMPING through the sweep is dangerous).
 * - open:   a lone bar over flat ground, coins inside its sweep as bait;
 * - wall:   a low hard wall to jump right under a bar — miss the timing and Mario bounces off the
 *           wall and comes back for another try (the one-button way to wait);
 * - double: two bars turning in sequence, the second one higher.
 */
export function firebars(rng: Rng, tier: number): ChunkGrid {
  const style = pick(rng, tier === 0 ? ['open', 'wall'] : ['open', 'wall', 'wall', 'double']);
  if (style === 'open') {
    const grid = new ChunkGrid(13);
    grid.set(6, 5, 'x');
    if (chance(rng, 0.7)) grid.row(4, 3, 5, 'o');
    addEnemies(grid, rng, Math.max(0, tier - 1), 9);
    return grid;
  }
  if (style === 'wall') {
    const h = tier >= 2 ? pick(rng, [2, 2, 3]) : 2;
    const before = chance(rng, 0.5);
    const grid = new ChunkGrid(14);
    grid.column(before ? 8 : 4, h, 'S');
    grid.set(before ? 5 : 7, 5, 'x');
    return grid;
  }
  const grid = new ChunkGrid(18);
  grid.set(5, 5, 'x');
  grid.column(9, 2, 'S');
  grid.set(12, 6, 'x');
  if (chance(rng, 0.5)) grid.row(11, 3, 3, 'o');
  return grid;
}
