// The roster on the team builder: search, filters and the character cards.
import { useMemo, useState } from 'react';
import { CHARACTERS } from '../data/characters.js';
import { ELEMENTS, PAIR_REACTIONS, ROLES } from '../data/elements.js';
import ElementGlyph from './ElementGlyph.jsx';
import Portrait from './Portrait.jsx';
import RankBadge from './RankBadge.jsx';
import RoleList from './RoleList.jsx';

// Which new reactions a character would unlock if added to this team.
function unlocks(character, presentElements, activeReactionIds) {
  return PAIR_REACTIONS.filter(
    (r) =>
      r.elements.includes(character.element) &&
      !activeReactionIds.has(r.id) &&
      r.elements.some((e) => e !== character.element && presentElements.has(e)),
  );
}

/**
 * The character list with search and filters.
 * - On the page: tapping a character adds it to the first empty slot (or removes it).
 * - In the slot picker (`onPick`): tapping a character puts it in that slot.
 */
export default function Roster({ members, analysis, usage, dispatch, onPick = null }) {
  const inPicker = !!onPick;
  const idp = inPicker ? 'pick' : 'roster';
  const [query, setQuery] = useState('');
  const [element, setElement] = useState('all');
  const [role, setRole] = useState('all');
  const [rarity, setRarity] = useState('all');
  const [showUpcoming, setShowUpcoming] = useState(false);

  const present = useMemo(() => new Set(Object.keys(analysis.elementCounts)), [analysis]);
  const activeIds = useMemo(() => new Set(analysis.reactions.map((r) => r.id)), [analysis]);
  const teamFull = members.every(Boolean);

  const list = CHARACTERS.filter((c) => {
    if (c.upcoming && !showUpcoming) return false;
    if (element !== 'all' && c.element !== element) return false;
    if (role !== 'all' && !c.roles.includes(role)) return false;
    if (rarity !== 'all' && c.rarity !== rarity) return false;
    if (query && !c.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
    return true;
  });

  return (
    <section className={`roster${inPicker ? ' roster--picker' : ''}`} aria-labelledby={inPicker ? undefined : 'roster-title'} aria-label={inPicker ? 'Characters' : undefined}>
      <div className="roster__head">
        {!inPicker && <h2 id="roster-title" className="section-title">Roster</h2>}
        <label className="sr-only" htmlFor={`${idp}-search`}>Search characters</label>
        <input
          id={`${idp}-search`}
          className="search"
          type="search"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="filters">
        <div className="chips" role="group" aria-label="Filter by element">
          <button className="chip" aria-pressed={element === 'all'} onClick={() => setElement('all')}>
            All
          </button>
          {ELEMENTS.map((el) => (
            <button
              key={el.id}
              className="chip"
              aria-pressed={element === el.id}
              onClick={() => setElement(element === el.id ? 'all' : el.id)}
            >
              <ElementGlyph element={el.id} size={13} />
              {el.name}
            </button>
          ))}
        </div>
        <div className="filters__row">
          <label className="select">
            <span>Role</span>
            <select id={`${idp}-role`} value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="all">Any</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <label className="select">
            <span>Rank</span>
            <select id={`${idp}-rarity`} value={rarity} onChange={(e) => setRarity(e.target.value)}>
              <option value="all">Any</option>
              <option value="S">S</option>
              <option value="A">A</option>
            </select>
          </label>
          <label className="check">
            <input
              id={`${idp}-upcoming`}
              type="checkbox"
              checked={showUpcoming}
              onChange={(e) => setShowUpcoming(e.target.checked)}
            />
            Show upcoming
          </label>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="empty">No characters match these filters.</p>
      ) : (
        <ul className="grid">
          {list.map((c) => {
            const inTeam = members.includes(c.id);
            const others = usage[c.id];
            const gains = inTeam ? [] : unlocks(c, present, activeIds);
            return (
              <li key={c.id}>
                <button
                  className={`card${inTeam ? ' card--in' : ''}`}
                  aria-pressed={inPicker ? undefined : inTeam}
                  disabled={!inPicker && !inTeam && teamFull}
                  onClick={() => (inPicker ? onPick(c.id) : dispatch({ type: 'toggle', charId: c.id }))}
                >
                  <Portrait character={c} />
                  <span className="card__body">
                    <span className="card__name">
                      {c.name}
                      <RankBadge rank={c.rarity} size={18} />
                    </span>
                    <span className="card__role"><RoleList roles={c.roles} size={13} separator={false} /></span>
                    {gains.length > 0 && (
                      <span className="card__gain">+ {gains.map((g) => g.name).join(', ')}</span>
                    )}
                    {inPicker && inTeam && <span className="card__tag">In this team · tap to move here</span>}
                    {c.upcoming && <span className="card__tag">Upcoming</span>}
                    {others && (
                      <span className="card__tag card__tag--used" title={`Also in ${others.join(', ')}`}>
                        {others.length === 1 ? `In ${others[0]}` : `In ${others.length} other teams`}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
