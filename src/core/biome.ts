/**
 * Biomes: the run changes scenery AND rules at every flagpole (user decision: long runs need new
 * challenges, not just more of the same). Default cycle: grass → desert → snow → castle → grass …
 * - grass:  the classic mix (piranha plants in pipes from tier 1).
 * - desert: more pits and Bill Blasters; Spinies (cannot be stomped) replace many goombas.
 * - snow:   the ground is ICE: Mario runs faster and only slowly reverses after a wall.
 * - castle: fire bars turning around floating blocks, more walls and cannons; lava in the pits.
 * - sky:    reached by climbing floating steps (the view pans up so the clouds become the floor);
 *           spike clouds and birds; left by jumping onto a vine that leads back down to the ground.
 */
export type BiomeId = 'grass' | 'desert' | 'snow' | 'castle' | 'sky';

export const BIOME_IDS: readonly BiomeId[] = ['grass', 'desert', 'snow', 'castle', 'sky'];

export function isBiomeId(v: unknown): v is BiomeId {
  return typeof v === 'string' && (BIOME_IDS as readonly string[]).includes(v);
}
