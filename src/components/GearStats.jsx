// Stat totals for a character with their gear on, base → total, at a chosen level.
import { useState } from 'react';
import { computeStats } from '../lib/statCalc.js';
import { LEVEL_STEPS } from '../data/levelStats.js';
import { formatStat } from '../data/gear.js';
import { fmt } from '../lib/format.js';

const NAMES = { 'DMG%': 'DMG Bonus' };
const show = (row, v) => (row.pct ? `${Number.isInteger(v) ? v : v.toFixed(1)}%` : fmt(v));

export default function GearStats({ character: c, gear, title = 'Stats with this gear' }) {
  const [level, setLevel] = useState('80');
  if (c.upcoming) return null;
  const s = computeStats(c, gear, level);
  if (!s) return null;
  return (
    <section className="gear-totals" aria-label={title}>
      <div className="gear-totals__head">
        <p className="mini-title">
          {title} <span>Arc at max level</span>
        </p>
        <label className="gear-totals__level">
          <span>Level</span>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            {LEVEL_STEPS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </div>
      <table className="gear-totals__table">
        <thead>
          <tr>
            <th scope="col">Stat</th>
            <th scope="col">Base</th>
            <th scope="col">With gear</th>
          </tr>
        </thead>
        <tbody>
          {s.rows.map((r) => {
            const up = r.total - r.base;
            return (
              <tr key={r.stat} className={up ? undefined : 'is-same'}>
                <th scope="row">{NAMES[r.stat] ?? r.stat.replace(/%$/, '')}</th>
                <td>{show(r, r.base)}</td>
                <td>
                  <b>{show(r, r.total)}</b>
                  {up > 0 && <span className="gear-totals__up">+{show(r, Math.round(up * 100) / 100)}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {s.other.length > 0 && (
        <p className="muted small">Also: {s.other.map((o) => formatStat(o.stat, o.value)).join(' · ')}</p>
      )}
      <p className="muted small">
        Conditional bonuses (Arc passives, 4-piece set effects) aren’t counted.
      </p>
    </section>
  );
}
