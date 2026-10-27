// The Arcs page: filters, the Arc cards list and the selected Arc's details.
import { useMemo, useState } from 'react';
import { ARCS, ARC_BY_ID, FIELD_EFFECTS, RECOMMENDED } from '../data/arcs.js';
import { ARC_PASSIVES } from '../data/arcPassives.js';
import { navigate } from '../lib/route.js';
import ArcDetail from './ArcDetail.jsx';
import { ARC_TYPES, CHARACTERS, CHARACTER_BY_ID } from '../data/characters.js';
import Portrait from './Portrait.jsx';
import MoreList from './MoreList.jsx';
import RankBadge from './RankBadge.jsx';
import ArcTypeIcon from './ArcTypeIcon.jsx';
import ArcPlayer from './ArcPlayer.jsx';
import StatText from './StatText.jsx';

const RANKS = ['S', 'A', 'B'];
const RANK_ORDER = { S: 0, A: 1, B: 2 };

// Who uses each Arc: its signature character and characters it's recommended for.
const RECOMMENDED_FOR = {};
for (const [cid, ids] of Object.entries(RECOMMENDED)) {
  for (const id of ids) (RECOMMENDED_FOR[id] ||= []).push(cid);
}

export default function ArcsPage({ arcType, arcId }) {
  const selected = arcId ? ARC_BY_ID[arcId] : null;
  const type = ARC_TYPES.map((t) => t.toLowerCase()).includes(arcType)
    ? ARC_TYPES.find((t) => t.toLowerCase() === arcType)
    : 'all';
  const [rank, setRank] = useState('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(
    () => Object.fromEntries(ARC_TYPES.map((t) => [t, ARCS.filter((a) => a.type === t).length])),
    [],
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ARCS.filter(
      (a) =>
        (type === 'all' || a.type === type) &&
        (rank === 'all' || a.rarity === rank) &&
        (!q ||
          a.name.toLowerCase().includes(q) ||
          a.passive.toLowerCase().includes(q) ||
          (ARC_PASSIVES[a.id]?.text.join(' ').toLowerCase().includes(q) ?? false)),
    ).sort((a, b) => RANK_ORDER[a.rarity] - RANK_ORDER[b.rarity] || b.atk - a.atk || a.name.localeCompare(b.name));
  }, [type, rank, query]);

  const wielders = type === 'all' ? [] : CHARACTERS.filter((c) => c.arcType === type);

  return (
    <div className="page">
      <header className="page__head">
        <h2 className="page__title">Arcs</h2>
        <p className="muted">
          {ARCS.length} Arcs. A character can equip any Arc of their Arc type. Select an Arc for its materials and who
          it suits.
        </p>
      </header>

      {selected && <ArcDetail key={selected.id} arc={selected} onClose={() => navigate('arcs')} />}

      <div className="type-tabs" role="tablist" aria-label="Arc type">
        <a className="type-tab" role="tab" aria-selected={type === 'all'} href="#arcs">
          All <span>{ARCS.length}</span>
        </a>
        {ARC_TYPES.map((t) => (
          <a key={t} className="type-tab" role="tab" aria-selected={type === t} href={`#arcs-${t.toLowerCase()}`}>
            <ArcTypeIcon type={t} size={18} />
            {t} <span>{counts[t]}</span>
          </a>
        ))}
      </div>

      {type !== 'all' && (
        <div className="wielders">
          <span className="mini-title">{type} characters</span>
          <ul>
            {wielders.map((c) => (
              <li key={c.id}>
                <a href={`#character-${c.id}`} className="wielder">
                  <Portrait character={c} size="sm" />
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="filters filters--page filters--row">
        <label className="sr-only" htmlFor="arc-search">
          Search Arcs
        </label>
        <input
          id="arc-search"
          className="search search--inline"
          type="search"
          placeholder="Search name or effect"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips" role="group" aria-label="Filter by rank">
          <button className="chip" aria-pressed={rank === 'all'} onClick={() => setRank('all')}>
            Any rank
          </button>
          {RANKS.map((r) => (
            <button key={r} className="chip" aria-pressed={rank === r} onClick={() => setRank(rank === r ? 'all' : r)}>
              {r}-rank
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="empty">No Arcs match these filters.</p>
      ) : (
        <ul className="arc-grid">
          {list.map((a) => {
            const sig = a.signature && CHARACTER_BY_ID[a.signature];
            const recs = (RECOMMENDED_FOR[a.id] || [])
              .filter((id) => id !== a.signature)
              .map((id) => CHARACTER_BY_ID[id]);
            return (
              <li
                key={a.id}
                className="arc-card arc-card--link"
                data-arc-type={a.type.toLowerCase()}
                aria-current={selected?.id === a.id ? 'true' : undefined}
                onClick={(e) => {
                  if (!e.target.closest('a, button')) navigate(`arc-${a.id}`);
                }}
              >
                <div
                  className="arc-card__top"
                  style={{
                    '--arc-pattern': `url(${import.meta.env.BASE_URL}arc-patterns/${a.type.toLowerCase()}.svg)`,
                  }}
                >
                  <RankBadge rank={a.rarity} size={22} />
                  <h3 className="arc-card__name">
                    <a href={`#arc-${a.id}`}>{a.name}</a>
                  </h3>
                  {type === 'all' && (
                    <span className="arc-card__type">
                      <ArcTypeIcon type={a.type} size={16} />
                      {a.type}
                    </span>
                  )}
                </div>
                <div className="arc-card__body">
                  <ArcPlayer arc={a} />
                  <dl className="gear-stats">
                    <div>
                      <dt>Base ATK</dt>
                      <dd>{a.atk}</dd>
                    </div>
                    <div>
                      <dt>Secondary</dt>
                      <dd>{a.sub}</dd>
                    </div>
                  </dl>
                </div>
                <p className="arc-card__passive">
                  <StatText>{a.passive}</StatText>
                </p>
                {FIELD_EFFECTS[a.id] && <p className="arc-card__field">Outside combat: {FIELD_EFFECTS[a.id].name}</p>}
                {(sig || recs.length > 0) && (
                  <div className="arc-card__users">
                    {sig && (
                      <a href={`#character-${sig.id}`} className="arc-user" title={`Signature: ${sig.name}`}>
                        <span className="arc-tag arc-tag--sig">Sig</span>
                        <Portrait character={sig} size="sm" />
                        {sig.name}
                      </a>
                    )}
                    {recs.length > 0 && (
                      <span className="arc-user arc-user--recs">
                        <span className="arc-tag arc-tag--rec">Rec</span>
                        <MoreList items={recs}>
                          {(c) => (
                            <a key={c.id} href={`#character-${c.id}`} title={c.name}>
                              <Portrait character={c} size="sm" />
                            </a>
                          )}
                        </MoreList>
                      </span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p className="muted small">
        Base ATK and secondary stats at max level. Effects are summaries; check in-game text for exact values.
      </p>
    </div>
  );
}
