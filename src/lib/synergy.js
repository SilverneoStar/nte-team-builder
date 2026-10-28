// Team synergy score: one number (0–100) and a rank letter for how well a
// team fits together, with the reasons behind it. It's a guide to team
// building, not a damage calculator: investment, rotations and skill matter
// more in a real fight. Shown by Cortado in the team builder's Synergy panel
// and on exported team images. The same idea as the ZZZ site's score, built
// on NTE's own mechanics: the Esper Cycle, reaction passives, roles, Instant
// Cycle, Arcs, Cartridges, awakenings and Resonance.
//
// Points (94 in total, scaled to 100):
//   Esper Cycle        30  a reaction (18), every member's element reacting
//                          with a teammate's (7), a trio (Charge, Discord) (5)
//   Reaction passives  20  a member's first passive boosts a reaction this
//                          team triggers (10 each)
//   Roles              20  Damage, Buff and Survival; three or more Main DPS
//                          fight over field time (−4)
//   Team buffs         10  DMG Boost, RES Shred and Break Boost for a damage
//                          dealer (5 each)
//   Instant Cycle       6  Esper Zero or Blackbird refill the Esper Meter, so
//                          the team reacts far more often
//   Known team          8  a community team (8), a kit-based idea (5), or
//                          pairs from them
//   Gear (bonus part)  12  recommended or signature Arcs and recommended
//                          Cartridge sets. Only counted once some gear is
//                          equipped; the score is then out of 106.
//   Awakenings & Arcs  up to 8 bonus points on top (not added to the total to
//                          aim for), with the score capped at 100.
import { CHARACTER_BY_ID } from '../data/characters.js';
import { ELEMENTS, PAIR_REACTIONS, TRIO_REACTIONS } from '../data/elements.js';
import { PASSIVES } from '../data/passives.js';
import { PRESETS } from '../data/presets.js';
import { ARC_BY_ID, RECOMMENDED } from '../data/arcs.js';
import { cartridgesFor } from '../data/gear.js';
import { RESONANCES } from '../data/awakenings.js';
import { areNeighbours } from './analyze.js';

/** Rank letters from best to worst, with the lowest score for each. */
export const SYNERGY_RANKS = [
  { rank: 'S+', min: 90 },
  { rank: 'S', min: 75 },
  { rank: 'A', min: 60 },
  { rank: 'B', min: 40 },
  { rank: 'C', min: 0 },
];

// Rank letter colours (top to bottom of the letter), shared by the Synergy
// panel and the exported team images.
export const SYNERGY_RANK_STOPS = {
  'S+': ['#ffffff', '#c9d6e6', '#6fb8ff'],
  S: ['#fff27a', '#ffc21c', '#ff8a00'],
  A: ['#f6a8ff', '#c55cff', '#8b3dff'],
  B: ['#a8ecff', '#3fa5ff', '#2a62ff'],
  C: ['#ffffff', '#d4d4d4', '#a8a8a8'],
};

// Cortado's mood per rank: the brow on its face screen (in the mascot's
// 64-unit drawing) and a short word.
export const SYNERGY_MOODS = {
  'S+': { brow: 'M23.4 28.6 Q27.6 26.6 32 27.8 Q36.4 26.6 40.6 28.6', word: 'Thrilled' },
  S: { brow: 'M24.2 28.3 Q28 27 32 27.9 Q36 27 39.8 28.3', word: 'Happy' },
  A: { brow: 'M24.2 28.3 Q28 27.4 32 28.1 Q36 27.4 39.8 28.3', word: 'Pleased' },
  B: { brow: 'M24.2 28.4 Q28 28.4 32 28.4 Q36 28.4 39.8 28.4', word: 'Unsure' },
  C: { brow: 'M24 28.8 Q28 27.6 32 28.4 Q36 27.6 40 28.8', word: 'Worried' },
};

const round = (n) => Math.round(n * 10) / 10;
// Role tags that help a teammate deal damage.
const BUFF_TAGS = [
  ['DMG Boost', 'raises the team’s DMG'],
  ['RES Shred', 'lowers enemy RES'],
  ['Break Boost', 'speeds up Break'],
];
const key = (ids) => [...ids].sort().join('|');
const short = (c) => c.name.replace(/^Esper /, '');

// Community teams and the site's kit-based ideas, for the "known team" part.
const COMMUNITY = new Set(PRESETS.filter((p) => !p.idea).map((p) => key(p.members)));
const IDEAS = new Set(PRESETS.filter((p) => p.idea).map((p) => key(p.members)));
const PAIRS = new Set(
  PRESETS.flatMap((p) => p.members.flatMap((x, i) => p.members.slice(i + 1).map((y) => key([x, y])))),
);

// Bonus points per number of awakenings (0–6) and Arc copies (0–4). Three
// and six awakenings light Resonance R3 and R6, so those steps count more.
// A-rank characters and Arcs are far easier to collect, so their copies count
// half.
const AWAKENING_PTS = [0, 1, 1.6, 2.6, 3, 3.3, 4.2];
const ARC_COPY_PTS = [0, 0.4, 0.8, 1.1, 1.4];
const RARITY_WEIGHT = { S: 1, A: 0.5 };
// R6 Resonances that buff the whole team ("Team ATK +10%…", "all allies…").
const teamResonance = (id) => {
  const r6 = RESONANCES[id]?.find((r) => r.id === 'R6');
  return r6 && /^team |all allies|allies’/i.test(r6.effect) ? r6 : null;
};

/**
 * Scores a team. Returns { score, rank, parts, filled } where each part is
 * { id, label, points, max, detail, bonus? }. Partial teams are scored too,
 * but most parts need a full team to reach full marks.
 */
export function synergyScore(memberIds, loadouts = {}) {
  const team = memberIds.map((id) => id && CHARACTER_BY_ID[id]).filter(Boolean);
  const parts = [];
  const elements = [...new Set(team.map((c) => c.element).filter((e) => ELEMENTS.some((x) => x.id === e)))];
  const reactions = PAIR_REACTIONS.filter((r) => r.elements.every((e) => elements.includes(e)));
  const trios = TRIO_REACTIONS.filter((r) => r.elements.every((e) => elements.includes(e)));

  // Esper Cycle: reactions, everyone joining one, and trios.
  const cycleBits = [];
  let cycle = 0;
  if (reactions.length) {
    cycle += 18;
    cycleBits.push(reactions.map((r) => r.name).join(', '));
  }
  const isolated = team.filter(
    (c) => !team.some((o) => o !== c && (o.element === c.element || areNeighbours(o.element, c.element))),
  );
  if (team.length >= 2 && reactions.length) {
    if (!isolated.length) {
      cycle += 7;
      cycleBits.push('every element reacts with a teammate');
    } else cycleBits.push(`${isolated.map(short).join(', ')} has no neighbouring element here`);
  }
  if (trios.length) {
    cycle += 5;
    cycleBits.push(`${trios.map((t) => t.name).join(', ')} trio`);
  }
  parts.push({
    id: 'cycle',
    label: 'Esper Cycle',
    points: cycle,
    max: 30,
    detail: cycleBits.length ? cycleBits.join('; ') : 'No neighbouring elements yet, so no reactions',
  });

  // Reaction passives that pay off in this team.
  const names = new Set([...reactions, ...trios].map((r) => r.name));
  const boosted = team.filter((c) => PASSIVES[c.id]?.p1?.boosts && names.has(PASSIVES[c.id].p1.boosts));
  parts.push({
    id: 'boosts',
    label: 'Reaction passives',
    points: Math.min(20, boosted.length * 10),
    max: 20,
    detail: boosted.length
      ? boosted.map((c) => `${short(c)}: ${PASSIVES[c.id].p1.name} boosts ${PASSIVES[c.id].p1.boosts}`).join('; ')
      : 'No passive here boosts a reaction this team triggers',
  });

  // Roles: Damage, Buff and Survival, without too many main carries.
  const has = (role) => team.some((c) => c.roles.includes(role));
  let rolePts = (has('Damage') ? 8 : 0) + (has('Buff') ? 6 : 0) + (has('Survival') ? 6 : 0);
  const roleBits = ['Damage', 'Buff', 'Survival'].filter(has);
  const carries = team.filter((c) => c.tags?.includes('Main DPS')).length;
  if (carries >= 3) {
    rolePts -= 4;
    roleBits.push(`${carries} Main DPS share field time (−4)`);
  }
  parts.push({
    id: 'roles',
    label: 'Roles',
    points: Math.max(0, rolePts),
    max: 20,
    detail: roleBits.length ? roleBits.join(', ') : 'No clear roles yet',
  });

  // Team buffs: DMG Boost, RES Shred and Break Boost from a member, for a
  // teammate who deals the damage.
  const buffBits = [];
  BUFF_TAGS.forEach(([tag, text]) => {
    const givers = team.filter((c) => c.tags?.includes(tag));
    const helped = givers.length && team.some((c) => !givers.includes(c) && c.roles.includes('Damage'));
    if (helped) buffBits.push(`${givers.map(short).join(', ')}: ${text}`);
  });
  parts.push({
    id: 'buffs',
    label: 'Team buffs',
    points: Math.min(10, buffBits.length * 5),
    max: 10,
    detail: buffBits.length ? buffBits.join('; ') : 'No DMG Boost, RES Shred or Break Boost for a teammate',
  });

  // Instant Cycle.
  const instant = team.filter((c) => c.tags?.includes('Instant Cycle'));
  parts.push({
    id: 'instant',
    label: 'Instant Cycle',
    points: instant.length ? 6 : 0,
    max: 6,
    detail: instant.length
      ? `${instant.map(short).join(' and ')} ${instant.length > 1 ? 'refill' : 'refills'} the Esper Meter, so the team reacts more often`
      : 'No Instant Cycle: reactions wait on the Esper Meter (Cycle Intensity helps)',
  });

  // Known team.
  const ids = team.map((c) => c.id);
  const full = ids.length === 4;
  const pairs = ids.flatMap((x, i) => ids.slice(i + 1).map((y) => key([x, y]))).filter((p) => PAIRS.has(p)).length;
  const knownPts = full && COMMUNITY.has(key(ids)) ? 8 : full && IDEAS.has(key(ids)) ? 5 : Math.min(4, pairs * 2);
  parts.push({
    id: 'known',
    label: 'Known team',
    points: knownPts,
    max: 8,
    detail:
      knownPts === 8
        ? 'A community team'
        : knownPts === 5
          ? 'One of this site’s kit-based team ideas'
          : pairs
            ? `${pairs} pair${pairs > 1 ? 's' : ''} from known teams`
            : 'Not a known pairing',
  });

  // Gear: only once something is equipped, so bare teams aren't marked down.
  const geared = team.filter((c) => loadouts[c.id]?.arc || loadouts[c.id]?.cartridge);
  if (geared.length) {
    const bits = [];
    let arcFits = 0;
    let cartFits = 0;
    team.forEach((c) => {
      const lo = loadouts[c.id] ?? {};
      const arc = lo.arc && ARC_BY_ID[lo.arc];
      if (arc && (arc.signature === c.id || RECOMMENDED[c.id]?.includes(arc.id))) {
        arcFits += 1;
        if (arc.signature === c.id) bits.push(`${short(c)} has their signature Arc`);
      }
      if (lo.cartridge && cartridgesFor(c).includes(lo.cartridge)) cartFits += 1;
    });
    bits.unshift(`${arcFits} of ${team.length} recommended Arcs`, `${cartFits} of ${team.length} recommended Cartridge sets`);
    parts.push({
      id: 'gear',
      label: 'Gear',
      points: round(6 * (arcFits / team.length) + 6 * (cartFits / team.length)),
      max: 12,
      detail: bits.join('; '),
    });
  }

  // Awakenings and Arc copies: a bonus on top, so a team without them loses
  // nothing. A-rank copies count half; R6 team buffs count extra.
  const invested = team
    .map((c) => {
      const lo = loadouts[c.id] ?? {};
      const arc = lo.arc && ARC_BY_ID[lo.arc];
      return { c, a: Math.min(6, lo.awakenings?.length ?? 0), d: arc ? Math.min(4, lo.arcDupes ?? 0) : 0, arc };
    })
    .filter((x) => x.a || x.d);
  if (invested.length) {
    const bits = [];
    let pts = 0;
    invested.forEach(({ c, a, d, arc }) => {
      pts += AWAKENING_PTS[a] * (RARITY_WEIGHT[c.rarity] ?? 1) + ARC_COPY_PTS[d] * (RARITY_WEIGHT[arc?.rarity] ?? 1);
      bits.push(
        `${short(c)} ${[a && `A${a} (${c.rarity}-rank)`, d && `Arc +${d}`].filter(Boolean).join(', ')}`,
      );
      const r6 = a >= 6 && team.length > 1 && teamResonance(c.id);
      if (r6) {
        pts += 1.5;
        bits.push(`${short(c)}’s R6 ${r6.name}: ${r6.effect}`);
      }
    });
    parts.push({
      id: 'invest',
      label: 'Awakenings & Arcs (bonus)',
      points: round(Math.min(8, pts)),
      max: 8,
      bonus: true,
      detail: bits.join('; '),
    });
  }

  // Bonus parts add points but don't raise the total to aim for.
  const total = parts.reduce((n, p) => n + p.points, 0);
  const max = parts.reduce((n, p) => n + (p.bonus ? 0 : p.max), 0);
  const score = Math.min(100, Math.round((total / max) * 100));
  const rank = SYNERGY_RANKS.find((r) => score >= r.min).rank;
  return { score, rank, parts, filled: team.length };
}
