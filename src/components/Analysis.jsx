// Team analysis under the slots: elements, reactions, trios, roles and tips.
import { ELEMENT_BY_ID } from '../data/elements.js';
import EsperCycle from './EsperCycle.jsx';
import ElementGlyph from './ElementGlyph.jsx';
import { roleIconUrl } from '../lib/icons.js';
import StatText from './StatText.jsx';
import SynergyScore from './SynergyScore.jsx';

export default function Analysis({ analysis, members = [], loadouts = {} }) {
  const { elementCounts, reactions, trios, roleCounts, notes } = analysis;

  return (
    <section className="analysis" aria-labelledby="analysis-title">
      <h2 id="analysis-title" className="section-title">
        Synergy
      </h2>
      <SynergyScore members={members} loadouts={loadouts} />
      <div className="analysis__grid">
        <EsperCycle elementCounts={elementCounts} reactions={reactions} trios={trios} />

        <div className="analysis__side">
          <div className="roles">
            {Object.entries(roleCounts).map(([role, n]) => (
              <span key={role} className={n ? 'role-chip role-chip--on' : 'role-chip'}>
                <img className="role-icon" src={roleIconUrl(role)} width={14} height={14} alt="" />
                <b>{n}</b> {role}
              </span>
            ))}
          </div>

          {(reactions.length > 0 || trios.length > 0) && (
            <ul className="reactions">
              {trios.map((t) => (
                <li key={t.id} className="reaction reaction--trio">
                  <div className="reaction__head">
                    <span className="reaction__name">{t.name}</span>
                    <span className="reaction__kind">Trio</span>
                  </div>
                  <p>
                    <StatText>{t.effect}</StatText>
                  </p>
                </li>
              ))}
              {reactions.map((r) => (
                <li key={r.id} className="reaction">
                  <div className="reaction__head">
                    <span className="reaction__pair">
                      {r.elements.map((e) => (
                        <ElementGlyph key={e} element={e} size={13} title={ELEMENT_BY_ID[e].name} />
                      ))}
                    </span>
                    <span className="reaction__name">{r.name}</span>
                    <span className="reaction__kind">{r.kind}</span>
                  </div>
                  <p>
                    <StatText>{r.effect}</StatText>
                  </p>
                </li>
              ))}
            </ul>
          )}

          <ul className="notes">
            {notes.map((n, i) => (
              <li key={i} className={`note note--${n.level}`}>
                {n.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
