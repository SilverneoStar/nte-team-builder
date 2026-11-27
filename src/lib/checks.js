// Cortado's checks: plain facts about a team or a saved build, in place of a
// score. Only things that are missing or don't work in game: an empty slot,
// no Arc, a stat with no value, a set whose buff doesn't stack. No judging of
// which team or stat is "best": players found the old scores pushed one style
// of team over others that are just as strong.
import { CHARACTER_BY_ID } from '../data/characters.js';
import { CARTRIDGE_BY_ID } from '../data/gear.js';
import { cartHasEmptyValues } from '../data/cartValues.js';
import { moduleHasEmptyValues } from '../data/bestBuild.js';
import { PASSIVES } from '../data/passives.js';
import { PAIR_REACTIONS, TRIO_REACTIONS, ELEMENT_BY_ID } from '../data/elements.js';
import { KIT_CHECKS } from '../data/kitChecks.js';
import { isBeta, showBeta } from './betaState.js';

const REACTIONS = Object.fromEntries([...PAIR_REACTIONS, ...TRIO_REACTIONS].map((r) => [r.name, r]));

/**
 * Kit checks for the Espers on a team: whether each Passive 1 reaction boost can
 * trigger, plus the per-Esper checks in data/kitChecks.js. Tones: 'ok' when it
 * works in this team, 'tip' when a teammate would switch it on.
 */
function kitChecks(team) {
  const out = [];
  const els = new Set(team.map((c) => c.element));
  for (const c of team) {
    const p1 = isBeta(c.id, 'passives') && !showBeta() ? null : PASSIVES[c.id]?.p1;
    const boosts = [p1?.boosts].flat().filter((b) => REACTIONS[b]);
    if (boosts.length) {
      const need = (b) => REACTIONS[b].elements.filter((e) => !els.has(e));
      const on = boosts.filter((b) => !need(b).length);
      const off = boosts.filter((b) => need(b).length);
      const offText = off.map((b) => `${b} would need a ${list(need(b).map((e) => ELEMENT_BY_ID[e].name))} Esper`);
      const head = `${c.name}’s Passive 1 (${p1.name})`;
      out.push(
        on.length
          ? { tone: 'ok', kit: true, text: `${head} is on: this team can trigger ${list(on)}.${offText.length ? ` ${list(offText)}.` : ''}` }
          : { tone: 'tip', kit: true, text: `${head} needs ${list(off)}: ${off.length > 1 ? list(offText) : `add a ${list(need(off[0]).map((e) => ELEMENT_BY_ID[e].name))} Esper to trigger it`}.` },
      );
    }
    for (const k of KIT_CHECKS[c.id] ?? []) {
      const who = k.test(team);
      out.push(who.length ? { tone: 'ok', kit: true, text: k.ok(who) } : { tone: 'tip', kit: true, text: k.miss });
    }
  }
  return out;
}

const list = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);

/** What one Esper's gear is missing: short phrases ("an Arc", ...). */
function missing(gear) {
  const out = [];
  if (!gear) return ['gear'];
  if ('arc' in gear && !gear.arc) out.push('an Arc');
  if (!gear.cartridge) out.push('a Cartridge set');
  if (!gear.cartStats?.main?.stat) out.push('the Cartridge main stat');
  const pieces = gear.pieces ?? gear.console ?? [];
  if (!pieces.length) out.push('Console modules');
  return out;
}

/** Stats picked without a value, on the Cartridge or any module. */
function emptyValues(gear) {
  const pieces = gear?.pieces ?? gear?.console ?? [];
  return cartHasEmptyValues(gear?.cartStats) || pieces.some(moduleHasEmptyValues);
}

/**
 * Checks for a team. members: ids (null for an empty slot); loadouts: id -> loadout.
 * Returns [{ tone: 'ok'|'warn'|'bad'|'tip', text }]; gear lines first (one 'ok' line when
 * nothing's wrong), then the kit checks.
 */
export function teamChecks(members, loadouts = {}) {
  const team = members.filter(Boolean);
  if (!team.length) return [];
  const out = [];
  const empty = members.length - team.length;
  if (empty) out.push({ tone: 'warn', text: `${empty} slot${empty > 1 ? 's are' : ' is'} still empty.` });

  for (const id of team) {
    const name = CHARACTER_BY_ID[id]?.name ?? id;
    const lo = loadouts[id];
    const gaps = missing(lo && { ...lo, arc: lo.arc ?? null });
    if (gaps.length) out.push({ tone: 'warn', text: `${name} is missing ${list(gaps)}.` });
    else if (emptyValues(lo)) out.push({ tone: 'warn', text: `${name}: some stats have no value yet (Fill values adds them).` });
  }

  // Sets whose team buff doesn't stack: only one wearer counts.
  const bySet = {};
  for (const id of team) {
    const set = loadouts[id]?.cartridge;
    if (set && CARTRIDGE_BY_ID[set]?.onePerTeam) (bySet[set] ??= []).push(CHARACTER_BY_ID[id]?.name ?? id);
  }
  for (const [set, names] of Object.entries(bySet)) {
    if (names.length > 1)
      out.push({
        tone: 'bad',
        text: `${CARTRIDGE_BY_ID[set].name} is on ${list(names)}: its team buff doesn’t stack, so only one of them counts.`,
      });
  }

  if (!out.length) out.push({ tone: 'ok', text: 'Everyone’s geared up: nothing missing or clashing.' });
  return [...out, ...kitChecks(team.map((id) => CHARACTER_BY_ID[id]).filter(Boolean))];
}

/** Checks for one saved build (My build). Same shape as teamChecks. */
export function buildChecks(characterId, build) {
  if (!CHARACTER_BY_ID[characterId] || !build) return [];
  const out = [];
  const gaps = missing(build);
  if (gaps.length) out.push({ tone: 'warn', text: `Missing ${list(gaps)}.` });
  if (emptyValues(build)) out.push({ tone: 'warn', text: 'Some stats have no value yet: Fill values adds the usual ones.' });
  if (!out.length) out.push({ tone: 'ok', text: 'All set: nothing missing.' });
  return out;
}

/** Number of things to fix (warn or bad lines). */
export const issueCount = (checks) => checks.filter((x) => x.tone === 'warn' || x.tone === 'bad').length;
