/** Enemies. Goomba 16×16 (walk = mirror flip), koopa 16×24 facing right, shell 16×16. */

export const GOOMBA = [
  '......OOOO......',
  '.....OOOOOO.....',
  '....OOOOOOOO....',
  '...OOOOOOOOOO...',
  '..OKKOOOOOOKKO..',
  '.OOOWKOOOOKWOOO.',
  '.OOOWKKKKKKWOOO.',
  'OOOOWWKOOKWWOOOO',
  'OOOOWWWOOWWWOOOO',
  'OOOOOOOOOOOOOOOO',
  '.OOOOSSSSSSOOOO.',
  '....SSSSSSSS....',
  '...KKSSSSSSSS...',
  '..KKKKSSSSSSKK..',
  '..KKKKK..KKKKK..',
  '...KKKK..KKKK...',
];

export const GOOMBA_FLAT = [
  '....OOOOOOOO....',
  '..OOKKOOOOKKOO..',
  '.OOOWWKOOKWWOOO.',
  'OOOOOOOOOOOOOOOO',
  '..SSSSSSSSSSSS..',
  '.KKKKK....KKKKK.',
];

const KOOPA_HEAD = [
  '..........SS....',
  '.........SSSS...',
  '.........SWKS...',
  '.........SWKSS..',
  '.........SSSSSS.',
  '........SSSSSSS.',
  '..........SSSS..',
  '..........SSS...',
];

const KOOPA_BODY = [
  '....GGGG..SSS...',
  '...GGLGGG.SSS...',
  '..GGLLLGGWSS....',
  '..GLLGLLGWSS....',
  '.GGLGGGLGWSS....',
  '.GLLGGGLLWS.....',
  '.GGLLLLLGW......',
  '.GLGGLGGLW......',
  '.WWWWWWWWWW.....',
  '..WWWWWWWW......',
];

export const KOOPA = [
  [
    ...KOOPA_HEAD,
    ...KOOPA_BODY,
    '...SSS..SSS.....',
    '...SSS..SSS.....',
    '..SSSS..SSSS....',
    '..DDDD..DDDD....',
    '.DDDDD.DDDDD....',
    '................',
  ],
  [
    ...KOOPA_HEAD,
    ...KOOPA_BODY,
    '....SSSSSS......',
    '....SSS.SSS.....',
    '...SSSS.SSSS....',
    '...DDDD..DDDD...',
    '..DDDDD..DDDDD..',
    '................',
  ],
];

export const SHELL = [
  '................',
  '................',
  '.....GGGGGG.....',
  '...GGLLGGLLGG...',
  '..GLLGGLLGGLLG..',
  '.GLGGGLLLLGGGLG.',
  '.GLGGLGGGGLGGLG.',
  'GLLGLGGGGGGLGLLG',
  'GLGGLGGGGGGLGGLG',
  'GLGGGLLLLLLGGGLG',
  'GGLLLGGGGGGLLLGG',
  '.GGGGGGGGGGGGGG.',
  'WWWWWWWWWWWWWWWW',
  '.WWWWWWWWWWWWWW.',
  '..WWWWWWWWWWWW..',
  '................',
];

/** Koopa wing, flapping (drawn on the shell's back). */
export const WING = [
  [
    '......WW',
    '....WWWW',
    '..WWWWWW',
    '.WWWWWWK',
    'WWWWWKK.',
    'WWWKK...',
    '.KK.....',
    '........',
  ],
  [
    '........',
    '........',
    'WWWK....',
    'WWWWWK..',
    '.WWWWWWK',
    '..WWWWWW',
    '....WWWW',
    '......WW',
  ],
];

/** Bullet Bill, 16×12, facing left. */
export const BULLET = [
  '....KKKKKKKKKK..',
  '..KKKKKKKKKKKKWW',
  '.KKKWWKKKKKKKKWW',
  '.KKWWWWKKKKKKK..',
  'KKKWKWWKKKKKKKWW',
  'KKKKKKKKKKKKKKWW',
  'KKKKKKKKKKKKKK..',
  'KKKKKKKKKKKKKKWW',
  '.KKKKKKKKKKKKKWW',
  '.KKWWWWWKKKKKK..',
  '..KKKKKKKKKKKKWW',
  '....KKKKKKKKKK..',
];
