// Glossary of NTE terms. Reactions are added automatically from elements.js.
// Modes and city terms (Oct 2026): Icy Veins, GameWith, Kaiden and
// AllThings.how guides.
// Each entry: { term, also?, category, text, related? }
export const GLOSSARY_CATEGORIES = [
  'Esper Cycle', 'Reactions', 'Characters', 'Roles & tags', 'Gear', 'Stats', 'Combat', 'Modes', 'City & currency',
];

export const GLOSSARY = [
  // Esper Cycle
  {
    term: 'Esper Cycle',
    category: 'Esper Cycle',
    text: 'The ring of six elements: Cosmos, Anima, Incantation, Chaos, Psyche and Lakshana. Elements next to each other on the ring react when both are applied to the same enemy.',
    related: ['Reaction', 'Esper Meter'],
  },
  {
    term: 'Element',
    also: 'Attribute',
    category: 'Esper Cycle',
    text: 'Every character deals one of six elements. A character’s element decides which reactions they can take part in.',
  },
  {
    term: 'Esper Meter',
    category: 'Esper Cycle',
    text: 'A team gauge that fills during combat. Switching characters with a full meter applies the incoming character’s element and can set off a reaction.',
    related: ['Instant Cycle'],
  },
  {
    term: 'Cycle Intensity',
    category: 'Esper Cycle',
    text: 'A stat that increases the damage dealt by reactions such as Blossom buds or Nova.',
  },
  {
    term: 'Instant Cycle',
    category: 'Esper Cycle',
    text: 'Effects that refill or trigger the Esper Meter immediately, letting a team react far more often. Esper Zero and Blackbird do it with their Redirect Skills, so they don’t need Cycle Intensity to react quickly.',
    related: ['Cycle Intensity'],
  },
  {
    term: 'Reaction',
    category: 'Esper Cycle',
    text: 'The effect created when two neighbouring elements meet on an enemy. There are six pair reactions and two trio reactions that need three neighbouring elements.',
    related: ['Trio reaction'],
  },
  {
    term: 'Trio reaction',
    category: 'Esper Cycle',
    text: 'A stronger reaction that needs three neighbouring elements: Charge (Lakshana, Cosmos, Anima) or Discord (Incantation, Chaos, Psyche).',
  },

  // Characters
  {
    term: 'Esper',
    category: 'Characters',
    text: 'A person with supernatural abilities. Playable characters are Espers, each with a named Esper ability.',
  },
  {
    term: 'Rank',
    also: 'Rarity',
    category: 'Characters',
    text: 'S-rank characters are the rarest; A-rank characters are more common and easier to fully upgrade.',
  },
  {
    term: 'Role',
    category: 'Roles & tags',
    text: 'Each character has an in-game role: Damage, Buff or Survival. Many cover more than one; the first listed is their in-game role and the others are how the community also uses them.',
    related: ['Damage', 'Buff', 'Survival'],
  },
  {
    term: 'Main DPS',
    category: 'Roles & tags',
    text: 'The character who stays on the field the longest and deals most of the team’s damage. Teams are usually built around them.',
    related: ['Burst DPS', 'Sub-DPS'],
  },
  {
    term: 'Awakening',
    also: 'A1 to A6',
    category: 'Characters',
    text: 'Six optional upgrades (A1 to A6) for a character. Each duplicate copy unlocks one awakening slot, and you can turn on any awakenings up to that number, in any order or none at all.',
  },
  {
    term: 'Resonance',
    also: 'R3 and R6',
    category: 'Characters',
    text: 'Two bonuses per character that switch on automatically: R3 with 3 awakenings active and R6 with all 6. R3 usually raises skill levels; R6 is a bigger personal or team bonus.',
  },
  {
    term: 'Ascension',
    category: 'Characters',
    text: 'Raising a character’s level cap. Six ascensions take the cap from 20 to 80, each costing Beetle Coin, a tier of the character’s material family and their Anomaly Hunt boss drop.',
    related: ['Anomaly Hunt', 'Beetle Coin'],
  },
  {
    term: 'Beetle Coin',
    category: 'Characters',
    text: 'The currency spent on ascensions, skill upgrades and Arc upgrades. Taking one character from cap 20 to 80 costs 525,000.',
  },
  {
    term: 'Material family',
    category: 'Characters',
    text: 'Each character ascends with one of four families (Whispers, Silhouette, Numeral or Delusions), used in three tiers as the level cap rises.',
  },
  {
    term: 'Base stats',
    category: 'Characters',
    text: 'A character’s HP, ATK and DEF before gear. This app lists Level 80 values without Arc or Console, as shown on the in-game character screen.',
  },

  // Gear
  {
    term: 'Arc',
    also: 'Weapon',
    category: 'Gear',
    text: 'The equipment slot that works like a weapon. An Arc adds base ATK, a secondary stat and a passive effect. Many S-rank characters have a signature Arc.',
    related: ['Arc type'],
  },
  {
    term: 'Arc type',
    also: 'Arc compatibility',
    category: 'Gear',
    text: 'Each character is compatible with one of five Arc types: Solid, Liquid, Gas, Plasma or Condensate (some sources call it Synthesis). Matching the type is required to equip an Arc.',
  },
  {
    term: 'Console',
    category: 'Gear',
    text: 'A character’s gear board. Modules are placed on it, and the Console grants traits based on how it is filled.',
    related: ['Module', 'Cartridge'],
  },
  {
    term: 'Module',
    category: 'Gear',
    text: 'Shaped gear pieces placed on the Console, each carrying stats. Modules come in different types and shapes, such as vertical, L and Z pieces.',
  },
  {
    term: 'Cartridge',
    category: 'Gear',
    text: 'A gear set. Equipping enough pieces of the same Cartridge set unlocks its 2-piece and 4-piece bonuses.',
  },

  // Combat
  {
    term: 'Break',
    category: 'Combat',
    text: 'Enemies have a break bar. Emptying it staggers them and leaves them open to much higher damage for a short time.',
  },
  {
    term: 'Critical Dodge',
    category: 'Combat',
    text: 'Dodging at the last moment before an attack lands. Some characters follow it with a special counter attack, called a Critical Riposte.',
  },
  {
    term: 'Support Skill',
    category: 'Combat',
    text: 'The move a character performs when switched in, often used to trigger reactions or apply buffs.',
  },
  {
    term: 'DoT',
    also: 'Damage over time',
    category: 'Combat',
    text: 'Damage dealt in repeated ticks, such as Scorch. Some supports increase damage taken from each DoT on an enemy.',
  },

  // Modes
  {
    term: 'Beyond the Rails',
    category: 'Modes',
    also: 'Anomaly Express',
    text: 'Train-themed endgame gauntlet of Stops. From the 6th Stop on, each Stop has Inbound and Outbound halves needing two teams with no character in common. Enemy weaknesses are shown in advance; faster clears earn up to 3 Seals.',
    related: ['Special Route'],
  },
  {
    term: 'Anomaly Hunt',
    category: 'Modes',
    also: 'Map boss',
    text: 'Open-world bosses you can re-fight by spending Character Pixels. The main source of each character’s boss material for ascension, such as Tear of the Sea from Sea Prisoner.',
    related: ['Character Pixels', 'Ascension'],
  },
  {
    term: 'Hethereau',
    category: 'City & currency',
    text: 'The open-world city where NTE takes place.',
  },
  // Roles & tags
  {
    term: 'Damage',
    also: 'DPS role',
    category: 'Roles & tags',
    text: 'Characters whose main job is dealing damage, either on the field for long stretches (Main DPS) or in short bursts when switched in (Burst DPS, Sub-DPS).',
    related: ['Main DPS', 'Burst DPS', 'Sub-DPS'],
  },
  {
    term: 'Buff',
    also: 'Support role',
    category: 'Roles & tags',
    text: 'Characters who make the rest of the team stronger, for example by raising ATK, adding DMG bonuses, lowering enemy resistances or refilling Ultimate energy.',
    related: ['DMG Boost', 'RES Shred'],
  },
  {
    term: 'Survival',
    also: 'Sustain role',
    category: 'Roles & tags',
    text: 'Characters who keep the team alive with healing, shields or damage redirection, so the damage dealers can keep attacking.',
    related: ['Healing', 'Shield', 'DMG Redirection'],
  },
  {
    term: 'Burst DPS',
    category: 'Roles & tags',
    text: 'A damage dealer who does most of their damage in a short window, usually their Ultimate or an enhanced state, then swaps out.',
  },
  {
    term: 'Sub-DPS',
    category: 'Roles & tags',
    text: 'A secondary damage dealer who adds damage alongside the Main DPS, often off-field or through quick swap-ins, and frequently helps trigger reactions.',
  },
  {
    term: 'DMG Boost',
    category: 'Roles & tags',
    text: 'Tag for characters who raise the team’s damage directly, such as ATK buffs or DMG bonuses for allies.',
  },
  {
    term: 'RES Shred',
    category: 'Roles & tags',
    text: 'Lowering an enemy’s resistance to an element, so every hit of that element deals more damage. Works for the whole team.',
  },
  {
    term: 'Healing',
    category: 'Roles & tags',
    text: 'Tag for characters who restore allies’ HP. Their healing usually scales with their HP or a Healing Bonus stat.',
    related: ['Healing Bonus'],
  },
  {
    term: 'Shield',
    category: 'Roles & tags',
    text: 'Tag for characters who protect allies with a barrier that absorbs damage. Shield strength usually scales with DEF or HP.',
  },
  {
    term: 'DMG Redirection',
    category: 'Roles & tags',
    text: 'Taking damage aimed at allies onto yourself, or turning damage taken into another resource, so the team survives longer.',
  },
  {
    term: 'Control',
    also: 'Crowd control',
    category: 'Roles & tags',
    text: 'Effects that limit what enemies can do: pulling them together, stunning, suppressing, knocking them into the air or slowing them. Most useful against groups; many bosses resist it.',
  },
  {
    term: 'Follow-up Attack',
    category: 'Roles & tags',
    text: 'An extra attack a character makes automatically after a condition is met, such as an ally’s skill or a set number of hits, without using a skill of their own.',
  },
  {
    term: 'Break Boost',
    category: 'Roles & tags',
    text: 'Tag for characters who help empty enemies’ break bars faster or make breaks deal more damage.',
    related: ['Break', 'Break Intensity'],
  },
  {
    term: 'Melee',
    category: 'Roles & tags',
    text: 'Fights up close. Melee characters usually need to stay near enemies and dodge well.',
  },

  // Gear
  {
    term: 'Signature Arc',
    category: 'Gear',
    text: 'The Arc made for a specific character, usually their best option. Some A-rank characters also have an S-rank signature, such as Haniel and Aurelia.',
  },
  {
    term: 'Arc copies',
    also: 'M1 to M5',
    category: 'Gear',
    text: 'Extra copies of the same Arc strengthen its passive. M1 is a single copy; M5 is the maximum, with four duplicates.',
  },
  {
    term: 'Set bonus',
    category: 'Gear',
    text: 'A Cartridge set’s effect, unlocked when 2 and then 4 modules on the Console use one of that set’s four shapes.',
    related: ['Cartridge', 'Module'],
  },
  {
    term: 'Module type',
    also: 'Type II, III, IV',
    category: 'Gear',
    text: 'Modules come in sizes of 2, 3 and 4 squares (Type II, III and IV). Bigger types carry bigger stats, and each character gets a bonus for every module of one Type they equip.',
  },
  {
    term: 'Main and sub stats',
    category: 'Gear',
    text: 'A Cartridge has 1 main stat and 4 sub stats; a module has 2 main stats (flat ATK and HP) and 4 sub stats. Sub stats switch on at levels 5, 10, 15 and 20.',
  },

  // Stats
  {
    term: 'CRIT Rate',
    category: 'Stats',
    text: 'The chance for a hit to be a critical hit. Anything above 100% is wasted.',
    related: ['CRIT DMG'],
  },
  {
    term: 'CRIT DMG',
    category: 'Stats',
    text: 'How much extra damage a critical hit deals. Usually raised once CRIT Rate is high enough.',
  },
  {
    term: 'Element DMG Bonus',
    also: 'e.g. Chaos DMG Bonus',
    category: 'Stats',
    text: 'Increases damage of one element only. A common Cartridge main stat for damage dealers of that element.',
  },
  {
    term: 'Universal DMG Bonus',
    also: 'DMG%',
    category: 'Stats',
    text: 'Increases all damage a character deals, whatever the element.',
  },
  {
    term: 'Break Intensity',
    category: 'Stats',
    text: 'Raises how much a character’s hits fill enemies’ break bars and how hard breaks hit.',
    related: ['Break'],
  },
  {
    term: 'Charge Efficiency',
    category: 'Stats',
    text: 'How quickly a character refills Ultimate energy. Higher values mean Ultimates come up more often.',
  },
  {
    term: 'Healing Bonus',
    category: 'Stats',
    text: 'Increases the healing a character gives. Healing Received Bonus increases the healing they get from others.',
  },

  // Modes
  {
    term: 'Special Route',
    also: 'Circles',
    category: 'Modes',
    text: 'The rotating half of Beyond the Rails: 12 Stops that reset about every two weeks with a new buff. Each season is named after a Circle, such as Waxing or Fracture.',
  },
  {
    term: 'Hunter’s Crucible',
    category: 'Modes',
    text: 'Recurring limited event: a boss score attack where you raise difficulty and add modifiers for a higher score and more rewards.',
  },
  {
    term: 'Anomaly Pilgrimage',
    also: 'Weekly bosses',
    category: 'Modes',
    text: 'Harder bosses such as Morphix (and Amber Broodmother from 1.5), claimable three times a week with Character Pixels, for advanced skill upgrade materials.',
  },
  {
    term: 'Anomaly Zones',
    also: 'Material stages',
    category: 'Modes',
    text: 'Stages that cost Character Pixels for upgrade materials: Houdinii’s Magic Stage (character EXP, Beetle Coin, Arc EXP), Houdinii’s Schemes (skill materials) and Bubble Can Factory (Arc ascension).',
    related: ['Rabbit Hole'],
  },
  {
    term: 'Rabbit Hole',
    category: 'Modes',
    text: 'The Anomaly Zone for Console gear: it drops Cartridges and Carrota, which is spent on Rewind to roll modules.',
  },
  {
    term: 'Anomaly Commissions',
    category: 'Modes',
    text: 'Combat and puzzle missions picked up around the map, rewarding EXP, Annulith, Fons and materials. High-Risk Commissions are harder, timed versions that give Peril Hunt Medals.',
  },
  {
    term: 'Realm of Greed',
    category: 'Modes',
    text: 'A weekly 90-second damage race against the boss Mammon, paying Fons based on damage. Unlocked through Ebisu’s Auction House.',
  },
  {
    term: 'Pink Paws Heist',
    category: 'Modes',
    text: 'A 12-minute heist at the Pink Paws Bank: grab loot, avoid getting hit and escape in time for Fons and Paw-Paw Coins. Other players in your world can join. Chiz and Lacrimosa have life skills for it.',
  },
  {
    term: '999 Nights',
    category: 'Modes',
    text: 'A tabletop-RPG-style side mode added in 1.2, with its own classes, gear and difficulties.',
  },
  {
    term: 'Co-op',
    also: 'Multiplayer',
    category: 'Modes',
    text: 'Up to 4 players can explore a shared world, fight anomalies and play some city activities together. Story quests are single-player.',
  },

  // City & currency
  {
    term: 'Character Pixels',
    also: 'Stamina',
    category: 'City & currency',
    text: 'The energy spent on Anomaly Hunts, Anomaly Zones and weekly bosses. It refills over time.',
  },
  {
    term: 'City Stamina',
    category: 'City & currency',
    text: 'A separate weekly allowance spent on city activities for Fons. Unused points don’t carry over.',
  },
  {
    term: 'Fons',
    category: 'City & currency',
    text: 'The city money earned from shops, minigames, heists and Realm of Greed. Also used for life skills.',
  },
  {
    term: 'Annulith',
    category: 'City & currency',
    text: 'A currency earned from endgame modes, commissions and events.',
  },
  {
    term: 'Tycoon Level',
    category: 'City & currency',
    text: 'Your progress in city life, raised by earning Fons. Higher levels unlock activities such as cafes and Pink Paws Heist.',
  },
  {
    term: 'Hethereau Hobbies',
    category: 'City & currency',
    text: 'City minigames such as Mahjong, racing, deliveries, Fight Club and fishing that spend City Stamina for Fons.',
  },
  {
    term: 'The Cafe by Origen',
    category: 'City & currency',
    text: 'Cafe management: buy locations, set menus and assign staff for passive Fons. Some characters’ life skills improve it.',
  },
  {
    term: 'Ebisu’s Auction House',
    category: 'City & currency',
    text: 'Weekly auctions for collectibles, character materials and Arc items.',
  },
  {
    term: 'Life skill',
    category: 'City & currency',
    text: 'A character’s non-combat skill that helps with city activities, such as better shop prices or extra heist rewards.',
    related: ['Dreamless Seed'],
  },
  {
    term: 'Dreamless Seed',
    category: 'City & currency',
    text: 'The item used, with Fons, to level up life skills. Bought from the Mall (the in-game shop) and earned from daily tasks.',
    related: ['Life skill', 'Fons'],
  },
];
