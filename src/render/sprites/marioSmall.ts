/**
 * Small plumber, 16×16, facing right — NES-era proportions (big head, short legs).
 * Keys: C cap · D hair, eye & moustache · S skin · T shirt · R overalls · Y buttons · N shoes.
 */

const HEAD = [
  '.....CCCCC......',
  '....CCCCCCCCC...',
  '....DDDSSDS.....',
  '...DSDSSSDSSS...',
  '...DSDDSSSDSSS..',
  '...DDSSSSDDDD...',
  '.....SSSSSSS....',
];

export const SMALL_STAND = [
  ...HEAD,
  '....TTRTTT......',
  '...TTTRTTRTTT...',
  '..TTTTRRRRTTTT..',
  '..SSTRYRRYRTSS..',
  '..SSSRRRRRRSSS..',
  '..SSRRRRRRRRSS..',
  '....RRR..RRR....',
  '...NNN....NNN...',
  '..NNNN....NNNN..',
];

export const SMALL_RUN = [
  // Full stride: back arm swung behind, front foot reaching forward.
  [
    ...HEAD,
    '....TTRTTT......',
    '..TTTTRRTTTT....',
    '.STTTTRRRRTTSS..',
    '.SSTTRYRRYRTSS..',
    '.SS.RRRRRRRR....',
    '...RRRRRRRRRR...',
    '..RRRRR..RRRRR..',
    '.NNNN......NNNN.',
    'NNNN........NNNN',
  ],
  // Passing: legs together, arm down in front of the body.
  [
    ...HEAD,
    '.....TTTRT......',
    '....TTTTRRT.....',
    '....TTTRRYR.....',
    '....RTTTRRRR....',
    '....RRSSSRRR....',
    '....RRSSRRRR....',
    '.....RRRRRR.....',
    '.....NNNNNNN....',
    '.....NNNN.NNN...',
  ],
  // Half stride.
  [
    ...HEAD,
    '....TTRTTT......',
    '...TTTRTTRTT....',
    '..TTTTRRRRTTS...',
    '..SSTRYRRYRSSS..',
    '..SSRRRRRRRSS...',
    '...RRRRRRRRR....',
    '...RRRR.RRRR....',
    '..NNNN...NNNN...',
    '..NNN.....NNNN..',
  ],
];

/** Classic jump: fist punched up, front knee raised, back leg kicked down. */
export const SMALL_JUMP = [
  '.............SSS',
  '......CCCCC..SSS',
  '.....CCCCCCCCCSS',
  '.....DDDSSDS.TTT',
  '....DSDSSSDSSTTT',
  '....DSDDSSSDSSST',
  '....DDSSSSDDDDT.',
  '......SSSSSSST..',
  '..TTTTTRTTTRT...',
  '.TTTTTTTRTTTR..N',
  'SSTTTTTTRRRRR.NN',
  'SSS.TTRRYRRYRRNN',
  '.S..RRRRRRRRRRNN',
  '...RRRRRRRRRRRNN',
  '..RRRRRRR.......',
  '.NNNN...........',
];

export const SMALL_DEAD = [
  '.....CCCCCC.....',
  '...CCCCCCCCCC...',
  '...DDSDSSDSDD...',
  '..DSSDSSSSDSSD..',
  '..DSSSSSSSSSSD..',
  '...SSSDDDDSSS...',
  '..SS.SSSSSS.SS..',
  '.SSS.TTRRTT.SSS.',
  '.SS.TTTRRTTT.SS.',
  '....TTRRRRTT....',
  '....RRYRRYRR....',
  '...RRRRRRRRRR...',
  '...RRRR..RRRR...',
  '...NNN....NNN...',
  '..NNNN....NNNN..',
  '................',
];
