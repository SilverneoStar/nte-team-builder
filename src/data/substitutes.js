// Selection boxes and Expansion Cores: Hunter Exchange items (paid in Fons)
// that stand in for farmed materials. Source: in-game shop and item screens
// provided by the project owner (Oct 2026). Stock is the shop's limit.
import { CHARACTER_MATERIALS, FAMILIES, BOSS_DROPS } from './ascension.js';
import { SKILL_MATS, SKILL_BOOKS } from './skills.js';
import { ARC_FAMILIES, ARC_MATERIALS } from './arcMaterials.js';

export const SUBSTITUTE_SHOP = 'Hunter Exchange';

export const BOXES = {
  anomaly: {
    name: 'Anomaly Material Selection Box I',
    cost: 500,
    stock: 490,
    sources: ['Hunter Exchange', 'Circle Bounty'],
    note: 'Pick one tier-1 anomaly material.',
  },
  books: {
    name: 'Character Esper Material Selection Box I',
    cost: 1500,
    stock: 50,
    sources: ['Hunter Exchange', 'Circle Bounty'],
    note: 'Pick one tier-1 skill book.',
  },
  arc: {
    name: 'Arc Ascension Material Selection Box I',
    cost: 1500,
    stock: 50,
    sources: ['Hunter Exchange', 'Circle Bounty'],
    note: 'Pick one tier-1 Arc material.',
  },
  hunt: {
    name: 'Anomaly Hunt Material Selection Box',
    cost: 5000,
    stock: 28,
    sources: ['Hunter Exchange'],
    note: 'Pick one Anomaly Hunt boss drop.',
  },
};

export const EXPANSION_CORE = {
  name: 'Expansion Core',
  cost: 1500,
  stock: 150,
  sources: ['Hunter Exchange'],
  note: 'Fills in for missing materials when upgrading Esper abilities or Arcs; rarer materials take more Cores.',
};

/** The boxes that help a character, each with what to pick for them. */
export function characterShortcuts(id) {
  const mats = CHARACTER_MATERIALS[id];
  const skill = SKILL_MATS[id];
  if (!mats) return [];
  const out = [{ ...BOXES.anomaly, pick: FAMILIES[mats[0]][0] }];
  if (skill) out.push({ ...BOXES.books, pick: SKILL_BOOKS[skill[0]][0] });
  if (BOSS_DROPS[mats[1]]) out.push({ ...BOXES.hunt, pick: BOSS_DROPS[mats[1]].name });
  return [...out, EXPANSION_CORE];
}

/** The boxes that help level an Arc, each with what to pick for it. */
export function arcShortcuts(arc) {
  const fam = ARC_MATERIALS[arc.id];
  if (!fam) return [];
  return [
    { ...BOXES.arc, pick: ARC_FAMILIES[fam[0]][0] },
    { ...BOXES.anomaly, pick: FAMILIES[fam[1]][0] },
    EXPANSION_CORE,
  ];
}
