import type { GameEvent } from '../core/types';

/** Screen-shake strength (world px) per event; the strongest recent one wins, then it decays. */
const KICK: Partial<Record<GameEvent, number>> = { break: 2.5, powerDown: 4, die: 5, kick: 1.2, cannon: 0.8, flag: 1.5 };
const DECAY = 0.82;

/** Screen shake, renderer-side only (the simulation never moves). */
export class Shake {
  private amp = 0;

  constructor(public enabled: boolean) {}

  hit(event: GameEvent): void {
    if (this.enabled) this.amp = Math.max(this.amp, KICK[event] ?? 0);
  }

  /** Per simulation step. */
  step(): void {
    this.amp = this.amp < 0.3 ? 0 : this.amp * DECAY;
  }

  offset(): { x: number; y: number } {
    if (!this.amp) return { x: 0, y: 0 };
    return { x: (Math.random() * 2 - 1) * this.amp, y: (Math.random() * 2 - 1) * this.amp * 0.6 };
  }
}

/** The user's OS-level "reduce motion" preference (false where unavailable). */
export function prefersReducedMotion(): boolean {
  try {
    return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  } catch {
    return false;
  }
}
