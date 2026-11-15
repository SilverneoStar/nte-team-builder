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
  const ids = useMemo(() => (songs ?? []).map((x) => x.id), [songs]);
  const yt = usePlaylistPlayer(host, ids);
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
        <img className="music__pal music__pal--cortado" src={`${BASE}mascot.svg`} alt="Cortado" />
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
        {yt.author && <p className="muted small music__artist">{yt.author.replace(/ - Topic$/, '')}</p>}
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

      {songs?.length > 0 && (
        <section className="music__list" aria-label="Playlist">
          <h3 className="music__h">Playlist</h3>
          <ol className="music__tracks">
            {songs.map((x, i) => {
              const blocked = yt.blocked.includes(x.id);
              return (
                <li key={`${x.id}-${i}`}>
                  {blocked ? (
                    <a
                      className="music__track is-blocked"
                      href={`https://www.youtube.com/watch?v=${x.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="music__num">{i + 1}</span>
                      <Cover id={x.id} className="music__thumb" />
                      <span className="music__name">
                        {x.name || `Song ${i + 1}`}
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
                      <span className="music__num">{i + 1}</span>
                      <Cover id={x.id} className="music__thumb" />
                      <span className="music__name">{x.name || (i === yt.index && yt.title) || `Song ${i + 1}`}</span>
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}
