import { KICK_GRACE_FRAMES, SHELL_SPEED, SQUASH_FRAMES, STOMP_BOUNCE } from '../core/constants';
import type { Entity } from '../core/types';
import { isEnemy, isItem, isLive, toShell } from '../entities/factory';
import type { GameState } from '../game/state';
import { overlaps } from '../physics/body';
import { collectItem, hurtMario } from './marioPower';
import { addKill, flipEnemy, spawnPuff } from './rewards';

/** Falling onto the top few pixels of an enemy counts as a stomp. */
const STOMP_TOLERANCE = 4;

function bounce(s: GameState): void {
  const m = s.mario;
  m.vy = -STOMP_BOUNCE;
  m.grounded = false;
  m.coyote = 0;
}

function kick(s: GameState, shell: Entity): void {
  const m = s.mario;
  const dir = m.x + m.w / 2 <= shell.x + shell.w / 2 ? 1 : -1;
  shell.mode = 'slide';
  shell.vx = dir * SHELL_SPEED;
  shell.timer = KICK_GRACE_FRAMES;
  s.events.push('kick');
}

function touchShell(s: GameState, shell: Entity, stomp: boolean): void {
  const m = s.mario;
  if (shell.mode === 'idle') {
    // Rising away right after the stomp that made this shell must not kick it.
    if (m.vy < 0) return;
    kick(s, shell);
    if (stomp) bounce(s);
    return;
  }
  if (stomp) {
    shell.mode = 'idle';
    shell.vx = 0;
    shell.timer = 0;
    bounce(s);
    s.events.push('stomp');
    return;
  }
  if (shell.timer === 0) hurtMario(s);
}

function touchEnemy(s: GameState, e: Entity): void {
  const m = s.mario;
  if (m.starTimer > 0) {
    flipEnemy(s, e, m.dir);
    return;
  }
  const stomp = m.vy > 0 && m.y + m.h - m.vy <= e.y + STOMP_TOLERANCE;
  if (e.kind === 'shell') {
    touchShell(s, e, stomp);
    return;
  }
  if (!stomp) {
    hurtMario(s);
    return;
  }
  bounce(s);
  addKill(s, e);
  s.events.push('stomp');
  if (e.kind === 'bullet') {
    e.mode = 'flipped';
    e.vx *= 0.5;
    e.vy = 0;
  } else if (e.kind === 'koopa' && e.wings !== 'none') {
    // First stomp only clips the wings: it drops / walks on as a plain koopa.
    e.wings = 'none';
    e.vy = 0;
  } else if (e.kind === 'koopa') {
    toShell(e);
  } else {
    e.mode = 'squashed';
    e.timer = SQUASH_FRAMES;
  }
}

/** Mario against items and enemies. */
export function marioVsEntities(s: GameState): void {
  for (const e of s.entities) {
    if (s.status !== 'playing') return;
    if (!isLive(e) || e.kind === 'fireball' || !overlaps(s.mario, e)) continue;
    if (isItem(e)) collectItem(s, e);
    else touchEnemy(s, e);
  }
}

function walkers(a: Entity, b: Entity): boolean {
  return (a.kind === 'goomba' || a.kind === 'koopa') && (b.kind === 'goomba' || b.kind === 'koopa');
}

/** Pairwise: fireballs and sliding shells knock enemies out; walking enemies bounce off each other. */
export function entityInteractions(s: GameState): void {
  // Bullet Bills ignore everything but the player (fireballs and shells pass them, as in the original).
  const live = s.entities.filter((e) => isLive(e) && e.kind !== 'bullet' && (isEnemy(e) || e.kind === 'fireball'));
  for (let i = 0; i < live.length; i++) {
    for (let j = i + 1; j < live.length; j++) {
      const a = live[i];
      const b = live[j];
      if (!isLive(a) || !isLive(b) || !overlaps(a, b)) continue;
      if (a.kind === 'fireball' || b.kind === 'fireball') {
        const [fire, enemy] = a.kind === 'fireball' ? [a, b] : [b, a];
        if (enemy.kind === 'fireball') continue;
        fire.removed = true;
        spawnPuff(s, fire.x, fire.y);
        flipEnemy(s, enemy, Math.sign(fire.vx));
      } else if (a.mode === 'slide' || b.mode === 'slide') {
        if (a.mode === 'slide' && b.mode === 'slide') {
          flipEnemy(s, a, Math.sign(b.vx));
          flipEnemy(s, b, Math.sign(a.vx));
        } else {
          const [shell, victim] = a.mode === 'slide' ? [a, b] : [b, a];
          flipEnemy(s, victim, Math.sign(shell.vx));
        }
      } else if (walkers(a, b)) {
        // Push apart: the left one walks left, the right one walks right.
        const [left, right] = a.x <= b.x ? [a, b] : [b, a];
        left.vx = -Math.abs(left.vx);
        right.vx = Math.abs(right.vx);
      }
    }
  }
}
