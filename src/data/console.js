// Console: a 5x5 grid per character with some cells blocked. Modules (Type II,
// III, IV = 2, 3, 4 cells) fill the free cells. A Cartridge set's bonus turns on
// when 2 / 4 placed modules use one of that set's 4 shapes, and each character
// gets a bonus per module of one Type.
// Source (Oct 2026): game data as compiled for the Icy Veins NTE Console Tool
// (grid layouts, shapes, set shape requirements, specialisations).

import { CARTRIDGE_BY_ID, moduleLevel, parseSetBonus, unlockedSubs } from './gear.js';

export const CONSOLE_SIZE = 5;

// Grid layouts: '#' blocked, '.' free. Every layout has 20 free cells.
export const LAYOUTS = {
  A: '#####/...../...../...../.....',
  B: '..#../...../...../#...#/#...#',
  C: '....#/....#/..#../#..../#....',
  D: '#..../...../...#./..##./....#',
};

export const LAYOUT_NAMES = {
  A: 'Open top row',
  B: 'Notched corners',
  C: 'Diagonal split',
  D: 'Inner block',
};

export const maskOf = (layoutId) =>
  LAYOUTS[layoutId].split('/').map((row) => [...row].map((ch) => ch === '.'));

// Module shapes as [row, col] cells, normalised so the top-left of the
// bounding box is [0, 0]. Rotations are separate shapes in the game.
export const SHAPES = {
  Hen2: { type: 2, label: 'Line, horizontal', cells: [[0, 0], [0, 1]] },
  Shu2: { type: 2, label: 'Line, vertical', cells: [[0, 0], [1, 0]] },
  Hen3: { type: 3, label: 'Line, horizontal', cells: [[0, 0], [0, 1], [0, 2]] },
  Shu3: { type: 3, label: 'Line, vertical', cells: [[0, 0], [1, 0], [2, 0]] },
  ZhiJiao1: { type: 3, label: 'Corner', cells: [[0, 0], [1, 0], [1, 1]] },
  ZhiJiao2: { type: 3, label: 'Corner', cells: [[0, 0], [0, 1], [1, 0]] },
  ZhiJiao3: { type: 3, label: 'Corner', cells: [[0, 0], [0, 1], [1, 1]] },
  ZhiJiao4: { type: 3, label: 'Corner', cells: [[0, 1], [1, 0], [1, 1]] },
  Hen4: { type: 4, label: 'Line, horizontal', cells: [[0, 0], [0, 1], [0, 2], [0, 3]] },
  Shu4: { type: 4, label: 'Line, vertical', cells: [[0, 0], [1, 0], [2, 0], [3, 0]] },
  Z3: { type: 4, label: 'Zigzag, horizontal', cells: [[0, 1], [0, 2], [1, 0], [1, 1]] },
  Z4: { type: 4, label: 'Zigzag, vertical', cells: [[0, 1], [1, 0], [1, 1], [2, 0]] },
};

export const SHAPE_ORDER = Object.keys(SHAPES);

// The 4 shapes each Cartridge set counts.
export const SET_SHAPES = {
  diabolos: ['Shu2', 'ZhiJiao2', 'ZhiJiao4', 'Hen4'],
  'fireflies-and-the-forest': ['Hen2', 'Shu3', 'ZhiJiao1', 'Z4'],
  'devils-blood-curse': ['Shu2', 'Shu3', 'ZhiJiao2', 'Z4'],
  'crimson-twin-butterflies': ['Shu2', 'Hen3', 'ZhiJiao4', 'Z3'],
  'street-boxer': ['Hen2', 'Hen3', 'ZhiJiao3', 'Z3'],
  'lost-radiance': ['Hen2', 'ZhiJiao1', 'ZhiJiao3', 'Shu4'],
  'kingdoms-guard': ['Hen3', 'Shu3', 'ZhiJiao3', 'ZhiJiao4'],
  'shadow-creed': ['Hen2', 'Shu2', 'Hen4', 'Z4'],
  'theas-night-tavern': ['Hen3', 'Shu3', 'ZhiJiao1', 'ZhiJiao2'],
  'tiny-big-adventure': ['Hen2', 'Shu2', 'Hen4', 'Z3'],
  'speedy-hedgehog': ['ZhiJiao1', 'ZhiJiao2', 'ZhiJiao3', 'ZhiJiao4'],
  'quiet-manor': ['Hen2', 'Shu2', 'Shu4', 'Z4'],
};

// [layout, module Type that triggers the bonus, stat, % per module]
const c = (layout, type, stat, value) => ({ layout, spec: { type, stat, value } });
export const CHARACTER_CONSOLE = {
  adler: c('B', 3, 'DEF', 12),
  akane: c('A', 3, 'ATK', 10),
  aurelia: c('C', 3, 'ATK', 10),
  baicang: c('D', 3, 'CRIT Rate', 7.5),
  blackbird: c('C', 3, 'CRIT Rate', 8),
  chaos: c('D', 3, 'CRIT DMG', 16),
  chiz: c('D', 3, 'Cosmos DMG', 10),
  daffodill: c('C', 3, 'Chaos DMG', 10),
  edgar: c('A', 3, 'HP', 10),
  // Pre-release guesses (Oct 2026), modelled on similar kits (Hotori for
  // Elyms, Lacrimosa for Exe). Replace with game data once they are out.
  elyms: c('B', 3, 'Cosmos DMG', 10),
  exe: c('A', 3, 'Chaos DMG', 10),
  fadia: c('C', 2, 'HP', 6),
  haniel: c('B', 3, 'ATK', 10),
  hathor: c('C', 3, 'ATK', 10),
  hotori: c('B', 3, 'Cosmos DMG', 10),
  iroi: c('B', 3, 'ATK', 10),
  jiuyuan: c('A', 2, 'CRIT Rate', 6),
  lacrimosa: c('A', 3, 'Chaos DMG', 10),
  linko: c('D', 3, 'CRIT Rate', 8),
  mint: c('D', 3, 'CRIT Rate', 7.5),
  nanally: c('A', 2, 'CRIT Rate', 6),
  sakiri: c('B', 3, 'Incantation DMG', 9),
  shinku: c('A', 3, 'CRIT DMG', 16),
  skia: c('D', 3, 'ATK', 10),
  zankou: c('D', 3, 'CRIT DMG', 16),
  zero: c('C', 3, 'ATK', 10),
};

/** Cells covered by a shape placed with its top-left at (r, c). */
export const footprint = (shapeId, r, col) => SHAPES[shapeId].cells.map(([dr, dc]) => [r + dr, col + dc]);

/** Can `shapeId` go at (r, c) given the layout mask and existing pieces? */
export function canPlace(layoutId, pieces, shapeId, r, col) {
  const mask = maskOf(layoutId);
  const taken = new Set(pieces.flatMap((p) => footprint(p.shape, p.r, p.c)).map(([a, b]) => `${a},${b}`));
  return footprint(shapeId, r, col).every(
    ([a, b]) => a >= 0 && b >= 0 && a < CONSOLE_SIZE && b < CONSOLE_SIZE && mask[a][b] && !taken.has(`${a},${b}`),
  );
}

/** Which piece (index) covers each cell: 5x5 array of index | -1. */
export function occupancy(pieces) {
  const grid = Array.from({ length: CONSOLE_SIZE }, () => Array(CONSOLE_SIZE).fill(-1));
  pieces.forEach((p, i) => footprint(p.shape, p.r, p.c).forEach(([a, b]) => { grid[a][b] = i; }));
  return grid;
}

/** Set progress: how many placed modules count toward the cartridge's set. */
export function setProgress(cartridgeId, pieces) {
  const shapes = SET_SHAPES[cartridgeId] ?? [];
  const perShape = Object.fromEntries(shapes.map((s) => [s, 0]));
  let count = 0;
  for (const p of pieces) {
    if (p.shape in perShape) {
      perShape[p.shape] += 1;
      count += 1;
    }
  }
  return { shapes, perShape, count, two: count >= 2, four: count >= 4 };
}

/** The character's per-module bonus for this console. */
export function specBonus(characterId, pieces) {
  const info = CHARACTER_CONSOLE[characterId];
  if (!info) return null;
  const n = pieces.filter((p) => SHAPES[p.shape].type === info.spec.type).length;
  return { ...info.spec, count: n, total: Math.round(n * info.spec.value * 100) / 100 };
}

export const usedCells = (pieces) => pieces.reduce((sum, p) => sum + SHAPES[p.shape].cells.length, 0);
export const FREE_CELLS = 20;

/** Characters sharing a layout, so a saved console can be equipped on any of them. */
export const charactersWithLayout = (layoutId) =>
  Object.entries(CHARACTER_CONSOLE).filter(([, v]) => v.layout === layoutId).map(([id]) => id);

// The character bonus names, written the way the stat lists name them.
const SPEC_STAT = { ATK: 'ATK%', DEF: 'DEF%', HP: 'HP%' };
const specStatName = (stat) => SPEC_STAT[stat] ?? (stat.endsWith('DMG') && !stat.startsWith('CRIT') ? `${stat}%` : stat);

/**
 * Everything the Console adds: module main and sub stats, the character's
 * per-module bonus and the Cartridge set's 2-piece bonus once it is active.
 * Returns [{ stat, value, from }].
 */
export function consoleStats(characterId, pieces, cartridgeId) {
  const out = [];
  for (const p of pieces ?? []) {
    const st = p.stats;
    if (!st) continue;
    if (st.atk) out.push({ stat: 'ATK', value: st.atk, from: 'module' });
    if (st.hp) out.push({ stat: 'HP', value: st.hp, from: 'module' });
    // Sub slots still locked at the piece's level don't count.
    const open = unlockedSubs(moduleLevel(st));
    (st.subs ?? []).slice(0, open).forEach((sub) => {
      if (sub?.value) out.push({ stat: sub.stat, value: sub.value, from: 'module' });
    });
  }
  const spec = specBonus(characterId, pieces ?? []);
  if (spec && spec.total) out.push({ stat: specStatName(spec.stat), value: spec.total, from: 'bonus' });
  if (cartridgeId && setProgress(cartridgeId, pieces ?? []).two) {
    const b = parseSetBonus(CARTRIDGE_BY_ID[cartridgeId]?.two);
    if (b) out.push({ ...b, from: 'set' });
  }
  return out;
}
