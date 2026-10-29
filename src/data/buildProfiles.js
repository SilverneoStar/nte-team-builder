// Suggested Cartridge stats, worked out per character instead of per role.
//
// Every stat gets a weight from:
//   1. the character's roles (main role in full, extra roles at 40%),
//   2. a profile for characters whose kit doesn't match their role label
//      (e.g. a Damage character who is really there to Break),
//   3. their Level 80 stats (a CRIT Rate already in the 70s–80s puts CRIT DMG first),
//   4. the chosen Cartridge set (what its bonuses already cover or reward).
// The highest-weight main stat and the top 4 sub stats are suggested, with the
// reasons shown next to them.
//
// When the build guides give a "Best Stats" priority for the character (data/endgame.js)
// it is used first; the weights only fill gaps. Profiles marked `override`
// keep the project owner's reading of the kit instead, and show the guide's
// priority as an alternative.
//
// Profiles: from the project owner's notes (Oct 2026).
import { CHARACTER_BY_ID } from './characters.js';
import { ELEMENT_BY_ID } from './elements.js';
import { MAX_STATS, MAX_STATS_LEVEL } from './maxStats.js';
import { CARTRIDGE_BY_ID, CARTRIDGE_MAIN_STATS, MODULE_SUB_STATS } from './gear.js';
import { ENDGAME, parsePriority } from './endgame.js';

// focus: 'break' | 'atk-scaling'
// instantCycle: the kit triggers the Esper Cycle instantly (redirect skill),
//   so Cycle Intensity does nothing for reactions.
// main / subs: fixed priorities from a guide, used as given.
export const BUILD_PROFILES = {
  daffodill: {
    override: true,
    focus: 'break',
    note: 'Damage on paper, but mostly there to amplify Break for the team, so Break Intensity comes first.',
  },
  iroi: {
    override: true,
    focus: 'atk-scaling',
    note: 'Her team buff scales with her own ATK, so ATK stats come before survival stats.',
  },
  zero: {
    instantCycle: true,
    note: 'Her redirect skill triggers the Cycle instantly, so Cycle Intensity isn’t needed.',
  },
  blackbird: {
    instantCycle: true,
    note: 'Her redirect skill triggers the Cycle instantly, so Cycle Intensity isn’t needed.',
  },
  // Pre-release (1.5 preview stream tags): early picks until the kits are out.
  elyms: {
    instantCycle: true,
    note: 'Instant Cycle, so Cycle Intensity isn’t needed. Her Ultimate gives the team ATK based on her own Base ATK, so ATK% stays high. An early pick until her full kit is out.',
  },
  exe: {
    note: 'An early pick from the 1.5 preview: his hits build Frames that his skills spend on Digital Echoes, and his Rating rises as he keeps attacking. Revisit once his full kit is out.',
  },
};

// Role weights. 'EL' stands for the character's own element DMG% (main stat only).
// For Damage it edges out CRIT DMG as the main stat, matching the game's own recommendations.
const ROLE_WEIGHTS = {
  Damage: {
    'CRIT DMG': 10, 'CRIT Rate': 10, EL: 11.5, 'ATK%': 8, 'DMG%': 7, 'Cycle Intensity': 4, ATK: 3, 'Break Intensity': 2,
  },
  Buff: {
    'ATK%': 10, 'Cycle Intensity': 8, 'CRIT Rate': 5, 'HP%': 4, ATK: 4, 'DMG%': 3, EL: 3,
  },
  Survival: {
    'HP%': 10, 'DEF%': 7, 'Cycle Intensity': 6, HP: 5, DEF: 3,
  },
};
const SECONDARY = 0.4;

const SUB_SET = new Set(MODULE_SUB_STATS);
const MAIN_SET = new Set(CARTRIDGE_MAIN_STATS);

/**
 * Suggested Cartridge stats for a character and (optional) Cartridge set.
 * Returns { main, subs: [4 stats], reasons: [string] }.
 */
export function recommendStats(characterOrId, cartridgeId = null) {
  const c = typeof characterOrId === 'string' ? CHARACTER_BY_ID[characterOrId] : characterOrId;
  const el = c.element ? `${ELEMENT_BY_ID[c.element].name} DMG%` : null;
  const profile = BUILD_PROFILES[c.id] ?? {};
  const reasons = [];
  // Reasons that only show when their stat ends up in the picks.
  const tied = [];
  const w = new Map();
  const add = (stat, n) => {
    const key = stat === 'EL' ? el : stat;
    if (key) w.set(key, (w.get(key) ?? 0) + n);
  };

  // 1. Roles
  c.roles.forEach((role, i) => {
    for (const [stat, n] of Object.entries(ROLE_WEIGHTS[role] ?? {})) add(stat, n * (i === 0 ? 1 : SECONDARY));
  });
  // Adler shields with DEF.
  if (c.id === 'adler') { add('DEF%', 5); add('HP%', -2); }

  // 2. Profile
  if (profile.note) reasons.push(profile.note);
  if (profile.focus === 'break') {
    add('Break Intensity', 14);
    add('CRIT Rate', -4);
    add('CRIT DMG', -4);
    add('EL', -3);
  }
  if (profile.focus === 'atk-scaling') {
    add('ATK%', 9);
    add('ATK', 5);
    add('HP%', -2);
  }

  // 3. Level 80 stats
  const ms = MAX_STATS[c.id];
  const usesCrit = (w.get('CRIT DMG') ?? 0) >= 6;
  if (ms?.critRate != null && usesCrit && profile.focus !== 'break') {
    if (ms.critRate >= 70) {
      add('CRIT Rate', -4);
      add('CRIT DMG', 1);
      reasons.push(`Base CRIT Rate is already ${ms.critRate}% at Lv ${MAX_STATS_LEVEL}, so CRIT DMG comes before CRIT Rate.`);
    } else if (ms.critRate <= 25) {
      add('CRIT Rate', 2);
      reasons.push(`Base CRIT Rate is only ${ms.critRate}% at Lv ${MAX_STATS_LEVEL}, so CRIT Rate is worth more.`);
    }
  }
  if (ms?.breakInt != null && ms.breakInt >= 100 && profile.focus !== 'break') {
    add('Break Intensity', 3);
    tied.push(['Break Intensity', `High base Break Intensity (${ms.breakInt} at Lv ${MAX_STATS_LEVEL}) makes more of it useful.`]);
  }

  // 4. Cartridge set
  const cart = cartridgeId && CARTRIDGE_BY_ID[cartridgeId];
  if (cart) {
    const text = `${cart.two} ${cart.four}`;
    if (/crit rate up/i.test(cart.four)) {
      add('CRIT Rate', -2);
      reasons.push(`${cart.name}’s 4-piece already raises CRIT Rate.`);
    }
    if (/healing bonus/i.test(text)) {
      add('Healing%', 9);
      tied.push(['Healing%', `${cart.name} rewards healing, so Healing Bonus is a good main stat.`]);
    }
    if (/shield/i.test(text)) {
      add('DEF%', 3);
      tied.push(['DEF%', `${cart.name} boosts shields, which scale with DEF.`]);
    }
    if (/break/i.test(text)) add('Break Intensity', 3);
  }

  // Instant Cycle overrides everything else for Cycle Intensity.
  if (profile.instantCycle) w.set('Cycle Intensity', 0);


  const ranked = (pool) => [...w].filter(([s, n]) => pool.has(s) && n > 0).sort((a, b) => b[1] - a[1]).map(([s]) => s);

  // The guide's "Best Stats" priority, minus Cycle Intensity for instant-Cycle kits.
  const guide = ENDGAME[c.id];
  const fromGuide = (text, pool) => parsePriority(text).flat()
    .filter((s) => pool.has(s) && !(profile.instantCycle && s === 'Cycle Intensity'));
  const gMain = guide && fromGuide(guide.main, MAIN_SET);
  const gSubs = guide && [...new Set(fromGuide(guide.subs, SUB_SET))];
  const useGuide = guide && !profile.override && gMain.length;
  if (guide && profile.override && gMain.length) {
    reasons.push(`Guides suggest instead: main ${guide.main}; subs ${guide.subs}.`);
  }
  if (useGuide) {
    const droppedCycle = profile.instantCycle && /cycle intensity/i.test(`${guide.main} ${guide.subs}`);
    if (!droppedCycle) reasons.splice(reasons.indexOf(profile.note), profile.note ? 1 : 0);
    reasons.push(`Recommended priority: main ${guide.main}; subs ${guide.subs}.${droppedCycle ? ' Cycle Intensity left out.' : ''}`);
  }
  // Full priority orders (best first), used to swap stats out when one is capped.
  const mainOrder = useGuide ? [...gMain, ...ranked(MAIN_SET).filter((s) => !gMain.includes(s))] : ranked(MAIN_SET);
  const subOrder = useGuide ? [...gSubs, ...ranked(SUB_SET).filter((s) => !gSubs.includes(s))] : ranked(SUB_SET);
  const main = mainOrder[0] ?? 'ATK%';
  const subs = subOrder.slice(0, 4);
  while (subs.length < 4) subs.push(['ATK%', 'HP%', 'CRIT Rate', 'DEF%'].find((s) => !subs.includes(s)));
  if (useGuide) reasons.splice(0, reasons.length, ...reasons.filter((r) => r === profile.note || r.startsWith('Recommended priority')));
  for (const [stat, text] of useGuide ? [] : tied) if (main === stat || subs.includes(stat)) reasons.push(text);
  if (!reasons.length) reasons.push(`Follows ${c.name}’s ${c.roles.join(' / ')} role${c.roles.length > 1 ? 's' : ''}.`);
  return { main, subs, reasons, mainOrder, subOrder };
}
