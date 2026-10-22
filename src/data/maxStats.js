// Character stats at Level 80, without Arc or Console (Cartridge/module) stats.
// Source: in-game character screens, provided by the project owner (Oct 2026).
// Percentages are stored as numbers (83 = 83%). Element DMG bonuses and
// resistances not listed are 0%.
//
// TO REVISIT (Oct 2026) — adjust when new screenshots or corrections come in:
// - Daffodil, Nanally, Hathor, Chiz, Jiuyuan: rows below Break Intensity
//   (Universal DMG, Healing, element DMG/RES) not captured yet; 0 assumed.
// - The eight older entries (Lacrimosa … Blackbird) look like they were taken
//   with an Arc equipped (ATK ~400–550 high, CRIT/Cycle above bare values).
//   Build cards add the Arc on top, so those cards overcount. Retake bare.
// - ATK_GROWTH (7.95x) comes from the five bare screens; recheck once more
//   characters are measured bare.

import { CHARACTERS } from './characters.js';

export const MAX_STATS_LEVEL = 80;

const s = (hp, atk, def, adv, dmg = {}, res = {}) => ({
  hp, atk, def, stamina: 200,
  ...adv,
  healing: 0,
  healingReceived: 0,
  dmg,
  res,
});

const MEASURED = {
  lacrimosa: s(15998, 1192, 909, { critRate: 83, critDmg: 73.6, charge: 100, cycle: 120, breakInt: 60, universal: 11 }, { chaos: 50 }),
  shinku: s(16120, 1206, 897, { critRate: 83, critDmg: 115.6, charge: 100, cycle: 18, breakInt: 0, universal: 9 }, { cosmos: 10 }),
  iroi: s(17210, 1092, 909, { critRate: 15, critDmg: 69.6, charge: 112, cycle: 18, breakInt: 114, universal: 21 }, { anima: 37.5 }),
  zankou: s(15514, 1230, 909, { critRate: 66, critDmg: 181.6, charge: 100, cycle: 130, breakInt: 0, universal: 13 }, { incantation: 10 }),
  zero: s(15150, 1122, 909, { critRate: 40.8, critDmg: 140, charge: 100, cycle: 0, breakInt: 126, universal: 10 }),
  chaos: s(15756, 1132, 921, { critRate: 50.6, critDmg: 158, charge: 100, cycle: 18, breakInt: 72, universal: 15 }),
  sakiri: s(16483, 1034, 909, { critRate: 18, critDmg: 68, charge: 100, cycle: 18, breakInt: 30, universal: 21 }, { incantation: 91.5 }),
  blackbird: s(15514, 1238, 884, { critRate: 74, critDmg: 96, charge: 100, cycle: 18, breakInt: 18, universal: 14 }, { psyche: 37.5 }),
  // Bare Level 80 (nothing equipped), Oct 2026. Rows below Break Intensity
  // (Universal DMG, Healing, DMG bonuses) not captured yet; 0 assumed.
  daffodill: s(16180, 644, 873, { critRate: 5, critDmg: 50, charge: 100, cycle: 0, breakInt: 0, universal: 0 }),
  nanally: s(15998, 636, 909, { critRate: 5, critDmg: 50, charge: 100, cycle: 0, breakInt: 0, universal: 0 }),
  hathor: s(15998, 644, 884, { critRate: 5, critDmg: 50, charge: 100, cycle: 0, breakInt: 0, universal: 0 }),
  chiz: s(15514, 660, 909, { critRate: 5, critDmg: 50, charge: 100, cycle: 0, breakInt: 0, universal: 0 }),
  jiuyuan: s(15635, 652, 909, { critRate: 5, critDmg: 50, charge: 100, cycle: 0, breakInt: 0, universal: 0 }),
};

// Estimated Level 80 HP, ATK and DEF for characters without in-game values yet,
// from their Level 1 stats. Bare Level 80 screens (Daffodil, Nanally, Hathor,
// Chiz, Jiuyuan) show HP and DEF at 12.12x Level 1 and ATK at 7.95x. (An
// earlier 13.2x ATK figure came from screens with an Arc equipped.) Advanced
// stats (CRIT, Cycle, Break, DMG bonuses) can't be estimated and stay null.
// Marked `estimated` so the UI can flag them; replace with in-game values
// when available.
export const HP_DEF_GROWTH = 12.12;
export const ATK_GROWTH = 7.95;
const ESTIMATED = Object.fromEntries(
  CHARACTERS.filter((c) => c.stats && !MEASURED[c.id]).map((c) => [c.id, {
    hp: Math.round(c.stats.hp * HP_DEF_GROWTH),
    atk: Math.round(c.stats.atk * ATK_GROWTH),
    def: Math.round(c.stats.def * HP_DEF_GROWTH),
    stamina: 200,
    critRate: null, critDmg: null, charge: null, cycle: null, breakInt: null, universal: null,
    healing: null, healingReceived: null,
    dmg: {}, res: {},
    estimated: true,
  }]),
);

// Characters with no stats at all yet (upcoming, or just released): the average Level 80
// HP, ATK and DEF of released characters with the same rank and main role
// (falling back to the same rank). Flagged `fromPeers` so the UI says so.
const known = { ...ESTIMATED, ...MEASURED };
const peersOf = (c, sameRole) => CHARACTERS.filter((o) => !o.upcoming && known[o.id] && o.rarity === c.rarity
  && (!sameRole || o.roles[0] === c.roles[0]));
const avg = (list, k) => Math.round(list.reduce((t, o) => t + known[o.id][k], 0) / list.length);
const FROM_PEERS = Object.fromEntries(
  CHARACTERS.filter((c) => !known[c.id]).map((c) => {
    const peers = peersOf(c, true).length ? peersOf(c, true) : peersOf(c, false);
    if (!peers.length) return [c.id, null];
    return [c.id, {
      hp: avg(peers, 'hp'), atk: avg(peers, 'atk'), def: avg(peers, 'def'),
      stamina: 200,
      critRate: null, critDmg: null, charge: null, cycle: null, breakInt: null, universal: null,
      healing: null, healingReceived: null,
      dmg: {}, res: {},
      estimated: true,
      upcoming: !!c.upcoming,
      fromPeers: `${c.rarity}-rank ${peersOf(c, true).length ? `${c.roles[0]} ` : ''}characters`,
    }];
  }).filter(([, v]) => v),
);

export const MAX_STATS = { ...FROM_PEERS, ...ESTIMATED, ...MEASURED };

// Level 80 stats are shown on the site and cards only once confirmed against
// fresh in-game screens (no Arc or Console). Until then the Stats tab shows
// the stats to focus on instead. Add a character's id here to show theirs.
export const CONFIRMED_STATS = new Set([]);
export const confirmedStats = (id) => (CONFIRMED_STATS.has(id) ? MAX_STATS[id] ?? null : null);

// Damage types in the order the game lists them.
export const DMG_TYPES = ['cosmos', 'anima', 'incantation', 'chaos', 'psyche', 'lakshana', 'mental'];
