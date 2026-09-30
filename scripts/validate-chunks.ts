/**
 * `pnpm --filter @sonth87/mario-runner validate` — proves chunks are beatable with the real physics
 * (docs/level-design.md): small & big Mario can cross, every block / pipe / stair / cloud top can be
 * stood on. Checks every hand-made chunk plus SAMPLES random layouts of every procedural kind at
 * every tier and of the flagpole. Exits 1 on any failure and prints the failing layout.
 * `SAMPLES=500 pnpm validate` for a deeper sweep.
 */
import { MAX_TIER } from '../src/core/constants';
import { createRng } from '../src/core/rng';
import { parseChunk, type ChunkDef } from '../src/world/chunkParser';
import { getChunks } from '../src/world/chunks';
import { flagpole } from '../src/world/procedural/flag';
import { generateKind, KINDS } from '../src/world/procedural';
import { checkChunk } from '../src/world/solver';

const SAMPLES = Number(process.env.SAMPLES ?? 60);
let checked = 0;
let failed = 0;

function check(def: ChunkDef, label: string): void {
  checked += 1;
  const report = checkChunk(parseChunk(def));
  if (!report.errors.length) return;
  failed += 1;
  if (failed <= 12) console.error(`✖ ${label}\n    ${report.errors.slice(0, 4).join('\n    ')}\n${def.rows.map((r) => `      |${r}|`).join('\n')}`);
}

for (const c of getChunks()) {
  const report = checkChunk(c);
  checked += 1;
  if (report.errors.length) {
    failed += 1;
    console.error(`✖ static ${c.id}\n    ${report.errors.join('\n    ')}`);
  }
}
console.log(`static: ${getChunks().length} hand-made chunks`);

for (const kind of KINDS) {
  const before = failed;
  for (let tier = 0; tier <= MAX_TIER; tier++) {
    if (!kind.weights[tier]) continue;
    for (let i = 0; i < SAMPLES; i++) {
      const seed = tier * 100003 + i * 7919 + 17;
      check(generateKind(kind, createRng(seed), tier), `${kind.id} tier ${tier} seed ${seed}`);
    }
  }
  console.log(`${failed === before ? '✔' : '✖'} ${kind.id}`);
}
for (let i = 0; i < SAMPLES; i++) check(flagpole(createRng(i * 31 + 5)).toDef('flagpole', 0), `flagpole seed ${i * 31 + 5}`);
console.log(`\n${checked - failed}/${checked} layouts valid (${SAMPLES} samples per kind × tier)`);
if (failed) process.exit(1);
