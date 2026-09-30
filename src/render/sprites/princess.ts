/**
 * Princess, facing right — shared by the Peach and Zelda characters (they differ by palette).
 * Keys: C crown · R crown gem · Y hair · S skin · K eye · P dress · Q dress shade · W trim ·
 * B brooch · D shoes. Small 16×16, big 16×32 (head + torso + skirt + per-frame hem/feet).
 */

const SMALL_HEAD = [
  '......C.C.C.....',
  '......CCRCC.....',
  '.....YYYYYYY....',
  '....YYYYSSSSY...',
  '....YYYSSKSSS...',
  '....YYYSSSSSS...',
  '...YYYYYSSSS....',
];

const SMALL_BODY = [
  '...YYYYWPPW.....',
  '..YYYYPPBPPS....',
  '..YYYPPPPPPSS...',
  '...YPPPPPPP.....',
  '....PPWPPPP.....',
];

const SMALL_BODY_REACH = [
  '...YYYYWPPWSS...',
  '..YYYYPPBPPS....',
  '..YYYPPPPPP.....',
  '...YPPPPPPP.....',
  '....PPWPPPP.....',
];

const SMALL_HEMS = {
  stand: ['...PPPPPPPPP....', '..PPQPPPQPPPP...', '..QQQQQQQQQQQ...', '...DDD...DDD....'],
  run0: ['...PPPPPPPPP....', '..PPQPPPQPPPPP..', '..QQQQQQQQQQQQ..', '..DDD......DDD..'],
  run1: ['....PPPPPPPP....', '...PPQPPPQPPP...', '...QQQQQQQQQ....', '....DDD.DDD.....'],
  run2: ['...PPPPPPPPP....', '.PPPQPPPQPPP....', '.QQQQQQQQQQQ....', '.DDD......DDD...'],
  jump: ['..PPPPPPPPPPP...', '.PPQPPPQPPPQPP..', '.QQQQQQQQQQQQQ..', '..DD.......DD...'],
};

export const PRINCESS_SMALL_STAND = [...SMALL_HEAD, ...SMALL_BODY, ...SMALL_HEMS.stand];
export const PRINCESS_SMALL_RUN = [SMALL_HEMS.run0, SMALL_HEMS.run1, SMALL_HEMS.run2].map((hem) => [...SMALL_HEAD, ...SMALL_BODY, ...hem]);
export const PRINCESS_SMALL_JUMP = [...SMALL_HEAD, ...SMALL_BODY_REACH, ...SMALL_HEMS.jump];

const BIG_HEAD = [
  '.......C.C.C....',
  '.......CCRCC....',
  '......CCCCCC....',
  '.....YYYYYYYY...',
  '....YYYYYYYYYY..',
  '....YYYYSSSSSY..',
  '...YYYYSSSKSSS..',
  '...YYYYSSSKSSS..',
  '...YYYYSSSSSSS..',
  '...YYYYYSSSSS...',
  '..YYYYYYYSSS....',
];

const BIG_TORSO = [
  '..YYYYYWPPPW....',
  '..YYYYPPPBPPS...',
  '..YYYPPPPPPPSS..',
  '..YYYPPPPPPPSS..',
  '...YYPPPPPPP....',
  '....PPWWWWPP....',
  '....PPPPPPPP....',
];

const BIG_TORSO_REACH = [
  '..YYYYYWPPPWSS..',
  '..YYYYPPPBPPSS..',
  '..YYYPPPPPPPS...',
  '..YYYPPPPPPP....',
  '...YYPPPPPPP....',
  '....PPWWWWPP....',
  '....PPPPPPPP....',
];

const BIG_SKIRT = [
  '....PPPPPPPPP...',
  '...PPPPPPPPPP...',
  '...PPQPPPPQPP...',
  '...PPQPPPPQPPP..',
  '..PPPQPPPPQPPP..',
  '..PPQPPPPPPQPP..',
  '..PPQPPPPPPQPPP.',
  '.PPPQPPPPPPQPPP.',
];

const BIG_HEMS = {
  stand: ['.PPQPPPPPPPPQPP.', '.WWWWWWWWWWWWWW.', '.QQQQQQQQQQQQQQ.', '..QQQQQQQQQQQQ..', '...DDD....DDD...', '..DDDD....DDDD..'],
  run0: ['.PPQPPPPPPPPQPPP', '.WWWWWWWWWWWWWWW', '.QQQQQQQQQQQQQQQ', '..QQQQQQQQQQQQQ.', '..DDD......DDD..', '.DDDD......DDDD.'],
  run1: ['..PQPPPPPPPPQPP.', '..WWWWWWWWWWWW..', '..QQQQQQQQQQQQ..', '...QQQQQQQQQQ...', '....DDD..DDD....', '....DDD..DDD....'],
  run2: ['PPPQPPPPPPPPQPP.', 'WWWWWWWWWWWWWWW.', 'QQQQQQQQQQQQQQQ.', '.QQQQQQQQQQQQQ..', '.DDD......DDD...', 'DDDD......DDDD..'],
};

export const PRINCESS_BIG_STAND = [...BIG_HEAD, ...BIG_TORSO, ...BIG_SKIRT, ...BIG_HEMS.stand];
export const PRINCESS_BIG_RUN = [BIG_HEMS.run0, BIG_HEMS.run1, BIG_HEMS.run2].map((hem) => [...BIG_HEAD, ...BIG_TORSO, ...BIG_SKIRT, ...hem]);
export const PRINCESS_BIG_JUMP = [...BIG_HEAD, ...BIG_TORSO_REACH, ...BIG_SKIRT, ...BIG_HEMS.run0];
