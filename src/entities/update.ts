import {
  ACTIVATION_MARGIN,
  BIRD_AMPLITUDE,
  DESPAWN_MARGIN,
  FIREBALL_BOUNCE,
  FIREBALL_GRAVITY,
  FLYER_AMPLITUDE,
  FLYER_SPEED,
  GRAVITY,
  ITEM_EMERGE_FRAMES,
  ITEM_SPEED,
  MAX_FALL_SPEED,
  PARA_HOP,
  SHELL_REVIVE_FRAMES,
  STAR_BOUNCE,
  TILE,
  VIEW_HEIGHT,
} from '../core/constants';
import type { Entity } from '../core/types';
import type { GameState } from '../game/state';
import { atLedge, moveX, moveY } from '../physics/body';
import { updateFirebar, updatePiranha } from '../systems/hazards';
import { sameLayer } from '../systems/lift';
import { spawnPuff } from '../systems/rewards';
import { toKoopa } from './factory';

const FIREBALL_LIFE = 180;

/** Walk forward, turn around at walls (and at ledges when asked), fall with gravity. */
function walk(s: GameState, e: Entity, turnAtLedge: boolean): boolean {
  if (turnAtLedge && e.grounded && atLedge(e, s.map)) e.vx = -e.vx;
  if (moveX(e, s.map, e.vx)) e.vx = -e.vx;
  return moveY(e, s.map, GRAVITY, MAX_FALL_SPEED).landed;
}

/** Plain koopa walks; paratroopa hops on every landing; red flyer hovers up and down in place. */
function updateKoopa(s: GameState, e: Entity): void {
  if (e.wings === 'fly') {
    e.timer += 1;
    e.y = e.homeY + Math.sin(e.timer * FLYER_SPEED) * FLYER_AMPLITUDE;
    e.vx = s.mario.x < e.x ? -Math.abs(e.vx) : Math.abs(e.vx);
    return;
  }
  if (walk(s, e, e.red) && e.wings === 'hop') e.vy = -PARA_HOP;
}

function updateShell(s: GameState, e: Entity): void {
  if (e.mode === 'idle') {
    moveY(e, s.map, GRAVITY, MAX_FALL_SPEED);
    e.timer += 1;
    if (e.timer >= SHELL_REVIVE_FRAMES) toKoopa(e);
    return;
  }
  if (e.timer > 0) e.timer -= 1;
  if (moveX(e, s.map, e.vx)) {
    e.vx = -e.vx;
    if (e.x < s.cameraX + s.viewWidth) s.events.push('bump');
  }
  moveY(e, s.map, GRAVITY, MAX_FALL_SPEED);
}

function updateFireball(s: GameState, e: Entity): void {
  e.timer += 1;
  if (moveX(e, s.map, e.vx) || e.timer > FIREBALL_LIFE) {
    e.removed = true;
    spawnPuff(s, e.x, e.y);
    return;
  }
  if (moveY(e, s.map, FIREBALL_GRAVITY, MAX_FALL_SPEED).landed) e.vy = -FIREBALL_BOUNCE;
}

/** Non-colliding modes: knocked-out fall, squash timer, rising out of a block. */
function updateScripted(e: Entity): boolean {
  switch (e.mode) {
    case 'flipped':
      e.vy = Math.min(e.vy + GRAVITY, MAX_FALL_SPEED);
      e.x += e.vx;
      e.y += e.vy;
      return true;
    case 'squashed':
      e.timer -= 1;
      if (e.timer <= 0) e.removed = true;
      return true;
    case 'emerge':
      e.y -= TILE / ITEM_EMERGE_FRAMES;
      e.timer -= 1;
      if (e.timer <= 0) {
        e.mode = 'walk';
        e.vx = ITEM_SPEED;
        if (e.kind === 'star') e.vy = -STAR_BOUNCE;
      }
      return true;
    default:
      return false;
  }
}

/** One frame for one entity. */
export function updateEntity(s: GameState, e: Entity): void {
  if (!e.active) {
    if (e.x > s.cameraX + s.viewWidth + ACTIVATION_MARGIN) return;
    e.active = true;
  }
  // Up in the clouds while Mario is still on the ground (or the other way round): wait.
  if (!sameLayer(s, e.x + e.w / 2)) return;
  if (updateScripted(e)) return;
  switch (e.kind) {
    case 'goomba':
    case 'spiny':
      walk(s, e, false);
      break;
    case 'piranha':
      updatePiranha(s, e);
      break;
    case 'firebar':
      updateFirebar(e);
      break;
    case 'spikecloud':
      // Floats along the cloud floor and turns at walls and at the edge of a gap (never falls).
      if (atLedge(e, s.map)) e.vx = -e.vx;
      if (moveX(e, s.map, e.vx)) e.vx = -e.vx;
      e.timer += 1;
      break;
    case 'bird':
      // Flies straight at the player (through everything) with a gentle bob.
      e.timer += 1;
      e.x += e.vx;
      e.y = e.homeY + Math.round(Math.sin(e.timer / 12) * BIRD_AMPLITUDE);
      break;
    case 'koopa':
      updateKoopa(s, e);
      break;
    case 'bullet':
      // Flies straight through everything; culled once off screen.
      e.x += e.vx;
      break;
    case 'shell':
      updateShell(s, e);
      break;
    case 'mushroom':
    case 'flower':
      walk(s, e, false);
      break;
    case 'star':
      if (walk(s, e, false)) e.vy = -STAR_BOUNCE;
      break;
    case 'fireball':
      updateFireball(s, e);
      break;
  }
}

/** Drops entities that fell out, fell behind the left wall, or (shells/fireballs) left the screen. */
export function cullEntities(s: GameState): void {
  const right = s.cameraX + s.viewWidth + 4 * TILE;
  for (const e of s.entities) {
    if (e.y > VIEW_HEIGHT + TILE || e.x + e.w < s.cameraX - DESPAWN_MARGIN) e.removed = true;
    if ((e.kind === 'fireball' || e.kind === 'shell' || e.kind === 'bullet') && e.active && e.x > right) e.removed = true;
  }
  s.entities = s.entities.filter((e) => !e.removed);
}
