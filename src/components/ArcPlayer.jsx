// An Arc drawn as a flat 2D player: the Arc-type disc behind, the hub, the
// case, and the Arc's artwork in the window. All layers share one 680 x 600
// frame. With `spin`, only the disc turns (a CSS transform on its own layer,
// so the browser rotates a ready-made bitmap and never repaints the page).
const BASE = import.meta.env.BASE_URL;
const P = `${BASE}arc-player`;
const TYPES = new Set(['liquid', 'plasma', 'condensate', 'solid', 'gas']);

export default function ArcPlayer({ arc, spin = false, className = '' }) {
  const type = String(arc.type || '').toLowerCase();
  return (
    <span className={`arc-player${spin ? ' is-spinning' : ''}${className ? ` ${className}` : ''}`} aria-hidden="true">
      {TYPES.has(type) && (
        <img className="arc-player__disc" src={`${P}/disc-${type}.svg`} alt="" loading="lazy" decoding="async" />
      )}
      <img className="arc-player__layer" src={`${P}/hub.svg`} alt="" loading="lazy" decoding="async" />
      <img className="arc-player__layer" src={`${P}/case.svg`} alt="" loading="lazy" decoding="async" />
      <span className="arc-player__art">
        <img src={`${P}/art/${arc.id}.webp`} alt="" loading="lazy" decoding="async" />
      </span>
    </span>
  );
}
