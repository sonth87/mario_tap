import { Sfx } from '../audio/sfx';
import type { CharacterDef } from '../core/character';
import { FRAME_MS, GAME_OVER_LOCK_FRAMES, MAX_STEPS_PER_FRAME, VIEW_HEIGHT } from '../core/constants';
import { AUTHOR_CREDIT, DEFAULT_LABELS, type GameCredit, type MarioGameOptions } from '../core/options';
import { randomSeed } from '../core/rng';
import { resolveTheme, type GameTheme } from '../core/theme';
import type { BestRecord, GameStats } from '../core/types';
import { createState, distanceOf, scoreOf, type GameState } from '../game/state';
import { step } from '../game/step';
import { BUILTIN_CHARACTERS } from '../render/characters';
import { render, type RenderOptions } from '../render/renderer';
import { creditRect, inside, soundRect } from '../render/uiLayout';
import { CharacterPicker } from './characterPicker';
import { attachInput, type PressPoint } from './input';
import { EMPTY_BEST, localBestStorage } from './storage';
import { clientToWorld, computeViewport, type Viewport } from './viewport';

/** Options that may change while the game runs. */
export type LiveOptions = Pick<
  MarioGameOptions,
  'muted' | 'showHud' | 'showPrompts' | 'scenery' | 'theme' | 'background' | 'labels' | 'characterButton' | 'soundButton' | 'credit'
>;

export interface MarioGame {
  /** Same as a click / Space press. */
  press(): void;
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

function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('mario-runner: 2D canvas not supported');
  return ctx;
}

function hitsCredit(credit: GameCredit | null, p: { x: number; y: number }): boolean {
  return !!credit?.url && inside(creditRect(credit.text), p.x, p.y);
}

function themeOf(o: Pick<MarioGameOptions, 'theme' | 'background'>): GameTheme {
  const theme = resolveTheme(o.theme);
  return o.background === undefined ? theme : { ...theme, sky: o.background };
}

/**
 * Mounts the game into `host` (a canvas is appended and sized to fill it) and starts the loop.
 * Framework-agnostic; the React wrapper lives in `@sonth87/mario-runner/react`.
 */
export function createMarioGame(host: HTMLElement, options: MarioGameOptions = {}): MarioGame {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%;object-fit:contain;image-rendering:pixelated;touch-action:manipulation;';
  host.appendChild(canvas);
  const ctx = context2d(canvas);
  if (options.keyboardTarget === 'element' && host.tabIndex < 0) host.tabIndex = 0;

  const storage = options.storage === undefined ? localBestStorage(options.storageKey) : options.storage;
  const sfx = new Sfx(options.muted ?? false);
  const setMuted = (muted: boolean, notify: boolean): void => {
    if (sfx.muted === muted) return;
    sfx.muted = muted;
    if (notify) options.onMutedChange?.(muted);
  };
  const picker = new CharacterPicker(options.characters?.length ? options.characters : BUILTIN_CHARACTERS, options.character, storage);
  let themeInput: Pick<MarioGameOptions, 'theme' | 'background'> = { theme: options.theme, background: options.background };
  const renderOpts: RenderOptions = {
    showHud: options.showHud ?? true,
    showPrompts: options.showPrompts ?? true,
    scenery: options.scenery ?? true,
    characterButton: options.characterButton ?? true,
    soundButton: options.soundButton ?? true,
    credit: options.credit === undefined ? AUTHOR_CREDIT : options.credit,
    theme: themeOf(themeInput),
    labels: { ...DEFAULT_LABELS, ...options.labels },
  };

  let best: BestRecord = storage?.load() ?? EMPTY_BEST;
  let newRecord = false;
  let viewport: Viewport = computeViewport(host.clientWidth, host.clientHeight, devicePixelRatio) ?? { viewWidth: 400, scale: 2 };
  let seed = options.seed ?? randomSeed();
  let state: GameState = createState(seed, viewport.viewWidth);
  let pendingPress = false;
  let userPaused = false;
  let hiddenPaused = false;
  let lastStatsKey = '';
  let raf = 0;
  let last = performance.now();
  let acc = 0;

  const canChange = (): boolean => state.status === 'idle' || state.status === 'over';

  const stats = (): GameStats => ({
    status: state.status, score: scoreOf(state), distance: distanceOf(state), coins: state.coins, kills: state.kills,
    bonus: state.bonus, power: state.mario.power, character: picker.current.id, canChangeCharacter: canChange(), best, newRecord,
  });

  function emitStats(): void {
    const s = stats();
    const key = `${s.status}|${s.score}|${s.distance}|${s.coins}|${s.power}|${s.best.score}|${s.newRecord}|${s.character}`;
    if (key === lastStatsKey) return;
    lastStatsKey = key;
    options.onStats?.(s);
  }

  function newRun(status: 'idle' | 'playing'): void {
    seed = randomSeed();
    state = createState(seed, viewport.viewWidth);
    state.status = status;
    newRecord = false;
  }

  function finishRun(): void {
    const score = scoreOf(state);
    if (score > best.score) {
      best = { score, distance: distanceOf(state), coins: state.coins };
      newRecord = true;
      storage?.save(best);
    }
    options.onGameOver?.(stats());
  }

  function tick(): void {
    const pressed = pendingPress;
    pendingPress = false;
    if (state.status === 'over' && pressed && state.statusTimer > GAME_OVER_LOCK_FRAMES) {
      newRun('playing');
      state.events = ['start'];
    } else {
      step(state, pressed);
    }
    if (!canChange()) picker.open = false;
    for (const ev of state.events) {
      if (ev === 'gameOver') finishRun();
      sfx.play(ev);
      options.onEvent?.(ev, stats());
    }
    emitStats();
  }

  function frame(now: number): void {
    raf = requestAnimationFrame(frame);
    if (userPaused || hiddenPaused) {
      last = now;
      return;
    }
    acc += Math.min(now - last, 250);
    last = now;
    let steps = 0;
    while (acc >= FRAME_MS && steps < MAX_STEPS_PER_FRAME) {
      tick();
      acc -= FRAME_MS;
      steps += 1;
    }
    if (steps === MAX_STEPS_PER_FRAME) acc = 0;
    const ui = { characters: picker.list, character: picker.current, pickerOpen: picker.open, canChangeCharacter: canChange(), muted: sfx.muted, frame: state.frame };
    render(ctx, state, stats(), renderOpts, ui, viewport.scale);
  }

  function resize(): void {
    const next = computeViewport(host.clientWidth, host.clientHeight, devicePixelRatio);
    if (!next) return;
    viewport = next;
    canvas.width = Math.round(next.viewWidth * next.scale);
    canvas.height = VIEW_HEIGHT * next.scale;
    // Before the first press the level can be rebuilt so Mario keeps his screen anchor.
    if (state.status === 'idle') state = createState(seed, next.viewWidth);
    else state.viewWidth = next.viewWidth;
  }

  /** Picker UI gets first go at every press; whatever it does not consume is the jump input. */
  function onPress(point: PressPoint): void {
    if (userPaused || hiddenPaused) return;
    const world = point ? clientToWorld(canvas.getBoundingClientRect(), viewport.viewWidth, point.clientX, point.clientY) : null;
    if (world && !picker.open && renderOpts.soundButton && inside(soundRect(viewport.viewWidth), world.x, world.y)) {
      setMuted(!sfx.muted, true);
      return;
    }
    if (world && !picker.open && canChange() && hitsCredit(renderOpts.credit, world)) {
      if (renderOpts.credit?.url) window.open(renderOpts.credit.url, '_blank', 'noopener,noreferrer');
      return;
    }
    const before = picker.current.id;
    if (picker.handlePress(world, viewport.viewWidth, canChange(), renderOpts.characterButton, renderOpts.soundButton)) {
      if (picker.current.id !== before) emitStats();
      return;
    }
    pendingPress = true;
  }

  const onVisibility = (): void => {
    if (options.autoPauseOnHidden === false) return;
    hiddenPaused = document.visibilityState === 'hidden';
  };

  const detachInput = attachInput(host, options.keyboardTarget ?? 'window', onPress);
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  document.addEventListener('visibilitychange', onVisibility);
  resize();
  emitStats();
  raf = requestAnimationFrame(frame);

  return {
    press: () => onPress(null),
    pause: () => {
      userPaused = true;
    },
    resume: () => {
      userPaused = false;
    },
    restart: () => newRun('idle'),
    setMuted: (muted) => setMuted(muted, false),
    update(next) {
      if (next.muted !== undefined) setMuted(next.muted, false);
      if (next.soundButton !== undefined) renderOpts.soundButton = next.soundButton;
      if (next.showHud !== undefined) renderOpts.showHud = next.showHud;
      if (next.showPrompts !== undefined) renderOpts.showPrompts = next.showPrompts;
      if (next.scenery !== undefined) renderOpts.scenery = next.scenery;
      if (next.characterButton !== undefined) renderOpts.characterButton = next.characterButton;
      if (next.credit !== undefined) renderOpts.credit = next.credit;
      if (next.labels) renderOpts.labels = { ...renderOpts.labels, ...next.labels };
      // `undefined` = unchanged (React passes every prop); re-resolve only on a real change so the
      // sprite atlas keeps its cached recoloured blocks.
      if (next.theme !== undefined || next.background !== undefined) {
        const input = {
          theme: next.theme ?? themeInput.theme,
          background: next.background !== undefined ? next.background : themeInput.background,
        };
        if (JSON.stringify(input) !== JSON.stringify(themeInput)) {
          themeInput = input;
          renderOpts.theme = themeOf(themeInput);
        }
      }
    },
    openCharacterPicker: () => {
      if (canChange()) picker.open = true;
    },
    setCharacter(id) {
      if (!canChange() || !picker.select(id)) return false;
      emitStats();
      return true;
    },
    getCharacters: () => picker.list,
    getStats: stats,
    destroy() {
      cancelAnimationFrame(raf);
      detachInput();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      sfx.close();
      canvas.remove();
    },
  };
}
