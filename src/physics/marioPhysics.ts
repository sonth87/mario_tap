import {
  COYOTE_FRAMES,
  GRAVITY,
  GROUND_ROW,
  ICE_GRIP_FACTOR,
  ICE_GRIP_FRAMES,
  ICE_SPEED_FACTOR,
  JUMP_BUFFER_FRAMES,
  JUMP_VELOCITY,
  MAX_FALL_SPEED,
  TILE,
} from '../core/constants';
import { Tile } from '../core/tiles';
import type { MarioBody } from '../core/types';
import type { TileQuery } from '../world/tileMap';
import { moveXHit, moveY, standsOnGround } from './body';

export interface MarioStepResult {
  jumped: boolean;
  /** Reversed because of a solid tile or the left screen wall. */
  turned: boolean;
  landed: boolean;
  /** Tile hit by Mario's head this frame (the one closest to his centre), or null. */
  ceiling: { col: number; row: number } | null;
}

/** True when Mario stands on at least one ice tile. */
export function onIce(m: MarioBody, map: TileQuery): boolean {
  if (!m.grounded) return false;
  const row = Math.floor((m.y + m.h + 1) / TILE);
  for (let c = Math.floor(m.x / TILE); c <= Math.floor((m.x + m.w - 0.001) / TILE); c++) if (map.get(c, row) === Tile.Ice) return true;
  return false;
}

/**
 * Horizontal velocity for this frame. Normal ground: run speed. Ice: faster, but slow while
 * scrambling for grip after a wall. In the air Mario keeps his speed (so a jump made while slipping
 * is a short one), pointing where he faces — off ice nothing changes from the classic constant run.
 */
function runVelocity(m: MarioBody, ice: boolean, grounded: boolean): number {
  if (ice) {
    if (m.grip > 0) {
      m.grip -= 1;
      return m.dir * m.speed * ICE_GRIP_FACTOR;
    }
    return m.dir * m.speed * ICE_SPEED_FACTOR;
  }
  if (grounded) {
    m.grip = 0;
    return m.dir * m.speed;
  }
  return m.dir * (Math.abs(m.vx) || m.speed);
}

/**
 * One 60 Hz frame of Mario's movement: auto-run, reverse on walls, fixed-height jump.
 * Pure (no game state) so the level validator can replay it headlessly.
 * @param pressed  the jump input fired this frame
 * @param leftWall world x of the left screen edge — Mario bounces off it like a wall
 */
export function stepMarioBody(m: MarioBody, map: TileQuery, pressed: boolean, leftWall: number): MarioStepResult {
  const result: MarioStepResult = { jumped: false, turned: false, landed: false, ceiling: null };
  const ice = onIce(m, map);
  // Speed is decided by what Mario stood on at the start of the frame (a jump frame counts as ground).
  const groundedAtStart = m.grounded || m.coyote > 0;

  if (pressed) m.jumpBuffer = JUMP_BUFFER_FRAMES;
  if (m.jumpBuffer > 0 && (m.grounded || m.coyote > 0)) {
    m.vy = -JUMP_VELOCITY;
    m.grounded = false;
    m.coyote = 0;
    m.jumpBuffer = 0;
    result.jumped = true;
  } else if (m.jumpBuffer > 0) {
    m.jumpBuffer -= 1;
  }

  // Walking into anything, or flying into an obstacle that stands on the ground (pipe, wall,
  // stairs) turns Mario around. Flying into the side of a floating block only stops him for that
  // frame: he drops past it and keeps his direction (user rule).
  const wasGrounded = m.grounded;
  m.vx = runVelocity(m, ice, groundedAtStart);
  const hit = moveXHit(m, map, m.vx);
  if (hit && (wasGrounded || standsOnGround(map, hit, GROUND_ROW))) turn(m, ice, result);
  if (m.x < leftWall) {
    m.x = leftWall;
    if (m.dir === -1) turn(m, ice, result);
  }

  const y = moveY(m, map, GRAVITY, MAX_FALL_SPEED);
  result.landed = y.landed;
  if (y.landed) m.coyote = COYOTE_FRAMES;
  else if (m.coyote > 0) m.coyote -= 1;
  if (y.ceilingRow >= 0) {
    const centre = (m.x + m.w / 2) / TILE;
    const col = y.ceilingCols.reduce((best, c) => (Math.abs(c + 0.5 - centre) < Math.abs(best + 0.5 - centre) ? c : best));
    result.ceiling = { col, row: y.ceilingRow };
  }
  return result;
}

/** Reverse direction; on ice Mario then has to find his grip again. */
function turn(m: MarioBody, ice: boolean, result: MarioStepResult): void {
  m.dir = m.dir === 1 ? -1 : 1;
  m.vx = -m.vx;
  if (ice) m.grip = ICE_GRIP_FRAMES;
  result.turned = true;
}
