// Base HP, ATK and DEF at every level step (no gear), from Level 1 stats.
// Source: the stats-by-level tables on neverness.gg (Nov 2026), sent in by the
// project owner for 19 Espers.
//
// The game grows each stat from its Level 1 value along fixed tables: every
// Esper with the same Level 1 ATK (or DEF) has the same ATK (or DEF) column.
// HP follows the rule below exactly; ATK and DEF columns we've seen are kept
// as is, because the game's rounding puts some steps 1 off the rule. For a
// Level 1 value we haven't seen, the rule gives values within 1 (`approx`).
//
// The rule: Level 20 is Level 1 ×2.52 (ATK ×1.95), Level 80 is ×12.12
// (ATK ×7.95), and the 12 steps between (each ascension "+" and each
// 10 levels) add the same amount.
import { CHARACTER_BY_ID } from './characters.js';

export const LEVEL_STEPS = ['1', '20', '20+', '30', '30+', '40', '40+', '50', '50+', '60', '60+', '70', '70+', '80'];

const GROWTH = { hp: [2.52, 12.12], atk: [1.95, 7.95], def: [2.52, 12.12] };

const KNOWN = {
  atk: {
    55: [55, 107, 135, 163, 190, 217, 245, 273, 300, 327, 355, 383, 410, 437],
    75: [75, 146, 184, 222, 259, 296, 334, 372, 409, 446, 484, 522, 559, 596],
    70: [70, 137, 172, 207, 242, 277, 312, 347, 382, 417, 452, 487, 522, 557],
    76: [76, 148, 186, 224, 262, 300, 338, 376, 414, 452, 490, 528, 566, 604],
    78: [78, 152, 191, 230, 269, 308, 347, 386, 425, 464, 503, 542, 581, 620],
    80: [80, 156, 196, 236, 276, 316, 356, 396, 436, 476, 516, 556, 596, 636],
    81: [81, 158, 199, 239, 279, 320, 361, 401, 441, 482, 523, 563, 603, 644],
    82: [82, 160, 201, 242, 283, 324, 365, 406, 447, 488, 529, 570, 611, 652],
    84: [84, 164, 206, 248, 290, 332, 374, 416, 458, 500, 542, 584, 626, 668],
    85: [85, 166, 209, 251, 293, 336, 379, 421, 463, 506, 549, 591, 633, 676],
  },
  def: {
    55: [55, 139, 183, 227, 271, 315, 359, 403, 447, 491, 535, 579, 623, 667],
    60: [60, 151, 199, 247, 295, 343, 391, 439, 487, 535, 583, 631, 679, 727],
    66: [66, 166, 219, 272, 325, 378, 430, 483, 536, 589, 642, 694, 747, 800],
    70: [70, 176, 232, 288, 344, 400, 456, 512, 568, 624, 680, 736, 792, 848],
    72: [72, 181, 239, 297, 354, 412, 470, 527, 584, 642, 700, 757, 815, 873],
    73: [73, 184, 242, 300, 359, 418, 476, 534, 593, 652, 710, 768, 826, 884],
    74: [74, 186, 245, 305, 364, 423, 483, 542, 601, 660, 719, 778, 837, 897],
    75: [75, 189, 249, 309, 369, 429, 489, 549, 609, 669, 729, 789, 849, 909],
    76: [76, 192, 253, 313, 374, 435, 495, 556, 617, 678, 739, 800, 861, 921],
    82: [82, 207, 273, 338, 403, 469, 535, 600, 665, 731, 797, 863, 929, 994],
  },
};

const round = (x) => Math.round(x + 1e-9);
function byRule(base, [g20, g80]) {
  const l20 = round(base * g20);
  const l80 = round(base * g80);
  return [base, ...Array.from({ length: 13 }, (_, k) => round(l20 + ((l80 - l20) * k) / 12))];
}

/**
 * Stats at every level step for a character, or null without Level 1 stats:
 * { rows: [{ level, hp, atk, def }], approx } — approx when a column came from
 * the rule rather than a known table.
 */
export function levelStats(characterId) {
  const s = CHARACTER_BY_ID[characterId]?.stats;
  if (!s) return null;
  let approx = false;
  const col = (k) => {
    const known = KNOWN[k]?.[s[k]];
    if (known) return known;
    if (k !== 'hp') approx = true;
    return byRule(s[k], GROWTH[k]);
  };
  const hp = col('hp');
  const atk = col('atk');
  const def = col('def');
  return { rows: LEVEL_STEPS.map((level, i) => ({ level, hp: hp[i], atk: atk[i], def: def[i] })), approx };
}
