// Console gear: Cartridge sets and Module types.
// Sources (Oct 2026): Mobalytics cartridge guide (set bonuses), thegameswiki
// Console page (module sizes, stat pool), character build guides.
// Bonus text is summarised; check in-game for exact values.
import { ENDGAME } from './endgame.js';

export const CARTRIDGES = [
  { id: 'crimson-twin-butterflies', name: 'Crimson: Twin Butterflies', two: 'Incantation DMG +10%', four: 'ATK +6% each time a nearby enemy takes Incantation DMG from the team, up to 6 stacks (10s).' },
  { id: 'devils-blood-curse', name: "Devil's Blood: Curse", two: 'Psyche DMG +10%', four: 'DMG +18%, rising to 36% against enemies affected by Nova or Stain.' },
  { id: 'diabolos', name: 'Diabolos', two: 'Chaos DMG +10%', four: 'Ignores 12% Chaos RES; 24% for 20s after the wearer takes part in Nova or Scorch.' },
  { id: 'fireflies-and-the-forest', name: 'Fireflies and the Forest', two: 'Anima DMG +10%', four: 'Crit DMG +8% each time a nearby enemy takes Anima DMG from the team, up to 7 stacks (10s).' },
  { id: 'kingdoms-guard', name: "Kingdom's Guard", two: 'DEF +15%', four: 'Shields from the wearer +20%.' },
  { id: 'lost-radiance', name: 'Lost Radiance', two: 'Cosmos DMG +10%', four: 'Ignores 25% enemy DEF for 20s after the wearer casts Ultimate.' },
  { id: 'quiet-manor', name: 'Quiet Manor', two: 'Mental DMG +10%', four: 'Mental DMG +12% per Basic Attack, up to 3 stacks (6s).' },
  { id: 'shadow-creed', name: 'Shadow Creed', two: 'ATK +10%', four: 'ATK +25% for 20s after casting a Skill.' },
  { id: 'speedy-hedgehog', name: 'Speedy Hedgehog', two: 'Charge Efficiency +12%', four: 'All allies’ ATK +15% for 20s after the wearer casts Ultimate.' },
  { id: 'street-boxer', name: 'Street Boxer', two: 'Lakshana DMG +10%', four: 'Crit Rate up; the bonus increases for 20s after the team triggers Remora or Stain.' },
  { id: 'theas-night-tavern', name: "Thea's Night Tavern", two: 'HP +10%', four: 'Healing Bonus +20%.' },
  { id: 'tiny-big-adventure', name: 'Tiny Big Adventure', two: 'HP +10%', four: 'Max HP +4% when taking damage, up to 10 stacks (10s); Ultimate grants all 10.' },
];

export const CARTRIDGE_BY_ID = Object.fromEntries(CARTRIDGES.map((c) => [c.id, c]));

// Recommended Cartridge sets, worked out from each character's element and
// roles (no guide publishes a full per-character list yet):
//   Damage   -> the set that boosts their element's DMG
//   Buff     -> Speedy Hedgehog (team ATK after Ultimate)
//   Survival -> by how they protect the team: healing, shields or HP
// The character's first role decides which set is listed first.
const ELEMENT_SET = {
  cosmos: 'lost-radiance',
  anima: 'fireflies-and-the-forest',
  incantation: 'crimson-twin-butterflies',
  chaos: 'diabolos',
  psyche: 'devils-blood-curse',
  lakshana: 'street-boxer',
};

const SURVIVAL_SET = {
  heal: 'theas-night-tavern',
  shield: 'kingdoms-guard',
  hp: 'tiny-big-adventure',
};

// How each Survival character keeps the team alive.
const SURVIVAL_STYLE = { adler: 'shield', edgar: 'heal', iroi: 'heal', fadia: 'hp' };

export function cartridgesFor(character) {
  // The build guides' ranking when they have one, by set name.
  const named = ENDGAME[character.id]?.cartridges
    ?.map((n) => CARTRIDGES.find((x) => x.name === n)?.id)
    .filter(Boolean);
  if (named?.length) return named;
  const sets = [];
  for (const role of character.roles) {
    if (role === 'Damage') sets.push(ELEMENT_SET[character.element]);
    if (role === 'Buff') sets.push('speedy-hedgehog', ELEMENT_SET[character.element]);
    if (role === 'Survival') sets.push(SURVIVAL_SET[SURVIVAL_STYLE[character.id] ?? 'hp']);
  }
  return [...new Set(sets)];
}

// Main attributes a module can roll (in-game "Possible Attributes" table).
export const MODULE_STATS = [
  'HP%',
  'ATK%',
  'DEF%',
  'CRIT Rate',
  'CRIT DMG',
  'Cycle Intensity',
  'Break Intensity',
  'Healing%',
  'Cosmos DMG%',
  'Anima DMG%',
  'Incantation DMG%',
  'Chaos DMG%',
  'Psyche DMG%',
  'Lakshana DMG%',
  'Mental DMG%',
];

// A Cartridge has 1 main attribute (from MODULE_STATS) and 4 sub attributes.
export const CARTRIDGE_MAIN_STATS = MODULE_STATS;
export const CARTRIDGE_SUB_SLOTS = 4;

// Sub attributes for Cartridges (and later, Console modules).
export const MODULE_SUB_STATS = [
  'HP', 'HP%', 'ATK', 'ATK%', 'DEF', 'DEF%',
  'Break Intensity', 'Cycle Intensity', 'DMG%', 'CRIT Rate', 'CRIT DMG',
];

// Older saved teams used these names; map them to the current list.
export const LEGACY_MODULE_STATS = {
  'ATK %': 'ATK%',
  'HP %': 'HP%',
  'DEF %': 'DEF%',
  'Crit Rate': 'CRIT Rate',
  'Crit DMG': 'CRIT DMG',
};

export const MODULE_SLOTS = 4;

// Stats shown as percentages (everything else is a flat number).
export const isPercentStat = (stat) => /%$/.test(stat) || stat.startsWith('CRIT');

/**
 * Swaps in a new set of Cartridge stats, keeping any values already entered
 * for the same stat (so loading a suggestion doesn't wipe the player's rolls).
 */
export function keepCartValues(prev, next) {
  const old = [prev?.main, ...(prev?.subs ?? [])].filter(Boolean);
  const keep = (x) => x && { ...x, value: x.value || old.find((o) => o.stat === x.stat)?.value || 0 };
  return { main: keep(next.main), subs: next.subs.map(keep) };
}

export const formatStat = (stat, value) => {
  const n = Number(value);
  const text = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, '');
  return `${stat.replace(/%$/, '')} +${text}${isPercentStat(stat) ? '%' : ''}`;
};

// Arc secondary stats are written like "Crit Rate 24%"; turn them into the
// same names the Cartridge lists use, so bonus stats can be added together.
const ARC_SUB_NAMES = {
  'ATK %': 'ATK%', 'HP %': 'HP%', 'DEF %': 'DEF%',
  'Crit Rate %': 'CRIT Rate', 'Crit DMG %': 'CRIT DMG',
};
export function parseArcSub(text) {
  const m = /^(.*?)\s+([\d.]+)(%?)$/.exec(text ?? '');
  if (!m) return null;
  const key = `${m[1]}${m[3] ? ' %' : ''}`;
  return { stat: ARC_SUB_NAMES[key] ?? (m[3] ? `${m[1]}%` : m[1]), value: Number(m[2]) };
}

/** Arc + Cartridge stats added up: [{ stat, value }] in a stable order. */
export function bonusStats(arc, cartStats, extras = []) {
  const totals = new Map();
  const add = (stat, value) => {
    if (!stat || !Number.isFinite(Number(value)) || Number(value) === 0) return;
    totals.set(stat, (totals.get(stat) ?? 0) + Number(value));
  };
  if (arc) {
    add('ATK', arc.atk);
    const sub = parseArcSub(arc.sub);
    if (sub) add(sub.stat, sub.value);
  }
  if (cartStats) {
    if (cartStats.main) add(cartStats.main.stat, cartStats.main.value);
    for (const sub of cartStats.subs ?? []) if (sub) add(sub.stat, sub.value);
  }
  for (const x of extras) add(x.stat, x.value);
  return [...totals].map(([stat, value]) => ({ stat, value: Math.round(value * 100) / 100 }));
}

// Console module (the Tetris-like pieces) attributes, from in-game observation.
// Two main stats, always ATK then HP, and up to 4 random sub stats. Sub slots
// unlock as the piece levels up: Lv 5, 10, 15 and 20.
export const MODULE_MAX_LEVEL = 20;
export const SUB_UNLOCK_LEVELS = [5, 10, 15, 20];
/** A piece's level; pieces saved before levels existed count as max level. */
export const moduleLevel = (stats) => {
  const n = Number(stats?.level);
  return Number.isFinite(n) && stats?.level != null ? Math.max(0, Math.min(MODULE_MAX_LEVEL, n)) : MODULE_MAX_LEVEL;
};
export const unlockedSubs = (level) => SUB_UNLOCK_LEVELS.filter((l) => level >= l).length;

// Flat ATK, flat DEF, Cycle Intensity and Break Intensity roll 10–50;
// percentage stats roll 2.00–9.00%.
const MODULE_RANGES = {
  main: { HP: [100, 1200], ATK: [10, 90] },
  sub: { HP: [1, 500], ATK: [10, 50], DEF: [10, 50], 'Cycle Intensity': [10, 50], 'Break Intensity': [10, 50] },
};
export function moduleRange(kind, stat) {
  if (MODULE_RANGES[kind][stat]) return MODULE_RANGES[kind][stat];
  return isPercentStat(stat) ? [2, 9] : [1, 999];
}

/** "Chaos DMG +10%" (a set's 2-piece text) → { stat: 'Chaos DMG%', value: 10 }. */
export function parseSetBonus(text) {
  const m = /^(.*?)\s*\+([\d.]+)%$/.exec(text ?? '');
  if (!m) return null;
  const name = m[1].trim();
  const map = { ATK: 'ATK%', HP: 'HP%', DEF: 'DEF%' };
  return { stat: map[name] ?? `${name}%`, value: Number(m[2]) };
}
