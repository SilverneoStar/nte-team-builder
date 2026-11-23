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

/** The playlist id in a link to a whole YouTube playlist (not a single video), or null. */
export function playlistId(link) {
  const t = (link ?? '').trim();
  if (videoId(t) && !/[?&]list=/.test(t)) return null;
  if (/[?&]v=|youtu\.be\//.test(t)) return null;
  const m = t.match(/[?&]list=([\w-]{12,})/);
  return m ? m[1] : null;
}

// The first video of each YouTube playlist the reader has played, kept so its
// row can show a cover next time (the page can't look inside a playlist itself).
const COVERS_KEY = 'tea-room:playlistCovers';
let covers = null;
export function playlistCover(list) {
  if (!covers) {
    try {
      covers = JSON.parse(localStorage.getItem(COVERS_KEY) || '{}');
    } catch {
      covers = {};
    }
  }
  return covers[list] ?? null;
}
function rememberCover(list, id) {
  if (!id || playlistCover(list) === id) return;
  covers[list] = id;
  try {
    localStorage.setItem(COVERS_KEY, JSON.stringify(covers));
  } catch {
    /* not kept: fine */
  }
}

/**
 * The songs in a playlist text file: one per line, "Song name | link", with an
 * optional tempo after it ("| 128", beats per minute); the name can be left out. "[Album]" on its own line heads the songs after it
 * ("[Album | fan upload | game OST | AI-assisted]" marks them as fan uploads, as in-game music
 * and as likely made with AI;
 * a date, "[Album | 2026-10-25]", is the album's release date).
 * Blank lines and lines starting with # are skipped.
 */
export function parsePlaylist(text) {
  let album = '';
  let fan = false;
  let game = false;
  let ai = false;
  let date = '';
  const songs = [];
  for (const raw of (text ?? '').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const head = line.match(/^\[(.+)\]$/);
    if (head) {
      // "[Album | fan upload]": songs uploaded by fans, not the game's own channels.
      const [name, ...tags] = head[1].split('|').map((x) => x.trim());
      album = name;
      fan = tags.some((t) => /^fan/i.test(t));
      game = tags.some((t) => /^game/i.test(t));
      // "| AI-assisted": the channel likely used AI to make them (shown as a tag).
      ai = tags.some((t) => /^ai\b/i.test(t));
      // "[Album | 2026-10-25]": its release date, for sorting newest or oldest first.
      date = tags.find((t) => /^\d{4}-\d{2}-\d{2}$/.test(t)) ?? '';
      continue;
    }
    // "Name | link", "Name | link | 128" (its tempo in beats per minute) or just a link.
    const parts = line.split('|').map((x) => x.trim());
    const bpm = parts.length > 1 && /^\d{2,3}$/.test(parts[parts.length - 1]) ? +parts.pop() : null;
    const link = parts.pop();
    const name = parts.join(' | ');
    // A whole YouTube playlist ("…playlist?list=PL…" with no video in it): one row
    // that plays every song in it, in YouTube's order, keeping up with its changes.
    const list = playlistId(link);
    if (list) {
      songs.push({ id: list, list, name, album, fan, game, ai, date, bpm: bpm >= 40 && bpm <= 240 ? bpm : null });
      continue;
    }
    const id = videoId(link);
    if (id) songs.push({ id, name, album, fan, game, ai, date, bpm: bpm >= 40 && bpm <= 240 ? bpm : null });
  }
  return songs;
}

/**
 * Plays a list of songs ({ id, album }) in YouTube's player in the element
 * `hostRef` points at. YouTube takes at most 200 videos in one list, so only
 * the album being played is loaded; moving past its end loads the next album.
 * Returns { ready, error, playing, waiting (an ad or loading), index, title, author, blocked, play, pause,
 * toggle, next, prev, playAt, shuffle, setShuffle }. `blocked` holds the ids
 * of songs YouTube won't play outside its own site (they're skipped).
 */
export function usePlaylistPlayer(hostRef, songs) {
  const player = useRef(null);
  const ids = songs.map((x) => x.id);
  const key = ids.join(',');
  // Each album's range in the list: [{ start, end }] (end not included).
  const groups = [];
  songs.forEach((x, i) => {
    const last = groups[groups.length - 1];
    // A whole YouTube playlist is loaded on its own.
    if (last && !x.list && !songs[i - 1].list && songs[i - 1].album === x.album) last.end = i + 1;
    else groups.push({ start: i, end: i + 1, list: x.list || null });
  });
  const ref = useRef({});
  ref.current.ids = ids;
  ref.current.groups = groups;
  const loaded = useRef(-1);
  const shuffleRef = useRef(false);
  const [st, setSt] = useState({
    ready: false,
    error: '',
    playing: false,
    waiting: false,
    index: -1,
    videoId: '',
    title: '',
    author: '',
    blocked: [],
  });
  const stRef = useRef(st);
  stRef.current = st;
  const [shuffle, setShuffleState] = useState(false);

  const groupOf = (i) => ref.current.groups.findIndex((g) => i >= g.start && i < g.end);
  // Play song i (or just cue it), loading its album first when another one is in the player.
  const load = (i, play = true) => {
    const p = player.current;
    const k = groupOf(i);
    if (!p || k < 0) return;
    const g = ref.current.groups[k];
    if (loaded.current === k && play) {
      p.playVideoAt(i - g.start);
      return;
    }
    loaded.current = k;
    if (g.list) {
      const opts = { listType: 'playlist', list: g.list, index: 0 };
      if (play) p.loadPlaylist(opts);
      else p.cuePlaylist(opts);
      return;
    }
    const list = ref.current.ids.slice(g.start, g.end);
    if (play) p.loadPlaylist(list, i - g.start);
    else p.cuePlaylist(list, i - g.start);
  };
  // Inside a whole YouTube playlist: where we are in it, and how long it is.
  const inPlaylist = () => {
    const p = player.current;
    const g = ref.current.groups[loaded.current];
    if (!p || !g?.list) return null;
    return { at: p.getPlaylistIndex?.() ?? 0, count: p.getPlaylist?.()?.length ?? 0 };
  };
  const step = (dir) => {
    const n = ref.current.ids.length;
    if (!n) return;
    // In a YouTube playlist, next and back move through its songs first.
    const pl = !shuffleRef.current && inPlaylist();
    if (pl && dir > 0 && pl.at < pl.count - 1) return player.current.nextVideo();
    if (pl && dir < 0 && pl.at > 0) return player.current.previousVideo();
    const cur = stRef.current.index;
    const at = cur < 0 || cur >= n ? (dir > 0 ? -1 : 0) : cur;
    if (shuffleRef.current && n > 1) {
      let r = at;
      while (r === at) r = Math.floor(Math.random() * n);
      load(r);
    } else load((at + dir + n) % n);
  };

  // The list changed (a filter, the reader's own list): the album in the player
  // may no longer match, so the next song picked loads afresh.
  useEffect(() => {
    loaded.current = -1;
  }, [key]);

  const hasSongs = ids.length > 0;
  useEffect(() => {
    if (!hasSongs) return undefined;
    let dead = false;
    let skips = 0;
    let poll;
    let lastT = -1;
    let stillFor = 0;
    loaded.current = -1;
    const sync = (patch = {}) => {
      const p = player.current;
      if (!p || dead) return;
      // Go by the video that's actually on: the list position can lag behind (after an ad, say).
      const data = p.getVideoData?.() ?? {};
      const g = ref.current.groups[loaded.current];
      let index = -1;
      if (g?.list) {
        // A whole YouTube playlist is one row; the song on is whatever it's playing.
        index = g.start;
        rememberCover(g.list, p.getPlaylist?.()?.[0]);
      } else if (g) {
        const at = data.video_id ? ref.current.ids.slice(g.start, g.end).indexOf(data.video_id) : -1;
        index = at >= 0 ? g.start + at : g.start + Math.max(0, p.getPlaylistIndex?.() ?? 0);
      } else if (data.video_id) {
        index = ref.current.ids.indexOf(data.video_id);
      }
      // Playing but the song's clock isn't moving: YouTube is showing an ad
      // (or still loading). The page can't see or touch the ad itself.
      const t = p.getCurrentTime?.() ?? 0;
      const on = p.getPlayerState?.();
      const still = (on === 1 || on === 3) && Math.abs(t - lastT) < 0.05;
      stillFor = still ? stillFor + 1 : 0;
      lastT = t;
      setSt((s) => {
        const n = { ...s, index, videoId: data.video_id || '', title: data.title || '', author: data.author || '', waiting: stillFor >= 2, ...patch };
        return Object.keys(n).every((k) => n[k] === s[k]) ? s : n;
      });
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
          playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
          events: {
            onReady: () => {
              load(0, false);
              sync({ ready: true });
              // Catch track changes YouTube doesn't announce (ads, its own buttons).
              poll = setInterval(() => sync(), 1000);
            },
            onStateChange: (e) => {
              if (e.data === YT.PlayerState.PLAYING) skips = 0;
              sync({ playing: e.data === YT.PlayerState.PLAYING || e.data === YT.PlayerState.BUFFERING });
              // The end of a song: YouTube moves on inside the album; past its last
              // song (or on shuffle), pick the next song here.
              if (e.data === YT.PlayerState.ENDED) {
                const g = ref.current.groups[loaded.current];
                const pl = inPlaylist();
                // YouTube moves on inside its own playlist; after its last song, go on here.
                if (pl) {
                  if (shuffleRef.current || pl.at >= pl.count - 1) step(1);
                } else if (shuffleRef.current || loaded.current < 0 || !g || stRef.current.index >= g.end - 1) step(1);
              }
            },
            // A song its label won't let play outside YouTube: note it and skip it.
            onError: () => {
              const pl = inPlaylist();
              // A song inside a YouTube playlist that won't play here: skip to the next one in it.
              if (pl && pl.at < pl.count - 1 && ++skips < 10) return player.current.nextVideo();
              const id = player.current?.getVideoData?.()?.video_id || ref.current.ids[stRef.current.index];
              setSt((s) => ({ ...s, blocked: s.blocked.includes(id) ? s.blocked : [...s.blocked, id] }));
              if (++skips < Math.min(10, ref.current.ids.length)) step(1);
              else sync({ playing: false, error: 'These songs can’t be played here right now. They can still be played on YouTube.' });
            },
          },
        });
      })
      .catch((e) => !dead && setSt((s) => ({ ...s, error: e.message })));
    return () => {
      dead = true;
      clearInterval(poll);
      player.current?.destroy?.();
      player.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hostRef, hasSongs]);

  const call = (fn, ...args) => player.current?.[fn]?.(...args);
  return {
    ...st,
    shuffle,
    play: () => call('playVideo'),
    pause: () => call('pauseVideo'),
    toggle: () => call(st.playing ? 'pauseVideo' : 'playVideo'),
    // Volume 0..100, and mute; phones may keep these to their own buttons.
    setVolume: (v) => call('setVolume', v),
    mute: () => call('mute'),
    unMute: () => call('unMute'),
    next: () => step(1),
    prev: () => step(-1),
    playAt: (i) => load(i),
    // How far into the song (0..1), or null when YouTube hasn't said yet.
    progress: () => {
      const d = player.current?.getDuration?.();
      const t = player.current?.getCurrentTime?.();
      return d > 0 && t >= 0 ? Math.min(1, t / d) : null;
    },
    setShuffle: (on) => {
      shuffleRef.current = on;
      setShuffleState(on);
    },
  };
}
