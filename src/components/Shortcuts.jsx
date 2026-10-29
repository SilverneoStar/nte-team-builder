// Hunter Exchange items that stand in for farmed materials: which selection
// boxes help this character (or Arc), what to pick from each, and Expansion Cores.
import MaterialIcon from './MaterialIcon.jsx';
import { SUBSTITUTE_SHOP, arcShortcuts, characterShortcuts } from '../data/substitutes.js';
import { fmt } from '../lib/format.js';

export default function Shortcuts({ character = null, arc = null }) {
  const items = character ? characterShortcuts(character.id) : arcShortcuts(arc);
  if (!items.length) return null;
  const who = character ? character.name : arc.name;
  return (
    <section className="ascend shortcuts" aria-labelledby="shortcuts-title">
      <div className="ascend__head">
        <h3 id="shortcuts-title" className="mini-title">
          Shortcuts <span>{SUBSTITUTE_SHOP}, paid in Fons</span>
        </h3>
      </div>
      <ul className="shortcuts__list">
        {items.map((b) => (
          <li key={b.name} className="shortcut">
            <MaterialIcon name={b.name} size={44} />
            <span className="shortcut__body">
              <b>{b.name}</b>
              {b.pick ? (
                <span className="shortcut__pick">
                  Pick for {who}: <MaterialIcon name={b.pick} size={20} />
                  <strong>{b.pick}</strong>
                </span>
              ) : (
                <span className="shortcut__note">{b.note}</span>
              )}
              <span className="shortcut__meta">
                <span className="shortcut__cost">
                  <MaterialIcon name="Fons" size={16} />
                  {fmt(b.cost)}
                </span>
                <span>· stock {fmt(b.stock)}</span>
                <span>· {b.sources.join(', ')}</span>
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className="muted small">
        Boxes give tier-1 materials, the most common kind. Expansion Cores cover any missing material, but rarer ones
        cost more Cores, so they’re best saved for the last few upgrades.
      </p>
    </section>
  );
}
