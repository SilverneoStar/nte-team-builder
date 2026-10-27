// R3 / R6 Resonance circles with their descriptions.
import { useState } from 'react';
import { RESONANCES, activeResonance } from '../data/awakenings.js';
import StatText from './StatText.jsx';

// Two circles, R3 and R6. Lit when the character has 3 / 6 awakenings on.
// Clicking a circle shows (or hides) its description underneath.
export default function ResonanceBadges({ characterId, awakeningCount = 0, showStatus = true }) {
  const list = RESONANCES[characterId];
  const [open, setOpen] = useState(null);
  if (!list) return null;
  const active = activeResonance(awakeningCount);
  const shown = list.find((r) => r.id === open);

  return (
    <div className="reso">
      <div className="reso__row">
        <span className="reso__label">Resonance</span>
        {list.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`reso__dot${active[r.id] ? ' is-on' : ''}${open === r.id ? ' is-open' : ''}`}
            aria-expanded={open === r.id}
            aria-label={`${r.id}: ${r.name}${showStatus ? (active[r.id] ? ' (active)' : ` (needs ${r.at} awakenings)`) : ''}`}
            title={r.name}
            onClick={() => setOpen(open === r.id ? null : r.id)}
          >
            {r.id}
          </button>
        ))}
      </div>
      {shown && (
        <div className="reso__desc" role="note">
          <b>{shown.name}</b>
          {showStatus && (
            <span className={`reso__state${active[shown.id] ? ' is-on' : ''}`}>
              {active[shown.id] ? 'Active' : `Needs ${shown.at} awakenings`}
            </span>
          )}
          <p><StatText>{shown.effect}</StatText></p>
        </div>
      )}
    </div>
  );
}
