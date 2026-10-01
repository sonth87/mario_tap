import { COIN_POINTS, ENEMY_POINTS, TILE } from '../core/constants';
import type { Entity } from '../core/types';
import type { GameState } from '../game/state';

function floatScore(s: GameState, x: number, y: number, points: number): void {
  s.effects.push({ kind: 'score', x, y, vx: 0, vy: -0.6, life: 40, text: `+${points}` });
}

/** Coin collected (from a block when `popFromBlock`, otherwise touched in the air). */
export function addCoin(s: GameState, x: number, y: number, popFromBlock: boolean): void {
  s.coins += 1;
  s.events.push('coin');
  if (popFromBlock) s.effects.push({ kind: 'coin', x, y: y - TILE, vx: 0, vy: -5, life: 30 });
  floatScore(s, x, y - TILE, COIN_POINTS);
}

/**
 * Enemy defeated by Mario (stomp, star, fireball, kicked shell or bumped block). `points` above the
 * plain ENEMY_POINTS (stomp chains) go to the bonus, so `kills` still counts enemies.
 */
export function addKill(s: GameState, e: Entity, points = ENEMY_POINTS): void {
  s.kills += 1;
  s.bonus += points - ENEMY_POINTS;
  floatScore(s, e.x, e.y - 4, points);
}

/** Knock an enemy off the screen upside down (a piranha just vanishes in its pipe). */
export function flipEnemy(s: GameState, e: Entity, dir: number): void {
  if (e.kind === 'piranha') {
    e.removed = true;
    spawnPuff(s, e.x, e.y);
    addKill(s, e);
    s.events.push('kick');
    return;
  }
  e.mode = 'flipped';
  e.vy = -4;
  e.vx = dir * 0.8;
  addKill(s, e);
  s.events.push('kick');
}

export function spawnDebris(s: GameState, col: number, row: number): void {
  const x = col * TILE + 4;
  const y = row * TILE + 4;
  for (const [vx, vy] of [[-1, -5], [1, -5], [-1, -3], [1, -3]]) {
    s.effects.push({ kind: 'debris', x: x + vx * 4, y: y + (vy === -3 ? 6 : 0), vx, vy, life: 60 });
  }
}

export function spawnPuff(s: GameState, x: number, y: number): void {
  s.effects.push({ kind: 'puff', x, y, vx: 0, vy: 0, life: 12 });
}

/** Little dust clouds at a point (landing, turning, sliding on ice). */
export function spawnDust(s: GameState, x: number, y: number, count: number, spread = 0.5): void {
  for (let i = 0; i < count; i++) {
    const side = count === 1 ? 0 : i % 2 ? 1 : -1;
    s.effects.push({ kind: 'dust', x: x - 2, y: y - 3, vx: side * spread * (0.6 + i * 0.2), vy: -0.25, life: 14 + i * 2 });
  }
}

/** Advances and expires visual effects. */
export function updateEffects(s: GameState): void {
  for (const fx of s.effects) {
    fx.life -= 1;
    fx.x += fx.vx;
    fx.y += fx.vy;
    if (fx.kind === 'coin' || fx.kind === 'debris') fx.vy += 0.3;
  }
  s.effects = s.effects.filter((fx) => fx.life > 0);
  for (const b of s.bumps) b.timer -= 1;
  s.bumps = s.bumps.filter((b) => b.timer > 0);
}
