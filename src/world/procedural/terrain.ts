import type { Rng } from '../../core/rng';
import { prizeChar } from './air';
import { addEnemies } from './enemies';
import { chance, ChunkGrid, pick } from './grid';

/** Tallest obstacle for a tier (tier 0 stays gentle). */
const maxHeight = (tier: number): number => (tier === 0 ? 3 : 4);
/** Widest plain pit for a tier (1..4 tiles; tier 0 stays gentle). */
const maxPit = (tier: number): number => (tier === 0 ? 2 : tier === 1 ? 3 : 4);

/** Coin arc over `width` columns starting at x (peak on `line`). */
function coinArc(grid: ChunkGrid, x: number, width: number, line: number): void {
  for (let i = 0; i < width; i++) {
    const edge = i === 0 || i === width - 1;
    grid.set(x + i, edge ? line - 1 : line, 'o');
  }
}

/** 1–3 pipes of random height (2–4), touching (never stepping down) or 1–5 tiles apart, plus enemies. */
export function pipes(rng: Rng, tier: number): ChunkGrid {
  const count = rng.int(1, tier === 0 ? 2 : 3);
  const heights = Array.from({ length: count }, () => rng.int(2, maxHeight(tier)));
  const gaps = Array.from({ length: count - 1 }, () => pick(rng, [0, 1, 2, 3, 4, 5]));
  // Touching pipes must not step down: dropping off the taller one overshoots the lower top.
  for (let i = 1; i < count; i++) if (gaps[i - 1] === 0) heights[i] = Math.max(heights[i], heights[i - 1]);
  const width = 3 + count * 2 + gaps.reduce((a, b) => a + b, 0) + 3;
  const grid = new ChunkGrid(width);
  let x = 3;
  heights.forEach((h, i) => {
    grid.column(x, h, 'P');
    grid.column(x + 1, h, 'P');
    if (chance(rng, 0.25)) grid.set(x + rng.int(0, 1), h + 2, 'o');
    x += 2 + (gaps[i] ?? 0);
  });
  addEnemies(grid, rng, tier);
  return grid;
}

/** 1–2 pits (1–3 wide) with ground islands, optional coin arcs over them. */
export function gaps(rng: Rng, tier: number): ChunkGrid {
  const count = tier >= 1 && chance(rng, 0.45) ? 2 : 1;
  const widths = Array.from({ length: count }, () => rng.int(1, maxPit(tier)));
  const islands = Array.from({ length: count - 1 }, () => rng.int(2, 5));
  const width = 3 + widths.reduce((a, b) => a + b, 0) + islands.reduce((a, b) => a + b, 0) + 3;
  const grid = new ChunkGrid(width);
  let x = 3;
  widths.forEach((w, i) => {
    grid.pit(x, w);
    if (w >= 3 && tier >= 2 && chance(rng, 0.3)) pitPlatform(grid, rng, tier, x, w);
    else if (chance(rng, 0.55)) coinArc(grid, x - 1, w + 2, 4);
    x += w + (islands[i] ?? 0);
  });
  if (chance(rng, 0.4)) addEnemies(grid, rng, tier);
  return grid;
}

type StairKind = 'up' | 'down' | 'pyramid' | 'split';

/** Stairs up / down / pyramid / pyramid split by a pit; height 2–4, flat top 1–2. */
export function stairs(rng: Rng, tier: number): ChunkGrid {
  const kind: StairKind = pick(rng, tier === 0 ? ['up', 'down', 'pyramid'] : ['up', 'down', 'pyramid', 'split', 'split']);
  const h = rng.int(2, maxHeight(tier));
  const top = rng.int(1, 2);
  const pitW = kind === 'split' ? rng.int(1, 2) : 0;
  const rise = kind === 'down' ? 0 : h;
  const fall = kind === 'up' ? 0 : h;
  const width = 3 + rise + top + pitW + fall + 3;
  const grid = new ChunkGrid(width);
  let x = 3;
  for (let i = 1; i <= rise; i++) grid.column(x++, i, 'S');
  for (let i = 0; i < top; i++) grid.column(x++, h, 'S');
  if (pitW) {
    grid.pit(x, pitW);
    x += pitW;
    grid.column(x++, h, 'S');
  }
  for (let i = fall - (pitW ? 1 : 0); i >= 1; i--) grid.column(x++, i, 'S');
  if (chance(rng, 0.5)) addEnemies(grid, rng, tier);
  return grid;
}

/** Brick wall 2–4 high and 1–2 thick, sometimes crowned with a ? block or coins. */
export function wall(rng: Rng, tier: number): ChunkGrid {
  const h = rng.int(2, maxHeight(tier));
  const thick = rng.int(1, 2);
  const grid = new ChunkGrid(3 + thick + rng.int(4, 7));
  for (let i = 0; i < thick; i++) grid.column(3 + i, h, 'B');
  if (chance(rng, 0.5)) grid.row(3, h + 2, thick, 'o');
  addEnemies(grid, rng, tier, 3 + thick + 1);
  return grid;
}

/** 1–2 Bill Blasters (1–3 tall) that fire Bullet Bills toward the player. */
export function cannons(rng: Rng, tier: number): ChunkGrid {
  const count = tier >= 2 && chance(rng, 0.5) ? 2 : 1;
  const heights = Array.from({ length: count }, () => rng.int(1, 3));
  const space = rng.int(3, 6);
  const grid = new ChunkGrid(3 + count + (count - 1) * space + 4);
  heights.forEach((h, i) => {
    const x = 3 + i * (space + 1);
    grid.column(x, h - 1, 'I');
    grid.set(x, h, 'T');
  });
  if (chance(rng, 0.4)) addEnemies(grid, rng, Math.max(0, tier - 1));
  return grid;
}

/** Floating platform in the middle of a wide pit: bricks / ? blocks (maybe a power-up) or a cloud. */
function pitPlatform(grid: ChunkGrid, rng: Rng, tier: number, pitX: number, pitW: number): void {
  const len = pitW >= 6 ? 2 : pick(rng, [2, 2, 3]);
  const x = pitX + Math.floor((pitW - len) / 2);
  const line = pick(rng, [2, 3, 3, 4]);
  const style = pick(rng, ['bricks', 'bricks', 'question', 'cloud', 'prize', tier >= 1 ? 'power' : 'bricks']);
  if (style === 'prize') {
    // Reward for the risky jump: a stationary power-up sitting on the middle platform.
    grid.row(x, line, len, 'B');
    grid.set(x + rng.int(0, len - 1), line + 1, prizeChar(rng, tier));
    return;
  }
  if (style === 'cloud') {
    grid.row(x - (len < 3 ? 1 : 0), line, Math.max(len, 3), '=');
    return;
  }
  for (let i = 0; i < len; i++) grid.set(x + i, line, style === 'question' ? '?' : 'B');
  if (style === 'power') grid.set(x + rng.int(0, len - 1), line, rng.next() < 0.3 ? '*' : 'M');
  if (rng.next() < 0.6) grid.row(x, line + 2, len, 'o');
}

/**
 * Challenge pits: 5 tiles (tier 2) or 5–6 tiles (tier 3) wide with a floating platform in the middle
 * that the player has to land on and jump from.
 */
export function bigGaps(rng: Rng, tier: number): ChunkGrid {
  const w = tier >= 3 ? rng.int(5, 6) : 5;
  const grid = new ChunkGrid(3 + w + 4);
  grid.pit(3, w);
  pitPlatform(grid, rng, tier, 3, w);
  return grid;
}

/** Pipe — pit — pipe/stairs: no run-up before the pit, so the player must jump from the pipe top. */
export function gauntlet(rng: Rng, tier: number): ChunkGrid {
  const pit = rng.int(2, tier >= 3 ? 4 : 3);
  const h1 = rng.int(2, 3);
  const h2 = rng.int(2, 3);
  const grid = new ChunkGrid(3 + 2 + pit + 2 + 4);
  grid.column(3, h1, 'P');
  grid.column(4, h1, 'P');
  grid.pit(5, pit);
  grid.column(5 + pit, h2, 'P');
  grid.column(6 + pit, h2, 'P');
  if (chance(rng, 0.5)) grid.row(5, Math.max(h1, h2) + 3, pit, 'o');
  if (chance(rng, 0.35)) addEnemies(grid, rng, tier, 8 + pit);
  return grid;
}

