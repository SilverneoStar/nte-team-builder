// Splits game text into plain runs, stat keywords and values, so pages and
// export cards can draw "CRIT DMG" and "+30%" in their highlight colours.
// Shared by the StatText component (site) and the canvas cards.

// Words that can sit in front of "DMG" as part of one stat name,
// e.g. "Psyche Esper Ability DMG", "Basic Attack DMG", "Ultimate CRIT DMG".
const MOD =
  '(?:Lakshana|Psyche|Cosmos|Anima|Chaos|Incantation|Mental|Esper|Ability|Basic|Attack|Redirect|Support|Skill|Ultimate|Critical|Riposte|Attach|Attachment|Boss|Universal|Break|DoT|Elemental)';
const KEYWORDS = [
  `(?:${MOD} ){0,4}(?:CRIT|Crit) (?:DMG|Rate)`,
  `(?:${MOD} ){0,4}DMG(?: Bonus| dealt)?`,
  'Charge Efficiency',
  'Cycle Intensity',
  'Break Intensity',
  'Healing Received Bonus',
  'Healing Bonus',
  'Max HP',
  'Ultimate Energy',
  'HP%?',
  'ATK%?',
  'DEF%?',
  'Stamina',
];
const KEY = `\\b(?:${KEYWORDS.join('|')})(?![A-Za-z])`;
// +16%, -18%, −30%, 1,818,000, 0.3s, 20s, ×5, 72. Not the digits inside
// names like A1, R3, Lv80 or Type III.
const NUM = '(?<![A-Za-z0-9.])(?:[+\\-−×x]\\s?)?\\d[\\d,]*(?:\\.\\d+)?(?:%|s\\b)?(?:\\+)?(?![A-Za-z0-9])';
const RE = new RegExp(`(${KEY})|(${NUM})`, 'g');

/** Returns [{ t: 'text' | 'key' | 'num', s }]. */
export function statParts(text) {
  const out = [];
  if (!text) return out;
  let last = 0;
  for (const m of String(text).matchAll(RE)) {
    if (m.index > last) out.push({ t: 'text', s: text.slice(last, m.index) });
    out.push({ t: m[1] ? 'key' : 'num', s: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ t: 'text', s: text.slice(last) });
  return out;
}

/**
 * Draws game text on a canvas with stat names and values in their own colours.
 * Truncates with "…" at maxWidth. Returns the drawn width.
 */
export function fillStatText(
  ctx,
  text,
  x,
  y,
  { font, numFont = font, color, keyColor, numColor, maxWidth = Infinity },
) {
  let cx = x;
  const align = ctx.textAlign;
  ctx.textAlign = 'left';
  for (const p of statParts(text)) {
    ctx.font = p.t === 'num' ? numFont : font;
    ctx.fillStyle = p.t === 'num' ? numColor : p.t === 'key' ? keyColor : color;
    let s = p.s;
    if (cx + ctx.measureText(s).width > x + maxWidth) {
      while (s && cx + ctx.measureText(`${s}…`).width > x + maxWidth) s = s.slice(0, -1);
      ctx.fillText(`${s.trimEnd()}…`, cx, y);
      cx += ctx.measureText(`${s}…`).width;
      break;
    }
    ctx.fillText(s, cx, y);
    cx += ctx.measureText(s).width;
  }
  ctx.textAlign = align;
  return cx - x;
}
