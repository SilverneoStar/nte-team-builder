// Cortado's review of one Esper's saved build (My build): how well the
// Cartridge set, its main and sub stats, and the Console modules' sub stats
// suit them. Favoured stats come from the recommended build (favouredStats);
// values are judged against the best S-rank value for each stat.
import { CHARACTER_BY_ID } from '../data/characters.js';
import { CARTRIDGE_BY_ID, cartridgesFor, moduleLevel, unlockedSubs } from '../data/gear.js';
import { favouredStats } from '../data/buildProfiles.js';
import { CART_MAIN_MAX, CART_SUB_S, MODULE_SUB_S } from '../data/bestBuild.js';
import { SHAPES } from '../data/console.js';
import { SYNERGY_RANKS } from './synergy.js';

const quality = (value, max) => (max ? Math.min(1, (value || 0) / max) : value ? 1 : 0);

/** { score, rank, notes: [{ tone: 'good'|'warn'|'bad', text }], hasSubs } or null. */
export function reviewBuild(characterId, build) {
  const c = CHARACTER_BY_ID[characterId];
  if (!c || !build) return null;
  const fav = favouredStats(c, build.cartridge);
  const notes = [];

  // Cartridge set.
  const recSets = cartridgesFor(c);
  if (build.cartridge && recSets.length && !recSets.includes(build.cartridge))
    notes.push({ tone: 'warn', text: `${CARTRIDGE_BY_ID[build.cartridge]?.name} isn’t one of their recommended Cartridge sets.` });
  if (!build.cartridge) notes.push({ tone: 'warn', text: 'Pick a Cartridge set: its 2- and 4-piece bonuses count too.' });

  // Main stat.
  const main = build.cartStats?.main;
  let mainScore = null;
  if (main?.stat) {
    const rank = fav.main.get(main.stat);
    const fit = rank === 0 ? 1 : rank === 1 ? 0.85 : 0;
    mainScore = fit * (0.6 + 0.4 * quality(main.value, CART_MAIN_MAX[main.stat]));
    const best = [...fav.main.keys()][0];
    if (fit) notes.push({ tone: 'good', text: `${main.stat} suits them as the Cartridge main stat.` });
    else notes.push({ tone: 'bad', text: `Main stat: ${main.stat} doesn’t suit them. Go for ${best}.` });
  } else {
    notes.push({ tone: 'warn', text: 'Set the Cartridge main stat for a full review.' });
  }

  // Cartridge sub stats: favoured ones count, by value against the S-rank value.
  const subs = (build.cartStats?.subs ?? []).filter((x) => x?.stat);
  let subScore = null;
  if (subs.length) {
    const on = subs.filter((x) => fav.subs.has(x.stat));
    const off = subs.filter((x) => !fav.subs.has(x.stat)).map((x) => x.stat);
    subScore = on.reduce((n, x) => n + quality(x.value, CART_SUB_S[x.stat]), 0) / 4;
    notes.push({
      tone: on.length === 4 ? 'good' : on.length >= 3 ? 'warn' : 'bad',
      text: `Cartridge sub stats: ${on.length} of ${subs.length} on stats they favour${off.length ? ` (${off.join(', ')} ${off.length > 1 ? 'aren’t' : 'isn’t'})` : ''}.`,
    });
    const low = on.filter((x) => x.value && quality(x.value, CART_SUB_S[x.stat]) < 0.75).map((x) => x.stat);
    if (low.length) notes.push({ tone: 'warn', text: `${low.join(', ')} ${low.length > 1 ? 'are' : 'is'} below the S-rank value: a higher-rank Cartridge raises ${low.length > 1 ? 'them' : 'it'}.` });
  }

  // Console module sub stats (only the slots unlocked at each module's level).
  let modTotal = 0;
  let modOn = 0;
  let modScore = 0;
  for (const p of build.pieces ?? []) {
    const st = p.stats;
    if (!st) continue;
    const open = unlockedSubs(moduleLevel(st));
    (st.subs ?? []).slice(0, open).forEach((x) => {
      if (!x?.stat) return;
      modTotal += 1;
      if (fav.subs.has(x.stat)) {
        modOn += 1;
        modScore += quality(x.value, MODULE_SUB_S[SHAPES[p.shape]?.type]?.[x.stat]);
      }
    });
  }
  if (modTotal) {
    notes.push({
      tone: modOn / modTotal >= 0.75 ? 'good' : modOn / modTotal >= 0.5 ? 'warn' : 'bad',
      text: `Module sub stats: ${modOn} of ${modTotal} on stats they favour.`,
    });
  }
  const hasSubs = subs.length > 0 || modTotal > 0;
  if (!hasSubs) notes.push({ tone: 'warn', text: 'Add your Cartridge sub stats (and module stats) and Cortado will rate them too.' });
  if (fav.text) notes.push({ tone: 'info', text: `Favoured sub stats: ${fav.text}.` });

  if (mainScore == null && !hasSubs) return { score: null, rank: null, notes, hasSubs };
  // Main 40%, sub stats 60% (Cartridge and modules share it when both are entered).
  const parts = [];
  if (subScore != null) parts.push(subScore);
  if (modTotal) parts.push(modScore / modTotal);
  const subPart = parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : null;
  const score = Math.round(((mainScore ?? 0) * (subPart == null ? 1 : 0.4) + (subPart ?? 0) * 0.6) * 100);
  const rank = SYNERGY_RANKS.find((r) => score >= r.min).rank;
  return { score, rank, notes, hasSubs };
}
