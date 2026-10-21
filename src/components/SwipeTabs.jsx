import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

/**
 * Phone layout for long pages: a row of tabs over slides you can swipe
 * between. The tab row sticks to the top while you scroll a slide, and the
 * track takes the height of the slide on show, so short slides don't leave
 * a gap. Slides off screen are inert, so focus and screen readers stay on
 * the one being read.
 *
 * slides: [{ id, label, content }]
 */
export default function SwipeTabs({ slides, label }) {
  const uid = useId();
  const [active, setActive] = useState(0);
  const [height, setHeight] = useState(null);
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const tabsRef = useRef(null);
  const slideRefs = useRef([]);

  // Follow swipes: the slide nearest the track's scroll position is active.
  useEffect(() => {
    const track = trackRef.current;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
        setActive(Math.max(0, Math.min(slides.length - 1, i)));
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [slides.length]);

  // Track height follows the slide on show, including when it grows or shrinks.
  useLayoutEffect(() => {
    const el = slideRefs.current[active];
    if (!el) return undefined;
    const measure = () => setHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [active]);

  useEffect(() => {
    slideRefs.current.forEach((el, i) => {
      if (el) el.inert = i !== active;
    });
    // Keep the active tab in view in the tab row.
    const tab = tabsRef.current?.children[active];
    if (tab) {
      const row = tabsRef.current;
      row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' });
    }
  }, [active]);

  // After a resize or rotation, or once a swipe settles, line the track up
  // exactly with the active slide so it never rests between two.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const align = () => {
      const want = active * track.clientWidth;
      if (Math.abs(track.scrollLeft - want) > 1) track.scrollTo({ left: want });
    };
    let t = 0;
    const settle = () => {
      clearTimeout(t);
      t = setTimeout(align, 160);
    };
    const ro = new ResizeObserver(align);
    ro.observe(track);
    track.addEventListener('scroll', settle, { passive: true });
    return () => {
      ro.disconnect();
      track.removeEventListener('scroll', settle);
      clearTimeout(t);
    };
  }, [active]);

  function go(i) {
    const track = trackRef.current;
    track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
    setActive(i);
    // If the tab row is stuck at the top, bring the start of the new slide into view.
    const top = rootRef.current.getBoundingClientRect().top;
    if (top < 0) window.scrollBy({ top, behavior: 'smooth' });
  }

  function onKeyDown(e) {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (e.key === 'Home' || e.key === 'End' || step) {
      e.preventDefault();
      const i = e.key === 'Home' ? 0 : e.key === 'End' ? slides.length - 1 : (active + step + slides.length) % slides.length;
      go(i);
      tabsRef.current.children[i]?.focus();
    }
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
      <div className="swipe__track" ref={trackRef} style={height ? { height } : undefined}>
        {slides.map((s, i) => (
          <section
            key={s.id}
            ref={(el) => { slideRefs.current[i] = el; }}
            className="swipe__slide"
            role="tabpanel"
            id={`${uid}-panel-${s.id}`}
            aria-labelledby={`${uid}-tab-${s.id}`}
          >
            {s.content}
          </section>
        ))}
      </div>
      <div className="swipe__dots" aria-hidden="true">
        {slides.map((s, i) => <span key={s.id} className={i === active ? 'is-on' : undefined} />)}
      </div>
    </div>
  );
}
