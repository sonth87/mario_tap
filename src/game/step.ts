import {
  CAMERA_ANCHOR,
  DEATH_JUMP_VELOCITY,
  DEATH_PAUSE_FRAMES,
  DYING_FRAMES,
  GRAVITY,
  MAX_FALL_SPEED,
  MAX_FIREBALLS,
  PIT_DYING_FRAMES,
  RUN_SPEED,
  TILE,
  VIEW_HEIGHT,
} from '../core/constants';
import { isPickup, Tile } from '../core/tiles';
import { createEnemy, createFireball } from '../entities/factory';
import { cullEntities, updateEntity } from '../entities/update';
import { onIce, stepMarioBody } from '../physics/marioPhysics';
import { bumpBlock } from '../systems/blocks';
import { updateCannons } from '../systems/cannons';
import { entityInteractions, marioVsEntities } from '../systems/combat';
import { stepFlag, tryGrabFlag } from '../systems/flag';
import { stepLift, tryLift } from '../systems/lift';
import { applyPowerUp, killMario, tryGrow } from '../systems/marioPower';
import { addCoin, spawnDust, updateEffects } from '../systems/rewards';
import type { GameState } from './state';

/** Generate ahead of the right edge, forget what is behind the left edge. */
function streamLevel(s: GameState): void {
  const uptoCol = Math.ceil((s.cameraX + s.viewWidth) / TILE) + 4;
  for (const req of s.gen.ensure(uptoCol)) s.entities.push(createEnemy(s, req));
  s.map.pruneBefore(Math.floor(s.cameraX / TILE) - 2);
}

/** Coins and stationary power-ups overlapped by Mario. */
function collectCoinTiles(s: GameState): void {
  const m = s.mario;
  for (let c = Math.floor(m.x / TILE); c <= Math.floor((m.x + m.w - 0.001) / TILE); c++) {
    for (let r = Math.floor(m.y / TILE); r <= Math.floor((m.y + m.h - 0.001) / TILE); r++) {
      const tile = s.map.get(c, r);
      if (tile === Tile.Coin) {
        s.map.set(c, r, Tile.Empty);
        addCoin(s, c * TILE, r * TILE, false);
      } else if (isPickup(tile)) {
        s.map.set(c, r, Tile.Empty);
        applyPowerUp(s, tile === Tile.PickStar ? 'star' : tile === Tile.PickFlower ? 'flower' : 'mushroom');
      }
    }
  }
}

/** Camera only moves forward; the score distance is the furthest x reached. */
function followCamera(s: GameState): void {
  const m = s.mario;
  s.cameraX = Math.max(s.cameraX, m.x + m.w / 2 - s.viewWidth * CAMERA_ANCHOR);
  s.maxX = Math.max(s.maxX, m.x);
  // The biome follows the furthest point reached, so stepping back over a border does not flip it.
  const biome = s.map.biomeAt(Math.floor((s.maxX + m.w / 2) / TILE));
  if (biome !== s.biome) {
    s.biome = biome;
    s.biomeFrame = s.frame;
    s.events.push('biome');
  }
}

/** Landing dust, turn-around dust, and a spray while Mario is still building speed on ice. */
function dust(s: GameState, move: { landed: boolean; turned: boolean }, fallSpeed: number): void {
  const m = s.mario;
  const feet = m.y + m.h;
  if (move.landed && fallSpeed > 3.5) spawnDust(s, m.x + m.w / 2, feet, 2);
  if (move.turned && m.grounded) spawnDust(s, m.dir === 1 ? m.x : m.x + m.w, feet, 1);
  if (m.grip > 0 && s.frame % 4 === 0 && onIce(m, s.map)) spawnDust(s, m.x + m.w / 2 - m.dir * 6, feet, 1, 0.2);
}

function shoot(s: GameState): void {
  if (s.entities.filter((e) => e.kind === 'fireball').length >= MAX_FIREBALLS) return;
  s.entities.push(createFireball(s, s.mario));
  s.mario.shootTimer = 8;
  s.events.push('fireball');
}

function stepPlaying(s: GameState, pressed: boolean): void {
  const m = s.mario;
  if (s.lift) {
    // Panning between the ground and the clouds: the world holds still.
    stepLift(s);
    updateEffects(s);
    return;
  }
  if (s.flag) {
    // The world freezes while Mario rides the flagpole (input ignored), like the original.
    stepFlag(s);
    followCamera(s);
    updateEffects(s);
    return;
  }
  if (s.hitstop > 0) {
    // Hit-stop: the world holds still for a few frames; a press is kept for when it ends.
    s.hitstop -= 1;
    s.heldPress ||= pressed;
    return;
  }
  if (s.heldPress) {
    pressed = true;
    s.heldPress = false;
  }
  if (m.hurtTimer > 0) m.hurtTimer -= 1;
  if (m.starTimer > 0) m.starTimer -= 1;
  if (m.shootTimer > 0) m.shootTimer -= 1;
  // User rule: with the fire flower, every press both jumps (when possible) and throws a fireball.
  if (pressed && m.power === 2) shoot(s);

  const fallSpeed = m.vy;
  const move = stepMarioBody(m, s.map, pressed, s.cameraX);
  if (move.jumped) s.events.push('jump');
  if (move.landed) m.combo = 0;
  if (move.ceiling) bumpBlock(s, move.ceiling.col, move.ceiling.row);
  if (m.grounded) m.stride += Math.abs(m.vx) || RUN_SPEED;
  dust(s, move, fallSpeed);
  collectCoinTiles(s);
  tryGrow(s);
  if (tryGrabFlag(s) || tryLift(s)) return;

  followCamera(s);
  streamLevel(s);

  updateCannons(s);
  for (const e of s.entities) updateEntity(s, e);
  marioVsEntities(s);
  entityInteractions(s);
  updateEffects(s);
  cullEntities(s);
  if (s.status === 'playing' && m.y > VIEW_HEIGHT) killMario(s, true);
}

function stepDying(s: GameState): void {
  const m = s.mario;
  updateEffects(s);
  if (m.deathByPit) {
    if (s.statusTimer >= PIT_DYING_FRAMES) toGameOver(s);
    return;
  }
  if (s.statusTimer === DEATH_PAUSE_FRAMES) m.vy = -DEATH_JUMP_VELOCITY;
  if (s.statusTimer > DEATH_PAUSE_FRAMES) {
    m.vy = Math.min(m.vy + GRAVITY, MAX_FALL_SPEED);
    m.y += m.vy;
  }
  if (s.statusTimer >= DYING_FRAMES) toGameOver(s);
}

function toGameOver(s: GameState): void {
  s.status = 'over';
  s.statusTimer = 0;
  s.events.push('gameOver');
}

/**
 * Advances the simulation by one 60 Hz frame. `pressed` = the single input (click / Space / tap)
 * fired since the previous frame. Restarting after game over is the engine's job (new seed + best).
 */
export function step(s: GameState, pressed: boolean): void {
  s.events.length = 0;
  s.frame += 1;
  s.statusTimer += 1;
  switch (s.status) {
    case 'idle':
      streamLevel(s);
      if (pressed) {
        s.status = 'playing';
        s.statusTimer = 0;
        s.events.push('start');
      }
      return;
    case 'playing':
      stepPlaying(s, pressed);
      return;
    case 'dying':
      stepDying(s);
      return;
    case 'over':
      return;
  }
}
