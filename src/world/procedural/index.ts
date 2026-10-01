import type { BiomeId } from '../../core/biome';
import type { Rng } from '../../core/rng';
import { parseChunk, type ChunkDef, type ParsedChunk } from '../chunkParser';
import { getChunks } from '../chunks';
import { blocks, clouds, coins, powerups, skyPrizes } from './air';
import { firebars } from './castle';
import { ascent, vineExit } from './sky';
import { flagpole } from './flag';
import type { ChunkGrid } from './grid';
import { bigGaps, cannons, gaps, gauntlet, pipes, stairs, wall } from './terrain';

type Generator = (rng: Rng, tier: number) => ChunkGrid;

interface Kind {
  id: string;
  /** Pick weight per tier 0..3 (0 = not yet). */
  weights: [number, number, number, number];
  make: Generator;
  /** Only in these biomes (default: all). */
  biomes?: BiomeId[];
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
  { id: 'firebars', weights: [3, 3, 4, 4], make: firebars, biomes: ['castle'] },
];

/** Per-biome weight multipliers (missing = ×1): what makes each biome play differently. */
const BIOME_BIAS: Record<BiomeId, Partial<Record<string, number>>> = {
  grass: {},
  desert: { gaps: 1.6, bigGaps: 1.5, cannons: 2.2, pipes: 0.6, clouds: 0.4, skyPrizes: 0.7 },
  snow: { clouds: 2, stairs: 1.6, gaps: 1.3, cannons: 0.5, wall: 1.4 },
  castle: { wall: 1.6, cannons: 1.5, clouds: 0.3, coins: 0.5, blocks: 0.7 },
  // No pipes up in the clouds (and no hand-made set pieces: they are full of them).
  sky: { pipes: 0, gauntlet: 0, static: 0, cannons: 0.4, wall: 0.5, stairs: 0.6, clouds: 2, gaps: 1.5, bigGaps: 1.3, coins: 1.5, skyPrizes: 1.5 },
};

/** Pick weight of a kind at a tier in a biome. */
export function kindWeight(kind: Kind, tier: number, biome: BiomeId): number {
  if (kind.biomes && !kind.biomes.includes(biome)) return 0;
  return kind.weights[tier] * (BIOME_BIAS[biome][kind.id] ?? 1);
}

const STATIC_WEIGHT = [2, 2, 2, 2];

export function generateKind(kind: Kind, rng: Rng, tier: number): ChunkDef {
  return kind.make(rng, tier).toDef(kind.id, tier);
}

/**
 * Picks a chunk for `tier`: a procedural kind (fresh random layout) or a hand-made set piece,
 * never the same kind twice in a row.
 */
export function nextChunk(rng: Rng, tier: number, lastId: string, biome: BiomeId = 'grass'): ParsedChunk {
  const statics = getChunks().filter((c) => c.tier <= tier);
  const options = [
    ...KINDS.filter((k) => kindWeight(k, tier, biome) > 0 && k.id !== lastId).map((k) => ({ w: kindWeight(k, tier, biome), kind: k })),
    ...(lastId === 'static' ? [] : [{ w: STATIC_WEIGHT[tier] * (BIOME_BIAS[biome].static ?? 1), kind: null }]),
  ];
  let roll = rng.next() * options.filter((o) => o.w > 0).reduce((s, o) => s + o.w, 0);
  const chosen = options.filter((o) => o.w > 0).find((o) => (roll -= o.w) < 0) ?? options[0];
  if (!chosen.kind) {
    const c = statics[Math.floor(rng.next() * statics.length)];
    return { ...c, id: 'static' };
  }
  return parseChunk(generateKind(chosen.kind, rng, tier));
}

export function nextFlag(rng: Rng): ParsedChunk {
  return parseChunk(flagpole(rng).toDef('flagpole', 0));
}

/** Ends the biome before the sky: the climb to the clouds. */
export function nextAscent(rng: Rng, tier: number): ParsedChunk {
  return parseChunk(ascent(rng, tier).toDef('ascent', tier));
}

/** Ends the sky: the vine back down. */
export function nextVine(rng: Rng): ParsedChunk {
  return parseChunk(vineExit(rng).toDef('vine', 0));
}
