// An Esper's Build tab (recommended Arcs, Cartridge sets, stats, Console and
// awakening order, with a button to equip it all) and Teams tab (featured
// teams, each loadable into the team builder with everyone's recommended kit).
import { useState } from 'react';
import { ARCS, ARC_BY_ID, RECOMMENDED, arcAccess, freeArcs } from '../data/arcs.js';
import { CARTRIDGE_BY_ID, cartridgesFor } from '../data/gear.js';
import { CHARACTER_CONSOLE, SHAPES } from '../data/console.js';
import { CHARACTER_BY_ID } from '../data/characters.js';
import { PRESETS, presetLoadouts } from '../data/presets.js';
import { AWAKENING_ORDER } from '../data/awakeningOrder.js';
import { bestBuild } from '../data/bestBuild.js';
import { analyzeTeam } from '../lib/analyze.js';
import ArcPlayer from './ArcPlayer.jsx';
import CartridgeIcon from './CartridgeIcon.jsx';
import ElementGlyph from './ElementGlyph.jsx';
import Portrait from './Portrait.jsx';
import RankBadge from './RankBadge.jsx';
import StatText from './StatText.jsx';

const ACCESS = { limited: 'Limited', paid: 'Paid', pass: 'Battle pass', free: 'F2P', banner: 'Arc banners' };
const ROMAN = { 2: 'II', 3: 'III', 4: 'IV' };

/** Arcs to show, best first: signature, then the guides' picks. */
export function arcPicks(c) {
  const sig = ARCS.find((a) => a.signature === c.id);
  const ids = [...new Set([sig?.id, ...(RECOMMENDED[c.id] ?? [])])].filter(Boolean);
  return ids.map((id) => ARC_BY_ID[id]).filter(Boolean);
}

export function CharacterBuild({ character: c, inActiveTeam, onApply }) {
  const [done, setDone] = useState(false);
  const best = bestBuild(c);
  const free = freeArcs(c.id);
  // Free picks show in their own list, so the main list skips them (unless it's the signature).
  const arcs = arcPicks(c).filter((a) => a.signature === c.id || !free.some((f) => f.id === a.id));
  const carts = cartridgesFor(c);
  const info = CHARACTER_CONSOLE[c.id];
  const order = AWAKENING_ORDER[c.id]?.order;
  if (!best && !arcs.length && !carts.length) {
    return (
      <section className="build">
        <h3 className="mini-title">Recommended build</h3>
        <p className="muted small">A build will be added once {c.name}’s kit is out.</p>
      </section>
    );
  }
  // Modules in the suggested Console layout, counted by shape.
  const shapes = new Map();
  for (const p of best?.pieces ?? []) shapes.set(p.shape, (shapes.get(p.shape) ?? 0) + 1);

  return (
    <section className="build">
      <h3 className="mini-title">Recommended build</h3>

      {arcs.length > 0 && (
        <>
          <h4 className="micro-title">Arcs · best first</h4>
          <ol className="build__arcs">
            {arcs.map((a) => (
              <li key={a.id}>
                <ArcRow arc={a} character={c} />
              </li>
            ))}
          </ol>
        </>
      )}

      {free.length > 0 && (
        <>
          <h4 className="micro-title">Free alternatives · no banners or pass</h4>
          <ul className="build__arcs">
            {free.map((a) => (
              <li key={a.id}>
                <ArcRow arc={a} character={c} free />
              </li>
            ))}
          </ul>
        </>
      )}

      {carts.length > 0 && (
        <>
          <h4 className="micro-title">Cartridge sets</h4>
          <ul className="build__carts">
            {carts.map((id, i) => {
              const cart = CARTRIDGE_BY_ID[id];
              return (
                <li key={id}>
                  <CartridgeIcon id={id} size={32} />
                  <span className="build__cart-body">
                    <b>
                      {cart.name}
                      {i === 0 && <span className="fit-tag fit-tag--kit">Best</span>}
                    </b>
                    <span>
                      <span className="build__pc">2pc</span> <StatText>{cart.two}</StatText>
                    </span>
                    <span>
                      <span className="build__pc">4pc</span> <StatText>{cart.four}</StatText>
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {best && (
        <>
          <h4 className="micro-title">Cartridge stats</h4>
          <dl className="build__stats">
            <div>
              <dt>Main</dt>
              <dd>{best.cartStats.main.stat}</dd>
            </div>
            <div className="build__subs">
              <dt>Subs</dt>
              <dd>{best.cartStats.subs.map((s) => s.stat).join(' › ')}</dd>
            </div>
          </dl>
          {best.notes.map((n) => (
            <p key={n} className="muted small">
              {n}
            </p>
          ))}
        </>
      )}

      {info && best && (
        <>
          <h4 className="micro-title">Console</h4>
          <p className="small">
            <StatText>{`${info.spec.stat} +${info.spec.value}% per Type ${ROMAN[info.spec.type]} module.`}</StatText>{' '}
            <span className="muted">
              Suggested layout: {CARTRIDGE_BY_ID[best.cartridge]?.name} ×4 with{' '}
              {[...shapes]
                .map(([shape, n]) => `${n} Type ${ROMAN[SHAPES[shape].type]} (${SHAPES[shape].label.toLowerCase()})`)
                .join(', ')}
              .
            </span>
          </p>
        </>
      )}

      {order && (
        <>
          <h4 className="micro-title">Awakening order · one per duplicate</h4>
          <ol className="awaken-chain build__awaken" aria-label="Unlock order">
            {order.map((id, i) => (
              <li key={id}>
                {i > 0 && (
                  <span className="awaken-chain__arrow" aria-hidden="true">
                    →
                  </span>
                )}
                <span className={`awaken-chain__id${i === 0 ? ' is-first' : ''}`}>{id}</span>
              </li>
            ))}
          </ol>
        </>
      )}

      {best && (
        <div className="build__actions">
          <button
            className="btn"
            onClick={() => {
              onApply(c.id, {
                arc: best.arc,
                arcDupes: 0,
                cartridge: best.cartridge,
                cartStats: best.cartStats,
                console: best.pieces,
              });
              setDone(true);
            }}
            disabled={!inActiveTeam}
          >
            Equip on {c.name} in current team
          </button>
          <a className="btn btn--quiet" href={`#console-${c.id}`}>
            Open in Console
          </a>
          {!inActiveTeam && <span className="muted small">Add {c.name} to the current team first.</span>}
          {inActiveTeam && done && (
            <span className="muted small" role="status">
              Equipped: the top Arc, Cartridge set, stats and Console layout.
            </span>
          )}
        </div>
      )}
    </section>
  );
}

// One Arc as a linked row: art, name, rank, tags and stats.
function ArcRow({ arc: a, character: c, free = false }) {
  return (
    <a className={`arc-row${a.signature === c.id ? ' arc-row--sig' : ''}${free ? ' arc-row--free' : ''}`} href={`#arc-${a.id}`}>
      <span className="arc-row__art">
        <ArcPlayer arc={a} />
      </span>
      <span className="arc-row__name">{a.name}</span>
      <RankBadge rank={a.rarity} size={18} />
      <span className="arc-row__tags">
        {a.signature === c.id && <span className="fit-tag fit-tag--kit">Signature</span>}
        {free ? (
          <span className="fit-tag fit-tag--free">Free {a.rarity}-rank pick</span>
        ) : (
          arcAccess(a.id) && <span className="fit-tag">{ACCESS[arcAccess(a.id)]}</span>
        )}
        <span className="muted small">
          ATK {a.atk} · {a.sub}
          {a.estimated ? ' (est.)' : ''}
        </span>
      </span>
    </a>
  );
}

const TEAMS_SHOWN = 4;

/** Featured teams with this character: community teams first, then kit ideas. */
export function teamsWith(id) {
  return PRESETS.filter((p) => p.members.includes(id)).sort((a, b) => Number(!!a.idea) - Number(!!b.idea));
}

export function CharacterTeams({ character: c, onLoadTeam }) {
  const [all, setAll] = useState(false);
  const teams = teamsWith(c.id);
  if (!teams.length) {
    return (
      <section className="build">
        <h3 className="mini-title">Teams</h3>
        <p className="muted small">No featured teams with {c.name} yet.</p>
      </section>
    );
  }
  return (
    <section className="build">
      <h3 className="mini-title">Teams</h3>
      <p className="muted small">
        Load a team to add it to your teams, with each member’s recommended Arc, Cartridge set and Console equipped.
      </p>
      <ul className="best-teams">
        {(all ? teams : teams.slice(0, TEAMS_SHOWN)).map((p, i) => {
          const an = analyzeTeam(p.members);
          return (
            <li key={p.name} className="best-team">
              <span className="best-team__n">{i + 1}</span>
              <span className="best-team__title">
                <b>{p.name}</b>
                {p.idea && <span className="idea-tag">Kit idea</span>}
              </span>
              <span className="best-team__members">
                {p.members.map((id) => {
                  const m = CHARACTER_BY_ID[id];
                  return (
                    <a key={id} href={`#character-${id}`} className="best-team__member" title={m.name}>
                      <Portrait character={m} size="sm" />
                      <span>{m.name}</span>
                    </a>
                  );
                })}
              </span>
              <span className="best-team__meta">
                {an.trios.map((t) => (
                  <span key={t.id} className="fit-tag fit-tag--kit">
                    {t.name} trio
                  </span>
                ))}
                {an.reactions.map((r) => (
                  <span key={r.id} className="fit-tag">
                    {r.elements.map((e) => (
                      <ElementGlyph key={e} element={e} size={11} />
                    ))}
                    {r.name}
                  </span>
                ))}
              </span>
              {p.why && <span className="muted small best-team__why">{p.why}</span>}
              <button
                className="btn btn--small best-team__load"
                onClick={() =>
                  onLoadTeam({ name: p.name, members: p.members, loadouts: presetLoadouts(p.members) })
                }
              >
                Load team
              </button>
            </li>
          );
        })}
      </ul>
      {teams.length > TEAMS_SHOWN && (
        <button
          type="button"
          className="btn btn--quiet btn--small best-teams__more"
          onClick={() => setAll(!all)}
          aria-expanded={all}
        >
          {all ? 'Show fewer teams' : `Show ${teams.length - TEAMS_SHOWN} more teams`}
        </button>
      )}
    </section>
  );
}
