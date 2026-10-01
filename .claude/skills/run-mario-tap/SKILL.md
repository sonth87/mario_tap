---
name: run-mario-tap
description: Run, start, build, test, screenshot and drive the mario-tap one-button Mario runner (Canvas 2D game + Vite demo). Use when asked to launch the game, see a change in the real app, take screenshots of biomes / HUD / pause / game over, or run its tests and level validator.
---

A Canvas 2D game with a standalone Vite demo (`demo/`). Agents drive it with
`.claude/skills/run-mario-tap/driver.mjs`, a Playwright script that starts the dev server by itself,
plays the game in headless Chrome and saves PNGs. Look at the PNGs: the whole game is one canvas,
so there is no DOM to assert on.

All paths are relative to the repo root.

## Setup

```bash
pnpm install
# Playwright is NOT a project dependency — keep it out of package.json; install once into a cache dir:
mkdir -p ~/.cache/mario-tap-driver && npm i --prefix ~/.cache/mario-tap-driver playwright@1.49 --no-save --silent
```

The driver launches the **system Chrome** (`channel: 'chrome'`), so no browser download is needed.
Verified on macOS with Google Chrome installed. On a machine without Chrome it falls back to
Playwright's own Chromium, which needs `npx --prefix ~/.cache/mario-tap-driver playwright install chromium`
(not verified here).

## Run (agent path)

```bash
node .claude/skills/run-mario-tap/driver.mjs tour screenshots     # real play → screenshots/ (the project's screenshot folder)
node .claude/skills/run-mario-tap/driver.mjs states screenshots   # hand-built states → screenshots/state-*.png
```

| mode | what it does | output |
|---|---|---|
| `tour` | title screen; then for each biome `update({ biomes: [b] })` + `restart()`, Space to start, jumps a few times, shot; Esc → pause shot; waits ≤30 s for a game over | `1-title`, `2-{grass,desert,snow,castle,sky}`, `3-paused`, `4-gameover` (only if Mario died) |
| `states` | writes a temporary page `demo/__qa.{html,ts}` that builds `GameState`s in code and advances them with the real `step()` (biome cross-fade at the 1st flagpole, SNOWFIELD + SPEED UP banner, castle GAME OVER card with lava, the climb to the clouds, the pan up, up on the clouds with a spike cloud + bird, the vine, the pan down, sliding down onto the grass), screenshots each canvas, **deletes the temp files** | `state-{cross,banner,over,ascent,lift-up,sky,vine,lift-down,vine-slide}` |

- Optional 2nd argument = output directory (default `/tmp/mario-tap-shots`). Exits 1 and prints `page errors: [...]` on any page error / console error.
- Takes ~45 s (`tour`) / ~10 s (`states`). It stops the dev server it started; an already running `pnpm dev` is reused and left running.
- To check a rendering change in a specific situation, edit the `shot(...)` calls in `QA_TS` inside the driver.
  They are plain TS run by Vite against `src/` (`createState`, `step`, `render`).

## Run (human path)

```bash
pnpm dev     # http://localhost:5190 — theme + biome selectors under the game. Ctrl-C to stop.
pnpm build   # static site in dist/
```

## Test

```bash
pnpm typecheck
pnpm test       # 66 tests, ~40 s (the long solver stretches in tests/level.test.ts dominate)
pnpm validate   # proves every level chunk is passable: 3699 layouts, ~3 min
```

## Gotchas

- **The demo defaults to `theme: 'glass'`** (transparent sky over a blurred page). The driver switches
  the `#theme` select to `day` first; otherwise screenshots look washed out and biome skies stay transparent
  (by design: a transparent host sky carries over to every biome).
- **`window.__game`** (the `createMarioGame` handle) exists only in dev (`demo/main.ts`, `import.meta.env.DEV`). Not in `pnpm build`.
- **`biomes` / `speedUp` apply from the next run.** Call `restart()` after `update({ biomes })`, as the driver does.
- **A game over cannot be forced through the public API**, and auto-running Mario can bounce between
  two walls forever without dying. That is why `tour` may skip `4-gameover` and why the GAME OVER card is covered by `states`.
- **Reaching a later biome by playing is impractical** (first flagpole at 200 m, then one every 450 m; the sky is the 5th biome).
  Use `tour` (one biome per run) or `states` (border cross-fade, banner, the ground ↔ cloud pans).
- **The sky's way in / out only exists between two different biomes.** `tour` with `biomes: ['sky']` shows the cloud floor but no
  climb / vine; `states` builds them with `['castle', 'sky']` and `['sky', 'grass']`.
- **Hand-built states must set `s.statusTimer` high** (the driver uses 900). Otherwise the SKYLINE title
  board is still "sliding away" and covers the banner.
- **Temp QA page needs `<link rel="icon" href="data:,">`.** Without it Chrome requests `/favicon.ico`, Vite answers 404,
  and the driver reports it as a page error.
- **`npx tsx -e "await import(...)"` fails** ("Top-level await is currently not supported with the cjs output format").
  Run single test files through a real `.ts` file, or just `pnpm test`.

## Troubleshooting

- **`Executable doesn't exist at …/ms-playwright/chromium_headless_shell-1148/…`**: the installed Playwright version
  wants its own browser build. The driver avoids this by launching `channel: 'chrome'`. If you see it, Chrome is not installed:
  install it, or run the `playwright install chromium` line above.
- **`dev server did not come up on :5190`**: something else holds the port, or `pnpm install` was not run.
  Free it with `lsof -ti:5190 -sTCP:LISTEN | xargs kill`.
