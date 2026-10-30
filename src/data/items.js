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
  'Skill cards',
  'Arc materials',
  'EXP',
  'Bond gifts',
  'Currency & stamina',
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
        'Heterogeneous Unit or Expansion Core can stand in for missing copies',
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
    get: [
      `Anomaly Hunt: ${b.source}`,
      `${BOXES.hunt.name} (${HUNTER})`,
      'Heterogeneous Unit can stand in for missing copies',
    ],
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

// Skill cards.
for (const [fam, names] of Object.entries(SKILL_BOOKS)) {
  names.forEach((name, i) =>
    add({
      name,
      group: 'Skill cards',
      tier: i + 1,
      text: `${TIER[i]} skill card. Levels Esper skills and unlocks passives.`,
      get: [
        `${BOOK_SOURCE} (Character Pixels)`,
        'Hunter Exchange and city shops',
        ...(i === 0 ? [`${BOXES.books.name} (${HUNTER}; also Circle Bounty)`] : []),
        ...(i < 2 ? [`Character Esper Ability Selection Box ${i ? 'II' : 'I'} (Circle Bounty)`] : []),
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
        ...(i < 2 ? [`Character Esper Ability Selection Box ${i ? 'II' : 'I'} (Circle Bounty)`] : []),
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

// Bond gifts: raise Affection with any character.
// Sources (Oct 2026): Icy Veins item pages; GameWith Circle Bounty guide.
add({
  name: 'A Handwritten Letter',
  group: 'Bond gifts',
  text: 'Gift for any character: +2,000 Affection. Doesn’t count toward the daily gift limit.',
  get: ['Circle Bounty', 'Warp Exchange (60 Warp Pieces)', 'Mall bundles'],
});
add({
  name: 'Eternal Shell Song',
  group: 'Bond gifts',
  text: 'Gift for any character: +400 Affection.',
  get: ['Circle Bounty (free and Elite tracks)'],
});

// Currency and stamina.
add({
  name: 'Beetle Coin',
  group: 'Currency & stamina',
  text: 'Spent on every level-up, ascension and skill upgrade, for Espers and Arcs alike.',
  get: [EXP_SOURCE, 'Events, quests and redeem codes'],
});
add({
  name: 'Fons',
  group: 'Currency & stamina',
  text: 'City money. Pays for life skills and Hunter Exchange items such as selection boxes and Expansion Cores.',
  get: ['Shops, minigames, heists and Realm of Greed'],
});
add({
  name: 'Dreamless Seed',
  group: 'Currency & stamina',
  text: 'Levels life skills (56 to take one from Lv 1 to 5).',
  get: [DREAMLESS_SOURCE],
});

add({
  name: 'Annulith',
  group: 'Currency & stamina',
  text: 'Rare currency. Converts into Solid Dice, Fabricated Dice or Tri-Keys (160 each) and buys more Character Pixels.',
  get: [
    'Fons Limited-Time Shop (100 Fons each, up to 50)',
    'Currency Shop (1 Riftcrystal each)',
    'Circle Bounty Elite track, events and redeem codes',
  ],
});
add({
  name: 'Riftcrystal',
  group: 'Currency & stamina',
  text: 'Paid currency. Exchanges 1 : 1 for Annulith and buys Mall packs.',
  get: ['Top-up packs (real money; first purchase doubled)'],
});
add({
  name: 'Tri-Key',
  group: 'Currency & stamina',
  text: 'Pulls on the Arc banners (Arc Research Program).',
  get: ['Converted from 160 Annulith', 'Events and Mall packs'],
});
add({
  name: 'Character Pixels',
  group: 'Currency & stamina',
  text: 'Stamina for the upgrade stages (Houdinii’s Magic Stage and Schemes, Bubble Can Factory) and weekly boss rewards. Recovers over time up to a cap.',
  get: ['Recovers on its own', 'De-noise Solution', 'Exchange Annulith for more'],
});
add({
  name: 'City Stamina',
  group: 'Currency & stamina',
  text: 'Spent on city activities. Some life skills let you spend extra in their minigame for better rewards.',
  get: ['Recovers over time'],
});
add({
  name: 'Fabricated Dice',
  group: 'Currency & stamina',
  text: 'Rolls on the Standard Board (Strange Encounters) for standard characters and rewards.',
  get: ['Converted from 160 Annulith', 'Warp Exchange, Circle Bounty and events', 'Mall packs'],
});
add({
  name: 'Solid Dice',
  group: 'Currency & stamina',
  text: 'Rolls on the limited character boards.',
  get: ['Converted from 160 Annulith', 'Warp Exchange and events', 'Mall packs'],
});
add({
  name: 'De-noise Solution',
  group: 'Currency & stamina',
  text: 'Restores 60 Character Pixels.',
  get: ['Circle Bounty (free and Elite tracks)', 'Energy Reserve Supply Crate (Mall)'],
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

// Substitute for enemy-drop materials (in-game item text, Oct 2026).
add({
  name: 'Heterogeneous Unit',
  group: 'Selection boxes',
  text: 'Stands in for enemy-drop materials (anomaly materials and Anomaly Hunt drops) you’re short of. Rarer materials take more Units.',
  get: ['Security Office', 'Events', 'Quests'],
});

// Circle Bounty and event boxes. Sources (Oct 2026): Icy Veins item pages;
// GameWith Circle Bounty guide.
const pick = (list) => `Pick one: ${list}.`;
for (const b of [
  {
    name: 'Development EXP Selection Box I',
    text: pick('Senior Hunter Guide ×15, Manhole Crook ×15 (Module EXP), Colorless Dye ×15 or Beetle Coin ×35,000'),
    get: ['Circle Bounty (free track)'],
  },
  {
    name: 'Development EXP Selection Box II',
    text: pick('Elite Hunter Guide ×15, Manhole Boss ×15 (Module EXP), Chaotic Dye ×15 or Beetle Coin ×150,000'),
    get: ['Circle Bounty (Elite track)'],
  },
  {
    name: 'Character Esper Ability Selection Box I',
    text: pick('8 of any tier-1 skill card or tier-1 Arc material'),
    get: ['Circle Bounty (free track)'],
  },
  {
    name: 'Character Esper Ability Selection Box II',
    text: pick('10 of any tier-2 skill card or tier-2 Arc material'),
    get: ['Circle Bounty (Elite track)'],
  },
  {
    name: 'S-Class Standard Character Selection Box',
    text: pick('Sakiri, Hathor, Baicang or Fadia (standard S-rank Espers)'),
    get: ['Events', 'Puka pass'],
  },
  {
    name: 'Arc-light Trove',
    text: pick('Fluff of Fortitude, Ferocity, Finesse, Fleetness or Fearlessness (S-rank Arcs)'),
    get: ['Elite Hunter Supplies (paid Circle Bounty pass) at Bounty Rank 30'],
  },
  {
    name: 'Puka Membership Program S-Class Arc Selection Box',
    text: pick(
      'Reality Refuge, Youthful Fantasy, Good Boy’s Grand Adventure, Camellia Society, Raging Flames, Blow up the Crowd, Tears Beneath the Mask, Eternal Waltz or Song of the Whale',
    ),
    get: ['Puka Membership Program (event)'],
  },
]) {
  add({ group: 'Selection boxes', ...b });
}

export const ITEMS = items;
