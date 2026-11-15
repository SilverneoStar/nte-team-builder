// Players' own character builds (for sharing a build card), kept in this
// browser only, keyed by character id:
//   { arc, arcDupes, cartridge, cartStats, pieces, consoleFrom, awakeningOrder }
import { decodeCardCode } from './cardCode.js';
import { decodeConsoleCode } from './consoleCode.js';
import { parseQrText } from './qr.js';
import { decodeTeam } from './share.js';

const KEY = 'nte-team-builder:myBuilds';

export function loadMyBuilds() {
  try {
    const map = JSON.parse(localStorage.getItem(KEY) || '{}');
    return map && typeof map === 'object' && !Array.isArray(map) ? map : {};
  } catch {
    return {};
  }
}

export function saveMyBuild(characterId, build) {
  try {
    const map = loadMyBuilds();
    // savedAt: when it was first saved (My Espers sorts by it).
    if (build) map[characterId] = { ...build, savedAt: map[characterId]?.savedAt ?? build.savedAt ?? Date.now() };
    else delete map[characterId];
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    /* storage unavailable: the build just won't be remembered */
  }
}

/** Every saved build as a list: [{ characterId, build, savedAt }]. */
export function allMyBuilds(map = loadMyBuilds()) {
  return Object.entries(map).map(([characterId, build]) => ({ characterId, build, savedAt: build?.savedAt ?? 0 }));
}

/**
 * Any code a player might paste or scan: a team code (with or without
 * dashes or the NTE: prefix), a console code (NTEC:..., from a build image,
 * optionally naming its Esper), a link with #code=, or a team link (#nte1~...).
 * Returns { kind: 'team', team } | { kind: 'console', console, characterId } | null.
 */
export function readAnyCode(raw) {
  let text = (raw ?? '').trim();
  if (!text) return null;
  try {
    text = decodeURIComponent(text);
  } catch {
    /* keep as typed */
  }
  const link = text.match(/nte1~\S+/);
  if (link) {
    const t = decodeTeam(link[0]);
    return t ? { kind: 'team', team: { ...t, loadouts: {} } } : null;
  }
  const q = parseQrText(text.replace(/^.*#code=/i, 'NTE:'));
  if (q?.kind === 'console' || /^\s*NTEC:/i.test(text)) {
    const d = decodeConsoleCode(q?.code ?? text);
    return d ? { kind: 'console', console: d, characterId: q?.characterId ?? null } : null;
  }
  const team = decodeCardCode(q?.code ?? text);
  if (team) return { kind: 'team', team };
  const d = decodeConsoleCode(text);
  return d ? { kind: 'console', console: d, characterId: null } : null;
}
