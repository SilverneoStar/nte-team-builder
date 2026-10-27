// "Featured in" teams on a character's page, as a paged carousel.
import { useEffect, useRef, useState } from 'react';
import { CHARACTER_BY_ID } from '../data/characters.js';
import Portrait from './Portrait.jsx';
import { PHONE, useMedia } from '../lib/useMedia.js';

// "Featured in" teams as a two-column carousel: pages of teams you can swipe
// (or step through with the arrows), with dots for the current page.
export default function FeaturedTeams({ presets }) {
  const phone = useMedia(PHONE);
  const perPage = phone ? 4 : 6;
  const pages = [];
  for (let i = 0; i < presets.length; i += perPage) pages.push(presets.slice(i, i + perPage));
  const trackRef = useRef(null);
  const pageRefs = useRef([]);
  const [page, setPage] = useState(0);

  // Pages off screen are inert, so keyboard focus stays on the visible one.
  useEffect(() => {
    pageRefs.current.forEach((el, i) => {
      if (el) el.inert = i !== page;
    });
  }, [page, pages.length]);

  // Back to the first page when the character (their team list) or page size changes.
  const listKey = presets.map((p) => p.name).join('|');
  useEffect(() => {
    setPage(0);
    trackRef.current?.scrollTo({ left: 0 });
  }, [listKey, perPage]);

  const go = (p) => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(pages.length - 1, p));
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  };
  const onScroll = () => {
    const el = trackRef.current;
    if (el) setPage(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
  };

  return (
    <div className="featured">
      <div className="featured__track" ref={trackRef} onScroll={onScroll}>
        {pages.map((list, i) => (
          <ul key={i} className="featured__page" ref={(el) => { pageRefs.current[i] = el; }} aria-label={`Teams page ${i + 1} of ${pages.length}`}>
            {list.map((p) => (
              <li key={p.name} className={`featured__team${p.idea ? ' is-idea' : ''}`}>
                <span className="featured__name">
                  {p.name}
                  {p.idea && <span className="idea-tag">Kit idea</span>}
                </span>
                <span className="detail__preset-team">
                  {p.members.map((id) => (
                    <Portrait key={id} character={CHARACTER_BY_ID[id]} size="sm" />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
      {pages.length > 1 && (
        <div className="featured__nav">
          <button type="button" className="btn btn--quiet btn--small" onClick={() => go(page - 1)} disabled={page === 0} aria-label="Previous teams">
            ‹
          </button>
          <span className="featured__dots" aria-hidden="true">
            {pages.map((_, i) => <span key={i} className={i === page ? 'is-on' : undefined} />)}
          </span>
          <span className="sr-only" aria-live="polite">Page {page + 1} of {pages.length}</span>
          <button type="button" className="btn btn--quiet btn--small" onClick={() => go(page + 1)} disabled={page === pages.length - 1} aria-label="More teams">
            ›
          </button>
        </div>
      )}
    </div>
  );
}
