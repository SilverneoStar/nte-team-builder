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
