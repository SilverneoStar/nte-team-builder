// Datamined kit crumbs for an unreleased Esper, shown only with beta info on.
import { LEAKS } from '../data/leaks.js';
import { useShowBeta } from '../lib/betaInfo.js';
import BetaHidden from './BetaHidden.jsx';

export default function LeakSection({ character: c }) {
  const showBeta = useShowBeta();
  const leak = LEAKS[c.id];
  if (!leak) return null;
  if (!showBeta) return <BetaHidden what={`${c.name}’s datamined kit crumbs`} />;
  return (
    <section className="leak">
      <h3 className="mini-title">
        <span className="beta-tag">Datamine</span> Kit crumbs
      </h3>
      <p className="muted small">
        Found in the game files ({leak.when}), not official: unfinished and likely to change before release.
        {leak.note && ` ${leak.note}`}
      </p>
      {leak.groups.map((g) => (
        <div key={g.title} className="leak__group">
          <h4>{g.title}</h4>
          <ul>
            {g.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
