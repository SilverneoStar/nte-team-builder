// YouTube's official embedded player (IFrame Player API), loaded once on demand.
// The music itself always plays inside YouTube's own visible player; the page
// only reads which video is on and its title, and drives play / skip.
import { useEffect, useRef, useState } from 'react';

let apiPromise;
export function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT);
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    s.onerror = () => {
      apiPromise = null;
      reject(new Error('YouTube couldn’t be reached.'));
    };
    document.head.appendChild(s);
  });
  return apiPromise;
}

/** A video's thumbnail. 'max' is 1280 x 720 when the video has one. */
export const thumb = (id, size = 'max') =>
  `https://i.ytimg.com/vi/${id}/${size === 'max' ? 'maxresdefault' : size === 'mq' ? 'mqdefault' : 'hqdefault'}.jpg`;

/** The video id in a YouTube link (youtu.be, watch?v=, music.youtube.com, shorts) or a bare id. */
export function videoId(link) {
  const t = (link ?? '').trim();
  if (/^[\w-]{11}$/.test(t)) return t;
  const m = t.match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : null;
}

/**
 * The songs in a playlist text file: one per line, "Song name | link" (the
 * name can be left out). Blank lines and lines starting with # are skipped.
 */
export function parsePlaylist(text) {
  return (text ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const bar = line.lastIndexOf('|');
      const name = bar >= 0 ? line.slice(0, bar).trim() : '';
      const id = videoId(bar >= 0 ? line.slice(bar + 1) : line);
      return id ? { id, name } : null;
    })
    .filter(Boolean);
}

/**
 * Plays a list of YouTube videos, in order, in the element `hostRef` points at.
 * Returns { ready, error, playing, index, title, author, blocked, play, pause,
 * toggle, next, prev, playAt, shuffle, setShuffle }. `blocked` holds the ids
 * of songs YouTube won't play outside its own site (they're skipped).
 */
export function usePlaylistPlayer(hostRef, ids) {
  const player = useRef(null);
  const key = ids.join(',');
  const [st, setSt] = useState({ ready: false, error: '', playing: false, index: -1, title: '', author: '', blocked: [] });
  const [shuffle, setShuffleState] = useState(false);

  useEffect(() => {
    if (!ids.length) return undefined;
    let dead = false;
    let skips = 0;
    const sync = (patch = {}) => {
      const p = player.current;
      if (!p || dead) return;
      const index = p.getPlaylistIndex?.() ?? -1;
      const data = p.getVideoData?.() ?? {};
      setSt((s) => ({ ...s, index, title: data.title || '', author: data.author || '', ...patch }));
    };
    loadYouTubeApi()
      .then((YT) => {
        if (dead || !hostRef.current) return;
        const mount = document.createElement('div');
        hostRef.current.replaceChildren(mount);
        player.current = new YT.Player(mount, {
          host: 'https://www.youtube-nocookie.com',
          width: '100%',
          height: '100%',
          videoId: ids[0],
          playerVars: { playlist: ids.slice(1).join(','), playsinline: 1, rel: 0, modestbranding: 1 },
          events: {
            onReady: () => sync({ ready: true }),
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.PLAYING) skips = 0;
              sync({ playing: e.data === YT.PlayerState.PLAYING || e.data === YT.PlayerState.BUFFERING });
            },
            // A song its label won't let play outside YouTube: note it and skip it.
            onError: () => {
              const p = player.current;
              const id = (p?.getPlaylist?.() ?? ids)[p?.getPlaylistIndex?.() ?? 0];
              setSt((s) => ({ ...s, blocked: s.blocked.includes(id) ? s.blocked : [...s.blocked, id] }));
              if (++skips < ids.length) p?.nextVideo?.();
              else sync({ playing: false, error: 'None of these songs can be played here. They can still be played on YouTube.' });
            },
          },
        });
      })
      .catch((e) => !dead && setSt((s) => ({ ...s, error: e.message })));
    return () => {
      dead = true;
      player.current?.destroy?.();
      player.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostRef, key]);

  const call = (fn, ...args) => player.current?.[fn]?.(...args);
  return {
    ...st,
    shuffle,
    play: () => call('playVideo'),
    pause: () => call('pauseVideo'),
    toggle: () => call(st.playing ? 'pauseVideo' : 'playVideo'),
    next: () => call('nextVideo'),
    prev: () => call('previousVideo'),
    playAt: (i) => call('playVideoAt', i),
    setShuffle: (on) => {
      call('setShuffle', on);
      setShuffleState(on);
    },
  };
}
