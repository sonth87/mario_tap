function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
}

function isSpace(e: KeyboardEvent): boolean {
  return e.code === 'Space' || e.key === ' ';
}

/** Extra jump keys (Space is handled on its own, with stronger swallowing). */
const JUMP_KEYS = new Set(['ArrowUp', 'KeyW', 'Enter', 'NumpadEnter']);
const PAUSE_KEYS = new Set(['Escape', 'KeyP']);

/** Pointer position in client (CSS) pixels; `null` for the keyboard. */
export type PressPoint = { clientX: number; clientY: number } | null;

export interface InputHandlers {
  /** The jump / confirm press. */
  press(point: PressPoint): void;
  /** Esc / P. */
  togglePause(): void;
  /** Runs inside every user gesture first (audio unlock). */
  gesture(): void;
}

/**
 * The game's input: left/right mouse button, touch/pen, Space, ↑ / W / Enter (jump) and Esc / P
 * (pause). Space is swallowed (default + propagation) on keydown and keyup so a focused button
 * behind the game is not "clicked" and host shortcuts do not fire. The other keys are only taken
 * when focus is on the game or on nothing in particular (page body), so they never steal Enter /
 * Escape from the host's own buttons and dialogs. Returns a detach function.
 */
export function attachInput(host: HTMLElement, keyboard: 'window' | 'element', on: InputHandlers): () => void {
  const onPointerDown = (e: PointerEvent): void => {
    if (e.pointerType === 'mouse' && e.button !== 0 && e.button !== 2) return;
    e.preventDefault();
    host.focus({ preventScroll: true });
    on.gesture();
    on.press({ clientX: e.clientX, clientY: e.clientY });
  };
  const onContextMenu = (e: MouseEvent): void => e.preventDefault();
  const ours = (target: EventTarget | null): boolean =>
    target instanceof Node && (host.contains(target) || target === document.body || target === document.documentElement || target === document);
  const onKey = (e: KeyboardEvent): void => {
    if (isSpace(e)) {
      if (keyboard === 'window' && isEditable(e.target) && !host.contains(e.target as Node)) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'keydown' && !e.repeat) {
        on.gesture();
        on.press(null);
      }
      return;
    }
    const jump = JUMP_KEYS.has(e.code);
    const pause = PAUSE_KEYS.has(e.code);
    if ((!jump && !pause) || e.altKey || e.ctrlKey || e.metaKey || !ours(e.target)) return;
    e.preventDefault();
    if (e.type !== 'keydown' || e.repeat) return;
    on.gesture();
    if (jump) on.press(null);
    else on.togglePause();
  };

  const keyTarget: HTMLElement | Window = keyboard === 'window' ? window : host;
  host.addEventListener('pointerdown', onPointerDown);
  host.addEventListener('contextmenu', onContextMenu);
  keyTarget.addEventListener('keydown', onKey as EventListener, true);
  keyTarget.addEventListener('keyup', onKey as EventListener, true);
  return () => {
    host.removeEventListener('pointerdown', onPointerDown);
    host.removeEventListener('contextmenu', onContextMenu);
    keyTarget.removeEventListener('keydown', onKey as EventListener, true);
    keyTarget.removeEventListener('keyup', onKey as EventListener, true);
  };
}
