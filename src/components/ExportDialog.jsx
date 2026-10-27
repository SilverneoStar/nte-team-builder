// The export dialog: previews a team image or card, with pickers for card type,
// team layout and size, and Save / Copy / Share buttons.
import { useEffect, useRef, useState } from 'react';
import { EXPORT_SIZES, TEAM_LAYOUTS, canvasToBlob } from '../lib/exportSettings.js';

// The team image drawing code loads only when a team image is made.
const renderTeamCard = (team, opts) => import('../lib/teamCard.js').then((m) => m.renderTeamCard(team, opts));

const BASE = import.meta.env.BASE_URL;

// Choices remembered on this device.
const load = (key, ok, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v != null && ok(v) ? v : fallback;
  } catch {
    return fallback;
  }
};
const save = (key, v) => {
  try {
    localStorage.setItem(key, String(v));
  } catch {
    /* storage unavailable */
  }
};

const LAYOUT_KEY = 'nte-team-card-layout';
const SCALE_KEY = 'nte-export-scale';

// Export sizes live in exportSettings.js; re-exported so older imports keep working.
export { EXPORT_SIZES };

const slug = (name) => (name || 'team').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'team';

/**
 * Shows a rendered card with ways to save, copy or share it.
 * - Default: the team card, with its layout picker.
 * - `render(opts)`: any other card; `title`, `name` and `suffix` describe it.
 * - `types` [{ id, label, title, suffix }] + `typeKey`: several cards to pick from
 *   (the pick is remembered under `typeKey`); `render` gets `opts.type`.
 * Every export has a size picker; `render` gets `opts.scale`.
 */
export default function ExportDialog({
  team, onClose, render, title = 'Team image', name, suffix = 'nte-team', types = null, typeKey = null, initialType = null,
}) {
  const label = name ?? team?.name;
  const [type, setType] = useState(() => {
    if (!types) return null;
    const ok = (v) => types.some((t) => t.id === v);
    if (initialType && ok(initialType)) return initialType;
    return typeKey ? load(typeKey, ok, types[0].id) : types[0].id;
  });
  const current = types?.find((t) => t.id === type);
  const shownTitle = current?.title ?? title;
  const shownSuffix = current?.suffix ?? suffix;
  // Only the team image (no custom render) offers a layout choice.
  const [layout, setLayout] = useState(() => (render ? null : load(LAYOUT_KEY, (v) => TEAM_LAYOUTS.some((l) => l.id === v), 'row')));
  const [scale, setScale] = useState(() => Number(load(SCALE_KEY, (v) => EXPORT_SIZES.some((s) => String(s.scale) === v), '2')));
  const [url, setUrl] = useState(null);
  const [blob, setBlob] = useState(null);
  const [px, setPx] = useState(null);
  const [status, setStatus] = useState('');
  const closeRef = useRef(null);

  const fileName = () => `${slug(label)}-${shownSuffix}${layout === 'grid' ? '-2x2' : layout === 'side' ? '-2x2-side' : ''}${scale === 2 ? '' : `-${scale}x`}.png`;

  useEffect(() => {
    let cancelled = false;
    let objectUrl;
    setUrl(null);
    setStatus('');
    const opts = { base: BASE, scale, type };
    (render ? render(opts) : renderTeamCard(team, { ...opts, layout }))
      .then((canvas) => {
        if (!cancelled) setPx([canvas.width, canvas.height]);
        return canvasToBlob(canvas);
      })
      .then((b) => {
        if (cancelled || !b) return;
        objectUrl = URL.createObjectURL(b);
        setBlob(b);
        setUrl(objectUrl);
      })
      .catch((err) => {
        console.error('Image failed', err);
        setStatus('Couldn’t create the image. Try again.');
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team, layout, scale, type]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const canCopy = typeof window.ClipboardItem !== 'undefined' && !!navigator.clipboard?.write;
  const file = blob && new File([blob], fileName(), { type: 'image/png' });
  const canShare = !!(file && navigator.canShare?.({ files: [file] }));

  async function copy() {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setStatus('Image copied. Paste it into a chat or post.');
    } catch {
      setStatus('Your browser blocked copying. Use Save image instead.');
    }
  }

  async function share() {
    try {
      await navigator.share({ files: [file], title: label });
    } catch {
      /* share sheet closed */
    }
  }

  const pickType = (id) => {
    setType(id);
    if (typeKey) save(typeKey, id);
  };
  const pickLayout = (id) => {
    setLayout(id);
    save(LAYOUT_KEY, id);
  };
  const pickScale = (s) => {
    setScale(s);
    save(SCALE_KEY, s);
  };

  return (
    <div className="dialog-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="export-title">
        <header className="dialog__head">
          <h2 id="export-title" className="section-title">{shownTitle}</h2>
          <button ref={closeRef} className="btn btn--quiet" onClick={onClose}>Close</button>
        </header>

        {types && (
          <div className="type-pick" role="radiogroup" aria-label="Card type">
            {types.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={type === t.id}
                className={`type-pick__opt${type === t.id ? ' is-on' : ''}`}
                onClick={() => pickType(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {layout && (
          <div className="layout-pick" role="radiogroup" aria-label="Image layout">
            {TEAM_LAYOUTS.map((l) => (
              <button
                key={l.id}
                type="button"
                role="radio"
                aria-checked={layout === l.id}
                className={`layout-pick__opt${layout === l.id ? ' is-on' : ''}`}
                onClick={() => pickLayout(l.id)}
              >
                <span className={`layout-pick__icon layout-pick__icon--${l.id}`} aria-hidden="true">
                  <i /><i /><i /><i />
                </span>
                <b>{l.label}</b>
                <span className="muted">{l.hint}</span>
              </button>
            ))}
          </div>
        )}

        <div className="dialog__preview">
          {url ? (
            <img src={url} alt={`${shownTitle} for ${label}`} />
          ) : (
            <p className="muted">{status || 'Creating image…'}</p>
          )}
        </div>

        <div className="size-pick">
          <span className="size-pick__label">Size</span>
          <div className="size-pick__opts" role="radiogroup" aria-label="Image size">
            {EXPORT_SIZES.map((s) => (
              <button
                key={s.scale}
                type="button"
                role="radio"
                aria-checked={scale === s.scale}
                className={`size-pick__opt${scale === s.scale ? ' is-on' : ''}`}
                onClick={() => pickScale(s.scale)}
              >
                {s.label} <span className="muted">{s.hint}</span>
              </button>
            ))}
          </div>
          <span className="size-pick__px muted">{px ? `${px[0]} × ${px[1]} px` : ''}</span>
        </div>

        <div className="dialog__actions">
          {url && (
            <a className="btn btn--primary" href={url} download={fileName()}>
              Save image
            </a>
          )}
          {url && canCopy && (
            <button className="btn" onClick={copy}>Copy image</button>
          )}
          {url && canShare && (
            <button className="btn" onClick={share}>Share…</button>
          )}
          <p className="dialog__status" role="status" aria-live="polite">{url ? status : ''}</p>
        </div>
      </div>
    </div>
  );
}
