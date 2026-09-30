import type { CharacterDef, CharacterSprites } from '../core/character';
import type { Palette } from '../core/types';
import { BIG_JUMP, BIG_RUN, BIG_STAND } from './sprites/marioBig';
import { SMALL_DEAD, SMALL_JUMP, SMALL_RUN, SMALL_STAND } from './sprites/marioSmall';
import { BLONDIE } from './sprites/blondie';
import { BROOK, CHOPPER, FRANKY, JINBE, LUFFY, NAMI, ROBIN, SANJI, USOPP, ZORO } from './sprites/strawHats';
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

/** Plumber keys: C cap · T shirt · R overalls · D hair & moustache · N shoes · S skin · Y buttons. */
interface PlumberColors {
  cap: string;
  shirt: string;
  overalls: string;
  hair: string;
  shoes: string;
  skin?: string;
  buttons?: string;
}
const plumber = (c: PlumberColors): Palette => ({
  C: c.cap, T: c.shirt, R: c.overalls, D: c.hair, N: c.shoes, S: c.skin ?? '#FCB068', Y: c.buttons ?? '#F8D800',
});

/** NES palette: red cap & overalls, olive shirt / hair / shoes. */
const RED = '#D82800';
const OLIVE = '#887000';
const WHITE = '#F8F8F8';
const mario = plumber({ cap: RED, shirt: OLIVE, overalls: RED, hair: OLIVE, shoes: OLIVE });
/** Star-power flashes, as in the original: green / black / fire colour sets. */
const plumberStars = [
  plumber({ cap: '#00A800', shirt: '#C84C0C', overalls: '#00A800', hair: '#C84C0C', shoes: '#C84C0C' }),
  plumber({ cap: '#000000', shirt: '#C84C0C', overalls: '#000000', hair: '#C84C0C', shoes: '#C84C0C', skin: '#F8B878' }),
  plumber({ cap: WHITE, shirt: RED, overalls: WHITE, hair: RED, shoes: RED }),
];

const luigi = plumber({ cap: '#2FA84F', shirt: '#2FA84F', overalls: '#23329E', hair: '#5A3A1A', shoes: '#6B3A10' });

const peach: Palette = {
  C: '#F8D800', R: '#E52521', Y: '#F8C840', S: '#FCD8A8', K: '#000000',
  P: '#F890C0', Q: '#D0508C', W: '#FFFFFF', B: '#3C8CF0', D: '#C84C0C',
};

const zelda: Palette = {
  ...peach, R: '#3C8CF0', Y: '#C8903C', P: '#F2EEFA', Q: '#8C78C8', W: '#F8D800', B: '#E52521', D: '#6B4226',
};

const daisy: Palette = { ...peach, Y: '#C86820', P: '#F8A838', Q: '#C86810', W: '#F8E858', R: '#3CB043', B: '#3CB043' };
const rosalina: Palette = { ...peach, Y: '#F8ECB0', C: '#D8D8F0', P: '#8CE0F8', Q: '#3C8CC8', W: '#FFFFFF', R: '#E52521' };

const luffy: Palette = { Y: '#F8D060', R: '#D82800', K: '#101010', M: '#901010', T: '#F8F8F8', S: '#FCB068', B: '#2858B8', W: '#6890E0', Q: '#F8D800', D: '#A06830' };
const zoro: Palette = {
  G: '#48B048', E: '#F8D800', S: '#F0A868', K: '#101010', W: '#F8F8F8', H: '#207830', X: '#F8F8F8', Z: '#D82800', Q: '#382010', P: '#303038', D: '#101010',
};
const sanji: Palette = { Y: '#F8E070', S: '#FCC8A0', K: '#20202C', L: '#4A4A60', B: '#3C8CF0', W: '#F8F8F8', R: '#F85818', D: '#3A2412' };
const robin: Palette = { H: '#23232F', L: '#4C4C6C', S: '#F4C090', A: '#DCA070', K: '#101010', R: '#C03050', V: '#6A3090', J: '#2A2A3A', D: '#6A3090' };
const usopp: Palette = { K: '#101010', Y: '#F8D800', G: '#60C8F8', S: '#D89058', R: '#A04030', B: '#8A5A2A', D: '#4A2A10' };
const chopper: Palette = { P: '#F878A8', W: '#F8F8F8', A: '#D8A868', F: '#8A4A20', L: '#E8B888', K: '#101010', N: '#3060D0', B: '#6858C8' };
const franky: Palette = { B: '#40C8F8', K: '#101010', W: '#6878A0', S: '#F4B888', H: '#E83838', Y: '#F8D800', T: '#2848A0', D: '#8A5A2A' };
const brook: Palette = { K: '#2A2A38', R: '#D82800', A: '#0C0C0C', W: '#F0F0E0', E: '#101010', D: '#101010' };
const jinbe: Palette = { K: '#101010', U: '#5A8CD8', W: '#F8F8F8', O: '#E07828', P: '#2A2A40', D: '#8A5A2A' };
const nami: Palette = { O: '#F87818', S: '#FCC8A0', A: '#E8A878', K: '#101010', R: '#E04060', W: '#F8F8F8', B: '#3C8CF0', J: '#2848A0', D: '#C84C0C' };

const blondie: Palette = { Y: '#F8D848', H: '#D8A020', S: '#FCD8A8', A: '#E8B080', K: '#000000', R: '#D0508C', P: '#FF7EB8', D: '#FFFFFF' };

/** Recolours the dress for fire power / star cycle. */
const dress = (base: Palette, P: string, Q: string, W = base.W): Palette => ({ ...base, P, Q, W });

/** Built-in roster. The first entry is the default character. */
export const BUILTIN_CHARACTERS: CharacterDef[] = [
  {
    id: 'mario', name: 'Mario', sprites: PLUMBER, palette: mario,
    // Fire Mario: white cap & overalls, red shirt.
    firePalette: plumberStars[2],
    starPalettes: plumberStars,
  },
  {
    id: 'luigi', name: 'Luigi', sprites: PLUMBER, palette: luigi,
    firePalette: { ...luigi, C: WHITE, T: WHITE, R: '#2FA84F' },
    starPalettes: [plumberStars[0], plumberStars[1], { ...luigi, C: WHITE, T: WHITE, R: '#2FA84F' }],
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
    id: 'luffy', name: 'Luffy', sprites: LUFFY, palette: luffy,
    firePalette: { ...luffy, R: WHITE, B: '#D82800', W: '#F87858' },
    starPalettes: [{ ...luffy, R: '#00A800', B: '#F8D800' }, { ...luffy, R: '#F8D800', B: '#00A800' }, { ...luffy, R: '#000000', B: '#C84C0C' }],
  },
  {
    id: 'zoro', name: 'Zoro', sprites: ZORO, palette: zoro,
    firePalette: { ...zoro, W: '#D82800', H: '#F8F8F8' },
    starPalettes: [{ ...zoro, W: '#58D854', H: '#F8D800' }, { ...zoro, W: '#F8D800', H: '#C84C0C' }, { ...zoro, W: '#68A8FC', H: '#0058F8' }],
  },
  {
    id: 'sanji', name: 'Sanji', sprites: SANJI, palette: sanji,
    firePalette: { ...sanji, K: '#F8F8F8', L: '#D82800', B: '#D82800' },
    starPalettes: [{ ...sanji, K: '#00A800', L: '#58D854' }, { ...sanji, K: '#C84C0C', L: '#F8D800' }, { ...sanji, K: '#0058F8', L: '#68A8FC' }],
  },
  {
    id: 'nami', name: 'Nami', sprites: NAMI, palette: nami,
    firePalette: { ...nami, B: '#D82800', J: '#F8F8F8' },
    starPalettes: [{ ...nami, B: '#00A800', J: '#58D854' }, { ...nami, B: '#F8D800', J: '#C84C0C' }, { ...nami, B: '#F890C0', J: '#D0508C' }],
  },
  {
    id: 'robin', name: 'Robin', sprites: ROBIN, palette: robin,
    firePalette: { ...robin, V: '#F8F8F8', J: '#D82800', D: '#D82800' },
    starPalettes: [{ ...robin, V: '#00A800', J: '#58D854' }, { ...robin, V: '#F8D800', J: '#C84C0C' }, { ...robin, V: '#68A8FC', J: '#0058F8' }],
  },
  {
    id: 'usopp', name: 'Usopp', sprites: USOPP, palette: usopp,
    firePalette: { ...usopp, B: '#F8F8F8', Y: '#D82800' },
    starPalettes: [{ ...usopp, B: '#00A800', Y: '#58D854' }, { ...usopp, B: '#F8D800', Y: '#C84C0C' }, { ...usopp, B: '#0058F8', Y: '#68A8FC' }],
  },
  {
    id: 'chopper', name: 'Chopper', sprites: CHOPPER, palette: chopper,
    firePalette: { ...chopper, P: '#F8F8F8', W: '#D82800', B: '#D82800' },
    starPalettes: [{ ...chopper, P: '#58D854', B: '#00A800' }, { ...chopper, P: '#F8D800', B: '#C84C0C' }, { ...chopper, P: '#68A8FC', B: '#0058F8' }],
  },
  {
    id: 'franky', name: 'Franky', sprites: FRANKY, palette: franky,
    firePalette: { ...franky, H: '#F8F8F8', T: '#D82800' },
    starPalettes: [{ ...franky, H: '#00A800', T: '#58D854' }, { ...franky, H: '#F8D800', T: '#C84C0C' }, { ...franky, H: '#0058F8', T: '#68A8FC' }],
  },
  {
    id: 'brook', name: 'Brook', sprites: BROOK, palette: brook,
    firePalette: { ...brook, K: '#F8F8F8', R: '#D82800' },
    starPalettes: [{ ...brook, K: '#00A800', R: '#F8D800' }, { ...brook, K: '#C84C0C', R: '#F8D800' }, { ...brook, K: '#0058F8', R: '#F8F8F8' }],
  },
  {
    id: 'jinbe', name: 'Jinbe', sprites: JINBE, palette: jinbe,
    firePalette: { ...jinbe, O: '#F8F8F8', P: '#D82800' },
    starPalettes: [{ ...jinbe, O: '#00A800', P: '#58D854' }, { ...jinbe, O: '#F8D800', P: '#C84C0C' }, { ...jinbe, O: '#F890C0', P: '#D0508C' }],
  },
  {
    id: 'blondie', name: 'Blondie', sprites: BLONDIE, palette: blondie,
    firePalette: { ...blondie, P: '#FFFFFF', R: '#E52521' },
    starPalettes: [{ ...blondie, P: '#58D854', R: '#00A800' }, { ...blondie, P: '#F8D800', R: '#C88C00' }, { ...blondie, P: '#68A8FC', R: '#0058F8' }],
  },
];

export function findCharacter(list: CharacterDef[], id: string | null | undefined): CharacterDef {
  return list.find((c) => c.id === id) ?? list[0] ?? BUILTIN_CHARACTERS[0];
}
