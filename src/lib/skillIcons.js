// Official skill, passive, awakening and Resonance icons, where we have them
// (white marks on transparent, in public/icons/skills/<character>/).
// Keys: basic, redirect, ultimate, support, p1, p2, trait, resonance, A1–A6.
// Source: in-game icons provided by the project owner (Nov 2026).
const BASE = import.meta.env.BASE_URL;

const HAVE = {
  blackbird: ['basic', 'redirect', 'ultimate', 'support', 'p1', 'trait', 'resonance', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
};

// Skill types as written in data/skills.js, to their icon keys.
const TYPE_KEY = { 'Basic Attack': 'basic', 'Redirect Skill': 'redirect', Ultimate: 'ultimate', 'Support Skill': 'support' };

/** URL of an icon, or null. `key` is a key above or a skill type ("Ultimate"). */
export function skillIconUrl(characterId, key) {
  const k = TYPE_KEY[key] ?? key;
  return HAVE[characterId]?.includes(k) ? `${BASE}icons/skills/${characterId}/${k}.webp` : null;
}
