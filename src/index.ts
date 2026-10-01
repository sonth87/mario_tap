/** Framework-agnostic entry. React users: `@sonth87/mario-tap/react`. Docs: docs/integration.md */
export { createMarioGame, type MarioGame, type LiveOptions } from './engine/createMarioGame';
export { localBestStorage, DEFAULT_STORAGE_KEY } from './engine/storage';
export { AUTHOR_CREDIT, DEFAULT_LABELS, type GameCredit, type GameLabels, type MarioGameOptions, type BestStorage } from './core/options';
export type { GameStats, GameEvent, GameStatus, BestRecord, Power } from './core/types';
export {
  THEMES,
  BIOME_THEMES,
  resolveTheme,
  resolveBiomeThemes,
  type GameTheme,
  type ThemeName,
  type ThemeInput,
  type TreeColors,
  type SceneryStyle,
  type Weather,
} from './core/theme';
export { BIOME_IDS, type BiomeId } from './core/biome';
export type { MusicOptions, MusicInput } from './audio/music';
export type { CharacterDef, CharacterSprites } from './core/character';
export type { Palette } from './core/types';
export { BUILTIN_CHARACTERS } from './render/characters';
export { characterPortraitUrl } from './render/portrait';
