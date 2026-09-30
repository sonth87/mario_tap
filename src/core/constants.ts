/**
 * Every tunable number of the game lives here. Units: world pixels and fixed 60 Hz frames
 * (velocities are px/frame, accelerations px/frame²). One tile = 16 px = 1 metre of score.
 * Level-design limits (MAX_*) are derived from the jump arc — change the physics, re-run
 * `pnpm --filter @sonth87/mario-runner validate` (docs/level-design.md).
 */

// ── World grid ────────────────────────────────────────────────────────────────
export const TILE = 16;
/** Visible rows. Row 0 is the top of the screen. */
export const VIEW_ROWS = 13;
export const VIEW_HEIGHT = VIEW_ROWS * TILE;
/** Row whose top edge is the ground surface (rows 11 and 12 are ground). */
export const GROUND_ROW = 11;
export const GROUND_Y = GROUND_ROW * TILE;
/** Clamp for the variable world width (derived from the host element's aspect ratio). */
export const MIN_VIEW_WIDTH = 12 * TILE;
export const MAX_VIEW_WIDTH = 40 * TILE;

// ── Timing ────────────────────────────────────────────────────────────────────
export const FPS = 60;
export const FRAME_MS = 1000 / FPS;
/** Catch-up cap so a background tab does not simulate seconds at once. */
export const MAX_STEPS_PER_FRAME = 5;

// ── Mario physics ─────────────────────────────────────────────────────────────
export const RUN_SPEED = 1.35;
export const GRAVITY = 0.34;
/** Fixed jump impulse (user decision: one jump height, no hold-to-jump-higher). */
export const JUMP_VELOCITY = 7.4;
export const MAX_FALL_SPEED = 8;
export const STOMP_BOUNCE = 4.8;
/** A press this many frames before landing still jumps on landing. */
export const JUMP_BUFFER_FRAMES = 6;
/** A press this many frames after walking off a ledge still jumps. */
export const COYOTE_FRAMES = 5;
export const MARIO_WIDTH = 12;
export const MARIO_SMALL_HEIGHT = 15;
export const MARIO_BIG_HEIGHT = 30;
/** Mario's screen anchor: fraction of the view width left of him while the camera pushes. */
export const CAMERA_ANCHOR = 0.3;

// ── Level-design limits (validated by scripts/validate-chunks.ts) ─────────────
/** Tallest obstacle measured from the surface Mario runs on, in tiles. */
export const MAX_OBSTACLE_TILES = 4;
/**
 * Pits up to MAX_OPEN_GAP_TILES can be jumped with a plain run-up; wider ones (up to MAX_GAP_TILES,
 * the hard cap the chunk parser accepts) only appear with a floating block / cloud in the middle.
 * `pnpm validate` is what actually proves each layout is crossable.
 */
export const MAX_OPEN_GAP_TILES = 4;
export const MAX_GAP_TILES = 6;
/** Flat ground inserted between chunks (inclusive range). */
export const SPACER_MIN_TILES = 3;
export const SPACER_MAX_TILES = 5;
/** Flat ground at the very start of a run, in tiles past the right screen edge. */
export const START_RUNWAY_TILES = 8;
/** Distance (tiles) per difficulty tier; tier is capped at MAX_TIER. */
export const TIER_DISTANCE = 250;
export const MAX_TIER = 3;

// ── Entities ──────────────────────────────────────────────────────────────────
export const ENEMY_SPEED = 0.5;
export const ITEM_SPEED = 1;
export const SHELL_SPEED = 3.2;
export const STAR_BOUNCE = 5;
export const FIREBALL_SPEED = 3.5;
export const FIREBALL_BOUNCE = 3;
export const FIREBALL_GRAVITY = 0.4;
export const MAX_FIREBALLS = 2;
export const ITEM_EMERGE_FRAMES = 32;
/** Frames a squashed goomba stays on screen. */
export const SQUASH_FRAMES = 30;
/** Idle shell becomes a koopa again after this many frames. */
export const SHELL_REVIVE_FRAMES = 300;
/** A just-kicked shell cannot hurt Mario for this many frames. */
export const KICK_GRACE_FRAMES = 12;
/** Enemies wake up when they are this close (px) past the right screen edge. */
export const ACTIVATION_MARGIN = TILE;
/** Entities further than this left of the camera are removed. */
export const DESPAWN_MARGIN = 3 * TILE;

/** Paratroopa hop impulse (it bounces every time it lands). */
export const PARA_HOP = 4.2;
/** Red flyer hover: amplitude (px) and angular speed (rad / frame). */
export const FLYER_AMPLITUDE = 22;
export const FLYER_SPEED = 0.045;
export const BULLET_SPEED = 1.6;
/** Bill Blaster fires every N frames (random in range) while on screen… */
export const CANNON_INTERVAL_MIN = 150;
export const CANNON_INTERVAL_MAX = 240;
/** …but not when the player is this close (tiles), like the original. */
export const CANNON_SAFE_TILES = 3;
export const MAX_BULLETS = 3;

// ── Mario power timers ────────────────────────────────────────────────────────
export const HURT_INVULN_FRAMES = 120;
export const STAR_FRAMES = 600;
/** Multi-coin brick: coins stop after this many hits or frames after the first hit. */
export const MULTI_COIN_MAX = 10;
export const MULTI_COIN_FRAMES = 240;
export const BUMP_FRAMES = 8;

// ── Game flow ─────────────────────────────────────────────────────────────────
export const DEATH_PAUSE_FRAMES = 30;
export const DEATH_JUMP_VELOCITY = 7;
export const DYING_FRAMES = 150;
export const PIT_DYING_FRAMES = 60;
/** Input ignored this long on the game-over screen (avoids an accidental restart). */
export const GAME_OVER_LOCK_FRAMES = 36;

// ── Scoring (user decision: distance + 10/coin + 10/enemy + flagpole bonus) ───
export const COIN_POINTS = 10;
export const ENEMY_POINTS = 10;
/**
 * Flagpole bonus by grab height (feet above the ground, in tiles), highest band first.
 * The pole top is 9 tiles up; a jump from the top of the staircase at its edge reaches it (kept
 * at 5+9 so the whole arc stays on screen).
 */
export const FLAG_POINTS: ReadonlyArray<readonly [minTiles: number, points: number]> = [
  [8, 100],
  [6, 50],
  [4, 30],
  [2, 20],
  [0, 10],
];

// ── Flagpole milestone ────────────────────────────────────────────────────────
/** First flagpole this far (tiles) past the start, then one every FLAG_INTERVAL_TILES. */
export const FIRST_FLAG_TILES = 120;
export const FLAG_INTERVAL_TILES = 300;
/** Mario / flag slide speed down the pole (px per frame). */
export const FLAG_SLIDE_SPEED = 2;
/** Pause at the bottom of the pole before running on. */
export const FLAG_HOLD_FRAMES = 24;
