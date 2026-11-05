// Arc ascension: raising an Arc's level cap from 20 to 80.
// Sources (Oct 2026): Icy Veins Arc pages (per-phase amounts by rank and each
// Arc's two material families), cross-checked with Icy Veins material pages
// and ntebuild.com for the few Arcs Icy Veins was missing. neverness.gg and
// games.gg for where each material drops.
import { FAMILIES } from './ascension.js';

export const ARC_MAX_LEVEL = 80;

// Arc-only material families (three tiers each), farmed in Bubble Can Factory.
export const ARC_FAMILIES = {
  appleseed: ['Iron Appleseed', 'Silver Appleseed', 'Golden Appleseed'],
  beaty: ['Beaty', 'Versey', 'Harmony'],
  liquid: ['Liquid Dream Trial Kit', 'Liquid Dream Travel Kit', 'Liquid Dream Can'],
  dessert: ['Flavorless Cold Dessert', 'Plain Cold Dessert', 'Special Cold Dessert'],
  drama: ['Beginner Drama Core', 'Master Drama Core', "Collector's Drama Core"],
};

// Per ascension: Beetle Coin, the tier used, and how many of each family.
// Both families take the same amount at each step.
const PHASE_TIERS = [1, 1, 2, 2, 3, 3];
const PHASE_AT = [20, 30, 40, 50, 60, 70];
const BY_RANK = {
  S: { coinStep: 20000, qty: [4, 10, 6, 12, 6, 12] },
  A: { coinStep: 16000, qty: [3, 8, 5, 10, 5, 10] },
  B: { coinStep: 12000, qty: [2, 6, 4, 8, 4, 8] },
};

export const arcPhases = (rank) =>
  PHASE_AT.map((at, i) => ({
    at,
    to: at + 10,
    tier: PHASE_TIERS[i],
    qty: BY_RANK[rank].qty[i],
    coins: BY_RANK[rank].coinStep * (i + 1),
  }));

// [Arc family, anomaly family] per Arc.
export const ARC_MATERIALS = {
  'blow-up-the-crowd': ['beaty', 'numeral'],
  'blushing-mirage': ['drama', 'whispers'],
  'camellia-society': ['drama', 'numeral'],
  'contemplative-cat': ['liquid', 'whispers'],
  'crime-and-punishment': ['dessert', 'numeral'],
  'day-off': ['beaty', 'whispers'],
  'eternal-waltz': ['dessert', 'silhouette'],
  'far-side-of-the-moon': ['drama', 'delusions'],
  'fluff-of-fearlessness': ['dessert', 'delusions'],
  'fluff-of-ferocity': ['appleseed', 'numeral'],
  'fluff-of-finesse': ['beaty', 'delusions'],
  'fluff-of-fleetness': ['liquid', 'delusions'],
  'fluff-of-fortitude': ['appleseed', 'numeral'],
  'good-boys-grand-adventure': ['dessert', 'numeral'],
  'hethereaus-keeper': ['appleseed', 'silhouette'],
  'marching-beyond-time': ['drama', 'whispers'],
  'echoes-on-hold': ['beaty', 'silhouette'],
  'raging-flames': ['liquid', 'delusions'],
  'ravenous-blade': ['beaty', 'numeral'],
  'ready-ready': ['beaty', 'whispers'],
  'reality-refuge': ['drama', 'silhouette'],
  'song-of-the-whale': ['drama', 'silhouette'],
  'stellar-veil': ['liquid', 'delusions'],
  'tears-beneath-the-mask': ['dessert', 'silhouette'],
  'the-last-rose': ['appleseed', 'whispers'],
  'the-rain-that-shook-the-world': ['beaty', 'whispers'],
  'the-wrong-gate': ['appleseed', 'silhouette'],
  'voice-of-the-voyager': ['liquid', 'whispers'],
  'whats-desired': ['dessert', 'delusions'],
  'your-happiness-is-priceless': ['appleseed', 'whispers'],
  'youthful-fantasy': ['liquid', 'delusions'],
  'a-time-will-come': ['liquid', 'whispers'],
  'call-of-the-twisted-city': ['drama', 'numeral'],
  'clear-skies': ['dessert', 'silhouette'],
  'cosmos-daze-wild-reverie': ['drama', 'whispers'],
  'drawn-blade': ['liquid', 'delusions'],
  'failing-you-heavy-in-my-heart': ['appleseed', 'delusions'],
  'mind-royale': ['beaty', 'silhouette'],
  oraora: ['beaty', 'silhouette'],
  'shiny-days': ['liquid', 'whispers'],
  'the-fools-spring': ['drama', 'silhouette'],
  'the-forgotten': ['appleseed', 'whispers'],
  'the-good-the-bad-the-bitter': ['beaty', 'numeral'],
  'the-great-thief': ['dessert', 'numeral'],
  'time-bandit': ['appleseed', 'delusions'],
  umbrella: ['appleseed', 'numeral'],
  'watch-your-heads': ['dessert', 'delusions'],
  'real-music': ['drama', 'delusions'],
  'be-happy': ['liquid', 'numeral'],
  'dangerous-game': ['appleseed', 'whispers'],
  'first-step-to-success': ['beaty', 'silhouette'],
  us: ['dessert', 'delusions'],
};

export const ARC_MATERIAL_SOURCE = 'Bubble Can Factory';
export const ANOMALY_SOURCE = 'Open-world anomalies';

/** Ascension materials for an Arc between two level caps (20..80). */
export function arcAscensionCost(arc, fromCap = 20, toCap = ARC_MAX_LEVEL) {
  const fam = ARC_MATERIALS[arc.id];
  if (!fam || !BY_RANK[arc.rarity]) return null;
  const a = ARC_FAMILIES[fam[0]];
  const b = FAMILIES[fam[1]];
  const t = { coins: 0, a: [0, 0, 0], b: [0, 0, 0] };
  for (const p of arcPhases(arc.rarity)) {
    if (p.at < fromCap || p.at >= toCap) continue;
    t.coins += p.coins;
    t.a[p.tier - 1] += p.qty;
    t.b[p.tier - 1] += p.qty;
  }
  const out = [];
  for (let i = 0; i < 3; i++) {
    out.push({ name: a[i], qty: t.a[i], kind: `tier${i + 1}`, source: ARC_MATERIAL_SOURCE });
    out.push({ name: b[i], qty: t.b[i], kind: `tier${i + 1}`, source: ANOMALY_SOURCE });
  }
  out.push({ name: 'Beetle Coin', qty: t.coins, kind: 'coins' });
  return out.filter((m) => m.qty > 0);
}

/** Per-phase rows for an Arc, for a table. */
export function arcAscensionTable(arc) {
  const fam = ARC_MATERIALS[arc.id];
  if (!fam || !BY_RANK[arc.rarity]) return null;
  const a = ARC_FAMILIES[fam[0]];
  const b = FAMILIES[fam[1]];
  return arcPhases(arc.rarity).map((p) => ({
    ...p,
    aName: a[p.tier - 1],
    bName: b[p.tier - 1],
  }));
}

// Levelling uses Dye (Arc EXP) plus Beetle Coin.
export const ARC_DYES = [
  { name: 'Light Dye', exp: 500 },
  { name: 'Colorless Dye', exp: 2500 },
  { name: 'Chaotic Dye', exp: 10000 },
];
