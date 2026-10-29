// An Esper's Teammates tab: good partners grouped by reason (often teamed
// with, each reaction partner, Instant Cycle starters, same faction), a few
// each with "show more" for the rest. Strongest examples first.
import { useState } from 'react';
import { CHARACTERS } from '../data/characters.js';
import { ELEMENT_BY_ID, PAIR_REACTIONS } from '../data/elements.js';
import { PRESETS } from '../data/presets.js';
import ElementGlyph from './ElementGlyph.jsx';
import Portrait from './Portrait.jsx';

const SHOW = 4;

// How often each character appears in the featured teams, overall and next to another.
const USAGE = {};
const PAIRS = {};
for (const p of PRESETS) {
  for (const id of p.members) {
    USAGE[id] = (USAGE[id] ?? 0) + 1;
    for (const o of p.members) {
      if (o === id) continue;
      PAIRS[id] ??= {};
      PAIRS[id][o] = (PAIRS[id][o] ?? 0) + 1;
    }
  }
}

export default function Teammates({ character: c }) {
  const pairs = PAIRS[c.id] ?? {};
  const score = (x) => (pairs[x.id] ?? 0) * 100 + (USAGE[x.id] ?? 0) + (x.upcoming ? -1000 : 0);
  const byScore = (list) => [...list].sort((x, y) => score(y) - score(x) || x.name.localeCompare(y.name));
  const others = CHARACTERS.filter((x) => x.id !== c.id && x.element !== 'unknown');

  const often = byScore(others.filter((x) => pairs[x.id]));
  const reactions = PAIR_REACTIONS.filter((r) => r.elements.includes(c.element)).map((r) => {
    const el = r.elements.find((e) => e !== c.element);
    return { r, el, list: byScore(others.filter((x) => x.element === el)) };
  });
  const instant = c.tags?.includes('Instant Cycle')
    ? []
    : byScore(others.filter((x) => x.tags?.includes('Instant Cycle')));
  const faction = c.faction ? byScore(others.filter((x) => x.faction === c.faction)) : [];
  const unit = c.unit ? faction.filter((x) => x.unit === c.unit) : [];

  return (
    <section className="mates">
      <h3 className="mini-title">Teammates</h3>
      {c.element === 'unknown' ? (
        <p className="muted small">{c.name}’s element isn’t announced yet, so reaction partners are unknown.</p>
      ) : (
        <p className="muted small">
          Reactions need neighbouring elements on the Esper Cycle; a team with three neighbours in a row also gets a
          trio bonus.
        </p>
      )}
      <Group title="Often teamed with" note="From the featured teams." list={often} counts={pairs} />
      {reactions.map(({ r, el, list }) => (
        <Group
          key={r.id}
          title={
            <>
              {r.name} <span className="mates__with">with</span> <ElementGlyph element={el} size={13} />{' '}
              {ELEMENT_BY_ID[el].name}
            </>
          }
          note={r.effect}
          list={list}
          counts={pairs}
        />
      ))}
      <Group
        title="Instant Cycle starters"
        note="They trigger the Esper Cycle at once, so reactions start sooner."
        list={instant}
        counts={pairs}
      />
      {unit.length > 0 && <Group title={`Same squad · ${c.unit}`} list={unit} counts={pairs} />}
      <Group title={`Same faction · ${c.faction}`} list={faction.filter((x) => !unit.includes(x))} counts={pairs} />
    </section>
  );
}

function Group({ title, note, list, counts }) {
  const [open, setOpen] = useState(false);
  if (!list.length) return null;
  const shown = open ? list : list.slice(0, SHOW);
  return (
    <div className="mates__group">
      <h4 className="micro-title">{title}</h4>
      {note && <p className="muted small mates__note">{note}</p>}
      <ul className="mini-chars">
        {shown.map((x) => (
          <li key={x.id}>
            <a href={`#character-${x.id}`} title={x.name} className={`mini-char${counts[x.id] ? ' is-paired' : ''}`}>
              <Portrait character={x} size="sm" />
              <span>{x.name}</span>
              {counts[x.id] > 0 && (
                <span className="fit-tag" title="Featured teams together">
                  ×{counts[x.id]}
                </span>
              )}
            </a>
          </li>
        ))}
        {list.length > SHOW && (
          <li>
            <button className="mini-char mates__more" onClick={() => setOpen(!open)} aria-expanded={open}>
              {open ? 'Show fewer' : `+${list.length - SHOW} more`}
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
