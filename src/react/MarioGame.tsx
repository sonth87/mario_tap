import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react';
import type { MarioGameOptions } from '../core/options';
import { createMarioGame, type MarioGame as GameHandle } from '../engine/createMarioGame';

export interface MarioGameProps extends MarioGameOptions {
  className?: string;
  style?: CSSProperties;
  /** Controlled pause (e.g. while a parent dialog animates or is hidden). */
  paused?: boolean;
  /** Accessible name of the game area. */
  ariaLabel?: string;
  /** Receives the imperative handle (press / pause / restart / getStats). */
  onReady?: (game: GameHandle) => void;
}

/**
 * React wrapper around `createMarioGame`. The game is created once per mount; create-time
 * options (seed, storage, storageKey, keyboardTarget, autoPauseOnHidden, characters, character) are
 * read on mount only; the rest (muted, labels, theme / background / biomeThemes, HUD / prompts /
 * scenery, buttons, music, reducedMotion, callbacks) update live; biomes / speedUp from the next run.
 */
export function MarioGame(props: MarioGameProps) {
  const {
    className, style, paused = false, ariaLabel = 'Mario runner game',
    muted, showHud, showPrompts, scenery, theme, background, labels, characterButton, soundButton, credit,
    biomeThemes, pauseButton, music, reducedMotion, biomes, speedUp,
  } = props;
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameHandle | null>(null);
  const latest = useRef(props);

  useLayoutEffect(() => {
    latest.current = props;
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const initial = latest.current;
    const game = createMarioGame(host, {
      ...initial,
      onStats: (s) => latest.current.onStats?.(s),
      onEvent: (e, s) => latest.current.onEvent?.(e, s),
      onGameOver: (s) => latest.current.onGameOver?.(s),
      onMutedChange: (m) => latest.current.onMutedChange?.(m),
    });
    gameRef.current = game;
    initial.onReady?.(game);
    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  // Object props are compared by value (JSON) so inline literals do not re-run the update every render.
  const objectKey = JSON.stringify([credit, biomeThemes, music, biomes]);
  useEffect(() => {
    gameRef.current?.update({
      muted, showHud, showPrompts, scenery, theme, background, labels, characterButton, soundButton, credit,
      biomeThemes, pauseButton, music, reducedMotion, biomes, speedUp,
    });
  }, [muted, showHud, showPrompts, scenery, theme, background, labels, characterButton, soundButton, pauseButton, reducedMotion, speedUp, objectKey]);

  useEffect(() => {
    if (paused) gameRef.current?.pause();
    else gameRef.current?.resume();
  }, [paused]);

  return (
    <div
      ref={hostRef}
      role="application"
      aria-label={ariaLabel}
      className={className}
      style={{ overflow: 'hidden', userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'manipulation', outline: 'none', ...style }}
    />
  );
}
