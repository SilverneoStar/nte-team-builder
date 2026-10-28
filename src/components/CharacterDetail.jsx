// One character's page: header, Overview / Stats / Awakenings / Skills / Bond / Materials / My build, and the Export card button.
import { ELEMENTS, ELEMENT_BY_ID, PAIR_REACTIONS, TRIO_REACTIONS } from '../data/elements.js';
import { PRESETS } from '../data/presets.js';
import { CHARACTER_BY_ID } from '../data/characters.js';
import { ARCS, ARC_BY_ID, RECOMMENDED } from '../data/arcs.js';
import { CARTRIDGE_BY_ID, cartridgesFor } from '../data/gear.js';
import CartridgeIcon from './CartridgeIcon.jsx';
import MaxStats from './MaxStats.jsx';
import EndgameStats from './EndgameStats.jsx';
import FocusStats from './FocusStats.jsx';
import ArcTypeIcon from './ArcTypeIcon.jsx';
import { confirmedStats } from '../data/maxStats.js';
import ElementGlyph from './ElementGlyph.jsx';
import Portrait from './Portrait.jsx';
import { ZERO_LOOKS, setZeroLook, useZeroLook } from '../lib/portraits.js';
import AscensionPlanner from './AscensionPlanner.jsx';
import BuildTotals from './BuildTotals.jsx';
import { ascensionCost } from '../data/ascension.js';
import SkillsSection from './SkillsSection.jsx';
import BondSection from './BondSection.jsx';
import { AWAKENINGS, RESONANCES } from '../data/awakenings.js';
import { AWAKENING_ORDER, ORDINAL } from '../data/awakeningOrder.js';
import RoleList from './RoleList.jsx';
import TagIcon from './TagIcon.jsx';
import { useState } from 'react';
import ExportDialog from './ExportDialog.jsx';
import { CHARACTER_CARDS } from '../lib/exportSettings.js';
import { CHARACTER_CONSOLE } from '../data/console.js';
import { bestBuild } from '../data/bestBuild.js';
import MyBuildEditor, { myBuildCurrent } from './MyBuildEditor.jsx';
import { farmList } from '../data/farmList.js';
import StatText from './StatText.jsx';
import SwipeTabs from './SwipeTabs.jsx';
import FeaturedTeams from './FeaturedTeams.jsx';
import { PHONE, useMedia } from '../lib/useMedia.js';
import ExportIcon from './ExportIcon.jsx';

export default function CharacterDetail({ character: c, activeTeam, inActiveTeam, teamFull, onAdd, onClose }) {
  const [sharing, setSharing] = useState(false);
  const element = ELEMENT_BY_ID[c.element];
  const index = ELEMENTS.findIndex((e) => e.id === c.element);
  const neighbours = [ELEMENTS[(index + 5) % 6], ELEMENTS[(index + 1) % 6]];
  const reactions = PAIR_REACTIONS.filter((r) => r.elements.includes(c.element));
  const trios = TRIO_REACTIONS.filter((r) => r.elements.includes(c.element));
  // Community teams first, then this site's kit-based ideas.
  const presets = PRESETS.filter((p) => p.members.includes(c.id)).sort((a, b) => Number(!!a.idea) - Number(!!b.idea));
  const signature = ARCS.find((a) => a.signature === c.id);
  const arcCount = ARCS.filter((a) => a.type === c.arcType).length;
  const phone = useMedia(PHONE);
  // Cards the Export card button offers, in picker order.
  const cardTypes = [
    CHARACTER_CONSOLE[c.id] && CHARACTER_CARDS.build,
    farmList(c.id) && CHARACTER_CARDS.farming,
    CHARACTER_CONSOLE[c.id] && CHARACTER_CARDS.guide,
    presets.length > 0 && CHARACTER_CARDS.teams,
  ].filter(Boolean);

  // Page sections: stacked on wider screens, swipeable slides on phones.
  const overview = (
    <div className="detail__main">
      <dl className="facts">
        <div>
          <dt>Arc type</dt>
          <dd>
            {c.arcType ? (
              <>
                <ArcTypeIcon type={c.arcType} size={18} />
                {c.arcType}{' '}
                <a className="muted" href={`#arcs-${c.arcType.toLowerCase()}`}>
                  · {arcCount} Arcs
                </a>
              </>
            ) : (
              <span className="muted">Not announced yet</span>
            )}
          </dd>
        </div>
        {signature && (
          <div>
            <dt>Signature Arc</dt>
            <dd>{signature.name}</dd>
          </div>
        )}
        {RECOMMENDED[c.id]?.length > 0 && (
          <div>
            <dt>Recommended Arcs</dt>
            <dd>
              {RECOMMENDED[c.id]
                .filter((id) => ARC_BY_ID[id].signature !== c.id)
                .map((id) => ARC_BY_ID[id].name)
                .join(', ')}
            </dd>
          </div>
        )}
        <div>
          <dt>Faction</dt>
          <dd>
            {c.faction ?? (c.formerFaction ? '' : '—')}
            {c.unit && <span className="muted"> · {c.unit}</span>}
            {c.formerFaction && (
              <span className="former">
                {c.faction && ' '}
                <span className="former__tag">Former</span> {c.formerFaction}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt>Esper ability</dt>
          <dd>{c.ability ?? '—'}</dd>
        </div>
        <div>
          <dt>Recommended Cartridges</dt>
          <dd className="cart-list">
            {cartridgesFor(c).length === 0 && <span className="muted">Not known yet</span>}
            {cartridgesFor(c).map((id) => (
              <span key={id} className="cart-list__item">
                <CartridgeIcon id={id} size={22} />
                {CARTRIDGE_BY_ID[id].name}
              </span>
            ))}
          </dd>
        </div>
        {c.upcoming && (
          <div>
            <dt>Status</dt>
            <dd>Upcoming</dd>
          </div>
        )}
        {c.banner && (
          <div>
            <dt>Limited board</dt>
            <dd>
              {c.banner.name}{' '}
              <span className="muted">
                · {c.banner.from} – {c.banner.to} (UTC+8)
              </span>
            </dd>
          </div>
        )}
      </dl>

      <section className="detail__reacts">
        <h3 className="mini-title">Reacts with</h3>
        <p className="muted small">
          {c.element === 'unknown'
            ? 'Element not announced yet, so reactions are unknown.'
            : `${element.name} sits between ${neighbours[0].name} and ${neighbours[1].name} on the Esper Cycle.`}
        </p>
        <ul className="detail__reactions">
          {reactions.map((r) => {
            const other = r.elements.find((e) => e !== c.element);
            return (
              <li key={r.id}>
                <ElementGlyph element={other} size={14} />
                <b>{r.name}</b>
                <span className="muted">with {ELEMENT_BY_ID[other].name}</span>
              </li>
            );
          })}
          {trios.map((t) => (
            <li key={t.id}>
              <span className="trio-dots">
                {t.elements.map((e) => (
                  <ElementGlyph key={e} element={e} size={11} />
                ))}
              </span>
              <b>{t.name}</b>
              <span className="muted">trio</span>
            </li>
          ))}
        </ul>
      </section>

      {presets.length > 0 && (
        <section>
          <div className="featured-head">
            <h3 className="mini-title">Featured in</h3>
          </div>
          <FeaturedTeams presets={presets} />
        </section>
      )}
    </div>
  );
  // Upcoming characters: everything shown may still change before release.
  const upcomingNote = c.upcoming ? (
    <p className="upcoming-note">
      <span className="upcoming-note__tag">Subject to change</span>
      {c.name} isn’t out yet. Details here come from announcements and may change at release; builds are early picks from the role tags.
    </p>
  ) : null;
  const stats = (
    <div className="stats">
      {phone && upcomingNote}
      {/* Only real in-game values; until then, the stats to chase. */}
      {confirmedStats(c.id) ? <MaxStats stats={confirmedStats(c.id)} /> : <FocusStats character={c} />}
      <EndgameStats character={c} />
    </div>
  );
  const awakenings = (
    <section>
      {upcomingNote}
      <h3 className="mini-title">Awakenings</h3>
      {AWAKENINGS[c.id] ? (
        <>
          {AWAKENING_ORDER[c.id] && (
            <div className="awaken-order" data-el={c.element}>
              <p className="awaken-order__title">
                Suggested unlock order <span>one per duplicate</span>
              </p>
              <ol className="awaken-chain" aria-label="Unlock order">
                {AWAKENING_ORDER[c.id].order.map((id, i) => (
                  <li key={id} title={`${ORDINAL[i]} duplicate`}>
                    {i > 0 && (
                      <span className="awaken-chain__arrow" aria-hidden="true">
                        →
                      </span>
                    )}
                    <span className={`awaken-chain__id${i === 0 ? ' is-first' : ''}`}>{id}</span>
                  </li>
                ))}
              </ol>
              {AWAKENING_ORDER[c.id].alt && <p className="muted small">{AWAKENING_ORDER[c.id].alt}</p>}
            </div>
          )}
          <ol className="awaken-list">
            {AWAKENINGS[c.id].map((w) => (
              <li key={w.id}>
                <span className="awaken-id">{w.id}</span>
                <span className="awaken-body">
                  <b>
                    {w.name}
                    {AWAKENING_ORDER[c.id]?.order.includes(w.id) && (
                      <span className="awaken-rank">{ORDINAL[AWAKENING_ORDER[c.id].order.indexOf(w.id)]} pick</span>
                    )}
                  </b>
                  <span>
                    <StatText>{w.effect}</StatText>
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <p className="muted small">Each duplicate unlocks one awakening of your choice, in any order.</p>
          {RESONANCES[c.id] && (
            <>
              <h3 className="mini-title reso-title">Resonance</h3>
              <ol className="awaken-list reso-list">
                {RESONANCES[c.id].map((r) => (
                  <li key={r.id}>
                    <span className="reso__dot is-on is-static">{r.id}</span>
                    <span className="awaken-body">
                      <b>{r.name}</b>
                      <span>
                        <StatText>{r.effect}</StatText>
                      </span>
                      <span className="reso-when">Active with {r.at} awakenings on</span>
                    </span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </>
      ) : (
        <p className="muted small">Awakenings will be added once they’re published.</p>
      )}
    </section>
  );
  const skills = (
    <>
      {upcomingNote}
      <SkillsSection key={`skills-${c.id}`} character={c} />
    </>
  );
  const bondTab = (
    <>
      {upcomingNote}
      <BondSection character={c} />
    </>
  );
  const materials = (
    <>
      {upcomingNote}
      {ascensionCost(c.id) ? (
        <>
          <AscensionPlanner key={c.id} character={c} />
          <BuildTotals key={`totals-${c.id}`} character={c} />
        </>
      ) : (
        <section>
          <h3 className="mini-title">Materials</h3>
          <p className="muted small">
            {c.upcoming
              ? `${c.name}’s ascension and skill materials haven’t been announced yet. They’ll be added once confirmed.`
              : 'Materials will be added once they’re published.'}
          </p>
        </section>
      )}
    </>
  );
  const myBuild = CHARACTER_CONSOLE[c.id] ? (
    <>
      {phone && upcomingNote}
      <MyBuildEditor character={c} activeTeam={activeTeam} onShare={(b) => setSharing({ mine: b })} />
    </>
  ) : null;

  return (
    <article className="detail" style={{ '--el': element.color }} aria-labelledby="detail-name">
      <header className="detail__head">
        <Portrait character={c} size="xl" backdrop />
        <div className="detail__title">
          <p className="eyebrow">
            <span className="eyebrow__meta">
              <ElementGlyph element={c.element} size={16} />
              <span>
                {element.name} ·{' '}
                <span className="nowrap">{c.rarity === '?' ? 'Rank unconfirmed' : `${c.rarity}-rank`}</span>
              </span>
            </span>
            {c.version && <span className="eyebrow__ver">Ver {c.version}</span>}
            <RoleList roles={c.roles} size={14} />
          </p>
          <h2 id="detail-name" className="detail__name">
            {c.name}
          </h2>
          {c.tags?.length > 0 && (
            <ul className="tags">
              {c.tags.map((t) => (
                <li key={t}>
                  <TagIcon tag={t} size={15} />
                  {t}
                </li>
              ))}
            </ul>
          )}
          {c.id === 'zero' && <ZeroLookPick />}
        </div>
        <div className="detail__head-actions">
          {cardTypes.length > 0 && (
            <button
              type="button"
              className="btn btn--quiet detail__export"
              onClick={() => setSharing({ card: true })}
              title="Export a card image"
              aria-label={`Export a ${c.name} card image`}
            >
              <ExportIcon size={18} />
              <span className="detail__export-label">Export card</span>
            </button>
          )}
          <button className="btn btn--quiet detail__close" onClick={onClose} aria-label="Close details">
            ×
          </button>
        </div>
      </header>

      {phone ? (
        <SwipeTabs
          key={c.id}
          label={`${c.name} details`}
          slides={[
            { id: 'overview', label: 'Overview', content: overview },
            { id: 'stats', label: 'Stats', content: stats },
            { id: 'awakenings', label: 'Awakenings', content: awakenings },
            { id: 'skills', label: 'Skills', content: skills },
            { id: 'bond', label: 'Bond', content: bondTab },
            { id: 'materials', label: 'Materials', content: materials },
            myBuild && { id: 'build', label: 'My build', content: myBuild },
          ].filter(Boolean)}
        />
      ) : (
        <>
          <div className="detail__grid">
            {overview}
            {stats}
          </div>
          {awakenings}
          {skills}
          {bondTab}
          {materials}
          {myBuild}
        </>
      )}

      <div className="detail__actions">
        <button className="btn btn--primary" onClick={onAdd} disabled={inActiveTeam || teamFull}>
          {inActiveTeam ? 'Already in current team' : teamFull ? 'Current team is full' : 'Add to current team'}
        </button>
      </div>
      {sharing?.card && (
        <ExportDialog
          name={c.name}
          types={cardTypes}
          typeKey="nte-character-card-type"
          onClose={() => setSharing(false)}
          render={async (opts) => {
            // Card drawing code loads only when a card is exported.
            if (opts.type === 'guide') return (await import('../lib/guideCard.js')).renderGuideCard(c, opts);
            if (opts.type === 'teams') return (await import('../lib/characterCard.js')).renderCharacterCard(c, opts);
            if (opts.type === 'farming') return (await import('../lib/farmCard.js')).renderFarmCard(c, opts);
            const best = bestBuild(c);
            const { characterBuild, renderBuildCard } = await import('../lib/buildCard.js');
            return renderBuildCard(
              characterBuild(c, {
                current: best,
                source: c.upcoming ? 'Early build · pre-release' : 'Recommended build',
                recStats: best?.cartStats,
              }),
              opts,
            );
          }}
        />
      )}
      {sharing?.mine && (
        <ExportDialog
          title="My build image"
          name={c.name}
          suffix="my-nte-build"
          formats
          onClose={() => setSharing(false)}
          render={async (opts) => {
            const mine = myBuildCurrent(sharing.mine);
            const { characterBuild, renderBuildCard } = await import('../lib/buildCard.js');
            return renderBuildCard(
              characterBuild(c, { current: mine, source: 'My build', recStats: mine.cartStats }),
              opts,
            );
          }}
        />
      )}
    </article>
  );
}

// Esper Zero: choose which form the site and cards show.
function ZeroLookPick() {
  const look = useZeroLook();
  return (
    <div className="zero-pick" role="radiogroup" aria-label="Esper Zero portrait">
      <span className="zero-pick__label">Show</span>
      {ZERO_LOOKS.map((l) => (
        <button
          key={l.id}
          type="button"
          role="radio"
          aria-checked={look === l.id}
          className={`zero-pick__opt${look === l.id ? ' is-on' : ''}`}
          onClick={() => setZeroLook(l.id)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
