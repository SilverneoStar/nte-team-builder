// "Stats to focus on", shown until a character's in-game Level 80 stats are confirmed.
import { ELEMENT_BY_ID } from '../data/elements.js';
import { ENDGAME, parsePriority } from '../data/endgame.js';

// Shown in place of Level 80 stats until the in-game values are added:
// the stats worth chasing, best first, from the build guides' priorities.
function focusList(c) {
  const e = ENDGAME[c.id];
  const el = `${ELEMENT_BY_ID[c.element].name} DMG`;
  if (!e) {
    if (c.roles[0] === 'Survival') return [['HP%'], ['DEF%'], ['Healing%']];
    if (c.roles[0] === 'Buff') return [['ATK%'], ['CRIT Rate', 'CRIT DMG'], ['Energy']];
    return [['CRIT Rate', 'CRIT DMG'], ['ATK%'], [el]];
  }
  // Sub stats first (what you roll for), then any main stat they don't cover.
  const seen = new Set();
  const out = [];
  for (const g of [...parsePriority(e.subs), ...parsePriority(e.main)]) {
    const left = g.filter((s) => !seen.has(s) && s !== 'ATK' && s !== 'HP' && s !== 'DEF');
    left.forEach((s) => seen.add(s));
    if (left.length) out.push(left);
  }
  return out.slice(0, 5);
}

export default function FocusStats({ character: c }) {
  const list = focusList(c);
  return (
    <section className="focus-stats" aria-labelledby="focus-title">
      <h3 id="focus-title" className="mini-title">
        Stats to focus on
      </h3>
      <ol className="focus-stats__list" data-el={c.element}>
        {list.map((g, i) => (
          <li key={i}>
            <span className="focus-stats__n">{i + 1}</span>
            {g.join(' = ')}
          </li>
        ))}
      </ol>
      <p className="muted small">Best first. Level 80 stats will be added once the in-game values are in.</p>
    </section>
  );
}
