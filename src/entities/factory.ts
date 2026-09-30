import { BULLET_SPEED, ENEMY_SPEED, FIREBALL_SPEED, ITEM_EMERGE_FRAMES, TILE } from '../core/constants';
import type { Entity, EntityKind, Mario, SpawnRequest } from '../core/types';

interface IdSource {
  nextId: number;
}

function base(ids: IdSource, kind: EntityKind, x: number, y: number, w: number, h: number): Entity {
  ids.nextId += 1;
  return {
    id: ids.nextId, kind, mode: 'walk', red: false, wings: 'none', homeY: y, timer: 0, active: true, removed: false,
    x, y, w, h, vx: 0, vy: 0, grounded: false,
  };
}

export const GOOMBA_SIZE = { w: 14, h: 14 };
export const KOOPA_SIZE = { w: 14, h: 22 };
export const SHELL_SIZE = { w: 14, h: 14 };
export const ITEM_SIZE = { w: 14, h: 16 };
export const FIREBALL_SIZE = { w: 8, h: 8 };
export const BULLET_SIZE = { w: 14, h: 12 };

/** Enemy from a chunk spawn marker; sleeps until it nears the screen. */
export function createEnemy(ids: IdSource, req: SpawnRequest): Entity {
  const size = req.kind === 'goomba' ? GOOMBA_SIZE : KOOPA_SIZE;
  const e = base(ids, req.kind === 'goomba' ? 'goomba' : 'koopa', req.col * TILE + 1, (req.row + 1) * TILE - size.h, size.w, size.h);
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

export function isEnemy(e: Entity): boolean {
  return e.kind === 'goomba' || e.kind === 'koopa' || e.kind === 'shell' || e.kind === 'bullet';
}

export function isItem(e: Entity): boolean {
  return e.kind === 'mushroom' || e.kind === 'flower' || e.kind === 'star';
}

/** Can be touched / collided with (not dying or squashed). */
export function isLive(e: Entity): boolean {
  return !e.removed && e.active && e.mode !== 'flipped' && e.mode !== 'squashed' && e.mode !== 'emerge';
}
