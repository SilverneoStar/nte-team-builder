// Card codes printed on team images: encode and decode a team with its gear.
import { ARCS, ARC_BY_ID } from '../data/arcs.js';
import { CHARACTER_BY_ID } from '../data/characters.js';
import { MAX_DUPES } from '../data/awakenings.js';
import { CARTRIDGES, CARTRIDGE_SUB_SLOTS, MODULE_STATS, MODULE_SUB_STATS, isPercentStat } from '../data/gear.js';
import { TEAM_SIZE } from './analyze.js';

// Card codes: the code printed on exported team cards.
// Current format (v5, see below): 4 segments of 5 characters, e.g. 5A0B2-00C0K-140B7-QE3W2.
// Older formats in 4-character groups are still accepted when importing:
//   700B-00C0-140B                 team, duplicates and Arcs
//   700B-00C0-140B-5GQ2-0000       ... plus Cartridge sets and Cartridge stats
//
// HEAD (always 12 characters, 60 bits):
//   per member, 14 bits: character (6) · duplicates (3) · Arc (5)
//   then a 4-bit check value, so typos are caught.
//
// GEAR TAIL (only when some gear is set; groups of 4 characters):
//   5-bit check value, then for each filled team slot:
//     has Cartridge set (1) · has Cartridge stats (1)
//     Cartridge set (5)                                    if set
//     has main (1), main stat (4) + value                  if stats
//     sub mask (4), then per sub: sub stat (4) + value
//   value = hundredths for % stats, whole numbers for flat stats,
//           written as size class (2) + 8 / 11 / 14 / 17 bits.
//   padded with zeros to a whole group.
//
// IMPORTANT: every list below is APPEND-ONLY. Codes refer to positions in
// them, so reordering or removing entries would break codes already shared.
// When the game adds a character, Arc, Cartridge or module stat, add it at the end.

const CHAR_ORDER = [
  'baicang', 'blackbird', 'chaos', 'chiz', 'daffodill', 'zero', 'fadia', 'hathor',
  'hotori', 'iroi', 'jiuyuan', 'lacrimosa', 'linko', 'nanally', 'sakiri', 'shinku',
  'zankou', 'akane', 'elyms', 'exe', 'adler', 'aurelia', 'edgar', 'haniel', 'mint', 'skia',
];

const ARC_ORDER = [
  'blow-up-the-crowd', 'blushing-mirage', 'camellia-society', 'contemplative-cat',
  'crime-and-punishment', 'day-off', 'eternal-waltz', 'far-side-of-the-moon',
  'fluff-of-fearlessness', 'fluff-of-ferocity', 'fluff-of-finesse', 'fluff-of-fleetness',
  'fluff-of-fortitude', 'good-boys-grand-adventure', 'hethereaus-keeper', 'marching-beyond-time',
  'raging-flames', 'ravenous-blade', 'ready-ready', 'reality-refuge', 'song-of-the-whale',
  'stellar-veil', 'tears-beneath-the-mask', 'the-last-rose', 'the-rain-that-shook-the-world',
  'the-wrong-gate', 'voice-of-the-voyager', 'whats-desired', 'your-happiness-is-priceless',
  'youthful-fantasy', 'a-time-will-come', 'call-of-the-twisted-city', 'clear-skies',
  'cosmos-daze-wild-reverie', 'drawn-blade', 'failing-you-heavy-in-my-heart', 'mind-royale',
  'oraora', 'shiny-days', 'the-fools-spring', 'the-forgotten', 'the-good-the-bad-the-bitter',
  'the-great-thief', 'time-bandit', 'umbrella', 'watch-your-heads', 'be-happy',
  'dangerous-game', 'first-step-to-success', 'real-music', 'us',
];

const CART_ORDER = [
  'crimson-twin-butterflies', 'devils-blood-curse', 'diabolos', 'fireflies-and-the-forest',
  'kingdoms-guard', 'lost-radiance', 'quiet-manor', 'shadow-creed', 'speedy-hedgehog',
  'street-boxer', 'theas-night-tavern', 'tiny-big-adventure',
];

// Cartridge main attributes.
const MAIN_STAT_ORDER = [
  'HP%', 'ATK%', 'DEF%', 'CRIT Rate', 'CRIT DMG', 'Cycle Intensity', 'Break Intensity',
  'Healing%', 'Cosmos DMG%', 'Anima DMG%', 'Incantation DMG%', 'Chaos DMG%', 'Psyche DMG%',
  'Lakshana DMG%', 'Mental DMG%',
];

// Cartridge sub attributes.
const SUB_STAT_ORDER = [
  'HP', 'HP%', 'ATK', 'ATK%', 'DEF', 'DEF%', 'Break Intensity', 'Cycle Intensity', 'DMG%',
  'CRIT Rate', 'CRIT DMG',
];

// Crockford base 32: no I, L, O or U, so codes are easy to read and type.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const HEAD_SALT = 0x9; // change if a layout ever changes, so old and new codes can't be confused
const TAIL_SALT = 0x1d; // v3: Cartridge stats (older tails are rejected, heads still work)
const HEAD_CHARS = 12;
const GROUP = 4;

// Arcs a character can use, in stable order. Index 0 means "no Arc".
const arcsOfType = (type) => ARC_ORDER.filter((id) => ARC_BY_ID[id]?.type === type);

// ---- bit helpers ---------------------------------------------------------

class BitWriter {
  bits = [];
  write(value, width) {
    for (let i = width - 1; i >= 0; i -= 1) this.bits.push((value >> i) & 1);
  }
}

class BitReader {
  constructor(bits) {
    this.bits = bits;
    this.pos = 0;
  }
  read(width) {
    if (this.pos + width > this.bits.length) throw new Error('short');
    let v = 0;
    for (let i = 0; i < width; i += 1) v = (v << 1) | this.bits[this.pos++];
    return v;
  }
}

const toChars = (bits) => {
  let out = '';
  for (let i = 0; i < bits.length; i += 5) {
    let v = 0;
    for (let k = 0; k < 5; k += 1) v = (v << 1) | (bits[i + k] ?? 0);
    out += ALPHABET[v];
  }
  return out;
};

const toBits = (chars) =>
  [...chars].flatMap((ch) => {
    const v = ALPHABET.indexOf(ch);
    return [4, 3, 2, 1, 0].map((i) => (v >> i) & 1);
  });

// ---- head ----------------------------------------------------------------
// Older 4-character-group codes (head + gear tail) are only decoded now, so
// cards shared before the v5 format still import. New codes use encodeV5.

function headCheck(value) {
  let sum = 0n;
  for (let i = 0n; i < 14n; i += 1n) sum += ((value >> (i * 4n)) & 15n) * (i + 1n);
  return Number(sum % 16n) ^ HEAD_SALT;
}

function decodeHead(chars) {
  let value = 0n;
  for (const ch of chars) value = (value << 5n) | BigInt(ALPHABET.indexOf(ch));
  const sum = Number(value & 15n);
  value >>= 4n;
  if (headCheck(value) !== sum) return null;

  const members = [];
  const loadouts = {};
  for (let i = TEAM_SIZE - 1; i >= 0; i -= 1) {
    const a = Number(value & 31n);
    const d = Number((value >> 5n) & 7n);
    const c = Number((value >> 8n) & 63n);
    value >>= 14n;
    if (c === 0) {
      members[i] = null;
      continue;
    }
    const id = CHAR_ORDER[c - 1];
    if (!id || !CHARACTER_BY_ID[id] || members.includes(id) || d > MAX_DUPES) return null;
    const list = arcsOfType(CHARACTER_BY_ID[id].arcType);
    if (a > list.length) return null;
    members[i] = id;
    loadouts[id] = { dupes: d, arc: a ? list[a - 1] : null };
  }
  if (!members.some(Boolean)) return null;
  return { members, loadouts };
}

// ---- gear tail -----------------------------------------------------------

// Ties the tail to its head, so a tail can't be pasted onto another team.
function tailCheck(head, bits) {
  let sum = 0;
  for (let i = 0; i < head.length; i += 1) sum += ALPHABET.indexOf(head[i]) * (i + 1);
  for (let i = 0; i < bits.length; i += 5) {
    let v = 0;
    for (let k = 0; k < 5; k += 1) v = (v << 1) | (bits[i + k] ?? 0);
    sum += v * (i / 5 + 7);
  }
  return (sum % 32) ^ TAIL_SALT;
}

// Percentages are stored in hundredths, flat stats as whole numbers.
const VALUE_BITS = [8, 11, 14, 17]; // legacy tails

function readValue(r, stat) {
  return r.read(VALUE_BITS[r.read(2)]) / (isPercentStat(stat) ? 100 : 1);
}

function decodeTail(head, chars, base) {
  if (chars.length % GROUP !== 0) return null;
  const bits = toBits(chars);
  const body = bits.slice(5);
  const r = new BitReader(bits);
  if (r.read(5) !== tailCheck(head, body)) return null;
  try {
    for (const id of base.members) {
      if (!id) continue;
      const hasCart = r.read(1);
      const hasStats = r.read(1);
      if (hasCart) {
        const cart = CART_ORDER[r.read(5)];
        if (!cart) return null;
        base.loadouts[id].cartridge = cart;
      }
      if (hasStats) {
        let main = null;
        if (r.read(1)) {
          const stat = MAIN_STAT_ORDER[r.read(4)];
          if (!stat) throw new Error('bad stat');
          main = { stat, value: readValue(r, stat) };
        }
        const mask = Array.from({ length: CARTRIDGE_SUB_SLOTS }, () => r.read(1));
        const subs = mask.map((on) => {
          if (!on) return null;
          const stat = SUB_STAT_ORDER[r.read(4)];
          if (!stat) throw new Error('bad stat');
          return { stat, value: readValue(r, stat) };
        });
        base.loadouts[id].cartStats = { main, subs };
      }
    }
  } catch {
    return null;
  }
  return base;
}

// ---- current format (v5): 4 segments of 5 characters ---------------------
//
// 100 bits = 20 Crockford base-32 characters, shown as XXXXX-XXXXX-XXXXX-XXXXX:
//   version (4) = 0b0101
//   per member, 22 bits: character (6) · duplicates (3) · Arc (5) · Arc copies (3) · Cartridge set (5)
//   check value (8)
// Cartridge stats and Console layouts travel in Console codes (lib/consoleCode.js).

const V5 = 0b0101;
const V5_CHARS = 20;
const SEG = 5;
const segment = (str) => str.match(new RegExp(`.{1,${SEG}}`, 'g')).join('-');

/** 8-bit check over 5-bit chunks, so most typos are caught. */
export function checkByte(bits, salt) {
  let sum = 0;
  for (let i = 0; i < bits.length; i += 5) {
    let v = 0;
    for (let k = 0; k < 5; k += 1) v = (v << 1) | (bits[i + k] ?? 0);
    sum = (sum * 31 + v + i) % 251;
  }
  return sum ^ salt;
}

function encodeV5(team, loadoutOf) {
  const w = new BitWriter();
  w.write(V5, 4);
  for (let i = 0; i < TEAM_SIZE; i += 1) {
    const id = team.members[i];
    if (!id || !CHAR_ORDER.includes(id)) {
      w.write(0, 22);
      continue;
    }
    const lo = loadoutOf(team, id);
    const list = arcsOfType(CHARACTER_BY_ID[id].arcType);
    w.write(CHAR_ORDER.indexOf(id) + 1, 6);
    w.write(Math.min(Math.max(lo.dupes | 0, 0), MAX_DUPES), 3);
    w.write(lo.arc ? list.indexOf(lo.arc) + 1 : 0, 5);
    w.write(Math.min(Math.max(lo.arcDupes | 0, 0), 7), 3);
    w.write(CART_ORDER.indexOf(lo.cartridge) + 1, 5);
  }
  w.write(checkByte(w.bits, 0x5a), 8);
  return segment(toChars(w.bits));
}

function decodeV5(clean) {
  if (clean.length !== V5_CHARS) return null;
  const bits = toBits(clean);
  const body = bits.slice(0, 92);
  const r = new BitReader(bits);
  if (r.read(4) !== V5) return null;
  const members = [];
  const loadouts = {};
  for (let i = 0; i < TEAM_SIZE; i += 1) {
    const c = r.read(6), d = r.read(3), a = r.read(5), ad = r.read(3), ct = r.read(5);
    if (c === 0) {
      members.push(null);
      continue;
    }
    const id = CHAR_ORDER[c - 1];
    if (!id || !CHARACTER_BY_ID[id] || members.includes(id) || d > MAX_DUPES) return null;
    const list = arcsOfType(CHARACTER_BY_ID[id].arcType);
    if (a > list.length || (ct && !CART_ORDER[ct - 1])) return null;
    members.push(id);
    loadouts[id] = { dupes: d, arc: a ? list[a - 1] : null, arcDupes: a ? ad : 0, cartridge: ct ? CART_ORDER[ct - 1] : null };
  }
  if (r.read(8) !== checkByte(body, 0x5a)) return null;
  if (!members.some(Boolean)) return null;
  return { members, loadouts };
}

// ---- public API ----------------------------------------------------------

/** Cleans a typed code: case, spaces, dashes and look-alike letters. */
export const cleanCode = (input) =>
  (input ?? '').toUpperCase().replace(/[\s-]/g, '').replace(/[IL]/g, '1').replace(/O/g, '0');

// ---- Team name, packed after the 4 team segments ----
// One code character per letter or space (5 bits each). Capitals at the start
// of words come back automatically (Title Case), so "Mono Blossom" costs
// exactly its 12 letters and space, plus 1 header character.
//   header: case mode (2 bits: 0 Title, 1 UPPER, 2 lower) + check (3 bits)
//   symbols: 1–26 a–z · 27 space · 28 flip the case of the next letter ·
//            30 next symbol is a digit or punctuation from NAME_EXTRA
const NAME_EXTRA = '0123456789-\'&.!?+/:#(),_"*@%~=<>';
const NAME_MAX = 40;
const NAME_SALT = 5;
const nameCheck = (syms) => (syms.reduce((a, v, i) => a + v * (i + 1), 0) + NAME_SALT) % 8;

function nameSymbols(name, mode) {
  const out = [];
  let wordStart = true;
  for (const ch of name) {
    const lower = ch.toLowerCase();
    const code = lower.charCodeAt(0) - 96;
    if (code >= 1 && code <= 26 && lower !== ch.toUpperCase()) {
      const expectUpper = mode === 1 || (mode === 0 && wordStart);
      if ((ch !== lower) !== expectUpper) out.push(28);
      out.push(code);
      wordStart = false;
    } else if (ch === ' ') {
      out.push(27);
      wordStart = true;
    } else if (NAME_EXTRA.includes(ch)) {
      out.push(30, NAME_EXTRA.indexOf(ch));
      wordStart = false;
    }
  }
  return out;
}

function encodeName(name) {
  const clean = (name ?? '').replace(/[‘’ʼ`]/g, "'").replace(/[“”]/g, '"').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);
  if (!clean) return '';
  // Pick the case mode that needs the fewest flips.
  const [mode, syms] = [0, 1, 2].map((m) => [m, nameSymbols(clean, m)]).sort((a, b) => a[1].length - b[1].length)[0];
  if (!syms.length) return '';
  return [((mode << 3) | nameCheck(syms)), ...syms].map((v) => ALPHABET[v]).join('');
}

/** Name part of a code → string, '' when there is none, null when it doesn't check out. */
function decodeName(chars) {
  if (!chars) return '';
  const vals = [...chars].map((ch) => ALPHABET.indexOf(ch));
  const [head, ...syms] = vals;
  const mode = head >> 3;
  if (mode > 2 || (head & 7) !== nameCheck(syms)) return null;
  let out = '';
  let wordStart = true;
  let flip = false;
  for (let i = 0; i < syms.length; i += 1) {
    const v = syms[i];
    if (v >= 1 && v <= 26) {
      const upper = (mode === 1 || (mode === 0 && wordStart)) !== flip;
      const ch = String.fromCharCode(96 + v);
      out += upper ? ch.toUpperCase() : ch;
      flip = false;
      wordStart = false;
    } else if (v === 27) {
      out += ' ';
      wordStart = true;
    } else if (v === 28) {
      flip = true;
    } else if (v === 30 && i + 1 < syms.length && syms[i + 1] < NAME_EXTRA.length) {
      out += NAME_EXTRA[syms[i + 1]];
      i += 1;
      wordStart = false;
    } else {
      return null;
    }
  }
  return out;
}

/** team + loadoutOf(team, id) → 'XXXXX-XXXXX-XXXXX-XXXXX' plus the team name's segments. */
export function encodeCardCode(team, loadoutOf) {
  const teamPart = encodeV5(team, loadoutOf);
  const namePart = encodeName(team.name);
  return namePart ? `${teamPart}-${segment(namePart)}` : teamPart;
}

/** Splits a code into its team part and name part (for showing them on separate lines). */
export function splitCardCode(code) {
  const groups = code.split('-');
  return [groups.slice(0, V5_CHARS / SEG).join('-'), groups.slice(V5_CHARS / SEG).join('-')];
}

/**
 * Returns { members, loadouts, name? } or null. Accepts the current and all older
 * formats. `name` is set when the code carries one; a mistyped name part still
 * imports the team (without the name).
 */
export function decodeCardCode(input) {
  if (!input) return null;
  const clean = cleanCode(input);
  if ([...clean].some((ch) => !ALPHABET.includes(ch))) return null;
  const v5 = decodeV5(clean.slice(0, V5_CHARS));
  if (v5) {
    const name = decodeName(clean.slice(V5_CHARS));
    return name ? { ...v5, name } : { ...v5, nameInvalid: name === null };
  }
  // Older 4-character-group codes.
  if (clean.length < HEAD_CHARS) return null;
  const head = clean.slice(0, HEAD_CHARS);
  const base = decodeHead(head);
  if (!base) return null;
  const tail = clean.slice(HEAD_CHARS);
  return tail ? decodeTail(head, tail, base) : base;
}

// Shared with lib/consoleCode.js.
export { ALPHABET, BitReader, BitWriter, CART_ORDER, MAIN_STAT_ORDER, SUB_STAT_ORDER, segment, toBits, toChars };

// Keep the code lists in step with the data during development.
if (import.meta.env.DEV) {
  const missing = [
    ...Object.keys(CHARACTER_BY_ID).filter((id) => !CHAR_ORDER.includes(id)),
    ...ARCS.map((a) => a.id).filter((id) => !ARC_ORDER.includes(id)),
    ...CARTRIDGES.map((c) => c.id).filter((id) => !CART_ORDER.includes(id)),
    ...MODULE_STATS.filter((s) => !MAIN_STAT_ORDER.includes(s)),
    ...MODULE_SUB_STATS.filter((s) => !SUB_STAT_ORDER.includes(s)),
  ];
  if (missing.length) console.warn('cardCode.js: add these to the end of the code lists:', missing);
}
