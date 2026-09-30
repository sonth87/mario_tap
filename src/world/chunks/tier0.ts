import type { ChunkDef } from '../chunkParser';

/** Tier 0 — introduces one thing at a time. */
export const TIER0: ChunkDef[] = [
  {
    id: 'intro-blocks',
    tier: 0,
    weight: 2,
    rows: [
      '....?...B?BMB...',
      '................',
      '................',
      '................',
      '################',
    ],
  },
  {
    id: 'intro-pipe',
    tier: 0,
    rows: [
      '.....PP.....',
      '.....PP.....',
      '############',
    ],
  },
  {
    id: 'intro-goomba',
    tier: 0,
    rows: [
      '..........g..',
      '#############',
    ],
  },
  {
    id: 'intro-gap',
    tier: 0,
    rows: [
      '.....oo.....',
      '............',
      '............',
      '#####  #####',
    ],
  },
  {
    id: 'intro-pyramid',
    tier: 0,
    rows: [
      '.....SS.....',
      '....SSSS....',
      '...SSSSSS...',
      '############',
    ],
  },
  {
    id: 'intro-coins',
    tier: 0,
    rows: [
      '....oooo....',
      '...o....o...',
      '............',
      '............',
      '############',
    ],
  },
];
