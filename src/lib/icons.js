// Official element and role icons in public/icons/ (see NOTICE.md).
const BASE = import.meta.env.BASE_URL;

export const elementIconUrl = (elementId) => `${BASE}icons/elements/${elementId}.webp`;
// Just the element symbol, cut out of its round badge (transparent background).
export const elementSymbolUrl = (elementId) => `${BASE}icons/element-symbols/${elementId}.webp`;
export const roleIconUrl = (role) => `${BASE}icons/roles/${role.toLowerCase()}.webp`;
export const cartridgeIconUrl = (id) => `${BASE}icons/cartridges/${id}.webp`;
export const arcTypeIconUrl = (type) => `${BASE}icons/arc-types/${type.toLowerCase()}.webp`;

// Material icons we have files for (public/icons/materials/<slug>.webp).
const MATERIAL_ICONS = new Set([
  'beaty',
  'versey',
  'harmony',
  'iron-appleseed',
  'silver-appleseed',
  'golden-appleseed',
  'beginner-drama-core',
  'master-drama-core',
  'collectors-drama-core',
  'flavorless-cold-dessert',
  'plain-cold-dessert',
  'special-cold-dessert',
  'liquid-dream-trial-kit',
  'liquid-dream-travel-kit',
  'liquid-dream-can',
  'light-dye',
  'colorless-dye',
  'chaotic-dye',
  'colorful-ticket-stub',
  'eternal-memory',
  'fons',
  'a-page-from-delusions-shore',
  'beetle-coin',
  'solid-dice',
  'fabricated-dice',
  'city-stamina',
  'heterogeneous-unit',
  'riftcrystal',
  's-class-standard-character-selection-box',
  'eternal-shell-song',
  'de-noise-solution',
  'arc-light-trove',
  'a-handwritten-letter',
  'character-pixels',
  'tri-key',
  'puka-membership-program-s-class-arc-selection-box',
  'character-esper-ability-selection-box-ii',
  'character-esper-ability-selection-box-i',
  'development-exp-selection-box-ii',
  'development-exp-selection-box-i',
  'annulith',
  'anomaly-hunt-material-selection-box',
  'arc-ascension-material-selection-box-i',
  'character-esper-material-selection-box-i',
  'anomaly-material-selection-box-i',
  'black-hat',
  'blurred-numeral',
  'blurred-silhouette',
  'chaos-silhouette',
  'charging-knight-spark-plug',
  'co',
  'confessional-flower-seed',
  'distorted-numeral',
  'doves-flutter',
  'dreamless-seed',
  'dress-hem-of-vanity',
  'elite-hunter-guide',
  'expansion-core',
  'fading-silhouette',
  'first-expectations',
  'fng',
  'good-boy-stamp',
  'heart-racing-night',
  'hesitation-of-the-waves',
  'hollow-flowerseed',
  'known-weariness',
  'lost-whispers',
  'nest-guard-fragment',
  'nestlings-longing',
  'obscure-whispers',
  'paradoxical-whispers',
  'resonance-of-faith',
  'rising-hunter-guide',
  'senior-hunter-guide',
  'suspended-delusions',
  'suspended-whispers',
  'synchronicity-of-thought',
  'tear-of-the-sea',
  'the-olive-branch',
  'the-second-self',
  'transcendent-delusions',
  'unsolved-numeral',
  'water-moon-pick',
  'white-rose',
  'yearning-delusions',
]);

export const materialSlug = (name) =>
  name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** URL of a material's icon, or null when we don't have one yet. */
// Icons replaced under the same file name: a version makes browsers fetch the new copy.
const ICON_VERSION = {
  fons: 2,
  'beetle-coin': 2,
  'character-pixels': 2,
  annulith: 2,
  'anomaly-material-selection-box-i': 2,
  'character-esper-material-selection-box-i': 2,
  'arc-ascension-material-selection-box-i': 2,
  'anomaly-hunt-material-selection-box': 2,
  'expansion-core': 2,
};
export function materialIconUrl(name) {
  const slug = materialSlug(name);
  if (!MATERIAL_ICONS.has(slug)) return null;
  return `${BASE}icons/materials/${slug}.webp${ICON_VERSION[slug] ? `?v=${ICON_VERSION[slug]}` : ''}`;
}
