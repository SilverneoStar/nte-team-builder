// A helper for filling the Tea Room (not linked from the site; open #music-import).
// Paste a YouTube playlist link: YouTube's own player lists its videos, each
// title comes from noembed.com, and the songs the room doesn't have yet come out
// as lines ready for public/music/playlist.txt.
import { useEffect, useRef, useState } from 'react';
import { loadYouTubeApi, parsePlaylist, videoId } from '../lib/youtube.js';

const BASE = import.meta.env.BASE_URL;

const listId = (link) => (link ?? '').match(/[?&]list=([\w-]+)/)?.[1] ?? ((link ?? '').trim().match(/^PL[\w-]+$/)?.[0] || null);

// Titles compared loosely: no game name, "OST", brackets of uploader tags or punctuation.
export function songKey(title) {
  return (title ?? '')
    .toLowerCase()
    .replace(/neverness\s*to\s*everness|\bnte\b|\bost\b|original sound ?track|soundtrack|official|bgm|music|theme/g, ' ')
    .replace(/[【】「」『』[\]()|:：\-–—~·.,!?'"’“”]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// The song without its singer: "timetrial feat duju" -> "timetrial".
const coreKey = (key) => key.replace(/\b(feat|ft|prod|cv|vo)\b.*?(?=\b(?:instrumental|\w+ ver)\b|$)/, '').replace(/\s+/g, ' ').trim();

// Only the game's own music: the title names the game and says it's its OST.
export const isGameOst = (title) =>
  /neverness\s*to\s*everness|\bnte\b|异环/i.test(title ?? '') &&
  /\bost\b|soundtrack|\bbgm\b|\btheme\b|原声/i.test(title ?? '');

async function titleOf(id) {
  try {
    const r = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`);
    const j = await r.json();
    return j.title || '';
  } catch {
    return '';
  }
}

export default function MusicImport() {
  const [link, setLink] = useState('');
  const [status, setStatus] = useState('');
  const [rows, setRows] = useState(null);
  const [copied, setCopied] = useState(false);
  const host = useRef(null);
  const player = useRef(null);
  const [room, setRoom] = useState([]);

  useEffect(() => {
    fetch(`${BASE}music/playlist.txt`)
      .then((r) => r.text())
      .then((t) => setRoom(parsePlaylist(t)))
      .catch(() => setRoom([]));
    return () => player.current?.destroy?.();
  }, []);

  async function run() {
    const list = listId(link);
    // Or plain video links (any number, one per line): just look up their titles.
    const links = [...new Set(link.split(/\s+/).map(videoId).filter(Boolean))];
    if (!list && !links.length) return setStatus('Paste a playlist link (with list=…) or some video links.');
    setRows(null);
    setStatus(list ? 'Asking YouTube for the playlist…' : 'Looking up the videos…');
    let ids = list ? [] : links;
    if (list) try {
      const YT = await loadYouTubeApi();
      player.current?.destroy?.();
      const el = document.createElement('div');
      host.current.replaceChildren(el);
      ids = await new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('YouTube didn’t send the playlist.')), 20000);
        player.current = new YT.Player(el, {
          width: 320,
          height: 180,
          host: 'https://www.youtube-nocookie.com',
          playerVars: { listType: 'playlist', list },
          events: {
            onReady: (e) => {
              const poll = () => {
                const got = e.target.getPlaylist?.();
                if (got?.length) {
                  clearTimeout(t);
                  resolve(got);
                } else setTimeout(poll, 400);
              };
              poll();
            },
          },
        });
      });
    } catch (err) {
      return setStatus(err.message);
    }

    const byId = new Map(room.map((s) => [s.id, s]));
    const named = room.filter((s) => s.name);
    const byKey = new Map(named.map((s) => [songKey(s.name), s]));
    const byCore = new Map(named.map((s) => [coreKey(songKey(s.name)), s]));
    const lookLike = (t) => byKey.get(songKey(t)) ?? byCore.get(coreKey(songKey(t)));
    const out = ids.map((id) => ({ id, title: '' }));
    setRows(out);
    for (let i = 0; i < ids.length; i += 6) {
      setStatus(`Reading titles… ${Math.min(i + 6, ids.length)} of ${ids.length}`);
      const titles = await Promise.all(ids.slice(i, i + 6).map(titleOf));
      titles.forEach((t, k) => (out[i + k] = { id: ids[i + k], title: t }));
      setRows([...out]);
    }
    for (const r of out) {
      const same = byId.get(r.id);
      const like = !same && r.title ? lookLike(r.title) : null;
      r.state = same ? (same.name ? 'in' : 'unnamed') : !isGameOst(r.title) ? 'off' : like ? 'like' : 'new';
      r.match = (same ?? like)?.name || '';
    }
    setRows([...out]);
    setStatus(`${ids.length} videos: ${out.filter((r) => r.state === 'new' || r.state === 'unnamed').length} not in the room yet.`);
  }

  const lines = (rows ?? [])
    .filter((r) => r.state === 'new' || r.state === 'unnamed')
    .map((r) => `${r.title || '?'} | https://youtu.be/${r.id}`)
    .join('\n');

  return (
    <div className="page music-import">
      <header className="page__head">
        <h2 className="page__title">Tea Room import</h2>
        <p className="muted">
          Paste a YouTube playlist link (or some video links). The songs the Tea Room doesn’t have come out as lines for its playlist file.
          Only videos whose title names the game and says OST (or soundtrack, BGM, theme) count; the rest are
          marked “Not OST”. Check the “maybe” ones by hand: they share a title with a song already in the room.
        </p>
      </header>
      <form
        className="music-import__form"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <textarea
          rows={3}
          className="input"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="A playlist link, or video links one per line"
          aria-label="Playlist link"
        />
        <button type="submit" className="btn">
          Check
        </button>
      </form>
      {status && (
        <p className="muted" role="status">
          {status}
        </p>
      )}
      <div ref={host} className="music-import__player" />
      {lines && (
        <div className="music-import__out">
          <textarea className="input" readOnly rows={Math.min(14, lines.split('\n').length + 1)} value={lines} />
          <button
            type="button"
            className="btn"
            onClick={() => navigator.clipboard?.writeText(lines).then(() => setCopied(true))}
          >
            {copied ? 'Copied' : 'Copy the lines'}
          </button>
        </div>
      )}
      {rows && (
        <ol className="music-import__list">
          {rows.map((r) => (
            <li key={r.id} className={`is-${r.state ?? 'wait'}`}>
              <span className="music-import__tag">
                {{ in: 'In room', unnamed: 'No name', like: 'Maybe', new: 'New', off: 'Not OST' }[r.state] ?? '…'}
              </span>
              <a href={`https://youtu.be/${r.id}`} target="_blank" rel="noopener noreferrer">
                {r.title || r.id}
              </a>
              {r.state === 'like' && <span className="muted"> · like “{r.match}”</span>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
