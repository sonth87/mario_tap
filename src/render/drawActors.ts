import { MARIO_BIG_HEIGHT, TILE } from '../core/constants';
import type { CharacterDef, CharacterSprites } from '../core/character';
import type { Effect, Entity, Palette } from '../core/types';
import type { GameState } from '../game/state';
import { drawSprite } from './atlas';
import { BULLET, GOOMBA, GOOMBA_FLAT, KOOPA, SHELL, WING } from './sprites/enemies';
import { COIN, COIN_THIN, DEBRIS, FIREBALL, FLOWER, MUSHROOM, STAR } from './sprites/items';
import { firebarLinks } from '../systems/hazards';
import { columnOffset } from '../systems/lift';
import { BIRD, BIRD_PALETTE, PIRANHA, SPIKE_CLOUD, SPIKE_CLOUD_PALETTE, SPINY } from './sprites/biome';
import { STAR_CYCLE } from './sprites/palettes';
import { drawText } from './text';

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
  const y = m.y + m.h - frame.rows.length + Math.round(columnOffset(s, Math.floor((m.x + m.w / 2) / TILE)));
  drawSprite(ctx, frame.rows, x, y, { flipX: m.dir === -1 && !dead, flipY: frame.flipY, palette });
}

/** Draws `paint` shifted to the layer (ground / clouds) that world x belongs to. */
function inLayer(ctx: CanvasRenderingContext2D, s: GameState, worldX: number, paint: () => void): void {
  const dy = Math.round(columnOffset(s, Math.floor(worldX / TILE)));
  if (!dy) return paint();
  ctx.save();
  ctx.translate(0, dy);
  paint();
  ctx.restore();
}

function drawEntity(ctx: CanvasRenderingContext2D, s: GameState, e: Entity): void {
  inLayer(ctx, s, e.x + e.w / 2, () => paintEntity(ctx, s, e));
}

function paintEntity(ctx: CanvasRenderingContext2D, s: GameState, e: Entity): void {
  const x = e.x - (16 - e.w) / 2 - s.cameraX;
  const bottom = e.y + e.h;
  const flipY = e.mode === 'flipped';
  const walkFrame = Math.floor(s.frame / 10) % 2;
  switch (e.kind) {
    case 'spiny':
      drawSprite(ctx, SPINY, x, bottom - 16, { flipX: walkFrame === 1, flipY });
      break;
    case 'spikecloud':
      drawSprite(ctx, SPIKE_CLOUD, x, bottom - SPIKE_CLOUD.length + Math.round(Math.sin(e.timer / 15)), { palette: SPIKE_CLOUD_PALETTE, flipY });
      break;
    case 'bird':
      drawSprite(ctx, BIRD[Math.floor(s.frame / 8) % 2], x, e.y, { palette: BIRD_PALETTE, flipX: e.vx > 0, flipY });
      break;
    case 'piranha':
      // Drawn before the tiles: the pipe hides whatever is still inside it.
      drawSprite(ctx, PIRANHA[Math.floor(s.frame / 12) % 2], x, e.homeY - e.h);
      break;
    case 'firebar': {
      const spin = Math.floor(s.frame / 3) % 4;
      for (const p of firebarLinks(e)) drawSprite(ctx, FIREBALL, p.x - 4 - s.cameraX, p.y - 4, { flipX: spin % 2 === 1, flipY: spin > 1 });
      break;
    }
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

/** Drawn before the tiles so the block / pipe hides them: items rising out of blocks, piranha plants. */
const behindTiles = (e: Entity): boolean => e.mode === 'emerge' || (e.kind === 'piranha' && e.mode !== 'flipped');

export function drawEmerging(ctx: CanvasRenderingContext2D, s: GameState): void {
  for (const e of s.entities) if (behindTiles(e) && (e.active || e.mode === 'emerge')) drawEntity(ctx, s, e);
}

export function drawEntities(ctx: CanvasRenderingContext2D, s: GameState): void {
  for (const e of s.entities) if (!behindTiles(e) && e.active) drawEntity(ctx, s, e);
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
    case 'dust': {
      const size = fx.life > 10 ? 3 : fx.life > 5 ? 2 : 1;
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fillRect(Math.round(x), Math.round(fx.y), size, size);
      break;
    }
    case 'score':
      drawText(ctx, fx.text ?? '', Math.round(x), Math.round(fx.y), { font: 'big', color: '#FFFFFF', outline: 'rgba(0,0,0,0.8)' });
      break;
  }
}

export function drawEffects(ctx: CanvasRenderingContext2D, s: GameState): void {
  for (const fx of s.effects) inLayer(ctx, s, fx.x, () => drawEffect(ctx, s, fx));
}
