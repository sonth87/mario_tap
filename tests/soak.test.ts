import { GROUND_ROW, TILE } from '../src/core/constants';
import { isSolid } from '../src/core/tiles';
import { createState, distanceOf, type GameState } from '../src/game/state';
import { step } from '../src/game/step';
import { assert, test } from './harness';

/** Naive bot: jump when a wall, pit or enemy is just ahead. Only used to exercise the engine. */
function wantsJump(s: GameState): boolean {
  const m = s.mario;
  if (!m.grounded) return false;
  const aheadX = m.dir === 1 ? m.x + m.w + TILE : m.x - TILE;
  const col = Math.floor(aheadX / TILE);
  const feetRow = Math.floor((m.y + m.h) / TILE);
  if (isSolid(s.map.get(col, feetRow - 1))) return true;
  if (!isSolid(s.map.get(col, GROUND_ROW)) && feetRow === GROUND_ROW) return true;
  return s.entities.some((e) => e.active && e.mode !== 'flipped' && Math.abs(e.x - aheadX) < TILE && e.kind !== 'fireball');
}

test('soak: 20k frames × 3 seeds with a naive bot — no crash, bounded memory', () => {
  for (const seed of [3, 17, 2026]) {
    let s = createState(seed, 420);
    let furthest = 0;
    for (let f = 0; f < 20000; f++) {
      if (s.status === 'over') s = createState(seed + f, 420);
      step(s, s.status === 'idle' || wantsJump(s));
      assert.ok(s.map.columnCount < 120, `columns ${s.map.columnCount}`);
      assert.ok(s.entities.length < 60, `entities ${s.entities.length}`);
      assert.ok(Number.isFinite(s.mario.x) && Number.isFinite(s.mario.y));
      furthest = Math.max(furthest, distanceOf(s));
    }
    assert.ok(furthest > 100, `seed ${seed}: bot only reached ${furthest}m`);
  }
});
