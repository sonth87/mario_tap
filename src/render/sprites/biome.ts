import type { Palette } from '../../core/types';

/** Biome sprites: Spiny, piranha plant, ice ground. Base palette letters (sprites/palettes.ts) unless noted. */

/** Spiny, 16×16, facing left (walk = mirror flip, like the goomba). */
export const SPINY = [
  '.....W....W.....',
  '....WRW..WRW....',
  '..W.RRRRRRRR.W..',
  '.WRRRRWRRWRRRRW.',
  '..RRRRRRRRRRRRR.',
  '.WRRRRRRRRRRRRRW',
  '.RRRRRRRRRRRRRRR',
  'WRRRRRRRRRRRRRRW',
  '.RRRRRRRRRRRRRR.',
  '.SSSRRRRRRRRRRR.',
  'SKSSSRRRRRRRRR..',
  'SSSSSSSSSSSSS...',
  '.SSSSSSSSSSSS...',
  '..SS.SS..SS.SS..',
  '.YYY.YYY.YYY.YYY',
  '................',
];

const PIRANHA_STEM = [
  '......GGGG......',
  '.......GG.......',
  '.LL....GG....LL.',
  'LLLL...GG...LLLL',
  '.LLLL..GG..LLLL.',
  '..LLLLLGGLLLLL..',
  '....LLLGGLLL....',
  '.......GG.......',
  '.......GG.......',
  '.......GG.......',
  '.......GG.......',
  '.......GG.......',
  '.......GG.......',
];

/** Piranha plant, 16×24 (head on top): mouth open / shut. */
export const PIRANHA = [
  [
    '.RR..........RR.',
    'RRWR........RWRR',
    'RRRRW......WRRRR',
    'RWRRRW....WRRRWR',
    'RRRRRRW..WRRRRRR',
    '.RRWRRRWWRRRWRR.',
    '.RRRRRRRRRRRRRR.',
    '..RRRWRRRRWRRR..',
    '...RRRRRRRRRR...',
    '.....RRRRRR.....',
    '................',
    ...PIRANHA_STEM,
  ],
  [
    '......RRRR......',
    '....RRWRRWRR....',
    '...RRRRWWRRRR...',
    '..RWRRRWWRRRWR..',
    '..RRRRRWWRRRRR..',
    '.RRRWRRWWRRWRRR.',
    '.RRRRRRWWRRRRRR.',
    '..RRRWRRRRWRRR..',
    '...RRRRRRRRRR...',
    '.....RRRRRR.....',
    '................',
    ...PIRANHA_STEM,
  ],
];

/** Ice ground surface, 16×16 — own palette (W snow, C ice, A ice shade, K outline). */
export const ICE = [
  'WWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWW',
  'CWWWCCWWWWCWWWCC',
  'ACCCCCCCWCCCCCCA',
  'ACWWCCCCCCCCWCCA',
  'ACWCCCCCCCCCCCCA',
  'ACCCCCCCCCCCCCCA',
  'KAAAAAAKKAAAAAAK',
  'CCCCCCCACCCCCCCC',
  'CWCCCCCACWWCCCCC',
  'CCCCCCCACWCCCCCC',
  'CCCCCCCACCCCCCCC',
  'CCCCCCCACCCCCCCC',
  'AAAAAAAKAAAAAAAA',
  'CCCACCCCCCCACCCC',
  'AAAKAAAAAAAKAAAA',
];

export const ICE_PALETTE: Palette = { W: '#F4FAFF', C: '#A8D8F0', A: '#6CA8D0', K: '#2C5878' };

/** Cloud floor of the sky biome, 16×16 — own palette (W cloud, B shade, O outline); puffy top, flat body. */
export const CLOUD_FLOOR = [
  '..OOOO....OOOO..',
  '.OWWWWO..OWWWWO.',
  'OWWWWWWOOWWWWWWO',
  'WWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWW',
  'WWWWWWWWBWWWWWWW',
  'WWWWWWWBBBWWWWWW',
  'WWBWWWWWWWWWWBWW',
  'WWWWWWWWWWWWWWWW',
  'BWWWWWWWWWWWWWWB',
  'BBWWWWWBBWWWWWBB',
  'WBBBBBBWWBBBBBBW',
];

/** Cloud below the surface (or inside a cloud wall). */
export const CLOUD_DEEP = [
  'WWWWWWWWWWWWWWWW',
  'WWWWBWWWWWWWWWWW',
  'WWWBBBWWWWWWBWWW',
  'WWWWWWWWWWWBBBWW',
  'WWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWW',
  'WBWWWWWWWBWWWWWW',
  'BBBWWWWWBBBWWWWW',
  'WWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWW',
  'WWWWWWBWWWWWWWBW',
  'WWWWWBBBWWWWWBBB',
  'WWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWW',
  'WBWWWWWWWWBWWWWW',
  'BBBWWWWWWBBBWWWW',
];

export const CLOUD_PALETTE: Palette = { W: '#FFFFFF', B: '#CDE6FA', O: '#7FB0E0' };

/** Vine (base palette G / L): a stem with leaves on alternate sides. */
export const VINE = [
  '.......GL.......',
  '.......GL.......',
  '....LL.GL.......',
  '...LLLLGL.......',
  '....LLLGL.......',
  '.......GL.......',
  '.......GL.......',
  '.......GL.......',
  '.......GL.......',
  '.......GL.......',
  '.......GLLL.....',
  '.......GLLLL....',
  '.......GLLL.....',
  '.......GL.......',
  '.......GL.......',
  '.......GL.......',
];

/** Spike cloud: a grey storm cloud, 16×13 — own palette (W cloud, B shade, K face, X spikes); dark so it stands out on the white floor. Cannot be stomped. */
export const SPIKE_CLOUD = [
  '..X....X....X...',
  '..XX..XXX..XX...',
  '..XWXXWWWXXWX...',
  '.XWWWWWWWWWWWX..',
  'XXWWKKWWWKKWWXX.',
  '.XWWWKWWWKWWWX..',
  'XXWWWWWWWWWWWXX.',
  '.XWWWWKKKWWWWX..',
  'XXWWWKWWWKWWWXX.',
  '.XBWWWWWWWWWBX..',
  '..XBBWWWWWBBX...',
  '...XBBBBBBBX....',
  '..XX.XX.XX.XX...',
  '..X..X...X..X...',
]

export const SPIKE_CLOUD_PALETTE: Palette = { W: '#C4CCDC', B: '#7C8AA4', K: '#1C2030', X: '#323A4C' };

/** Bird, 16×10, facing left — wings up / down (own palette). */
export const BIRD = [
  [
    '......LL........',
    '.....LLLL.......',
    '..BBBBLLLL......',
    '.BWKBBBBBB......',
    'YBWWBBBBBBBBB...',
    'YYBWWWWBBBBBBB..',
    '..BBWWWWWBBB.BB.',
    '...BBBBBBBB...B.',
    '................',
    '................',
  ],
  [
    '................',
    '................',
    '..BBBBB.........',
    '.BWKBBBBBB......',
    'YBWWBBBBBBBBB...',
    'YYBWWWWBBBBBBB..',
    '..BBWWLLLLBB.BB.',
    '...BBBLLLLB...B.',
    '......LLL.......',
    '.......L........',
  ],
];

export const BIRD_PALETTE: Palette = { B: '#3060C0', W: '#FFFFFF', K: '#000000', Y: '#F8B800', L: '#80A8F0' };
