import type { CharacterDef } from './character';
import type { ThemeInput } from './theme';
import type { BestRecord, GameEvent, GameStats } from './types';

/** Every string the canvas draws — hosts translate them (the package has no i18n of its own). */
export interface GameLabels {
  start: string;
  gameOver: string;
  restart: string;
  score: string;
  best: string;
  newRecord: string;
  /** Distance unit suffix. */
  metres: string;
  /** Character picker title. */
  chooseCharacter: string;
  /** Small line under the coin counter (centre of the HUD); empty hides it. */
  title: string;
  /** Name on the title board shown before each run (slides away on start); empty shows a plain prompt instead. */
  logo: string;
  mute: string;
  unmute: string;
}

export const DEFAULT_LABELS: GameLabels = {
  start: 'CLICK / SPACE TO START',
  gameOver: 'GAME OVER',
  restart: 'CLICK / SPACE TO PLAY AGAIN',
  score: 'SCORE',
  best: 'BEST',
  newRecord: 'NEW RECORD!',
  metres: 'm',
  chooseCharacter: 'CHOOSE CHARACTER',
  title: '',
  logo: 'SKYLINE',
  mute: 'Mute sound',
  unmute: 'Unmute sound',
};

/** Author credit drawn bottom-left; clickable (opens `url` in a new tab) only between runs. */
export interface GameCredit {
  text: string;
  url?: string;
}

export const AUTHOR_CREDIT: GameCredit = { text: 'SONTH87', url: 'https://github.com/sonth87' };

/** Where the best record is kept. Default: localStorage under `storageKey`. */
export interface BestStorage {
  load(): BestRecord | null;
  save(record: BestRecord): void;
  /** Optional: remember the selected character id. */
  loadCharacter?(): string | null;
  saveCharacter?(id: string): void;
}

export interface MarioGameOptions {
  /** Level seed of the first run (later runs pick a fresh random seed). */
  seed?: number;
  /** localStorage key for the best record. Default 'mario-runner:best'. */
  storageKey?: string;
  /** Custom persistence; `null` disables saving the best record. */
  storage?: BestStorage | null;
  muted?: boolean;
  /** Canvas HUD (score / coins / best). Turn off when the host draws its own from `onStats`. */
  showHud?: boolean;
  /** "Click to start" / "Game over" overlays. */
  showPrompts?: boolean;
  /** Parallax background layers (mountains, clouds, hills, trees, bushes). Default true. */
  scenery?: boolean;
  /**
   * Colours: a preset ('day' default, 'dusk', 'night', 'underground', 'glass') or overrides on top
   * of one, e.g. `{ base: 'night', sky: ['#000', '#123'], trees: null }`. See core/theme.ts.
   */
  theme?: ThemeInput;
  /** Shortcut for `theme.sky` (colour, or `null` = transparent). Wins over the theme when set. */
  background?: string | null;
  /** Playable roster (default: `BUILTIN_CHARACTERS`, Mario first). The first is the default pick. */
  characters?: CharacterDef[];
  /** Initial character id (a stored choice wins when `storage` remembers one). */
  character?: string;
  /** In-canvas speaker button next to the portrait (top-right). Turn off when the host has its own. Default true. */
  soundButton?: boolean;
  /** Fires when the in-canvas speaker button toggles the sound. */
  onMutedChange?: (muted: boolean) => void;
  /** In-canvas character portrait (top-right) that opens the picker before a run. Default true. */
  characterButton?: boolean;
  /** Credit link, top-left above the score. Default: SONTH87 → GitHub; `null` hides it (e.g. the host shows its own). */
  credit?: GameCredit | null;
  labels?: Partial<GameLabels>;
  /** 'window' (default) listens for Space everywhere while the game is mounted; 'element' only when focused. */
  keyboardTarget?: 'window' | 'element';
  /** Pause while the page is hidden. Default true. */
  autoPauseOnHidden?: boolean;
  /** Fires whenever a displayed number or the status changes. */
  onStats?: (stats: GameStats) => void;
  onEvent?: (event: GameEvent, stats: GameStats) => void;
  onGameOver?: (stats: GameStats) => void;
}
