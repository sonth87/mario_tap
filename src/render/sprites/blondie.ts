import { BIG_LEGS, hero, legs, SMALL_LEGS } from './heroes';

/**
 * Blondie: blonde ponytail, pink bikini — seen in profile facing right like every other character,
 * same 16×16 / 16×32 frames and collision boxes. Keys: Y hair · H hair shade · R hair tie, lips &
 * bikini shade · S skin · A skin shade (near arm) · K eye · P bikini · D sandals (legs reuse the
 * shared run templates, trousers → skin).
 */
const SMALL_HEAD = [
  '.....YYYYY......',
  '...YYYYYYYYY....',
  '..YYYYYYYYYYY...',
  'HRRYYYYYSSKSS...',
  'YYHYYYHSSSKSSS..',
  'YYY.YYHSSSSSS...',
  'YH...YHSSSSRS...',
  'Y.....SSSSSS....',
];

const SMALL_BODY = [
  '......SSSS......',
  '.....SSPPPPP....',
  '.....SAPPRP.....',
  '.....SASSSS.....',
  '....SAPPRPP.....',
];

const SMALL_BODY_REACH = [
  '......SSSS...SS.',
  '.....SSPPPPPSS..',
  '....SSAPPRPS....',
  '.....SSSSSS.....',
  '....SSPPRPP.....',
];

const BIG_HEAD = [
  '......YYYYY.....',
  '....YYYYYYYYY...',
  '...YYYYYYYYYYY..',
  '..YYYYYYYYYYYYY.',
  '.HRRYYYYYYSSSS..',
  'YYYRHYYYYSSSKS..',
  'YYYYYYYHSSSSKSS.',
  'YYHY.YYHSSSSSSSS',
  'YYY..YYHSSSSSSS.',
  'YHY...YHSSSSRRS.',
  'YY.....YSSSSSS..',
  'YH......SSSSS...',
  'Y.......SSSS....',
];

const BIG_TORSO = [
  '......SSSSSS....',
  '.....SSSSSSSS...',
  '.....SAPPPPPPP..',
  '.....SAPPPPPPPP.',
  '.....SAAPPPPRP..',
  '.....SSASSSSS...',
  '......SASSSS....',
  '......SASSSS....',
  '.....SSASSSSS...',
  '....SSAPPPPPPP..',
  '....SSAPPPRPPP..',
  '.....SSPPPPPP...',
  '.....SSSSSSSS...',
];

const BIG_TORSO_REACH = [
  '......SSSSSS..SS',
  '.....SSSSSSSSSS.',
  '.....SSPPPPPPS..',
  '.....SAPPPPPPPP.',
  '.....SAAPPPPRP..',
  '.....SSSSSSSS...',
  ...BIG_TORSO.slice(6),
];

export const BLONDIE = hero(
  [...SMALL_HEAD, ...SMALL_BODY],
  [...SMALL_HEAD, ...SMALL_BODY_REACH],
  legs(SMALL_LEGS, 'S', 'D'),
  [...BIG_HEAD, ...BIG_TORSO],
  [...BIG_HEAD, ...BIG_TORSO_REACH],
  legs(BIG_LEGS, 'S', 'D'),
);
