// A character's stats at a level, with an Arc, Cartridge and Console equipped.
//
// Base HP, ATK and DEF come from the game's level tables (data/levelStats.js);
// every Esper starts at CRIT Rate 5% and CRIT DMG 50%. Gear then adds:
//   ATK = (character ATK + Arc ATK) × (1 + ATK%) + flat ATK
//   HP  = character HP × (1 + HP%) + flat HP
//   DEF = character DEF × (1 + DEF%) + flat DEF
// and everything else (CRIT, DMG bonuses, Intensity) is added as is. The Arc's
// ATK is taken at max level. Bonuses that need a condition (Arc passives,
// 4-piece set effects) aren't counted; the game's Attributes screen leaves
// Arc passives out too. Checked against in-game Lacrimosa screens with and
// without an Arc (Nov 2026).
import { ARC_BY_ID } from '../data/arcs.js';
import { bonusStats } from '../data/gear.js';
import { consoleStats } from '../data/console.js';
import { ELEMENT_BY_ID } from '../data/elements.js';
import { levelStats } from '../data/levelStats.js';

const BASE_CRIT = { 'CRIT Rate': 5, 'CRIT DMG': 50 };
const r2 = (n) => Math.round(n * 100) / 100;
// The game drops the fraction on HP, ATK and DEF (player-checked: rounding
// came out 1 above the game). The tiny nudge keeps float error from flooring
// a whole number down.
const fl = (n) => Math.floor(n + 1e-6);

/**
 * gear: { arc (id), cartStats, pieces, cartridge }. level: a step from
 * LEVEL_STEPS ('80', '70+', …). Returns null without level data, else
 * { rows: [{ stat, base, total, pct }], other: [{ stat, value }] }.
 */
export function computeStats(character, gear = {}, level = '80') {
  const table = levelStats(character.id);
  if (!table) return null;
  const at = table.rows.find((r) => r.level === level) ?? table.rows.at(-1);
  const arc = gear.arc ? ARC_BY_ID[gear.arc] : null;
  const bonus = new Map(
    bonusStats(null, gear.cartStats, consoleStats(character.id, gear.pieces ?? [], gear.cartridge)).map((b) => [
      b.stat,
      b.value,
    ]),
  );
  if (arc) {
    // Arc secondary stat (its base ATK is handled below).
    for (const b of bonusStats(arc, null)) if (b.stat !== 'ATK') bonus.set(b.stat, (bonus.get(b.stat) ?? 0) + b.value);
  }
  const take = (stat) => {
    const v = bonus.get(stat) ?? 0;
    bonus.delete(stat);
    return v;
  };
  const el = `${ELEMENT_BY_ID[character.element]?.name} DMG%`;

  const rows = [
    { stat: 'HP', base: at.hp, total: fl(at.hp * (1 + take('HP%') / 100) + take('HP')) },
    {
      // Like the game's Attributes screen: base ATK includes the Arc's ATK.
      stat: 'ATK',
      base: at.atk + (arc?.atk ?? 0),
      total: fl((at.atk + (arc?.atk ?? 0)) * (1 + take('ATK%') / 100) + take('ATK')),
    },
    { stat: 'DEF', base: at.def, total: fl(at.def * (1 + take('DEF%') / 100) + take('DEF')) },
    ...['CRIT Rate', 'CRIT DMG'].map((s) => ({ stat: s, base: BASE_CRIT[s], total: r2(BASE_CRIT[s] + take(s)), pct: true })),
    { stat: el, base: 0, total: r2(take(el)), pct: true },
    { stat: 'DMG%', base: 0, total: r2(take('DMG%') + take('Universal DMG%')), pct: true },
  ];
  for (const s of ['Cycle Intensity', 'Break Intensity']) {
    const v = take(s);
    if (v) rows.push({ stat: s, base: 0, total: r2(v) });
  }
  const other = [...bonus].filter(([, v]) => v).map(([stat, value]) => ({ stat, value: r2(value) }));
  return { rows, other, level: at.level };
}
