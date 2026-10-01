/** `pnpm test` — runs every *.test.ts here (pure logic, no DOM). */
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { report } from './harness';

const dir = import.meta.dirname;
for (const f of readdirSync(dir).filter((x) => x.endsWith('.test.ts')).sort()) {
  await import(join(dir, f));
}
await report();
