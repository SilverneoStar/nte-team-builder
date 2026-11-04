// Everything to farm for one character: level cap 20 → 80, all four active
// skills Lv 1 → 10 with both passives, and the life skill to Lv 5.
// Grouped by where the materials come from, so players can plan their runs.
import { BOSS_DROPS, CHARACTER_MATERIALS, FAMILIES, MAX_LEVEL, ascensionCost } from './ascension.js';
import { BOOK_SOURCE, LIFE_MAX, SKILL_MAX, skillCost } from './skills.js';

// Character EXP items: Rising 1,000, Senior 5,000, Elite 20,000 EXP each.
export const EXP_GUIDES = ['Rising Hunter Guide', 'Senior Hunter Guide', 'Elite Hunter Guide'];
export const GUIDE_EXP = [1000, 5000, 20000];
// Lv 1 → 80 total, approximate (Nov 2026). In-game Level Development screens:
// Lv 50 → 80 asks for 260 Elite + 4 Rising (≈5.20M) and Lv 40 → 49 for 27 Elite
// + 4 Rising (≈0.54M); per-level bars of 48,090 (Lv 40), 127,580 (Lv 60) and
// 207,810 (Lv 70) agree. Lv 1 → 40 (≈0.85M) is a community estimate.
export const CHARACTER_EXP_TOTAL = 6_650_000;
export const EXP_SOURCE = 'EXP & Beetle Coins zone';

const sum = (lists) => {
  const out = new Map();
  for (const list of lists) {
    for (const m of list ?? []) {
      const prev = out.get(m.name);
      out.set(m.name, prev ? { ...prev, qty: prev.qty + m.qty } : { ...m });
    }
  }
  return out;
};

/** The full farm list for a character, or null without material data. */
export function farmList(characterId) {
  const mats = CHARACTER_MATERIALS[characterId];
  const asc = ascensionCost(characterId, 20, MAX_LEVEL);
  const skills = skillCost(characterId);
  if (!mats || !asc || !skills) return null;
  const all = sum([asc, skills]);
  const pick = (names, kindOf) => names
    .map((n, i) => all.get(n) && { ...all.get(n), kind: kindOf?.(i) ?? all.get(n).kind })
    .filter(Boolean);

  const [familyKey, bossId] = mats;
  const boss = BOSS_DROPS[bossId];
  const bookNames = skills.filter((m) => m.source === BOOK_SOURCE).map((m) => m.name);
  const weekly = skills.find((m) => m.kind === 'boss');
  const tier = (i) => `tier${i + 1}`;

  return {
    groups: [
      {
        id: 'boss',
        title: 'Anomaly Hunt',
        where: boss.source,
        items: pick([boss.name], () => 'boss'),
      },
      weekly && {
        id: 'weekly',
        title: 'Weekly boss',
        where: weekly.source.replace(/^Pilgrimage: /, ''),
        items: pick([weekly.name], () => 'weekly'),
      },
      {
        id: 'exp',
        title: 'Character EXP',
        where: EXP_SOURCE,
        // Elite Guides cover it all; the smaller guides show their EXP so
        // leftovers can be counted in.
        items: EXP_GUIDES.map((name, i) =>
          i === 2
            ? { name, qty: Math.ceil(CHARACTER_EXP_TOTAL / GUIDE_EXP[i]), approx: true, kind: tier(i) }
            : { name, qty: null, label: `${GUIDE_EXP[i] / 1000}k EXP each`, kind: tier(i) },
        ),
      },
      {
        id: 'family',
        title: 'Open-world anomalies',
        where: 'Drops from anomalies',
        items: pick(FAMILIES[familyKey], tier),
      },
      {
        id: 'books',
        title: 'Skill cards',
        where: BOOK_SOURCE,
        items: pick(bookNames, tier),
      },
      {
        id: 'money',
        title: 'Currency and life skill',
        where: 'Coin: EXP & Beetle Coins zone · Seeds: Mall, dailies',
        items: pick(['Beetle Coin', 'Fons', 'Dreamless Seed']),
      },
    ].filter(Boolean),
    covers: `Lv 20 → ${MAX_LEVEL} ascension · 4 skills Lv 1 → ${SKILL_MAX} + passives · life skill Lv ${LIFE_MAX}`,
  };
}
