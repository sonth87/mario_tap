import type { GameEvent } from '../core/types';

type Wave = OscillatorType;

const VOLUME = 0.05;

/**
 * 8-bit style sound effects synthesised with Web Audio (no audio files). The AudioContext must be
 * created / resumed INSIDE a user gesture (iOS Safari keeps it suspended otherwise, and sounds are
 * played later from the game loop), so the engine calls `unlock()` from every press handler.
 */
export class Sfx {
  private ctx: AudioContext | null = null;

  constructor(public muted = false) {}

  private audio(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor = globalThis.AudioContext ?? (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      this.ctx = new Ctor();
    } catch {
      return null;
    }
    return this.ctx;
  }

  /** Frequency slide from `from` to `to` Hz. */
  private sweep(from: number, to: number, dur: number, wave: Wave = 'square', delay = 0): void {
    const ctx = this.audio();
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(from, t);
    osc.frequency.exponentialRampToValueAtTime(to, t + dur);
    gain.gain.setValueAtTime(VOLUME, t);
    gain.gain.linearRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /** Note sequence, `step` seconds apart. */
  private notes(freqs: number[], step: number, wave: Wave = 'square'): void {
    freqs.forEach((f, i) => this.sweep(f, f * 1.001, step * 0.95, wave, i * step));
  }

  private noise(dur: number): void {
    const ctx = this.audio();
    if (!ctx) return;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = VOLUME * 1.5;
    src.buffer = buffer;
    src.connect(gain).connect(ctx.destination);
    src.start();
  }

  /** Call from a user-gesture handler (pointerdown / keydown). Cheap after the first time. */
  unlock(): void {
    if (this.muted && !this.ctx) return;
    const ctx = this.audio();
    if (ctx && ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
  }

  play(event: GameEvent): void {
    if (this.muted) return;
    try {
      this.dispatch(event);
    } catch {
      // Audio is best-effort; never break the game over it.
    }
  }

  private dispatch(event: GameEvent): void {
    switch (event) {
      case 'start': return this.notes([660, 880], 0.06);
      case 'jump': return this.sweep(140, 620, 0.14);
      case 'coin': return this.notes([988, 1319], 0.08);
      case 'stomp': return this.sweep(420, 110, 0.09);
      case 'kick': return this.sweep(700, 200, 0.07);
      case 'bump': return this.sweep(160, 90, 0.07, 'triangle');
      case 'break': return this.noise(0.18);
      case 'powerAppear': return this.notes([392, 523, 659, 784, 1047], 0.04);
      case 'powerUp': return this.notes([523, 659, 784, 1047, 1319, 1568], 0.05);
      case 'powerDown': return this.notes([784, 587, 440, 330, 262], 0.06);
      case 'fireball': return this.sweep(900, 300, 0.05);
      case 'star': return this.notes([523, 659, 784, 659, 784, 1047], 0.05);
      case 'cannon': return this.noise(0.12);
      case 'flag': return this.notes([1319, 1175, 1047, 988, 880, 784, 698, 659, 587, 523], 0.05);
      case 'die': return this.notes([494, 698, 698, 698, 659, 587, 523, 330, 262], 0.11);
      case 'gameOver': return this.notes([523, 392, 330, 220, 247, 208, 196], 0.14, 'triangle');
      case 'speedUp': return this.notes([523, 659, 784, 1047, 784, 1047], 0.05);
      case 'biome': return;
      case 'lift': return this.notes([392, 523, 659, 784, 1047, 1319, 1568], 0.07, 'triangle');
    }
  }

  close(): void {
    void this.ctx?.close();
    this.ctx = null;
  }
}
