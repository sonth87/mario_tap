import {
  COYOTE_FRAMES,
  GRAVITY,
  GROUND_ROW,
  JUMP_BUFFER_FRAMES,
  JUMP_VELOCITY,
  MAX_FALL_SPEED,
  RUN_SPEED,
  TILE,
} from '../core/constants';
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

/**
 * One 60 Hz frame of Mario's movement: auto-run, reverse on walls, fixed-height jump.
 * Pure (no game state) so the level validator can replay it headlessly.
 * @param pressed  the jump input fired this frame
 * @param leftWall world x of the left screen edge — Mario bounces off it like a wall
 */
export function stepMarioBody(m: MarioBody, map: TileQuery, pressed: boolean, leftWall: number): MarioStepResult {
  const result: MarioStepResult = { jumped: false, turned: false, landed: false, ceiling: null };

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
  const hit = moveXHit(m, map, m.dir * RUN_SPEED);
  if (hit && (wasGrounded || standsOnGround(map, hit, GROUND_ROW))) {
    m.dir = m.dir === 1 ? -1 : 1;
    result.turned = true;
  }
  if (m.x < leftWall) {
    m.x = leftWall;
    if (m.dir === -1) {
      m.dir = 1;
      result.turned = true;
    }
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
