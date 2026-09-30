import {
  CANNON_INTERVAL_MAX,
  CANNON_INTERVAL_MIN,
  CANNON_SAFE_TILES,
  MAX_BULLETS,
  TILE,
  VIEW_ROWS,
} from '../core/constants';
import { Tile } from '../core/tiles';
import { createBullet } from '../entities/factory';
import type { GameState } from '../game/state';

/**
 * Pseudo-random reload time. Not drawn from the level RNG, so gameplay never changes what the
 * same seed generates.
 */
function interval(col: number, frame: number): number {
  return CANNON_INTERVAL_MIN + ((col * 7919 + frame * 31) % (CANNON_INTERVAL_MAX - CANNON_INTERVAL_MIN));
}

/**
 * Bill Blasters on screen count down and fire a Bullet Bill toward the player — never when the
 * player stands right next to one (CANNON_SAFE_TILES), like the original.
 */
export function updateCannons(s: GameState): void {
  const first = Math.floor(s.cameraX / TILE);
  const last = Math.floor((s.cameraX + s.viewWidth) / TILE);
  const m = s.mario;
  for (let col = first; col <= last; col++) {
    for (let row = 0; row < VIEW_ROWS; row++) {
      if (s.map.get(col, row) !== Tile.CannonTop) continue;
      const key = col * VIEW_ROWS + row;
      const left = (s.cannonTimers.get(key) ?? 40 + ((col * 37) % CANNON_INTERVAL_MIN)) - 1;
      if (left > 0) {
        s.cannonTimers.set(key, left);
        continue;
      }
      s.cannonTimers.set(key, interval(col, s.frame));
      const dx = m.x + m.w / 2 - (col * TILE + TILE / 2);
      if (Math.abs(dx) < CANNON_SAFE_TILES * TILE) continue;
      if (s.entities.filter((e) => e.kind === 'bullet').length >= MAX_BULLETS) continue;
      const dir = dx < 0 ? -1 : 1;
      s.entities.push(createBullet(s, dir === 1 ? (col + 1) * TILE : col * TILE - 14, row * TILE + 2, dir));
      s.events.push('cannon');
    }
  }
  for (const key of s.cannonTimers.keys()) if (Math.floor(key / VIEW_ROWS) < first - 2) s.cannonTimers.delete(key);
}
