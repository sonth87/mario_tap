import type { CharacterDef, CharacterSprites } from '../core/character';
import type { Palette } from '../core/types';
import { BIG_JUMP, BIG_RUN, BIG_STAND } from './sprites/marioBig';
import { SMALL_DEAD, SMALL_JUMP, SMALL_RUN, SMALL_STAND } from './sprites/marioSmall';
import { BLONDIE } from './sprites/blondie';
import { LINK, TOAD } from './sprites/heroes';
import { PALETTES } from './sprites/palettes';
import {
  PRINCESS_BIG_JUMP,
  PRINCESS_BIG_RUN,
  PRINCESS_BIG_STAND,
  PRINCESS_SMALL_JUMP,
  PRINCESS_SMALL_RUN,
  PRINCESS_SMALL_STAND,
} from './sprites/princess';

const PLUMBER: CharacterSprites = {
  smallStand: SMALL_STAND, smallRun: SMALL_RUN, smallJump: SMALL_JUMP, smallDead: SMALL_DEAD,
  bigStand: BIG_STAND, bigRun: BIG_RUN, bigJump: BIG_JUMP,
};

const PRINCESS: CharacterSprites = {
  smallStand: PRINCESS_SMALL_STAND, smallRun: PRINCESS_SMALL_RUN, smallJump: PRINCESS_SMALL_JUMP,
  bigStand: PRINCESS_BIG_STAND, bigRun: PRINCESS_BIG_RUN, bigJump: PRINCESS_BIG_JUMP,
};

const luigi: Palette = { ...PALETTES.base, R: '#2FA84F', B: '#23329E', D: '#5A3A1A' };

const peach: Palette = {
  C: '#F8D800', R: '#E52521', Y: '#F8C840', S: '#FCD8A8', K: '#000000',
  P: '#F890C0', Q: '#D0508C', W: '#FFFFFF', B: '#3C8CF0', D: '#C84C0C',
};

const zelda: Palette = {
  ...peach, R: '#3C8CF0', Y: '#C8903C', P: '#F2EEFA', Q: '#8C78C8', W: '#F8D800', B: '#E52521', D: '#6B4226',
};

const wario: Palette = { ...PALETTES.base, R: '#F8D800', B: '#7B2D8E', D: '#3B2A10', Y: '#F8F8F8' };
const waluigi: Palette = { ...PALETTES.base, R: '#7B2D8E', B: '#1B1B3A', D: '#E07818' };

const daisy: Palette = { ...peach, Y: '#C86820', P: '#F8A838', Q: '#C86810', W: '#F8E858', R: '#3CB043', B: '#3CB043' };
const rosalina: Palette = { ...peach, Y: '#F8ECB0', C: '#D8D8F0', P: '#8CE0F8', Q: '#3C8CC8', W: '#FFFFFF', R: '#E52521' };

const toad: Palette = { W: '#FFFFFF', R: '#E52521', S: '#FCD8A8', K: '#000000', B: '#0058F8', Y: '#F8D800', D: '#8B4A1A' };
const link: Palette = { G: '#3CB043', L: '#1E6B2A', Y: '#F8D048', S: '#FCD8A8', K: '#000000', D: '#8B5A2B', W: '#E8E0C8' };

const blondie: Palette = { Y: '#F8D848', S: '#FCD8A8', K: '#000000', R: '#D0508C', P: '#FF7EB8', D: '#FFFFFF' };

/** Recolours the dress for fire power / star cycle. */
const dress = (base: Palette, P: string, Q: string, W = base.W): Palette => ({ ...base, P, Q, W });

/** Built-in roster. The first entry is the default character. */
export const BUILTIN_CHARACTERS: CharacterDef[] = [
  {
    id: 'mario', name: 'Mario', sprites: PLUMBER, palette: PALETTES.base, firePalette: PALETTES.fire,
    starPalettes: [PALETTES.star1, PALETTES.star2, PALETTES.star3],
  },
  {
    id: 'luigi', name: 'Luigi', sprites: PLUMBER, palette: luigi,
    firePalette: { ...luigi, R: '#F8F8F8', B: '#2FA84F' },
    starPalettes: [PALETTES.star1, PALETTES.star2, { ...luigi, R: '#F8F8F8', B: '#2FA84F' }],
  },
  {
    id: 'peach', name: 'Peach', sprites: PRINCESS, palette: peach,
    firePalette: dress(peach, '#FFFFFF', '#E52521', '#E52521'),
    starPalettes: [dress(peach, '#58D854', '#00A800'), dress(peach, '#F8D800', '#C84C0C'), dress(peach, '#68A8FC', '#0058F8')],
  },
  {
    id: 'zelda', name: 'Zelda', sprites: PRINCESS, palette: zelda,
    firePalette: dress(zelda, '#FFFFFF', '#E52521', '#E52521'),
    starPalettes: [dress(zelda, '#58D854', '#00A800'), dress(zelda, '#F8D800', '#C84C0C'), dress(zelda, '#F890C0', '#D0508C')],
  },
  {
    id: 'daisy', name: 'Daisy', sprites: PRINCESS, palette: daisy,
    firePalette: dress(daisy, '#FFFFFF', '#E52521', '#E52521'),
    starPalettes: [dress(daisy, '#58D854', '#00A800'), dress(daisy, '#F890C0', '#D0508C'), dress(daisy, '#68A8FC', '#0058F8')],
  },
  {
    id: 'rosalina', name: 'Rosalina', sprites: PRINCESS, palette: rosalina,
    firePalette: dress(rosalina, '#FFFFFF', '#E52521', '#E52521'),
    starPalettes: [dress(rosalina, '#58D854', '#00A800'), dress(rosalina, '#F8D800', '#C84C0C'), dress(rosalina, '#F890C0', '#D0508C')],
  },
  {
    id: 'toad', name: 'Toad', sprites: TOAD, palette: toad,
    firePalette: { ...toad, B: '#E52521', R: '#0058F8' },
    starPalettes: [{ ...toad, B: '#00A800', R: '#F8D800' }, { ...toad, B: '#F8D800', R: '#00A800' }, { ...toad, B: '#000000', R: '#C84C0C' }],
  },
  {
    id: 'link', name: 'Link', sprites: LINK, palette: link,
    // Red Mail / Blue Mail colours from the original Zelda games.
    firePalette: { ...link, G: '#E52521', L: '#8C1010' },
    starPalettes: [{ ...link, G: '#3C8CF0', L: '#1B3C8C' }, { ...link, G: '#E52521', L: '#8C1010' }, { ...link, G: '#F8D800', L: '#C88C00' }],
  },
  {
    id: 'blondie', name: 'Blondie', sprites: BLONDIE, palette: blondie,
    firePalette: { ...blondie, P: '#FFFFFF', R: '#E52521' },
    starPalettes: [{ ...blondie, P: '#58D854', R: '#00A800' }, { ...blondie, P: '#F8D800', R: '#C88C00' }, { ...blondie, P: '#68A8FC', R: '#0058F8' }],
  },
  {
    id: 'wario', name: 'Wario', sprites: PLUMBER, palette: wario,
    firePalette: { ...wario, R: '#F8F8F8', B: '#E52521' },
    starPalettes: [PALETTES.star1, PALETTES.star2, PALETTES.star3],
  },
  {
    id: 'waluigi', name: 'Waluigi', sprites: PLUMBER, palette: waluigi,
    firePalette: { ...waluigi, R: '#F8F8F8', B: '#7B2D8E' },
    starPalettes: [PALETTES.star1, PALETTES.star2, PALETTES.star3],
  },
];

export function findCharacter(list: CharacterDef[], id: string | null | undefined): CharacterDef {
  return list.find((c) => c.id === id) ?? list[0] ?? BUILTIN_CHARACTERS[0];
}
