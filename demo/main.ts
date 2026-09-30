/** Standalone demo: the whole game from the framework-agnostic entry, no React, no host app. */
import { createMarioGame, type ThemeName } from '../src';

const stage = document.getElementById('stage') as HTMLElement;
const themeSelect = document.getElementById('theme') as HTMLSelectElement;
const scenery = document.getElementById('scenery') as HTMLInputElement;

const game = createMarioGame(stage, {
  storageKey: 'mario-runner-demo:best',
  theme: 'glass',
  labels: { title: 'Mario Runner' },
  onGameOver: (s) => console.info(`run over — score ${s.score}, ${s.distance} m, ${s.coins} coins, best ${s.best.score}`),
});

themeSelect.addEventListener('change', () => {
  game.update({ theme: themeSelect.value as ThemeName });
  themeSelect.blur(); // keep Space for the game, not the dropdown
});
scenery.addEventListener('change', () => {
  game.update({ scenery: scenery.checked });
  scenery.blur();
});

// Dev only: expose the handle for browser QA scripts (stripped from `pnpm build`).
if (import.meta.env.DEV) (window as unknown as { __game: typeof game }).__game = game;
