import type { BiomeId } from '../core/biome';
import {
  CAMERA_ANCHOR,
  COIN_POINTS,
  ENEMY_POINTS,
  GROUND_Y,
  MARIO_SMALL_HEIGHT,
  MARIO_WIDTH,
  RUN_SPEED,
  TILE,
} from '../core/constants';
import { createRng, type Rng } from '../core/rng';
import type { Bump, Effect, Entity, FlagState, GameEvent, GameStatus, Mario } from '../core/types';
import type { LiftState } from '../systems/lift';
import { LevelGenerator } from '../world/generator';
import { TileMap } from '../world/tileMap';

/** Whole simulation state of one run — plain data, advanced by `step()`. */
export interface GameState {
  status: GameStatus;
  /** Frames spent in the current status. */
  statusTimer: number;
  frame: number;
  seed: number;
  rng: Rng;
  map: TileMap;
  gen: LevelGenerator;
  mario: Mario;
  entities: Entity[];
  effects: Effect[];
  bumps: Bump[];
  cameraX: number;
  viewWidth: number;
  startX: number;
  maxX: number;
  coins: number;
  kills: number;
  /** Bonus points: flagpoles + stomp chains. */
  bonus: number;
  /** Flagpoles passed. */
  flags: number;
  /** One per flagpole, capped at MAX_SPEED_LEVEL (0 when speed-up is off). */
  speedLevel: number;
  speedUp: boolean;
  /** Biome under Mario, and the frame he entered it (drives the banner). */
  biome: BiomeId;
  biomeFrame: number;
  /** Frame of the last speed-up (drives the banner). */
  speedFrame: number;
  /** Frames left of hit-stop (world frozen after a stomp / kick). */
  hitstop: number;
  /** A press that came in during hit-stop, replayed when it ends. */
  heldPress: boolean;
  flag: FlagState | null;
  /** Ground ↔ cloud pan in progress (sky biome). */
  lift: LiftState | null;
  /** Pole columns already used this run (a pole pays out once). */
  usedPoles: Set<number>;
  /** Frames until each on-screen Bill Blaster (key col * VIEW_ROWS + row) fires. */
  cannonTimers: Map<number, number>;
  nextId: number;
  /** Events raised during the last step (sound, callbacks); cleared at the start of each step. */
  events: GameEvent[];
}

/** Flat ground between Mario and the first chunk, in tiles. */
const RUNWAY_AHEAD_TILES = 10;

function createMario(x: number): Mario {
  return {
    x, y: GROUND_Y - MARIO_SMALL_HEIGHT, w: MARIO_WIDTH, h: MARIO_SMALL_HEIGHT, vx: 0, vy: 0, grounded: true,
    dir: 1, jumpBuffer: 0, coyote: 0, power: 0, hurtTimer: 0, starTimer: 0, pendingGrow: false, stride: 0,
    shootTimer: 0, deathByPit: false, combo: 0, speed: RUN_SPEED, grip: 0,
  };
}

export interface RunRules {
  /** Biome cycle (default: all four; one entry = no biome changes). */
  biomes?: readonly BiomeId[];
  /** Run speed grows at every flagpole (default true). */
  speedUp?: boolean;
}

export function createState(seed: number, viewWidth: number, rules: RunRules = {}): GameState {
  const map = new TileMap();
  const rng = createRng(seed);
  const startX = Math.round(viewWidth * CAMERA_ANCHOR - MARIO_WIDTH / 2);
  const startCol = Math.floor(startX / TILE);
  const gen = new LevelGenerator(map, rng, startCol, rules.biomes?.length ? rules.biomes : undefined);
  gen.runway(startCol + RUNWAY_AHEAD_TILES);
  return {
    status: 'idle', statusTimer: 0, frame: 0, seed, rng, map, gen,
    mario: createMario(startX), entities: [], effects: [], bumps: [],
    cameraX: 0, viewWidth, startX, maxX: startX, coins: 0, kills: 0, bonus: 0, flags: 0, speedLevel: 0, speedUp: rules.speedUp ?? true,
    biome: gen.biome, biomeFrame: 0, speedFrame: 0, hitstop: 0, heldPress: false,
    flag: null, lift: null, usedPoles: new Set(), cannonTimers: new Map(), nextId: 0, events: [],
  };
}

/** Metres (tiles) beyond the start point, never decreasing. */
export function distanceOf(s: GameState): number {
  return Math.max(0, Math.floor((s.maxX - s.startX) / TILE));
}

/** User rule: distance + 10 per coin + 10 per defeated enemy + bonus (flagpoles, stomp chains). */
export function scoreOf(s: GameState): number {
  return distanceOf(s) + s.coins * COIN_POINTS + s.kills * ENEMY_POINTS + s.bonus;
}
