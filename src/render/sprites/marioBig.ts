/**
 * Big Mario, 16×32, facing right — assembled from a shared head, a torso (two arm poses)
 * and per-frame legs, which keeps every frame consistent.
 */

const HEAD = [
  '......RRRRR.....',
  '....RRRRRRRRR...',
  '...RRRRRRRRRRRR.',
  '....DDDSSDSS....',
  '...DSDSSSDSSSS..',
  '...DSDDSSSDSSSS.',
  '...DDSSSSDDDDD..',
  '.....SSSSSSSS...',
  '......SSSSS.....',
];

const TORSO = [
  '.....RRBRRR.....',
  '....RRRBRRBRR...',
  '...RRRRBRRBRRR..',
  '..RRRRRBBBBRRRR.',
  '..RRRRBYBBYBRRR.',
  '..SSRRBBBBBBRSS.',
  '.SSSSRBBBBBBSSSS',
  '.SSS.BBBBBBBBSSS',
  '..S..BBBBBBBB.S.',
  '.....BBBBBBBB...',
  '.....BBBBBBBB...',
  '....BBBBBBBBBB..',
];

const TORSO_REACH = [
  '.....RRBRRR.SSS.',
  '....RRRBRRBRSSS.',
  '...RRRRBRRBRRS..',
  '..RRRRRBBBBRRR..',
  '..RRRRBYBBYBRR..',
  '.SSRRRBBBBBBR...',
  'SSSSRRBBBBBBB...',
  'SSS..BBBBBBBB...',
  '.S...BBBBBBBB...',
  '.....BBBBBBBB...',
  '.....BBBBBBBBB..',
  '....BBBBBBBBBB..',
];

const LEGS_STAND = [
  '....BBBB..BBBB..',
  '....BBBB..BBBB..',
  '....BBB....BBB..',
  '....BBB....BBB..',
  '....BBB....BBB..',
  '....BBB....BBB..',
  '....BBB....BBB..',
  '...DDDD....DDDD.',
  '..DDDDD....DDDDD',
  '..DDDDD....DDDDD',
  '..DDDDD....DDDDD',
];

const LEGS_RUN = [
  [
    '...BBBBBBBBBB...',
    '..BBBBB..BBBBB..',
    '..BBBB....BBBB..',
    '.BBBB......BBB..',
    '.BBB........BBB.',
    'BBB.........BBB.',
    'BBB.........BBB.',
    'DDD........DDDD.',
    'DDDD......DDDDD.',
    'DDDD......DDDDD.',
    '.DDD......DDDDD.',
  ],
  [
    '....BBBBBBBB....',
    '....BBBBBBBB....',
    '....BBBB.BBB....',
    '....BBB..BBB....',
    '....BBB..BBB....',
    '...BBB...BBB....',
    '...BBB...BBB....',
    '..DDDD..DDDD....',
    '.DDDDD..DDDDD...',
    '.DDDDD..DDDDD...',
    '.DDDD...DDDDD...',
  ],
  [
    '....BBBBBBBBB...',
    '...BBBBB.BBBB...',
    '...BBBB...BBB...',
    '..BBBB....BBB...',
    '..BBB......BBB..',
    '.BBB.......BBB..',
    '.BBB........BBB.',
    '.DDD.......DDDD.',
    'DDDD.......DDDDD',
    'DDD........DDDDD',
    '...........DDDDD',
  ],
];

const LEGS_JUMP = [
  '....BBBBBBBBBB..',
  '...BBBBBBBBBBB..',
  '..BBBBBB..BBBB..',
  '.BBBBB.....BBB..',
  '.BBBB......BBBB.',
  'DDDD.......BBBB.',
  'DDDD........BBB.',
  'DDD.........DDDD',
  'DD..........DDDD',
  '............DDDD',
  '................',
];

export const BIG_STAND = [...HEAD, ...TORSO, ...LEGS_STAND];
export const BIG_RUN = LEGS_RUN.map((legs) => [...HEAD, ...TORSO, ...legs]);
export const BIG_JUMP = [...HEAD, ...TORSO_REACH, ...LEGS_JUMP];
