import type { Rng } from '../../core/rng';
import { chance, pick, type ChunkGrid } from './grid';

/** Ground walker for a tier: goombas early, koopas and hopping paratroopas later. */
function walker(rng: Rng, tier: number): string {
  if (tier >= 1 && chance(rng, 0.2)) return 'p';
  if (chance(rng, 0.2 + tier * 0.08)) return 'k';
  return 'g';
}

/**
 * Groups of 1–3 enemies (1–2 tiles apart) on free ground. More and bigger groups as tiers rise;
 * from tier 2 a red winged koopa may hover in the air above the path.
 */
export function addEnemies(grid: ChunkGrid, rng: Rng, tier: number, from = 3, to = grid.width - 2): void {
  const groups = rng.int(tier === 0 ? 0 : 1, tier <= 1 ? 1 : 2);
  for (let g = 0; g < groups; g++) {
    const spots = grid.groundSpots(from, to);
    if (!spots.length) return;
    let x = pick(rng, spots);
    const size = rng.int(1, tier === 0 ? 2 : 3);
    const kind = walker(rng, tier);
    for (let i = 0; i < size; i++) {
      if (!spots.includes(x)) break;
      grid.set(x, 1, kind);
      x += rng.int(2, 3);
    }
  }
  if (tier >= 2 && chance(rng, 0.35)) {
    const spots = grid.groundSpots(from, to).filter((x) => grid.isEmpty(x, 4) && grid.isEmpty(x, 5));
    if (spots.length) grid.set(pick(rng, spots), rng.int(4, 5), 'f');
  }
}
