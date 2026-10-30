// Items for the Glossary's Items section: every material the site tracks, with
// what it's for, how to get it, and which Espers and Arcs use it. Built from
// the material data (ascension, skills, Arc materials, substitutes), so it
// stays in step with the planners.
import { CHARACTER_BY_ID } from './characters.js';
import { ARC_BY_ID } from './arcs.js';
import { BOSS_DROPS, CHARACTER_MATERIALS, FAMILIES } from './ascension.js';
import { BOOK_SOURCE, DREAMLESS_SOURCE, SKILL_BOOKS, SKILL_MATS, WEEKLY_ITEMS } from './skills.js';
import { ARC_DYES, ARC_FAMILIES, ARC_MATERIALS, ARC_MATERIAL_SOURCE } from './arcMaterials.js';
import { EXP_GUIDES, EXP_SOURCE } from './farmList.js';
import { BOXES, EXPANSION_CORE } from './substitutes.js';

export const ITEM_GROUPS = [
  'Anomaly materials',
  'Anomaly Hunt drops',
  'Weekly boss drops',
  'Skill books',
  'Arc materials',
  'EXP',
  'Currency',
  'Selection boxes',
];

const TIER = ['Tier 1', 'Tier 2', 'Tier 3'];
const HUNTER = 'Hunter Exchange, paid in Fons';

const charsWhere = (fn) =>
  Object.keys(CHARACTER_BY_ID)
    .filter(fn)
    .map((id) => ({ kind: 'char', id }));
const arcsWhere = (fn) =>
  Object.keys(ARC_MATERIALS)
    .filter(fn)
    .filter((id) => ARC_BY_ID[id])
    .map((id) => ({ kind: 'arc', id }));

const items = [];
const add = (it) => items.push({ usedBy: [], ...it });

// Anomaly material families: Esper ascension, skills and Arc ascension.
for (const [fam, names] of Object.entries(FAMILIES)) {
  names.forEach((name, i) =>
    add({
      name,
      group: 'Anomaly materials',
      tier: i + 1,
      text: `${TIER[i]} of the ${names[0].split(' ').pop()} family. Used to ascend Espers, level their skills and ascend Arcs.`,
      get: [
        'Drops from open-world anomalies (higher tiers from tougher anomalies)',
        ...(i === 0 ? [`${BOXES.anomaly.name} (${HUNTER}; also Circle Bounty)`] : []),
        'Expansion Core can stand in for missing copies',
      ],
      usedBy: [
        ...charsWhere((id) => CHARACTER_MATERIALS[id]?.[0] === fam),
        ...arcsWhere((id) => ARC_MATERIALS[id][1] === fam),
      ],
    }),
  );
}

// Anomaly Hunt boss drops: Esper ascension.
for (const [key, b] of Object.entries(BOSS_DROPS)) {
  add({
    name: b.name,
    group: 'Anomaly Hunt drops',
    text: 'Boss material for ascending Espers past level 30.',
    get: [`Anomaly Hunt: ${b.source}`, `${BOXES.hunt.name} (${HUNTER})`],
    usedBy: charsWhere((id) => CHARACTER_MATERIALS[id]?.[1] === key),
  });
}

// Weekly boss drops: higher skill levels and passives.
for (const [key, w] of Object.entries(WEEKLY_ITEMS)) {
  add({
    name: w.name,
    group: 'Weekly boss drops',
    text: 'Advanced skill material, needed for skill levels 7 to 10 and both passives.',
    get: [`Anomaly Pilgrimage (weekly boss): ${w.source.replace(/^Pilgrimage: /, '')}`, 'Claimable three times a week'],
    usedBy: charsWhere((id) => SKILL_MATS[id]?.[1] === key),
  });
}

// Skill books.
for (const [fam, names] of Object.entries(SKILL_BOOKS)) {
  names.forEach((name, i) =>
    add({
      name,
      group: 'Skill books',
      tier: i + 1,
      text: `${TIER[i]} skill book. Levels Esper skills and unlocks passives.`,
      get: [
        `${BOOK_SOURCE} (Character Pixels)`,
        'Hunter Exchange and city shops',
        ...(i === 0 ? [`${BOXES.books.name} (${HUNTER}; also Circle Bounty)`] : []),
      ],
      usedBy: charsWhere((id) => SKILL_MATS[id]?.[0] === fam),
    }),
  );
}

// Arc material families.
for (const [fam, names] of Object.entries(ARC_FAMILIES)) {
  names.forEach((name, i) =>
    add({
      name,
      group: 'Arc materials',
      tier: i + 1,
      text: `${TIER[i]} Arc material. Used to ascend Arcs.`,
      get: [
        `${ARC_MATERIAL_SOURCE} (Anomaly Zone, Character Pixels)`,
        ...(i === 0 ? [`${BOXES.arc.name} (${HUNTER}; also Circle Bounty)`] : []),
        'Expansion Core can stand in for missing copies',
      ],
      usedBy: arcsWhere((id) => ARC_MATERIALS[id][0] === fam),
    }),
  );
}

// EXP items.
EXP_GUIDES.forEach((name, i) =>
  add({ name, group: 'EXP', tier: i + 1, text: `${TIER[i]} Character EXP item. Levels Espers up.`, get: [EXP_SOURCE] }),
);
ARC_DYES.forEach((d, i) =>
  add({
    name: d.name,
    group: 'EXP',
    tier: i + 1,
    text: `Arc EXP: +${d.exp.toLocaleString('en-US')} EXP each. Levels Arcs up.`,
    get: ['Houdinii’s Magic Stage (Character Pixels)'],
  }),
);

// Currency.
add({
  name: 'Beetle Coin',
  group: 'Currency',
  text: 'Spent on every level-up, ascension and skill upgrade, for Espers and Arcs alike.',
  get: [EXP_SOURCE, 'Events, quests and redeem codes'],
});
add({
  name: 'Fons',
  group: 'Currency',
  text: 'City money. Pays for life skills and Hunter Exchange items such as selection boxes and Expansion Cores.',
  get: ['Shops, minigames, heists and Realm of Greed'],
});
add({
  name: 'Dreamless Seed',
  group: 'Currency',
  text: 'Levels life skills (56 to take one from Lv 1 to 5).',
  get: [DREAMLESS_SOURCE],
});

// Selection boxes and Expansion Core.
for (const b of [...Object.values(BOXES), EXPANSION_CORE]) {
  add({
    name: b.name,
    group: 'Selection boxes',
    text: b.note,
    get: [`${b.sources.join(', ')}: ${b.cost.toLocaleString('en-US')} Fons each, stock ${b.stock}`],
  });
}

export const ITEMS = items;
