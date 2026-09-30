import { GROUND_ROW, TILE, VIEW_ROWS } from '../src/core/constants';
import { createRng } from '../src/core/rng';
import { isPole, Tile } from '../src/core/tiles';
import { TileMap } from '../src/world/tileMap';
import { LevelGenerator } from '../src/world/generator';
import { flagpole } from '../src/world/procedural/flag';
import { generateKind, KINDS } from '../src/world/procedural';
import { parseChunk } from '../src/world/chunkParser';
import { assert, test } from './harness';

const layout = (kind: string, seed: number, tier: number): string => {
  const k = KINDS.find((x) => x.id === kind);
  if (!k) throw new Error(kind);
  return generateKind(k, createRng(seed), tier).rows.join('|');
};

test('every procedural kind yields many distinct layouts', () => {
  for (const k of KINDS) {
    const tier = k.weights.findIndex((w) => w > 0);
    const seen = new Set(Array.from({ length: 60 }, (_, i) => layout(k.id, i + 1, tier)));
    assert.ok(seen.size >= 8, `${k.id}: only ${seen.size} distinct layouts`);
  }
});

function stats(seed: number, cols: number) {
  const map = new TileMap();
  const gen = new LevelGenerator(map, createRng(seed), 0);
  gen.runway(6);
  const spawns = gen.ensure(cols);
  const pipeHeights = new Set<number>();
  const pitWidths = new Set<number>();
  let pit = 0;
  for (let c = 0; c < cols; c++) {
    if (map.get(c, GROUND_ROW) === Tile.Empty) pit += 1;
    else if (pit) { pitWidths.add(pit); pit = 0; }
    if (map.get(c, GROUND_ROW - 1) === Tile.Pipe) {
      let h = 0;
      while (map.get(c, GROUND_ROW - 1 - h) === Tile.Pipe) h += 1;
      pipeHeights.add(h);
    }
  }
  return { spawns, pipeHeights, pitWidths, map };
}

test('a long run mixes pipe heights, pit widths and enemy kinds', () => {
  const { spawns, pipeHeights, pitWidths } = stats(11, 1500);
  assert.ok(pipeHeights.size >= 3, `pipe heights ${[...pipeHeights]}`);
  assert.ok(pitWidths.size >= 3, `pit widths ${[...pitWidths]}`);
  const kinds = new Set(spawns.map((s) => s.kind));
  for (const k of ['goomba', 'koopa', 'paratroopa'] as const) assert.ok(kinds.has(k), `no ${k}`);
  assert.ok(spawns.length >= 1500 / 25, `only ${spawns.length} enemies in 1500 columns`);
});

test('enemies come in groups and cannons / clouds appear in long runs', () => {
  const { map, spawns } = stats(3, 2500);
  const cols = spawns.map((s) => s.col).sort((a, b) => a - b);
  assert.ok(cols.some((c, i) => i >= 2 && c - cols[i - 2] <= 6), 'no group of 3');
  let cannon = false;
  let cloud = false;
  for (let c = 0; c < 2500; c++) for (let r = 0; r < VIEW_ROWS; r++) {
    if (map.get(c, r) === Tile.CannonTop) cannon = true;
    if (map.get(c, r) === Tile.Cloud) cloud = true;
  }
  assert.ok(cannon && cloud, `cannon ${cannon}, cloud ${cloud}`);
});

test('flagpole height varies (6..9) so the bonus ceiling varies too', () => {
  const tops = new Set<number>();
  for (let i = 0; i < 40; i++) {
    const c = parseChunk(flagpole(createRng(i * 13 + 1)).toDef('flagpole', 0));
    const col = c.columns.find((column) => column.some((t) => isPole(t)));
    assert.ok(col);
    tops.add(GROUND_ROW - col.findIndex((t) => isPole(t)));
  }
  assert.ok(tops.size >= 3 && Math.min(...tops) >= 6 && Math.max(...tops) <= 9, `pole tops ${[...tops]}`);
});

test('pits never exceed the 6-tile cap', () => {
  const { map } = stats(5, 800);
  let run = 0;
  for (let c = 0; c < 800; c++) {
    run = map.get(c, GROUND_ROW) === Tile.Empty ? run + 1 : 0;
    assert.ok(run <= 6, `pit of ${run} at ${c}`);
  }
  assert.ok(TILE === 16);
});
