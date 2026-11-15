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

/**
 * Plays a YouTube playlist in the element `hostRef` points at.
 * Returns { ready, error, playing, ids, index, title, play, pause, toggle, next, prev, playAt, shuffle, setShuffle }.
 */
export function usePlaylistPlayer(hostRef, playlistId) {
  const player = useRef(null);
  const [st, setSt] = useState({ ready: false, error: '', playing: false, ids: [], index: -1, title: '', author: '' });
  const [shuffle, setShuffleState] = useState(false);

  useEffect(() => {
    let dead = false;
    let skips = 0;
    const sync = (patch = {}) => {
      const p = player.current;
      if (!p || dead) return;
      const ids = p.getPlaylist?.() ?? [];
      const index = p.getPlaylistIndex?.() ?? -1;
      const data = p.getVideoData?.() ?? {};
      setSt((s) => ({
        ...s,
        ids: ids.length ? ids : s.ids,
        index,
        title: data.title || s.title,
        author: data.author || s.author,
        ...patch,
      }));
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
          playerVars: { listType: 'playlist', list: playlistId, playsinline: 1, rel: 0, modestbranding: 1 },
          events: {
            onReady: () => sync({ ready: true }),
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.PLAYING) skips = 0;
              sync({ playing: e.data === YT.PlayerState.PLAYING || e.data === YT.PlayerState.BUFFERING });
            },
            // A track its label won't let play outside YouTube: skip it (a few at most).
            onError: () => {
              if (skips++ < 5) player.current?.nextVideo?.();
              else sync({ playing: false, error: 'These tracks can’t be played here right now. Try again later, or open them on YouTube.' });
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
  }, [hostRef, playlistId]);

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
