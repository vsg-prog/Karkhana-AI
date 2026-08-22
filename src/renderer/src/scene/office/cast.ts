// Karkhana AI cast — Indianized roster metadata + sprite frames.
//
// Both the static portraits (cards / picker) and the in-scene walking sprites are
// custom-drawn from the per-character recipes in portraitArt.ts:
// the scene sprite reuses the portrait's exact head/face/clothing and adds legs,
// so an agent on the office floor looks identical to its card.

import { Texture } from 'pixi.js';
import { paintPortrait, sceneFrameBufs, SCENE_W, SCENE_H } from './portraitArt';

export type OfficeCharacterName =
  | 'nitya' | 'vikram' | 'devi' | 'kavi' | 'rudra'
  | 'ananya' | 'arjun' | 'priya' | 'sanjay' | 'aarav'
  | 'jim' | 'pam' | 'dwight' | 'kevin' | 'angela'
  | 'oscar' | 'stanley' | 'phyllis' | 'andy' | 'kelly' | 'ryan'
  | 'toby' | 'creed' | 'meredith';

export interface CastMember {
  name: OfficeCharacterName;
  displayName: string;
  /** Signature accent color (hex) — used for the in-scene selection glow. */
  shirt: string;
  /** Blurb shown when this character is picked / has no description yet. */
  blurb: string;
}

/** Selectable roster, in display order. */
export const OFFICE_CAST: CastMember[] = [
  { name: 'nitya',   displayName: 'Nitya',   shirt: '#5a6b8c', blurb: 'CTO & Lead Orchestrator' },
  { name: 'vikram',  displayName: 'Vikram',  shirt: '#6fa8dc', blurb: 'Lead Architect & Coder' },
  { name: 'devi',    displayName: 'Devi',    shirt: '#b89b3e', blurb: 'Security & QA Review Lead' },
  { name: 'kavi',    displayName: 'Kavi',    shirt: '#9caf88', blurb: 'Product Manager & Researcher' },
  { name: 'rudra',   displayName: 'Rudra',   shirt: '#3a3a44', blurb: 'DevOps & SRE' },
  { name: 'ananya',  displayName: 'Ananya',  shirt: '#d16ba5', blurb: 'UI/UX & Frontend Engineer' },
  { name: 'arjun',   displayName: 'Arjun',   shirt: '#6fae6f', blurb: 'Data & AI Engineer' },
  { name: 'priya',   displayName: 'Priya',   shirt: '#b08bbf', blurb: 'Docs & Technical Writer' },
  { name: 'sanjay',  displayName: 'Sanjay',  shirt: '#8c5a4b', blurb: 'System Administrator' },
  { name: 'aarav',   displayName: 'Aarav',   shirt: '#9a8c5a', blurb: 'Test Automation Lead' },
];

export const CAST_BY_NAME: Record<OfficeCharacterName, CastMember> =
  Object.fromEntries(OFFICE_CAST.map((c) => [c.name, c])) as Record<OfficeCharacterName, CastMember>;

export const DEFAULT_CHARACTER: OfficeCharacterName = 'vikram';

export function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

// ─── scene frames ────────────────────────────────────────────────────────────
const frameCache = new Map<OfficeCharacterName, Texture[][]>();

function bufToTexture(buf: Uint8ClampedArray): Texture {
  const canvas = document.createElement('canvas');
  canvas.width = SCENE_W; canvas.height = SCENE_H;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(SCENE_W, SCENE_H);
  img.data.set(buf);
  ctx.putImageData(img, 0, 0);
  const tex = Texture.from(canvas);
  tex.source.scaleMode = 'nearest';
  return tex;
}

/**
 * Frame grid CharacterSprite expects: 3 rows (down, up, right) × 7 frames
 * [walk1, walk2, walk3, type1, type2, read1, read2].
 */
export async function getCastFrames(name: OfficeCharacterName): Promise<Texture[][]> {
  const cached = frameCache.get(name);
  if (cached) return cached;
  const { front, back } = sceneFrameBufs(name);
  const toRow = (bufs: Uint8ClampedArray[]): Texture[] => {
    const [stand, stepL, stepR] = bufs.map(bufToTexture);
    return [stand, stepL, stepR, stand, stand, stand, stand];
  };
  const frontRow = toRow(front);
  const frames: Texture[][] = [frontRow, toRow(back), frontRow]; // down, up, right
  frameCache.set(name, frames);
  return frames;
}

/**
 * Paint a character's static portrait for cards / the picker.
 */
export async function paintCastPortrait(
  ctx: CanvasRenderingContext2D,
  name: OfficeCharacterName,
  scale = 2,
): Promise<void> {
  paintPortrait(ctx, name, scale);
}
