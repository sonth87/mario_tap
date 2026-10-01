import {
  BIRD_SPEED,
  BULLET_SPEED,
  ENEMY_SPEED,
  FIREBALL_SPEED,
  ITEM_EMERGE_FRAMES,
  PIRANHA_HIDE_FRAMES,
  PIRANHA_MOVE_FRAMES,
  PIRANHA_OUT_FRAMES,
  SPIKE_CLOUD_SPEED,
  TILE,
} from '../core/constants';
import type { Entity, EntityKind, Mario, SpawnRequest } from '../core/types';

interface IdSource {
  nextId: number;
}

function base(ids: IdSource, kind: EntityKind, x: number, y: number, w: number, h: number): Entity {
  ids.nextId += 1;
  return {
    id: ids.nextId, kind, mode: 'walk', red: false, wings: 'none', homeY: y, angle: 0, timer: 0, active: true, removed: false,
    x, y, w, h, vx: 0, vy: 0, grounded: false,
  };
}

export const GOOMBA_SIZE = { w: 14, h: 14 };
export const KOOPA_SIZE = { w: 14, h: 22 };
export const SHELL_SIZE = { w: 14, h: 14 };
export const ITEM_SIZE = { w: 14, h: 16 };
export const FIREBALL_SIZE = { w: 8, h: 8 };
export const BULLET_SIZE = { w: 14, h: 12 };
export const PIRANHA_W = 12;
export const SPIKE_CLOUD_SIZE = { w: 14, h: 14 };
export const BIRD_SIZE = { w: 14, h: 10 };
/** How far (px) a piranha rises above its pipe. */
export const PIRANHA_RISE = 22;
export const PIRANHA_CYCLE = PIRANHA_HIDE_FRAMES + 2 * PIRANHA_MOVE_FRAMES + PIRANHA_OUT_FRAMES;

/** Enemy from a chunk spawn marker; sleeps until it nears the screen. */
export function createEnemy(ids: IdSource, req: SpawnRequest): Entity {
  if (req.kind === 'piranha') {
    // Spawned on the cell above the pipe's left column: centred on the 2-wide pipe, hidden inside.
    const top = (req.row + 1) * TILE;
    const e = base(ids, 'piranha', (req.col + 1) * TILE - PIRANHA_W / 2, top, PIRANHA_W, 0);
    e.homeY = top;
    e.timer = (req.col * 37) % PIRANHA_CYCLE;
    e.active = false;
    return e;
  }
  if (req.kind === 'firebar') {
    // A zero-size body at the hub centre; the links are tested in systems/hazards.ts.
    const e = base(ids, 'firebar', req.col * TILE + TILE / 2, req.row * TILE + TILE / 2, 0, 0);
    e.angle = (req.col * 1.7) % (Math.PI * 2);
    e.vx = req.col % 2 ? 1 : -1;
    e.active = false;
    return e;
  }
  if (req.kind === 'spikecloud' || req.kind === 'bird') {
    const size = req.kind === 'bird' ? BIRD_SIZE : SPIKE_CLOUD_SIZE;
    const e = base(ids, req.kind, req.col * TILE + 1, (req.row + 1) * TILE - size.h, size.w, size.h);
    e.vx = req.kind === 'bird' ? -BIRD_SPEED : -SPIKE_CLOUD_SPEED;
    e.homeY = e.y;
    e.active = false;
    return e;
  }
  const small = req.kind === 'goomba' || req.kind === 'spiny';
  const size = small ? GOOMBA_SIZE : KOOPA_SIZE;
  const kind = req.kind === 'goomba' || req.kind === 'spiny' ? req.kind : 'koopa';
  const e = base(ids, kind, req.col * TILE + 1, (req.row + 1) * TILE - size.h, size.w, size.h);
  e.red = req.kind === 'redKoopa' || req.kind === 'flyer';
  e.wings = req.kind === 'paratroopa' ? 'hop' : req.kind === 'flyer' ? 'fly' : 'none';
  e.vx = -ENEMY_SPEED;
  e.active = false;
  return e;
}

/** Stomped koopa → idle shell at the same feet position. */
export function toShell(e: Entity): void {
  e.wings = 'none';
  e.y += e.h - SHELL_SIZE.h;
  e.kind = 'shell';
  e.mode = 'idle';
  e.h = SHELL_SIZE.h;
  e.vx = 0;
  e.timer = 0;
}

/** Idle shell that waited too long → koopa walking toward the left again. */
export function toKoopa(e: Entity): void {
  e.y -= KOOPA_SIZE.h - e.h;
  e.kind = 'koopa';
  e.mode = 'walk';
  e.h = KOOPA_SIZE.h;
  e.vx = -ENEMY_SPEED;
}

/** Power-up rising out of the block at (col, row). */
export function createItem(ids: IdSource, kind: 'mushroom' | 'flower' | 'star', col: number, row: number): Entity {
  const e = base(ids, kind, col * TILE + 1, row * TILE, ITEM_SIZE.w, ITEM_SIZE.h);
  e.mode = 'emerge';
  e.timer = ITEM_EMERGE_FRAMES;
  return e;
}

export function createFireball(ids: IdSource, mario: Mario): Entity {
  const x = mario.dir === 1 ? mario.x + mario.w : mario.x - FIREBALL_SIZE.w;
  const e = base(ids, 'fireball', x, mario.y + 6, FIREBALL_SIZE.w, FIREBALL_SIZE.h);
  e.vx = FIREBALL_SPEED * mario.dir;
  e.vy = 1;
  return e;
}

/** Bullet Bill leaving a cannon at world (x, y), flying in `dir`. */
export function createBullet(ids: IdSource, x: number, y: number, dir: 1 | -1): Entity {
  const e = base(ids, 'bullet', x, y, BULLET_SIZE.w, BULLET_SIZE.h);
  e.vx = BULLET_SPEED * dir;
  return e;
}

/** Things that hurt Mario and can be knocked out (a fire bar hurts but is not an enemy). */
export function isEnemy(e: Entity): boolean {
  return (
    e.kind === 'goomba' || e.kind === 'koopa' || e.kind === 'shell' || e.kind === 'bullet' || e.kind === 'spiny' || e.kind === 'piranha' ||
    e.kind === 'spikecloud' || e.kind === 'bird'
  );
}

/** Cannot be stomped: touching the top hurts like touching the side. */
export function isSpiky(e: Entity): boolean {
  return e.kind === 'spiny' || e.kind === 'piranha' || e.kind === 'spikecloud';
}

export function isItem(e: Entity): boolean {
  return e.kind === 'mushroom' || e.kind === 'flower' || e.kind === 'star';
}

/** Can be touched / collided with (not dying or squashed). */
export function isLive(e: Entity): boolean {
  if (e.kind === 'piranha' && e.h < 4) return false; // still inside its pipe
  return !e.removed && e.active && e.mode !== 'flipped' && e.mode !== 'squashed' && e.mode !== 'emerge';
}
