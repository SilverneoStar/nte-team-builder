import { useEffect, useMemo, useState } from 'react';
import { ARC_TYPES, CHARACTERS, CHARACTER_BY_ID } from '../data/characters.js';
import { ELEMENTS, ELEMENT_BY_ID, ROLES } from '../data/elements.js';
import { navigate } from '../lib/route.js';
import CharacterDetail from './CharacterDetail.jsx';
import ElementGlyph from './ElementGlyph.jsx';
import Portrait from './Portrait.jsx';
import ArcBackdrop from './ArcBackdrop.jsx';
import RankBadge from './RankBadge.jsx';
import RoleList from './RoleList.jsx';
import ArcTypeIcon from './ArcTypeIcon.jsx';
import { ENDGAME, endgameNumber } from '../data/endgame.js';

const BASE = import.meta.env.BASE_URL;
const VIEW_KEY = 'nte-team-builder:charView';

function loadView() {
  try {
    return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid';
  } catch {
    return 'grid';
  }
}

const COLUMNS = [
  { id: 'name', label: 'Character', get: (c) => c.name },
  { id: 'element', label: 'Element', get: (c) => ELEMENTS.findIndex((e) => e.id === c.element) },
  { id: 'rarity', label: 'Rank', get: (c) => c.rarity },
  { id: 'role', label: 'Roles', get: (c) => c.roles.join(', ') },
  { id: 'arcType', label: 'Arc type', get: (c) => c.arcType },
  // Recommended endgame stats from community build guides; sorted by their first number.
  ...[
    ['hp', 'HP'], ['atk', 'ATK'], ['critRate', 'CRIT Rate'], ['critDmg', 'CRIT DMG'],
    ['universal', 'Univ. DMG'], ['element', 'Elem. DMG'],
  ].map(([key, label]) => ({
    id: `eg-${key}`, label, endgame: key, numeric: true, get: (c) => endgameNumber(ENDGAME[c.id]?.endgame[key]),
  })),
  { id: 'other', label: 'Also', get: (c) => otherStats(c) || null },
];

// DEF, Cycle and Break targets, shown only for characters who need them.
const OTHER = [['def', 'DEF'], ['cycle', 'Cycle'], ['break', 'Break']];
const otherStats = (c) => {
  const e = ENDGAME[c.id]?.endgame;
  return e ? OTHER.filter(([k]) => e[k]).map(([k, l]) => `${l} ${e[k]}`).join(' · ') : '';
};

function compare(a, b, col, dir) {
  const va = col.get(a);
  const vb = col.get(b);
  // Missing values always sort to the bottom.
  if (va == null && vb == null) return a.name.localeCompare(b.name);
  if (va == null) return 1;
  if (vb == null) return -1;
  const result = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
  return result ? result * dir : a.name.localeCompare(b.name);
}

export default function CharactersPage({ characterId, activeTeam, onAdd }) {
  const [query, setQuery] = useState('');
  const [element, setElement] = useState('all');
  const [role, setRole] = useState('all');
  const [rarity, setRarity] = useState('all');
  const [arcType, setArcType] = useState('all');
  const [sort, setSort] = useState({ id: 'name', dir: 1 });
  const [view, setView] = useState(loadView);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      /* storage unavailable: the choice just won't be remembered */
    }
  }, [view]);

  const selected = characterId ? CHARACTER_BY_ID[characterId] : null;

  const rows = useMemo(() => {
    const col = COLUMNS.find((c) => c.id === sort.id);
    return CHARACTERS.filter((c) => {
      if (element !== 'all' && c.element !== element) return false;
      if (role !== 'all' && !c.roles.includes(role)) return false;
      if (rarity !== 'all' && c.rarity !== rarity) return false;
      if (arcType !== 'all' && c.arcType !== arcType) return false;
      if (query && !c.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    }).sort((a, b) => compare(a, b, col, sort.dir));
  }, [query, element, role, rarity, arcType, sort]);

  function toggleSort(id) {
    const col = COLUMNS.find((c) => c.id === id);
    setSort((s) => (s.id === id ? { id, dir: -s.dir } : { id, dir: col.numeric ? -1 : 1 }));
  }

  return (
    <div className="page">
      <header className="page__head">
        <h2 className="page__title">Characters</h2>
        <p className="muted">
          {CHARACTERS.length} Espers. Select a character for details, reactions and featured teams.
        </p>
      </header>

      {selected && (
        <CharacterDetail
          character={selected}
          activeTeam={activeTeam}
          inActiveTeam={activeTeam.members.includes(selected.id)}
          teamFull={activeTeam.members.every(Boolean)}
          onAdd={() => onAdd(selected.id)}
          onClose={() => navigate('characters')}
        />
      )}

      <div className="filters filters--page">
        <div className="chips" role="group" aria-label="Filter by element">
          <button className="chip" aria-pressed={element === 'all'} onClick={() => setElement('all')}>All</button>
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
          <label className="sr-only" htmlFor="index-search">Search characters</label>
          <input
            id="index-search"
            className="search search--inline"
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="select">
            <span>Role</span>
            <select id="index-role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="all">Any</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className="select">
            <span>Rank</span>
            <select id="index-rarity" value={rarity} onChange={(e) => setRarity(e.target.value)}>
              <option value="all">Any</option>
              <option value="S">S</option>
              <option value="A">A</option>
            </select>
          </label>
          <label className="select">
            <span>Arc</span>
            <select id="index-arc" value={arcType} onChange={(e) => setArcType(e.target.value)}>
              <option value="all">Any</option>
              {ARC_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          {(
            <label className={`select${view === 'list' ? ' select--phone-only' : ''}`}>
              <span>Sort</span>
              <select
                id="index-sort"
                value={`${sort.id}:${sort.dir}`}
                onChange={(e) => {
                  const [id, dir] = e.target.value.split(':');
                  setSort({ id, dir: Number(dir) });
                }}
              >
                <option value="name:1">Name A–Z</option>
                <option value="name:-1">Name Z–A</option>
                <option value="element:1">Element</option>
                <option value="rarity:-1">Rank</option>
                <option value="eg-hp:-1">HP</option>
                <option value="eg-atk:-1">ATK</option>
                <option value="eg-critRate:-1">CRIT Rate</option>
                <option value="eg-critDmg:-1">CRIT DMG</option>
                <option value="eg-universal:-1">Universal DMG</option>
                <option value="eg-element:-1">Element DMG</option>
              </select>
            </label>
          )}
          <div className="view-toggle" role="group" aria-label="Layout">
            <button className="view-toggle__btn" aria-pressed={view === 'grid'} onClick={() => setView('grid')} title="Grid view">
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <rect x="2" y="2" width="5" height="5" rx="1.2" fill="currentColor" />
                <rect x="9" y="2" width="5" height="5" rx="1.2" fill="currentColor" />
                <rect x="2" y="9" width="5" height="5" rx="1.2" fill="currentColor" />
                <rect x="9" y="9" width="5" height="5" rx="1.2" fill="currentColor" />
              </svg>
              Grid
            </button>
            <button className="view-toggle__btn" aria-pressed={view === 'list'} onClick={() => setView('list')} title="List view">
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <path d="M2 3.5h12M2 8h12M2 12.5h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              List
            </button>
          </div>
        </div>
      </div>

      {view === 'grid' && (
        <>
          <ul className="char-grid">
            {rows.map((c) => (
              <li key={c.id}>
                <a
                  className={c.id === characterId ? 'char-tile is-selected' : 'char-tile'}
                  href={`#character-${c.id}`}
                  style={{ '--el': ELEMENT_BY_ID[c.element].color }}
                  aria-current={c.id === characterId ? 'true' : undefined}
                >
                  <span className="char-tile__art">
                    <ArcBackdrop arcType={c.arcType} />
                    <img
                      src={`${BASE}characters/${c.id}.webp`}
                      srcSet={`${BASE}characters/${c.id}.webp 256w, ${BASE}characters/hd/${c.id}.webp 512w`}
                      sizes="(max-width: 600px) 45vw, 170px"
                      alt=""
                      loading="lazy"
                    />
                    {c.upcoming && <span className="char-tile__tag">Upcoming</span>}
                  </span>
                  {/* Name and roles on the left; rank above element on the right */}
                  <span className="char-tile__info">
                    <span className="char-tile__name">{c.name}</span>
                    <span className="char-tile__rank"><RankBadge rank={c.rarity} size={20} /></span>
                    <span className="char-tile__roles"><RoleList roles={c.roles} size={13} separator={false} /></span>
                    <span className="char-tile__el"><ElementGlyph element={c.element} size={26} symbol title={ELEMENT_BY_ID[c.element].name} /></span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {rows.length === 0 && <p className="empty">No characters match these filters.</p>}
        </>
      )}

      {view === 'list' && (
      <div className="table-wrap">
        <table className="index-table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  className={col.numeric ? 'num' : undefined}
                  aria-sort={sort.id === col.id ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}
                >
                  <button className="th-btn" onClick={() => toggleSort(col.id)}>
                    {col.label}
                    <span className="th-arrow" aria-hidden="true">
                      {sort.id === col.id ? (sort.dir === 1 ? '▲' : '▼') : ''}
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className={c.id === characterId ? 'is-selected' : undefined}>
                <td>
                  <a className="row-link" href={`#character-${c.id}`}>
                    <Portrait character={c} size="sm" />
                    <span>{c.name}</span>
                    {c.upcoming && <span className="card__tag">Upcoming</span>}
                  </a>
                </td>
                <td className="cell-meta-el">
                  <span className="cell-el">
                    <ElementGlyph element={c.element} size={13} />
                    {ELEMENT_BY_ID[c.element].name}
                  </span>
                </td>
                <td className="cell-meta-rank"><RankBadge rank={c.rarity} size={22} /></td>
                <td className="cell-meta-roles"><RoleList roles={c.roles} size={14} /></td>
                <td className="cell-meta-arc">{c.arcType ? <span className="cell-el"><ArcTypeIcon type={c.arcType} size={16} />{c.arcType}</span> : '—'}</td>
                {COLUMNS.filter((col) => col.endgame).map((col) => (
                  <td key={col.id} className="num cell-stat" data-label={col.label}>
                    {ENDGAME[c.id]?.endgame[col.endgame]?.replace(/%?\s*~\s*/, '–') ?? '—'}
                  </td>
                ))}
                <td className={`small cell-other${otherStats(c) ? '' : ' is-empty'}`}>{otherStats(c) || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="empty">No characters match these filters.</p>}
      </div>
      )}
      <p className="muted small">
        Recommended endgame stats, tuned for each character’s signature Arc. Elem. DMG is the character’s own element. “—” means not published yet.
      </p>
    </div>
  );
}
