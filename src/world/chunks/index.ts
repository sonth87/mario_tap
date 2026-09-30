import { parseChunk, type ChunkDef, type ParsedChunk } from '../chunkParser';
import { TIER0 } from './tier0';
import { TIER1 } from './tier1';
import { TIER2 } from './tier2';
import { TIER3 } from './tier3';

export const CHUNK_DEFS: ChunkDef[] = [...TIER0, ...TIER1, ...TIER2, ...TIER3];

let parsed: ParsedChunk[] | null = null;

/** All chunks, parsed once. */
export function getChunks(): ParsedChunk[] {
  parsed ??= CHUNK_DEFS.map(parseChunk);
  return parsed;
}

