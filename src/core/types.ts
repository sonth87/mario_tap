import type { SpawnKind } from './tiles';

export type GameStatus = 'idle' | 'playing' | 'dying' | 'over';
/** 0 = small, 1 = big (mushroom), 2 = fire (flower). */
export type Power = 0 | 1 | 2;
export type Dir = 1 | -1;

/** Pixel-art character → CSS colour. Sprites are recoloured by swapping palettes. */
export type Palette = Record<string, string>;

/** Axis-aligned box that moves through the tile map. (x, y) is the top-left corner. */
export interface Body {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  grounded: boolean;
}

export interface MarioBody extends Body {
  dir: Dir;
  /** Frames left in which a buffered press still triggers a jump. */
  jumpBuffer: number;
  /** Frames left in which Mario may still jump after leaving the ground. */
  coyote: number;
}

export interface Mario extends MarioBody {
  power: Power;
  hurtTimer: number;
  starTimer: number;
  /** Waiting for head room to grow after eating a mushroom. */
  pendingGrow: boolean;
  /** Distance walked, drives the run animation. */
  stride: number;
  /** Shooting pose countdown (fire power). */
  shootTimer: number;
  deathByPit: boolean;
}

export type EntityKind = 'goomba' | 'koopa' | 'shell' | 'mushroom' | 'flower' | 'star' | 'fireball' | 'bullet';
/** Koopa wings: none, hopping (paratroopa) or hovering in place (red flyer). */
export type Wings = 'none' | 'hop' | 'fly';
/**
 * walk: normal movement · squashed: stomped goomba · flipped: knocked out, falls off screen ·
 * idle / slide: shell states · emerge: item rising out of a block.
 */
export type EntityMode = 'walk' | 'squashed' | 'flipped' | 'idle' | 'slide' | 'emerge';

export interface Entity extends Body {
  id: number;
  kind: EntityKind;
  mode: EntityMode;
  /** Red koopa / red shell (turns at ledges). */
  red: boolean;
  wings: Wings;
  /** Hover centre (flyer) — world y. */
  homeY: number;
  /** Mode-specific countdown/counter (squash, revive, kick grace, emerge, fireball life). */
  timer: number;
  /** Enemies sleep until they approach the screen. */
  active: boolean;
  removed: boolean;
}

export type EffectKind = 'coin' | 'debris' | 'score' | 'puff';

export interface Effect {
  kind: EffectKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  text?: string;
}

/** Active flagpole sequence: Mario slides down, then runs on. */
export interface FlagState {
  col: number;
  /** World y of the flag's top edge (slides down with Mario). */
  flagY: number;
  /** World y of the pole base block's top. */
  baseY: number;
  phase: 'slide' | 'hold';
  timer: number;
}

export interface Bump {
  col: number;
  row: number;
  timer: number;
}

export type GameEvent =
  | 'start'
  | 'jump'
  | 'coin'
  | 'stomp'
  | 'kick'
  | 'bump'
  | 'break'
  | 'powerAppear'
  | 'powerUp'
  | 'powerDown'
  | 'fireball'
  | 'star'
  | 'flag'
  | 'cannon'
  | 'die'
  | 'gameOver';

/** Snapshot handed to hosts (HUD, analytics). */
export interface GameStats {
  status: GameStatus;
  score: number;
  distance: number;
  coins: number;
  kills: number;
  /** Flagpole bonus points collected this run. */
  bonus: number;
  power: Power;
  /** Selected character id. */
  character: string;
  /** Character can be changed now (before the first press, or on the game-over screen). */
  canChangeCharacter: boolean;
  best: BestRecord;
  /** True on the game-over screen when this run beat the stored best score. */
  newRecord: boolean;
}

export interface BestRecord {
  score: number;
  distance: number;
  coins: number;
}

export interface SpawnRequest {
  kind: SpawnKind;
  col: number;
  row: number;
}
