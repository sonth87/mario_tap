import { GROUND_ROW, MARIO_BIG_HEIGHT, TILE, VIEW_HEIGHT } from '../src/core/constants';
import { Tile } from '../src/core/tiles';
import { createItem } from '../src/entities/factory';
import { scoreOf, distanceOf } from '../src/game/state';
import { step } from '../src/game/step';
import { assert, test } from './harness';
import { enemyAhead, playing, run, until } from './helpers';

test('stomping a goomba squashes it, bounces Mario and scores 10', () => {
  const s = playing();
  const g = enemyAhead(s, 'goomba', 4);
  g.vx = 0;
  step(s, true);
  until(s, () => g.mode === 'squashed' || s.status !== 'playing');
  assert.equal(g.mode, 'squashed');
  assert.equal(s.kills, 1);
  assert.ok(s.mario.vy < 0, 'bounced');
});

test('touching a goomba from the side kills small Mario', () => {
  const s = playing();
  enemyAhead(s, 'goomba', 2);
  until(s, () => s.status !== 'playing');
  assert.equal(s.status, 'dying');
});

test('big Mario shrinks on a hit and survives with invulnerability', () => {
  const s = playing();
  s.mario.power = 1;
  s.mario.y -= MARIO_BIG_HEIGHT - s.mario.h;
  s.mario.h = MARIO_BIG_HEIGHT;
  enemyAhead(s, 'goomba', 2);
  until(s, () => s.mario.power === 0);
  assert.equal(s.status, 'playing');
  assert.ok(s.mario.hurtTimer > 0);
  run(s, 30);
  assert.equal(s.status, 'playing', 'no second hit while invulnerable');
});

test('star power knocks enemies out on contact', () => {
  const s = playing();
  s.mario.starTimer = 600;
  const g = enemyAhead(s, 'goomba', 2);
  until(s, () => g.mode === 'flipped');
  assert.equal(s.kills, 1);
  assert.equal(s.status, 'playing');
});

test('koopa: stomp → shell, touch → kicked shell that knocks out a goomba', () => {
  const s = playing();
  const k = enemyAhead(s, 'koopa', 4);
  k.vx = 0;
  step(s, true);
  until(s, () => k.kind === 'shell');
  assert.equal(k.mode, 'idle');
  // Put Mario back on the ground left of the shell, running into it.
  run(s, 60);
  Object.assign(s.mario, { x: k.x - 3 * TILE, y: GROUND_ROW * TILE - s.mario.h, vy: 0, dir: 1, hurtTimer: 0 });
  s.cameraX = Math.min(s.cameraX, s.mario.x - 10);
  until(s, () => k.mode === 'slide');
  assert.ok(k.vx > 0, 'kicked away from Mario');
  const g = enemyAhead(s, 'goomba', 6);
  g.vx = 0;
  until(s, () => g.mode === 'flipped');
  assert.equal(s.kills, 2);
});

test('mushroom makes Mario big; flower then gives fire; fire press throws a fireball', () => {
  const s = playing();
  const col = Math.floor(s.mario.x / TILE) + 2;
  const mush = createItem(s, 'mushroom', col, GROUND_ROW - 1);
  mush.mode = 'walk';
  mush.vx = 0;
  s.entities.push(mush);
  until(s, () => s.mario.power === 1);
  assert.equal(s.mario.h, MARIO_BIG_HEIGHT);
  const flower = createItem(s, 'flower', Math.floor(s.mario.x / TILE) + 2, GROUND_ROW - 1);
  flower.mode = 'walk';
  flower.vx = 0;
  s.entities.push(flower);
  until(s, () => s.mario.power === 2);
  step(s, true);
  assert.equal(s.entities.filter((e) => e.kind === 'fireball').length, 1);
});

test('blocks: small Mario bumps a brick, big Mario breaks it, ? coin pays once', () => {
  const s = playing();
  const col = Math.floor((s.mario.x + s.mario.w / 2) / TILE);
  s.map.set(col, GROUND_ROW - 4, Tile.Brick);
  s.map.set(col + 5, GROUND_ROW - 4, Tile.QCoin);
  step(s, true);
  until(s, () => s.mario.grounded);
  assert.equal(s.map.get(col, GROUND_ROW - 4), Tile.Brick);

  const b = playing();
  b.mario.power = 1;
  b.mario.y -= MARIO_BIG_HEIGHT - b.mario.h;
  b.mario.h = MARIO_BIG_HEIGHT;
  const c2 = Math.floor((b.mario.x + b.mario.w / 2) / TILE);
  b.map.set(c2, GROUND_ROW - 4, Tile.Brick);
  step(b, true);
  until(b, () => b.mario.grounded);
  assert.equal(b.map.get(c2, GROUND_ROW - 4), Tile.Empty);

  const q = playing();
  const c3 = Math.floor((q.mario.x + q.mario.w / 2) / TILE);
  q.map.set(c3, GROUND_ROW - 4, Tile.QCoin);
  step(q, true);
  until(q, () => q.mario.grounded);
  assert.equal(q.coins, 1);
  assert.equal(q.map.get(c3, GROUND_ROW - 4), Tile.Used);
});

test('score = distance + 10 × coins + 10 × kills', () => {
  const s = playing();
  run(s, 240);
  s.coins = 3;
  s.kills = 2;
  assert.equal(scoreOf(s), distanceOf(s) + 50);
  assert.ok(distanceOf(s) > 15);
});

test('falling into a pit ends the run', () => {
  const s = playing();
  const col = Math.floor(s.mario.x / TILE) + 2;
  for (let c = col; c < col + 3; c++) {
    s.map.set(c, GROUND_ROW, Tile.Empty);
    s.map.set(c, GROUND_ROW + 1, Tile.Empty);
  }
  until(s, () => s.mario.y > VIEW_HEIGHT || s.status !== 'playing');
  until(s, () => s.status === 'over');
  assert.equal(s.mario.deathByPit, true);
});

test('paratroopa: first stomp clips the wings (walking koopa), second makes a shell', () => {
  const s = playing();
  const k = enemyAhead(s, 'paratroopa', 4);
  k.vx = 0;
  assert.equal(k.wings, 'hop');
  const dropOn = (): void => {
    Object.assign(s.mario, { x: k.x, y: k.y - 40, vy: 3, grounded: false, dir: 1, hurtTimer: 0 });
    s.cameraX = Math.min(s.cameraX, s.mario.x - 100);
  };
  dropOn();
  until(s, () => k.wings === 'none', 60);
  assert.equal(k.kind, 'koopa', 'still a walking koopa after the first stomp');
  assert.equal(s.kills, 1);
  k.vx = 0;
  dropOn();
  until(s, () => k.kind === 'shell', 60);
  assert.equal(s.kills, 2);
});

test('flying koopa hovers around its home height and can be stomped', () => {
  const s = playing();
  const k = enemyAhead(s, 'flyer', 6);
  k.y -= 3 * TILE;
  k.homeY = k.y;
  const ys = new Set<number>();
  for (let i = 0; i < 120; i++) { step(s, false); ys.add(Math.round(k.y)); }
  assert.ok(ys.size > 10, 'bobs up and down');
  assert.ok(Math.abs(k.y - k.homeY) <= 23);
});

test('cannon fires a bullet toward Mario (not when he is next to it); stomping it defeats it', () => {
  const s = playing();
  const col = Math.floor(s.mario.x / TILE) + 10;
  s.map.set(col, GROUND_ROW - 1, Tile.CannonTop);
  s.cameraX = s.mario.x - 100;
  until(s, () => s.entities.some((e) => e.kind === 'bullet'), 400);
  const b = s.entities.find((e) => e.kind === 'bullet');
  assert.ok(b && b.vx < 0, 'flies left, toward Mario');
  b.y = GROUND_ROW * TILE - b.h;
  Object.assign(s.mario, { x: b.x - 40, y: b.y - 60, vy: 2, dir: 1 });
  until(s, () => b.mode === 'flipped' || s.status !== 'playing', 120);
  assert.equal(b.mode, 'flipped');
  assert.equal(s.status, 'playing');
});

test('a stationary star on a floating brick is eaten by standing on the brick', () => {
  const s = playing();
  const col = Math.floor(s.mario.x / TILE) + 4;
  s.map.set(col, GROUND_ROW - 3, Tile.Brick);
  s.map.set(col + 1, GROUND_ROW - 3, Tile.Brick);
  s.map.set(col, GROUND_ROW - 4, Tile.PickStar);
  assert.equal(s.mario.starTimer, 0);
  Object.assign(s.mario, { x: (col + 1) * TILE, y: (GROUND_ROW - 3) * TILE - s.mario.h, vy: 0, grounded: true, dir: -1 });
  s.cameraX = s.mario.x - 100;
  until(s, () => s.mario.starTimer > 0, 200);
  assert.equal(s.map.get(col, GROUND_ROW - 4), Tile.Empty, 'pickup consumed');
});

test('stationary flower makes small Mario big, then fire', () => {
  const s = playing();
  const c = Math.floor(s.mario.x / TILE) + 2;
  s.map.set(c, GROUND_ROW - 1, Tile.PickFlower);
  s.map.set(c + 4, GROUND_ROW - 1, Tile.PickFlower);
  until(s, () => s.mario.power === 1, 100);
  until(s, () => s.mario.power === 2, 100);
});
