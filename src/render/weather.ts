import { VIEW_HEIGHT } from '../core/constants';
import type { Weather } from '../core/theme';

/** Deterministic 0..1 hash per particle. */
function h(n: number): number {
  const x = Math.sin(n * 91.7 + 13.3) * 43758.5453;
  return x - Math.floor(x);
}

const mod = (a: number, n: number): number => ((a % n) + n) % n;

/**
 * Stateless particles (position = f(particle, frame, camera)), so nothing is simulated or stored:
 * snow drifts down, sand streaks blow left, embers float up from the lava.
 */
export function drawWeather(ctx: CanvasRenderingContext2D, weather: Weather, frame: number, cameraX: number, width: number): void {
  if (!weather) return;
  const span = width + 16;
  if (weather === 'snow') {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 0; i < 46; i++) {
      const fall = 0.25 + h(i + 5) * 0.45;
      const x = mod(h(i) * span * 3 - cameraX * (0.5 + h(i + 9) * 0.4) + Math.sin(frame / 40 + i) * 6, span) - 8;
      const y = mod(h(i + 3) * VIEW_HEIGHT + frame * fall, VIEW_HEIGHT + 8) - 4;
      const size = h(i + 7) < 0.3 ? 2 : 1;
      ctx.fillRect(Math.round(x), Math.round(y), size, size);
    }
    return;
  }
  if (weather === 'sand') {
    ctx.fillStyle = 'rgba(255,226,170,0.55)';
    for (let i = 0; i < 28; i++) {
      const x = mod(h(i) * span * 4 - frame * (1.6 + h(i + 2) * 2) - cameraX * 0.9, span) - 8;
      const y = 40 + h(i + 4) * (VIEW_HEIGHT - 50) + Math.sin(frame / 25 + i) * 2;
      ctx.fillRect(Math.round(x), Math.round(y), 3 + Math.round(h(i + 6) * 4), 1);
    }
    return;
  }
  for (let i = 0; i < 22; i++) {
    const rise = 0.3 + h(i + 1) * 0.5;
    const y = VIEW_HEIGHT - mod(h(i + 3) * VIEW_HEIGHT + frame * rise, VIEW_HEIGHT + 10);
    const x = mod(h(i) * span * 2 - cameraX * 0.8 + Math.sin(frame / 30 + i * 2) * 4, span) - 8;
    ctx.fillStyle = h(i + 8) < 0.5 ? 'rgba(248,152,40,0.85)' : 'rgba(252,216,120,0.75)';
    ctx.fillRect(Math.round(x), Math.round(y), 1, h(i + 9) < 0.3 ? 2 : 1);
  }
}
