import type { BiomeId } from '../core/biome';

/**
 * Optional background music, OFF unless the host passes `music` (user decision: the package ships
 * no music; integrating apps bring their own tracks). One looping <audio> per track URL.
 * - `src`: one URL for the whole run, or a URL per biome (missing biomes fall back to `default`).
 * - plays only while a run is on and nothing is paused / muted; restarts from the top each run.
 */
export interface MusicOptions {
  src: string | (Partial<Record<BiomeId, string>> & { default?: string });
  /** 0..1, default 0.5. */
  volume?: number;
}

export type MusicInput = string | MusicOptions | null | undefined;

export class Music {
  private tracks = new Map<string, HTMLAudioElement>();
  private current: HTMLAudioElement | null = null;
  private opts: MusicOptions | null = null;

  constructor(input: MusicInput) {
    this.set(input);
  }

  set(input: MusicInput): void {
    const next = typeof input === 'string' ? { src: input } : input ?? null;
    if (JSON.stringify(next) === JSON.stringify(this.opts)) return;
    this.stop();
    this.tracks.clear();
    this.opts = next;
  }

  private urlFor(biome: BiomeId): string | null {
    const src = this.opts?.src;
    if (!src) return null;
    if (typeof src === 'string') return src;
    return src[biome] ?? src.default ?? null;
  }

  private track(url: string): HTMLAudioElement | null {
    if (typeof Audio === 'undefined') return null;
    let el = this.tracks.get(url);
    if (!el) {
      el = new Audio(url);
      el.loop = true;
      el.preload = 'auto';
      this.tracks.set(url, el);
    }
    el.volume = Math.max(0, Math.min(1, this.opts?.volume ?? 0.5));
    return el;
  }

  /**
   * Brings playback in line with the game: `playing` = a run is on and not paused / muted. Called
   * every frame (cheap when nothing changes) and from the press handler so the first `play()`
   * happens inside a user gesture, as mobile browsers require.
   */
  sync(playing: boolean, biome: BiomeId): void {
    const url = playing ? this.urlFor(biome) : null;
    const el = url ? this.track(url) : null;
    if (el !== this.current) {
      this.current?.pause();
      this.current = el;
    }
    if (el && el.paused) void el.play().catch(() => undefined);
  }

  /** New run: next play starts every track from the beginning. */
  rewind(): void {
    for (const el of this.tracks.values()) {
      el.pause();
      el.currentTime = 0;
    }
    this.current = null;
  }

  stop(): void {
    this.current?.pause();
    this.current = null;
  }

  destroy(): void {
    this.stop();
    for (const el of this.tracks.values()) el.removeAttribute('src');
    this.tracks.clear();
  }
}
