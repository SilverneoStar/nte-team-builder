// The hidden listening room: Matcha peeks out on the Arcs page, and tapping
// her opens this page. The game's official soundtrack plays through YouTube's
// own embedded player (the songs listed in public/music/playlist.txt), the track's cover sits
// in an Arc player whose disc spins, and Cortado and Matcha bop along.
//
// The beat bar can't hear the music (a page can't read sound from YouTube's
// player), so it pulses at a steady tempo while a track plays.
import { useEffect, useMemo, useRef, useState } from 'react';
import { parsePlaylist, thumb, usePlaylistPlayer } from '../lib/youtube.js';
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
const SHUFFLE =
  'M16 3h5v5l-1.8-1.8-4.4 4.4-1.4-1.4 4.4-4.4zM3 5.4 4.4 4l15.6 15.6V16h1v5h-5v-1h3.6zM9.6 13l1.4 1.4-6.6 6.6L3 19.6z';

/** The songs grouped by album, in file order: [{ name, start, songs }]. */
function albumsOf(songs) {
  const out = [];
  songs.forEach((x, i) => {
    const last = out[out.length - 1];
    if (last && last.name === x.album) last.songs.push(x);
    else out.push({ name: x.album || 'Songs', start: i, songs: [x] });
  });
  return out;
}

/**
 * Albums in a swipeable carousel; the chosen album's songs below it, which can
 * be folded away. Follows the album that's playing until the reader picks one.
 */
function Playlist({ songs, yt }) {
  const albums = useMemo(() => albumsOf(songs), [songs]);
  const playingAlbum = albums.findIndex((a) => yt.index >= a.start && yt.index < a.start + a.songs.length);
  const [picked, setPicked] = useState(null);
  const [open, setOpen] = useState(true);
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
          {albums.length} album{albums.length > 1 ? 's' : ''} · {songs.length} songs
        </span>
      </div>

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
                  aria-pressed={k === shown}
                >
                  <Cover id={a.songs[0].id} className="music__albumart" />
                  <span className="music__albumname">{a.name}</span>
                  <span className="muted small">
                    {k === playingAlbum ? '♪ Playing · ' : ''}
                    {a.songs.length} song{a.songs.length > 1 ? 's' : ''}
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
                const label = x.name || (i === yt.index && yt.title) || `Song ${j + 1}`;
                return (
                  <li key={`${x.id}-${i}`}>
                    {blocked ? (
                      <a
                        className="music__track is-blocked"
                        href={`https://www.youtube.com/watch?v=${x.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="music__num">{j + 1}</span>
                        <Cover id={x.id} className="music__thumb" />
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
                        <Cover id={x.id} className="music__thumb" />
                        <span className="music__name">{label}</span>
                      </button>
                    )}
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
  const yt = usePlaylistPlayer(host, songs ?? []);
  const song = songs?.[yt.index] ?? null;
  const current = song?.id ?? null;
  const title = song?.name || yt.title;

  return (
    <div className={`page music${yt.playing ? ' is-playing' : ''}`}>
      <header className="page__head music__head">
        <button type="button" className="btn btn--quiet music__back" onClick={() => navigate('arcs')}>
          ← Arcs
        </button>
        <h2 className="page__title">Matcha’s listening room</h2>
        <p className="muted">
          You found Matcha’s hiding spot. Pick a track: it’s the game’s official soundtrack from{' '}
          <a href={CHANNEL} target="_blank" rel="noopener noreferrer">
            NTE10AM on YouTube
          </a>
          .
        </p>
      </header>

      <section className="music__stage" aria-label="Now playing">
        <Cortado chill={yt.playing} />
        <Disc id={current} playing={yt.playing} index={yt.index} />
        <img
          className="music__pal music__pal--matcha"
          src={`${BASE}matcha/${yt.playing ? 'starry' : 'neutral'}.webp`}
          alt="Matcha"
        />
        <div className="music__beat" aria-hidden="true">
          {Array.from({ length: BARS }, (_, i) => (
            <span key={i} style={{ '--i': i, '--k': 1 + (i % 3), '--h': `${30 + ((i * 37) % 60)}%` }} />
          ))}
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
          ) : yt.ready ? (
            'Press play to start'
          ) : (
            'Loading the player…'
          )}
        </p>
        {(song?.album || yt.author) && (
          <p className="muted small music__artist">
            {[song?.album, yt.author.replace(/ - Topic$/, '')].filter(Boolean).join(' · ')}
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
        <div className="music__screen" ref={host} />
      </section>

      {songs?.length > 0 && <Playlist songs={songs} yt={yt} />}
    </div>
  );
}
