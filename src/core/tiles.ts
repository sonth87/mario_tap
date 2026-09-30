/** Tile ids stored in the TileMap (one byte each). */
export const Tile = {
  Empty: 0,
  Ground: 1,
  Brick: 2,
  /** Brick that pays out several coins. */
  BrickCoin: 3,
  /** Brick hiding a star. */
  BrickStar: 4,
  /** ? block with one coin. */
  QCoin: 5,
  /** ? block with a mushroom (small Mario) or fire flower (big Mario). */
  QPower: 6,
  /** Emptied block. */
  Used: 7,
  /** Unbreakable stair block. */
  Hard: 8,
  Pipe: 9,
  /** Free-floating coin (not solid, collected on touch). */
  Coin: 10,
  /** Cloud platform: one-way — jump up through it, land on top. */
  Cloud: 11,
  /** Flagpole shaft / top ball: not solid, touching it starts the flag sequence. */
  Pole: 12,
  PoleTop: 13,
  /** Bill Blaster: barrel on top (fires Bullet Bills), pedestal below. Solid. */
  CannonTop: 14,
  CannonBase: 15,
  /** Stationary power-ups resting on a platform: not solid, eaten on touch (no block to hit). */
  PickStar: 16,
  PickMushroom: 17,
  PickFlower: 18,
} as const;

export type TileId = (typeof Tile)[keyof typeof Tile];

/** Blocks movement from every side. */
export function isSolid(t: number): boolean {
  return t !== Tile.Empty && t !== Tile.Coin && t !== Tile.Cloud && t !== Tile.Pole && t !== Tile.PoleTop && !isPickup(t);
}

export function isPickup(t: number): boolean {
  return t === Tile.PickStar || t === Tile.PickMushroom || t === Tile.PickFlower;
}

/** Can be stood on (solid tiles plus one-way cloud platforms). */
export function isStandable(t: number): boolean {
  return isSolid(t) || t === Tile.Cloud;
}

export function isPole(t: number): boolean {
  return t === Tile.Pole || t === Tile.PoleTop;
}

/** Blocks that react when hit from below. */
export function isBumpable(t: number): boolean {
  return t === Tile.Brick || t === Tile.BrickCoin || t === Tile.BrickStar || t === Tile.QCoin || t === Tile.QPower;
}

/**
 * Chunk legend (docs/level-design.md). The last row of a chunk is the ground-surface row;
 * a space in that row is a pit. Lower-case letters spawn entities on an empty cell.
 */
export const TILE_LEGEND: Record<string, TileId> = {
  '.': Tile.Empty,
  ' ': Tile.Empty,
  '#': Tile.Ground,
  B: Tile.Brick,
  C: Tile.BrickCoin,
  '*': Tile.BrickStar,
  '?': Tile.QCoin,
  M: Tile.QPower,
  S: Tile.Hard,
  P: Tile.Pipe,
  o: Tile.Coin,
  '=': Tile.Cloud,
  '|': Tile.Pole,
  '^': Tile.PoleTop,
  T: Tile.CannonTop,
  I: Tile.CannonBase,
  $: Tile.PickStar,
  '&': Tile.PickMushroom,
  '%': Tile.PickFlower,
};

export const SPAWN_LEGEND = {
  g: 'goomba',
  k: 'koopa',
  r: 'redKoopa',
  /** Winged green koopa that hops along. */
  p: 'paratroopa',
  /** Winged red koopa that hovers up and down in place. */
  f: 'flyer',
} as const;

export type SpawnKind = (typeof SPAWN_LEGEND)[keyof typeof SPAWN_LEGEND];
