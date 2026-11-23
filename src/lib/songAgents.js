// Which characters a song belongs to, going by the names in its title and album
// ("Lacrimosa Theme" is Lacrimosa's). Each character is matched by the
// names fans and the soundtrack use for them, as whole words in the same case,
// so "Lacrimosa" counts while a word inside another doesn't. Names that are also
// everyday words or song titles ("Chaos", "Mint", "Exe") are left out.
import { CHARACTERS as AGENTS } from '../data/characters.js';

const ALIASES = {
  zero: ['Esper Zero'],
  akane: ['Akane'],
  // Names that are everyday words or song titles: matched only in full.
  chaos: [],
  mint: [],
  exe: [],
};
// First names that would catch too much on their own.
const SKIP_FIRST = new Set(['Esper']);

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const MATCHERS = AGENTS.map((a) => {
  const first = a.name.split(/\s+/)[0];
  // Listed names, or else the full name and the first name; an empty list means
  // the Agent isn't matched at all (their name is an everyday word).
  const listed = ALIASES[a.id];
  const names = listed ? (listed.length ? [a.name, ...listed] : []) : [a.name, ...(SKIP_FIRST.has(first) ? [] : [first])];
  return {
    id: a.id,
    name: a.name,
    re: names.length ? new RegExp(`(^|[^\\p{L}\\p{N}])(${names.map(escape).join('|')})(?![\\p{L}\\p{N}])`, 'u') : null,
  };
}).filter((m) => m.re);

/** The ids of the characters a song is about, from its name and album. */
export function songAgents(song) {
  const text = `${song.name || ''} ${song.album || ''}`;
  return MATCHERS.filter((m) => m.re.test(text)).map((m) => m.id);
}

/** All characters, for naming them in lists. */
export const AGENT_NAMES = Object.fromEntries(AGENTS.map((a) => [a.id, a.name]));

// Factions: a song is a faction's when it names the faction (or a short name
// for it), or belongs to one of its members.
const FACTION_SHORT = {
  'Bureau of Anomaly Control': ['Anomaly Control'],
  'Eibon Antique Shop': ['Eibon'],
  'Sterry Express': ['Sterry'],
};
const BY_ID = Object.fromEntries(AGENTS.map((a) => [a.id, a]));
export const FACTIONS = [...new Set(AGENTS.map((a) => a.faction).filter(Boolean))];
const FACTION_MATCHERS = FACTIONS.map((f) => ({
  name: f,
  re: new RegExp(
    `(^|[^\\p{L}\\p{N}])(${[f, ...(FACTION_SHORT[f] ?? [])].map(escape).join('|')})(?![\\p{L}\\p{N}])`,
    'u',
  ),
}));

/** The factions a song is about: named in it, or those of the characters it's about. */
export function songFactions(song, agentIds = songAgents(song)) {
  const text = `${song.name || ''} ${song.album || ''}`;
  const out = new Set(agentIds.map((id) => BY_ID[id]?.faction).filter(Boolean));
  for (const m of FACTION_MATCHERS) if (m.re.test(text)) out.add(m.name);
  return [...out];
}

// Game versions: a song is from a version when its title or album names one
// ("Zenless Zone Zero 3.1 OST", "(Papago Hollow, 3.1)"), or else when the
// characters it's about came out in that version (their theme, their EP).
// Only numbers written as versions count, so "Hyper Commission 2.0" isn't one.
const VERSION_RE =
  /(?:\b(?:Version|Ver\.?|v|Zone Zero|Everness|NTE)\s*([1-9]\.\d)(?![\d.]))|(?:\b([1-9]\.\d)\s+(?:OST|Update|Patch)\b)|(?:[(,]\s*([1-9]\.\d)\s*\))/gi;
/** The game versions a song is from, like ["3.1"]. */
export function songVersions(song, agentIds = songAgents(song)) {
  const text = `${song.name || ''} ${song.album || ''}`;
  const named = [...text.matchAll(VERSION_RE)].map((m) => m[1] || m[2] || m[3]);
  if (named.length) return [...new Set(named)];
  // Fan covers and remixes aren't from a version just because they're about a character.
  if (song.fan) return [];
  return [...new Set(agentIds.map((id) => BY_ID[id]?.version).filter(Boolean))];
}
