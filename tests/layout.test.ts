import { creditRect, hudTextRight, pickerLayout, portraitRect, soundRect, type Rect } from '../src/render/uiLayout';
import { assert, test } from './harness';

const overlap = (a: Rect, b: Rect): boolean => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

test('HUD buttons never overlap and stay inside the view at every width', () => {
  for (const w of [192, 250, 346, 460, 640]) {
    const sound = soundRect(w);
    const portrait = portraitRect(w, true);
    assert.ok(!overlap(sound, portrait), `width ${w}`);
    assert.ok(sound.x + sound.w <= w && portrait.x >= 0);
    assert.ok(portrait.x + portrait.w < sound.x, 'portrait is left of the speaker');
    assert.equal(portraitRect(w, false).x, sound.x, 'without a speaker the portrait takes its place');
    assert.ok(hudTextRight(w, true, true) < portrait.x);
  }
});

test('credit sits top-left, clear of the top-right buttons', () => {
  const c = creditRect('SONTH87');
  assert.ok(c.x < 12 && c.y < 8);
  assert.ok(!overlap(c, portraitRect(192, true)));
});

test('character picker stays on screen and never leaves a lone card', () => {
  for (const w of [192, 246, 346, 460, 640]) {
    for (const count of [4, 7, 11, 14]) {
      const { panel, cards } = pickerLayout(w, count);
      assert.ok(panel.x >= 0 && panel.x + panel.w <= w, `w${w} n${count}: panel x`);
      assert.ok(panel.y >= 0 && panel.y + panel.h <= 208, `w${w} n${count}: panel y (${panel.y + panel.h})`);
      for (const card of cards) assert.ok(card.y + card.h <= panel.y + panel.h);
      const rows = new Map<number, number>();
      for (const card of cards) rows.set(card.y, (rows.get(card.y) ?? 0) + 1);
      const sizes = [...rows.values()];
      if (sizes.length > 1) assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1, `w${w} n${count}: rows ${sizes}`);
    }
  }
});
