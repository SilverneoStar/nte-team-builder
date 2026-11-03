// Official skill, passive, awakening and Resonance icons, where we have them
// (white marks on transparent, in public/icons/skills/<character>/).
// Keys: basic, redirect, ultimate, support, p1, p2, trait, A1–A6, and life1/life2
// for the overworld (city) abilities in the order data/skills.js lists them.
// Resonance uses one shared icon for every character (icons/skills/resonance.webp).
// Source: icons from the game (provided by the project owner, Nov 2026);
// which icon belongs to which skill and awakening was checked against the
// character kit pages on NTEBuild (https://www.ntebuild.com).
const BASE = import.meta.env.BASE_URL;
// Bump when icon files are replaced, so browsers fetch the new ones.
const V = 2;

const HAVE = {
  aurelia: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'trait', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1'],
  fadia: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'trait', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1'],
  mint: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1'],
  jiuyuan: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1'],
  hathor: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'trait', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1'],
  skia: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1'],
  daffodill: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1'],
  adler: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1'], // the game reuses Baicang's awakening icons for Adler
  baicang: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1'],
  sakiri: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1'],
  zero: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1'],
  hotori: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1'],
  nanally: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1'],
  chaos: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'trait', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1', 'life2'],
  lacrimosa: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'trait', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1', 'life2'],
  blackbird: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'trait', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1', 'life2'],
  shinku: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'trait', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1', 'life2'],
  iroi: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'trait', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1', 'life2'],
  zankou: ['basic', 'redirect', 'ultimate', 'p1', 'p2', 'trait', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1', 'life2'],
  linko: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'trait', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1', 'life2'],
  akane: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'trait', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'life1', 'life2'],
};

// Skill types as written in data/skills.js, to their icon keys.
const TYPE_KEY = { 'Basic Attack': 'basic', 'Redirect Skill': 'redirect', Ultimate: 'ultimate', 'Support Skill': 'support' };

/** URL of an icon, or null. `key` is a key above or a skill type ("Ultimate"). */
export function skillIconUrl(characterId, key) {
  const k = TYPE_KEY[key] ?? key;
  if (k === 'resonance') return `${BASE}icons/skills/resonance.webp?v=${V}`;
  return HAVE[characterId]?.includes(k) ? `${BASE}icons/skills/${characterId}/${k}.webp?v=${V}` : null;
}

/** True when a character has any official skill icons. */
export const hasSkillIcons = (characterId) => !!HAVE[characterId];
