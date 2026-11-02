// Stats tab: base HP, ATK and DEF at every level step, folded away by default.
import { levelStats } from '../data/levelStats.js';
import StatIcon from './StatIcon.jsx';
import { fmt } from '../lib/format.js';

export default function LevelStats({ character: c }) {
  const data = levelStats(c.id);
  if (!data || c.upcoming) return null;
  return (
    <details className="level-stats">
      <summary>
        <span className="mini-title">
          Stats by level <span>base · no gear</span>
        </span>
      </summary>
      <table className="level-stats__table">
        <thead>
          <tr>
            <th scope="col">Level</th>
            {[
              ['hp', 'HP'],
              ['atk', 'ATK'],
              ['def', 'DEF'],
            ].map(([k, name]) => (
              <th key={k} scope="col">
                <span className="stat-label">
                  <StatIcon stat={k} />
                  {name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r) => (
            <tr key={r.level} className={r.level.endsWith('+') ? 'is-ascended' : undefined}>
              <th scope="row">{r.level}</th>
              <td>{fmt(r.hp)}</td>
              <td>{fmt(r.atk)}</td>
              <td>{fmt(r.def)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted small">
        “+” is the same level after ascending.
        {data.approx && ' Some ATK and DEF values may be off by 1 until we have this Esper’s full table.'}
      </p>
    </details>
  );
}
