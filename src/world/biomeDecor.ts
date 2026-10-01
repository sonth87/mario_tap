import { GROUND_ROW } from '../core/constants';
import type { BiomeId } from '../core/biome';
import type { Rng } from '../core/rng';
import { Tile } from '../core/tiles';
import type { ChunkSpawn, ParsedChunk } from './chunkParser';

/** Chance per pipe that a piranha plant lives in it, by tier. */
const PIRANHA_CHANCE = [0, 0.3, 0.45, 0.55];

/** Chance that a goomba becomes a Spiny, by biome (tier 0 halves it). */
const SPINY_CHANCE: Record<BiomeId, number> = { grass: 0, desert: 0.5, snow: 0, castle: 0.25, sky: 0 };

/** Left columns of every 2-wide pipe (pipes standing side by side pair up from the left). */
function pipeLefts(chunk: ParsedChunk): number[] {
  const lefts: number[] = [];
  let run = 0;
  chunk.columns.forEach((column, x) => {
    run = column[GROUND_ROW - 1] === Tile.Pipe ? run + 1 : 0;
    if (run % 2 === 0 && run > 0) lefts.push(x - 1);
  });
  return lefts;
}

function pipeTopRow(column: Uint8Array): number {
  let row = GROUND_ROW - 1;
  while (row > 0 && column[row - 1] === Tile.Pipe) row -= 1;
  return row;
}

/**
 * Applies a biome to a parsed chunk (returns a copy when anything changes): ice surface in the snow,
 * Spinies in the desert / castle, piranha plants in free pipes. Terrain is only changed for ice, so
 * the validator checks `decorate`d chunks exactly as they are played.
 */
export function decorateChunk(chunk: ParsedChunk, rng: Rng, tier: number, biome: BiomeId): ParsedChunk {
  const columns = biome === 'snow' ? chunk.columns.map((c) => iced(c)) : biome === 'sky' ? chunk.columns.map((c) => clouded(c)) : chunk.columns;
  const spawns: ChunkSpawn[] = chunk.spawns.map((sp) => {
    if (biome === 'sky') return skySpawn(sp, rng);
    const p = SPINY_CHANCE[biome] * (tier === 0 ? 0.5 : 1);
    return sp.kind === 'goomba' && rng.next() < p ? { ...sp, kind: 'spiny' } : sp;
  });
  // Sky: now and then a bird comes flying in at jump height.
  if (biome === 'sky' && rng.next() < 0.35 + tier * 0.1) spawns.push({ kind: 'bird', dx: chunk.width - 1, row: GROUND_ROW - 4 });
  const t = Math.min(tier, PIRANHA_CHANCE.length - 1);
  for (const x of pipeLefts(chunk)) {
    const top = pipeTopRow(chunk.columns[x]);
    const free = chunk.columns[x][top - 1] === Tile.Empty && chunk.columns[x + 1][top - 1] === Tile.Empty;
    if (free && rng.next() < PIRANHA_CHANCE[t]) spawns.push({ kind: 'piranha', dx: x, row: top - 1 });
  }
  return { ...chunk, columns, spawns };
}

/** Sky walkers: goombas become spike clouds (half of them), koopas stay (they look fine on clouds). */
function skySpawn(sp: ChunkSpawn, rng: Rng): ChunkSpawn {
  if (sp.kind !== 'goomba' && sp.kind !== 'spiny') return sp;
  return rng.next() < 0.5 ? { ...sp, kind: 'spikecloud' } : sp;
}

/** Ground → cloud floor (a copy). */
export function clouded(column: Uint8Array): Uint8Array {
  if (column[GROUND_ROW] !== Tile.Ground) return column;
  const out = Uint8Array.from(column);
  out[GROUND_ROW] = Tile.CloudFloor;
  out[GROUND_ROW + 1] = Tile.CloudFloor;
  return out;
}

/** Ground surface → ice (a copy). */
export function iced(column: Uint8Array): Uint8Array {
  if (column[GROUND_ROW] !== Tile.Ground) return column;
  const out = Uint8Array.from(column);
  out[GROUND_ROW] = Tile.Ice;
  return out;
}
