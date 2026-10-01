/**
 * `pnpm validate` — proves chunks are beatable with the real physics (docs/level-design.md):
 * small & big Mario can cross, every block / pipe / stair / cloud top can be stood on. Checks every
 * hand-made chunk plus SAMPLES random layouts of every procedural kind at every tier and of the
 * flagpole, in every biome whose terrain differs (grass, snow = ice, castle fire bars), at the
 * starting speed (passable + reachable) and at the top speed levels (passable).
 * Exits 1 on any failure and prints the failing layout. `SAMPLES=500 pnpm validate` for a deeper sweep.
 */
import type { BiomeId } from '../src/core/biome';
import { MAX_RUN_SPEED, MAX_TIER, RUN_SPEED } from '../src/core/constants';
import { createRng } from '../src/core/rng';
import { decorateChunk } from '../src/world/biomeDecor';
import { parseChunk, type ChunkDef, type ParsedChunk } from '../src/world/chunkParser';
import { getChunks } from '../src/world/chunks';
import { Tile } from '../src/core/tiles';
import { flagpole } from '../src/world/procedural/flag';
import { ascent, vineExit } from '../src/world/procedural/sky';
import { generateKind, KINDS, kindWeight } from '../src/world/procedural';
import { checkChunk } from '../src/world/solver';

const SAMPLES = Number(process.env.SAMPLES ?? 60);
/** Speeds to prove passability at: the start (also reachability) and the top speed. */
const SPEEDS = [RUN_SPEED, MAX_RUN_SPEED];
/** Ice layouts are ~20× slower to solve; a quarter of the samples keeps `validate` around a minute. */
const samplesFor = (biome: BiomeId): number => (biome === 'grass' ? SAMPLES : Math.ceil(SAMPLES / 4));
/** Desert terrain is grass terrain (only enemies differ); the castle adds fire-bar chunks. */
const TERRAIN_BIOMES: BiomeId[] = ['grass', 'snow', 'castle'];
let checked = 0;
let failed = 0;

function report(chunk: ParsedChunk, label: string, rows?: string[], goalTile?: number): void {
  checked += 1;
  const errors = SPEEDS.flatMap((speed, i) =>
    checkChunk(chunk, { speed, reach: i === 0, goalTile }).errors.map((e) => (i ? `${e} @ speed ${speed.toFixed(2)}` : e)),
  );
  if (!errors.length) return;
  failed += 1;
  if (failed <= 12) console.error(`✖ ${label}\n    ${errors.slice(0, 4).join('\n    ')}${rows ? `\n${rows.map((r) => `      |${r}|`).join('\n')}` : ''}`);
}

function check(def: ChunkDef, label: string, tier: number, biome: BiomeId): void {
  report(decorateChunk(parseChunk(def), createRng(1), tier, biome), `${label} [${biome}]`, def.rows);
}

for (const biome of TERRAIN_BIOMES) {
  if (biome === 'castle') continue;
  for (const c of getChunks()) report(decorateChunk(c, createRng(1), c.tier, biome), `static ${c.id} [${biome}]`);
}
console.log(`static: ${getChunks().length} hand-made chunks × grass / snow`);

for (const kind of KINDS) {
  const before = failed;
  for (const biome of TERRAIN_BIOMES) {
    for (let tier = 0; tier <= MAX_TIER; tier++) {
      if (!kindWeight(kind, tier, biome) || (biome === 'castle' && kind.biomes === undefined)) continue;
      for (let i = 0; i < samplesFor(biome); i++) {
        const seed = tier * 100003 + i * 7919 + 17;
        check(generateKind(kind, createRng(seed), tier), `${kind.id} tier ${tier} seed ${seed}`, tier, biome);
      }
    }
  }
  console.log(`${failed === before ? '✔' : '✖'} ${kind.id}`);
}
for (const biome of ['grass', 'snow'] as const) {
  for (let i = 0; i < samplesFor(biome); i++) check(flagpole(createRng(i * 31 + 5)).toDef('flagpole', 0), `flagpole seed ${i * 31 + 5}`, 0, biome);
}
// The way into the sky (from any ground biome's terrain) and the vine back down.
const beforeSky = failed;
for (const biome of ['grass', 'snow'] as const) {
  for (let tier = 0; tier <= MAX_TIER; tier++) {
    for (let i = 0; i < samplesFor(biome); i++) check(ascent(createRng(i * 13 + tier), tier).toDef('ascent', tier), `ascent tier ${tier} seed ${i}`, tier, biome);
  }
}
for (let i = 0; i < SAMPLES; i++) {
  const def = vineExit(createRng(i * 17 + 3)).toDef('vine', 0);
  report(decorateChunk(parseChunk(def), createRng(1), 0, 'sky'), `vine seed ${i}`, def.rows, Tile.Vine);
}
console.log(`${failed === beforeSky ? '✔' : '✖'} ascent / vine`);
console.log(`\n${checked - failed}/${checked} layouts valid (${SAMPLES} samples per kind × tier, ¼ of that on ice / castle; ${SPEEDS.length} speeds)`);
if (failed) process.exit(1);
