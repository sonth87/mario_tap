import { GROUND_ROW, GROUND_Y, LIFT_FRAMES, MAX_RUN_SPEED, RUN_SPEED, TILE } from '../src/core/constants';
import { BIOME_IDS } from '../src/core/biome';
import { isSolid, Tile } from '../src/core/tiles';
import { createEnemy } from '../src/entities/factory';
import { createState, type GameState } from '../src/game/state';
import { step } from '../src/game/step';
import type { LayerEdge } from '../src/world/tileMap';
import { assert, test } from './harness';
import { enemyAhead, playing, run, until, VIEW } from './helpers';

function started(biomes: Parameters<typeof createState>[2]): GameState {
  const s = createState(4, VIEW, biomes);
  step(s, true);
  s.entities = [];
  return s;
}

function edgeOf(s: GameState, upper: 'left' | 'right'): LayerEdge {
  for (let c = 0; c < 3000 && !s.map.edges.some((e) => e.upper === upper); c += 20) s.gen.ensure(c);
  const edge = s.map.edges.find((e) => e.upper === upper);
  if (!edge) throw new Error(`no ${upper} edge`);
  s.gen.ensure(edge.col + 60);
  return edge;
}

/** Puts Mario somewhere, with the camera following like in play. */
function place(s: GameState, x: number, y: number, grounded: boolean): void {
  Object.assign(s.mario, { x, y, vy: 0, dir: 1, grounded, hurtTimer: 0 });
  s.cameraX = x - 100;
  s.maxX = x;
  s.entities = [];
}

test('top speed is 150 % of the start speed', () => {
  assert.ok(Math.abs(MAX_RUN_SPEED / RUN_SPEED - 1.5) < 1e-9, `${MAX_RUN_SPEED / RUN_SPEED}`);
});

test('the default cycle goes castle → sky: a climb into the clouds, then a vine back down', () => {
  assert.deepEqual([...BIOME_IDS], ['grass', 'desert', 'snow', 'castle', 'sky']);
  const s = started({ biomes: ['castle', 'sky'] });
  const up = edgeOf(s, 'right');
  assert.equal(s.map.biomeAt(up.col - 1), 'castle');
  assert.equal(s.map.biomeAt(up.col), 'sky');
  assert.equal(s.map.get(up.col + 2, GROUND_ROW), Tile.CloudFloor, 'clouds are the floor of the sky');
  const down = edgeOf(s, 'left');
  assert.equal(s.map.biomeAt(down.col), 'castle');
  assert.ok(s.map.get(down.trigger, 0) === Tile.Vine, 'the vine hangs from the top');
});

test('landing on the top step pans up: the clouds become the floor and the run goes on up there', () => {
  const s = started({ biomes: ['castle', 'sky'] });
  const edge = edgeOf(s, 'right');
  let top = edge.col - 1;
  while (!isSolid(s.map.get(top, edge.trigger)) || isSolid(s.map.get(top, edge.trigger - 1))) top -= 1;
  place(s, top * TILE + 2, edge.trigger * TILE - s.mario.h, true);
  step(s, false);
  assert.ok(s.lift, 'lift started');
  const events: string[] = [];
  for (let i = 0; i < LIFT_FRAMES + 1; i++) {
    step(s, false);
    events.push(...s.events);
  }
  assert.equal(s.lift, null);
  assert.equal(s.mario.y + s.mario.h, GROUND_Y, 'standing at floor level');
  assert.ok(events.includes('speedUp'));
  assert.ok(!s.map.edges.includes(edge));
  for (let i = 0; i < 40; i++) {
    s.entities = [];
    step(s, false);
  }
  assert.equal(s.status, 'playing');
  assert.equal(s.biome, 'sky');
  assert.equal(s.mario.y + s.mario.h, GROUND_Y, 'running on the clouds');
});

test('touching the vine pans down to the ground, Mario slides down it and runs on', () => {
  const s = started({ biomes: ['sky', 'grass'] });
  const edge = edgeOf(s, 'left');
  place(s, edge.trigger * TILE + 2, 5 * TILE, false);
  step(s, false);
  assert.ok(s.lift?.vine, 'grabbed the vine');
  run(s, LIFT_FRAMES + 1);
  assert.equal(s.lift, null);
  assert.ok(s.flag, 'sliding down the vine');
  until(s, () => s.flag === null);
  until(s, () => s.mario.grounded && s.mario.y + s.mario.h === GROUND_Y, 120);
  assert.equal(s.status, 'playing');
  assert.equal(s.map.get(edge.trigger, GROUND_ROW), Tile.Ground, 'grass ground under the vine');
  assert.equal(s.biome, 'grass');
  assert.ok(s.speedLevel === 1);
});

test('a spike cloud cannot be stomped; a bird can', () => {
  const s = playing();
  const c = enemyAhead(s, 'spikecloud', 4);
  c.vx = 0;
  step(s, true);
  until(s, () => s.status !== 'playing');
  assert.equal(s.status, 'dying');

  const b = playing();
  const bird = createEnemy(b, { kind: 'bird', col: Math.floor(b.mario.x / TILE) + 3, row: GROUND_ROW - 1 });
  bird.active = true;
  bird.vx = 0;
  bird.homeY = bird.y = GROUND_Y - bird.h;
  b.entities.push(bird);
  step(b, true);
  until(b, () => bird.mode === 'flipped' || b.status !== 'playing');
  assert.equal(bird.mode, 'flipped');
  assert.equal(b.kills, 1);
});

test('enemies up in the clouds wait while Mario is still on the ground', () => {
  const s = started({ biomes: ['castle', 'sky'] });
  const edge = edgeOf(s, 'right');
  place(s, (edge.col - 3) * TILE, GROUND_Y - s.mario.h, true);
  const bird = createEnemy(s, { kind: 'bird', col: edge.col + 2, row: GROUND_ROW - 1 });
  bird.active = true;
  s.entities.push(bird);
  const x = bird.x;
  run(s, 30);
  assert.equal(bird.x, x, 'frozen in the other layer');
});
