import { GROUND_ROW, TILE } from '../src/core/constants';
import type { Entity, SpawnRequest } from '../src/core/types';
import { createEnemy } from '../src/entities/factory';
import { createState, type GameState } from '../src/game/state';
import { step } from '../src/game/step';

export const VIEW = 400;

/** A running game (status 'playing') on the flat start runway, no enemies. */
export function playing(seed = 1): GameState {
  const s = createState(seed, VIEW);
  step(s, true); // first press only starts the run
  s.entities = [];
  return s;
}

export function run(s: GameState, frames: number, pressAt: number[] = []): void {
  for (let i = 0; i < frames; i++) step(s, pressAt.includes(i));
}

/** Spawns an active enemy standing on the ground `tilesAhead` tiles in front of Mario. */
export function enemyAhead(s: GameState, kind: SpawnRequest['kind'], tilesAhead: number): Entity {
  const col = Math.floor((s.mario.x + s.mario.w) / TILE) + tilesAhead;
  const e = createEnemy(s, { kind, col, row: GROUND_ROW - 1 });
  e.active = true;
  s.entities.push(e);
  return e;
}

/** Frames until `cond` holds (max `limit`), stepping without input. */
export function until(s: GameState, cond: () => boolean, limit = 600): number {
  for (let i = 0; i < limit; i++) {
    if (cond()) return i;
    step(s, false);
  }
  throw new Error('condition never met');
}
