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

export interface GameTheme {
  /** Solid colour, [top, bottom] vertical gradient, or null (transparent canvas). */
  sky: string | [string, string] | null;
  /** Far parallax layers → near. */
  mountains: string | null;
  clouds: string | null;
  hills: string | null;
  trees: TreeColors | null;
  bushes: string | null;
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

export type ThemeName = 'day' | 'dusk' | 'night' | 'underground' | 'glass';

const DAY: GameTheme = {
  sky: ['#5C94FC', '#A4C8FF'],
  mountains: '#8FB8F0',
  clouds: '#FFFFFF',
  hills: '#5DB847',
  trees: { leaf: '#2E8B2E', leafLight: '#58C048', trunk: '#8B5A2B' },
  bushes: '#3AA535',
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
  },
  night: {
    ...DAY,
    sky: ['#070B24', '#1C2A5A'],
    mountains: '#1E2B55',
    clouds: 'rgba(200,210,255,0.35)',
    hills: '#16324A',
    trees: { leaf: '#0F3B2E', leafLight: '#1D5E47', trunk: '#2B1E14' },
    bushes: '#12402F',
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
  },
};

/** `theme` option: a preset name, or overrides on top of `base` (default 'day'). */
export type ThemeInput = ThemeName | (Partial<GameTheme> & { base?: ThemeName });

export function resolveTheme(input: ThemeInput | undefined): GameTheme {
  if (!input) return THEMES.day;
  if (typeof input === 'string') return THEMES[input] ?? THEMES.day;
  const { base = 'day', ...overrides } = input;
  const from = THEMES[base] ?? THEMES.day;
  return { ...from, ...overrides, blocks: { ...from.blocks, ...overrides.blocks } };
}
