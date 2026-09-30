import { MARIO_BIG_HEIGHT } from '../core/constants';
import type { CharacterDef, CharacterSprites } from '../core/character';
import type { Effect, Entity, Palette } from '../core/types';
import type { GameState } from '../game/state';
import { drawSprite } from './atlas';
import { BULLET, GOOMBA, GOOMBA_FLAT, KOOPA, SHELL, WING } from './sprites/enemies';
import { COIN, COIN_THIN, DEBRIS, FIREBALL, FLOWER, MUSHROOM, STAR } from './sprites/items';
import { STAR_CYCLE } from './sprites/palettes';

interface Frame {
  rows: string[];
  /** Upside-down fallback death pose for characters without a dead sprite. */
  flipY: boolean;
}

function marioFrame(s: GameState, sp: CharacterSprites): Frame {
  const m = s.mario;
  if (s.status === 'dying' || (s.status === 'over' && !m.deathByPit)) {
    return sp.smallDead ? { rows: sp.smallDead, flipY: false } : { rows: sp.smallStand, flipY: true };
  }
  const big = m.h === MARIO_BIG_HEIGHT;
  const still = { rows: big ? sp.bigStand : sp.smallStand, flipY: false };
  if (s.flag) return { rows: big ? sp.bigJump : sp.smallJump, flipY: false };
  if (!m.grounded && s.status === 'playing') return { rows: big ? sp.bigJump : sp.smallJump, flipY: false };
  if (s.status !== 'playing') return still;
  const i = Math.floor(m.stride / 7) % 3;
  return { rows: big ? sp.bigRun[i] : sp.smallRun[i], flipY: false };
}

export function drawMario(ctx: CanvasRenderingContext2D, s: GameState, character: CharacterDef): void {
  const m = s.mario;
  if (s.status === 'over' && m.deathByPit) return;
  if (m.hurtTimer > 0 && Math.floor(m.hurtTimer / 3) % 2 === 0) return;
  const frame = marioFrame(s, character.sprites);
  let palette: Palette = m.power === 2 ? character.firePalette : character.palette;
  if (m.starTimer > 0) {
    const cycle = [palette, ...character.starPalettes];
    palette = cycle[Math.floor(s.frame / (m.starTimer < 120 ? 6 : 3)) % cycle.length];
  }
  const dead = s.status === 'dying' || s.status === 'over';
  const x = m.x - (16 - m.w) / 2 - s.cameraX;
  const y = m.y + m.h - frame.rows.length;
  drawSprite(ctx, frame.rows, x, y, { flipX: m.dir === -1 && !dead, flipY: frame.flipY, palette });
}

function drawEntity(ctx: CanvasRenderingContext2D, s: GameState, e: Entity): void {
  const x = e.x - (16 - e.w) / 2 - s.cameraX;
  const bottom = e.y + e.h;
  const flipY = e.mode === 'flipped';
  const walkFrame = Math.floor(s.frame / 10) % 2;
  switch (e.kind) {
    case 'goomba':
      if (e.mode === 'squashed') drawSprite(ctx, GOOMBA_FLAT, x, bottom - GOOMBA_FLAT.length);
      else drawSprite(ctx, GOOMBA, x, bottom - 16, { flipX: walkFrame === 1, flipY });
      break;
    case 'koopa': {
      const rows = KOOPA[walkFrame];
      const top = bottom - rows.length;
      const flipX = e.vx < 0;
      drawSprite(ctx, rows, x, top, { flipX, flipY, palette: e.red ? 'red' : 'base' });
      if (e.wings !== 'none') {
        // Wing on the shell's back (the sprite faces right, so the back is its left side).
        const wing = WING[Math.floor(s.frame / (e.wings === 'fly' ? 6 : 10)) % 2];
        drawSprite(ctx, wing, flipX ? x + 9 : x - 1, top + 6, { flipX });
      }
      break;
    }
    case 'bullet':
      drawSprite(ctx, BULLET, e.x - 1 - s.cameraX, e.y, { flipX: e.vx > 0, flipY });
      break;
    case 'shell':
      drawSprite(ctx, SHELL, x, bottom - 16, { flipY, palette: e.red ? 'red' : 'base' });
      break;
    case 'mushroom':
      drawSprite(ctx, MUSHROOM, x, e.y);
      break;
    case 'flower':
      drawSprite(ctx, FLOWER, x, e.y, { palette: STAR_CYCLE[Math.floor(s.frame / 4) % STAR_CYCLE.length] });
      break;
    case 'star':
      drawSprite(ctx, STAR, x, e.y, { palette: Math.floor(s.frame / 4) % 2 ? 'dim' : 'base' });
      break;
    case 'fireball': {
      const spin = Math.floor(s.frame / 3) % 4;
      drawSprite(ctx, FIREBALL, e.x - s.cameraX, e.y, { flipX: spin % 2 === 1, flipY: spin > 1 });
      break;
    }
  }
}

/** Items still rising out of their block — drawn before tiles so the block hides them. */
export function drawEmerging(ctx: CanvasRenderingContext2D, s: GameState): void {
  for (const e of s.entities) if (e.mode === 'emerge') drawEntity(ctx, s, e);
}

export function drawEntities(ctx: CanvasRenderingContext2D, s: GameState): void {
  for (const e of s.entities) if (e.mode !== 'emerge' && e.active) drawEntity(ctx, s, e);
}

function drawEffect(ctx: CanvasRenderingContext2D, s: GameState, fx: Effect): void {
  const x = fx.x - s.cameraX;
  switch (fx.kind) {
    case 'coin':
      drawSprite(ctx, Math.floor(fx.life / 3) % 2 ? COIN : COIN_THIN, x, fx.y);
      break;
    case 'debris':
      drawSprite(ctx, DEBRIS, x, fx.y, { flipX: fx.vx < 0 });
      break;
    case 'puff':
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(Math.round(x + 4 - (12 - fx.life) / 2), Math.round(fx.y + 4 - (12 - fx.life) / 2), 12 - fx.life, 12 - fx.life);
      break;
    case 'score':
      ctx.font = 'bold 7px ui-monospace, Menlo, Consolas, monospace';
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(0,0,0,0.75)';
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeText(fx.text ?? '', Math.round(x), Math.round(fx.y));
      ctx.fillText(fx.text ?? '', Math.round(x), Math.round(fx.y));
      break;
  }
}

export function drawEffects(ctx: CanvasRenderingContext2D, s: GameState): void {
  for (const fx of s.effects) drawEffect(ctx, s, fx);
}
