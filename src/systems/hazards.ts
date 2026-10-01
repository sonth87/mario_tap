import {
  FIREBAR_LINKS,
  FIREBAR_SPEED,
  PIRANHA_HIDE_FRAMES,
  PIRANHA_MOVE_FRAMES,
  PIRANHA_OUT_FRAMES,
  PIRANHA_SAFE_TILES,
  TILE,
} from '../core/constants';
import type { Body, Entity } from '../core/types';
import { PIRANHA_CYCLE, PIRANHA_RISE } from '../entities/factory';
import type { GameState } from '../game/state';
import { overlaps } from '../physics/body';

/** Link spacing (px) and hit box (px, a bit smaller than the 8 px sprite — be fair). */
const LINK_GAP = 8;
const LINK_HIT = 6;

/** How far (px) the plant is out of its pipe at cycle frame `t`. */
function piranhaOut(t: number): number {
  const rise = t - PIRANHA_HIDE_FRAMES;
  if (rise < 0) return 0;
  if (rise < PIRANHA_MOVE_FRAMES) return (rise / PIRANHA_MOVE_FRAMES) * PIRANHA_RISE;
  const out = rise - PIRANHA_MOVE_FRAMES;
  if (out < PIRANHA_OUT_FRAMES) return PIRANHA_RISE;
  return Math.max(0, (1 - (out - PIRANHA_OUT_FRAMES) / PIRANHA_MOVE_FRAMES) * PIRANHA_RISE);
}

/**
 * Hidden → rising → out → sinking. Like the original it stays inside while the player stands on or
 * right next to its pipe, so landing on a pipe top is always safe — the danger is arriving while
 * it is already out.
 */
export function updatePiranha(s: GameState, e: Entity): void {
  const t = e.timer % PIRANHA_CYCLE;
  const m = s.mario;
  const near = Math.abs(m.x + m.w / 2 - (e.x + e.w / 2)) < PIRANHA_SAFE_TILES * TILE + TILE;
  if (!(t === PIRANHA_HIDE_FRAMES - 1 && near)) e.timer += 1;
  const out = Math.round(piranhaOut(e.timer % PIRANHA_CYCLE));
  e.h = out;
  e.y = e.homeY - out;
}

export function updateFirebar(e: Entity): void {
  e.angle = (e.angle + FIREBAR_SPEED * e.vx + Math.PI * 2) % (Math.PI * 2);
}

/** Centres of the bar's fireballs (the hub's own fireball first). */
export function firebarLinks(e: Entity): Array<{ x: number; y: number }> {
  return Array.from({ length: FIREBAR_LINKS }, (_, i) => ({
    x: e.x + Math.cos(e.angle) * i * LINK_GAP,
    y: e.homeY + Math.sin(e.angle) * i * LINK_GAP,
  }));
}

export function firebarHits(e: Entity, b: Body): boolean {
  return firebarLinks(e).some((p) => overlaps(b, { x: p.x - LINK_HIT / 2, y: p.y - LINK_HIT / 2, w: LINK_HIT, h: LINK_HIT, vx: 0, vy: 0, grounded: false }));
}
