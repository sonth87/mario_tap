import type { ChunkDef } from '../chunkParser';

/** Tier 2 — combinations: enemies between obstacles, stairs over pits, red koopas on ledges. */
export const TIER2: ChunkDef[] = [
  {
    id: 'pipe-goomba-pit',
    tier: 2,
    rows: [
      '..........PP.........',
      '...PP.....PP.........',
      '...PP..g..PP.........',
      '...PP.....PP.........',
      '################  ###',
    ],
  },
  {
    id: 'stair-gap',
    tier: 2,
    weight: 2,
    rows: [
      '......S..S......',
      '.....SS..SS.....',
      '....SSS..SSS....',
      '...SSSS..SSSS...',
      '#######  #######',
    ],
  },
  {
    id: 'red-koopa-ledge',
    tier: 2,
    rows: [
      '.......r.......',
      '.....BBMBB.....',
      '...............',
      '...............',
      '...............',
      '###############',
    ],
  },
  {
    id: 'star-bricks',
    tier: 2,
    rows: [
      '....BB*BB.CC....',
      '................',
      '................',
      '..........g..g..',
      '################',
    ],
  },
  {
    id: 'wall-pit-wall',
    tier: 2,
    rows: [
      '....B.....B....',
      '....B.....B....',
      '....B.....B....',
      '#######  ######',
    ],
  },
  {
    id: 'koopa-goomba-mix',
    tier: 2,
    rows: [
      '.....o.o.o.o.....',
      '.................',
      '.................',
      '......k...g..g...',
      '#################',
    ],
  },
  {
    id: 'cloud-bridge',
    tier: 2,
    rows: [
      '.......ooooo.......',
      '......=======......',
      '...................',
      '...................',
      '..............g....',
      '#######   #########',
    ],
  },
];
