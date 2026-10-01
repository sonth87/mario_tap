import { Music } from '../audio/music';
import { Sfx } from '../audio/sfx';
import { FRAME_MS, GAME_OVER_LOCK_FRAMES, MAX_STEPS_PER_FRAME, VIEW_HEIGHT } from '../core/constants';
import { AUTHOR_CREDIT, DEFAULT_LABELS, type GameCredit, type MarioGameOptions } from '../core/options';
import { randomSeed } from '../core/rng';
import type { BestRecord, GameStats } from '../core/types';
import { createState, distanceOf, scoreOf, type GameState } from '../game/state';
import { step } from '../game/step';
import { BUILTIN_CHARACTERS } from '../render/characters';
import { render, type RenderOptions } from '../render/renderer';
import { creditRect, inside, portraitRect, soundRect } from '../render/uiLayout';
import { rulesOf, themesOf, type MarioGame, type ThemeOptions } from './api';
import { CharacterPicker } from './characterPicker';
import { prefersReducedMotion, Shake } from './feedback';
import { attachInput, type PressPoint } from './input';
import { EMPTY_BEST, localBestStorage } from './storage';
import { clientToWorld, computeViewport, type Viewport } from './viewport';

export type { LiveOptions, MarioGame } from './api';

function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('mario-tap: 2D canvas not supported');
  return ctx;
}

function hitsCredit(credit: GameCredit | null, p: { x: number; y: number }): boolean {
  return !!credit?.url && inside(creditRect(credit.text), p.x, p.y);
}

/**
 * Mounts the game into `host` (a canvas is appended and sized to fill it) and starts the loop.
 * Framework-agnostic; the React wrapper lives in `@sonth87/mario-tap/react`.
 */
export function createMarioGame(host: HTMLElement, options: MarioGameOptions = {}): MarioGame {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%;object-fit:contain;image-rendering:pixelated;touch-action:manipulation;';
  host.appendChild(canvas);
  const ctx = context2d(canvas);
  if (options.keyboardTarget === 'element' && host.tabIndex < 0) host.tabIndex = 0;

  const storage = options.storage === undefined ? localBestStorage(options.storageKey) : options.storage;
  const sfx = new Sfx(options.muted ?? false);
  const music = new Music(options.music);
  const setMuted = (muted: boolean, notify: boolean): void => {
    if (sfx.muted === muted) return;
    sfx.muted = muted;
    if (notify) options.onMutedChange?.(muted);
  };
  const picker = new CharacterPicker(options.characters?.length ? options.characters : BUILTIN_CHARACTERS, options.character, storage);
  let themeInput: ThemeOptions = { theme: options.theme, background: options.background, biomeThemes: options.biomeThemes };
  let rules = rulesOf(options);
  const reducedMotion = options.reducedMotion ?? prefersReducedMotion();
  const shake = new Shake(!reducedMotion);
  const renderOpts: RenderOptions = {
    showHud: options.showHud ?? true,
    showPrompts: options.showPrompts ?? true,
    scenery: options.scenery ?? true,
    characterButton: options.characterButton ?? true,
    soundButton: options.soundButton ?? true,
    pauseButton: options.pauseButton ?? true,
    credit: options.credit === undefined ? AUTHOR_CREDIT : options.credit,
    themes: themesOf(themeInput),
    labels: { ...DEFAULT_LABELS, ...options.labels },
    reducedMotion,
  };

  let best: BestRecord = storage?.load() ?? EMPTY_BEST;
  let newRecord = false;
  let viewport: Viewport = computeViewport(host.clientWidth, host.clientHeight, devicePixelRatio) ?? { viewWidth: 400, scale: 2 };
  let seed = options.seed ?? randomSeed();
  let state: GameState = createState(seed, viewport.viewWidth, rules);
  let pendingPress = false;
  /** Host pause (API / `paused` prop) and tab-hidden pause: silent, nothing drawn. */
  let userPaused = false;
  let hiddenPaused = false;
  /** Player pause (button / Esc / P): the pause card is shown, any press resumes. */
  let gamePaused = false;
  let lastStatsKey = '';
  let raf = 0;
  let last = performance.now();
  let acc = 0;

  const canChange = (): boolean => state.status === 'idle' || state.status === 'over';

  const stats = (): GameStats => ({
    status: state.status, score: scoreOf(state), distance: distanceOf(state), coins: state.coins, kills: state.kills,
    bonus: state.bonus, flags: state.flags, biome: state.biome, speedLevel: state.speedLevel, power: state.mario.power,
    character: picker.current.id, canChangeCharacter: canChange(), best, newRecord, paused: gamePaused,
  });

  function emitStats(): void {
    const s = stats();
    const key = `${s.status}|${s.score}|${s.distance}|${s.coins}|${s.power}|${s.best.score}|${s.newRecord}|${s.character}|${s.biome}|${s.speedLevel}|${s.paused}`;
    if (key === lastStatsKey) return;
    lastStatsKey = key;
    options.onStats?.(s);
  }

  function newRun(): void {
    seed = randomSeed();
    state = createState(seed, viewport.viewWidth, rules);
    newRecord = false;
    gamePaused = false;
    music.rewind();
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
      // Back to the title screen (fresh level, board up); the next press starts the run.
      newRun();
    } else {
      step(state, pressed);
    }
    if (!canChange()) picker.open = false;
    shake.step();
    for (const ev of state.events) {
      if (ev === 'gameOver') finishRun();
      sfx.play(ev);
      shake.hit(ev);
      options.onEvent?.(ev, stats());
    }
    emitStats();
  }

  const musicOn = (): boolean => state.status === 'playing' && !gamePaused && !sfx.muted;

  function frame(now: number): void {
    raf = requestAnimationFrame(frame);
    if (userPaused || hiddenPaused) {
      music.sync(false, state.biome);
      last = now;
      return;
    }
    if (gamePaused) {
      acc = 0;
    } else {
      acc += Math.min(now - last, 250);
    }
    last = now;
    let steps = 0;
    while (acc >= FRAME_MS && steps < MAX_STEPS_PER_FRAME) {
      tick();
      acc -= FRAME_MS;
      steps += 1;
    }
    if (steps === MAX_STEPS_PER_FRAME) acc = 0;
    music.sync(musicOn(), state.biome);
    const ui = {
      characters: picker.list, character: picker.current, pickerOpen: picker.open, canChangeCharacter: canChange(),
      muted: sfx.muted, paused: gamePaused, frame: state.frame,
    };
    render(ctx, state, stats(), renderOpts, ui, viewport.scale, shake.offset());
  }

  function resize(): void {
    const next = computeViewport(host.clientWidth, host.clientHeight, devicePixelRatio);
    if (!next) return;
    viewport = next;
    canvas.width = Math.round(next.viewWidth * next.scale);
    canvas.height = VIEW_HEIGHT * next.scale;
    // Before the first press the level can be rebuilt so Mario keeps his screen anchor.
    if (state.status === 'idle') state = createState(seed, next.viewWidth, rules);
    else state.viewWidth = next.viewWidth;
  }

  function setGamePaused(paused: boolean): void {
    if (paused && state.status !== 'playing') return;
    if (gamePaused === paused) return;
    gamePaused = paused;
    emitStats();
  }

  /** Buttons and the picker get first go at every press; whatever they do not consume is the jump input. */
  function onPress(point: PressPoint): void {
    if (userPaused || hiddenPaused) return;
    const world = point ? clientToWorld(canvas.getBoundingClientRect(), viewport.viewWidth, point.clientX, point.clientY) : null;
    if (world && !picker.open && renderOpts.soundButton && inside(soundRect(viewport.viewWidth), world.x, world.y)) {
      setMuted(!sfx.muted, true);
      if (!sfx.muted) sfx.unlock();
      return;
    }
    if (gamePaused) {
      setGamePaused(false);
      music.sync(musicOn(), state.biome);
      return;
    }
    const portrait = world ? inside(portraitRect(viewport.viewWidth, renderOpts.soundButton), world.x, world.y) : false;
    if (portrait && renderOpts.pauseButton && state.status === 'playing') {
      setGamePaused(true);
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
    // This press starts a run: start the music inside the gesture (mobile autoplay rules).
    if (state.status === 'idle') music.sync(!sfx.muted, state.biome);
  }

  const onVisibility = (): void => {
    if (options.autoPauseOnHidden === false) return;
    hiddenPaused = document.visibilityState === 'hidden';
  };

  const detachInput = attachInput(host, options.keyboardTarget ?? 'window', {
    press: onPress,
    togglePause: () => {
      if (userPaused || hiddenPaused || picker.open) return;
      setGamePaused(!gamePaused);
      if (!gamePaused) music.sync(musicOn(), state.biome);
    },
    gesture: () => sfx.unlock(),
  });
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  document.addEventListener('visibilitychange', onVisibility);
  resize();
  emitStats();
  raf = requestAnimationFrame(frame);

  return {
    press: () => onPress(null),
    pause: () => void (userPaused = true),
    resume: () => void (userPaused = false),
    restart: newRun,
    setMuted: (muted) => setMuted(muted, false),
    update(next) {
      if (next.muted !== undefined) setMuted(next.muted, false);
      if (next.soundButton !== undefined) renderOpts.soundButton = next.soundButton;
      if (next.pauseButton !== undefined) renderOpts.pauseButton = next.pauseButton;
      if (next.showHud !== undefined) renderOpts.showHud = next.showHud;
      if (next.showPrompts !== undefined) renderOpts.showPrompts = next.showPrompts;
      if (next.scenery !== undefined) renderOpts.scenery = next.scenery;
      if (next.characterButton !== undefined) renderOpts.characterButton = next.characterButton;
      if (next.credit !== undefined) renderOpts.credit = next.credit;
      if (next.labels) renderOpts.labels = { ...renderOpts.labels, ...next.labels };
      if (next.music !== undefined) music.set(next.music);
      if (next.reducedMotion !== undefined) {
        renderOpts.reducedMotion = next.reducedMotion;
        shake.enabled = !next.reducedMotion;
      }
      if (next.biomes !== undefined || next.speedUp !== undefined) {
        rules = rulesOf({ biomes: next.biomes ?? rules.biomes?.slice(), speedUp: next.speedUp ?? rules.speedUp });
      }
      // `undefined` = unchanged (React passes every prop); re-resolve only on a real change so the
      // sprite atlas keeps its cached recoloured blocks.
      if (next.theme !== undefined || next.background !== undefined || next.biomeThemes !== undefined) {
        const input: ThemeOptions = {
          theme: next.theme ?? themeInput.theme,
          background: next.background !== undefined ? next.background : themeInput.background,
          biomeThemes: next.biomeThemes ?? themeInput.biomeThemes,
        };
        if (JSON.stringify(input) !== JSON.stringify(themeInput)) {
          themeInput = input;
          renderOpts.themes = themesOf(themeInput);
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
      music.destroy();
      canvas.remove();
    },
  };
}
