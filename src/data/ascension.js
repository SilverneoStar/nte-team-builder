// Character ascension: what it takes to raise the level cap from 20 to 80.
// Sources (Oct 2026): Oslink max-level material guides (per-phase amounts,
// identical for Chaos and Blackbird), neverness.gg materials page and Icy Veins
// (material families and boss drops per character). Elyms and Exe: the
// official 1.5 preview stream (Oct 28, 2026).

export const MAX_LEVEL = 80;

// Each ascension at a level cap raises it by 10. tier = which tier of the
// character's material family; boss = their Anomaly Hunt drop.
export const ASCENSION_PHASES = [
  { at: 20, coins: 25000, tier: 1, tierQty: 5, boss: 0 },
  { at: 30, coins: 50000, tier: 1, tierQty: 12, boss: 2 },
  { at: 40, coins: 75000, tier: 2, tierQty: 6, boss: 8 },
  { at: 50, coins: 100000, tier: 2, tierQty: 12, boss: 16 },
  { at: 60, coins: 125000, tier: 3, tierQty: 6, boss: 24 },
  { at: 70, coins: 150000, tier: 3, tierQty: 9, boss: 36 },
];

// Material families: three tiers dropped by anomalies in the open world.
export const FAMILIES = {
  whispers: ['Lost Whispers', 'Obscure Whispers', 'Paradoxical Whispers'],
  silhouette: ['Fading Silhouette', 'Blurred Silhouette', 'Chaos Silhouette'],
  numeral: ['Blurred Numeral', 'Unsolved Numeral', 'Distorted Numeral'],
  delusions: ['Suspended Delusions', 'Yearning Delusions', 'Transcendent Delusions'],
};

// Anomaly Hunt boss drops.
export const BOSS_DROPS = {
  'confessional-flower-seed': { name: 'Confessional Flower Seed', source: 'Serenetti' },
  'charging-knight-spark-plug': { name: 'Charging Knight Spark Plug', source: 'Headless Rider' },
  'page-from-delusions-shore': { name: 'A Page from Delusion’s Shore', source: 'Black Tome' },
  'water-moon-pick': { name: 'Water Moon Pick', source: 'Beat King' },
  'nest-guard-fragment': { name: 'Nest Guard Fragment', source: 'Nestbound Bird' },
  'colorful-ticket-stub': { name: 'Colorful Ticket Stub', source: 'Swallowtail' },
  'tear-of-the-sea': { name: 'Tear of the Sea', source: 'Sea Prisoner' },
};

// [family, boss drop] per character.
export const CHARACTER_MATERIALS = {
  adler: ['numeral', 'water-moon-pick'],
  akane: ['delusions', 'charging-knight-spark-plug'],
  aurelia: ['delusions', 'nest-guard-fragment'],
  baicang: ['numeral', 'nest-guard-fragment'],
  blackbird: ['numeral', 'colorful-ticket-stub'],
  chaos: ['delusions', 'tear-of-the-sea'],
  chiz: ['whispers', 'tear-of-the-sea'],
  daffodill: ['delusions', 'charging-knight-spark-plug'],
  edgar: ['whispers', 'colorful-ticket-stub'],
  elyms: ['silhouette', 'tear-of-the-sea'],
  exe: ['numeral', 'confessional-flower-seed'],
  fadia: ['silhouette', 'water-moon-pick'],
  haniel: ['numeral', 'nest-guard-fragment'],
  hathor: ['delusions', 'colorful-ticket-stub'],
  hotori: ['whispers', 'confessional-flower-seed'],
  iroi: ['silhouette', 'page-from-delusions-shore'],
  jiuyuan: ['silhouette', 'tear-of-the-sea'],
  lacrimosa: ['whispers', 'confessional-flower-seed'],
  linko: ['whispers', 'water-moon-pick'],
  mint: ['silhouette', 'page-from-delusions-shore'],
  nanally: ['silhouette', 'page-from-delusions-shore'],
  sakiri: ['numeral', 'charging-knight-spark-plug'],
  shinku: ['whispers', 'charging-knight-spark-plug'],
  skia: ['delusions', 'confessional-flower-seed'],
  zankou: ['numeral', 'nest-guard-fragment'],
  zero: ['whispers', 'charging-knight-spark-plug'],
};

/**
 * Materials to ascend a character from one level cap to another.
 * fromCap/toCap are level caps (20..80); phases with fromCap <= at < toCap count.
 * Returns [{ name, qty, kind, source? }] in a stable order, zero amounts dropped.
 */
export function ascensionCost(characterId, fromCap = 20, toCap = MAX_LEVEL) {
  const mats = CHARACTER_MATERIALS[characterId];
  if (!mats) return null;
  const [family, bossId] = mats;
  const tiers = FAMILIES[family];
  const boss = BOSS_DROPS[bossId];
  const totals = { coins: 0, t1: 0, t2: 0, t3: 0, boss: 0 };
  for (const p of ASCENSION_PHASES) {
    if (p.at < fromCap || p.at >= toCap) continue;
    totals.coins += p.coins;
    totals[`t${p.tier}`] += p.tierQty;
    totals.boss += p.boss;
  }
  return [
    { name: boss.name, qty: totals.boss, kind: 'boss', source: `Anomaly Hunt: ${boss.source}` },
    { name: tiers[0], qty: totals.t1, kind: 'tier1' },
    { name: tiers[1], qty: totals.t2, kind: 'tier2' },
    { name: tiers[2], qty: totals.t3, kind: 'tier3' },
    { name: 'Beetle Coin', qty: totals.coins, kind: 'coins' },
  ].filter((m) => m.qty > 0);
}

/** Per-phase breakdown for a character, for a table. */
export function ascensionTable(characterId) {
  const mats = CHARACTER_MATERIALS[characterId];
  if (!mats) return null;
  const tiers = FAMILIES[mats[0]];
  const boss = BOSS_DROPS[mats[1]];
  return ASCENSION_PHASES.map((p) => ({
    at: p.at,
    to: p.at + 10,
    coins: p.coins,
    tierName: tiers[p.tier - 1],
    tierQty: p.tierQty,
    bossName: boss.name,
    bossQty: p.boss,
  }));
}
