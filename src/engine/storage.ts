import type { BestStorage } from '../core/options';
import type { BestRecord } from '../core/types';

export const DEFAULT_STORAGE_KEY = 'mario-runner:best';

export const EMPTY_BEST: BestRecord = { score: 0, distance: 0, coins: 0 };

function isBestRecord(v: unknown): v is BestRecord {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return typeof r.score === 'number' && typeof r.distance === 'number' && typeof r.coins === 'number';
}

/** localStorage-backed best record (+ selected character under `<key>:character`). Every access is guarded: private mode / blocked storage just means no persistence. */
export function localBestStorage(key: string = DEFAULT_STORAGE_KEY): BestStorage {
  return {
    load() {
      try {
        const raw = globalThis.localStorage?.getItem(key);
        if (!raw) return null;
        const parsed: unknown = JSON.parse(raw);
        return isBestRecord(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
    save(record) {
      try {
        globalThis.localStorage?.setItem(key, JSON.stringify(record));
      } catch {
        // Storage full or blocked — the record lives for this session only.
      }
    },
    loadCharacter() {
      try {
        return globalThis.localStorage?.getItem(`${key}:character`) ?? null;
      } catch {
        return null;
      }
    },
    saveCharacter(id) {
      try {
        globalThis.localStorage?.setItem(`${key}:character`, id);
      } catch {
        // Non-fatal.
      }
    },
  };
}
