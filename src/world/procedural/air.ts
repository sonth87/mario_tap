import type { Rng } from '../../core/rng';
import { addEnemies } from './enemies';
import { chance, ChunkGrid, pick } from './grid';

/** SMB block heights: first row 3 tiles above the ground (line 4), second row 4 above that. */
const ROW1 = 4;
const ROW2 = 8;

/** A row of `len` blocks: mostly bricks and ? blocks, at most one power-up / star, rare coin bricks. */
function blockRow(grid: ChunkGrid, rng: Rng, tier: number, x: number, line: number, len: number): void {
  let special = false;
  for (let i = 0; i < len; i++) {
    const r = rng.next();
    let ch = r < 0.3 ? '?' : r < 0.36 ? 'C' : 'B';
    if (!special && r > 0.8) {
      ch = tier >= 1 && chance(rng, 0.25) ? '*' : 'M';
      special = true;
    }
    grid.set(x + i, line, ch);
  }
}

/** Floating block rows in many shapes: single ?, short/long rows, a second tier offset to the side. */
export function blocks(rng: Rng, tier: number): ChunkGrid {
  const len = pick(rng, [1, 1, 2, 3, 4, 5, 5, 6, 7, 8]);
  const lone = len > 1 && chance(rng, 0.35);
  const upperLen = tier >= 1 && chance(rng, 0.45) ? rng.int(2, 6) : 0;
  const upperGap = rng.int(2, 3);
  const x0 = 3 + (lone ? 4 : 0);
  const width = x0 + len + (upperLen ? upperGap + upperLen : 0) + 3;
  const grid = new ChunkGrid(width);
  if (lone) grid.set(3, ROW1, pick(rng, ['?', '?', 'M']));
  blockRow(grid, rng, tier, x0, ROW1, len);
  if (chance(rng, 0.3)) grid.row(x0, ROW1 + 1, len, 'o');
  if (upperLen) {
    const ux = x0 + len + upperGap;
    blockRow(grid, rng, tier, ux, ROW2, upperLen);
    if (chance(rng, 0.5)) grid.row(ux, ROW2 + 1, upperLen, 'o');
    if (chance(rng, 0.3)) grid.set(ux + rng.int(0, upperLen - 1), ROW2 + 1, 'r');
  }
  addEnemies(grid, rng, tier);
  return grid;
}

type Formation = (grid: ChunkGrid, rng: Rng, x: number) => number;

/** Coin formations; each returns the width it used. */
const FORMATIONS: Formation[] = [
  (g, rng, x) => {
    const n = rng.int(3, 8);
    g.row(x, rng.int(3, 4), n, 'o');
    return n;
  },
  (g, _rng, x) => {
    [2, 3, 4, 4, 3, 2].forEach((line, i) => g.set(x + i, line + 1, 'o'));
    return 6;
  },
  (g, rng, x) => {
    const n = rng.int(3, 6);
    g.row(x, 3, n, 'o');
    g.row(x, 5, n, 'o');
    return n;
  },
  (g, _rng, x) => {
    [5, 4, 3, 2, 3, 4, 5].forEach((line, i) => g.set(x + i, line, 'o'));
    return 7;
  },
  (g, _rng, x) => {
    [[2], [2, 4], [2, 4, 6], [2, 4], [2]].forEach((lines, i) => lines.forEach((l) => g.set(x + i, l, 'o')));
    return 5;
  },
  (g, rng, x) => {
    const n = rng.int(2, 4);
    for (let i = 0; i < n; i++) for (let l = 2; l <= 4; l++) g.set(x + i, l, 'o');
    return n;
  },
];

/** Coin formations over flat ground (1–2 of them), with a few enemies about. */
export function coins(rng: Rng, tier: number): ChunkGrid {
  const grid = new ChunkGrid(24);
  let x = 3;
  const count = rng.int(1, 2);
  for (let i = 0; i < count && x < 14; i++) x += pick(rng, FORMATIONS)(grid, rng, x) + rng.int(2, 3);
  addEnemies(grid, rng, tier);
  return trimmed(grid, x + 2);
}

/** Staggered one-way cloud platforms (lines 3–7) with coins, sometimes over a pit. */
export function clouds(rng: Rng, tier: number): ChunkGrid {
  const grid = new ChunkGrid(26);
  let x = 3;
  let line = rng.int(3, 4);
  const count = rng.int(2, 3);
  for (let i = 0; i < count; i++) {
    const len = rng.int(2, 5);
    grid.row(x, line, len, '=');
    if (chance(rng, 0.6)) grid.row(x, line + 1, len, 'o');
    x += len + rng.int(1, 3);
    line = Math.max(3, Math.min(7, line + pick(rng, [-2, -1, 1, 2, 3])));
  }
  if (tier >= 2 && chance(rng, 0.4)) grid.pit(5, rng.int(1, 3));
  addEnemies(grid, rng, Math.max(0, tier - 1));
  return trimmed(grid, x + 2);
}

/** Copies the first `width` columns (formation generators allocate generously). */
function trimmed(grid: ChunkGrid, width: number): ChunkGrid {
  const w = Math.min(grid.width, Math.max(8, width));
  const out = new ChunkGrid(w);
  for (let x = 0; x < w; x++) for (let line = 0; line <= 11; line++) out.set(x, line, grid.get(x, line));
  return out;
}

/**
 * Power-up spot: every layout holds at least one mushroom / fire-flower block ('M'); higher tiers
 * add star bricks and a second upper row.
 */
export function powerups(rng: Rng, tier: number): ChunkGrid {
  const shape = pick(rng, ['row', 'row', 'lone', 'pair', tier >= 2 ? 'upper' : 'row']);
  const star = tier >= 1 && chance(rng, 0.4);
  if (shape === 'lone') {
    const grid = new ChunkGrid(12);
    grid.set(4, ROW1, 'M');
    grid.set(8, ROW1, star ? '*' : '?');
    if (chance(rng, 0.5)) grid.row(3, ROW1 + 2, 6, 'o');
    addEnemies(grid, rng, tier, 3);
    return grid;
  }
  if (shape === 'pair') {
    const grid = new ChunkGrid(14);
    grid.row(3, ROW1, 3, 'B');
    grid.set(4, ROW1, 'M');
    grid.row(8, ROW1, 3, 'B');
    grid.set(9, ROW1, star ? '*' : 'M');
    addEnemies(grid, rng, tier, 3);
    return grid;
  }
  const len = rng.int(3, 6);
  const grid = new ChunkGrid(6 + len + (shape === 'upper' ? 6 : 0));
  grid.row(3, ROW1, len, 'B');
  const at = rng.int(0, len - 1);
  grid.set(3 + at, ROW1, 'M');
  if (len >= 4) grid.set(3 + ((at + 2) % len), ROW1, star ? '*' : '?');
  if (shape === 'upper') {
    const ux = 3 + len + 2;
    grid.row(ux, ROW2, 4, 'B');
    grid.set(ux + rng.int(0, 3), ROW2, tier >= 3 && chance(rng, 0.5) ? '*' : 'M');
  }
  addEnemies(grid, rng, tier, 3);
  return grid;
}

/** Pickup char for a stationary prize: mushroom early, star / fire flower later. */
export function prizeChar(rng: Rng, tier: number): string {
  if (tier === 0) return '&';
  return pick(rng, ['$', '$', '%', tier >= 2 ? '$' : '%']);
}

/**
 * Sky prizes: a stationary star / flower / mushroom on top of a floating brick or cloud. The player
 * has to jump up onto the platform to eat it; from tier 1 it takes 2–3 climbing steps (each 2 tiles
 * higher, bricks or clouds, 1–2 tiles apart) and the prize sits on the topmost one.
 */
export function skyPrizes(rng: Rng, tier: number): ChunkGrid {
  const steps = tier === 0 ? 1 : pick(rng, tier >= 3 ? [1, 2, 3, 3] : [1, 2, 2]);
  const grid = new ChunkGrid(7 + steps * 5);
  let x = 3;
  let line = pick(rng, [3, 4]);
  for (let i = 0; i < steps; i++) {
    const len = rng.int(2, 3);
    const cloud = i > 0 && chance(rng, 0.5);
    grid.row(x, line, len, cloud ? '=' : 'B');
    if (i === steps - 1) grid.set(x + rng.int(0, len - 1), line + 1, prizeChar(rng, tier));
    else if (chance(rng, 0.5)) grid.set(x + rng.int(0, len - 1), line + 1, 'o');
    x += len + rng.int(1, 2);
    line = Math.min(8, line + 2);
  }
  addEnemies(grid, rng, tier, 3);
  return grid;
}
