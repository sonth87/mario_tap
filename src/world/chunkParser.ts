import { GROUND_ROW, MAX_GAP_TILES, VIEW_ROWS } from '../core/constants';
import { SPAWN_LEGEND, Tile, TILE_LEGEND, type SpawnKind } from '../core/tiles';

/**
 * A hand-authored level piece. `rows` are bottom-aligned: the LAST string is the ground-surface
 * row (a space there is a pit); the row under it is filled with ground automatically.
 * Legend: docs/level-design.md / core/tiles.ts.
 */
export interface ChunkDef {
  id: string;
  /** 0 = intro … 3 = hardest; a chunk becomes eligible once the run reaches its tier. */
  tier: number;
  /** Relative pick weight (default 1). */
  weight?: number;
  rows: string[];
}

export interface ChunkSpawn {
  kind: SpawnKind;
  /** Column offset inside the chunk. */
  dx: number;
  row: number;
}

export interface ParsedChunk {
  id: string;
  tier: number;
  weight: number;
  width: number;
  /** Column-major cells, VIEW_ROWS each. */
  columns: Uint8Array[];
  spawns: ChunkSpawn[];
}

function isSpawnChar(ch: string): ch is keyof typeof SPAWN_LEGEND {
  return ch in SPAWN_LEGEND;
}

/** Parses and structurally validates a chunk (throws with the chunk id on bad data). */
export function parseChunk(def: ChunkDef): ParsedChunk {
  const width = def.rows[0]?.length ?? 0;
  if (!width) throw new Error(`chunk ${def.id}: empty`);
  if (def.rows.length > GROUND_ROW + 1) throw new Error(`chunk ${def.id}: too many rows`);
  const columns = Array.from({ length: width }, () => new Uint8Array(VIEW_ROWS));
  const spawns: ChunkSpawn[] = [];
  const top = GROUND_ROW - (def.rows.length - 1);

  def.rows.forEach((line, i) => {
    if (line.length !== width) throw new Error(`chunk ${def.id}: row ${i} is ${line.length} wide, expected ${width}`);
    const row = top + i;
    for (let x = 0; x < width; x++) {
      const ch = line[x];
      if (isSpawnChar(ch)) {
        spawns.push({ kind: SPAWN_LEGEND[ch], dx: x, row });
        // A fire bar turns around a solid hub block.
        if (ch === 'x') columns[x][row] = Tile.Used;
        continue;
      }
      const tile = TILE_LEGEND[ch];
      if (tile === undefined) throw new Error(`chunk ${def.id}: unknown char '${ch}' at row ${i} col ${x}`);
      if (row === GROUND_ROW && tile !== Tile.Ground && tile !== Tile.Empty) {
        throw new Error(`chunk ${def.id}: only '#' or ' ' allowed in the ground row (col ${x})`);
      }
      columns[x][row] = tile;
    }
  });
  for (const column of columns) if (column[GROUND_ROW] === Tile.Ground) column[GROUND_ROW + 1] = Tile.Ground;
  checkGaps(def.id, columns);
  return { id: def.id, tier: def.tier, weight: def.weight ?? 1, width, columns, spawns };
}

function checkGaps(id: string, columns: Uint8Array[]): void {
  if (columns[0][GROUND_ROW] !== Tile.Ground || columns[columns.length - 1][GROUND_ROW] !== Tile.Ground) {
    throw new Error(`chunk ${id}: must start and end on ground`);
  }
  let run = 0;
  for (const column of columns) {
    run = column[GROUND_ROW] === Tile.Ground ? 0 : run + 1;
    if (run > MAX_GAP_TILES) throw new Error(`chunk ${id}: pit wider than ${MAX_GAP_TILES}`);
  }
}
