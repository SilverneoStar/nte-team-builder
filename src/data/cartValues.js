// Best Cartridge stat values (S-rank, +20), shared by the best build and the
// "Use suggested stats" buttons. Values (Oct 2026) from published community
// stat guides.
const ELEMENT_DMG = ['Cosmos', 'Anima', 'Incantation', 'Chaos', 'Psyche', 'Lakshana', 'Mental']
  .map((e) => [`${e} DMG%`, 37.5]);

// Cartridge main stat, S-rank at +20.
export const CART_MAIN_MAX = {
  'HP%': 37.5, 'ATK%': 37.5, 'DEF%': 52.5, 'CRIT Rate': 30, 'CRIT DMG': 60,
  'Healing%': 34.5, 'Break Intensity': 180, 'Cycle Intensity': 180,
  ...Object.fromEntries(ELEMENT_DMG),
};
// Cartridge sub stats, S-rank (fixed values). DMG% is Universal DMG.
export const CART_SUB_S = {
  HP: 1000, 'HP%': 12.5, ATK: 80, 'ATK%': 12.5, DEF: 80, 'DEF%': 17.5,
  'CRIT Rate': 10, 'CRIT DMG': 20, 'DMG%': 10, 'Break Intensity': 60, 'Cycle Intensity': 60,
};

/** The best value a Cartridge stat can have; 0 when unknown. */
export const cartStatMax = (kind, stat) => (kind === 'main' ? CART_MAIN_MAX : CART_SUB_S)[stat] ?? 0;

/**
 * Suggested Cartridge stats with values: keeps a value the player already
 * entered for the same stat, and fills the rest with the best S-rank value.
 */
export function fillCartValues(prev, next) {
  // Main and sub values differ for the same stat, so only reuse within a kind.
  const old = { main: [prev?.main].filter(Boolean), sub: (prev?.subs ?? []).filter(Boolean) };
  const fill = (x, kind) =>
    x && { ...x, value: x.value || old[kind].find((o) => o.stat === x.stat)?.value || cartStatMax(kind, x.stat) };
  return { main: fill(next.main, 'main'), subs: next.subs.map((x) => fill(x, 'sub')) };
}

/**
 * The player's own Cartridge stats with values filled in: every stat they
 * picked that has no value yet gets the S-rank value. Values already entered
 * stay as they are.
 */
export function fillChosenCartValues(cs) {
  if (!cs) return cs;
  const fill = (x, kind) => (x?.stat && !x.value ? { ...x, value: cartStatMax(kind, x.stat) } : x);
  return { main: fill(cs.main, 'main'), subs: (cs.subs ?? []).map((x) => fill(x, 'sub')) };
}
/** True when some picked Cartridge stat has no value yet. */
export const cartHasEmptyValues = (cs) =>
  [cs?.main, ...(cs?.subs ?? [])].some((x) => x?.stat && !x.value);
