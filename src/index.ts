/** Framework-agnostic entry. React users: `@sonth87/mario-runner/react`. Docs: mario/docs/integration.md */
export { createMarioGame, type MarioGame, type LiveOptions } from './engine/createMarioGame';
export { localBestStorage, DEFAULT_STORAGE_KEY } from './engine/storage';
export { AUTHOR_CREDIT, DEFAULT_LABELS, type GameCredit, type GameLabels, type MarioGameOptions, type BestStorage } from './core/options';
export type { GameStats, GameEvent, GameStatus, BestRecord, Power } from './core/types';
export { THEMES, resolveTheme, type GameTheme, type ThemeName, type ThemeInput, type TreeColors } from './core/theme';
export type { CharacterDef, CharacterSprites } from './core/character';
export type { Palette } from './core/types';
export { BUILTIN_CHARACTERS } from './render/characters';
export { characterPortraitUrl } from './render/portrait';
