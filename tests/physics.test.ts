import { GROUND_ROW, GROUND_Y, JUMP_BUFFER_FRAMES, RUN_SPEED, TILE } from '../src/core/constants';
import { Tile } from '../src/core/tiles';
import { step } from '../src/game/step';
import { assert, test } from './harness';
import { playing, run, until } from './helpers';

test('Mario auto-runs right at RUN_SPEED on flat ground', () => {
  const s = playing();
  const x0 = s.mario.x;
  run(s, 10);
  assert.ok(Math.abs(s.mario.x - x0 - 10 * RUN_SPEED) < 1e-6);
  assert.equal(s.mario.grounded, true);
  assert.equal(s.mario.dir, 1);
});

test('a wall reverses Mario', () => {
  const s = playing();
  const col = Math.floor(s.mario.x / TILE) + 3;
  s.map.set(col, GROUND_ROW - 1, Tile.Hard);
  until(s, () => s.mario.dir === -1);
  assert.ok(s.mario.x + s.mario.w <= col * TILE + 1e-6);
});

test('the left screen edge reverses Mario', () => {
  const s = playing();
  s.mario.dir = -1;
  until(s, () => s.mario.dir === 1);
  assert.ok(s.mario.x >= s.cameraX - 1e-6);
});

test('fixed jump: apex ~4.8 tiles (SMB running jump), ~3.6 tiles of air travel', () => {
  const s = playing();
  const x0 = s.mario.x;
  let apex = 0;
  step(s, true);
  for (let i = 0; i < 200 && !s.mario.grounded; i++) {
    apex = Math.max(apex, GROUND_Y - (s.mario.y + s.mario.h));
    step(s, false);
  }
  assert.ok(apex > 4.5 * TILE && apex < 5 * TILE, `apex ${apex}`);
  const air = (s.mario.x - x0) / TILE;
  assert.ok(air > 3.4 && air < 3.9, `air ${air}`);
});

test('jump buffer: a press shortly before landing jumps on landing', () => {
  const s = playing();
  step(s, true);
  until(s, () => s.mario.vy > 0 && GROUND_Y - (s.mario.y + s.mario.h) < 12);
  step(s, true);
  run(s, JUMP_BUFFER_FRAMES);
  assert.ok(s.mario.vy < 0, 'second jump started from the buffered press');
});

test('the camera never scrolls back; score distance never decreases', () => {
  const s = playing();
  run(s, 120);
  const cam = s.cameraX;
  const dist = s.maxX;
  s.mario.dir = -1;
  run(s, 60);
  assert.equal(s.cameraX, cam);
  assert.equal(s.maxX, dist);
});

test('flying into the side of a FLOATING block keeps Mario\'s direction; a ground wall still turns him', () => {
  const s = playing();
  const col = Math.floor(s.mario.x / TILE) + 4;
  s.map.set(col, GROUND_ROW - 4, Tile.Brick);
  Object.assign(s.mario, { y: (GROUND_ROW - 4) * TILE + 1, vy: 0, grounded: false, coyote: 0 });
  run(s, 60);
  assert.equal(s.mario.dir, 1, 'kept running right');
  assert.ok(s.mario.x > (col + 1) * TILE, 'dropped past the block and ran on');

  const w = playing();
  const wc = Math.floor(w.mario.x / TILE) + 4;
  for (let r = 1; r <= 3; r++) w.map.set(wc, GROUND_ROW - r, Tile.Hard);
  Object.assign(w.mario, { y: (GROUND_ROW - 3) * TILE, vy: -1, grounded: false, coyote: 0 });
  until(w, () => w.mario.dir === -1, 120);
});
