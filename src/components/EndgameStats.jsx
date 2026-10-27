// Recommended endgame stats and Cartridge stat priorities from the build guides.
import { ELEMENT_BY_ID } from '../data/elements.js';
import { ENDGAME, ENDGAME_STATS, parsePriority } from '../data/endgame.js';

const label = (key, c) => (key === 'element' ? `${ELEMENT_BY_ID[c.element].name} DMG` : ENDGAME_STATS.find(([k]) => k === key)[1]);

function StatList({ stats, character }) {
  return (
    <dl className="endgame__list">
      {ENDGAME_STATS.filter(([k]) => stats[k]).map(([k]) => (
        <div key={k}>
          <dt>{label(k, character)}</dt>
          <dd>{stats[k]}</dd>
        </div>
      ))}
    </dl>
  );
}

function Priority({ title, text }) {
  const groups = parsePriority(text);
  if (!groups.length) return null;
  return (
    <div className="endgame__prio">
      <span className="endgame__prio-title">{title}</span>
      <ol>
        {groups.map((g, i) => <li key={i}>{g.join(' = ')}</li>)}
      </ol>
    </div>
  );
}

// Community-guide recommended endgame stats and Cartridge stat priorities.
export default function EndgameStats({ character: c }) {
  const e = ENDGAME[c.id];
  if (!e) {
    return (
      <section className="endgame">
        <h3 className="mini-title">Recommended endgame stats</h3>
        <p className="muted small">Not published yet.</p>
      </section>
    );
  }
  return (
    <section className="endgame" aria-labelledby="endgame-title">
      <h3 id="endgame-title" className="mini-title">
        Recommended endgame stats {e.endgameLabel && <span>{e.endgameLabel}</span>}
      </h3>
      {e.endgame ? <StatList stats={e.endgame} character={c} /> : <p className="muted small">Number targets not published yet.</p>}
      {e.alt?.endgame && (
        <>
          <hr className="endgame__rule endgame__rule--section" />
          <p className="endgame__alt-title">{e.alt.label}</p>
          <StatList stats={e.alt.endgame} character={c} />
        </>
      )}
      {e.notes?.map((n) => <p key={n} className="muted small endgame__note">{n}</p>)}

      <hr className="endgame__rule endgame__rule--section" />
      <h3 className="mini-title endgame__best">Best Cartridge stats</h3>
      <Priority title="Main" text={e.main} />
      <hr className="endgame__rule" />
      <Priority title="Sub" text={e.subs} />
      {e.alt?.main && (
        <>
          <hr className="endgame__rule endgame__rule--section" />
          <p className="endgame__alt-title">{e.alt.label}</p>
          <Priority title="Main" text={e.alt.main} />
          <hr className="endgame__rule" />
          <Priority title="Sub" text={e.alt.subs} />
        </>
      )}
      {e.builds?.map((b) => (
        <div key={b.label}>
          <hr className="endgame__rule endgame__rule--section" />
          <p className="endgame__alt-title">{b.label}</p>
          <Priority title="Main" text={b.main} />
          <hr className="endgame__rule" />
          <Priority title="Sub" text={b.subs} />
        </div>
      ))}
      <p className="muted small">Tuned for the signature Arc.</p>
    </section>
  );
}
