import { defineConfig } from 'vite';

/**
 * Standalone build of the game (no host app): `pnpm dev` serves demo/, `pnpm build` writes a
 * static site to dist/ with relative asset paths, so it can be opened from any folder or host.
 */
export default defineConfig({
  root: 'demo',
  base: './',
  build: { outDir: '../dist', emptyOutDir: true },
  server: { port: 5190 },
});
