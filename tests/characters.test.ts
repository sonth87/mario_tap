import { resolveTheme, THEMES } from '../src/core/theme';
import { BUILTIN_CHARACTERS, findCharacter } from '../src/render/characters';
import { assert, test } from './harness';

function dims(rows: string[], w: number, h: number, what: string): void {
  assert.equal(rows.length, h, `${what}: ${rows.length} rows`);
  rows.forEach((r, i) => assert.equal(r.length, w, `${what} row ${i}: ${r.length} wide`));
}

test('every built-in character frame is 16×16 (small) / 16×32 (big), 3 run frames', () => {
  for (const c of BUILTIN_CHARACTERS) {
    const sp = c.sprites;
    dims(sp.smallStand, 16, 16, `${c.id} smallStand`);
    dims(sp.smallJump, 16, 16, `${c.id} smallJump`);
    if (sp.smallDead) dims(sp.smallDead, 16, 16, `${c.id} smallDead`);
    assert.equal(sp.smallRun.length, 3);
    assert.equal(sp.bigRun.length, 3);
    sp.smallRun.forEach((f, i) => dims(f, 16, 16, `${c.id} smallRun${i}`));
    dims(sp.bigStand, 16, 32, `${c.id} bigStand`);
    dims(sp.bigJump, 16, 32, `${c.id} bigJump`);
    sp.bigRun.forEach((f, i) => dims(f, 16, 32, `${c.id} bigRun${i}`));
  }
});

test('every sprite colour key has a colour in each character palette', () => {
  for (const c of BUILTIN_CHARACTERS) {
    const keys = new Set(Object.values(c.sprites).flat(2).join('').replace(/\./g, ''));
    for (const pal of [c.palette, c.firePalette, ...c.starPalettes]) {
      for (const k of keys) assert.ok(pal[k], `${c.id}: palette misses '${k}'`);
    }
  }
});

test('ids are unique; unknown id falls back to the first character', () => {
  const ids = BUILTIN_CHARACTERS.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(findCharacter(BUILTIN_CHARACTERS, 'nobody').id, 'mario');
  assert.equal(findCharacter(BUILTIN_CHARACTERS, 'peach').name, 'Peach');
});

test('theme: presets resolve, overrides merge on a base, null hides a layer', () => {
  assert.equal(resolveTheme(undefined), THEMES.day);
  assert.equal(resolveTheme('night'), THEMES.night);
  const t = resolveTheme({ base: 'night', trees: null, blocks: { O: '#123456' } });
  assert.equal(t.trees, null);
  assert.equal(t.sky, THEMES.night.sky);
  assert.equal(t.blocks.O, '#123456');
  assert.equal(t.blocks.H, THEMES.night.blocks.H, 'block overrides merge with the base');
});
