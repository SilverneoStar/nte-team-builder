// Character skills and the materials to level them.
// Sources (Oct 2026): GameWith, Icy Veins and neverness.gg character
// pages (skill names, life skills); Icy Veins "profile-skills" pages and item
// "used by" lists (skill-book family and weekly item per character); Oslink max-level
// material guides (per-level table, cross-checked against Icy Veins totals).
// Summaries are short paraphrases; check in-game text for exact numbers.

import { CHARACTER_MATERIALS, FAMILIES } from './ascension.js';

export const SKILL_MAX = 10;
export const LIFE_MAX = 5;

// Skill books: three tiers, dropped in Houdinii's Schemes (also Hunter Exchange,
// selection boxes and city shops).
export const SKILL_BOOKS = {
  pigeon: ['Nestling’s Longing', 'Dove’s Flutter', 'The Olive Branch'],
  fng: ['FNG', 'CO', 'White Rose'],
  expectations: ['First Expectations', 'Known Weariness', 'Black Hat'],
  synchronicity: ['Synchronicity of Thought', 'Resonance of Faith', 'Heart-Racing Night'],
  waves: ['Hesitation of the Waves', 'Suspended Whispers', 'The Second Self'],
};
export const BOOK_SOURCE = 'Houdinii’s Schemes';

// Weekly items from Anomaly Pilgrimage bosses.
export const WEEKLY_ITEMS = {
  'eternal-memory': { name: 'Eternal Memory', source: 'Pilgrimage: Debt Collector' },
  'good-boy-stamp': { name: 'Good Boy Stamp', source: 'Pilgrimage: Morphix' },
  'dress-hem': { name: 'Dress Hem of Vanity', source: 'Pilgrimage: The Never-ending Arachne' },
  // New in 1.5 (official preview stream, Oct 28, 2026).
  'hollow-flowerseed': { name: 'Hollow Flowerseed', source: 'Pilgrimage: Amber Broodmother' },
};

// Cost to raise ONE active skill to each level (the same for every character).
// t = tier of the anomaly family and of the skill books (equal amounts of each).
export const SKILL_LEVEL_COSTS = [
  { level: 2, coins: 2000, tier: 1, qty: 2, weekly: 0 },
  { level: 3, coins: 5000, tier: 1, qty: 3, weekly: 0 },
  { level: 4, coins: 10000, tier: 1, qty: 5, weekly: 0 },
  { level: 5, coins: 20000, tier: 2, qty: 2, weekly: 0 },
  { level: 6, coins: 40000, tier: 2, qty: 3, weekly: 0 },
  { level: 7, coins: 60000, tier: 2, qty: 5, weekly: 1 },
  { level: 8, coins: 80000, tier: 3, qty: 3, weekly: 1 },
  { level: 9, coins: 100000, tier: 3, qty: 5, weekly: 2 },
  { level: 10, coins: 120000, tier: 3, qty: 8, weekly: 4 },
];

// Two passives unlock along the way (skill books only, no anomaly materials).
export const PASSIVE_COSTS = [
  { name: 'Passive 1', coins: 30000, bookTier: 2, books: 2, weekly: 1 },
  { name: 'Passive 2', coins: 40000, bookTier: 3, books: 1, weekly: 2 },
];

// Life skill 1 → 5, total.
export const LIFE_COST = { seeds: 56, fons: 22000 };
// Dreamless Seeds come from the Mall (the in-game shop) and daily tasks
// (project owner, Oct 2026).
export const DREAMLESS_SOURCE = 'Mall and daily tasks';

// [skill book family, weekly item] per character.
const SKILL_MATS = {
  adler: ['expectations', 'dress-hem'],
  akane: ['synchronicity', 'good-boy-stamp'],
  aurelia: ['fng', 'good-boy-stamp'],
  baicang: ['expectations', 'good-boy-stamp'],
  blackbird: ['waves', 'eternal-memory'],
  chaos: ['synchronicity', 'eternal-memory'],
  chiz: ['pigeon', 'good-boy-stamp'],
  daffodill: ['waves', 'dress-hem'],
  edgar: ['pigeon', 'good-boy-stamp'],
  elyms: ['pigeon', 'hollow-flowerseed'],
  exe: ['waves', 'hollow-flowerseed'],
  fadia: ['synchronicity', 'dress-hem'],
  haniel: ['waves', 'dress-hem'],
  hathor: ['synchronicity', 'good-boy-stamp'],
  hotori: ['pigeon', 'dress-hem'],
  iroi: ['fng', 'good-boy-stamp'],
  jiuyuan: ['fng', 'dress-hem'],
  lacrimosa: ['waves', 'dress-hem'],
  linko: ['fng', 'dress-hem'],
  mint: ['fng', 'good-boy-stamp'],
  nanally: ['fng', 'good-boy-stamp'],
  sakiri: ['expectations', 'good-boy-stamp'],
  shinku: ['pigeon', 'dress-hem'],
  skia: ['synchronicity', 'dress-hem'],
  zankou: ['expectations', 'eternal-memory'],
  zero: ['pigeon', 'good-boy-stamp'],
};

const s = (type, name, summary) => ({ type, name, summary });
const B = 'Basic Attack';
const R = 'Redirect Skill';
const U = 'Ultimate';
const S = 'Support Skill';

// Combat skills (max Lv 10) and life skills (max Lv 5) per character.
// Pink Paws Heist life skills: Chiz (Nocturnal Animal, GameWith) and
// Lacrimosa (Exclusive Bat-efit, Icy Veins), Oct 2026.
export const SKILLS = {
  baicang: {
    combat: [
      s(B, 'Walk the Talk', 'Five-hit martial arts string of Incantation damage, with variants after certain hits or dodges.'),
      s(R, 'Generous Guidance', 'Single-target hit after a dodge, or area damage after basic attacks.'),
      s(U, 'Judgment of Autumn', 'Domain that creates Power Words for damage or healing, executes low-HP enemies and blocks one lethal hit.'),
      s(S, 'Break Time Over', 'Writes incantation commands for area damage and creates Silence words.'),
    ],
    life: [s('Life', 'Thriving Daily', 'More shop customers and less ingredient use; at higher levels combos don’t break in Owner’s Selection.')],
  },
  blackbird: {
    combat: [
      s(B, 'Fleeting Shadow', 'Five-hit Psyche combo with Chain Cage that builds Malice.'),
      s(R, 'Netherplume Rite', 'Marks targets with Forsaken Feather so birds attack them over time.'),
      s(U, 'Requies Animarum', 'Witch form: heavy Psyche damage, team ATK and hitstun immunity.'),
      s(S, 'Judgment Upon Me', 'Becomes the Lonesome Bird for Psyche damage and Malice.'),
    ],
    life: [
      s('Life', 'Lucky Encore', 'More daily divination attempts at The Witch’s House.'),
      s('Life', 'Now You Don’t', 'Spend extra City Stamina per Shadow-n-Seek match for better rewards.'),
    ],
  },
  chaos: {
    combat: [
      s(B, 'Pursuit', 'Five-hit Lakshana combo that builds Crime; hold to spend it on Final Verdict.'),
      s(R, 'Doubtmark', 'Shoots and sends his hound, putting Warrant on up to 2 targets so they take more damage.'),
      s(U, 'Retribution', 'Hound pins nearby enemies with Warrant; he enters Dread Echo and builds Crime fast.'),
      s(S, 'Onslaught', 'Upward scythe swing for one hit of Lakshana damage.'),
    ],
    life: [
      s('Life', 'Master Angler', 'Better fishing: more high-value orders, stronger bait, fish tire faster.'),
      s('Exploration', 'Memory / Anchor', 'Place up to 2 Teleport Anchors.'),
    ],
  },
  chiz: {
    combat: [
      s(B, 'Exiled Swordplay', 'Five-hit Cosmos staff combo that gives Grain on hit.'),
      s(R, 'Pink Paws Priority Principle', 'Up to 3 charges of escalating attacks; hold to spend Grain for extra damage.'),
      s(U, 'Zero-Sum Game', 'Area damage, then a Grain Market state where her Redirect Skill cashes in Grain.'),
      s(S, 'Temporary Entry', 'Rides Brown Sugar Boba into enemies for one hit.'),
    ],
    life: [
      s('Life', 'Lobby Manager', 'More shop customers, higher menu prices, less ingredient use.'),
      s('Life', 'Nocturnal Animal', 'Highlights all collectibles in Pink Paws Heist in gold, even when Chiz isn’t on the team.'),
    ],
  },
  daffodill: {
    combat: [
      s(B, 'Still Waters', 'Five-hit twin-blade combo of Chaos damage.'),
      s(R, 'Resonance', 'Stacks when teammates use Support Skills; at full stacks becomes the faster Echoes.'),
      s(U, 'Finale', 'Area Chaos damage, inflicts Insight and unlocks up to 2 Phantom Steps.'),
      s(S, 'Crossed Blades', 'One Chaos slash that also lowers Break Threshold when Discord is applied.'),
    ],
    life: [s('Life', 'The Art of Hospitality', 'More customers, less ingredient use, and customers pick pricier dishes.')],
  },
  zero: {
    combat: [
      s(B, 'Appraisal', 'Five-hit weapon combo of Cosmos damage.'),
      s(R, 'Appraise and Engrave', 'Three strikes, then a leap and an Esper Cannon blast for area damage.'),
      s(U, 'Divide by Zero', 'Sword sweep between singularities for many hits of area Cosmos damage.'),
      s(S, 'Rift Blossom', 'Cuts open and detonates a rift for two area hits.'),
    ],
    life: [s('Life', 'Five-Star Paragon', 'Gifts give more Affinity at lower Bond levels.')],
  },
  fadia: {
    combat: [
      s(B, 'Wordless Rejection', 'Five-hit shield combo of Psyche damage; she takes part of her teammates’ damage.'),
      s(R, 'Existence', 'Marks the highest-HP enemy and reflects damage she takes back at it.'),
      s(U, 'Agony to Euphoria', 'Lilith state: heals herself and turns basic attacks into strong follow-ups.'),
      s(S, 'Outsider', 'Shield swing for area Psyche damage.'),
    ],
    life: [s('Life', 'Good Driving', 'Extra Fons and happier customers in Swift Travel deliveries.')],
  },
  hathor: {
    combat: [
      s(B, 'Rapid Delivery', 'Five-hit martial arts combo of Lakshana damage, with dash and launch variants.'),
      s(R, 'Aerial Command', 'Leaping slash that builds Express Delivery Power; charge it for a wider, tracking hit.'),
      s(U, 'Rider Express', 'Rams enemies on a thorned motorcycle, then Emergency Delivery for speed and ATK.'),
      s(S, 'Impact Point Designation', 'Kicks down from above for area Lakshana damage.'),
    ],
    life: [s('Life', 'Elite Courier', 'Better City Delivery rewards; at max level one delivery a day finishes itself.')],
  },
  hotori: {
    combat: [
      s(B, 'Misty Moon Style', 'Five-hit Cosmos combo that fills her energy meter.'),
      s(R, 'Present Replay', 'Spends energy for area damage and records allies’ Support and Redirect Skills.'),
      s(U, 'World’s Tide', 'Stops time, replays the recorded skills and opens katana combos ending in a Finisher.'),
      s(S, 'Shopkeeper’s Authority', 'Throws her umbrella for one area hit.'),
    ],
    life: [s('Life', 'Treasure Hunt', 'More auction house listings and refreshes for unsold items.')],
  },
  iroi: {
    combat: [
      s(B, 'Collaboration', 'Lambs attack five times for Anima damage and build Imagination.'),
      s(R, 'Self-Identity Extension', 'Healing lambs for the team, an ATK buff, and pulls enemies together.'),
      s(U, '3.8-Billion-Year Mirage', 'Dream gates heal or deal damage based on Imagination; can revive one ally.'),
      s(S, 'Bang!', 'Swings Morpheus for damage, heals all allies and builds Imagination.'),
    ],
    life: [
      s('Life', 'Welcome!', 'More shop visitors and less ingredient use.'),
      s('Life', 'Ride-Along Chat', 'Extra Fons on Swift Travel fares and a higher satisfaction cap.'),
    ],
  },
  jiuyuan: {
    combat: [
      s(B, 'When Secrets Take Shape', 'Five-hit dual-pistol combo of Anima damage that gives Rose Pact Bullets.'),
      s(R, 'Intel Hunter', 'Dashes through and pulls enemies in, applying Lethal Rose Pact.'),
      s(U, 'Final Reckoning', 'Dashes while firing, then explodes and settles every Lethal Rose Pact.'),
      s(S, 'Intel Lock-On', 'Curving bullet for Anima damage and more Rose Pact Bullets.'),
    ],
    life: [s('Life', 'Dealership VIP', 'Vehicles lose less durability and mods cost less labor.')],
  },
  lacrimosa: {
    combat: [
      s(B, 'Sweet and Sour', 'Switches between frying-pan melee and Red Jelly ranged combos.'),
      s(R, 'Morning Tomato', 'Throws an Esper construct for nearby Chaos damage and Nightmare.'),
      s(U, 'Working Day Judgement', 'Truck or car attack, by mode, for heavy area damage and Nightmare.'),
      s(S, 'Microwake', 'Esper constructs hit once for area Chaos damage.'),
    ],
    life: [
      s('Life', 'Chef Tomato', 'Higher prices for dessert dishes and less ingredient use.'),
      s('Life', 'Exclusive Bat-efit', 'Fons and Paw-Paw Coins from Pink Paws Heist +15% (+20% at Lv 2) while she is on the team.'),
    ],
  },
  linko: {
    combat: [
      s(B, 'Poltergeist CQC', 'Five-hit Anima combo that builds Modulation for synced follow-ups.'),
      s(R, 'Full-Frequency Pulse', 'Multi-hit channel, then Xiaozhen or an ally makes a synced strike.'),
      s(U, 'Oversync', 'Resonance Field that syncs up to 3 allies and ends in an area burst.'),
      s(S, 'Spectral Cross', 'Xiaozhen hits an area and sets up synced ally strikes.'),
    ],
    life: [
      s('Life', 'Kitchen Magic', 'More shop customers and less ingredient use.'),
      s('Life', 'Show & Tell', 'More Fons from display cases.'),
    ],
  },
  nanally: {
    combat: [
      s(B, 'Colucci Secret Skill', 'Five-hit Anima claw combo that dodging doesn’t interrupt.'),
      s(R, 'Colucci Howling Technique', 'Area damage around her and a Crit DMG buff.'),
      s(U, 'Colucci Ultimate Technique', 'Area damage and calls Underboss for follow-up attacks.'),
      s(S, 'Justice from Above', 'Spinning kick for area Anima damage.'),
    ],
    life: [s('Life', 'Family Business', 'Higher prices for Main Dish tags and less ingredient use.')],
  },
  sakiri: {
    combat: [
      s(B, 'Kiroumaru Headbutt', 'Five-hit Incantation combo; can ride Kiroumaru to eat weak enemies.'),
      s(R, 'Devour Whole', 'Pulls enemies in and knocks them down, or lifts them by eating gravity.'),
      s(U, 'Feast of Gluttony', 'Gravity slurry for area damage, pins enemies and gives the team ATK.'),
      s(S, 'Squash!', 'Giant Kiroumaru for area damage, with DoT and DEF-shred extras.'),
    ],
    life: [s('Life', 'No Work, No Reward', 'Higher shop prices and less ingredient use; Kiroumaru chases off troublemakers.')],
  },
  shinku: {
    combat: [
      s(B, 'Special Combat Arts', 'Five-hit Cosmos combo that builds Defiant Spirit.'),
      s(R, 'High-Speed Breach', 'Charges in with a multi-hit assault and gains Defiant Spirit.'),
      s(U, 'Crimson Fury', 'Spends Defiant Spirit to enter Surging Crimson for heavy damage.'),
      s(S, 'Breaching Tactics', 'Knee strike for Cosmos damage and Defiant Spirit.'),
    ],
    life: [
      s('Life', 'Sneaking a Break', 'Higher prices and less ingredient use for Beverage tags.'),
      s('Life', 'Always Up for a Challenge', 'Spend extra City Stamina in Mahjong for bigger rewards.'),
    ],
  },
  zankou: {
    combat: [
      s(B, 'Wildfire', 'Five-hit Incantation blade combo; the last hit pulls enemies and gives Hunt.'),
      s(R, 'Sanguine Dash', 'Switches to Illusion Form, applies Heartwrench and lowers Break in an area.'),
      s(U, 'Inferno Flamenco', 'His main damage Ultimate, stronger after Bloodfeast Reverie.'),
      s(S, 'Stoked Flame', 'One hit of Incantation damage.'),
    ],
    life: [
      s('Life', 'Competitive Edge', 'Better Volley Star stats and Weekly Match earnings.'),
      s('Life', 'All In', 'Spend extra City Stamina on Fight Club matches for better rewards.'),
    ],
  },
  // Akane: kit from the CN release (Oct 2026) via Kaiden, mone.gg and CN wikis.
  // Life skill names are translated from the CN client until global names are out.
  akane: {
    combat: [
      s(B, 'Stringblade', 'Up to 4 hits of guitar and sound-blade Lakshana damage that build String Energy (max 30).'),
      s(R, 'Rhythm Wave', 'Tap to mark a target with Overtone or hold for a Reverb Field; at 30 String Energy it fires Synced Resonance.'),
      s(U, 'Sonic Boom', 'A huge hit that starts Solo Cadenza; recast late in it for a second, bigger hit.'),
      s(S, 'Altered Chord', 'A heavy strum: one hit of Lakshana damage that triggers a Reaction.'),
    ],
    life: [
      s('Life', 'House Special', 'More shop traffic and less ingredient use while she works there.'),
      s('Life', 'Shining Idol', 'Unlocks Super Sound rounds on stage, for 1 extra City Stamina each.'),
    ],
  },
  // Version 1.5, from the preview stream's skill showcase (as written up by
  // community guides, Oct 29, 2026). Pre-release: may change at launch.
  elyms: {
    combat: [
      s(B, 'Interference', 'At Weak Connection, hold during Basic Attack: Instant Glitch to trigger Interference for Cosmos damage.'),
      s('Basic Attack (Enhanced)', 'Crosstalk', 'At Medium or Strong Connection, up to 3 attacks with the Dreamworn Terminal for Cosmos damage.'),
      s(R, 'Intermittent Existence', 'Area Cosmos damage; raises Connection to Medium and grants Optical Illusion. Scans targets to set her Ultimate to single-target or area.'),
      s('Redirect Skill (Enhanced)', 'Goodbye to You', 'Area Cosmos damage that spends all Optical Illusion stacks for a higher DMG Ratio; raises Connection from Medium to Strong and rescans targets.'),
      s(U, 'Do You Get Deja Vu', 'Single-target or area form from her scans (area at Weak Connection); stronger Connection means a higher DMG Ratio. Resets Connection to Weak and gives the rest of the team ATK based on her Base ATK; recasting refreshes it.'),
      s(S, 'I’m Here', 'The Dreamworn Terminal deals Cosmos damage; raises Connection from Weak to Medium with Optical Illusion, and rescans targets.'),
    ],
    life: [],
  },
  exe: {
    combat: [
      s(B, 'Brute-Force Hacking', 'The Hand of Y performs a 5-hit combo; the last hit can spend 10 Frames to export 1 Digital Echo.'),
      s(R, 'Data Exfiltration', 'The Hand of Y deals damage and exports up to 5 Digital Echoes, based on the Frames he holds.'),
      s(U, 'Mesh Collision', 'Enters the Shader Compile state: heavy area hits and Digital Echoes from his Frames. In this state every attack can spend Frames to export Digital Echoes.'),
      s(S, null, null),
    ],
    life: [],
  },
  adler: {
    combat: [
      s(B, 'Deliverance', 'Five-hit Incantation combo that gives Karma stacks.'),
      s(R, 'Evil’s Bane', 'A Sunya phantom charges for area damage and DoT and shields the active character.'),
      s(U, 'Tranquility', 'Summons five Sunyas to strike all enemies.'),
      s(S, 'Pristine Reflection', 'Fires a round for area damage and a random debuff through Scorch.'),
    ],
    life: [s('Life', 'Coffee Master', 'Higher café prices, less ingredient use, automatic coffee at higher levels.')],
  },
  aurelia: {
    combat: [
      s(B, 'Cappella', 'Four-hit Psyche combo; can ride jellyfish that fire projectiles.'),
      s(R, 'Cadenza Aria', '12-second empowered state with stronger, wider jellyfish attacks.'),
      s(U, 'Canon Chorus', 'Gathers her jellyfish for six area hits that pull enemies together.'),
      s(S, 'Dissonance', 'Jellyfish strike an area, with bonus hits when Nova ends.'),
    ],
    life: [s('Life', 'Perfect Fit', 'More customers for Beverage tags, less ingredient use and extra tips.')],
  },
  edgar: {
    combat: [
      s(B, 'Combat Practice', 'Five-hit combo of Cosmos damage.'),
      s(R, 'Wild Current', 'Hold to channel damage while healing the lowest-HP teammate.'),
      s(U, 'Finnegan’s Wake', 'Domain that deals area damage and heals for 10 seconds.'),
      s(S, 'Weight of Knowledge', 'Bag swing for area damage that can give Ultimate Energy.'),
    ],
    life: [s('Life', 'Knowledge in Action', 'More shop customers and less ingredient use.')],
  },
  haniel: {
    combat: [
      s(B, 'Genesse Technique', 'Five Psyche magic shots, plus a charged cannon and a plunge.'),
      s(R, 'Silent Moonlit Forest Guardian', 'Deploys Hootie for team ATK; stacks trigger the area attack Ensemble.'),
      s(U, 'A Melody Named Haniel', 'Field that buffs team ATK and turns Ensemble into Symphony.'),
      s(S, 'Easter Egg Time', 'Magic projectile for Psyche damage.'),
    ],
    life: [s('Life', 'A Pro on the Job', 'Higher dish prices and less ingredient use.')],
  },
  mint: {
    combat: [
      s(B, 'Perfect Containment', 'Five-hit Anima combo; hold for a spinning whirlwind.'),
      s(R, 'Ultimate: Super Claws', 'Dashes out and back for two area hits along the path.'),
      s(U, 'Ultimate: Thunderous Whirlwind Slash', 'Wind-powered dual-blade hits ending in a big area slash.'),
      s(S, 'Ultimate: Invincible Tornado Slash', 'Leaping, piercing attack for area damage.'),
    ],
    life: [s('Life', 'Mint Tornado', 'Higher dish prices, less ingredient use and combo tips in Owner’s Selection.')],
  },
  skia: {
    combat: [
      s(B, 'Arresting Art', 'Five-hit Lakshana combo that sends shadow Fang Thrusts after targets.'),
      s(R, 'Shadow Hound Chase', 'Dives into shadows for area damage and keeps gnawing at enemies.'),
      s(U, 'The Pack', 'Waves of area damage and stronger Fang Thrusts for 15 seconds.'),
      s(S, 'Arrest Warrant', 'Shadows bite enemies for area damage.'),
    ],
    life: [s('Life', 'Middle Manager', 'More customers, less ingredient use and more patient customers in Owner’s Selection.')],
  },
};

/**
 * Materials to raise every active skill from `from` to `to`, plus optional
 * passives and the life skill (lifeFrom → LIFE_MAX).
 * Returns [{ name, qty, kind, source? }] with zero amounts dropped, or null.
 */
export function skillCost(characterId, { from = 1, to = SKILL_MAX, skills = 4, passives = true, life = true } = {}) {
  const mats = SKILL_MATS[characterId];
  const asc = CHARACTER_MATERIALS[characterId];
  if (!mats || !asc) return null;
  const [bookKey, weeklyKey] = mats;
  const books = SKILL_BOOKS[bookKey];
  const family = FAMILIES[asc[0]];
  const weekly = WEEKLY_ITEMS[weeklyKey];

  const t = { coins: 0, fam: [0, 0, 0], book: [0, 0, 0], weekly: 0 };
  for (const row of SKILL_LEVEL_COSTS) {
    if (row.level <= from || row.level > to) continue;
    t.coins += row.coins * skills;
    t.fam[row.tier - 1] += row.qty * skills;
    t.book[row.tier - 1] += row.qty * skills;
    t.weekly += row.weekly * skills;
  }
  if (passives) {
    for (const p of PASSIVE_COSTS) {
      t.coins += p.coins;
      t.book[p.bookTier - 1] += p.books;
      t.weekly += p.weekly;
    }
  }

  const out = [
    { name: weekly.name, qty: t.weekly, kind: 'boss', source: weekly.source },
    ...books.map((name, i) => ({ name, qty: t.book[i], kind: `tier${i + 1}`, source: BOOK_SOURCE })),
    ...family.map((name, i) => ({ name, qty: t.fam[i], kind: `tier${i + 1}` })),
    { name: 'Beetle Coin', qty: t.coins, kind: 'coins' },
  ];
  if (life) {
    out.push({ name: 'Dreamless Seed', qty: LIFE_COST.seeds, kind: 'life', source: DREAMLESS_SOURCE });
    out.push({ name: 'Fons', qty: LIFE_COST.fons, kind: 'life', source: 'Life skill' });
  }
  return out.filter((m) => m.qty > 0);
}
