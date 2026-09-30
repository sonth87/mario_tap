import type { CharacterDef } from '../core/character';
import type { BestStorage } from '../core/options';
import { findCharacter } from '../render/characters';
import { inside, pickerLayout, portraitRect } from '../render/uiLayout';

/**
 * Character selection state + pointer handling for the portrait button and picker panel.
 * The picker only opens while the character can change (before the first press, or on the
 * game-over screen); any press while it is open is consumed (select a card or dismiss).
 */
export class CharacterPicker {
  open = false;
  current: CharacterDef;

  constructor(
    readonly list: CharacterDef[],
    initialId: string | undefined,
    private readonly storage: BestStorage | null,
  ) {
    this.current = findCharacter(list, storage?.loadCharacter?.() ?? initialId);
  }

  /** Returns false for an unknown id. */
  select(id: string): boolean {
    const next = this.list.find((c) => c.id === id);
    if (!next) return false;
    this.current = next;
    this.storage?.saveCharacter?.(id);
    return true;
  }

  /**
   * @param world pointer position in world px, or null for the keyboard
   * @returns true when the press was used by the picker UI (the game must not see it)
   */
  handlePress(world: { x: number; y: number } | null, viewWidth: number, canChange: boolean, buttonVisible: boolean, withSound = true): boolean {
    if (this.open) {
      if (world) {
        const { cards } = pickerLayout(viewWidth, this.list.length);
        const i = cards.findIndex((r) => inside(r, world.x, world.y));
        if (i >= 0) this.select(this.list[i].id);
      }
      this.open = false;
      return true;
    }
    if (world && buttonVisible && canChange && inside(portraitRect(viewWidth, withSound), world.x, world.y)) {
      this.open = true;
      return true;
    }
    return false;
  }
}
