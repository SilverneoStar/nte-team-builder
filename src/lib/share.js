// Team share codes in links (#nte1~...).
import { CHARACTER_BY_ID } from '../data/characters.js';
import { TEAM_SIZE } from './analyze.js';

// A team code looks like:  nte1~Mono_Blossom~nanally.jiuyuan.zero.hotori
// Only letters, digits and . _ ~ - are used, so it's safe in a URL hash.
const PREFIX = 'nte1';

export function encodeTeam(team) {
  const name = (team.name || 'Team')
    .replace(/\s+/g, '_')
    .replace(/[^A-Za-z0-9_-]/g, '')
    .slice(0, 40);
  const members = team.members.map((id) => id || 'x').join('.');
  return `${PREFIX}~${name || 'Team'}~${members}`;
}

/** Returns { name, members } or null if the code isn't valid. */
export function decodeTeam(code) {
  if (!code) return null;
  const parts = code.trim().replace(/^#/, '').split('~');
  if (parts.length !== 3 || parts[0] !== PREFIX) return null;
  const name = parts[1].replace(/_/g, ' ') || 'Shared team';
  const ids = parts[2].split('.').slice(0, TEAM_SIZE);
  const members = Array.from({ length: TEAM_SIZE }, (_, i) =>
    CHARACTER_BY_ID[ids[i]] ? ids[i] : null,
  );
  // Drop duplicates: a character can only appear once in a team.
  const seen = new Set();
  const unique = members.map((id) => {
    if (!id || seen.has(id)) return null;
    seen.add(id);
    return id;
  });
  if (!unique.some(Boolean)) return null;
  return { name, members: unique };
}
