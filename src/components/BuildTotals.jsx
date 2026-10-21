import MaterialIcon from './MaterialIcon.jsx';
import { ARCS, ARC_BY_ID, RECOMMENDED } from '../data/arcs.js';
import { ARC_MAX_LEVEL, arcAscensionCost } from '../data/arcMaterials.js';
import { MAX_LEVEL, ascensionCost } from '../data/ascension.js';
import { skillCost } from '../data/skills.js';
import { fmt } from '../lib/format.js';

function MatList({ items }) {
  return (
    <ul className="mats">
      {items.map((m) => (
        <li key={m.name} className={`mat mat--${m.kind}`}>
          <MaterialIcon name={m.name} />
          <span className="mat__qty">{fmt(m.qty)}</span>
          <span className="mat__name">
            {m.name}
            {m.source && <span className="mat__src">{m.source}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

// Same item across several lists added up, in first-seen order.
function sumLists(lists) {
  const by = new Map();
  for (const list of lists) {
    for (const m of list ?? []) {
      const prev = by.get(m.name);
      by.set(m.name, prev ? { ...prev, qty: prev.qty + m.qty } : { ...m });
    }
  }
  // Beetle Coin last, like the other lists.
  return [...by.values()].sort((a, b) => Number(a.kind === 'coins') - Number(b.kind === 'coins'));
}

// Character Materials tab extras: their best Arc's materials, and a folded
// total of everything for a full build (Lv 80, every skill maxed, the Arc at max).
export default function BuildTotals({ character: c }) {
  const arc = ARCS.find((a) => a.signature === c.id) ?? ARC_BY_ID[(RECOMMENDED[c.id] ?? [])[0]];
  const arcCost = arc ? arcAscensionCost(arc) : null;
  const asc = ascensionCost(c.id);
  const skills = skillCost(c.id);
  const total = sumLists([asc, skills, arcCost]);

  return (
    <>
      {arcCost?.length > 0 && (
        <section className="ascend" aria-labelledby="arcmats-title">
          <div className="ascend__head">
            <h3 id="arcmats-title" className="mini-title">
              Arc materials <span>{arc.name}</span>
            </h3>
          </div>
          <MatList items={arcCost} />
          <p className="muted small">
            Lv 20 → {ARC_MAX_LEVEL} for {arc.signature === c.id ? 'their signature Arc' : 'their top recommended Arc'}. Other Arcs are on each Arc’s page.
          </p>
        </section>
      )}
      {total.length > 0 && (
        <details className="build-total">
          <summary>
            <span className="mini-title">Full build total</span>
            <span className="muted small">
              Lv {MAX_LEVEL}, every skill maxed{arcCost?.length ? `, ${arc.name} at Lv ${ARC_MAX_LEVEL}` : ''}
            </span>
          </summary>
          <MatList items={total} />
        </details>
      )}
    </>
  );
}
