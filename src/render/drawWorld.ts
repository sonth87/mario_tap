import type { BiomeId } from '../core/biome';
import { BUMP_FRAMES, GROUND_ROW, GROUND_Y, TILE, VIEW_HEIGHT, VIEW_ROWS, VINE_BOTTOM_ROW } from '../core/constants';
import type { GameTheme } from '../core/theme';
import { isPole, Tile } from '../core/tiles';
import type { GameState } from '../game/state';
import { drawSprite } from './atlas';
import { COIN, COIN_THIN, FLOWER, MUSHROOM, STAR } from './sprites/items';
import { BRICK, CANNON_BASE, CANNON_TOP, GROUND, GROUND_DEEP, HARD, QUESTION, USED } from './sprites/tiles';
import { activeEdge, columnOffset, isUpper, viewRise } from '../systems/lift';
import { CLOUD_DEEP, CLOUD_FLOOR, CLOUD_PALETTE, ICE, ICE_PALETTE, VINE } from './sprites/biome';
import { STAR_CYCLE } from './sprites/palettes';
import { tilePalettes, type TilePalettes } from './themePalettes';

const SHIMMER: (keyof TilePalettes)[] = ['base', 'base', 'dim', 'dark', 'dim'];

function drawPipeCell(ctx: CanvasRenderingContext2D, pipe: GameTheme['pipe'], x: number, y: number, top: boolean, left: boolean): void {
  // The lip spans the full tile; the body is inset 2 px on the outer side.
  const x0 = top ? x : left ? x + 2 : x;
  const x1 = top ? x + TILE : left ? x + TILE : x + TILE - 2;
  const y0 = top ? y + 1 : y;
  const h = top ? TILE - 2 : TILE;
  ctx.fillStyle = pipe.outline;
  ctx.fillRect(x0, y, x1 - x0, TILE);
  ctx.fillStyle = pipe.body;
  const inner0 = left ? x0 + 1 : x0;
  const inner1 = left ? x1 : x1 - 1;
  ctx.fillRect(inner0, y0, inner1 - inner0, h);
  ctx.fillStyle = left ? pipe.light : pipe.dark;
  if (left) ctx.fillRect(inner0 + 2, y0, 3, h);
  else ctx.fillRect(inner1 - 6, y0, 5, h);
}

/** Puffy one-way cloud platform; only the upper ~11 px are drawn so it reads as "stand on top". */
function drawCloudPlatform(ctx: CanvasRenderingContext2D, c: GameTheme['cloudPlatform'], x: number, y: number, frame: number, col: number): void {
  const bob = (col + Math.floor(frame / 20)) % 2;
  ctx.fillStyle = c.outline;
  ctx.fillRect(x, y + 1, TILE, 10);
  ctx.fillRect(x + 2 - bob, y, TILE - 4 + bob, 1);
  ctx.fillStyle = c.fill;
  ctx.fillRect(x, y + 2, TILE, 7);
  ctx.fillRect(x + 3 - bob, y + 1, TILE - 6 + bob, 1);
  ctx.fillStyle = c.shade;
  ctx.fillRect(x, y + 7, TILE, 2);
}

/** Row of the pole base block top (first non-pole row under the pole). */
function poleBaseRow(s: GameState, col: number, topRow: number): number {
  let row = topRow;
  while (row < VIEW_ROWS && isPole(s.map.get(col, row))) row += 1;
  return row;
}

function drawPole(ctx: CanvasRenderingContext2D, s: GameState, f: GameTheme['flagpole'], col: number, row: number, x: number, dy: number): void {
  const y = row * TILE + dy;
  if (s.map.get(col, row) === Tile.PoleTop) {
    ctx.fillStyle = f.shaft;
    ctx.fillRect(x + 7, y + 8, 2, 8);
    ctx.fillStyle = f.ball;
    ctx.fillRect(x + 5, y + 2, 6, 6);
    ctx.fillRect(x + 4, y + 3, 8, 4);
    // The flag hangs left of the shaft: at the top, sliding with Mario, or at the bottom once used.
    let flagY = y + TILE;
    if (s.flag?.col === col) flagY = s.flag.flagY + dy;
    else if (s.usedPoles.has(col)) flagY = (poleBaseRow(s, col, row) - 1) * TILE + dy;
    drawFlag(ctx, f, x, flagY);
    return;
  }
  ctx.fillStyle = f.shaft;
  ctx.fillRect(x + 7, y, 2, TILE);
}

function drawFlag(ctx: CanvasRenderingContext2D, f: GameTheme['flagpole'], x: number, y: number): void {
  ctx.fillStyle = f.flag;
  // Triangle: vertical edge on the shaft, apex pointing left at mid height.
  for (let i = 0; i < 8; i++) ctx.fillRect(x + 7 - (i + 1) * 2, y + i, (i + 1) * 2, 1);
  for (let i = 0; i < 8; i++) ctx.fillRect(x + 7 - (8 - i) * 2, y + 8 + i, (8 - i) * 2, 1);
  ctx.fillStyle = f.emblem;
  ctx.fillRect(x - 3, y + 6, 4, 4);
}

function bumpOffset(s: GameState, col: number, row: number): number {
  const b = s.bumps.find((x) => x.col === col && x.row === row);
  return b ? -Math.round(Math.sin((Math.PI * (BUMP_FRAMES - b.timer)) / BUMP_FRAMES) * 5) : 0;
}

function drawTile(ctx: CanvasRenderingContext2D, s: GameState, theme: GameTheme, tile: number, col: number, row: number, sx: number, dy: number): void {
  const y = row * TILE + bumpOffset(s, col, row) + dy;
  const pal = tilePalettes(theme);
  const shimmer = pal[SHIMMER[Math.floor(s.frame / 8) % SHIMMER.length]];
  switch (tile) {
    case Tile.Ground:
      drawSprite(ctx, row === GROUND_ROW || s.map.get(col, row - 1) !== Tile.Ground ? GROUND : GROUND_DEEP, sx, y, { palette: pal.base });
      break;
    case Tile.Ice:
      drawSprite(ctx, ICE, sx, y, { palette: ICE_PALETTE });
      break;
    case Tile.CloudFloor:
      drawSprite(ctx, s.map.get(col, row - 1) === Tile.CloudFloor ? CLOUD_DEEP : CLOUD_FLOOR, sx, y, { palette: CLOUD_PALETTE });
      break;
    case Tile.Vine:
      drawSprite(ctx, VINE, sx, y);
      break;
    case Tile.Brick:
    case Tile.BrickCoin:
    case Tile.BrickStar:
      drawSprite(ctx, BRICK, sx, y, { palette: pal.base });
      break;
    case Tile.QCoin:
    case Tile.QPower:
      drawSprite(ctx, QUESTION, sx, y, { palette: shimmer });
      break;
    case Tile.Used:
      drawSprite(ctx, USED, sx, y, { palette: pal.base });
      break;
    case Tile.Hard:
      drawSprite(ctx, HARD, sx, y, { palette: pal.base });
      break;
    case Tile.Pipe:
      drawPipeCell(ctx, theme.pipe, sx, y, s.map.get(col, row - 1) !== Tile.Pipe, s.map.get(col - 1, row) !== Tile.Pipe);
      break;
    case Tile.Coin:
      drawSprite(ctx, Math.floor(s.frame / 12) % 4 === 3 ? COIN_THIN : COIN, sx, y, { palette: shimmer });
      break;
    case Tile.PickStar:
      drawSprite(ctx, STAR, sx, y + Math.round(Math.sin(s.frame / 10 + col)), { palette: Math.floor(s.frame / 6) % 2 ? 'dim' : 'base' });
      break;
    case Tile.PickMushroom:
      drawSprite(ctx, MUSHROOM, sx, y + Math.round(Math.sin(s.frame / 14 + col)));
      break;
    case Tile.PickFlower:
      drawSprite(ctx, FLOWER, sx, y + Math.round(Math.sin(s.frame / 14 + col)), { palette: STAR_CYCLE[Math.floor(s.frame / 5) % STAR_CYCLE.length] });
      break;
    case Tile.Cloud:
      drawCloudPlatform(ctx, theme.cloudPlatform, sx, y, s.frame, col);
      break;
    case Tile.CannonTop:
      drawSprite(ctx, CANNON_TOP, sx, y, { palette: pal.base });
      break;
    case Tile.CannonBase:
      drawSprite(ctx, CANNON_BASE, sx, y, { palette: pal.base });
      break;
    case Tile.Pole:
    case Tile.PoleTop:
      drawPole(ctx, s, theme.flagpole, col, row, sx, dy);
      break;
  }
}

/** Glowing lava filling the bottom of a pit column, with a rolling crest. */
function drawLava(ctx: CanvasRenderingContext2D, lava: string, sx: number, col: number, frame: number, dy: number): void {
  const top = VIEW_HEIGHT - 9 + dy;
  ctx.fillStyle = lava;
  ctx.fillRect(sx, top + 2, TILE, VIEW_HEIGHT - top - 2);
  ctx.fillStyle = 'rgba(255,220,120,0.9)';
  for (let i = 0; i < TILE; i += 4) {
    const crest = Math.round(Math.sin((col * TILE + i) / 5 + frame / 10) * 1.5);
    ctx.fillRect(sx + i, top + crest, 4, 2);
  }
  ctx.fillStyle = 'rgba(248,88,24,0.18)';
  ctx.fillRect(sx, top - 14, TILE, 14);
}

/**
 * Near a ground ↔ cloud border, the ground layer goes on under the cloud columns (it is not in the
 * tile map there — those rows hold the clouds), and the vine reaches all the way down to it.
 */
function drawUnderClouds(ctx: CanvasRenderingContext2D, s: GameState, themes: Record<BiomeId, GameTheme>, col: number, sx: number): void {
  const edge = activeEdge(s);
  if (!edge || !isUpper(edge, col)) return;
  const v = Math.round(viewRise(s, edge));
  if (edge.upper === 'left' && col === edge.trigger) {
    for (let y = (VINE_BOTTOM_ROW + 1) * TILE + v - edge.rows * TILE; y < GROUND_Y + v; y += TILE) drawSprite(ctx, VINE, sx, y);
  }
  if (GROUND_Y + v >= VIEW_HEIGHT) return;
  const pal = tilePalettes(themes[edge.lowerBiome]).base;
  drawSprite(ctx, edge.lowerBiome === 'snow' ? ICE : GROUND, sx, GROUND_Y + v, { palette: edge.lowerBiome === 'snow' ? ICE_PALETTE : pal });
  drawSprite(ctx, GROUND_DEEP, sx, GROUND_Y + TILE + v, { palette: pal });
}

/** Visible tiles, left to right; each column in the colours of its biome, at its layer's height. */
export function drawTiles(ctx: CanvasRenderingContext2D, s: GameState, themes: Record<BiomeId, GameTheme>): void {
  const first = Math.floor(s.cameraX / TILE);
  const last = Math.ceil((s.cameraX + s.viewWidth) / TILE);
  for (let col = first; col <= last; col++) {
    const sx = Math.round(col * TILE - s.cameraX);
    const theme = themes[s.map.biomeAt(col)];
    const dy = Math.round(columnOffset(s, col));
    drawUnderClouds(ctx, s, themes, col, sx);
    if (theme.lava && s.map.get(col, GROUND_ROW) === Tile.Empty) drawLava(ctx, theme.lava, sx, col, s.frame, dy);
    for (let row = 0; row < VIEW_ROWS; row++) {
      const tile = s.map.get(col, row);
      if (tile !== Tile.Empty) drawTile(ctx, s, theme, tile, col, row, sx, dy);
    }
  }
}
