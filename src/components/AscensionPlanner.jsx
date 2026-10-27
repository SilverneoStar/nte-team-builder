// Level-cap materials for a character, with a from/to planner.
import { useState } from 'react';
import MaterialIcon from './MaterialIcon.jsx';
import { ASCENSION_PHASES, MAX_LEVEL, ascensionCost, ascensionTable } from '../data/ascension.js';
import { fmt } from '../lib/format.js';

const CAPS = [20, 30, 40, 50, 60, 70, 80];

// Shows what a character needs to raise their level cap, with a from/to planner.
export default function AscensionPlanner({ character }) {
  const [from, setFrom] = useState(20);
  const [to, setTo] = useState(MAX_LEVEL);
  const [showPhases, setShowPhases] = useState(false);

  const cost = ascensionCost(character.id, from, to);
  const table = ascensionTable(character.id);
  if (!cost || !table) return null;

  return (
    <section className="ascend" aria-labelledby="ascend-title">
      <div className="ascend__head">
        <h3 id="ascend-title" className="mini-title">Ascension materials</h3>
        <div className="ascend__range">
          <label>
            <span>Level cap</span>
            <select
              id="ascend-from"
              value={from}
              onChange={(e) => {
                const v = Number(e.target.value);
                setFrom(v);
                if (to <= v) setTo(Math.min(v + 10, MAX_LEVEL));
              }}
            >
              {CAPS.slice(0, -1).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <span aria-hidden="true">→</span>
          <label>
            <span className="sr-only">Target level cap</span>
            <select id="ascend-to" value={to} onChange={(e) => setTo(Number(e.target.value))}>
              {CAPS.filter((c) => c > from).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
      </div>

      {cost.length === 0 ? (
        <p className="muted small">Nothing needed for this range.</p>
      ) : (
        <ul className="mats">
          {cost.map((m) => (
            <li key={m.name} className={`mat mat--${m.kind}`}>
              <MaterialIcon name={m.name} />
                  <span className="mat__qty">{fmt(m.qty)}</span>
              <span className="mat__name">
                {m.name}
                {m.source && <span className="mat__src">{m.source}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="btn btn--quiet ascend__toggle"
        aria-expanded={showPhases}
        onClick={() => setShowPhases((v) => !v)}
      >
        {showPhases ? 'Hide' : 'Show'} each ascension
      </button>

      {showPhases && (
        <div className="table-wrap">
          <table className="phase-table">
            <thead>
              <tr>
                <th scope="col">Ascension</th>
                <th scope="col">{table[0].bossName}</th>
                <th scope="col">Family material</th>
                <th scope="col" className="num">Beetle Coin</th>
              </tr>
            </thead>
            <tbody>
              {table.map((p) => (
                <tr key={p.at} className={p.at >= from && p.at < to ? 'in-range' : undefined}>
                  <td>Lv {p.at} → {p.to}</td>
                  <td className="num-l">{p.bossQty || '—'}</td>
                  <td>{p.tierQty} × {p.tierName}</td>
                  <td className="num">{fmt(p.coins)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted small">
        {ASCENSION_PHASES.length} ascensions take the cap from 20 to {MAX_LEVEL}. Amounts follow
        S-rank guides; check in-game for A-rank characters.
      </p>
    </section>
  );
}
