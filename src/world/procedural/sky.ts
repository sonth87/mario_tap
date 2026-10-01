import { ASCENT_TOP_LINE, VINE_BOTTOM_ROW } from '../../core/constants';
import type { Rng } from '../../core/rng';
import { chance, ChunkGrid, MAX_LINE, pick } from './grid';

/** Step lines of the climb, bottom → top (always ending on ASCENT_TOP_LINE). */
const ASCENTS: number[][] = [
  [3, 6, 9],
  [3, 5, 7, 9],
  [3, 6, 7, 9],
  [3, 4, 6, 7, 9],
  [3, 5, 6, 8, 9],
];

/**
 * The climb to the clouds (end of the biome before the sky): 3–5 floating hard steps, each higher,
 * 1–2 tiles apart, the last one on ASCENT_TOP_LINE against the chunk's last column, a wall as tall
 * as it (the cloud layer starts right after it). Landing on
 * the top step starts the lift (systems/lift.ts). Miss a step and Mario runs on under them into
 * the wall, bounces back and gets another go.
 */
export function ascent(rng: Rng, tier: number): ChunkGrid {
  const lines = pick(rng, tier <= 1 ? ASCENTS.slice(0, 3) : ASCENTS);
  const grid = new ChunkGrid(48);
  let x = 4;
  lines.forEach((line, i) => {
    const top = i === lines.length - 1;
    const len = top ? 3 : rng.int(2, 3);
    grid.row(x, line, len, 'S');
    if (!top && chance(rng, 0.5)) grid.set(x + rng.int(0, len - 1), line + 1, 'o');
    x += len + (top ? 0 : rng.int(1, 2));
  });
  grid.column(x, ASCENT_TOP_LINE, 'S');
  // The chunk ends with the wall: after the pan, the top step + wall top are the floor that leads
  // straight onto the clouds (anything to the right of the wall would drop out of view as a pit).
  return trimmed(grid, x + 1);
}

/**
 * The way down (end of the sky): two cloud steps, then a vine hanging from the top of the screen
 * down to VINE_BOTTOM_ROW — touch it (from the top step, or with a well-timed jump from the floor)
 * to ride it back to the ground. Past the vine a solid cloud wall sends a missed jump back for
 * another try.
 */
export function vineExit(rng: Rng): ChunkGrid {
  const grid = new ChunkGrid(40);
  let x = 4;
  for (const line of [3, 5]) {
    const len = rng.int(2, 3);
    grid.row(x, line, len, '=');
    if (chance(rng, 0.5)) grid.set(x + rng.int(0, len - 1), line + 1, 'o');
    x += len + rng.int(1, 2);
  }
  const vine = x + 1;
  for (let line = MAX_LINE - VINE_BOTTOM_ROW; line <= MAX_LINE; line++) grid.set(vine, line, 'V');
  const wall = vine + 4;
  grid.column(wall, MAX_LINE, '@');
  return trimmed(grid, wall + 3);
}

function trimmed(grid: ChunkGrid, width: number): ChunkGrid {
  const out = new ChunkGrid(width);
  for (let x = 0; x < width; x++) for (let line = 0; line <= MAX_LINE; line++) out.set(x, line, grid.get(x, line));
  return out;
}
