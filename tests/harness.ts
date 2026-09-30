/** Minimal test harness for pure logic (D9: no test framework). Usage: see tests/index.ts. */
import assert from 'node:assert/strict';

let passed = 0;
let failed = 0;
const failures: string[] = [];
/** `test()` runs synchronously at import time but an async `fn` must still be awaited before `report()` —
 * every call's promise is tracked here so `report()` can wait on all of them first. */
const pending: Promise<void>[] = [];

export function test(name: string, fn: () => void | Promise<void>): void {
  pending.push(
    (async () => {
      try {
        await fn();
        passed += 1;
      } catch (e) {
        failed += 1;
        failures.push(`${name}\n    ${(e as Error).message.split('\n').join('\n    ')}`);
      }
    })(),
  );
}

export { assert };

export async function report(): Promise<void> {
  await Promise.all(pending);
  console.log(`tests: ${passed} passed · ${failed} failed`);
  if (failed) {
    console.error(failures.map((f) => `  ✖ ${f}`).join('\n'));
    process.exit(1);
  }
}
