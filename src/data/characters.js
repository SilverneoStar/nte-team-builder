// Character roster. Update this file when a new patch adds characters.
// Sources (Oct 2026): neverness.gg and Icy Veins character lists (rank, element,
// role, arc type; some sources call Condensate "Synthesis"); Dexerto wiki profiles (faction, Esper ability, role tags,
// Level 1 base stats, kept for reference; role tags checked against in-game character screens, Oct 2026; the app shows Level 80 stats from maxStats.js). Fields set to null are not yet published by those sources.
//
// roles: the in-game role comes first; extra roles reflect what community
// guides use the character for (e.g. Hotori is a Buffer who also burst-damages).
// "unit" is a squad inside the faction (e.g. ETD-6 in the Bureau of Anomaly Control).
// "formerFaction" is shown with a "Former" tag.
// "version": the game version the character was released in (launch is 1.0;
// 1.1+ from the banner history; upcoming ones are leaked and may change; null = unknown).
// "upcoming: true" hides a character unless the "Show upcoming" filter is on.
export const DATA_VERSION = '1.4';

export const ARC_TYPES = ['Solid', 'Liquid', 'Gas', 'Plasma', 'Condensate'];

const stats = (hp, atk, def) => ({ hp, atk, def, critRate: 5, critDmg: 50 });

export const CHARACTERS = [
  // S-rank
  {
    id: 'baicang', name: 'Baicang', rarity: 'S', version: '1.0', element: 'incantation', roles: ['Damage'],
    arcType: 'Condensate', faction: 'Bureau of Anomaly Control', unit: 'ETD-4', ability: 'Verdict and Autumn',
    tags: ['Main DPS', 'DoT'], stats: stats(1370, 81, 66),
  },
  {
    id: 'blackbird', name: 'Blackbird', rarity: 'S', version: '1.4', element: 'psyche', roles: ['Damage', 'Buff'],
    arcType: 'Gas', faction: 'Yggash Court', ability: 'Naenia Merula',
    tags: ['Instant Cycle', 'Main DPS', 'DMG Boost'], stats: null,
  },
  {
    id: 'chaos', name: 'Chaos', rarity: 'S', version: '1.1', element: 'lakshana', roles: ['Damage'],
    arcType: 'Condensate', faction: 'Bureau of Anomaly Control', unit: 'ETD-6', ability: 'In the beginning, none could tell heaven from earth.',
    tags: ['Main DPS'], stats: null,
  },
  {
    id: 'chiz', name: 'Chiz', rarity: 'S', version: '1.0', element: 'cosmos', roles: ['Damage'],
    arcType: 'Gas', faction: 'Dvořák Family', ability: 'A World of Dew',
    tags: ['Main DPS'], stats: stats(1280, 83, 75),
  },
  {
    id: 'daffodill', name: 'Daffodill', rarity: 'S', version: '1.0', element: 'chaos', roles: ['Damage'],
    arcType: 'Liquid', faction: 'Eibon Antique Shop', ability: 'Thousand Blades, Thousand Eyes',
    tags: ['Burst DPS', 'Break Boost'], stats: stats(1335, 81, 72),
  },
  {
    id: 'zero', name: 'Esper Zero', rarity: 'S', version: '1.0', element: 'cosmos', roles: ['Damage'],
    arcType: 'Solid', faction: 'Eibon Antique Shop', ability: 'Zeroth Sense',
    tags: ['Burst DPS', 'Instant Cycle'], stats: stats(1250, 85, 75),
  },
  {
    id: 'fadia', name: 'Fadia', rarity: 'S', version: '1.0', element: 'psyche', roles: ['Survival', 'Damage'],
    arcType: 'Condensate', faction: 'Bureau of Anomaly Control', unit: 'ETD-4', ability: 'Lilith',
    tags: ['DMG Redirection'], stats: stats(1410, 75, 75),
  },
  {
    id: 'hathor', name: 'Hathor', rarity: 'S', version: '1.0', element: 'lakshana', roles: ['Damage', 'Buff'],
    arcType: 'Plasma', faction: 'Sterry Express', ability: "Wanderer's Pact",
    tags: ['Burst DPS'], stats: stats(1320, 81, 73),
  },
  {
    id: 'hotori', name: 'Hotori', rarity: 'S', version: '1.0', element: 'cosmos', roles: ['Buff', 'Damage'],
    arcType: 'Solid', faction: 'Eibon Antique Shop', ability: 'Duino Elegies',
    tags: ['Burst DPS', 'DMG Boost'], stats: stats(1330, 82, 70),
  },
  {
    id: 'iroi', name: 'Iroi', rarity: 'S', version: '1.2', element: 'anima', roles: ['Survival', 'Buff'],
    arcType: 'Liquid', faction: 'Bureau of Anomaly Control', unit: 'CSU-2', ability: 'Infant Dream',
    tags: ['Healing', 'DMG Boost'], stats: null,
  },
  {
    id: 'jiuyuan', name: 'Jiuyuan', rarity: 'S', version: '1.0', element: 'anima', roles: ['Damage', 'Survival'],
    arcType: 'Solid', faction: 'Sterry Express', ability: 'Ordinance of Cycles',
    tags: ['Burst DPS', 'Control'], stats: stats(1290, 82, 75),
  },
  {
    id: 'lacrimosa', name: 'Lacrimosa', rarity: 'S', version: '1.1', element: 'chaos', roles: ['Damage'],
    arcType: 'Liquid', faction: 'Bureau of Anomaly Control', unit: 'ETD-4', ability: 'Requiem',
    tags: ['Main DPS', 'DoT'], stats: stats(1320, 80, 75),
  },
  {
    id: 'linko', name: 'Linko', rarity: 'S', version: '1.3', element: 'anima', roles: ['Damage', 'Buff'],
    arcType: 'Plasma', faction: 'Bureau of Anomaly Control', unit: 'ETD-6', ability: 'Telepathy',
    tags: ['Sub-DPS', 'RES Shred'], stats: null,
  },
  {
    id: 'nanally', name: 'Nanally', rarity: 'S', version: '1.0', element: 'anima', roles: ['Damage'],
    arcType: 'Plasma', faction: 'Eibon Antique Shop', ability: 'Genius Ichi-daime: Earth Flip',
    tags: ['Main DPS', 'Follow-up Attack'], stats: stats(1320, 80, 75),
  },
  {
    id: 'sakiri', name: 'Sakiri', rarity: 'S', version: '1.0', element: 'incantation', roles: ['Buff'],
    arcType: 'Gas', faction: 'Eibon Antique Shop', ability: 'Ghosteater',
    tags: ['Control', 'DMG Boost'], stats: stats(1360, 78, 75),
  },
  {
    id: 'shinku', name: 'Shinku', rarity: 'S', version: '1.2', element: 'cosmos', roles: ['Damage'],
    arcType: 'Condensate', faction: 'Bureau of Anomaly Control', unit: 'CSU-2', ability: 'Moonlit Crimson Dragon',
    tags: ['Main DPS'], stats: null,
  },
  {
    id: 'zankou', name: 'Zankou', rarity: 'S', version: '1.3', element: 'incantation', roles: ['Damage'],
    arcType: 'Gas', faction: null, formerFaction: 'The Scarlet Letter', ability: 'Eye of Delusion',
    tags: ['Main DPS', 'DoT', 'Follow-up Attack'], stats: null,
  },
  {
    id: 'akane', name: 'Akane Rin', rarity: 'S', version: '1.4', element: 'lakshana', roles: ['Damage'],
    arcType: 'Liquid', faction: 'StarSign', ability: 'Unwritten Star',
    tags: ['Main DPS'], stats: null,
  },
  // Version 1.5 drip-marketing reveals. Arc type and kit not published yet.
  {
    id: 'elyms', name: 'Elyms', rarity: 'S', version: null, element: 'cosmos', roles: ['Damage'],
    arcType: null, faction: 'Bureau of Anomaly Control', unit: 'ETD-6', ability: null,
    tags: ['Melee'], stats: null, upcoming: true,
  },
  {
    id: 'exe', name: 'Exe', rarity: 'S', version: null, element: 'chaos', roles: ['Damage'],
    arcType: null, faction: 'Bureau of Anomaly Control', unit: 'ETD-6', ability: null,
    tags: [], stats: null, upcoming: true,
  },
  // Version 1.6 (expected): shown in the official 1.4 preview stream
  // (Pukaland Fest) with voice actors and wallpapers. Kit leaks say Ellie deals
  // Incantation DMG; Nitsa is an ETD reserve, element not known yet.
  {
    id: 'ellie', name: 'Ellie', rarity: '?', version: '1.6', element: 'incantation', roles: [],
    arcType: null, faction: null, ability: null,
    tags: [], stats: null, upcoming: true,
  },
  {
    id: 'nitsa', name: 'Nitsa', rarity: '?', version: '1.6', element: 'unknown', roles: [],
    arcType: null, faction: 'Bureau of Anomaly Control', unit: 'ETD Reserve', ability: null,
    tags: [], stats: null, upcoming: true,
  },
  // A-rank
  {
    id: 'adler', name: 'Adler', rarity: 'A', version: '1.0', element: 'incantation', roles: ['Survival'],
    arcType: 'Condensate', faction: 'Eibon Antique Shop', ability: 'Ayatana',
    tags: ['Shield', 'DoT'], stats: stats(1180, 55, 82),
  },
  {
    id: 'aurelia', name: 'Aurelia', rarity: 'A', version: '1.0', element: 'psyche', roles: ['Damage'],
    arcType: 'Plasma', faction: 'Tamamochi Street Resident Association', ability: 'Nostalgia for Youth',
    tags: ['Main DPS'], stats: stats(980, 76, 60),
  },
  {
    id: 'edgar', name: 'Edgar', rarity: 'A', version: '1.0', element: 'cosmos', roles: ['Survival'],
    arcType: 'Liquid', faction: 'Eibon Antique Shop', ability: "Finnegan's Vigil",
    tags: ['Healing'], stats: stats(1350, 53, 68),
  },
  {
    id: 'haniel', name: 'Haniel', rarity: 'A', version: '1.0', element: 'psyche', roles: ['Buff', 'Damage'],
    arcType: 'Solid', faction: 'Sterry Express', ability: 'Amazing Grace',
    tags: ['DMG Boost'], stats: stats(1130, 62, 70),
  },
  {
    id: 'mint', name: 'Mint', rarity: 'A', version: '1.0', element: 'anima', roles: ['Damage'],
    arcType: 'Liquid', faction: 'Bureau of Anomaly Control', unit: 'CSU-2', ability: 'Nya-choo!',
    tags: ['Main DPS'], stats: stats(1000, 75, 60),
  },
  {
    id: 'skia', name: 'Skia', rarity: 'A', version: '1.0', element: 'lakshana', roles: ['Damage'],
    arcType: 'Gas', faction: 'Bureau of Anomaly Control', unit: 'ETD-4', ability: 'Faust',
    tags: ['Main DPS'], stats: stats(1100, 70, 55),
  },
];

export const CHARACTER_BY_ID = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));
