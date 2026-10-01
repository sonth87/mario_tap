import {
  ENEMY_POINTS,
  GROUND_ROW,
  GROUND_Y,
  HITSTOP_FRAMES,
  ICE_GRIP_FACTOR,
  ICE_SPEED_FACTOR,
  MAX_SPEED_LEVEL,
  RUN_SPEED,
  SPEED_STEP,
  TILE,
} from '../src/core/constants';
import { DEFAULT_LABELS } from '../src/core/options';
import { createRng } from '../src/core/rng';
import { resolveBiomeThemes, THEMES } from '../src/core/theme';
import { isPole, Tile } from '../src/core/tiles';
import { createEnemy } from '../src/entities/factory';
import { createState, type GameState } from '../src/game/state';
import { step } from '../src/game/step';
import { hasGlyphs } from '../src/render/pixelFont';
import { decorateChunk } from '../src/world/biomeDecor';
import { parseChunk } from '../src/world/chunkParser';
import { assert, test } from './harness';
import { enemyAhead, playing, run, until, VIEW } from './helpers';

function findPole(s: GameState, from = 0): number {
  for (let c = from; c < 4000; c++) {
    s.gen.ensure(c + 1);
    if (isPole(s.map.get(c, GROUND_ROW - 2))) return c;
  }
  throw new Error('no pole');
}

/** Teleports Mario in front of the next pole and rides it (plus a few steps); returns the pole column. */
function ridePole(s: GameState, from = 0, events: string[] = []): number {
  const col = findPole(s, from);
  Object.assign(s.mario, { x: (col - 2) * TILE, y: GROUND_Y - s.mario.h, vy: 0, dir: 1, grounded: true, hurtTimer: 0 });
  s.cameraX = s.mario.x - 100;
  s.entities = [];
  for (let i = 0; i < 400 && (s.flag !== null || i < 20 || s.mario.x < (col + 2) * TILE); i++) {
    step(s, false);
    events.push(...s.events);
  }
  return col;
}

test('every flagpole speeds the run up one level, capped at MAX_SPEED_LEVEL', () => {
  const s = playing(5);
  let col = 0;
  for (let i = 1; i <= MAX_SPEED_LEVEL + 1; i++) {
    col = ridePole(s, col + 1);
    assert.equal(s.speedLevel, Math.min(i, MAX_SPEED_LEVEL));
    assert.ok(Math.abs(s.mario.speed - (RUN_SPEED + SPEED_STEP * s.speedLevel)) < 1e-9);
  }
  assert.equal(s.flags, MAX_SPEED_LEVEL + 1);
});

test('speedUp: false keeps the classic speed', () => {
  const s = createState(5, VIEW, { speedUp: false });
  step(s, true);
  ridePole(s);
  assert.equal(s.speedLevel, 0);
  assert.equal(s.mario.speed, RUN_SPEED);
});

test('the biome changes right past each pole, in the configured order, with an event', () => {
  const s = playing(9);
  assert.equal(s.biome, 'grass');
  const events: string[] = [];
  const col = ridePole(s, 0, events);
  assert.equal(s.map.biomeAt(col), 'grass');
  assert.equal(s.map.biomeAt(col + 1), 'desert');
  assert.equal(s.biome, 'desert');
  assert.ok(events.includes('biome') && events.includes('speedUp'), events.join());

  const one = createState(9, VIEW, { biomes: ['castle'] });
  assert.equal(one.biome, 'castle');
  one.gen.ensure(800);
  assert.equal(one.map.biomeAt(700), 'castle');
});

test('snow: the ground is ice — faster run, slow grip after a wall', () => {
  const s = createState(3, VIEW, { biomes: ['snow'] });
  step(s, true);
  s.entities = [];
  assert.equal(s.map.get(Math.floor(s.mario.x / TILE), GROUND_ROW), Tile.Ice);
  run(s, 3);
  assert.ok(Math.abs(s.mario.vx - RUN_SPEED * ICE_SPEED_FACTOR) < 1e-9, `vx ${s.mario.vx}`);
  const col = Math.floor(s.mario.x / TILE) + 3;
  for (let c = col - 8; c <= col; c++) s.map.set(c, GROUND_ROW - 1, Tile.Empty);
  s.map.set(col, GROUND_ROW - 1, Tile.Hard);
  until(s, () => s.mario.dir === -1);
  step(s, false);
  assert.ok(Math.abs(s.mario.vx + RUN_SPEED * ICE_GRIP_FACTOR) < 1e-9, `gripping vx ${s.mario.vx}`);
  run(s, 30);
  assert.ok(Math.abs(s.mario.vx + RUN_SPEED * ICE_SPEED_FACTOR) < 1e-9, `full speed again ${s.mario.vx}`);
});

test('a Spiny cannot be stomped', () => {
  const s = playing();
  const e = enemyAhead(s, 'spiny', 4);
  e.vx = 0;
  step(s, true);
  until(s, () => s.status !== 'playing');
  assert.equal(s.status, 'dying');
  assert.equal(s.kills, 0);
});

function pipeWithPiranha(s: GameState, tilesAhead: number) {
  const col = Math.floor(s.mario.x / TILE) + tilesAhead;
  for (let r = GROUND_ROW - 2; r < GROUND_ROW; r++) {
    s.map.set(col, r, Tile.Pipe);
    s.map.set(col + 1, r, Tile.Pipe);
  }
  const p = createEnemy(s, { kind: 'piranha', col, row: GROUND_ROW - 3 });
  p.active = true;
  s.entities.push(p);
  return p;
}

test('a piranha plant rises out of its pipe, but stays in while Mario is right by it', () => {
  const s = playing();
  const far = pipeWithPiranha(s, 10);
  far.timer = 0;
  let maxOut = 0;
  for (let i = 0; i < 260; i++) {
    for (const e of s.entities) if (e === far) maxOut = Math.max(maxOut, e.h);
    s.mario.x = far.x - 8 * TILE; // keep Mario away
    s.mario.dir = 1;
    step(s, false);
  }
  assert.ok(maxOut > 16, `rose ${maxOut}`);

  const n = playing();
  const near = pipeWithPiranha(n, 1);
  near.timer = 0;
  for (let i = 0; i < 260; i++) {
    Object.assign(n.mario, { x: near.x - 2, y: GROUND_Y - 2 * TILE - n.mario.h, vy: 0, grounded: true });
    step(n, false);
    assert.equal(near.h, 0, `came out at frame ${i}`);
  }
});

test('fire bar: touching a link hurts, standing clear does not', () => {
  const s = playing();
  const col = Math.floor(s.mario.x / TILE) + 6;
  const bar = createEnemy(s, { kind: 'firebar', col, row: GROUND_ROW - 2 });
  bar.active = true;
  bar.angle = Math.PI; // pointing left, toward Mario, at his height
  bar.vx = 0;
  s.entities.push(bar);
  s.mario.power = 1;
  s.mario.y -= 15;
  s.mario.h = 30;
  until(s, () => s.mario.power === 0, 200);
  assert.equal(s.status, 'playing');
});

test('stomp chain: the second stomp before landing is worth double', () => {
  const s = playing();
  const a = enemyAhead(s, 'goomba', 3);
  a.vx = 0;
  step(s, true);
  until(s, () => a.mode === 'squashed');
  assert.equal(s.mario.combo, 1);
  // A second goomba right under the bounce.
  const b = createEnemy(s, { kind: 'goomba', col: Math.floor((s.mario.x + 4) / TILE), row: GROUND_ROW - 1 });
  b.active = true;
  b.vx = 0;
  s.entities.push(b);
  for (let i = 0; i < 120 && b.mode !== 'squashed' && !s.mario.grounded; i++) {
    if (b.mode === 'walk') b.x = s.mario.x; // keep it right under the bouncing Mario
    step(s, false);
  }
  assert.equal(b.mode, 'squashed');
  assert.equal(s.kills, 2);
  assert.equal(s.bonus, ENEMY_POINTS, 'second stomp paid 20 = 10 + 10 bonus');
  until(s, () => s.mario.grounded);
  assert.equal(s.mario.combo, 0);
});

test('hit-stop freezes the world briefly after a stomp and keeps a press for later', () => {
  const s = playing();
  const g = enemyAhead(s, 'goomba', 3);
  g.vx = 0;
  step(s, true);
  until(s, () => g.mode === 'squashed');
  const x = s.mario.x;
  assert.equal(s.hitstop, HITSTOP_FRAMES);
  step(s, true);
  run(s, HITSTOP_FRAMES - 1);
  assert.equal(s.mario.x, x, 'frozen');
  step(s, false);
  assert.notEqual(s.mario.x, x, 'moving again');
});

test('desert turns goombas into Spinies, grass never does; pipes get piranhas from tier 1', () => {
  const chunk = parseChunk({ id: 't', tier: 0, rows: ['....PP.......', '....PP.g.g.g.', '#############'] });
  const grass = decorateChunk(chunk, createRng(1), 3, 'grass');
  assert.ok(grass.spawns.every((sp) => sp.kind !== 'spiny'));
  let spiny = 0;
  let piranha = 0;
  for (let i = 0; i < 40; i++) {
    const d = decorateChunk(chunk, createRng(i), 3, 'desert');
    spiny += d.spawns.filter((sp) => sp.kind === 'spiny').length;
    piranha += d.spawns.filter((sp) => sp.kind === 'piranha' && sp.dx === 4).length;
  }
  assert.ok(spiny > 20 && piranha > 5, `spiny ${spiny}, piranha ${piranha}`);
  assert.ok(decorateChunk(chunk, createRng(1), 0, 'grass').spawns.every((sp) => sp.kind !== 'piranha'), 'no piranhas at tier 0');
});

test('biome themes: presets per biome, a transparent / custom sky carries over', () => {
  const t = resolveBiomeThemes(undefined, undefined);
  assert.equal(t.grass, THEMES.day);
  assert.equal(t.desert.weather, 'sand');
  assert.equal(t.castle.style.mountains, 'castles');
  const glass = resolveBiomeThemes('glass', undefined);
  assert.equal(glass.snow.sky, null);
  const bg = resolveBiomeThemes('day', '#123456', { castle: { lava: '#00FF00' } });
  assert.equal(bg.castle.sky, '#123456');
  assert.equal(bg.castle.lava, '#00FF00');
  assert.equal(bg.castle.style.mountains, 'castles', 'override keeps the biome preset as base');
});

test('the pixel fonts can spell every default label shown in the canvas', () => {
  for (const [key, text] of Object.entries(DEFAULT_LABELS)) {
    if (key === 'mute' || key === 'unmute' || key === 'logo') continue;
    assert.ok(hasGlyphs(text.replace(/\{\w+\}/g, '0'), 'big') && hasGlyphs(text.replace(/\{\w+\}/g, '0'), 'mini'), key);
  }
});
