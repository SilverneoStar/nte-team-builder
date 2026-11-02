// Official skill, passive, awakening and Resonance icons, where we have them
// (white marks on transparent, in public/icons/skills/<character>/).
// Keys: basic, redirect, ultimate, support, p1, p2, trait, A1–A6.
// Resonance uses one shared icon for every character (icons/skills/resonance.webp).
// Source: icons from the game (provided by the project owner, Nov 2026);
// which icon belongs to which skill and awakening was checked against the
// character kit pages on NTEBuild (https://www.ntebuild.com).
const BASE = import.meta.env.BASE_URL;
// Bump when icon files are replaced, so browsers fetch the new ones.
const V = 2;

const HAVE = {
  blackbird: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'trait', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
  zankou: ['basic', 'redirect', 'ultimate', 'p1', 'p2', 'trait', 'A1', 'A2', 'A6'], // A3–A5 to come
  linko: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'trait', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
  akane: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'p2', 'trait', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
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
