function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
}

function isSpace(e: KeyboardEvent): boolean {
  return e.code === 'Space' || e.key === ' ';
}

/** Pointer position in client (CSS) pixels; `null` for the keyboard. */
export type PressPoint = { clientX: number; clientY: number } | null;

/**
 * The game's only input: left/right mouse button, touch/pen, or Space. Space is swallowed
 * (default + propagation) on both keydown and keyup so a focused button behind the game is not
 * "clicked" and host shortcuts do not fire. Returns a detach function.
 */
export function attachInput(host: HTMLElement, keyboard: 'window' | 'element', onPress: (point: PressPoint) => void): () => void {
  const onPointerDown = (e: PointerEvent): void => {
    if (e.pointerType === 'mouse' && e.button !== 0 && e.button !== 2) return;
    e.preventDefault();
    host.focus({ preventScroll: true });
    onPress({ clientX: e.clientX, clientY: e.clientY });
  };
  const onContextMenu = (e: MouseEvent): void => e.preventDefault();
  const onKey = (e: KeyboardEvent): void => {
    if (!isSpace(e)) return;
    if (keyboard === 'window' && isEditable(e.target) && !host.contains(e.target as Node)) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'keydown' && !e.repeat) onPress(null);
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
