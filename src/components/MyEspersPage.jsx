// "My Espers": every saved My build laid out like shortcuts on a desktop, one
// icon per Esper, each with Cortado's rating of the build (lib/buildReview.js).
// Tapping one opens that Esper's My build tab. Also the one place to bring
// builds in: paste a team or console code, scan an image's QR code with the
// camera, or upload a team or build image. Ported from the ZZZ site's My Agents.
import { useEffect, useMemo, useRef, useState } from 'react';
import { CHARACTERS, CHARACTER_BY_ID } from '../data/characters.js';
import { ELEMENT_BY_ID } from '../data/elements.js';
import { CHARACTER_CONSOLE } from '../data/console.js';
import { suggestedBuild } from '../data/consoleBuilds.js';
import { withBestModuleStats } from '../data/bestBuild.js';
import { allMyBuilds, loadMyBuilds, readAnyCode, saveMyBuild } from '../lib/myBuilds.js';
import { readImageCode, scanFrame } from '../lib/imageCode.js';
import { reviewBuild } from '../lib/buildReview.js';
import { SYNERGY_RANKS, SYNERGY_RANK_STOPS } from '../lib/synergy.js';
import { navigate } from '../lib/route.js';
import { startingBuild } from './MyBuildEditor.jsx';
import Portrait from './Portrait.jsx';

const SORT_KEY = 'nte-team-builder:myEspersSort';
const get = (k, d) => {
  try {
    return localStorage.getItem(k) ?? d;
  } catch {
    return d;
  }
};
const put = (k, v) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* not kept: fine */
  }
};
const names = (ids) => ids.map((id) => CHARACTER_BY_ID[id]?.name ?? id).join(', ');
const RANK_ORDER = SYNERGY_RANKS.map((r) => r.rank);
const rankStyle = (r) => ({ '--r1': SYNERGY_RANK_STOPS[r][0], '--r2': SYNERGY_RANK_STOPS[r][2] });
const savable = (id) => CHARACTER_BY_ID[id] && !CHARACTER_BY_ID[id].upcoming;

// The suggested Console's layout without module stats: a team code carries no
// Console, so its modules aren't the player's (and aren't rated) until they
// enter them.
const bareLayout = (pieces) => (pieces ?? []).map(({ stats, ...p }) => p); // eslint-disable-line no-unused-vars

/** A team member's gear (from a team code) as that Esper's My build. */
function buildFromTeam(id, lo, old) {
  const c = CHARACTER_BY_ID[id];
  const fresh = startingBuild(c);
  const base = old ?? { ...fresh, pieces: bareLayout(fresh.pieces) };
  const hasStats = lo?.cartStats && (lo.cartStats.main || lo.cartStats.subs?.some(Boolean));
  const next = {
    ...base,
    arc: lo?.arc ?? base.arc,
    arcDupes: lo?.arc ? lo.arcDupes ?? 0 : base.arcDupes,
    cartridge: lo?.cartridge ?? base.cartridge,
    cartStats: hasStats ? lo.cartStats : base.cartStats,
  };
  // Keep a suggested Console in step with the Cartridge set.
  if (next.cartridge !== base.cartridge && (base.consoleFrom ?? 'suggested') === 'suggested') {
    next.pieces = old
      ? withBestModuleStats(c, suggestedBuild(id, next.cartridge)?.pieces ?? [], next.cartridge)
      : bareLayout(suggestedBuild(id, next.cartridge)?.pieces);
  }
  return next;
}

/** A console code (from a build image) as an Esper's My build. */
function buildFromConsole(id, d, old) {
  const base = old ?? startingBuild(CHARACTER_BY_ID[id]);
  const hasStats = d.cartStats && (d.cartStats.main || d.cartStats.subs?.some(Boolean));
  return {
    ...base,
    cartridge: d.cartridge ?? base.cartridge,
    cartStats: hasStats ? d.cartStats : base.cartStats,
    pieces: d.pieces ?? [],
    consoleFrom: 'imported',
  };
}

/** The camera, looking for a QR code from one of the site's images. */
function QrScanner({ onText, onClose }) {
  const video = useRef(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let stream;
    let stop = false;
    let timer;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 } },
          audio: false,
        });
      } catch {
        setError('The camera couldn’t be opened. Allow camera access for this site, or upload the image instead.');
        return;
      }
      if (stop) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const v = video.current;
      v.srcObject = stream;
      await v.play().catch(() => {});
      const tick = async () => {
        if (stop) return;
        const text = await scanFrame(v).catch(() => null);
        if (stop) return;
        if (text && readAnyCode(text)) {
          onText(text);
          return;
        }
        timer = setTimeout(tick, 250);
      };
      tick();
    })();
    return () => {
      stop = true;
      clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="qrscan">
      {error ? (
        <p className="field__error" role="alert">
          {error}
        </p>
      ) : (
        <div className="qrscan__view">
          <video ref={video} muted playsInline aria-label="Camera view" />
          <span className="qrscan__frame" aria-hidden="true" />
        </div>
      )}
      <p className="muted small">
        Point the camera at the QR code in the corner of a team or build image. Nothing is recorded or sent anywhere.
      </p>
      <button type="button" className="btn btn--quiet" onClick={onClose}>
        Stop scanning
      </button>
    </div>
  );
}

/** What a code holds, with the choice of saving it (and, for teams, opening it as a team). */
function Found({ found, mine, onSave, onTeam, onCancel }) {
  const [pick, setPick] = useState(() => {
    if (found.kind !== 'console' || found.characterId) return null;
    return '';
  });
  if (found.kind === 'team') {
    const ids = found.team.members.filter(Boolean);
    const ok = ids.filter(savable);
    const replace = ok.filter((id) => mine[id]);
    return (
      <div className="myagents__found">
        <p>
          <strong>{ids.length > 1 ? 'Team code' : 'Build code'}</strong> for {names(ids)}
          {found.team.name ? ` · “${found.team.name}”` : ''}
        </p>
        <div className="myagents__found-row">
          {ids.map((id) => (
            <span key={id} className="myagents__found-face" title={CHARACTER_BY_ID[id].name}>
              <Portrait character={CHARACTER_BY_ID[id]} size="sm" />
            </span>
          ))}
        </div>
        <p className="muted small">
          Saves each Esper’s Arc, Cartridge set and Cartridge stats as their My build (team codes don’t carry a
          Console, so a saved one is kept, else the suggested one is used).
          {replace.length ? ` Replaces your saved build for ${names(replace)}.` : ''}
          {ok.length < ids.length ? ` ${names(ids.filter((id) => !ok.includes(id)))} isn’t out yet, so is skipped.` : ''}
        </p>
        <div className="mybuild__starts">
          <button type="button" className="btn btn--primary" onClick={() => onSave(ok)} disabled={!ok.length}>
            {ok.length > 1 ? `Save as ${ok.length} builds` : 'Save this build'}
          </button>
          {ids.length > 1 && (
            <button type="button" className="btn" onClick={onTeam}>
              Open as a team
            </button>
          )}
          <button type="button" className="btn btn--quiet" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }
  // A console code: it needs its Esper (build images name it; older ones don't).
  const layout = found.console.layout;
  const fits = CHARACTERS.filter((c) => savable(c.id) && CHARACTER_CONSOLE[c.id]?.layout === layout);
  const id = found.characterId ?? pick;
  return (
    <div className="myagents__found">
      <p>
        <strong>Build code</strong>
        {found.characterId ? ` for ${names([found.characterId])}` : ': a Console with its Cartridge'}
      </p>
      {!found.characterId && (
        <label className="mybuild__field">
          <span>Which Esper is it for?</span>
          <select value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">Pick an Esper</option>
            {fits.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <p className="muted small">
        Saves the Cartridge, its stats and the Console as their My build; the Arc and Awakening order stay as they
        were.{id && mine[id] ? ` Replaces your saved build for ${names([id])}.` : ''}
      </p>
      <div className="mybuild__starts">
        <button type="button" className="btn btn--primary" onClick={() => onSave([id])} disabled={!id || !savable(id)}>
          Save this build
        </button>
        <button type="button" className="btn btn--quiet" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function MyEspersPage({ onLoadTeam }) {
  const [version, setVersion] = useState(0);
  const mine = useMemo(() => loadMyBuilds(), [version]); // eslint-disable-line react-hooks/exhaustive-deps
  const builds = useMemo(() => allMyBuilds(mine).filter((b) => CHARACTER_BY_ID[b.characterId]), [mine]);
  const [sort, setSort] = useState(() => get(SORT_KEY, 'name'));
  const [paste, setPaste] = useState('');
  const [error, setError] = useState('');
  const [found, setFound] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [reading, setReading] = useState(false);
  const [notice, setNotice] = useState('');
  const fileRef = useRef(null);

  const rated = useMemo(
    () => builds.map((b) => ({ ...b, review: reviewBuild(b.characterId, b.build) })),
    [builds],
  );
  const shown = useMemo(() => {
    const list = [...rated];
    const name = (b) => CHARACTER_BY_ID[b.characterId].name;
    if (sort === 'recent') return list.sort((a, b) => b.savedAt - a.savedAt);
    if (sort === 'rating')
      return list.sort((a, b) => (b.review?.score ?? -1) - (a.review?.score ?? -1) || name(a).localeCompare(name(b)));
    return list.sort((a, b) => name(a).localeCompare(name(b)));
  }, [rated, sort]);
  const ranks = RANK_ORDER.map((r) => [r, rated.filter((b) => b.review?.rank === r).length]).filter(([, n]) => n);

  const take = (text) => {
    const t = readAnyCode(text);
    if (!t) {
      setError('That isn’t a code the site can read. Paste a team or build code, or a team link.');
      return;
    }
    setError('');
    setNotice('');
    setFound(t);
  };
  const readImage = async (file) => {
    setReading(true);
    setError('');
    try {
      const r = await readImageCode(file);
      if (!r) setError('No code found in that picture. Use a team or build image saved from this site.');
      else take(r.kind === 'console' ? `NTEC:${r.code}${r.characterId ? `/${r.characterId}` : ''}` : `NTE:${r.code}`);
    } catch (e) {
      setError(e.message || 'Couldn’t read that picture.');
    }
    setReading(false);
    if (fileRef.current) fileRef.current.value = ''; // forget the file
  };
  const save = (ids) => {
    const all = loadMyBuilds();
    ids.forEach((id) => {
      const next =
        found.kind === 'team'
          ? buildFromTeam(id, found.team.loadouts?.[id], all[id])
          : buildFromConsole(id, found.console, all[id]);
      saveMyBuild(id, next);
    });
    setNotice(`Saved ${ids.length === 1 ? 'a build' : `${ids.length} builds`} for ${names(ids)}.`);
    setFound(null);
    setVersion((v) => v + 1);
  };

  return (
    <div className="page myagents">
      <header className="page__head">
        <h2 className="page__title">My Espers</h2>
        <p className="muted">
          All your saved builds in one place, like shortcuts on a desktop, each rated by Cortado. Tap one to open it.
          Builds are kept in this browser only.
        </p>
      </header>

      <section className="myagents__desk" aria-label="Saved builds">
        <div className="myagents__bar">
          <span className="muted small">
            {shown.length ? `${shown.length} Esper${shown.length > 1 ? 's' : ''}` : 'No builds yet'}
            {ranks.length > 0 && (
              <span className="myespers__ranks">
                {ranks.map(([r, n]) => (
                  <span key={r} className="myespers__rankchip" style={rankStyle(r)}>
                    {n} × {r}
                  </span>
                ))}
              </span>
            )}
          </span>
          {shown.length > 1 && (
            <label className="myagents__sort">
              <span className="muted small">Sort</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  put(SORT_KEY, e.target.value);
                }}
              >
                <option value="name">By name</option>
                <option value="rating">By rating</option>
                <option value="recent">Recently saved</option>
              </select>
            </label>
          )}
        </div>
        {shown.length ? (
          <ul className="myagents__grid">
            {shown.map((b) => {
              const c = CHARACTER_BY_ID[b.characterId];
              const el = ELEMENT_BY_ID[c.element]?.color ?? '#888';
              const r = b.review;
              const verdict = r?.rank
                ? `Cortado’s rating: ${r.rank}, ${r.score}/100${r.hasSubs ? '' : ' (main stat only so far)'}`
                : 'Not rated yet: add the Cartridge stats';
              return (
                <li key={b.characterId}>
                  <button
                    type="button"
                    className="myagents__icon"
                    style={{ '--el': el }}
                    onClick={() => navigate(`character-${b.characterId}~mine`)}
                    title={`${c.name} · ${verdict}`}
                    aria-label={`${c.name}, ${verdict}`}
                  >
                    <span className="myagents__art">
                      <Portrait character={c} size="lg" backdrop />
                      {r?.rank && (
                        <span className="myespers__rank" style={rankStyle(r.rank)} aria-hidden="true">
                          {r.rank}
                        </span>
                      )}
                    </span>
                    <span className="myagents__label">
                      <span className="myagents__name">{c.name}</span>
                      <span className="myagents__build">
                        {r?.rank ? `${r.score}/100${r.hasSubs ? '' : ' · main only'}` : 'Not rated yet'}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="myagents__empty muted">
            Builds you make on an Esper’s My build tab show up here. You can also bring them in below.
          </p>
        )}
        {shown.length > 0 && (
          <p className="muted small myespers__how">
            Cortado rates each build’s Cartridge main stat (40%) and the Cartridge and Console sub stats (60%) against
            what that Esper favours. Open a build to see his notes.
          </p>
        )}
      </section>

      <section className="myagents__add mybuild" aria-label="Add builds">
        <h3 className="myagents__h">Add builds</h3>
        {notice && (
          <p className="myagents__notice" role="status">
            {notice}
          </p>
        )}
        {found ? (
          <Found
            found={found}
            mine={mine}
            onSave={save}
            onTeam={() => onLoadTeam({ ...found.team, name: found.team.name || 'Shared team' })}
            onCancel={() => setFound(null)}
          />
        ) : (
          <>
            <form
              className="mybuild__paste"
              onSubmit={(e) => {
                e.preventDefault();
                take(paste);
                setPaste('');
              }}
            >
              <label className="field">
                <span>Paste a team or build code</span>
                <div className="code-row">
                  <input
                    className="code"
                    value={paste}
                    onChange={(e) => {
                      setPaste(e.target.value);
                      setError('');
                    }}
                    placeholder="A code from a team or build image, or a team link"
                    aria-invalid={Boolean(error)}
                  />
                  <button className="btn" type="submit" disabled={!paste.trim()}>
                    Read
                  </button>
                </div>
              </label>
            </form>
            {error && (
              <p className="field__error" role="alert">
                {error}
              </p>
            )}

            <div className="myagents__ways">
              {scanning ? (
                <QrScanner
                  onText={(t) => {
                    setScanning(false);
                    take(t);
                  }}
                  onClose={() => setScanning(false)}
                />
              ) : (
                <div className="shots">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setScanning(true)}
                    disabled={!navigator.mediaDevices?.getUserMedia}
                  >
                    Scan a QR code
                  </button>
                  <p className="muted small shots__hint">With your camera, from a team or build image on another screen.</p>
                </div>
              )}
              <div className="shots">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => e.target.files?.[0] && readImage(e.target.files[0])}
                />
                <button type="button" className="btn" onClick={() => fileRef.current?.click()} disabled={reading}>
                  {reading ? 'Reading…' : 'Upload an image'}
                </button>
                <p className="muted small shots__hint">
                  A team or build image saved from this site. Read on your device; nothing is uploaded or kept.
                </p>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
