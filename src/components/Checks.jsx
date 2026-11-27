// Cortado's checks for a team or a saved build (lib/checks.js): what's
// missing or doesn't work, instead of a score.
import { Fragment } from 'react';
import { MASCOT_HATS } from './Mascot.jsx';

const BASE = import.meta.env.BASE_URL;

export default function Checks({ title, checks, note }) {
  if (!checks?.length) return null;
  const fine = checks.every((x) => x.tone === 'ok' || x.tone === 'tip');
  return (
    <section className={`checks${fine ? ' checks--fine' : ''}`} aria-label={title}>
      <img className="checks__mascot" src={`${BASE}${MASCOT_HATS[0].file}`} alt="" width="48" height="48" />
      <div className="checks__body">
        <span className="checks__title">{title}</span>
        <ul className="checks__list">
          {checks.map((x, i) => (
            <Fragment key={x.text}>
              {x.kit && !checks[i - 1]?.kit && <li className="checks__sub">What the kits need</li>}
            <li className={`checks__item checks__item--${x.tone}`}>
              <span className="checks__icon" aria-hidden="true">
                {x.tone === 'ok' ? '✓' : x.tone === 'tip' ? '+' : '!'}
              </span>
              {x.text}
            </li>
            </Fragment>
          ))}
        </ul>
        {note && <p className="muted small">{note}</p>}
      </div>
    </section>
  );
}
