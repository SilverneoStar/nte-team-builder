// Cortado's checks: plain facts about a team or a saved build, in place of a
// score. Only things that are missing or don't work in game: an empty slot,
// no Arc, a stat with no value, a set whose buff doesn't stack. No judging of
// which team or stat is "best": players found the old scores pushed one style
// of team over others that are just as strong.
import { CHARACTER_BY_ID } from '../data/characters.js';
import { CARTRIDGE_BY_ID } from '../data/gear.js';
import { cartHasEmptyValues } from '../data/cartValues.js';
import { moduleHasEmptyValues } from '../data/bestBuild.js';

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
 * Returns [{ tone: 'ok'|'warn'|'bad', text }]; one 'ok' line when nothing's wrong.
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
  return out;
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
export const issueCount = (checks) => checks.filter((x) => x.tone !== 'ok').length;
