import { BUMP_FRAMES, MULTI_COIN_FRAMES, MULTI_COIN_MAX, TILE } from '../core/constants';
import { Tile } from '../core/tiles';
import { createItem, isEnemy, isItem, isLive } from '../entities/factory';
import type { GameState } from '../game/state';
import { addCoin, flipEnemy, spawnDebris } from './rewards';

/** Mario's head hit the tile at (col, row) from below. */
export function bumpBlock(s: GameState, col: number, row: number): void {
  const tile = s.map.get(col, row);
  const x = col * TILE;
  const y = row * TILE;
  switch (tile) {
    case Tile.Brick:
      if (s.mario.power > 0) {
        s.map.set(col, row, Tile.Empty);
        spawnDebris(s, col, row);
        s.events.push('break');
      } else {
        startBump(s, col, row);
        s.events.push('bump');
      }
      break;
    case Tile.BrickCoin: {
      const state = s.map.hitMultiCoin(col, row, s.frame);
      if (state.hits >= MULTI_COIN_MAX || s.frame - state.firstFrame >= MULTI_COIN_FRAMES) s.map.set(col, row, Tile.Used);
      addCoin(s, x, y, true);
      startBump(s, col, row);
      break;
    }
    case Tile.QCoin:
      s.map.set(col, row, Tile.Used);
      addCoin(s, x, y, true);
      startBump(s, col, row);
      break;
    case Tile.QPower:
    case Tile.BrickStar: {
      s.map.set(col, row, Tile.Used);
      const kind = tile === Tile.BrickStar ? 'star' : s.mario.power === 0 ? 'mushroom' : 'flower';
      s.entities.push(createItem(s, kind, col, row));
      startBump(s, col, row);
      s.events.push('powerAppear');
      break;
    }
    default:
      s.events.push('bump');
      return;
  }
  hitWhatStandsOn(s, col, row);
}

function startBump(s: GameState, col: number, row: number): void {
  s.bumps.push({ col, row, timer: BUMP_FRAMES });
}

/** Enemies standing on a bumped block are knocked out; items on it hop. */
function hitWhatStandsOn(s: GameState, col: number, row: number): void {
  const left = col * TILE;
  const top = row * TILE;
  for (const e of s.entities) {
    if (!isLive(e)) continue;
    const onTop = Math.abs(e.y + e.h - top) <= 2 && e.x < left + TILE && e.x + e.w > left;
    if (!onTop) continue;
    if (isEnemy(e)) flipEnemy(s, e, e.x + e.w / 2 < left + TILE / 2 ? -1 : 1);
    else if (isItem(e)) {
      e.vy = -5;
      e.grounded = false;
    }
  }
}
