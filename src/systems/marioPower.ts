import {
  HURT_INVULN_FRAMES,
  MARIO_BIG_HEIGHT,
  MARIO_SMALL_HEIGHT,
  STAR_FRAMES,
} from '../core/constants';
import type { Entity } from '../core/types';
import type { GameState } from '../game/state';
import { hitsSolid } from '../physics/body';

/** Tries to grow small Mario upward; waits (pendingGrow) while a ceiling is in the way. */
export function tryGrow(s: GameState): void {
  const m = s.mario;
  if (!m.pendingGrow) return;
  const grown = { ...m, y: m.y - (MARIO_BIG_HEIGHT - m.h), h: MARIO_BIG_HEIGHT };
  if (hitsSolid(grown, s.map)) return;
  m.y = grown.y;
  m.h = MARIO_BIG_HEIGHT;
  m.pendingGrow = false;
  if (m.power === 0) m.power = 1;
}

/** Mushroom → big; flower → fire (small Mario gets big first, as in the original); star → invincible. */
export function applyPowerUp(s: GameState, kind: 'mushroom' | 'flower' | 'star'): void {
  const m = s.mario;
  if (kind === 'star') {
    m.starTimer = STAR_FRAMES;
    s.events.push('star');
    return;
  }
  s.events.push('powerUp');
  if (m.power === 0) {
    m.pendingGrow = true;
    tryGrow(s);
  } else if (kind === 'flower') {
    m.power = 2;
  }
}

/** A power-up that came out of a block and walked / bounced into Mario. */
export function collectItem(s: GameState, item: Entity): void {
  item.removed = true;
  if (item.kind === 'star' || item.kind === 'mushroom' || item.kind === 'flower') applyPowerUp(s, item.kind);
}

/** Enemy contact without a star: big/fire → small with invulnerability, small → death. */
export function hurtMario(s: GameState): void {
  const m = s.mario;
  if (m.hurtTimer > 0 || m.starTimer > 0) return;
  if (m.power === 0 && !m.pendingGrow) {
    killMario(s, false);
    return;
  }
  if (m.h === MARIO_BIG_HEIGHT) {
    m.y += MARIO_BIG_HEIGHT - MARIO_SMALL_HEIGHT;
    m.h = MARIO_SMALL_HEIGHT;
  }
  m.power = 0;
  m.pendingGrow = false;
  m.hurtTimer = HURT_INVULN_FRAMES;
  s.events.push('powerDown');
}

export function killMario(s: GameState, byPit: boolean): void {
  const m = s.mario;
  s.status = 'dying';
  s.statusTimer = 0;
  m.deathByPit = byPit;
  m.power = 0;
  m.starTimer = 0;
  m.hurtTimer = 0;
  if (!byPit) {
    m.y += m.h - MARIO_SMALL_HEIGHT;
    m.h = MARIO_SMALL_HEIGHT;
  }
  m.vy = 0;
  s.events.push('die');
}
