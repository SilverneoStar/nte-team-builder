// Everything to farm for one character: level cap 20 → 80, all four active
// skills Lv 1 → 10 with both passives, and the life skill to Lv 5.
// Grouped by where the materials come from, so players can plan their runs.
import { BOSS_DROPS, CHARACTER_MATERIALS, FAMILIES, MAX_LEVEL, ascensionCost } from './ascension.js';
import { BOOK_SOURCE, LIFE_MAX, SKILL_MAX, skillCost } from './skills.js';

// Character EXP items. The total needed for Lv 1 → 80 isn't published in the
// guides we use yet, so the card lists them without amounts.
export const EXP_GUIDES = ['Rising Hunter Guide', 'Senior Hunter Guide', 'Elite Hunter Guide'];
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
        items: EXP_GUIDES.map((name, i) => ({ name, qty: null, kind: tier(i) })),
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
