// Console codes: share one Console build as a short code.
import { CARTRIDGE_SUB_SLOTS, isPercentStat } from '../data/gear.js';
import { CONSOLE_SIZE, SHAPES, maskOf } from '../data/console.js';
import {
  ALPHABET,
  BitReader,
  BitWriter,
  CART_ORDER,
  MAIN_STAT_ORDER,
  SUB_STAT_ORDER,
  checkByte,
  cleanCode,
  segment,
  toBits,
  toChars,
} from './cardCode.js';

// Console codes: share a Console build without sharing a team, e.g.
//   K3P0A-9QW2E-...    (segments of 5 characters; usually 4–5 segments)
//
// Bits:
//   version (3) · grid layout (3) · Cartridge set (5)
//   has stats (1) → has main (1) [stat (4) + value] · sub mask (4) · per sub: stat (4) + value
//   modules: one 4-bit symbol per step, scanning free cells in reading order:
//     0 = leave this cell empty, 1–12 = a module whose top-left cell is here
//   check (8), then zero padding to a whole segment.
// Values: % stats in tenths, flat stats as whole numbers; size class (2) + 7/10/13/16 bits.
// Module stats are not included; the importer enters their own rolls.
//
// APPEND-ONLY lists, as in cardCode.js.
const LAYOUT_ORDER = ['A', 'B', 'C', 'D'];
const SHAPE_CODE = [
  'Hen2',
  'Shu2',
  'Hen3',
  'Shu3',
  'ZhiJiao1',
  'ZhiJiao2',
  'ZhiJiao3',
  'ZhiJiao4',
  'Hen4',
  'Shu4',
  'Z3',
  'Z4',
];
const VERSION = 0b101;
const SALT = 0x3c;
const VALUE_BITS = [7, 10, 13, 16];

function writeValue(w, stat, value) {
  const scale = isPercentStat(stat) ? 10 : 1;
  const v = Math.max(0, Math.min(2 ** 16 - 1, Math.round(Number(value || 0) * scale)));
  const cls = VALUE_BITS.findIndex((b) => v < 2 ** b);
  w.write(cls, 2);
  w.write(v, VALUE_BITS[cls]);
}
const readValue = (r, stat) => r.read(VALUE_BITS[r.read(2)]) / (isPercentStat(stat) ? 10 : 1);

/** { layout, cartridge, cartStats, pieces } → 'XXXXX-XXXXX-…' */
export function encodeConsoleCode({ layout, cartridge, cartStats, pieces }) {
  const w = new BitWriter();
  w.write(VERSION, 3);
  w.write(LAYOUT_ORDER.indexOf(layout), 3);
  w.write(CART_ORDER.indexOf(cartridge) + 1, 5);

  const main = cartStats?.main && MAIN_STAT_ORDER.includes(cartStats.main.stat) ? cartStats.main : null;
  const subs = Array.from({ length: CARTRIDGE_SUB_SLOTS }, (_, i) => {
    const x = cartStats?.subs?.[i];
    return x && SUB_STAT_ORDER.includes(x.stat) ? x : null;
  });
  const hasStats = Boolean(main) || subs.some(Boolean);
  w.write(hasStats ? 1 : 0, 1);
  if (hasStats) {
    w.write(main ? 1 : 0, 1);
    if (main) {
      w.write(MAIN_STAT_ORDER.indexOf(main.stat), 4);
      writeValue(w, main.stat, main.value);
    }
    subs.forEach((x) => w.write(x ? 1 : 0, 1));
    for (const x of subs) {
      if (!x) continue;
      w.write(SUB_STAT_ORDER.indexOf(x.stat), 4);
      writeValue(w, x.stat, x.value);
    }
  }

  // Modules, by the reading-order scan described above.
  const mask = maskOf(layout);
  const start = new Map(
    (pieces ?? []).map((p) => {
      const [fr, fc] = SHAPES[p.shape].cells[0];
      return [`${p.r + fr},${p.c + fc}`, p.shape];
    }),
  );
  const filled = new Set();
  for (const p of pieces ?? []) for (const [a, b] of SHAPES[p.shape].cells) filled.add(`${p.r + a},${p.c + b}`);
  const covered = new Set();
  for (let r = 0; r < CONSOLE_SIZE; r += 1) {
    for (let c = 0; c < CONSOLE_SIZE; c += 1) {
      const key = `${r},${c}`;
      if (!mask[r][c] || covered.has(key)) continue;
      const shape = start.get(key);
      if (shape) {
        w.write(SHAPE_CODE.indexOf(shape) + 1, 4);
        const [fr, fc] = SHAPES[shape].cells[0];
        for (const [a, b] of SHAPES[shape].cells) covered.add(`${r - fr + a},${c - fc + b}`);
      } else {
        w.write(0, 4);
        covered.add(key);
      }
    }
  }

  const check = checkByte(w.bits, SALT);
  w.write(check, 8);
  const bits = w.bits;
  while (bits.length % 25) bits.push(0); // 25 bits = one 5-character segment
  return segment(toChars(bits));
}

/** Returns { layout, cartridge, cartStats, pieces } or null if the code isn't valid. */
export function decodeConsoleCode(input) {
  const clean = cleanCode(input);
  if (!clean || clean.length % 5 || [...clean].some((ch) => !ALPHABET.includes(ch))) return null;
  const bits = toBits(clean);
  const r = new BitReader(bits);
  try {
    if (r.read(3) !== VERSION) return null;
    const layout = LAYOUT_ORDER[r.read(3)];
    if (!layout) return null;
    const ct = r.read(5);
    if (ct && !CART_ORDER[ct - 1]) return null;
    const cartStats = { main: null, subs: Array(CARTRIDGE_SUB_SLOTS).fill(null) };
    if (r.read(1)) {
      if (r.read(1)) {
        const stat = MAIN_STAT_ORDER[r.read(4)];
        if (!stat) return null;
        cartStats.main = { stat, value: readValue(r, stat) };
      }
      const mask = Array.from({ length: CARTRIDGE_SUB_SLOTS }, () => r.read(1));
      cartStats.subs = mask.map((on) => {
        if (!on) return null;
        const stat = SUB_STAT_ORDER[r.read(4)];
        if (!stat) throw new Error('bad stat');
        return { stat, value: readValue(r, stat) };
      });
    }
    const grid = maskOf(layout);
    const covered = new Set();
    const pieces = [];
    for (let row = 0; row < CONSOLE_SIZE; row += 1) {
      for (let col = 0; col < CONSOLE_SIZE; col += 1) {
        const key = `${row},${col}`;
        if (!grid[row][col] || covered.has(key)) continue;
        const sym = r.read(4);
        if (sym === 0) {
          covered.add(key);
          continue;
        }
        const shape = SHAPE_CODE[sym - 1];
        if (!shape) return null;
        const [fr, fc] = SHAPES[shape].cells[0];
        const cells = SHAPES[shape].cells.map(([a, b]) => [row - fr + a, col - fc + b]);
        if (
          cells.some(
            ([a, b]) =>
              a < 0 || b < 0 || a >= CONSOLE_SIZE || b >= CONSOLE_SIZE || !grid[a][b] || covered.has(`${a},${b}`),
          )
        ) {
          return null;
        }
        cells.forEach(([a, b]) => covered.add(`${a},${b}`));
        pieces.push({ shape, r: row - fr, c: col - fc });
      }
    }
    const body = bits.slice(0, r.pos);
    if (r.read(8) !== checkByte(body, SALT)) return null;
    return { layout, cartridge: ct ? CART_ORDER[ct - 1] : null, cartStats, pieces };
  } catch {
    return null;
  }
}
