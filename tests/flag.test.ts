import { FIRST_FLAG_TILES, GROUND_ROW, TILE } from '../src/core/constants';
import { isPole, Tile } from '../src/core/tiles';
import { scoreOf } from '../src/game/state';
import { flagPoints } from '../src/systems/flag';
import { assert, test } from './harness';
import { playing, run, until } from './helpers';
import type { GameState } from '../src/game/state';

function findPole(s: GameState): number {
  for (let c = 0; c < 2000; c++) {
    s.gen.ensure(c + 1);
    if (isPole(s.map.get(c, GROUND_ROW - 2))) return c;
  }
  throw new Error('no pole');
}

test('a flagpole appears FIRST_FLAG_TILES after the start', () => {
  const s = playing(5);
  const col = findPole(s);
  const startCol = Math.floor(s.startX / TILE);
  assert.ok(col - startCol >= FIRST_FLAG_TILES && col - startCol < FIRST_FLAG_TILES + 40, `pole at +${col - startCol}`);
});

test('flag points grow with grab height', () => {
  assert.equal(flagPoints(0), 10);
  assert.equal(flagPoints(3), 20);
  assert.equal(flagPoints(8), 100);
  assert.ok(flagPoints(6) > flagPoints(4));
});

test('running into the pole on the ground grabs it (10 pts), slides, then runs on', () => {
  const s = playing(5);
  const col = findPole(s);
  // Teleport Mario onto the flat ground just before the pole.
  Object.assign(s.mario, { x: (col - 2) * TILE, y: GROUND_ROW * TILE - s.mario.h, vy: 0, dir: 1 });
  s.cameraX = s.mario.x - 100;
  s.entities = [];
  until(s, () => s.flag !== null);
  assert.equal(s.bonus, 10);
  const before = scoreOf(s);
  until(s, () => s.flag === null);
  run(s, 60);
  assert.ok(s.mario.x > (col + 1) * TILE, 'kept running right past the pole');
  assert.equal(s.mario.dir, 1);
  assert.equal(s.status, 'playing');
  assert.ok(scoreOf(s) >= before);
  assert.equal(s.bonus, 10, 'a pole pays once');
});

test('jumping from the staircase edge grabs high on the pole', () => {
  for (const seed of [5, 6, 7, 8]) {
    const s = playing(seed);
    const col = findPole(s);
    // The staircase's top is the nearest stair column left of the pole (its base block excluded).
    let top = col - 1;
    while (s.map.get(top, GROUND_ROW - 1) !== Tile.Hard) top -= 1;
    let topRow = GROUND_ROW;
    while (s.map.get(top, topRow - 1) === Tile.Hard) topRow -= 1;
    Object.assign(s.mario, { x: (top + 1) * TILE - s.mario.w - 1, y: topRow * TILE - s.mario.h, vy: 0, dir: 1, grounded: true });
    s.cameraX = s.mario.x - 100;
    s.entities = [];
    run(s, 1, [0]);
    until(s, () => s.flag !== null);
    assert.ok(s.bonus >= 30, `seed ${seed}: bonus ${s.bonus}`);
  }
});

test('cloud platforms are one-way: jump up through, land on top', () => {
  const s = playing();
  const col = Math.floor((s.mario.x + s.mario.w / 2) / TILE);
  for (let c = col - 2; c <= col + 6; c++) s.map.set(c, GROUND_ROW - 3, Tile.Cloud);
  run(s, 1, [0]);
  until(s, () => s.mario.grounded);
  assert.equal(s.mario.y + s.mario.h, (GROUND_ROW - 3) * TILE, 'standing on the cloud');
});
