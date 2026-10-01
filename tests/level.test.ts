import type { BiomeId } from '../src/core/biome';
import { MAX_RUN_SPEED, RUN_SPEED, TILE } from '../src/core/constants';
import { createRng } from '../src/core/rng';
import { parseChunk } from '../src/world/chunkParser';
import { getChunks } from '../src/world/chunks';
import { LevelGenerator } from '../src/world/generator';
import { TileMap } from '../src/world/tileMap';
import { checkChunk, ColumnMap, solve } from '../src/world/solver';
import { VIEW_ROWS } from '../src/core/constants';
import { assert, test } from './harness';

test('every shipped chunk passes the solver', () => {
  for (const c of getChunks()) assert.deepEqual(checkChunk(c).errors, [], c.id);
});

test('solver rejects a 6-tile wall and an unreachable floating block', () => {
  const wall = parseChunk({ id: 'wall6', tier: 0, rows: ['...S...', '...S...', '...S...', '...S...', '...S...', '...S...', '#######'] });
  assert.ok(checkChunk(wall).errors.includes('small Mario cannot pass'));
  const high = parseChunk({
    id: 'high', tier: 0,
    rows: ['...B...', '.......', '.......', '.......', '.......', '.......', '.......', '#######'],
  });
  assert.ok(checkChunk(high).errors.some((e) => e.startsWith('top of col 3')));
});

test('parser rejects wide pits, unknown chars and ragged rows', () => {
  assert.throws(() => parseChunk({ id: 'pit', tier: 0, rows: ['##       ##'] }), /pit wider/);
  assert.throws(() => parseChunk({ id: 'bad', tier: 0, rows: ['..X..', '#####'] }), /unknown char/);
  assert.throws(() => parseChunk({ id: 'rag', tier: 0, rows: ['....', '#####'] }), /wide/);
});

function build(seed: number, cols: number, biomes?: BiomeId[]): { map: TileMap; gen: LevelGenerator; spawns: number } {
  const map = new TileMap();
  const gen = new LevelGenerator(map, createRng(seed), 0, biomes);
  gen.runway(6);
  return { map, gen, spawns: gen.ensure(cols).length };
}

test('generator is deterministic per seed', () => {
  const a = build(42, 400).map;
  const b = build(42, 400).map;
  for (let c = 0; c < 400; c++) for (let r = 0; r < VIEW_ROWS; r++) assert.equal(a.get(c, r), b.get(c, r));
});

test('tiers unlock with distance and cap at 3', () => {
  const { gen } = build(1, 10);
  assert.equal(gen.tierAt(0), 0);
  assert.equal(gen.tierAt(260), 1);
  assert.equal(gen.tierAt(100000), 3);
});

function stretch(seed: number, cols: number, biomes: BiomeId[]): ColumnMap {
  const { map } = build(seed, cols, biomes);
  return new ColumnMap(Array.from({ length: cols }, (_, c) => Uint8Array.from({ length: VIEW_ROWS }, (_, r) => map.get(c, r))));
}

test('long generated stretches are passable for small and big Mario, slow and fast', () => {
  for (const seed of [1, 7, 99]) {
    const cols = 1200;
    const cm = stretch(seed, cols, ['grass']);
    for (const speed of seed === 1 ? [RUN_SPEED, MAX_RUN_SPEED] : [RUN_SPEED]) {
      assert.ok(solve(cm, false, (cols - 30) * TILE, speed).passable, `seed ${seed} small @${speed}`);
      assert.ok(solve(cm, true, (cols - 30) * TILE, speed).passable, `seed ${seed} big @${speed}`);
    }
  }
});

test('long icy stretches (snow biome) are passable too', () => {
  for (const seed of [31]) {
    const cols = 360;
    const cm = stretch(seed, cols, ['snow']);
    assert.ok(cm.get(5, 11) === 19, 'snow ground is ice');
    assert.ok(solve(cm, false, (cols - 30) * TILE).passable, `seed ${seed} small`);
    assert.ok(solve(cm, true, (cols - 30) * TILE, MAX_RUN_SPEED).passable, `seed ${seed} big fast`);
  }
});

test('solver flags stationary power-ups that are floating or out of reach', () => {
  const floating = parseChunk({ id: 'floating', tier: 0, rows: ['...$...', '.......', '.......', '.......', '#######'] });
  assert.ok(checkChunk(floating).errors.some((e) => e.includes('floating')));
  const tooHigh = parseChunk({
    id: 'toohigh', tier: 0,
    rows: ['...$...', '...B...', '.......', '.......', '.......', '.......', '.......', '.......', '#######'],
  });
  assert.ok(checkChunk(tooHigh).errors.some((e) => e.includes('unreachable')));
  const ok = parseChunk({ id: 'ok', tier: 0, rows: ['...$...', '...BB..', '.......', '.......', '#######'] });
  assert.deepEqual(checkChunk(ok).errors, []);
});

test('pits up to 4 wide are open, 5-6 wide ones always come with a platform', () => {
  const open = parseChunk({ id: 'p4', tier: 0, rows: ['#####    #####'] });
  assert.deepEqual(checkChunk(open).errors, []);
  const bare = parseChunk({ id: 'p6', tier: 0, rows: ['#####      #####'] });
  assert.ok(checkChunk(bare).errors.includes('small Mario cannot pass'), 'a bare 6-wide pit is impossible');
  const withBrick = parseChunk({
    id: 'p6b', tier: 0,
    rows: ['........BB......', '................', '................', '#####      #####'.padEnd(16, '#')],
  });
  assert.deepEqual(checkChunk(withBrick).errors, []);
});
