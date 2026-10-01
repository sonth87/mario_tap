import type { CharacterSprites } from '../../core/character';
import { BIG_LEGS, bigFrames, hero, legs, SMALL_LEGS, smallFrames, type LegSet } from './heroes';

/**
 * Straw Hat crew, facing right, NES-style: small 16×16 = 13-row top + 3-row legs, big 16×32 =
 * 26-row top + 6-row legs (shared templates in heroes.ts).
 */

/** Jump pose: the front hand thrown up-forward — `hand` at columns 13–14 of rows `row` and `row + 1`. */
function reach(rows: string[], row: number, hand = 'S'): string[] {
  return rows.map((r, i) => (i === row || i === row + 1 ? `${r.slice(0, 13)}${hand}${hand}${r.slice(15)}` : r));
}

// ── Luffy ── Y straw hat · R hat band & vest · K hair & eye · M mouth · T teeth · S skin · B shorts · W cuffs · Q sash · D sandals
const LUFFY_SMALL = [
  '.....YYYYY......',
  '....YYYYYYY.....',
  '....RRRRRRR.....',
  '.YYYYYYYYYYYYY..',
  '...KKKKSSKS.....',
  '..KKKSSSSKSS....',
  '..KKSSSSSSSSS...',
  '...KSSSSSMTTM...',
  '....SSSSSSMM....',
  '...RRSSSSRR.....',
  '..SRRSSSSRRS....',
  '..SSQQQQQQSS....',
  '....BBBBBBB.....',
];

/**
 * Big Luffy, detailed style: dark outline (O) and a shade tone per colour — H hat shade · V vest
 * shade · Z skin shade · N shorts shade.
 */
const LUFFY_BIG_HEAD = [
  '.....OOOOOO.....',
  '....OYYYYYYO....',
  '...OYYYYYYYHO...',
  '...ORRRRRRRRO...',
  '.OOYYYYYYYYYHOO.',
  'OYYYYYYYYYYYYHHO',
  '.OOKKKKKKSKOOOO.',
  '..OKKKKKSSSKSO..',
  '..OKKKKSSSSKSSO.',
  '..OKKKZZSSSSSSO.',
  '..OKKKSSSSSSSSO.',
  '...OKKSSSSMTTO..',
  '....OZSSSSSMMO..',
];

const LUFFY_BIG_TOP = [
  ...LUFFY_BIG_HEAD,
  '.....OOZSSSOO...',
  '....ORRRZZRO....',
  '...ORRRRSSSRO...',
  '...ORVRRSSSRO...',
  '...ORVSSZRRRO...',
  '...ORVSSZRRRO...',
  '...ORVSSZRRVO...',
  '...ORRSSZRRVO...',
  '...OBBZSSOBBO...',
  '...OBBOSSOBNO...',
  '...OBBBOOBBNO...',
  '...OBBBBBBBNO...',
];

const LUFFY_BIG_TOP_JUMP = [
  ...LUFFY_BIG_HEAD,
  '.....OOZSSSOOSSO',
  '....ORRRZZROSSO.',
  '...ORRRRRRSSSO..',
  '...ORVRRRRRSO...',
  '...ORVRRRRRRO...',
  '...ORVRRRRRVO...',
  '...ORRRRRRRVO...',
  '..OSSORRRRRVO...',
  '..OSSOBBBBBBO...',
  '...OOBBBBBBNO...',
  '...OBBBBBBBNO...',
  '...OBBBBBBBNO...',
];

/** Shorts hems, bare shins, sandals — hand-drawn per frame (7 rows). */
const LUFFY_BIG_LEGS: LegSet = {
  stand: ['...OBBNO.OBBNO..', '...OWWWO.OWWWO..', '....OSSO..OSSO..', '....OSZO..OSZO..', '....OSSO..OSSO..', '...ODDDDO.ODDDDO', '...OOOOO..OOOOO.'],
  run0: ['..OBBNO..OBBNO..', '..OWWWO..OWWWO..', '.OSSO.....OSSO..', 'OSZO......OSZO..', 'OSSO.......OSSO.', 'ODDDO......ODDDO', 'OOOO.......OOOO.'],
  run1: ['....OBBBBNO.....', '....OWWWWWO.....', '.....OSSSO......', '.....OSZSO......', '....OSSOSSO.....', '....ODDDDDDO....', '....OOOOOOOO....'],
  run2: ['...OBBNO.OBBNO..', '...OWWWO.OWWWO..', '..OSSO....OSSO..', '..OSZO....OSZO..', '.OSSO......OSSO.', '.ODDDO.....ODDDO', '.OOOO......OOOO.'],
  jump: ['..OBBNO..OBBBNO.', '.OWWWO..OWWWWO..', '.OSSO...OSSSSSO.', 'OSZO.....OOODDO.', 'OSSO.......ODDO.', 'ODDDO.......OO..', 'OOOO............'],
};

export const LUFFY: CharacterSprites = {
  ...smallFrames(LUFFY_SMALL, reach(LUFFY_SMALL, 9), legs(SMALL_LEGS, 'S', 'S', 'D')),
  ...bigFrames(LUFFY_BIG_TOP, LUFFY_BIG_TOP_JUMP, LUFFY_BIG_LEGS),
};

// ── Zoro ── G hair · E earrings · S skin · K eye, mouth & sash · W shirt · H haramaki · X / Z sword hilts · Q scabbards · P trousers · D boots
const ZORO_SMALL = [
  '....G.G.G.......',
  '...GGGGGGGG.....',
  '..GGGGGGGGGG....',
  '..GGGGGSSSSS....',
  '..GGGGSSSKSS....',
  '..GEGSSSSKSSS...',
  '...GSSSSSSSS....',
  '....SSSSKKS.....',
  '.....SSSSS......',
  '...WWWWWWWW.....',
  '..SWWWWWWWWS....',
  '..SSHHHHHHSSXX..',
  'QQ..PPPPPPP.Z...',
];

/**
 * Big Zoro, detailed style: black bandana with tails flying back. O outline · N bandana · M bandana
 * shade · Z skin shade · V shirt shade · J haramaki shade · F trousers shade · R red hilt.
 */
const ZORO_BIG_HEAD = [
  '................',
  '.....OOOOOO.....',
  '...OONNNNNNOO...',
  '..ONNNNNNNNNNO..',
  '..ONMNNNNNNNNNO.',
  '.OONMNNNNNNNNNO.',
  'ONNMNNNNNNNNNNO.',
  'ONMOONNNSSSSKSO.',
  '.OO.ONNSSSSSKSO.',
  '.....OEZSSSSSSSO',
  '.....OSZSSSSSSO.',
  '......OSSSSKKSO.',
  '.......OZSSSSO..',
];

const ZORO_BIG_TOP = [
  ...ZORO_BIG_HEAD,
  '.......OOZZOO...',
  '.....OWWWZZWO...',
  '....OWWWWZWWWO..',
  '....OVWWSSWWWO..',
  '....OVWSZWWWWO..',
  '....OVWSZWWVWO..',
  '....OHHSZHHHHOXO',
  '....OJHSSHHHHORO',
  '....OJHOSOHHHOOO',
  '..OOOPPPOPPPPO..',
  '.OQQOPPPPPPPFO..',
  '.OO.OPPPPPPPFO..',
];

const ZORO_BIG_TOP_JUMP = [
  ...ZORO_BIG_HEAD,
  '.......OOZZOOSSO',
  '.....OWWWZZOSSO.',
  '....OWWWWWWSSO..',
  '....OVWWWWWWO...',
  '....OVWWWWWWO...',
  '....OVWWWWWVO...',
  '..OSSOHHHHHHOXO.',
  '..OSSOHHHHHHORO.',
  '...OOJHHHHHHOO..',
  '..OOOPPPPPPPPO..',
  '.OQQOPPPPPPPFO..',
  '.OO.OPPPPPPPFO..',
];

/** Trousers and boots, hand-drawn per frame (7 rows). */
const ZORO_BIG_LEGS: LegSet = {
  stand: ['....OPPFO.OPPFO.', '....OPPFO.OPPFO.', '....OPPFO.OPPFO.', '....ODDDO.ODDDO.', '...ODDDDO.ODDDDO', '...ODDDDO.ODDDDO', '...OOOOO..OOOOO.'],
  run0: ['...OPPFO..OPPFO.', '..OPPFO....OPPFO', '.OPPFO.....OPPFO', '.ODDDO.....ODDDO', 'ODDDDO....ODDDDO', 'ODDDO.....ODDDDO', 'OOOO......OOOOO.'],
  run1: ['.....OPPPPFO....', '.....OPPOPFO....', '.....OPPOPFO....', '....ODDDODDO....', '...ODDDDODDDO...', '...ODDDDODDDDO..', '...OOOOOOOOOO...'],
  run2: ['....OPPFO.OPPFO.', '...OPPFO...OPPFO', '..OPPFO....OPPFO', '..ODDDO....ODDDO', '.ODDDDO...ODDDDO', '.ODDDO....ODDDDO', '.OOOO.....OOOOO.'],
  jump: ['...OPPFO..OPPPFO', '..OPPFO..OPPPPFO', '.OPPFO...ODDDDO.', '.ODDDO...ODDDDO.', 'ODDDDO....OOOO..', 'ODDDO...........', 'OOOO............'],
};

export const ZORO: CharacterSprites = {
  ...smallFrames(ZORO_SMALL, reach(ZORO_SMALL, 9), legs(SMALL_LEGS, 'P', 'D')),
  ...bigFrames(ZORO_BIG_TOP, ZORO_BIG_TOP_JUMP, ZORO_BIG_LEGS),
};

// ── Sanji ── Y hair · S skin · K eye & suit · L lapels · B shirt · W cigarette · R ember · D shoes
const SANJI_SMALL = [
  '.....YYYYY......',
  '...YYYYYYYYY....',
  '..YYYYYYYYYYY...',
  '..YYYYYYYYYYYY..',
  '..YYYSSSYYYSS...',
  '..YYSSSSSKSSSS..',
  '...YSSSSSSSSWWR.',
  '....SSSSSSSS....',
  '.....SSSSS......',
  '...KLBBBBLK.....',
  '..KKKLBKLKKK....',
  '..SKKKLKKKKS....',
  '....KKKKKKK.....',
];

const SANJI_BIG = [
  '......YYYYY.....',
  '....YYYYYYYYY...',
  '...YYYYYYYYYYY..',
  '..YYYYYYYYYYYYY.',
  '..YYYYYYYYYYYYY.',
  '..YYYYSSSSYYYY..',
  '..YYYSSSSSKYYSS.',
  '..YYSSSSSSKSSSS.',
  '...YSSSSSSSSSSSS',
  '....SSSSSSSSWWWR',
  '.....SSSSSSSS...',
  '......SSSSSS....',
  '.....KLBBBLK....',
  '....KKLBKBLKK...',
  '...KKKKLKLKKKK..',
  '..KKKKKLKLKKKKK.',
  '..KKKKKKLKKKKKK.',
  '..KKKKKKKKKKKKK.',
  '..KKKKKKKKKKKKK.',
  '..SSKKKKKKKKKSS.',
  '..SS.KKKKKKK.SS.',
  '.....KKKKKKK....',
  '....KKKKKKKKK...',
  '....KKKKKKKKK...',
  '....KKKKKKKKK...',
  '....KKKK.KKKK...',
];

export const SANJI: CharacterSprites = hero(
  SANJI_SMALL, reach(SANJI_SMALL, 9), legs(SMALL_LEGS, 'K', 'D'),
  SANJI_BIG, reach(SANJI_BIG, 12), legs(BIG_LEGS, 'K', 'D'),
);

// ── Nami ── O hair · S skin · A skin shade (near arm) · K eye · R lips · W / B striped top · J jeans · D heels
const NAMI_SMALL = [
  '.....OOOOO......',
  '...OOOOOOOOO....',
  '..OOOOOOOOOOO...',
  '..OOOOOOSSKSS...',
  '.OOOOOOSSSKSSS..',
  '.OOOO.OSSSSSS...',
  'OOOO...SSSSRS...',
  'OOO....SSSSS....',
  'OOO...SSSS......',
  'OO...SWBWBWB....',
  'O....SAWBWBS....',
  '.....SASSSSS....',
  '....JJJJJJJJ....',
];

const NAMI_BIG = [
  '......OOOOO.....',
  '....OOOOOOOOO...',
  '...OOOOOOOOOOO..',
  '..OOOOOOOOOOOOO.',
  '..OOOOOOOOSSSSO.',
  '.OOOOOOOSSSSKSS.',
  '.OOOOOOOSSSSKSS.',
  'OOOOO.OOSSSSSSSS',
  'OOOO...OSSSSSSS.',
  'OOOO...OSSSSRRS.',
  'OOOO....SSSSSS..',
  'OOO......SSSS...',
  'OOO......SSS....',
  'OOO....SSSSSS...',
  'OO....SSSSSSSS..',
  'OO....WBWBWBWB..',
  'O.....SBWBWBWBW.',
  'O.....SAWBWBWB..',
  '......SASSSSSS..',
  '......SASSSSS...',
  '.....SSASSSSS...',
  '....SSAJJJJJJJ..',
  '....SJJJJJJJJJ..',
  '....JJJJJJJJJ...',
  '....JJJJJJJJJ...',
  '....JJJJ.JJJJ...',
];

export const NAMI: CharacterSprites = hero(
  NAMI_SMALL, reach(NAMI_SMALL, 9), legs(SMALL_LEGS, 'J', 'D'),
  NAMI_BIG, reach(NAMI_BIG, 14), legs(BIG_LEGS, 'J', 'D'),
);

// ── Robin ── H hair · L hair sheen · S skin · A skin shade (near arm) · K eye · R lips · V top · J trousers · D heels
const ROBIN_SMALL = [
  '.....HHHHH......',
  '...HHHLLHHHH....',
  '..HHHLLHHHHHH...',
  '..HHHHHHHHHHH...',
  '.HHHHHHSSKSS....',
  '.HHHHHHSSKSSS...',
  '.HHHH.HSSSSS....',
  '.HHH...SSSRS....',
  '.HHH..SSSS......',
  '.HH..VVVVVV.....',
  '.HH..SAVVVS.....',
  '.H...SAVVVS.....',
  '....JJJJJJJJ....',
];

const ROBIN_BIG = [
  '......HHHHH.....',
  '....HHHLLHHHH...',
  '...HHHLLHHHHHH..',
  '..HHHLLHHHHHHHH.',
  '..HHHHHHHHHHHHH.',
  '.HHHHHHHSSSSSS..',
  '.HHHHHHHSSSKSS..',
  '.HHHHHHHSSSKSSS.',
  '.HHHH.HHSSSSSSSS',
  '.HHHH..HSSSSSSS.',
  '.HHHH..HSSSSRRS.',
  '.HHHH...SSSSSS..',
  '.HHHH....SSSS...',
  '.HHHH...SSSSSS..',
  '.HHH...VVVVVVVV.',
  '.HHH..VVVVVVVVV.',
  '.HHH..SAVVVVVVV.',
  '.HH...SAVVVVVV..',
  '.HH...SAVVVVV...',
  '.H...SSAVVVVV...',
  '.....SSAVVVVV...',
  '....SSAJJJJJJJ..',
  '....JJJJJJJJJJ..',
  '....JJJJJJJJJ...',
  '....JJJJJJJJJ...',
  '....JJJJ.JJJJ...',
];

export const ROBIN: CharacterSprites = hero(
  ROBIN_SMALL, reach(ROBIN_SMALL, 9), legs(SMALL_LEGS, 'J', 'D'),
  ROBIN_BIG, reach(ROBIN_BIG, 14), legs(BIG_LEGS, 'J', 'D'),
);

// ── Usopp ── K hair & eye · Y bandana · G goggle lenses · S skin · R lips · B overalls · D boots
const USOPP_SMALL = [
  '....KKKKK.......',
  '..KKKKKKKKK.....',
  '.KKKYYGYYYYK....',
  '.KKKKKKSSSSK....',
  '.KKKKKSSSKSS....',
  '.KKKKSSSSKSSSSSS',
  '..KKKSSSSSSSSS..',
  '...KKSSSSRS.....',
  '.....SSSS.......',
  '...BBSSSSBB.....',
  '..SBBSSSSBBS....',
  '..SSBBBBBBSS....',
  '....BBBBBBB.....',
];

const USOPP_BIG = [
  '....KKKKKK......',
  '..KKKKKKKKKK....',
  '.KKKKKKKKKKKK...',
  'KKKYYYYYYYYYK...',
  'KKKYGGYYYGGYK...',
  'KKKKKKKKSSSSK...',
  'KKKKKKKSSSKSS...',
  'KKKKKKSSSSKSS...',
  '.KKKKSSSSSSSSSSS',
  '.KKKKSSSSSSSSSSS',
  '..KKKSSSSSSSS...',
  '...KKSSSSSRRS...',
  '.....SSSSSSS....',
  '......SSSSS.....',
  '....BBSSSSBB....',
  '...SBBSSSSBBS...',
  '..SSBBSSSSBBSS..',
  '..SSBBBBBBBBSS..',
  '..SSBBBBBBBBSS..',
  '..SSBBBYYBBBSS..',
  '..SS.BBBBBBB.SS.',
  '.....BBBBBBBB...',
  '....BBBBBBBBB...',
  '....BBBBBBBBB...',
  '....BBBB.BBBB...',
  '....BBBB.BBBB...',
];

export const USOPP: CharacterSprites = hero(
  USOPP_SMALL, reach(USOPP_SMALL, 9), legs(SMALL_LEGS, 'B', 'D'),
  USOPP_BIG, reach(USOPP_BIG, 14), legs(BIG_LEGS, 'B', 'D'),
);

// ── Chopper ── P hat · W hat cross · A antlers · F fur · L face, chest & hooves · K eye & hoof tips · N nose · B shorts
const CHOPPER_SMALL = [
  '.A..PPPPP..A....',
  '.AA.PPPPP.AA....',
  '..A.PPWPP.A.....',
  '..AAPWWWPAA.....',
  '....PPWPP.......',
  '..PPPPPPPPP.....',
  '...FFFFFFFF.....',
  '...FFLLKLLL.....',
  '...FFLLLLLNN....',
  '....FFLLLLL.....',
  '...FFFFFFFF.....',
  '..LFBBBBBBFL....',
  '....BBBBBB......',
];

/** Big = Heavy Point: towering and muscular, wide branching antlers, hat perched on top. */
const CHOPPER_BIG = [
  'A..A.PPPP.A..A..',
  'AA.AAPWWPAA.AA..',
  '.AAA.PPPP..AAA..',
  '..AAAPPPPAAA....',
  '...PPPPPPPP.....',
  '...FFFFFFFF.....',
  '..FFFFFFFFFF....',
  '..FFFFFFKFFF....',
  '..FFFFFFFLLLL...',
  '..FFFFFFLLLLLN..',
  '...FFFFFLLLLL...',
  '...FFFFFFFFF....',
  '..FFFFFFFFFFFF..',
  '.FFFFFFFFFFFFFF.',
  'FFFFFLLLLLLFFFFF',
  'FFFFLLLLLLLLFFFF',
  'FFF.LLLLLLLL.FFF',
  'FFF.FLLLLLLF.FFF',
  'FFF.FFFFFFFF.FFF',
  'LLL.FFFFFFFF.LLL',
  'LL..FFFFFFFF..LL',
  '....BBBBBBBB....',
  '....BBBBBBBB....',
  '....BBBBBBBB....',
  '....BBB..BBB....',
  '....BBB..BBB....',
];

export const CHOPPER: CharacterSprites = hero(
  CHOPPER_SMALL, reach(CHOPPER_SMALL, 9, 'L'), legs(SMALL_LEGS, 'F', 'F', 'K'),
  CHOPPER_BIG, reach(CHOPPER_BIG, 12, 'L'), legs(BIG_LEGS, 'F', 'F', 'K'),
);

// ── Franky ── B hair · K sunglasses & eye · W lenses · S skin · H shirt · Y shirt print · T trunks · D sandals
const FRANKY_SMALL = [
  '..BBBBBBB.......',
  '.BBBBBBBBBBB....',
  '..BBBBBBBBBBBB..',
  '..BBBKKKKKKB....',
  '..BBSSSSSKSS....',
  '..BBSSSSSKSSS...',
  '...BSSSSSSSS....',
  '....SSSSSKK.....',
  '....SSSSSSS.....',
  '.SSHHSSSSHH.SS..',
  'SSSHHYSSSHHSSS..',
  'SSS.HHSSSHH.SSS.',
  '....TTTTTTT.....',
];

const FRANKY_BIG = [
  '...BBBBBB.......',
  '..BBBBBBBBBBB...',
  '.BBBBBBBBBBBBBB.',
  '..BBBBBBBBBBBBBB',
  '..BBBKKKKKKKB...',
  '..BBBKWKKKWKB...',
  '..BBBSSSSSSSS...',
  '..BBSSSSSSKSS...',
  '..BBSSSSSSKSSS..',
  '...BSSSSSSSSSS..',
  '...SSSSSSSKKKS..',
  '...SSSSSSSSSSS..',
  '....SSSSSSSSS...',
  '..HHHSSSSSSHHH..',
  '.HHHHSSSSSSHHHH.',
  'SHHHYSSSSSSHYHHS',
  'SSHHHSSSSSSHHHSS',
  'SSSHHSSSSSSHHSSS',
  'SSSHHHSSSSHHHSSS',
  'SSSSHHSSSSHHSSSS',
  '.SSS.HSSSSH..SSS',
  '.SS..SSSSSS...SS',
  '....TTTTTTTT....',
  '....TTTTTTTT....',
  '....SSSS.SSSS...',
  '....SSSS.SSSS...',
];

export const FRANKY: CharacterSprites = hero(
  FRANKY_SMALL, reach(FRANKY_SMALL, 8), legs(SMALL_LEGS, 'S', 'S', 'D'),
  FRANKY_BIG, reach(FRANKY_BIG, 12), legs(BIG_LEGS, 'S', 'S', 'D'),
);

// ── Brook ── K hat & suit · R hat band & cravat · A afro · W bone · E eye sockets & teeth gaps · D shoes
const BROOK_SMALL = [
  '.....KKKK.......',
  '.....KKKK.......',
  '.....RRRR.......',
  '..AAKKKKKKKA....',
  '.AAAAAAAAAAAA...',
  '.AAAAAWWWWAA....',
  'AAAAAWWWEWWA....',
  'AAAAAWWWEWWW....',
  '.AAAAWWWWWEW....',
  '..AA.WEWEWE.....',
  '...KKKWRWKK.....',
  '..WKKKKRKKKW....',
  '....KKKKKK......',
];

const BROOK_BIG = [
  '......KKKKK.....',
  '......KKKKK.....',
  '......KKKKK.....',
  '......RRRRR.....',
  '...KKKKKKKKKKK..',
  '..AAAAAAAAAAAA..',
  '.AAAAAAAAAAAAAA.',
  'AAAAAAAWWWWWAA..',
  'AAAAAAWWWWWWWA..',
  'AAAAAWWWWEEWWW..',
  'AAAAAWWWWEEWWW..',
  'AAAAAWWWWWWWWWW.',
  '.AAAAWWWWWWEWWW.',
  '..AAA.WWWWWWW...',
  '......WEWEWEW...',
  '.......WWWWW....',
  '.....KKKRRKK....',
  '....KKKKRRKKK...',
  '...KKKKKKKKKKK..',
  '...KKKKKKKKKKK..',
  '...KKKKKKKKKKK..',
  '..WKKKKKKKKKKKW.',
  '..W.KKKKKKKKK.W.',
  '....KKKKKKKKK...',
  '....KKKKKKKKK...',
  '....KKKK.KKKK...',
];

export const BROOK: CharacterSprites = hero(
  BROOK_SMALL, reach(BROOK_SMALL, 9, 'W'), legs(SMALL_LEGS, 'K', 'D'),
  BROOK_BIG, reach(BROOK_BIG, 16, 'W'), legs(BIG_LEGS, 'K', 'D'),
);

// ── Jinbe ── K hair, eye & obi · U skin · W tusks & collar · O kimono · P trousers · D sandals
const JINBE_SMALL = [
  '....KKKKKK......',
  '..KKKKKKKKKK....',
  '.KKKKKKKKKKKK...',
  'KKKKKKUUUUUK....',
  'KK.KKUUUKUUU....',
  'K..KUUUUKUUUU...',
  '...KUUUUUUUUU...',
  '...UUUUUWUWUU...',
  '....UUUUUUUU....',
  '..OOOOWWOOOOO...',
  '.UOOOOOWOOOOOU..',
  '.UUKKKKKKKKKUU..',
  '...OOOOOOOOOO...',
];

const JINBE_BIG = [
  '.....KKKKKK.....',
  '...KKKKKKKKKK...',
  '..KKKKKKKKKKKK..',
  '.KKKKKKKKKKKKKK.',
  'KKKKKKKUUUUUUK..',
  'KKK.KKUUUUUUUU..',
  'KK..KUUUUKKUUUU.',
  'KK..KUUUUUKUUUU.',
  'K...KUUUUUKUUUUU',
  '....UUUUUUUUUUUU',
  '....UUUUUWUUWUU.',
  '....UUUUUWUUWUU.',
  '.....UUUUUUUUU..',
  '...OOOOOWWOOOO..',
  '..OOOOOOWWOOOOO.',
  '.OOOOOOOOWOOOOOO',
  '.OOOOOOOOWOOOOOO',
  'UUOOOOOOOOOOOOUU',
  'UUOOOOOOOOOOOOUU',
  'UU.KKKKKKKKKK.UU',
  '...KKKKKKKKKK...',
  '...OOOOOOOOOOO..',
  '...OOOOOOOOOOO..',
  '....PPPPPPPPP...',
  '....PPPPPPPPP...',
  '....PPPP.PPPP...',
];

export const JINBE: CharacterSprites = hero(
  JINBE_SMALL, reach(JINBE_SMALL, 9, 'U'), legs(SMALL_LEGS, 'P', 'D'),
  JINBE_BIG, reach(JINBE_BIG, 13, 'U'), legs(BIG_LEGS, 'P', 'D'),
);
