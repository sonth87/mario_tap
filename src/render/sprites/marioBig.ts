/**
 * Big plumber, 16×32, facing right — NES-era proportions: a large head (12 rows), a stocky torso
 * and short legs. Assembled from a shared head, torso poses and per-frame legs so every frame
 * stays consistent. Keys as in marioSmall.ts.
 */

const HEAD = [
  '......CCCCC.....',
  '....CCCCCCCCC...',
  '...CCCCCCCCCCCC.',
  '...DDDDSSSDS....',
  '..DSSDSSSSDSSS..',
  '..DSSDSSSSDSSSS.',
  '..DSSDDSSSSDSSSS',
  '..DDSSSSSDDDDDD.',
  '...DSSSSDDDDDD..',
  '....SSSSSSSSS...',
  '.....SSSSSSS....',
];

const TORSO = [
  '.....TTRTTT.....',
  '....TTTRTTTRT...',
  '...TTTTRTTTRTT..',
  '..TTTTTRTTTRTTT.',
  '..TTTTTRRRRRTTT.',
  '.TTTTTRYRRRYRTTT',
  '.TTTTRRRRRRRRTTT',
  '.TTTRRRRRRRRRRTT',
  '.SSSRRRRRRRRRSSS',
  'SSSSRRRRRRRRRSSS',
  'SSS.RRRRRRRRR.SS',
  '...RRRRRRRRRRR..',
  '...RRRRRRRRRRR..',
  '...RRRRR.RRRRR..',
];

/** Arms swinging (run): back hand behind the hip, front hand forward. */
const TORSO_SWING = [
  '.....TTRTTT.....',
  '....TTTRTTTRT...',
  '...TTTTRTTTRTT..',
  '..TTTTTRTTTRTTT.',
  '..TTTTTRRRRRTTTT',
  '.TTTTTRYRRRYRTTT',
  'TTTTTRRRRRRRRRTT',
  'TTT.RRRRRRRRRRSS',
  'SSS.RRRRRRRRRSSS',
  'SS..RRRRRRRRRSS.',
  '...RRRRRRRRRRR..',
  '...RRRRRRRRRRR..',
  '...RRRRRRRRRRR..',
  '...RRRRR.RRRRR..',
];

/** Jump: front fist punched up past the cap (drawn in HEAD_JUMP), back arm down. */
const HEAD_JUMP = [
  '.............SSS',
  '......CCCCC..SSS',
  '....CCCCCCCCCSSS',
  '...CCCCCCCCCCCTT',
  '...DDDDSSSDS.TTT',
  '..DSSDSSSSDSSTTT',
  '..DSSDSSSSDSSSTT',
  '..DSSDDSSSSDSSTT',
  '..DDSSSSSDDDDDTT',
  '...DSSSSDDDDDTT.',
  '....SSSSSSSSTT..',
  '.....SSSSSSSTT..',
];

const TORSO_JUMP = [
  '....TTTRTTTRT...',
  '...TTTTRTTTRT...',
  '..TTTTTRRRRRT...',
  '.TTTTTRYRRRYR...',
  'TTTTTRRRRRRRR...',
  'TTTTRRRRRRRRRR..',
  'SSS.RRRRRRRRRRR.',
  'SSS.RRRRRRRRRRRR',
  'SS.RRRRRRRRRRRRR',
  '..RRRRRRRR.RRRRR',
  '..RRRRRRR...RRNN',
];

const LEGS_STAND = [
  '....RRRR..RRRR..',
  '....RRR....RRR..',
  '...NNNN....NNNN.',
  '..NNNNN....NNNNN',
  '..NNNNN....NNNNN',
];

const LEGS_RUN = [
  // Full stride.
  ['..RRRR....RRRR..', '.RRRR......RRRN.', 'NNNN.......NNNNN', 'NNNN.......NNNNN', '.NNN........NNNN'],
  // Passing.
  ['.....RRRRRRR....', '....RRRR.RRR....', '...NNNN.NNNN....', '..NNNNNNNNNNN...', '...NNN..NNNNN...'],
  // Half stride.
  ['...RRRR...RRRR..', '..RRR.....RRRR..', '.NNNN....NNNN...', '.NNNNN...NNNNN..', '..NNN.....NNNNN.'],
];

const LEGS_JUMP = [
  '.RRRRRR.....NNNN',
  '.RRRRR......NNNN',
  'RRRRR........NN.',
  'NNNN............',
  'NNNNN...........',
  'NNNNN...........',
  'NNNN............',
];

const EMPTY = '................';

/** Joins parts and pads the top so the sprite is 32 rows with the feet on the bottom row. */
function frame(...parts: string[][]): string[] {
  const rows = parts.flat();
  return [...Array.from({ length: 32 - rows.length }, () => EMPTY), ...rows];
}

export const BIG_STAND = frame(HEAD, TORSO, LEGS_STAND);
export const BIG_RUN = LEGS_RUN.map((legs, i) => frame(HEAD, i === 1 ? TORSO : TORSO_SWING, legs));
export const BIG_JUMP = frame(HEAD_JUMP, TORSO_JUMP, LEGS_JUMP);
