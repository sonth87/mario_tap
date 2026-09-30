import type { CharacterSprites } from '../../core/character';

/**
 * Link and Toad, facing right. Legs come from shared templates ('p' = trousers, 'd' = boots) so the
 * three run frames stay consistent; `legs()` swaps in each hero's palette keys.
 * Link keys: G tunic / cap · L tunic shade · Y hair · S skin · K eye · D boots & belt · W leggings.
 * Toad keys: W cap & trousers · R cap spots · S skin · K eye · B vest · Y vest trim · D shoes.
 */

export const SMALL_LEGS = {
  stand: ['....ppp..ppp....', '...dddd..dddd...', '...dddd..dddd...'],
  run0: ['...ppp....ppp...', '..ddd......ddd..', '.dddd......dddd.'],
  run1: ['.....pppppp.....', '....ddd.ddd.....', '....dddd.dddd...'],
  run2: ['....ppp...ppp...', '...ddd....ddd...', '..dddd.....ddd..'],
  jump: ['...ppp...ppp....', '..ddd.....dd....', '.dddd....ddd....'],
};

export const BIG_LEGS = {
  stand: [
    '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....',
    '...dddd..dddd...', '..ddddd..ddddd..', '..ddddd..ddddd..', '..ddddd..ddddd..',
  ],
  run0: [
    '...ppp....ppp...', '..ppp......ppp..', '..ppp......ppp..', '.ppp........ppp.',
    '.ddd........ddd.', 'dddd.......dddd.', 'dddd.......dddd.', '.ddd........ddd.',
  ],
  run1: [
    '.....pppppp.....', '.....ppp.ppp....', '.....ppp.ppp....', '.....ppp.ppp....',
    '....dddd.dddd...', '...ddddd.ddddd..', '...ddddd.ddddd..', '...dddd...dddd..',
  ],
  run2: [
    '....ppp...ppp...', '...ppp.....ppp..', '..ppp.......ppp.', '..ppp.......ppp.',
    '..ddd.......ddd.', '.dddd.......dddd', '.dddd.......dddd', '..ddd........ddd',
  ],
  jump: [
    '...ppp....ppp...', '..ppp.....pppp..', '.ppp......dddd..', '.ppp......dddd..',
    '.ddd............', 'dddd............', 'dddd............', '.ddd............',
  ],
};

export type LegSet = Record<'stand' | 'run0' | 'run1' | 'run2' | 'jump', string[]>;

export function legs(set: LegSet, pants: string, boots: string): LegSet {
  const paint = (rows: string[]): string[] => rows.map((r) => r.replace(/p/g, pants).replace(/d/g, boots));
  return { stand: paint(set.stand), run0: paint(set.run0), run1: paint(set.run1), run2: paint(set.run2), jump: paint(set.jump) };
}

export function hero(smallTop: string[], smallTopReach: string[], small: LegSet, bigTop: string[], bigTopReach: string[], big: LegSet): CharacterSprites {
  return {
    smallStand: [...smallTop, ...small.stand],
    smallRun: [small.run0, small.run1, small.run2].map((l) => [...smallTop, ...l]),
    smallJump: [...smallTopReach, ...small.jump],
    bigStand: [...bigTop, ...big.stand],
    bigRun: [big.run0, big.run1, big.run2].map((l) => [...bigTop, ...l]),
    bigJump: [...bigTopReach, ...big.jump],
  };
}

// ── Link ─────────────────────────────────────────────────────────────────────
const LINK_HEAD = [
  '.......GGGG.....',
  '.....GGGGGGG....',
  '...GGGGGGGGGG...',
  '..GGGYYYYYYGG...',
  '.GG.YYSSSKSY....',
  '.G..YSSSSSSSS...',
  '....YYSSSSSS....',
  '......SSSS......',
];
const LINK_BODY = ['....GGGGGGG.....', '...GGGGLGGGGSS..', '..SSGGGLGGG.SS..', '..SS.DDDDDD.....', '....GGGGGGG.....'];
const LINK_BODY_REACH = ['....GGGGGGG.SS..', '...GGGGLGGGGSS..', '..SSGGGLGGGG....', '..SS.DDDDDD.....', '....GGGGGGG.....'];

const LINK_BIG_HEAD = [
  '........GGGG....',
  '......GGGGGGG...',
  '....GGGGGGGGGG..',
  '...GGGGGGGGGGG..',
  '..GGGYYYYYYYGG..',
  '.GGGYYSSSSKSY...',
  '.GG.YSSSSSKSSS..',
  '.G..YSSSSSSSSS..',
  '....YYSSSSSSS...',
  '.....YSSSSSS....',
  '.......SSSS.....',
];
const LINK_BIG_TORSO = [
  '.....GGGGGGG....',
  '....GGGGLGGGG...',
  '...GGGGGLGGGGSS.',
  '..SSGGGGLGGGGSS.',
  '..SSGGGGLGGGG...',
  '..SS.DDDDDDDD...',
  '.....DDDYDDDD...',
  '.....GGGGGGGG...',
  '....GGGGGGGGGG..',
  '....GGGGGGGGGG..',
  '...GGGLGGGGLGG..',
  '...GGLLGGGGLLG..',
  '....WWW...WWW...',
];
const LINK_BIG_TORSO_REACH = [
  '.....GGGGGGG.SS.',
  '....GGGGLGGGGSS.',
  '...GGGGGLGGGGS..',
  '..SSGGGGLGGGG...',
  '..SSGGGGLGGGG...',
  ...LINK_BIG_TORSO.slice(5),
];

export const LINK: CharacterSprites = hero(
  [...LINK_HEAD, ...LINK_BODY],
  [...LINK_HEAD, ...LINK_BODY_REACH],
  legs(SMALL_LEGS, 'W', 'D'),
  [...LINK_BIG_HEAD, ...LINK_BIG_TORSO],
  [...LINK_BIG_HEAD, ...LINK_BIG_TORSO_REACH],
  legs(BIG_LEGS, 'W', 'D'),
);

// ── Toad ─────────────────────────────────────────────────────────────────────
const TOAD_HEAD = [
  '.....WWWWWW.....',
  '...WWRRWWRRWW...',
  '..WWRRRWWRRRWW..',
  '.WWWRRWWWWRRWWW.',
  '.WRRWWWWWWWWRRW.',
  '.WRRWWWWWWWWRRW.',
  '..WWWWWWWWWWWW..',
  '....SSSKSKSS....',
  '....SSSSSSSS....',
];
const TOAD_BODY = ['...BBYSSSSYBB...', '..SBBBYYYYBBBS..', '..SSBBBBBBBBSS..', '....WWWWWWWW....'];
const TOAD_BODY_REACH = ['...BBYSSSSYBBSS.', '..SBBBYYYYBBBS..', '...BBBBBBBBB....', '....WWWWWWWW....'];

const TOAD_BIG_HEAD = [
  '.....WWWWWW.....',
  '...WWWWWWWWWW...',
  '..WWRRRWWRRRWW..',
  '.WWRRRRWWRRRRWW.',
  '.WWRRRWWWWRRRWW.',
  'WWWWWWWWWWWWWWWW',
  'WRRWWWWWWWWWWRRW',
  'WRRRWWWWWWWWRRRW',
  'WWRRWWWWWWWWRRWW',
  '.WWWWWWWWWWWWWW.',
  '...SSSSSSSSSS...',
  '...SSSKSSKSSS...',
  '...SSSKSSKSSS...',
  '...SSSSSSSSSS...',
  '....SSSSSSSS....',
];
const TOAD_BIG_BODY = [
  '....BBYYYYBB....',
  '...BBBBYYBBBB...',
  '..SBBBBYYBBBBS..',
  '..SSBBBBBBBBSS..',
  '..SS.BBBBBB.SS..',
  '.....WWWWWW.....',
  '....WWWWWWWW....',
  '....WWWWWWWW....',
  '....WWW..WWW....',
];
const TOAD_BIG_BODY_REACH = ['....BBYYYYBB.SS.', '...BBBBYYBBBBSS.', '..SBBBBYYBBBBS..', '..SSBBBBBBBB....', ...TOAD_BIG_BODY.slice(4)];

export const TOAD: CharacterSprites = hero(
  [...TOAD_HEAD, ...TOAD_BODY],
  [...TOAD_HEAD, ...TOAD_BODY_REACH],
  legs(SMALL_LEGS, 'W', 'D'),
  [...TOAD_BIG_HEAD, ...TOAD_BIG_BODY],
  [...TOAD_BIG_HEAD, ...TOAD_BIG_BODY_REACH],
  legs(BIG_LEGS, 'W', 'D'),
);
