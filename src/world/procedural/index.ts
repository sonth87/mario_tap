import type { Rng } from '../../core/rng';
import { parseChunk, type ChunkDef, type ParsedChunk } from '../chunkParser';
import { getChunks } from '../chunks';
import { blocks, clouds, coins, powerups, skyPrizes } from './air';
import { flagpole } from './flag';
import type { ChunkGrid } from './grid';
import { bigGaps, cannons, gaps, gauntlet, pipes, stairs, wall } from './terrain';

type Generator = (rng: Rng, tier: number) => ChunkGrid;

interface Kind {
  id: string;
  /** Pick weight per tier 0..3 (0 = not yet). */
  weights: [number, number, number, number];
  make: Generator;
}

/**
 * Procedural chunk kinds. Every kind's parameter ranges are proven beatable by sampling hundreds of
 * seeds per tier in `pnpm validate` (docs/level-design.md). `static` = the hand-made set pieces.
 */
export const KINDS: Kind[] = [
  { id: 'blocks', weights: [4, 3, 3, 2], make: blocks },
  { id: 'pipes', weights: [2, 3, 3, 3], make: pipes },
  { id: 'gaps', weights: [2, 3, 3, 3], make: gaps },
  { id: 'stairs', weights: [1, 2, 2, 2], make: stairs },
  { id: 'coins', weights: [2, 1, 1, 1], make: coins },
  { id: 'wall', weights: [1, 1, 1, 1], make: wall },
  { id: 'clouds', weights: [0, 1, 2, 2], make: clouds },
  { id: 'cannons', weights: [0, 1, 2, 2], make: cannons },
  { id: 'powerups', weights: [3, 2, 2, 2], make: powerups },
  { id: 'skyPrizes', weights: [1, 2, 2, 2], make: skyPrizes },
  { id: 'bigGaps', weights: [0, 0, 2, 3], make: bigGaps },
  { id: 'gauntlet', weights: [0, 0, 2, 2], make: gauntlet },
];

const STATIC_WEIGHT = [2, 2, 2, 2];

export function generateKind(kind: Kind, rng: Rng, tier: number): ChunkDef {
  return kind.make(rng, tier).toDef(kind.id, tier);
}

/**
 * Picks a chunk for `tier`: a procedural kind (fresh random layout) or a hand-made set piece,
 * never the same kind twice in a row.
 */
export function nextChunk(rng: Rng, tier: number, lastId: string): ParsedChunk {
  const statics = getChunks().filter((c) => c.tier <= tier);
  const options = [
    ...KINDS.filter((k) => k.weights[tier] > 0 && k.id !== lastId).map((k) => ({ w: k.weights[tier], kind: k })),
    ...(lastId === 'static' ? [] : [{ w: STATIC_WEIGHT[tier], kind: null }]),
  ];
  let roll = rng.next() * options.reduce((s, o) => s + o.w, 0);
  const chosen = options.find((o) => (roll -= o.w) < 0) ?? options[0];
  if (!chosen.kind) {
    const c = statics[Math.floor(rng.next() * statics.length)];
    return { ...c, id: 'static' };
  }
  return parseChunk(generateKind(chosen.kind, rng, tier));
}

export function nextFlag(rng: Rng): ParsedChunk {
  return parseChunk(flagpole(rng).toDef('flagpole', 0));
}
