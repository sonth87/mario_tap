import type { BiomeId } from './biome';
/**
 * Visual theme: every colour the renderer uses that is not part of a character sprite. Hosts pick
 * a preset (`theme: 'night'`) or override any field (`theme: { base: 'day', sky: '#222' }`).
 * A layer colour of `null` hides that parallax layer.
 */
export interface TreeColors {
  leaf: string;
  leafLight: string;
  trunk: string;
}

/** Shapes of the far / tree layers (colours still come from `mountains` / `trees`). */
export interface SceneryStyle {
  mountains: 'peaks' | 'snowcaps' | 'pyramids' | 'castles' | 'cloudbanks';
  trees: 'mixed' | 'pines' | 'cacti';
}

/** Particles drawn over the scenery. */
export type Weather = 'snow' | 'sand' | 'embers' | null;

export interface GameTheme {
  /** Solid colour, [top, bottom] vertical gradient, or null (transparent canvas). */
  sky: string | [string, string] | null;
  /** Far parallax layers → near. */
  mountains: string | null;
  clouds: string | null;
  hills: string | null;
  trees: TreeColors | null;
  bushes: string | null;
  /** Edge / spot colour of clouds, hills and bushes (the NES look); null draws them flat. */
  sceneryOutline: string | null;
  /** Pale band along the underside of clouds; null for none. */
  cloudShade: string | null;
  style: SceneryStyle;
  weather: Weather;
  /** Glow at the bottom of pits (castle lava); null for plain pits. */
  lava: string | null;
  pipe: { body: string; light: string; dark: string; outline: string };
  /**
   * Recolours block sprites: O = brick / ground body, H = ground top & stair highlight,
   * K = outlines, Y = ? block face, W = ? block rim.
   */
  blocks: Partial<Record<'O' | 'H' | 'K' | 'Y' | 'W', string>>;
  cloudPlatform: { fill: string; shade: string; outline: string };
  flagpole: { shaft: string; ball: string; flag: string; emblem: string };
  /** HUD colours. */
  hud: { credit: string; score: string; coin: string; best: string; bestLabel: string; distance: string; subtitle: string };
  /** HUD / prompt text. */
  text: string;
  textAccent: string;
  textOutline: string;
  /** Prompt / picker panel background. */
  panel: string;
}

export type ThemeName = 'day' | 'dusk' | 'night' | 'underground' | 'glass' | 'desert' | 'snow' | 'castle' | 'sky';

const DAY: GameTheme = {
  sky: ['#5C94FC', '#A4C8FF'],
  mountains: '#8FB8F0',
  clouds: '#FFFFFF',
  hills: '#00A800',
  trees: { leaf: '#2E8B2E', leafLight: '#58C048', trunk: '#8B5A2B' },
  bushes: '#80D010',
  sceneryOutline: '#000000',
  cloudShade: '#A4E4FC',
  style: { mountains: 'peaks', trees: 'mixed' },
  weather: null,
  lava: null,
  pipe: { body: '#00A800', light: '#80D010', dark: '#005000', outline: '#000000' },
  blocks: {},
  cloudPlatform: { fill: '#FFFFFF', shade: '#BEE0FF', outline: '#1B2A4A' },
  flagpole: { shaft: '#7ED957', ball: '#1F9D2F', flag: '#FFFFFF', emblem: '#E52521' },
  hud: { credit: '#FBBF24', score: '#FDE047', coin: '#FACC15', best: '#34D399', bestLabel: 'rgba(255,255,255,0.55)', distance: '#38BDF8', subtitle: '#34D399' },
  text: '#FFFFFF',
  textAccent: '#F8D800',
  textOutline: 'rgba(0,0,0,0.8)',
  panel: 'rgba(0,0,0,0.55)',
};

export const THEMES: Record<ThemeName, GameTheme> = {
  day: DAY,
  dusk: {
    ...DAY,
    sky: ['#3B2D6B', '#F4976C'],
    mountains: '#6B4E8C',
    clouds: '#FFD6C2',
    hills: '#8C5A7A',
    trees: { leaf: '#3F3A6B', leafLight: '#6B5E9E', trunk: '#3B2433' },
    bushes: '#54406E',
    sceneryOutline: '#1E1030',
    cloudShade: '#F4B8A8',
  },
  night: {
    ...DAY,
    sky: ['#070B24', '#1C2A5A'],
    mountains: '#1E2B55',
    clouds: 'rgba(200,210,255,0.35)',
    hills: '#16324A',
    trees: { leaf: '#0F3B2E', leafLight: '#1D5E47', trunk: '#2B1E14' },
    bushes: '#12402F',
    sceneryOutline: '#03061A',
    cloudShade: null,
    blocks: { O: '#8C3A12', H: '#B87850' },
    cloudPlatform: { fill: '#C8D0F0', shade: '#7F8BC0', outline: '#0B1030' },
  },
  underground: {
    ...DAY,
    sky: '#000000',
    mountains: null,
    clouds: null,
    hills: '#101830',
    trees: null,
    bushes: '#0A2A30',
    sceneryOutline: null,
    cloudShade: null,
    blocks: { O: '#1070A0', H: '#60B0D0', K: '#001828' },
    pipe: { body: '#00A8A8', light: '#80E8E8', dark: '#005050', outline: '#000000' },
  },
  /** Transparent sky with soft translucent layers — for glassy / blurred host backgrounds. */
  glass: {
    ...DAY,
    sky: null,
    mountains: 'rgba(120,160,230,0.18)',
    clouds: 'rgba(255,255,255,0.85)',
    hills: 'rgba(0,168,0,0.28)',
    trees: { leaf: 'rgba(30,130,50,0.45)', leafLight: 'rgba(90,190,80,0.45)', trunk: 'rgba(110,70,30,0.5)' },
    bushes: 'rgba(40,160,50,0.4)',
    sceneryOutline: 'rgba(10,50,30,0.45)',
    cloudShade: 'rgba(190,225,255,0.6)',
  },
  /** Biome: sand, pyramids and cacti under a hot sky; drifting sand. */
  desert: {
    ...DAY,
    sky: ['#F0A848', '#FCE4A8'],
    mountains: '#D89850',
    clouds: '#FFF4DC',
    hills: '#E8C070',
    trees: { leaf: '#3C9A3C', leafLight: '#78C858', trunk: '#3C9A3C' },
    bushes: '#B89048',
    sceneryOutline: '#6A4420',
    cloudShade: '#F8D8A0',
    style: { mountains: 'pyramids', trees: 'cacti' },
    weather: 'sand',
    blocks: { O: '#D8A040', H: '#FCE0A0', K: '#5A3410' },
    pipe: { body: '#C87830', light: '#F0B060', dark: '#6A3810', outline: '#2A1404' },
    cloudPlatform: { fill: '#FFF4DC', shade: '#F0D0A0', outline: '#6A4420' },
  },
  /** Biome: snowy peaks and pines, falling snow; the ground is ice. */
  snow: {
    ...DAY,
    sky: ['#7898C8', '#D8E8F8'],
    mountains: '#9CB4D8',
    clouds: '#FFFFFF',
    hills: '#E8F0FA',
    trees: { leaf: '#2E6A58', leafLight: '#F4FAFF', trunk: '#5A3A24' },
    bushes: '#D0E0F0',
    sceneryOutline: '#3A5878',
    cloudShade: '#C8DCF0',
    style: { mountains: 'snowcaps', trees: 'pines' },
    weather: 'snow',
    blocks: { O: '#6C98C0', H: '#E8F4FF', K: '#1C3550' },
    pipe: { body: '#3890B0', light: '#90D8F0', dark: '#184860', outline: '#0C2030' },
    flagpole: { shaft: '#D8E8F8', ball: '#3890B0', flag: '#FFFFFF', emblem: '#3890B0' },
  },
  /** Biome: dark castle skyline over glowing lava pits; embers rise. */
  castle: {
    ...DAY,
    sky: ['#120814', '#4A1418'],
    mountains: '#2A1A2E',
    clouds: null,
    hills: null,
    trees: null,
    bushes: null,
    sceneryOutline: null,
    cloudShade: null,
    style: { mountains: 'castles', trees: 'mixed' },
    weather: 'embers',
    lava: '#F85818',
    blocks: { O: '#8C8C94', H: '#D0D0D8', K: '#202028' },
    pipe: { body: '#707078', light: '#B8B8C0', dark: '#38383E', outline: '#101014' },
    cloudPlatform: { fill: '#9898A8', shade: '#585868', outline: '#18181E' },
    flagpole: { shaft: '#B8B8C0', ball: '#F8B800', flag: '#E52521', emblem: '#F8B800' },
  },
  /** Biome: above the clouds — cloud banks far below the horizon, golden blocks. */
  sky: {
    ...DAY,
    sky: ['#3C8CF0', '#C8E8FF'],
    mountains: '#E4F2FF',
    clouds: '#FFFFFF',
    hills: null,
    trees: null,
    bushes: '#FFFFFF',
    sceneryOutline: '#7FB0E0',
    cloudShade: '#CDE6FA',
    style: { mountains: 'cloudbanks', trees: 'mixed' },
    weather: null,
    blocks: { O: '#E8A838', H: '#FFE8A0', K: '#6A4010' },
    pipe: { body: '#E8A838', light: '#FFE8A0', dark: '#9A6418', outline: '#3A2008' },
    cloudPlatform: { fill: '#FFFFFF', shade: '#CDE6FA', outline: '#5A8CC8' },
    flagpole: { shaft: '#58B848', ball: '#2E8B2E', flag: '#FFFFFF', emblem: '#E52521' },
  },
};

/** `theme` option: a preset name, or overrides on top of `base` (default 'day'). */
export type ThemeInput = ThemeName | (Partial<Omit<GameTheme, 'style'>> & { base?: ThemeName; style?: Partial<SceneryStyle> });

export function resolveTheme(input: ThemeInput | undefined): GameTheme {
  if (!input) return THEMES.day;
  if (typeof input === 'string') return THEMES[input] ?? THEMES.day;
  const { base = 'day', ...overrides } = input;
  const from = THEMES[base] ?? THEMES.day;
  return { ...from, ...overrides, blocks: { ...from.blocks, ...overrides.blocks }, style: { ...from.style, ...overrides.style } };
}

/** Preset each biome starts from (grass uses the host's `theme`). */
export const BIOME_THEMES: Record<BiomeId, ThemeName> = { grass: 'day', desert: 'desert', snow: 'snow', castle: 'castle', sky: 'sky' };

/**
 * One theme per biome. Grass = the host's `theme`; the other biomes use their preset, or the host's
 * `biomeThemes[biome]` (preset name or overrides — `base` defaults to that biome's preset). A host
 * that made the sky transparent (`sky: null` / `background: null`) or set a `background` colour
 * keeps that sky in every biome, so an embedded game never suddenly paints over its page.
 */
export function resolveBiomeThemes(
  theme: ThemeInput | undefined,
  background: string | null | undefined,
  perBiome: Partial<Record<BiomeId, ThemeInput>> = {},
): Record<BiomeId, GameTheme> {
  const grass = resolveTheme(theme);
  const skyOverride = background !== undefined ? background : grass.sky === null ? null : undefined;
  const one = (biome: BiomeId): GameTheme => {
    const input = perBiome[biome];
    let t: GameTheme;
    if (biome === 'grass' && !input) t = grass;
    else if (typeof input === 'string') t = resolveTheme(input);
    else t = resolveTheme({ base: biome === 'grass' ? undefined : BIOME_THEMES[biome], ...input });
    return skyOverride === undefined ? t : { ...t, sky: skyOverride };
  };
  return { grass: one('grass'), desert: one('desert'), snow: one('snow'), castle: one('castle'), sky: one('sky') };
}
