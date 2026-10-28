// Character filters in the style of an in-game collection screen: a row of
// round icon toggles each for element, role, rank and Arc type. Several picks
// in one row widen the search (Cosmos or Anima); picks in different rows
// narrow it (Cosmos or Anima, and Damage, and S-Rank). Used by the Characters
// page and the team builder's roster.
import { useState } from 'react';
import { ARC_TYPES } from '../data/characters.js';
import { ELEMENTS, ROLES } from '../data/elements.js';
import { roleIconUrl } from '../lib/icons.js';
import ElementGlyph from './ElementGlyph.jsx';
import RankBadge from './RankBadge.jsx';
import ArcTypeIcon from './ArcTypeIcon.jsx';

const EMPTY = { element: [], role: [], rarity: [], arcType: [] };

/** Filter state and its setter, starting with nothing picked. */
export const useCharacterFilters = () => useState(EMPTY);

/** Does a character pass the filters? An empty row lets everyone through. */
export function matchesCharacterFilters(c, f) {
  const ok = (picked, value) => !picked.length || picked.includes(value);
  return (
    ok(f.element, c.element) &&
    (!f.role.length || c.roles.some((r) => f.role.includes(r))) &&
    ok(f.rarity, c.rarity) &&
    ok(f.arcType, c.arcType)
  );
}

const anyPicked = (f) => Object.values(f).some((v) => v.length > 0);

function Row({ label, children }) {
  return (
    <div className="cfilter__row" role="group" aria-label={`Filter by ${label.toLowerCase()}`}>
      <span className="cfilter__label">{label}</span>
      <div className="cfilter__icons">{children}</div>
    </div>
  );
}

function Toggle({ on, name, onClick, children }) {
  return (
    <button type="button" className="cfilter__btn" aria-pressed={on} aria-label={name} title={name} onClick={onClick}>
      {children}
    </button>
  );
}

export default function CharacterFilters({ filters, setFilters, arcTypes = true }) {
  const flip = (key, value) =>
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value],
    }));
  return (
    <div className="cfilter">
      <Row label="Element">
        {ELEMENTS.map((el) => (
          <Toggle key={el.id} name={el.name} on={filters.element.includes(el.id)} onClick={() => flip('element', el.id)}>
            <ElementGlyph element={el.id} size={22} />
          </Toggle>
        ))}
      </Row>
      <Row label="Role">
        {ROLES.map((r) => (
          <Toggle key={r} name={r} on={filters.role.includes(r)} onClick={() => flip('role', r)}>
            <img src={roleIconUrl(r)} width={20} height={20} alt="" />
          </Toggle>
        ))}
      </Row>
      <Row label="Rank">
        {['S', 'A'].map((r) => (
          <Toggle key={r} name={`${r}-Rank`} on={filters.rarity.includes(r)} onClick={() => flip('rarity', r)}>
            <RankBadge rank={r} size={24} />
          </Toggle>
        ))}
        {!arcTypes && anyPicked(filters) && (
          <button type="button" className="chip cfilter__clear" onClick={() => setFilters(EMPTY)}>
            Clear filters
          </button>
        )}
      </Row>
      {arcTypes && (
        <Row label="Arc">
          {ARC_TYPES.map((t) => (
            <Toggle key={t} name={t} on={filters.arcType.includes(t)} onClick={() => flip('arcType', t)}>
              <ArcTypeIcon type={t} size={22} />
            </Toggle>
          ))}
          {anyPicked(filters) && (
            <button type="button" className="chip cfilter__clear" onClick={() => setFilters(EMPTY)}>
              Clear filters
            </button>
          )}
        </Row>
      )}
    </div>
  );
}
