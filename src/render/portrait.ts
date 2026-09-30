import type { CharacterDef } from '../core/character';
import { sprite } from './atlas';

const cache = new Map<string, string>();

/**
 * PNG data URL of a character's small standing sprite, scaled up `scale`× with hard pixels —
 * for hosts that draw their own character button / HUD (DOM only).
 */
export function characterPortraitUrl(character: CharacterDef, scale = 4): string {
  const key = `${character.id}@${scale}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const src = sprite(character.sprites.smallStand, character.palette);
  const canvas = document.createElement('canvas');
  canvas.width = src.width * scale;
  canvas.height = src.height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
  const url = canvas.toDataURL('image/png');
  cache.set(key, url);
  return url;
}
