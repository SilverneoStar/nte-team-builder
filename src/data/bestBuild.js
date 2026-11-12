// A character's best recommended build, fully levelled, for the profile's
// build card: signature Arc (or the top recommended Arc), the recommended
// Cartridge set and Console layout, and the recommended stats at their best
// S-rank values (+20).
// Values (Oct 2026): S-rank Cartridge main stats at +20 and fixed S-rank sub
// stats; S-rank module main and sub stats per module Type, from published
// community module stat guides.
import { ARCS, ARC_BY_ID, RECOMMENDED } from './arcs.js';
import { MODULE_MAX_LEVEL, bonusStats, cartridgesFor, moduleLevel, unlockedSubs } from './gear.js';
import { SHAPES, consoleStats } from './console.js';
import { MAX_STATS } from './maxStats.js';
import { suggestedBuild } from './consoleBuilds.js';
import { recommendStats } from './buildProfiles.js';

import { CART_MAIN_MAX, CART_SUB_S } from './cartValues.js';

export { CART_MAIN_MAX, CART_SUB_S };

// Module main stats (flat ATK and HP) at Lv 20, by module Type (= its cells).
// Type IV is 84 ATK / 1,120 HP in game (checked by the project owner, Nov 2026):
// 21 ATK and 280 HP per cell, so Type II and III are scaled to match.
export const MODULE_MAIN_MAX = { 2: { atk: 42, hp: 560 }, 3: { atk: 63, hp: 840 }, 4: { atk: 84, hp: 1120 } };
// Module sub stats, S-rank, by module Type.
export const MODULE_SUB_S = {
  2: { HP: 200, 'HP%': 2.5, ATK: 16, 'ATK%': 2.5, DEF: 16, 'DEF%': 3.5, 'CRIT Rate': 2, 'CRIT DMG': 4, 'DMG%': 2, 'Break Intensity': 12, 'Cycle Intensity': 12 },
  3: { HP: 300, 'HP%': 3.75, ATK: 24, 'ATK%': 3.75, DEF: 24, 'DEF%': 5.25, 'CRIT Rate': 3, 'CRIT DMG': 6, 'DMG%': 3, 'Break Intensity': 18, 'Cycle Intensity': 18 },
  4: { HP: 400, 'HP%': 5, ATK: 32, 'ATK%': 5, DEF: 32, 'DEF%': 7.5, 'CRIT Rate': 4, 'CRIT DMG': 8, 'DMG%': 4, 'Break Intensity': 24, 'Cycle Intensity': 24 },
};

// CRIT Rate above 100% does nothing, so the best build moves it elsewhere.
export const CRIT_RATE_CAP = 100;

/**
 * { arc, cartridge, cartStats, pieces, notes } or null when the character has no
 * Console data. Stats follow the recommended priority; if CRIT Rate would pass
 * 100%, it is swapped out of the Cartridge main stat first, then module and
 * Cartridge sub stats, for the next stats in the priority order.
 */
export function bestBuild(character) {
  const cartridge = cartridgesFor(character)[0] ?? null;
  const layout = suggestedBuild(character.id, cartridge);
  if (!layout) return null;
  const st = recommendStats(character, layout.cartridge);
  const signature = ARCS.find((a) => a.signature === character.id);
  const arc = signature ?? ARC_BY_ID[(RECOMMENDED[character.id] ?? [])[0]] ?? null;

  let main = st.main;
  let cartSubs = [...st.subs];
  let moduleSubs = [...st.subs];
  const nextFrom = (order, used, skip) => order.find((x) => !used.includes(x) && x !== skip)
    ?? ['ATK%', 'ATK', 'HP%', 'DEF%', 'HP', 'DEF'].find((x) => !used.includes(x));

  const make = () => ({
    arc: arc?.id ?? null,
    cartridge: layout.cartridge,
    cartStats: {
      main: { stat: main, value: CART_MAIN_MAX[main] ?? 0 },
      subs: cartSubs.map((stat) => ({ stat, value: CART_SUB_S[stat] ?? 0 })),
    },
    pieces: layout.pieces.map((p) => {
      const type = SHAPES[p.shape].type;
      return {
        ...p,
        stats: {
          level: 20,
          ...MODULE_MAIN_MAX[type],
          subs: moduleSubs.map((stat) => ({ stat, value: MODULE_SUB_S[type][stat] ?? 0 })),
        },
      };
    }),
  });
  const critTotal = (b) => {
    const base = MAX_STATS[character.id]?.critRate ?? 5;
    const all = bonusStats(arc, b.cartStats, consoleStats(character.id, b.pieces, b.cartridge));
    return base + (all.find((x) => x.stat === 'CRIT Rate')?.value ?? 0);
  };

  const notes = [];
  let build = make();
  if (critTotal(build) > CRIT_RATE_CAP && main === 'CRIT Rate') {
    main = nextFrom(st.mainOrder, [], 'CRIT Rate');
    notes.push(`Cartridge main stat moved from CRIT Rate to ${main} to stay under the 100% CRIT Rate cap.`);
    build = make();
  }
  if (critTotal(build) > CRIT_RATE_CAP && moduleSubs.includes('CRIT Rate')) {
    const swap = nextFrom(st.subOrder, moduleSubs, 'CRIT Rate');
    moduleSubs = moduleSubs.map((x) => (x === 'CRIT Rate' ? swap : x));
    notes.push(`Module sub stats use ${swap} instead of CRIT Rate (already capped).`);
    build = make();
  }
  if (critTotal(build) > CRIT_RATE_CAP && cartSubs.includes('CRIT Rate')) {
    const swap = nextFrom(st.subOrder, cartSubs, 'CRIT Rate');
    cartSubs = cartSubs.map((x) => (x === 'CRIT Rate' ? swap : x));
    notes.push(`Cartridge sub stats use ${swap} instead of CRIT Rate (already capped).`);
    build = make();
  }
  return { ...build, notes, critRate: critTotal(build) };
}

/** Pieces with the best S-rank module rolls for the character's recommended sub stats. */
export function withBestModuleStats(character, pieces, cartridgeId) {
  const st = recommendStats(character, cartridgeId);
  return (pieces ?? []).map((p) => {
    const type = SHAPES[p.shape].type;
    return {
      ...p,
      stats: {
        level: 20,
        ...MODULE_MAIN_MAX[type],
        subs: st.subs.map((stat) => ({ stat, value: MODULE_SUB_S[type][stat] ?? 0 })),
      },
    };
  });
}

/**
 * One placed module with its empty values filled: the S-rank value for each
 * unlocked sub stat the player picked, and the Lv 20 main ATK and HP when the
 * module is Lv 20 (lower levels have lower mains, so those stay for the
 * player). Values already entered stay as they are.
 */
export function fillModuleValues(piece) {
  const type = SHAPES[piece.shape]?.type;
  const st = piece.stats ?? { hp: 0, atk: 0, subs: [null, null, null, null] };
  const level = moduleLevel(st);
  const open = unlockedSubs(level);
  const mains = level === MODULE_MAX_LEVEL ? MODULE_MAIN_MAX[type] ?? {} : {};
  return {
    ...piece,
    stats: {
      ...st,
      level,
      atk: st.atk || mains.atk || 0,
      hp: st.hp || mains.hp || 0,
      subs: (st.subs ?? []).map((x, i) =>
        x?.stat && !x.value && i < open ? { ...x, value: MODULE_SUB_S[type]?.[x.stat] ?? 0 } : x,
      ),
    },
  };
}
/** True when a module has a picked, unlocked sub stat (or a Lv 20 main) without a value. */
export function moduleHasEmptyValues(piece) {
  const st = piece.stats;
  if (!st) return moduleLevel(st) === MODULE_MAX_LEVEL;
  const level = moduleLevel(st);
  if (level === MODULE_MAX_LEVEL && (!st.atk || !st.hp)) return true;
  return (st.subs ?? []).some((x, i) => x?.stat && !x.value && i < unlockedSubs(level));
}
