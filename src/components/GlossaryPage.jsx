// The Glossary page: game terms, reactions and statuses explained, plus an
// Items section (each material with its icon, use, where to get it and who uses it).
import { useMemo, useState } from 'react';
import { ELEMENT_BY_ID, PAIR_REACTIONS, TRIO_REACTIONS } from '../data/elements.js';
import { GLOSSARY, GLOSSARY_CATEGORIES } from '../data/glossary.js';
import ElementGlyph from './ElementGlyph.jsx';
import MaterialIcon from './MaterialIcon.jsx';
import Portrait from './Portrait.jsx';
import { ITEMS, ITEM_GROUPS } from '../data/items.js';
import { CHARACTER_BY_ID } from '../data/characters.js';
import { ARC_BY_ID } from '../data/arcs.js';

// Reaction entries come straight from the game data so they never drift apart.
const REACTION_ENTRIES = [
  ...PAIR_REACTIONS.map((r) => ({
    term: r.name,
    category: 'Reactions',
    kind: r.kind,
    elements: r.elements,
    text: `${r.effect} Triggered by ${r.elements.map((e) => ELEMENT_BY_ID[e].name).join(' + ')}.`,
  })),
  ...TRIO_REACTIONS.map((r) => ({
    term: r.name,
    category: 'Reactions',
    kind: 'Trio',
    elements: r.elements,
    text: `${r.effect} Needs ${r.elements.map((e) => ELEMENT_BY_ID[e].name).join(', ')}.`,
  })),
];

const ALL = [...GLOSSARY, ...REACTION_ENTRIES];
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export default function GlossaryPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  // Items show one group at a time (searching looks through all of them).
  const [itemGroup, setItemGroup] = useState(ITEM_GROUPS[0]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = ALL.filter(
      (e) =>
        (category === 'all' || e.category === category) &&
        (!q || [e.term, e.also, e.text].some((s) => s?.toLowerCase().includes(q))),
    );
    return GLOSSARY_CATEGORIES.map((cat) => ({
      cat,
      entries: matches
        .filter((e) => e.category === cat)
        .sort((a, b) => (cat === 'Reactions' ? 0 : a.term.localeCompare(b.term))),
    })).filter((g) => g.entries.length > 0);
  }, [query, category]);

  const itemGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Under All, items only appear for a search; under Items, one group at a time.
    if (category === 'all' ? !q : category !== 'Items') return [];
    const hit = (it) => !q || [it.name, it.text, ...it.get, it.group].some((s) => s.toLowerCase().includes(q));
    return ITEM_GROUPS.filter((g) => q || g === itemGroup)
      .map((g) => ({ g, items: groupFamilies(ITEMS.filter((it) => it.group === g && hit(it))) }))
      .filter((x) => x.items.length);
  }, [query, category, itemGroup]);

  return (
    <div className="page">
      <header className="page__head">
        <h2 className="page__title">Glossary</h2>
        <p className="muted">Game terms used across NTE and this app.</p>
      </header>

      <div className="filters filters--page">
        <label className="sr-only" htmlFor="glossary-search">
          Search terms
        </label>
        <input
          id="glossary-search"
          className="search search--inline"
          type="search"
          placeholder="Search terms"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips" role="group" aria-label="Filter by category">
          <button className="chip" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>
            All
          </button>
          {[...GLOSSARY_CATEGORIES, 'Items'].map((c) => (
            <button
              key={c}
              className="chip"
              aria-pressed={category === c}
              onClick={() => setCategory(category === c ? 'all' : c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {category === 'Items' && (
        <div className="chips items-chips" role="group" aria-label="Item groups">
          {ITEM_GROUPS.map((g) => (
            <button
              key={g}
              className="chip"
              aria-pressed={!query.trim() && itemGroup === g}
              onClick={() => {
                setItemGroup(g);
                setQuery('');
              }}
            >
              {g} <span className="chip__n">{ITEMS.filter((it) => it.group === g).length}</span>
            </button>
          ))}
        </div>
      )}

      {groups.length === 0 && itemGroups.length === 0 && <p className="empty">No terms match “{query}”.</p>}

      {groups.map((g) => (
        <section key={g.cat} className="gloss-group" aria-labelledby={`g-${slug(g.cat)}`}>
          <h3 id={`g-${slug(g.cat)}`} className="gloss-group__title">
            {g.cat}
          </h3>
          <dl className="gloss">
            {g.entries.map((e) => (
              <div key={e.term} className="gloss__item">
                <dt>
                  {e.elements && (
                    <span className="gloss__els">
                      {e.elements.map((el) => (
                        <ElementGlyph key={el} element={el} size={13} />
                      ))}
                    </span>
                  )}
                  <span className="gloss__term">{e.term}</span>
                  {e.also && <span className="gloss__also">{e.also}</span>}
                  {e.kind && <span className="reaction__kind">{e.kind}</span>}
                </dt>
                <dd>
                  {e.text}
                  {e.related && <span className="gloss__related"> See also: {e.related.join(', ')}.</span>}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      {itemGroups.length > 0 && (
        <section className="gloss-group" aria-labelledby="g-items">
          <h3 id="g-items" className="gloss-group__title">
            Items
          </h3>
          <p className="muted small">What each material is for, where to get it, and which Espers and Arcs use it.</p>
          {itemGroups.map(({ g, items }) => (
            <div key={g} className="items-group">
              <h4 className="micro-title">{g}</h4>
              <ul className="items">
                {items.map((it) => (
                  <ItemCard key={it.name} item={it} />
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

const USED_SHOWN = 8;

// Items that come in tiers (1 → 3, listed in a row) share one card, like the
// ZZZ builder. The family is named by the words its tiers share, or after
// its first tier when they share none.
const words = (s) => s.split(' ');
function familyName(names) {
  const w = names.map(words);
  let suf = 0;
  while (w.every((x) => x.length > suf && x[x.length - 1 - suf] === w[0][w[0].length - 1 - suf])) suf++;
  if (suf) return w[0].slice(-suf).join(' ');
  let pre = 0;
  while (w.every((x) => x.length > pre && x[pre] === w[0][pre])) pre++;
  if (pre) return w[0].slice(0, pre).join(' ');
  return `${names[0]} family`;
}
const stripTier = (t) => t.replace(/^Tier \d /, '').replace(/^./, (c) => c.toUpperCase());

export function groupFamilies(items) {
  const out = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (it.tier !== 1) {
      out.push(it);
      continue;
    }
    const run = [it];
    while (items[i + run.length]?.tier === run.length + 1) run.push(items[i + run.length]);
    if (run.length < 2) {
      out.push(it);
      continue;
    }
    i += run.length - 1;
    const texts = run.map((m) => stripTier(m.text));
    const sameText = texts.every((t) => t === texts[0]);
    // Sources every tier shares, then the ones only some tiers have.
    const allGet = [...new Set(run.flatMap((m) => m.get))];
    const get = allGet.map((g) => {
      const tiers = run.filter((m) => m.get.includes(g)).map((m) => m.tier);
      return tiers.length === run.length ? g : `${g} (T${tiers.join(', T')})`;
    });
    const seen = new Set();
    const usedBy = run.flatMap((m) => m.usedBy).filter((u) => !seen.has(`${u.kind}${u.id}`) && seen.add(`${u.kind}${u.id}`));
    out.push({
      family: true,
      name: familyName(run.map((m) => m.name)),
      group: it.group,
      members: run.map((m, k) => ({ name: m.name, tier: m.tier, text: sameText ? null : texts[k] })),
      text: sameText ? texts[0] : null,
      note: run.find((m) => m.note)?.note ?? null,
      get,
      usedBy,
    });
  }
  return out;
}

function ItemCard({ item: it }) {
  if (it.family) return <FamilyCard item={it} />;
  const [open, setOpen] = useState(false);
  const used = open ? it.usedBy : it.usedBy.slice(0, USED_SHOWN);
  return (
    <li className={`item${it.tier ? ` item--t${it.tier}` : ''}`} id={`item-${slug(it.name)}`}>
      <span className="item__icon">
        <MaterialIcon name={it.name} size={52} />
      </span>
      <div className="item__body">
        <b className="item__name">
          {it.name}
          {it.tier && <span className="item__tier">T{it.tier}</span>}
        </b>
        <p className="item__text">{it.text}</p>
        {it.note && <p className="item__text">{it.note}</p>}
        <p className="item__label">How to get</p>
        <ul className="item__get">
          {it.get.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
        {it.usedBy.length > 0 && (
          <>
            <p className="item__label">Used by</p>
            <div className="item__used">
              {used.map((u) =>
                u.kind === 'char' ? (
                  <a key={u.id} href={`#character-${u.id}`} title={CHARACTER_BY_ID[u.id].name}>
                    <Portrait character={CHARACTER_BY_ID[u.id]} size="sm" />
                  </a>
                ) : (
                  <a key={u.id} href={`#arc-${u.id}`} className="item__arc">
                    {ARC_BY_ID[u.id].name}
                  </a>
                ),
              )}
              {it.usedBy.length > USED_SHOWN && (
                <button type="button" className="item__more" onClick={() => setOpen(!open)} aria-expanded={open}>
                  {open ? 'Show fewer' : `+${it.usedBy.length - USED_SHOWN}`}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </li>
  );
}

function UsedBy({ usedBy }) {
  const [open, setOpen] = useState(false);
  if (!usedBy.length) return null;
  const used = open ? usedBy : usedBy.slice(0, USED_SHOWN);
  return (
    <>
      <p className="item__label">Used by</p>
      <div className="item__used">
        {used.map((u) =>
          u.kind === 'char' ? (
            <a key={u.id} href={`#character-${u.id}`} title={CHARACTER_BY_ID[u.id].name}>
              <Portrait character={CHARACTER_BY_ID[u.id]} size="sm" />
            </a>
          ) : (
            <a key={u.id} href={`#arc-${u.id}`} className="item__arc">
              {ARC_BY_ID[u.id].name}
            </a>
          ),
        )}
        {usedBy.length > USED_SHOWN && (
          <button type="button" className="item__more" onClick={() => setOpen(!open)} aria-expanded={open}>
            {open ? 'Show fewer' : `+${usedBy.length - USED_SHOWN}`}
          </button>
        )}
      </div>
    </>
  );
}

function FamilyCard({ item: it }) {
  return (
    <li className="item item--family" id={`item-${slug(it.name)}`}>
      <span className="item__icons">
        {it.members.map((m) => (
          <span key={m.name} className={`item__icon item--t${m.tier}`} title={m.name} id={`item-${slug(m.name)}`}>
            <MaterialIcon name={m.name} size={42} />
          </span>
        ))}
      </span>
      <div className="item__body">
        <b className="item__name">{it.name}</b>
        <ol className="item__tiers">
          {it.members.map((m) => (
            <li key={m.name} className={`item--t${m.tier}`}>
              <span className="item__tier">T{m.tier}</span>
              <span>
                {m.name}
                {m.text && <span className="item__tier-text"> · {m.text}</span>}
              </span>
            </li>
          ))}
        </ol>
        {it.text && <p className="item__text">{it.text}</p>}
        {it.note && <p className="item__text">{it.note}</p>}
        <p className="item__label">How to get</p>
        <ul className="item__get">
          {it.get.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
        <UsedBy usedBy={it.usedBy} />
      </div>
    </li>
  );
}
