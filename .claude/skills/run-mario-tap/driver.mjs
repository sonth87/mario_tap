#!/usr/bin/env node
/**
 * Drives the mario-tap demo in headless Chrome and saves screenshots.
 *
 *   node .claude/skills/run-mario-tap/driver.mjs tour   [outDir]   # real play: title, 5 biomes, pause, game over
 *   node .claude/skills/run-mario-tap/driver.mjs states [outDir]   # hand-built states: biome cross-fade, banner, game over,
 *                                                                 # climb to the clouds, pans up / down, the vine
 *
 * Run from the repo root. Playwright is NOT a project dependency: install it once into a cache dir
 * (PW_DIR, default ~/.cache/mario-tap-driver). Starts `pnpm dev` (port 5190) if nothing listens there,
 * and stops it again on exit. Exits 1 on page errors.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const mode = process.argv[2] ?? 'tour';
const out = resolve(process.argv[3] ?? '/tmp/mario-tap-shots');
const URL = 'http://localhost:5190';
const PW_DIR = process.env.PW_DIR ?? join(homedir(), '.cache/mario-tap-driver');
const { chromium } = createRequire(join(PW_DIR, 'package.json'))('playwright');
mkdirSync(out, { recursive: true });

const up = () => fetch(URL).then((r) => r.ok, () => false);
let server = null;
if (!(await up())) {
  server = spawn('pnpm', ['dev'], { stdio: 'ignore', detached: true });
  for (let i = 0; i < 60 && !(await up()); i++) await new Promise((r) => setTimeout(r, 500));
  if (!(await up())) throw new Error('dev server did not come up on :5190');
}
const stopServer = () => server && process.kill(-server.pid);

// System Chrome first (no browser download needed); falls back to Playwright's own Chromium.
const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const errors = [];
const newPage = async (viewport) => {
  const page = await (await browser.newContext({ viewport, deviceScaleFactor: 2 })).newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  return page;
};

async function tour() {
  const page = await newPage({ width: 900, height: 520 });
  await page.goto(URL);
  await page.waitForFunction(() => window.__game); // dev-only handle set by demo/main.ts
  await page.selectOption('#theme', 'day'); // demo default is 'glass' (transparent sky)
  const shot = async (name) => {
    await page.locator('.glass').screenshot({ path: join(out, `${name}.png`) });
    console.log('shot', join(out, `${name}.png`));
  };
  const stats = () => page.evaluate(() => window.__game.getStats());
  await page.waitForTimeout(500);
  await shot('1-title');
  for (const biome of ['grass', 'desert', 'snow', 'castle', 'sky']) {
    // `biomes` applies from the next run, hence restart().
    await page.evaluate((b) => { window.__game.update({ biomes: [b] }); window.__game.restart(); }, biome);
    await page.waitForTimeout(200);
    await page.keyboard.press('Space');
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(450);
      if ((await stats()).status === 'playing') await page.keyboard.press('Space');
    }
    await shot(`2-${biome}`);
  }
  if ((await stats()).status === 'playing') {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    await shot('3-paused');
    console.log('paused:', (await stats()).paused);
    await page.keyboard.press('Escape');
  }
  for (let i = 0; i < 120 && (await stats()).status !== 'over'; i++) await page.waitForTimeout(250);
  if ((await stats()).status === 'over') {
    await page.waitForTimeout(800);
    await shot('4-gameover');
  } else console.log('no game over within 30 s (Mario can bounce between walls forever) — use `states`');
  console.log('stats', JSON.stringify(await stats()));
}

/** Temp page inside demo/ (Vite serves it with TS + the src imports); deleted afterwards. */
const QA_HTML = '<!doctype html><html><head><link rel="icon" href="data:,"></head><body style="margin:0;background:#222"><div id="out"></div><script type="module" src="./__qa.ts"></script></body></html>';
const QA_TS = `
import { createState } from '../src/game/state';
import { step } from '../src/game/step';
import { render } from '../src/render/renderer';
import { resolveBiomeThemes } from '../src/core/theme';
import { DEFAULT_LABELS } from '../src/core/options';
import { BUILTIN_CHARACTERS } from '../src/render/characters';
import { isPole, isSolid } from '../src/core/tiles';
import { TILE, GROUND_ROW, GROUND_Y, LIFT_FRAMES } from '../src/core/constants';
import { createEnemy } from '../src/entities/factory';
const W = 460;
const opts = { showHud: true, showPrompts: true, scenery: true, characterButton: true, soundButton: true, pauseButton: true,
  credit: { text: 'SONTH87', url: 'x' }, themes: resolveBiomeThemes('day', undefined), labels: { ...DEFAULT_LABELS, title: 'Mario Runner' }, reducedMotion: false };
type S = ReturnType<typeof createState>;
function shot(name: string, prep: (s: S) => void, biomes?: any) {
  const c = document.createElement('canvas'); c.width = W * 2; c.height = 208 * 2; c.id = name; c.style.display = 'block';
  document.getElementById('out')!.append(c);
  const s = createState(7, W, biomes ? { biomes } : {}); step(s, true); s.entities = []; s.statusTimer = 900; // past the title-board slide
  prep(s);
  const stats = { status: s.status, score: 1234, distance: 640, coins: 23, kills: 9, bonus: 0, flags: 2, biome: s.biome, speedLevel: s.speedLevel,
    power: 0, character: 'mario', canChangeCharacter: false, best: { score: 2000, distance: 900, coins: 40 }, newRecord: true, paused: false };
  render(c.getContext('2d')!, s, stats as never, opts, { characters: BUILTIN_CHARACTERS, character: BUILTIN_CHARACTERS[0], pickerOpen: false,
    muted: false, paused: false, canChangeCharacter: false, frame: s.frame }, 2);
}
/** Column of the n-th flagpole (biome n starts right after it). */
function pole(s: S, n: number) {
  let col = 0;
  for (let k = 0; k < n; k++) for (col = col + 1; ; col++) { s.gen.ensure(col + 40); if (isPole(s.map.get(col, GROUND_ROW - 2))) break; }
  return col;
}
/** The ground ↔ cloud border of the given kind (climb up = 'right', vine down = 'left'). */
function edge(s: S, upper: 'left' | 'right') {
  for (let c = 0; c < 4000 && !s.map.edges.some((e) => e.upper === upper); c += 20) s.gen.ensure(c);
  const e = s.map.edges.find((x) => x.upper === upper)!;
  s.gen.ensure(e.col + 60);
  return e;
}
function put(s: S, x: number, y: number, grounded = true) {
  Object.assign(s.mario, { x, y, vy: 0, dir: 1, grounded }); s.cameraX = x - 120; s.maxX = x; s.entities = [];
}
/** Mario standing on the top step of the climb (optionally with the pan already started). */
function onTopStep(s: S, frames: number) {
  const e = edge(s, 'right');
  let top = e.col - 1;
  while (!isSolid(s.map.get(top, e.trigger)) || isSolid(s.map.get(top, e.trigger - 1))) top -= 1;
  put(s, top * TILE + 2, e.trigger * TILE - s.mario.h);
  for (let i = 0; i < frames; i++) step(s, false);
}
shot('cross', (s) => { const c = pole(s, 1); s.cameraX = c * TILE - W * 0.4; s.mario.x = s.cameraX + 100; s.frame = 500; });
shot('banner', (s) => { const c = pole(s, 2); s.cameraX = c * TILE + 40; s.mario.x = c * TILE + 120; s.maxX = s.mario.x; s.biome = 'snow';
  s.speedLevel = 2; s.frame = 1000; s.biomeFrame = 980; s.speedFrame = 980; });
shot('over', (s) => { const c = pole(s, 3); s.cameraX = c * TILE + 200; s.mario.x = s.cameraX + 120; s.maxX = s.mario.x; s.biome = 'castle';
  s.status = 'over'; s.statusTimer = 100; s.frame = 2000; });
// The way into the clouds: climbing (the cloud layer floats above, the castle ground goes on below it) …
shot('ascent', (s) => { const e = edge(s, 'right'); put(s, (e.col - 14) * TILE, GROUND_Y - s.mario.h); s.cameraX = (e.col - 20) * TILE; }, ['castle', 'sky']);
// … mid-pan, and up on the clouds with the sky's own enemies.
shot('lift-up', (s) => onTopStep(s, 1 + LIFT_FRAMES / 2), ['castle', 'sky']);
shot('sky', (s) => {
  onTopStep(s, 2 + LIFT_FRAMES + 40);
  const col = Math.floor(s.mario.x / TILE);
  for (let c = col; c < col + 12; c++) { s.map.set(c, GROUND_ROW, 20); s.map.set(c, GROUND_ROW + 1, 20); for (let r = 0; r < GROUND_ROW; r++) s.map.set(c, r, 0); }
  const sc = createEnemy(s, { kind: 'spikecloud', col: col + 5, row: GROUND_ROW - 1 }); sc.active = true;
  const b = createEnemy(s, { kind: 'bird', col: col + 9, row: GROUND_ROW - 4 }); b.active = true;
  s.entities.push(sc, b); s.biomeFrame = s.frame - 20;
}, ['castle', 'sky']);
// The way down: the vine reaches through the clouds to the ground; mid-pan; sliding down onto the grass.
shot('vine', (s) => { const e = edge(s, 'left'); put(s, (e.trigger - 4) * TILE, GROUND_Y - s.mario.h); s.cameraX = (e.trigger - 12) * TILE; }, ['sky', 'grass']);
shot('lift-down', (s) => { const e = edge(s, 'left'); put(s, e.trigger * TILE + 2, 5 * TILE, false); s.cameraX = (e.trigger - 12) * TILE;
  for (let i = 0; i < 1 + LIFT_FRAMES / 2; i++) step(s, false); }, ['sky', 'grass']);
shot('vine-slide', (s) => { const e = edge(s, 'left'); put(s, e.trigger * TILE + 2, 5 * TILE, false); s.cameraX = (e.trigger - 12) * TILE;
  for (let i = 0; i < LIFT_FRAMES + 30; i++) step(s, false); }, ['sky', 'grass']);
(window as any).__done = true;
`;

async function states() {
  const html = resolve('demo/__qa.html');
  const ts = resolve('demo/__qa.ts');
  writeFileSync(html, QA_HTML);
  writeFileSync(ts, QA_TS);
  try {
    const page = await newPage({ width: 1000, height: 1400 });
    await page.goto(`${URL}/__qa.html`);
    await page.waitForFunction(() => window.__done, null, { timeout: 20000 });
    for (const id of ['cross', 'banner', 'over', 'ascent', 'lift-up', 'sky', 'vine', 'lift-down', 'vine-slide']) {
      await page.locator(`#${id}`).screenshot({ path: join(out, `state-${id}.png`) });
      console.log('shot', join(out, `state-${id}.png`));
    }
  } finally {
    rmSync(html, { force: true });
    rmSync(ts, { force: true });
  }
}

try {
  if (mode === 'tour') await tour();
  else if (mode === 'states') await states();
  else throw new Error(`unknown mode ${mode} (tour | states)`);
} finally {
  await browser.close();
  stopServer();
}
console.log('page errors:', errors.length ? errors : 'none');
if (errors.length) process.exit(1);
