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

export interface LocalizedDisplayNames {
  en: string;
  hi: string;
  ta: string;
  te: string;
  bn: string;
  as: string;
}

export interface CastMember {
  name: OfficeCharacterName;
  displayName: string;
  displayNames: LocalizedDisplayNames;
  /** Signature accent color (hex) — used for the in-scene selection glow. */
  shirt: string;
  /** Blurb shown when this character is picked / has no description yet. */
  blurb: string;
}

/** Selectable roster, in display order. */
export const OFFICE_CAST: CastMember[] = [
  { name: 'nitya',   displayName: 'Nitya',   displayNames: { en: 'Nitya',   hi: 'नित्या',  ta: 'நித்யா',   te: 'నిత్య',   bn: 'নিত্য',   as: 'নিত্যা' }, shirt: '#5a6b8c', blurb: 'CTO & Lead Orchestrator' },
  { name: 'vikram',  displayName: 'Vikram',  displayNames: { en: 'Vikram',  hi: 'विक्रम',  ta: 'விக்ரம்',  te: 'విక్రమ్',  bn: 'বিক্রম',  as: 'বিক্রম' }, shirt: '#6fa8dc', blurb: 'Lead Architect & Coder' },
  { name: 'devi',    displayName: 'Devi',    displayNames: { en: 'Devi',    hi: 'देवी',    ta: 'தேவி',    te: 'దేవి',    bn: 'দেবী',    as: 'দেৱী' }, shirt: '#b89b3e', blurb: 'Security & QA Review Lead' },
  { name: 'kavi',    displayName: 'Kavi',    displayNames: { en: 'Kavi',    hi: 'कवि',    ta: 'கவி',    te: 'కవి',    bn: 'কবি',    as: 'কবি' }, shirt: '#9caf88', blurb: 'Product Manager & Researcher' },
  { name: 'rudra',   displayName: 'Rudra',   displayNames: { en: 'Rudra',   hi: 'रुद्र',   ta: 'ருத்ரா',   te: 'రుద్ర',   bn: 'রুদ্র',   as: 'ৰুদ্ৰ' }, shirt: '#3a3a44', blurb: 'DevOps & SRE' },
  { name: 'ananya',  displayName: 'Ananya',  displayNames: { en: 'Ananya',  hi: 'अनन्या',  ta: 'அனன்யா',  te: 'அனన్య',  bn: 'অনন্যা',  as: 'অনন্যা' }, shirt: '#d16ba5', blurb: 'UI/UX & Frontend Engineer' },
  { name: 'arjun',   displayName: 'Arjun',   displayNames: { en: 'Arjun',   hi: 'अर्जुन',   ta: 'அர்ஜுன்',   te: 'అర్జున్',   bn: 'অর্জুন',   as: 'অৰ্জুন' }, shirt: '#6fae6f', blurb: 'Data & AI Engineer' },
  { name: 'priya',   displayName: 'Priya',   displayNames: { en: 'Priya',   hi: 'प्रिया',   ta: 'பிரியா',   te: 'பிரிய',   bn: 'প্রিয়া',   as: 'প্ৰিয়া' }, shirt: '#b08bbf', blurb: 'Docs & Technical Writer' },
  { name: 'sanjay',  displayName: 'Sanjay',  displayNames: { en: 'Sanjay',  hi: 'संजय',  ta: 'சஞ்சய்',  te: 'సంజయ్',  bn: 'সংজয়',  as: 'সঞ্জয়' }, shirt: '#8c5a4b', blurb: 'System Administrator' },
  { name: 'aarav',   displayName: 'Aarav',   displayNames: { en: 'Aarav',   hi: 'आरव',   ta: 'ஆரவ்',   te: 'ఆరవ్',   bn: 'আরভ',   as: 'আৰৱ' }, shirt: '#9a8c5a', blurb: 'Test Automation Lead' },
];

export const CAST_BY_NAME: Record<OfficeCharacterName, CastMember> =
  Object.fromEntries(OFFICE_CAST.map((c) => [c.name, c])) as Record<OfficeCharacterName, CastMember>;

export function getLocalizedCharacterName(
  charOrName: CastMember | OfficeCharacterName | string,
  selectedLanguage: string = 'English (EN)'
): string {
  if (!charOrName) return '';
  let member: CastMember | undefined;

  if (typeof charOrName === 'object' && charOrName !== null && 'displayNames' in charOrName) {
    member = charOrName as CastMember;
  } else {
    const raw = typeof charOrName === 'string' ? charOrName : (charOrName as CastMember)?.name || '';
    const key = raw.toLowerCase().trim() as OfficeCharacterName;
    member = CAST_BY_NAME[key];
    if (!member && raw) {
      member = OFFICE_CAST.find((c) => c.name.toLowerCase() === key || c.displayName.toLowerCase() === key);
    }
  }

  if (!member || !member.displayNames) {
    return typeof charOrName === 'string' ? charOrName : (charOrName as CastMember)?.displayName || '';
  }

  const lang = String(selectedLanguage || '').toLowerCase();

  if (lang === 'hi' || lang.includes('hindi') || lang.includes('हिंदी')) {
    return member.displayNames.hi || member.displayName;
  }
  if (lang === 'ta' || lang.includes('tamil') || lang.includes('தமிழ்')) {
    return member.displayNames.ta || member.displayName;
  }
  if (lang === 'te' || lang.includes('telugu') || lang.includes('తెలుగు')) {
    return member.displayNames.te || member.displayName;
  }
  if (lang === 'bn' || lang.includes('bengali') || lang.includes('বাংলা')) {
    return member.displayNames.bn || member.displayName;
  }
  if (lang === 'as' || lang.includes('assamese') || lang.includes('অসমীয়া')) {
    return member.displayNames.as || member.displayName;
  }
  return member.displayNames.en || member.displayName;
}

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

export async function getCastFrames(name: OfficeCharacterName): Promise<Texture[][]> {
  const cached = frameCache.get(name);
  if (cached) return cached;
  const { front, back } = sceneFrameBufs(name);
  const toRow = (bufs: Uint8ClampedArray[]): Texture[] => {
    const [stand, stepL, stepR] = bufs.map(bufToTexture);
    return [
      stand, stepL, stand, stepR,
      stand, stand, stand
    ];
  };

  const downRow = toRow(front);
  const upRow   = toRow(back);
  const rightRow = downRow;
  const grid = [downRow, upRow, rightRow];
  frameCache.set(name, grid);
  return grid;
}
