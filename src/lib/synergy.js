// Team synergy score: one number (0–100) and a rank letter for how well a
// team fits together, with the reasons behind it. It's a guide to team
// building, not a damage calculator: investment, rotations and skill matter
// more in a real fight. Shown by Cortado in the team builder's Synergy panel
// and on exported team images. The same idea as the ZZZ site's score, built
// on NTE's own mechanics: the Esper Cycle, reaction passives, roles, Instant
// Cycle, Arcs, Cartridges, awakenings and Resonance.
//
// Points (82 in total, scaled to 100) for how well the members enable each other, using
// the game's own role tags (Main DPS, Burst DPS, Instant Cycle, DMG Boost,
// Break Boost, Healing, Shield, DMG Redirection, Control, DoT, Follow-up
// Attack, Summoner) and attribute names (Cycle Intensity, Break Intensity):
//   Esper Cycle        26  a reaction (16), every member's element reacting
//                          with a teammate's (6), a trio (Charge, Discord) (4)
//   Reaction passives  14  a member's first passive boosts a reaction this
//                          team triggers (7 each)
//   Roles & field time 16  Damage, Buff and Survival (5 / 4 / 4), and one
//                          on-field carry with swap-in partners (3); three or
//                          more Main DPS fight over field time (−4)
//   Team support       10  DMG Boost or Break Boost for a damage dealer (5),
//                          sustain from Healing, Shield or DMG Redirection
//                          (5), Control for an AoE, DoT or Burst teammate (3),
//                          a Summoner's damage for a DMG Boost (3); capped at 10
//   Tag combos     bonus 8 two DoT members stacking on one target (4), or
//                          Follow-up Attacks with Hexed, whose follow-ups
//                          they add to (4)
//   Esper Meter         8  Instant Cycle refills it (8), or Cycle Intensity
//                          on the gear speeds it up (4)
//   Known team          8  a community team (8), a kit-based idea (5), or
//                          pairs from them
//   Gear (bonus part)  12  recommended or signature Arcs and recommended
//                          Cartridge sets. Only counted once some gear is
//                          equipped; the score is then out of 94.
//   Awakenings & Arcs  up to 8 bonus points on top (not added to the total to
//                          aim for), with the score capped at 100.
import { CHARACTER_BY_ID, acquisition } from '../data/characters.js';
import { ELEMENTS, PAIR_REACTIONS, TRIO_REACTIONS } from '../data/elements.js';
import { PASSIVES } from '../data/passives.js';
import { PRESETS } from '../data/presets.js';
import { ARC_BY_ID, RECOMMENDED } from '../data/arcs.js';
import { bonusStats, cartridgesFor } from '../data/gear.js';
import { consoleStats } from '../data/console.js';
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
const hasTag = (c, tag) => !!c.tags?.includes(tag);
const SUSTAIN_TAGS = ['Healing', 'Shield', 'DMG Redirection'];
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
// half. Standard S-ranks count in full: in NTE they never show up on limited
// banners, so their copies are no easier to get than a limited S-rank's.
// Esper Zero isn't on any banner, so his count half, like an A-rank's.
const AWAKENING_PTS = [0, 1, 1.6, 2.6, 3, 3.3, 4.2];
const ARC_COPY_PTS = [0, 0.4, 0.8, 1.1, 1.4];
const RARITY_WEIGHT = { S: 1, A: 0.5 };
const COPY_WEIGHT = { limited: 1, standard: 1, free: 0.5, 'a-rank': 0.5 };
const COPY_NAME = { limited: 'limited S-rank', standard: 'standard S-rank', free: 'not on a banner', 'a-rank': 'A-rank' };
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
    cycle += 16;
    cycleBits.push(reactions.map((r) => r.name).join(', '));
  }
  const isolated = team.filter(
    (c) => !team.some((o) => o !== c && (o.element === c.element || areNeighbours(o.element, c.element))),
  );
  if (team.length >= 2 && reactions.length) {
    if (!isolated.length) {
      cycle += 6;
      cycleBits.push('every element reacts with a teammate');
    } else cycleBits.push(`${isolated.map(short).join(', ')} has no neighbouring element here`);
  }
  if (trios.length) {
    cycle += 4;
    cycleBits.push(`${trios.map((t) => t.name).join(', ')} trio`);
  }
  parts.push({
    id: 'cycle',
    label: 'Esper Cycle',
    points: cycle,
    max: 26,
    detail: cycleBits.length ? cycleBits.join('; ') : 'No neighbouring elements yet, so no reactions',
  });

  // Reaction passives that pay off in this team.
  const names = new Set([...reactions, ...trios].map((r) => r.name));
  const boosted = team.filter((c) => PASSIVES[c.id]?.p1?.boosts && names.has(PASSIVES[c.id].p1.boosts));
  parts.push({
    id: 'boosts',
    label: 'Reaction passives',
    points: Math.min(14, boosted.length * 7),
    max: 14,
    detail: boosted.length
      ? boosted.map((c) => `${short(c)}: ${PASSIVES[c.id].p1.name} boosts ${PASSIVES[c.id].p1.boosts}`).join('; ')
      : 'No passive here boosts a reaction this team triggers',
  });

  // Roles and field time: Damage, Buff and Survival, and a carry who stays on
  // the field with partners who swap in (Burst DPS, supports), instead of
  // several Main DPS fighting over field time.
  const has = (role) => team.some((c) => c.roles.includes(role));
  let rolePts = (has('Damage') ? 5 : 0) + (has('Buff') ? 4 : 0) + (has('Survival') ? 4 : 0);
  const roleBits = ['Damage', 'Buff', 'Survival'].filter(has);
  const carries = team.filter((c) => hasTag(c, 'Main DPS'));
  const swappers = team.filter((c) => !hasTag(c, 'Main DPS'));
  if (carries.length === 1 && swappers.length >= 2) {
    rolePts += 3;
    roleBits.push(`${short(carries[0])} holds the field while the others swap in`);
  } else if (!carries.length && team.filter((c) => hasTag(c, 'Burst DPS')).length >= 2) {
    rolePts += 2;
    roleBits.push('Burst DPS take turns on the field');
  }
  if (carries.length >= 3) {
    rolePts -= 4;
    roleBits.push(`${carries.length} Main DPS share field time (−4)`);
  }
  parts.push({
    id: 'roles',
    label: 'Roles & field time',
    points: Math.max(0, rolePts),
    max: 16,
    detail: roleBits.length ? roleBits.join(', ') : 'No clear roles yet',
  });

  // Team support: tags that help someone else, counted when that someone is here.
  const supBits = [];
  let sup = 0;
  const others = (givers) => team.filter((c) => !givers.includes(c));
  const dealers = (list) => list.filter((c) => c.roles.includes('Damage'));
  const boosters = team.filter((c) => hasTag(c, 'DMG Boost') || hasTag(c, 'Break Boost'));
  if (boosters.length && dealers(others(boosters)).length) {
    sup += 5;
    supBits.push(
      `${boosters.map(short).join(', ')} ${boosters.length > 1 ? 'boost' : 'boosts'} ${dealers(others(boosters)).map(short).join(', ')}`,
    );
  }
  const sustain = team.filter((c) => SUSTAIN_TAGS.some((t) => hasTag(c, t)));
  if (sustain.length && team.length > 1) {
    sup += 5;
    supBits.push(
      `${sustain.map((c) => `${short(c)} (${SUSTAIN_TAGS.filter((t) => hasTag(c, t)).join(', ')})`).join(', ')} keeps the team alive`,
    );
  }
  const control = team.filter((c) => hasTag(c, 'Control'));
  const groupers = others(control).filter((c) => hasTag(c, 'DoT') || hasTag(c, 'Burst DPS') || hasTag(c, 'Summoner'));
  if (control.length && groupers.length) {
    sup += 3;
    supBits.push(`${control.map(short).join(', ')} holds enemies for ${groupers.map(short).join(', ')}`);
  }
  const summoners = team.filter((c) => hasTag(c, 'Summoner'));
  if (summoners.length && team.some((c) => !summoners.includes(c) && hasTag(c, 'DMG Boost'))) {
    sup += 3;
    supBits.push(`${summoners.map(short).join(', ')}’s summons gain from the DMG Boost`);
  }
  parts.push({
    id: 'buffs',
    label: 'Team support',
    points: Math.min(10, sup),
    max: 10,
    detail: supBits.length
      ? supBits.join('; ')
      : 'No DMG Boost, Break Boost, Healing, Shield, DMG Redirection or Control for a teammate',
  });

  // Tag combos: members whose tags feed each other.
  const comboBits = [];
  let combo = 0;
  const dots = team.filter((c) => hasTag(c, 'DoT'));
  if (dots.length >= 2) {
    combo += 4;
    comboBits.push(`${dots.map(short).join(', ')} stack DoT on the same target`);
  }
  const fua = team.filter((c) => hasTag(c, 'Follow-up Attack'));
  if (fua.length && names.has('Hexed')) {
    combo += 4;
    comboBits.push(`${fua.map(short).join(', ')}: Follow-up Attacks with Hexed's extra follow-ups`);
  }
  parts.push({
    id: 'combos',
    label: 'Tag combos (bonus)',
    points: combo,
    max: 8,
    bonus: true,
    detail: comboBits.length ? comboBits.join('; ') : 'No DoT pair, and no Follow-up Attack with Hexed',
  });

  // Esper Meter: Instant Cycle refills it; otherwise Cycle Intensity on the gear helps.
  const instant = team.filter((c) => hasTag(c, 'Instant Cycle'));
  const cycleGear = team
    .map((c) => {
      const lo = loadouts[c.id] ?? {};
      const arc = lo.arc && ARC_BY_ID[lo.arc];
      const v = bonusStats(arc, lo.cartStats, consoleStats(c.id, lo.console ?? [], lo.cartridge)).find(
        (b) => b.stat === 'Cycle Intensity',
      )?.value;
      return v ? { c, v } : null;
    })
    .filter(Boolean);
  parts.push({
    id: 'instant',
    label: 'Esper Meter',
    points: instant.length ? 8 : cycleGear.length ? 4 : 0,
    max: 8,
    detail: instant.length
      ? `${instant.map(short).join(' and ')} ${instant.length > 1 ? 'refill' : 'refills'} the Esper Meter (Instant Cycle), so the team reacts more often`
      : cycleGear.length
        ? `Cycle Intensity on ${cycleGear.map((x) => `${short(x.c)} (+${x.v})`).join(', ')} speeds up reactions`
        : 'No Instant Cycle: reactions wait on the Esper Meter (Cycle Intensity on the gear helps)',
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
      const how = acquisition(c);
      pts += AWAKENING_PTS[a] * COPY_WEIGHT[how] + ARC_COPY_PTS[d] * (RARITY_WEIGHT[arc?.rarity] ?? 1);
      bits.push(`${short(c)} ${[a && `A${a} (${COPY_NAME[how]})`, d && `Arc +${d}`].filter(Boolean).join(', ')}`);
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
