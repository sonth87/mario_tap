import type { CharacterSprites } from '../../core/character';

/**
 * Shared leg templates and frame assembly for the non-plumber heroes (all facing right). Legs come
 * from templates ('p' = trousers, 'd' = boots) so the three run frames stay consistent; `legs()`
 * swaps in each hero's palette keys.
 */

export const SMALL_LEGS = {
  stand: ['....ppp..ppp....', '...dddd..dddd...', '...dddd..dddd...'],
  run0: ['...ppp....ppp...', '..ddd......ddd..', '.dddd......dddd.'],
  run1: ['.....pppppp.....', '....ddd.ddd.....', '....dddd.dddd...'],
  run2: ['....ppp...ppp...', '...ddd....ddd...', '..dddd.....ddd..'],
  jump: ['...ppp...ppp....', '..ddd.....dd....', '.dddd....ddd....'],
};

export const BIG_LEGS = {
  stand: ['....ppp..ppp....', '....ppp..ppp....', '....ppp..ppp....', '...dddd..dddd...', '..ddddd..ddddd..', '..ddddd..ddddd..'],
  run0: ['...ppp....ppp...', '..ppp......ppp..', '.ppp........ppp.', '.ddd.......dddd.', 'dddd.......ddddd', 'dddd........dddd'],
  run1: ['.....pppppp.....', '.....ppp.ppp....', '.....ppp.ppp....', '....dddd.dddd...', '...ddddd.ddddd..', '...dddd...dddd..'],
  run2: ['....ppp...ppp...', '...ppp.....ppp..', '..ppp.......ppp.', '..ddd......dddd.', '.dddd......ddddd', '.dddd.......dddd'],
  jump: ['...ppp....ppp...', '..ppp.....pppp..', '.ppp......dddd..', '.ddd......dddd..', 'dddd............', 'dddd............'],
};

export type LegSet = Record<'stand' | 'run0' | 'run1' | 'run2' | 'jump', string[]>;

/** `sole` (optional) repaints the bottom row's boots — bare legs in sandals: `legs(set, 'S', 'S', 'D')`. */
export function legs(set: LegSet, pants: string, boots: string, sole?: string): LegSet {
  const paint = (rows: string[]): string[] =>
    rows.map((r, i) => r.replace(/p/g, pants).replace(/d/g, sole && i === rows.length - 1 ? sole : boots));
  return { stand: paint(set.stand), run0: paint(set.run0), run1: paint(set.run1), run2: paint(set.run2), jump: paint(set.jump) };
}

export function hero(smallTop: string[], smallTopReach: string[], small: LegSet, bigTop: string[], bigTopReach: string[], big: LegSet): CharacterSprites {
  return {
    smallStand: [...smallTop, ...small.stand],
    smallRun: [small.run0, small.run1, small.run2].map((l) => [...smallTop, ...l]),
    smallJump: [...smallTopReach, ...small.jump],
    bigStand: [...bigTop, ...big.stand],
    bigRun: [big.run0, big.run1, big.run2].map((l) => [...bigTop, ...l]),
    bigJump: [...bigTopReach, ...big.jump],
  };
}
