// The hidden Tea Room: Matcha peeks out on the Arcs page, and tapping
// her opens this page. The game's official soundtrack plays through YouTube's
// own embedded player (the songs listed in public/music/playlist.txt), the track's cover sits
// in an Arc player whose disc spins, and Cortado and Matcha bop along.
//
// The beat bar can't hear the music (a page can't read sound from YouTube's
// player), so it pulses at a steady tempo while a track plays.
import { useEffect, useMemo, useRef, useState } from 'react';
import { songAgents, songFactions, songVersions, AGENT_NAMES } from '../lib/songAgents.js';
import { parsePlaylist, thumb, usePlaylistPlayer, playlistCover } from '../lib/youtube.js';
import { MOODS, SPECTRUM, guessMood, useBeatEngine, useMicAnalyser } from '../lib/beatEngine.js';
import { navigate } from '../lib/route.js';
import { Tail } from './Mascot.jsx';

const BASE = import.meta.env.BASE_URL;
// The songs: public/music/playlist.txt, one per line as "Song name | YouTube link".
const LIST_FILE = `${BASE}music/playlist.txt`;
const CHANNEL = 'https://www.youtube.com/channel/UCSCFh5RDT1SI2Ko7t6o9Nrg';
// The Arc's disc changes colour from track to track.
const TYPES = ['liquid', 'plasma', 'condensate', 'solid', 'gas'];
const BARS = 28;

/** A track's cover: the square in the middle of its thumbnail. */
function Cover({ id, className = '' }) {
  const [small, setSmall] = useState(false);
  if (!id) return <span className={`music-cover is-empty ${className}`} />;
  return (
    <span className={`music-cover${small ? ' is-hq' : ''} ${className}`}>
      <img
        key={`${id}-${small}`}
        src={thumb(id, small ? 'hq' : 'max')}
        alt=""
        decoding="async"
        // No 1280 px version: YouTube sends a 120 px stand-in, so use the standard one.
        onLoad={(e) => !small && e.currentTarget.naturalWidth <= 120 && setSmall(true)}
        onError={() => !small && setSmall(true)}
      />
    </span>
  );
}

/** An Arc player (the Arcs page's art) with the track's cover in its window. */
function Disc({ id, playing, index }) {
  const P = `${BASE}arc-player`;
  return (
    <div className="music-arc" aria-hidden="true">
      <span className={`arc-player${playing ? ' is-spinning' : ''}`}>
        <img className="arc-player__disc" src={`${P}/disc-${TYPES[Math.max(0, index) % TYPES.length]}.svg`} alt="" />
        <img className="arc-player__layer" src={`${P}/hub.svg`} alt="" />
        <img className="arc-player__layer" src={`${P}/case.svg`} alt="" />
        <span className="arc-player__art">
          <Cover id={id} className="music-arc__cover" />
        </span>
      </span>
    </div>
  );
}

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);
const PLAY = 'M8 5v14l11-7z';
const PAUSE = 'M7 5h4v14H7zM13 5h4v14h-4z';
const NEXT = 'M6 6l8.5 6L6 18zM16 6h2v12h-2z';
const PREV = 'M18 6l-8.5 6L18 18zM6 6h2v12H6z';
const VOL_HIGH = 'M4 9v6h4l5 4V5L8 9zM16.5 12a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z';
const VOL_LOW = 'M4 9v6h4l5 4V5L8 9zM16.5 12a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z';
const MUTED = 'M4 9v6h4l5 4V5L8 9zM16 9.4 17.4 8l2.1 2.1L21.6 8 23 9.4l-2.1 2.1 2.1 2.1-1.4 1.4-2.1-2.1-2.1 2.1-1.4-1.4 2.1-2.1z';
// Expand / shrink the stage (wide view on big screens).
const EXPAND = 'M4 4h6v2H6v4H4zM14 4h6v6h-2V6h-4zM4 14h2v4h4v2H4zM18 14h2v6h-6v-2h4z';
const SHRINK = 'M8 4h2v6H4V8h4zM14 4h2v4h4v2h-6zM4 14h6v6H8v-4H4zM14 14h6v2h-4v4h-2z';
const SHUFFLE =
  'M16 3h5v5l-1.8-1.8-4.4 4.4-1.4-1.4 4.4-4.4zM3 5.4 4.4 4l15.6 15.6V16h1v5h-5v-1h3.6zM9.6 13l1.4 1.4-6.6 6.6L3 19.6z';

// The reader's own room: their list of songs, filters and looks. Kept in this
// browser only (it's just for them).
const ROOM_KEY = 'nte-team-builder:musicRoom';
/**
 * Keeps the phone's screen on (Screen Wake Lock) while `on` is true and the
 * page is showing, so the music isn't stopped by the screen locking. The lock
 * is dropped when the page is hidden, and taken again when it comes back.
 * Returns whether this browser can do it.
 */
function useKeepAwake(on) {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  useEffect(() => {
    if (!supported || !on) return undefined;
    let lock = null;
    let dead = false;
    const take = async () => {
      if (dead || document.visibilityState !== 'visible' || (lock && !lock.released)) return;
      try {
        lock = await navigator.wakeLock.request('screen');
      } catch {
        lock = null; // Refused (low battery, say): the screen just locks as usual.
      }
    };
    take();
    document.addEventListener('visibilitychange', take);
    return () => {
      dead = true;
      document.removeEventListener('visibilitychange', take);
      lock?.release?.().catch(() => {});
    };
  }, [supported, on]);
  return supported;
}

const ROOM_DEFAULTS = { order: 'file', awake: false, hide: [], hidden: [], showHidden: false, wide: false, source: 'all', kind: 'all', albums: [], moving: true, viz: 'bars', bars: 'classic', mine: [], tempo: {}, moods: {}, volume: 80, muted: false };
// Look-and-feel settings both Tea Rooms share. The two sites are on the same
// GitHub Pages address, so they can read the same browser storage; songs,
// hidden songs and tempos stay per site.
const SHARED_KEY = 'cortado-tea-room:shared';
const SHARED = ['viz', 'bars', 'moving', 'wide', 'awake', 'volume', 'muted', 'order'];
const pickShared = (o) => Object.fromEntries(SHARED.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));

function useRoomSettings() {
  const [room, setRoom] = useState(() => {
    try {
      let v = JSON.parse(localStorage.getItem(ROOM_KEY) || '{}');
      try {
        v = { ...v, ...pickShared(JSON.parse(localStorage.getItem(SHARED_KEY) || '{}')) };
      } catch {
        /* no shared settings yet */
      }
      // Mirror was dropped: show Bars instead.
      // Wings is hidden for now while it's being refined.
      if (v.viz === 'mirror' || v.viz === 'wings') v = { ...v, viz: 'bars' };
      // Old names, and the short-lived character colour row (c-…), map to today's styles.
      const bars = String(v.bars ?? '').startsWith('c-') ? 'classic' : ({ pixel: 'digital', dots: 'y2k' }[v.bars] ?? v.bars);
      return {
        ...ROOM_DEFAULTS,
        ...v,
        bars: bars ?? ROOM_DEFAULTS.bars,
        mine: Array.isArray(v.mine) ? v.mine : [],
        hide: Array.isArray(v.hide) ? v.hide : [],
        hidden: Array.isArray(v.hidden) ? v.hidden : [],
        albums: Array.isArray(v.albums) ? v.albums : [],
        tempo: v.tempo && typeof v.tempo === 'object' ? v.tempo : {},
        moods: v.moods && typeof v.moods === 'object' ? v.moods : {},
      };
    } catch {
      return ROOM_DEFAULTS;
    }
  });
  const update = (patch) =>
    setRoom((r) => {
      const n = { ...r, ...patch };
      try {
        localStorage.setItem(ROOM_KEY, JSON.stringify(n));
        localStorage.setItem(SHARED_KEY, JSON.stringify(pickShared(n)));
      } catch {
        /* not kept: fine */
      }
      return n;
    });
  return [room, update];
}

/** Instrumental versions of songs, going by the name ("(Instrumental)", 伴奏). */
const isInstrumental = (x) => /instrumental|伴奏|karaoke|off vocal/i.test(x.name);

const BAR_STYLES = [
  { id: 'classic', label: 'Classic' },
  { id: 'neon', label: 'Neon' },
  { id: 'digital', label: 'Digital' },
  { id: 'y2k', label: 'Y2K' },
  { id: 'rainbow', label: 'Rainbow' },
  { id: 'elements', label: 'Elements' },
  { id: 'illusion', label: 'Illusion' },
  { id: 'sunbringer', label: 'Sunchaser' },
  { id: 'lacrimosa', label: 'Lacrimosa' },
  { id: 'frost', label: 'Frost' },
  { id: 'honed-edge', label: 'Honed Edge' },
  { id: 'auric-ink', label: 'Auric Ink' },
  { id: 'lumiflux', label: 'Lumiflux' },
];

/** A row of buttons where one is picked. */
function Choice({ label, value, options, onChange }) {
  return (
    <div className="music__choice" role="group" aria-label={label}>
      <span className="music__choice-label">{label}</span>
      <div className="music__seg">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className={value === o.id ? 'is-on' : ''}
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Which albums play: all of them, or the ones the reader ticks (they play one
 * after another, in playlist order). Kept with the room's other settings.
 */
function AlbumPicker({ names, room, setRoom }) {
  const on = new Set(room.albums.filter((a) => names.includes(a)));
  const toggle = (a) => {
    const next = new Set(on);
    if (next.has(a)) next.delete(a);
    else next.add(a);
    setRoom({ albums: names.filter((n) => next.has(n)) });
  };
  return (
    <details className="music__pick">
      <summary>
        <span className="music__choice-label">Albums</span>
        <span>{on.size ? `${on.size} of ${names.length} picked` : `All ${names.length}`}</span>
        <span className="muted small">Pick several to play them back to back</span>
      </summary>
      <div className="music__pick-list" role="group" aria-label="Albums to play">
        {names.map((a) => (
          <label key={a} className={`music__pick-item${on.has(a) ? ' is-on' : ''}`}>
            <input type="checkbox" checked={on.has(a)} onChange={() => toggle(a)} />
            {a}
          </label>
        ))}
      </div>
      {on.size > 0 && (
        <button type="button" className="btn btn--quiet btn--small" onClick={() => setRoom({ albums: [] })}>
          Play every album again
        </button>
      )}
    </details>
  );
}

// The playlist's order: as in the file, A to Z, Z to A, newest or oldest first
// (by release date). Albums keep their songs together; My list sorts song by song.
// Songs the reader can tick to hide, matched by their title (none here yet).
const HIDES = [];
const hiddenBy = (room) => HIDES.filter((h) => room.hide.includes(h.id));

/** Hidden by the reader: one by one (the eye button), or by a ticked Hide rule. */
const isHiddenSong = (room, x) => room.hidden.includes(x.id) || hiddenBy(room).some((h) => h.test.test(x.name));
// The eye on each song: open while it plays as usual, crossed out while it's hidden.
const EYE = 'M12 5C7 5 3 9.5 2 12c1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7zm0 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-2.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z';
const EYE_OFF =
  'M3.3 2 2 3.3l3.1 3.1C3.6 7.7 2.5 9.9 2 12c1 2.5 5 7 10 7 1.9 0 3.6-.6 5.1-1.5l3.6 3.6 1.3-1.3zM12 16.5A4.5 4.5 0 0 1 7.6 11l1.6 1.6a2.8 2.8 0 0 0 2.2 2.2l1.6 1.6c-.3.1-.6.1-1 .1zM12 5c-1.2 0-2.3.2-3.3.6l2.1 2.1a4.5 4.5 0 0 1 5.5 5.5l3.4 3.4c1.2-1.2 2.1-2.6 2.3-3.6-1-2.5-5-7-10-7z';

const ORDERS = [
  { id: 'file', label: 'Playlist' },
  { id: 'az', label: 'A–Z' },
  { id: 'za', label: 'Z–A' },
  { id: 'new', label: 'Newest' },
  { id: 'old', label: 'Oldest' },
];
const byName = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true });
function sortSongs(list, order, byAlbum) {
  if (!order || order === 'file') return list;
  const cmp = (a, b) => {
    if (order === 'az') return byName(a.key, b.key);
    if (order === 'za') return byName(b.key, a.key);
    const d = (a.date || '').localeCompare(b.date || '');
    return (order === 'new' ? -d : d) || byName(a.key, b.key);
  };
  if (!byAlbum) return list.map((x) => ({ x, key: x.name || '', date: x.date })).sort(cmp).map((e) => e.x);
  const groups = [];
  list.forEach((x) => {
    const g = groups[groups.length - 1];
    if (g && g.key === (x.album || '')) g.songs.push(x);
    else groups.push({ key: x.album || '', date: x.date, songs: [x] });
  });
  return groups.sort(cmp).flatMap((g) => g.songs);
}
/** "Oct 2026" from "2026-10-25". */
const monthYear = (d) => {
  if (!d) return '';
  const [y, m] = d.split('-');
  return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m - 1]} ${y}`;
};

/** The video to show for a row: itself, or for a whole YouTube playlist the song it's on (or its first song). */
const coverOf = (x, nowId) => (x?.list ? nowId || playlistCover(x.list) : x?.id) ?? null;

/** The songs grouped by album, in file order: [{ name, start, songs }]. */
function albumsOf(songs) {
  const out = [];
  songs.forEach((x, i) => {
    const last = out[out.length - 1];
    if (last && last.name === x.album) last.songs.push(x);
    else out.push({ name: x.album || 'Songs', date: x.date, fan: x.fan, ai: x.ai, start: i, songs: [x] });
  });
  return out;
}

/**
 * Albums in a swipeable carousel; the chosen album's songs below it, which can
 * be folded away. Follows the album that's playing until the reader picks one.
 */
function Playlist({ songs, yt, room, setRoom, total, mineCount, hiddenCount, albumNames, find, setFind, agent, setAgent, agentCounts, faction, setFaction, factionCounts, version, setVersion, versionCounts }) {
  const mine = new Set(room.mine);
  const toggleHidden = (id) =>
    setRoom({ hidden: room.hidden.includes(id) ? room.hidden.filter((x) => x !== id) : [...room.hidden, id] });
  const toggleMine = (id) =>
    setRoom({ mine: mine.has(id) ? room.mine.filter((x) => x !== id) : [...room.mine, id] });
  const albums = useMemo(() => albumsOf(songs), [songs]);
  const playingAlbum = albums.findIndex((a) => yt.index >= a.start && yt.index < a.start + a.songs.length);
  const [picked, setPicked] = useState(null);
  const [open, setOpen] = useState(true);
  // A new filter or list: follow the playing album again.
  useEffect(() => setPicked(null), [songs]);
  const shown = picked ?? Math.max(0, playingAlbum);
  const album = albums[shown];
  const rail = useRef(null);
  const slide = (dir) => {
    const r = rail.current;
    if (r) r.scrollBy({ left: dir * r.clientWidth * 0.8, behavior: 'smooth' });
  };
  // Keep the playing album in view in the carousel.
  useEffect(() => {
    if (picked != null || playingAlbum < 0) return;
    const el = rail.current?.children[playingAlbum];
    const r = rail.current;
    if (el && r) r.scrollTo({ left: el.offsetLeft - r.offsetLeft - 8, behavior: 'smooth' });
  }, [playingAlbum, picked]);

  return (
    <section className="music__list" aria-label="Playlist">
      <div className="music__listhead">
        <h3 className="music__h">Playlist</h3>
        <span className="muted small">
          {songs.length === total ? `${songs.length} songs` : `${songs.length} of ${total} songs`}
        </span>
      </div>
      <div className="music__finders">
        <label className="music__find">
          <span className="sr-only">Find a song</span>
          <input
            type="search"
            placeholder="Find a song or album…"
            value={find}
            onChange={(e) => setFind(e.target.value)}
          />
        </label>
        {agentCounts.length > 0 && (
          <label className="music__agentpick">
            <span className="music__choice-label">Character</span>
            <select value={agent} onChange={(e) => setAgent(e.target.value)}>
              <option value="">All characters</option>
              {agentCounts.map(([id, n]) => (
                <option key={id} value={id}>
                  {AGENT_NAMES[id]} ({n})
                </option>
              ))}
            </select>
          </label>
        )}
        {versionCounts.length > 0 && (
          <label className="music__agentpick">
            <span className="music__choice-label">Version</span>
            <select value={version} onChange={(e) => setVersion(e.target.value)}>
              <option value="">All versions</option>
              {versionCounts.map(([v, n]) => (
                <option key={v} value={v}>
                  {v} ({n})
                </option>
              ))}
            </select>
          </label>
        )}
        {factionCounts.length > 0 && (
          <label className="music__agentpick">
            <span className="music__choice-label">Faction</span>
            <select value={faction} onChange={(e) => setFaction(e.target.value)}>
              <option value="">All factions</option>
              {factionCounts.map(([f, n]) => (
                <option key={f} value={f}>
                  {f} ({n})
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {(find || agent || faction || version) && !songs.length && (
        <p className="muted small">No songs match. Try another name, or clear the search.</p>
      )}
      <div className="music__filters">
        <Choice label="Order" value={room.order} onChange={(v) => setRoom({ order: v })} options={ORDERS} />
        <Choice
          label="Play"
          value={room.source}
          onChange={(v) => setRoom({ source: v })}
          options={[
            { id: 'all', label: 'All songs' },
            { id: 'official', label: 'Official only' },
            { id: 'fan', label: 'Fan uploads only' },
            { id: 'mine', label: `My list (${mineCount})` },
          ]}
        />
        <Choice
          label="Songs"
          value={room.kind}
          onChange={(v) => setRoom({ kind: v })}
          options={[
            { id: 'all', label: 'All' },
            { id: 'vocal', label: 'Lyrical' },
            { id: 'inst', label: 'Instrumental' },
            { id: 'game', label: 'OST' },
          ]}
        />
        {(HIDES.length > 0 || hiddenCount > 0) && (
          <div className="music__choice" role="group" aria-label="Hide">
            <span className="music__choice-label">Hide</span>
            <div className="music__ticks">
              {HIDES.map((h) => (
                <label key={h.id} className="music__tick">
                  <input
                    type="checkbox"
                    checked={room.hide.includes(h.id)}
                    onChange={(e) =>
                      setRoom({ hide: e.target.checked ? [...room.hide, h.id] : room.hide.filter((x) => x !== h.id) })
                    }
                  />
                  {h.label}
                </label>
              ))}
              {hiddenCount > 0 && (
                <label className="music__tick">
                  <input
                    type="checkbox"
                    checked={room.showHidden}
                    onChange={(e) => setRoom({ showHidden: e.target.checked })}
                  />
                  Show hidden ({hiddenCount})
                </label>
              )}
            </div>
          </div>
        )}
      </div>
      <AlbumPicker names={albumNames} room={room} setRoom={setRoom} />
      {!songs.length && (
        <p className="music__empty muted">
          {room.source === 'mine' && !mineCount
            ? 'Your list is empty. Switch to All songs and tap ♡ next to the songs you want here.'
            : 'No songs match. Try another filter or pick other albums.'}
        </p>
      )}

      {albums.length > 1 && (
        <div className="music__carousel">
          <button type="button" className="music__arrow" onClick={() => slide(-1)} aria-label="Previous albums">
            ‹
          </button>
          <ul className="music__albums" ref={rail}>
            {albums.map((a, k) => (
              <li key={`${a.name}-${a.start}`}>
                <button
                  type="button"
                  className={`music__albumcard${k === shown ? ' is-on' : ''}${k === playingAlbum ? ' is-playing' : ''}`}
                  onClick={() => {
                    setPicked(k);
                    setOpen(true);
                  }}
                  // Double-click (or double-tap): play the album from its first song.
                  onDoubleClick={() => yt.ready && yt.playAt(a.start)}
                  title="Double-click to play this album"
                  aria-pressed={k === shown}
                >
                  <Cover id={coverOf(a.songs[0])} className="music__albumart" />
                  <span className="music__albumname">{a.name}</span>
                  {a.date && <span className="music__albumdate small">{monthYear(a.date)}</span>}
                  {(a.fan || a.ai) && (
                    <span className="music__tags">
                      {a.fan && <span className="music__tag">Fan upload</span>}
                      {a.ai && <span className="music__tag music__tag--ai">AI-assisted</span>}
                    </span>
                  )}
                  <span className="muted small">
                    {k === playingAlbum ? '♪ Playing · ' : ''}
                    {a.songs.every((x) => x.list)
                      ? `YouTube playlist${a.songs.length > 1 ? 's' : ''}`
                      : `${a.songs.length} song${a.songs.length > 1 ? 's' : ''}`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="music__arrow" onClick={() => slide(1)} aria-label="More albums">
            ›
          </button>
        </div>
      )}

      {album && (
        <div className="music__album-songs">
          <div className="music__albumbar">
            <strong>{album.name}</strong>
            <span className="music__albumbtns">
              <button
                type="button"
                className="btn btn--quiet"
                onClick={() => yt.playAt(album.start)}
                disabled={!yt.ready}
              >
                Play album
              </button>
              <button type="button" className="btn btn--quiet" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
                {open ? 'Hide songs' : `Show ${album.songs.length} songs`}
              </button>
            </span>
          </div>
          {open && (
            <ol className="music__tracks">
              {album.songs.map((x, j) => {
                const i = album.start + j;
                const blocked = yt.blocked.includes(x.id);
                const label = x.name || (!x.list && i === yt.index && yt.title) || (x.list ? 'YouTube playlist' : `Song ${j + 1}`);
                return (
                  <li key={`${x.id}-${i}`} className={`music__row${isHiddenSong(room, x) ? ' is-hidden' : ''}`}>
                    {blocked ? (
                      <a
                        className="music__track is-blocked"
                        href={x.list ? `https://www.youtube.com/playlist?list=${x.list}` : `https://www.youtube.com/watch?v=${x.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="music__num">{j + 1}</span>
                        <Cover id={coverOf(x, i === yt.index ? yt.videoId : null)} className="music__thumb" />
                        <span className="music__name">
                          {label}
                          <span className="muted small">Only plays on YouTube: open it there</span>
                        </span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        className={`music__track${i === yt.index ? ' is-on' : ''}`}
                        onClick={() => yt.playAt(i)}
                        disabled={!yt.ready}
                        aria-current={i === yt.index ? 'true' : undefined}
                      >
                        <span className="music__num">{i === yt.index && yt.playing ? '♪' : j + 1}</span>
                        <Cover id={coverOf(x, i === yt.index ? yt.videoId : null)} className="music__thumb" />
                        <span className="music__name">
                          {label}
                          {x.list && (
                            <span className="muted small">
                              {i === yt.index && yt.title ? `Now: ${yt.title}` : 'YouTube playlist: plays all its songs'}
                            </span>
                          )}
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      className={`music__hide${room.hidden.includes(x.id) ? ' is-on' : ''}`}
                      onClick={() => toggleHidden(x.id)}
                      aria-pressed={room.hidden.includes(x.id)}
                      aria-label={room.hidden.includes(x.id) ? `Unhide ${label}` : `Hide ${label} so it isn’t played`}
                      title={room.hidden.includes(x.id) ? 'Hidden: tap to unhide' : 'Hide this song'}
                    >
                      <Icon d={room.hidden.includes(x.id) ? EYE_OFF : EYE} />
                    </button>
                    <button
                      type="button"
                      className={`music__heart${mine.has(x.id) ? ' is-on' : ''}`}
                      onClick={() => toggleMine(x.id)}
                      aria-pressed={mine.has(x.id)}
                      aria-label={mine.has(x.id) ? `Remove ${label} from my list` : `Add ${label} to my list`}
                      title={mine.has(x.id) ? 'In my list' : 'Add to my list'}
                    >
                      {mine.has(x.id) ? '♥' : '♡'}
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </section>
  );
}

/**
 * Cortado in the room. While music plays he's in his chill look: shades on,
 * tail out and swaying, a hand up and notes drifting. Same 64 x 64 grid as mascot.svg.
 */
function Cortado({ chill }) {
  return (
    <span className={`music__pal music__pal--cortado music-cortado${chill ? ' is-chill' : ''}`}>
      {chill && (
        <svg className="music-cortado__layer" viewBox="0 0 64 64" aria-hidden="true">
          <g className="music-cortado__tail">
            <Tail d="M42 50 Q54 52 57 42 Q59.4 34 56 27.6" />
          </g>
        </svg>
      )}
      <img src={`${BASE}mascot.svg`} alt={chill ? 'Cortado, chilling to the music' : 'Cortado'} />
      {chill && (
        <svg className="music-cortado__layer" viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <linearGradient id="cortado-shades" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5B3FA8" />
              <stop offset="0.55" stopColor="#B24FA0" />
              <stop offset="1" stopColor="#F08A5D" />
            </linearGradient>
          </defs>
          {/* Shades over the eyes */}
          <g stroke="#1A120D" strokeWidth="0.9" strokeLinejoin="round">
            <path d="M20.6 30.2 H31 V34 Q31 37.4 27 37.4 H24.4 Q20.6 37.4 20.6 34 Z" fill="url(#cortado-shades)" />
            <path d="M33 30.2 H43.4 V34 Q43.4 37.4 39.6 37.4 H37 Q33 37.4 33 34 Z" fill="url(#cortado-shades)" />
            <path d="M31 31.2 Q32 30.4 33 31.2" fill="none" />
          </g>
          <path d="M22 31.4 L24.6 31.4 M34.4 31.4 L37 31.4" stroke="#fff" strokeWidth="0.7" strokeLinecap="round" opacity="0.7" />
          {/* Notes drifting up */}
          <g className="music-cortado__notes" fill="#2B1D16">
            <g className="music-cortado__note">
              <ellipse cx="7" cy="16" rx="1.9" ry="1.4" />
              <path d="M8.6 16 V8.6 L12 7.6" stroke="#2B1D16" strokeWidth="0.8" fill="none" />
            </g>
            <g className="music-cortado__note music-cortado__note--2">
              <ellipse cx="4" cy="26" rx="1.6" ry="1.2" />
              <path d="M5.4 26 V20" stroke="#2B1D16" strokeWidth="0.8" fill="none" />
            </g>
          </g>
        </svg>
      )}
    </span>
  );
}

export default function MusicRoom() {
  const host = useRef(null);
  const [songs, setSongs] = useState(null);
  useEffect(() => {
    let dead = false;
    fetch(LIST_FILE, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.text() : ''))
      .catch(() => '')
      .then((t) => !dead && setSongs(parsePlaylist(t)));
    return () => {
      dead = true;
    };
  }, []);
  const [room, setRoom] = useRoomSettings();
  // Finding songs: by words in the song or album name, by character, faction and game version. Not kept
  // between visits.
  const [find, setFind] = useState('');
  const [agent, setAgent] = useState('');
  const agentsBySong = useMemo(() => new Map((songs ?? []).map((x) => [x, songAgents(x)])), [songs]);
  const [faction, setFaction] = useState('');
  const factionsBySong = useMemo(
    () => new Map([...agentsBySong].map(([x, ids]) => [x, songFactions(x, ids)])),
    [agentsBySong],
  );
  const [version, setVersion] = useState('');
  const versionsBySong = useMemo(
    () => new Map([...agentsBySong].map(([x, ids]) => [x, songVersions(x, ids)])),
    [agentsBySong],
  );
  // Versions with songs, newest first.
  const versionCounts = useMemo(() => {
    const n = new Map();
    for (const vs of versionsBySong.values()) for (const v of vs) n.set(v, (n.get(v) || 0) + 1);
    return [...n].sort((a, b) => b[0].localeCompare(a[0], undefined, { numeric: true }));
  }, [versionsBySong]);
  // Factions with songs, most songs first.
  const factionCounts = useMemo(() => {
    const n = new Map();
    for (const fs of factionsBySong.values()) for (const f of fs) n.set(f, (n.get(f) || 0) + 1);
    return [...n].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [factionsBySong]);
  // Characters with songs, most songs first.
  const agentCounts = useMemo(() => {
    const n = new Map();
    for (const ids of agentsBySong.values()) for (const id of ids) n.set(id, (n.get(id) || 0) + 1);
    return [...n].sort((a, b) => b[1] - a[1] || AGENT_NAMES[a[0]].localeCompare(AGENT_NAMES[b[0]]));
  }, [agentsBySong]);
  // The songs under the Play and Songs choices.
  const filtered = useMemo(() => {
    let list = songs ?? [];
    if (room.source === 'mine') {
      const byId = new Map(list.map((x) => [x.id, x]));
      list = room.mine.map((id) => byId.get(id)).filter(Boolean);
    }
    if (room.source === 'official') list = list.filter((x) => !x.fan);
    if (room.source === 'fan') list = list.filter((x) => x.fan);
    // Hidden songs aren't played (or listed) unless the reader shows them.
    if (!room.showHidden) list = list.filter((x) => !isHiddenSong(room, x));
    // Lyrical / instrumental versions of the songs; OST: the music from inside the game.
    const words = find.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length) list = list.filter((x) => words.every((w) => `${x.name} ${x.album}`.toLowerCase().includes(w)));
    if (agent) list = list.filter((x) => agentsBySong.get(x)?.includes(agent));
    if (faction) list = list.filter((x) => factionsBySong.get(x)?.includes(faction));
    if (version) list = list.filter((x) => versionsBySong.get(x)?.includes(version));
    if (room.kind === 'vocal') list = list.filter((x) => !x.game && !isInstrumental(x));
    if (room.kind === 'inst') list = list.filter((x) => !x.game && isInstrumental(x));
    if (room.kind === 'game') list = list.filter((x) => x.game);
    return sortSongs(list, room.order, room.source !== 'mine');
  }, [songs, room.source, room.kind, room.mine, room.order, room.hide, room.hidden, room.showHidden, find, agent, agentsBySong, faction, factionsBySong, version, versionsBySong]);
  // The albums the picker offers: those with songs under those choices.
  const albumNames = useMemo(() => [...new Set(filtered.map((x) => x.album).filter(Boolean))], [filtered]);
  // Picked albums only (none picked, or none of them here: every album), played one after another.
  const playable = useMemo(() => {
    const on = new Set(room.albums);
    return filtered.some((x) => on.has(x.album)) ? filtered.filter((x) => on.has(x.album)) : filtered;
  }, [filtered, room.albums]);
  const yt = usePlaylistPlayer(host, playable);
  // While music plays and the reader asked for it, the screen stays on.
  const canKeepAwake = useKeepAwake(room.awake && yt.playing);
  const song = playable[yt.index] ?? null;
  const current = song?.id ?? null;
  // In a whole YouTube playlist, show the song it's on (the playlist's name goes with the album).
  const title = song?.list ? yt.title || song.name : song?.name || yt.title;
  // The beat: what the reader tapped for this song, else the playlist's tempo, else 100.
  const tapped = song ? room.tempo[song.id] : null;
  const bpm = tapped || song?.bpm || 100;
  const taps = useRef([]);
  // The reader's volume, handed to YouTube's player once it's ready and on every change.
  useEffect(() => {
    if (!yt.ready) return;
    yt.setVolume(room.volume);
    if (room.muted || room.volume === 0) yt.mute();
    else yt.unMute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yt.ready, room.volume, room.muted]);
  const barsRef = useRef(null);
  const pulseRef = useRef(null);
  // The song's type: what the reader picked for it, else a guess from its name.
  const pickedMood = song ? room.moods[song.id] : null;
  const mood = pickedMood || (song ? guessMood(song) : 'steady');
  const nextMood = () => {
    if (!song) return;
    const ids = Object.keys(MOODS);
    const n = ids[(ids.indexOf(mood) + 1) % ids.length];
    const { [song.id]: _, ...rest } = room.moods;
    setRoom({ moods: n === guessMood(song) ? rest : { ...rest, [song.id]: n } });
  };
  // Listen: real bars from the microphone. Off on every visit, so the browser
  // only asks when the listener switches it on.
  const [listen, setListen] = useState(false);
  const mic = useMicAnalyser(listen);
  useBeatEngine({ barsRef, canvasRef: pulseRef, viz: room.viz, bpm, playing: yt.playing, mood, progress: yt.progress, live: mic.analyser });
  const tap = () => {
    if (!song) return;
    const now = performance.now();
    const t = taps.current.filter((x) => now - x < 2500);
    t.push(now);
    taps.current = t;
    if (t.length < 4) return;
    const gaps = t.slice(1).map((x, i) => x - t[i]);
    const avg = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const v = Math.round(60000 / avg);
    if (v >= 40 && v <= 240) setRoom({ tempo: { ...room.tempo, [song.id]: v } });
  };
  const clearTempo = () => {
    if (!song) return;
    const { [song.id]: _, ...rest } = room.tempo;
    setRoom({ tempo: rest });
  };

  return (
    <div
      className={`page music${yt.playing ? ' is-playing' : ''}${room.moving ? '' : ' is-still'}${room.wide ? ' is-wide' : ''}`}
      style={{ '--beat': `${(60 / bpm).toFixed(3)}s` }}
    >
      <header className="page__head music__head">
        <button type="button" className="btn btn--quiet music__back" onClick={() => navigate('arcs')}>
          ← Arcs
        </button>
        <h2 className="page__title">Matcha’s Tea Room</h2>
        <p className="muted">
          You found Matcha’s hiding spot. Pick a track: it’s the game’s official soundtrack from{' '}
          <a href={CHANNEL} target="_blank" rel="noopener noreferrer">
            NTE10AM
          </a>{' '}
          and{' '}
          <a href="https://www.youtube.com/@NTE_Official" target="_blank" rel="noopener noreferrer">
            NTE Global
          </a>{' '}
          on YouTube.
        </p>
      </header>

      {/* A friendly reminder from Matcha: the room is for unwinding, not for skipping what matters or bothering anyone. */}
      <aside className="music__matcha-note" aria-label="A note from Matcha">
        <img src={`${BASE}matcha/wink.webp`} alt="" width="56" height="56" />
        <p>
          <strong>A little note from Matcha:</strong> I’m happy you’re here! Music goes best alongside your day, not in
          place of it. Your studies, work, prayers, rest and the people around you come first, so pause me whenever
          they need you. And please keep it kind: headphones or a low volume around others, and never use the room to
          annoy or disrespect anyone.
        </p>
      </aside>

      <section className="music__stage" aria-label="Now playing">
        {/* Big screens: widen the stage to the full page; the controls and playlist move below. */}
        <button
          type="button"
          className="music__expand"
          onClick={() => setRoom({ wide: !room.wide })}
          aria-pressed={room.wide}
          title={room.wide ? 'Shrink the player' : 'Expand the player'}
        >
          <Icon d={room.wide ? SHRINK : EXPAND} />
          <span>{room.wide ? 'Shrink' : 'Expand'}</span>
        </button>
        <Cortado chill={yt.playing} />
        <Disc id={coverOf(song, yt.videoId)} playing={yt.playing} index={yt.index} />
        {/* Matcha with her two tails as their own layers, so they can sway. */}
        <span className="music__pal music__pal--matcha music-matcha">
          <img className="music-matcha__tail music-matcha__tail--up" src={`${BASE}matcha/tail-upper.webp`} alt="" />
          <img className="music-matcha__tail music-matcha__tail--low" src={`${BASE}matcha/tail-lower.webp`} alt="" />
          <img
            className="music-matcha__body"
            src={`${BASE}matcha/body-${yt.playing ? 'starry' : 'neutral'}.webp`}
            alt={yt.playing ? 'Matcha, enjoying the music' : 'Matcha'}
          />
        </span>
        <div className="music__beat" data-bars={room.bars} data-viz={room.viz} aria-hidden="true">
          {room.viz !== 'bars' ? (
            <canvas className="music__pulse" ref={pulseRef} />
          ) : (
            <div className="music__bars" ref={barsRef}>
              {Array.from({ length: BARS }, (_, i) => (
                <span key={i} style={{ '--i': i }} />
              ))}
            </div>
          )}
          {/* Spare layer for style effects that need more than the strip's two pseudo-elements. */}
          <i className="music__fx" />
        </div>
      </section>

      <section className="music__now">
        <p className="music__title" aria-live="polite">
          {yt.error ? (
            <span className="field__error">{yt.error}</span>
          ) : songs && !songs.length ? (
            'No songs in the playlist yet'
          ) : title ? (
            title
          ) : yt.waiting ? (
            'Starting…'
          ) : yt.ready ? (
            'Press play to start'
          ) : (
            'Loading the player…'
          )}
        </p>
        {yt.waiting && (
          <p className="music__wait small" role="status">
            YouTube is playing an ad or still loading. Your song starts right after; the room can’t skip ads.
          </p>
        )}
        {(song?.album || yt.author) && (
          <p className="muted small music__artist">
            {[song?.album, yt.author.replace(/ - Topic$/, ''), song?.ai && 'AI-assisted'].filter(Boolean).join(' · ')}
          </p>
        )}
        {song && (
          <p className="music__tempo small">
            <span className="muted">
              ♩ {bpm} BPM{tapped ? ' (tapped)' : song.bpm ? '' : ' (default)'}
            </span>
            <button
              type="button"
              className="music__tap music__mood"
              onClick={nextMood}
              title="How lively the beat is for this song. Tap to change it."
            >
              {MOODS[mood].label}
              {pickedMood ? '' : ' (guessed)'}
            </button>
            <button
              type="button"
              className="music__tap"
              onClick={tap}
              title="Tap 4 or more times in time with the music to set this song's beat"
            >
              Tap the beat
            </button>
            {tapped && (
              <button type="button" className="music__tap music__tap--reset" onClick={clearTempo}>
                Reset
              </button>
            )}
          </p>
        )}
        <div className="music__controls">
          <button
            type="button"
            className={`music__btn${yt.shuffle ? ' is-on' : ''}`}
            onClick={() => yt.setShuffle(!yt.shuffle)}
            aria-pressed={yt.shuffle}
            aria-label="Shuffle"
            title="Shuffle"
            disabled={!yt.ready}
          >
            <Icon d={SHUFFLE} />
          </button>
          <button type="button" className="music__btn" onClick={yt.prev} aria-label="Previous track" disabled={!yt.ready}>
            <Icon d={PREV} />
          </button>
          <button
            type="button"
            className="music__btn music__btn--main"
            onClick={yt.toggle}
            aria-label={yt.playing ? 'Pause' : 'Play'}
            disabled={!yt.ready}
          >
            <Icon d={yt.playing ? PAUSE : PLAY} />
          </button>
          <button type="button" className="music__btn" onClick={yt.next} aria-label="Next track" disabled={!yt.ready}>
            <Icon d={NEXT} />
          </button>
        </div>
        <div className="music__volume">
          <button
            type="button"
            className="music__btn music__btn--small"
            onClick={() => setRoom({ muted: !room.muted })}
            aria-pressed={room.muted}
            aria-label={room.muted ? 'Unmute' : 'Mute'}
            title={room.muted ? 'Unmute' : 'Mute'}
            disabled={!yt.ready}
          >
            <Icon d={room.muted || room.volume === 0 ? MUTED : room.volume < 50 ? VOL_LOW : VOL_HIGH} />
          </button>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={room.muted ? 0 : room.volume}
            onChange={(e) => setRoom({ volume: +e.target.value, muted: false })}
            aria-label="Volume"
            disabled={!yt.ready}
            style={{ '--v': `${room.muted ? 0 : room.volume}%` }}
          />
          <span className="muted small music__volnum">{room.muted ? 'Muted' : `${room.volume}%`}</span>
        </div>
        <details className="music__settings">
          <summary>Room settings</summary>
          <div className="music__settings-body">
            <Choice
              label="Matcha & Cortado"
              value={room.moving ? 'move' : 'still'}
              onChange={(v) => setRoom({ moving: v === 'move' })}
              options={[
                { id: 'move', label: 'Dance' },
                { id: 'still', label: 'Stay still' },
              ]}
            />
            <Choice
              label="Beat"
              value={room.viz}
              onChange={(v) => setRoom({ viz: v })}
              options={[
                { id: 'bars', label: 'Bars' },
                { id: 'pulse', label: 'Pulse line' },
                { id: 'wave', label: 'Wave' },
                { id: 'ripples', label: 'Ripples' },
                { id: 'bloom', label: 'Bloom' },
                { id: 'embers', label: 'Embers' },
                { id: 'led', label: 'LED' },
                { id: 'curve', label: 'Curve' },
                { id: 'radial', label: 'Ring' },
                { id: 'brush', label: 'Brush' },
                { id: 'globe', label: 'Crystal ball' },
                // { id: 'wings', label: 'Wings' }, hidden for now while it's being refined.
              ]}
            />
            <Choice label="Style" value={room.bars} onChange={(v) => setRoom({ bars: v })} options={BAR_STYLES} />
            <div className="music__choice">
              <span className="music__choice-label">Listen</span>
              <label className="music__tick">
                <input type="checkbox" checked={listen} onChange={(e) => setListen(e.target.checked)} />
                Real bars from your microphone
              </label>
              <p className="muted small music__note">
                {mic.error ||
                  (listen && !SPECTRUM.has(room.viz) && room.viz !== 'bars'
                    ? 'Listening shows on Bars, LED, Curve, Ring, Brush and Crystal ball.'
                    : 'The page can’t hear YouTube directly, so this listens to your speakers through the mic. Nothing is recorded or sent anywhere. Won’t pick up headphones.')}
              </p>
            </div>
            {canKeepAwake && (
              <div className="music__choice">
                <span className="music__choice-label">Screen</span>
                <label className="music__tick">
                  <input type="checkbox" checked={room.awake} onChange={(e) => setRoom({ awake: e.target.checked })} />
                  Keep screen on while music plays
                </label>
                <p className="muted small music__note">
                  Your phone won’t lock, so the music keeps going on a run or at the gym. Uses more battery.
                </p>
              </div>
            )}
          </div>
        </details>
      </section>

      {/* YouTube's player and its terms: under the stage on wide screens. */}
      <section className="music__player">
        <div className="music__screen" ref={host} />
        <p className="muted small music__legal">
          Music plays in YouTube’s own player through YouTube API Services, and YouTube may show its ads. By playing
          music here you agree to{' '}
          <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">
            YouTube’s Terms of Service
          </a>
          , and YouTube handles what it collects under the{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Google Privacy Policy
          </a>
          . This site sends nothing about what you play anywhere; your list and settings stay in this browser. Songs and covers belong to their owners.
        </p>
      </section>

      {songs?.length > 0 && (
        <Playlist
          songs={playable}
          yt={yt}
          room={room}
          setRoom={setRoom}
          total={songs.length}
          mineCount={room.mine.filter((id) => songs.some((x) => x.id === id)).length}
          find={find}
          setFind={setFind}
          agent={agent}
          setAgent={setAgent}
          agentCounts={agentCounts}
          faction={faction}
          setFaction={setFaction}
          factionCounts={factionCounts}
          version={version}
          setVersion={setVersion}
          versionCounts={versionCounts}
          hiddenCount={songs.filter((x) => isHiddenSong(room, x)).length}
          albumNames={albumNames}
        />
      )}
    </div>
  );
}
