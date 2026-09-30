import { BIG_LEGS, hero, legs, SMALL_LEGS } from './heroes';

/**
 * Blondie: long blonde hair, pink bikini, hourglass figure — same 16×16 / 16×32 frames and collision
 * boxes as every other character. Keys: Y hair · S skin · K eye · R lips & bikini shade ·
 * P bikini · D sandals (legs reuse the shared run templates, trousers → skin).
 */
const SMALL_TOP = [
  '......YYYYY.....',
  '....YYYYYYYYY...',
  '...YYYYSSSSYY...',
  '...YYYSKSSKYY...',
  '...YYYSSRRSYY...',
  '..YYYYYSSSYYY...',
  '..YYYYSSSSSSYY..',
  '..YYYSPPSSPPSY..',
  '..YYYYSSSSSSY...',
  '..YYYSPPPPPPS...',
  '...YYSPPRRPPS...',
  '....SSSSSSSS....',
  '....SSSSSSSS....',
];

const BIG_TOP = [
  '.....YYYYYY.....',
  '...YYYYYYYYYY...',
  '..YYYYYYYYYYYY..',
  '..YYYYYSSSSYYY..',
  '.YYYYYSSSSSSYYY.',
  '.YYYYSSKSSKSYYY.',
  '.YYYYSSSSSSSYYY.',
  '.YYYYYSSRRSYYYY.',
  '.YYYYYYSSSYYYYY.',
  '.YYYYYYYSSYYYYY.',
  '..YYYYYSSSSYYY..',
  '..YYYYSSSSSSYY..',
  '..YYYSSSSSSSSY..',
  '.YYYYSPPSSPPSY..',
  '.YYYYPPPSSPPPY..',
  '.YYYYSPPSSPPSY..',
  '.YYYYSSSSSSSSY..',
  '..YYYSSSSSSSY...',
  '..YYYYSSSSSSY...',
  '..YYYSSSSSSSS...',
  '..YYYSPPPPPPS...',
  '..YYSPPPPPPPPS..',
  '...YYSPPRRPPS...',
  '....SSSSSSSSS...',
];

export const BLONDIE = hero(
  SMALL_TOP,
  SMALL_TOP,
  legs(SMALL_LEGS, 'S', 'D'),
  BIG_TOP,
  BIG_TOP,
  legs(BIG_LEGS, 'S', 'D'),
);
