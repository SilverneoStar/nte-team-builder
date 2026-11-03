// The community sheet's take on a build, shown as an alternative beside ours:
// awakening order, Arcs ranked by team damage, Cartridge sets and stat order.
// Credited with the other references (see SkillIconCredit).
import { ARC_BY_ID } from '../data/arcs.js';
import { CARTRIDGE_BY_ID } from '../data/gear.js';
import { COMMUNITY_BUILDS } from '../data/communityBuilds.js';
import AwakenChip from './AwakenChip.jsx';
import CartridgeIcon from './CartridgeIcon.jsx';

/** Just the community awakening order, as one chain. */
export function CommunityAwaken({ character: c, nested = false }) {
  const b = COMMUNITY_BUILDS[c.id];
  if (!b?.awaken) return null;
  return (
    <div className="alt-block">
      <p className="alt-block__title">
        {nested ? 'Awakening order' : 'Community alternative'} {!nested && <span>awakening order</span>}
      </p>
      <ol className="awaken-chain" aria-label="Community awakening order">
        {b.awaken.map((id, i) => (
          <li key={id}>
            {i > 0 && (
              <span className="awaken-chain__arrow" aria-hidden="true">
                →
              </span>
            )}
            <AwakenChip character={c.id} id={id} first={i === 0} />
          </li>
        ))}
      </ol>
      {b.note && <p className="muted small">{b.note}</p>}
    </div>
  );
}

export default function CommunityAlt({ character: c }) {
  const b = COMMUNITY_BUILDS[c.id];
  if (!b) return null;
  const arcs = b.arcs.filter(([id]) => ARC_BY_ID[id]);
  return (
    <section className="alt-block" aria-label="Community alternative build">
      <p className="alt-block__title">
        Community alternative <span>team DMG vs the signature Arc</span>
      </p>
      {arcs.length > 0 && (
        <ol className="alt-arcs">
          {arcs.map(([id, pct]) => (
            <li key={id}>
              <a href={`#arc-${id}`}>{ARC_BY_ID[id].name}</a>
              <span className={`alt-arcs__pct${pct == null ? ' is-unknown' : ''}`}>
                {pct == null ? 'not rated' : `${pct}%`}
              </span>
            </li>
          ))}
        </ol>
      )}
      <dl className="alt-dl">
        <div>
          <dt>Cartridge</dt>
          <dd>
            {b.carts.map((id, i) => (
              <span key={id} className="alt-cart">
                {i > 0 && <span className="muted"> › </span>}
                <CartridgeIcon id={id} size={18} />
                {CARTRIDGE_BY_ID[id]?.name}
              </span>
            ))}
          </dd>
        </div>
        <div>
          <dt>Main</dt>
          <dd>{b.main}</dd>
        </div>
        <div>
          <dt>Subs</dt>
          <dd>{b.sub}</dd>
        </div>
      </dl>
      <CommunityAwaken character={c} nested />
    </section>
  );
}
