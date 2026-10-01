import { BIOME_IDS, isBiomeId, type BiomeId } from '../core/biome';
import type { CharacterDef } from '../core/character';
import type { MarioGameOptions } from '../core/options';
import { resolveBiomeThemes, type GameTheme } from '../core/theme';
import type { GameStats } from '../core/types';
import type { RunRules } from '../game/state';

/** Options that may change while the game runs (`biomes` / `speedUp` apply from the next run). */
export type LiveOptions = Pick<
  MarioGameOptions,
  | 'muted'
  | 'showHud'
  | 'showPrompts'
  | 'scenery'
  | 'theme'
  | 'background'
  | 'biomeThemes'
  | 'labels'
  | 'characterButton'
  | 'soundButton'
  | 'pauseButton'
  | 'credit'
  | 'music'
  | 'reducedMotion'
  | 'biomes'
  | 'speedUp'
>;

export interface MarioGame {
  /** Same as a click / Space press. */
  press(): void;
  /** Host pause (silent: no pause card, presses are ignored until `resume()`). */
  pause(): void;
  resume(): void;
  /** Throws the current run away and shows the start screen with a new level. */
  restart(): void;
  update(options: LiveOptions): void;
  /** Mutes / unmutes (same as the in-canvas speaker button). */
  setMuted(muted: boolean): void;
  /** Opens the in-canvas character picker (no-op while a run is in progress). */
  openCharacterPicker(): void;
  /** Selects a character (only before a run / on game over). Returns false when not allowed or unknown. */
  setCharacter(id: string): boolean;
  getCharacters(): CharacterDef[];
  getStats(): GameStats;
  destroy(): void;
}

export type ThemeOptions = Pick<MarioGameOptions, 'theme' | 'background' | 'biomeThemes'>;

export function themesOf(o: ThemeOptions): Record<BiomeId, GameTheme> {
  return resolveBiomeThemes(o.theme, o.background, o.biomeThemes);
}

export function rulesOf(o: Pick<MarioGameOptions, 'biomes' | 'speedUp'>): RunRules {
  const list = Array.isArray(o.biomes) ? o.biomes.filter(isBiomeId) : [];
  const biomes: readonly BiomeId[] = o.biomes === false ? ['grass'] : list.length ? list : BIOME_IDS;
  return { biomes, speedUp: o.speedUp ?? true };
}

