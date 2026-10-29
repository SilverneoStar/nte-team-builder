// Swipeable tabs used for long pages on phones.
import { useEffect, useId, useRef, useState } from 'react';

/**
 * Long pages as a carousel (phones and PC): a row of tabs over sections you
 * can swipe or step between. The tab row sticks to the top while you read.
 *
 * Only the section on show is laid out and painted; the others stay mounted
 * (so typed-in values survive) but hidden. Switching plays a short slide-in,
 * and a sideways swipe on the section moves to the next or previous one,
 * while up/down scrolling stays with the browser.
 *
 * slides: [{ id, label, content }]
 */
const SWIPE_MIN = 56; // px sideways before a swipe counts

// A swipe that starts inside something that scrolls sideways (a carousel,
// a wide table) belongs to that, not to the tabs.
function inSideScroller(el, stop) {
  for (let n = el; n && n !== stop; n = n.parentElement) {
    if (n.scrollWidth > n.clientWidth + 1) {
      const ox = getComputedStyle(n).overflowX;
      if (ox === 'auto' || ox === 'scroll') return true;
    }
  }
  return false;
}

export default function SwipeTabs({ slides, label }) {
  const uid = useId();
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(0); // -1 came from the left, 1 from the right
  const rootRef = useRef(null);
  const tabsRef = useRef(null);
  const bodyRef = useRef(null);
  const touch = useRef(null);

  // Keep the active tab in view in the tab row.
  useEffect(() => {
    const row = tabsRef.current;
    const tab = row?.children[active];
    if (tab) row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' });
  }, [active]);

  function go(i) {
    const next = Math.max(0, Math.min(slides.length - 1, i));
    if (next === active) return;
    setDir(next > active ? 1 : -1);
    setActive(next);
    // If the tab row is stuck at the top, bring the start of the new section into view.
    const top = rootRef.current.getBoundingClientRect().top;
    if (top < 0) window.scrollBy({ top });
  }

  function onKeyDown(e) {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (e.key === 'Home' || e.key === 'End' || step) {
      e.preventDefault();
      const i =
        e.key === 'Home' ? 0 : e.key === 'End' ? slides.length - 1 : (active + step + slides.length) % slides.length;
      go(i);
      tabsRef.current.children[i]?.focus();
    }
  }

  // Sideways swipes. The section follows the finger a little, then either
  // moves on or springs back. Vertical scrolling is left alone.
  const panel = () => bodyRef.current?.children[active];
  function onTouchStart(e) {
    if (e.touches.length !== 1 || inSideScroller(e.target, bodyRef.current)) {
      touch.current = null;
      return;
    }
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, dx: 0, axis: null };
  }
  function onTouchMove(e) {
    const s = touch.current;
    if (!s) return;
    const t = e.touches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (!s.axis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) s.axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? 'x' : 'y';
    if (s.axis !== 'x') return;
    s.dx = dx;
    const edge = (dx > 0 && active === 0) || (dx < 0 && active === slides.length - 1);
    const el = panel();
    if (el) {
      el.style.transition = 'none';
      el.style.transform = `translateX(${dx * (edge ? 0.15 : 0.35)}px)`;
    }
  }
  function onTouchEnd() {
    const s = touch.current;
    touch.current = null;
    if (!s || s.axis !== 'x') return;
    const el = panel();
    if (el) {
      el.style.transition = '';
      el.style.transform = '';
    }
    if (s.dx <= -SWIPE_MIN) go(active + 1);
    else if (s.dx >= SWIPE_MIN) go(active - 1);
  }

  return (
    <div className="swipe" ref={rootRef}>
      <div className="swipe__tabs" role="tablist" aria-label={label} ref={tabsRef} onKeyDown={onKeyDown}>
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            id={`${uid}-tab-${s.id}`}
            aria-controls={`${uid}-panel-${s.id}`}
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            className={`swipe__tab${i === active ? ' is-on' : ''}`}
            onClick={() => go(i)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div
        className="swipe__body"
        ref={bodyRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        {slides.map((s, i) => (
          <section
            key={s.id}
            className={`swipe__slide${i === active && dir ? (dir > 0 ? ' from-right' : ' from-left') : ''}`}
            role="tabpanel"
            id={`${uid}-panel-${s.id}`}
            aria-labelledby={`${uid}-tab-${s.id}`}
            hidden={i !== active}
          >
            {s.content}
          </section>
        ))}
      </div>
      {/* Previous / next section, with dots for where you are. */}
      <div className="swipe__nav">
        <button
          type="button"
          className="swipe__step"
          onClick={() => go(active - 1)}
          disabled={active === 0}
          aria-label={active > 0 ? `Previous: ${slides[active - 1].label}` : 'Previous'}
        >
          <span aria-hidden="true">‹</span>
          <span className="swipe__step-label">{active > 0 ? slides[active - 1].label : ''}</span>
        </button>
        <div className="swipe__dots" aria-hidden="true">
          {slides.map((s, i) => (
            <span key={s.id} className={i === active ? 'is-on' : undefined} />
          ))}
        </div>
        <button
          type="button"
          className="swipe__step swipe__step--next"
          onClick={() => go(active + 1)}
          disabled={active === slides.length - 1}
          aria-label={active < slides.length - 1 ? `Next: ${slides[active + 1].label}` : 'Next'}
        >
          <span className="swipe__step-label">{active < slides.length - 1 ? slides[active + 1].label : ''}</span>
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  );
}
