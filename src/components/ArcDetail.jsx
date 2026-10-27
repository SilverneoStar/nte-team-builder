// One Arc's page: the 2D player, stats, passive, who uses it, how to get it and its materials.
import { useState } from 'react';
import { ARC_SOURCES, FIELD_EFFECTS, RECOMMENDED } from '../data/arcs.js';
import { ARC_PASSIVES } from '../data/arcPassives.js';
import { CHARACTERS, CHARACTER_BY_ID } from '../data/characters.js';
import {
  ARC_DYES,
  ARC_MATERIAL_SOURCE,
  ARC_MAX_LEVEL,
  arcAscensionCost,
  arcAscensionTable,
} from '../data/arcMaterials.js';
import ArcPlayer from './ArcPlayer.jsx';
import ExportDialog from './ExportDialog.jsx';
import ArcTypeIcon from './ArcTypeIcon.jsx';
import MaterialIcon from './MaterialIcon.jsx';
import Portrait from './Portrait.jsx';
import MoreList from './MoreList.jsx';
import RankBadge from './RankBadge.jsx';
import StatText from './StatText.jsx';
import { fmt } from '../lib/format.js';
import SwipeTabs from './SwipeTabs.jsx';
import { PHONE, useMedia } from '../lib/useMedia.js';
import ExportIcon from './ExportIcon.jsx';

const CAPS = [20, 30, 40, 50, 60, 70, 80];

// Arcs without art yet (everything else has public/arcs/<id>.webp).
const NO_ART = new Set([]);

export default function ArcDetail({ arc: a, onClose }) {
  const [from, setFrom] = useState(20);
  const [to, setTo] = useState(ARC_MAX_LEVEL);
  const [showPhases, setShowPhases] = useState(false);
  const [sharing, setSharing] = useState(false);

  const sig = a.signature && CHARACTER_BY_ID[a.signature];
  const recs = Object.entries(RECOMMENDED)
    .filter(([cid, ids]) => ids.includes(a.id) && cid !== a.signature)
    .map(([cid]) => CHARACTER_BY_ID[cid])
    .filter(Boolean);
  const named = new Set([a.signature, ...recs.map((c) => c.id)]);
  const others = CHARACTERS.filter((c) => c.arcType === a.type && !named.has(c.id));
  const field = FIELD_EFFECTS[a.id];
  const full = ARC_PASSIVES[a.id];
  const sources = ARC_SOURCES[a.id] ?? [];
  const cost = arcAscensionCost(a, from, to);
  const table = arcAscensionTable(a);
  const phone = useMedia(PHONE);

  // Page sections: stacked on wider screens, swipeable slides on phones.
  const info = (
    <>
      <dl className="facts">
        <div>
          <dt>Base ATK</dt>
          <dd>
            {a.atk} <span className="muted">at Lv {ARC_MAX_LEVEL}</span>
          </dd>
        </div>
        <div>
          <dt>Secondary</dt>
          <dd>{a.sub}</dd>
        </div>
        {!full && (
          <div>
            <dt>Passive</dt>
            <dd>
              <StatText>{a.passive}</StatText>
            </dd>
          </div>
        )}
      </dl>

      {full && (
        <section className="arc-passive" aria-label="Passive">
          <span className="arc-passive__label">Passive · {full.name}</span>
          {full.text.map((t) => (
            <p key={t}>
              <StatText>{t}</StatText>
            </p>
          ))}
          {full.max && (
            <p className="arc-passive__max">
              <strong>Fully mixed (4 duplicates):</strong> <StatText>{full.max}</StatText>
            </p>
          )}
        </section>
      )}

      {field && (
        <aside className="arc-field">
          <span className="arc-field__label">Outside combat</span>
          <strong>{field.name}</strong>
          <p>
            <StatText>{field.text}</StatText>
          </p>
        </aside>
      )}
    </>
  );
  const obtain = (
    <>
      <section className="arc-obtain" aria-labelledby="arc-obtain-title">
        <h3 id="arc-obtain-title" className="mini-title">
          How to get
        </h3>
        {sources.length > 0 ? (
          <ul className="arc-obtain__list">
            {sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        ) : (
          <p className="muted small">No source is listed for this Arc yet.</p>
        )}
      </section>

      <section className="arc-users-detail">
        <h3 className="mini-title">Who it’s for</h3>
        {sig && (
          <div className="arc-users-detail__row">
            <span className="arc-tag arc-tag--sig">Signature</span>
            <a href={`#character-${sig.id}`} className="wielder">
              <Portrait character={sig} size="sm" />
              {sig.name}
            </a>
          </div>
        )}
        {recs.length > 0 && (
          <div className="arc-users-detail__row">
            <span className="arc-tag arc-tag--rec">Recommended</span>
            <MoreList items={recs}>
              {(c) => (
                <a key={c.id} href={`#character-${c.id}`} className="wielder">
                  <Portrait character={c} size="sm" />
                  {c.name}
                </a>
              )}
            </MoreList>
          </div>
        )}
        {!sig && recs.length === 0 && (
          <p className="muted small">No build guide picks this Arc yet. Any {a.type} character can use it.</p>
        )}
        {others.length > 0 && (
          <div className="arc-users-detail__row arc-users-detail__row--others">
            <span className="muted small">Also fits</span>
            <MoreList items={others}>
              {(c) => (
                <a key={c.id} href={`#character-${c.id}`} title={c.name}>
                  <Portrait character={c} size="sm" />
                </a>
              )}
            </MoreList>
          </div>
        )}
      </section>
    </>
  );
  const ascend =
    cost && table ? (
      <section className="ascend" aria-labelledby="arc-ascend-title">
        <div className="ascend__head">
          <h3 id="arc-ascend-title" className="mini-title">
            Ascension materials
          </h3>
          <div className="ascend__range">
            <label>
              <span>Level cap</span>
              <select
                value={from}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setFrom(v);
                  if (to <= v) setTo(Math.min(v + 10, ARC_MAX_LEVEL));
                }}
              >
                {CAPS.slice(0, -1).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <span aria-hidden="true">→</span>
            <label>
              <span className="sr-only">Target level cap</span>
              <select value={to} onChange={(e) => setTo(Number(e.target.value))}>
                {CAPS.filter((c) => c > from).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <ul className="mats">
          {cost.map((m) => (
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

        <button
          type="button"
          className="btn btn--quiet ascend__toggle"
          aria-expanded={showPhases}
          onClick={() => setShowPhases((v) => !v)}
        >
          {showPhases ? 'Hide' : 'Show'} each ascension
        </button>

        {showPhases && (
          <div className="table-wrap">
            <table className="phase-table">
              <thead>
                <tr>
                  <th scope="col">Ascension</th>
                  <th scope="col">Arc material</th>
                  <th scope="col">Anomaly material</th>
                  <th scope="col" className="num">
                    Beetle Coin
                  </th>
                </tr>
              </thead>
              <tbody>
                {table.map((p) => (
                  <tr key={p.at} className={p.at >= from && p.at < to ? 'in-range' : undefined}>
                    <td>
                      Lv {p.at} → {p.to}
                    </td>
                    <td>
                      {p.qty} × {p.aName}
                    </td>
                    <td>
                      {p.qty} × {p.bName}
                    </td>
                    <td className="num">{fmt(p.coins)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="arc-level">
          <h4 className="mini-title">Levelling</h4>
          <ul className="arc-dyes">
            {ARC_DYES.map((d) => (
              <li key={d.name}>
                <MaterialIcon name={d.name} size={26} />
                <span>
                  {d.name}
                  <span className="mat__src">+{fmt(d.exp)} EXP</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="muted small">
            Dye and Beetle Coin raise the level; Dye comes from Houdinii’s Magic Stage. Arc materials come from the{' '}
            {ARC_MATERIAL_SOURCE}. Mixing in duplicate copies raises the passive from T1 to T5.
          </p>
        </div>
      </section>
    ) : null;
  const farmCta = cost ? (
    <section className="farm-cta" aria-labelledby="arc-farm-title">
      <div className="farm-cta__text">
        <h3 id="arc-farm-title" className="mini-title">
          Farming list
        </h3>
        <p className="muted small">
          How to get {a.name}, plus every material to take it from Lv 20 to {ARC_MAX_LEVEL}, grouped by where to farm
          it.
        </p>
      </div>
      <button type="button" className="btn" onClick={() => setSharing(true)}>
        <ExportIcon />
        Share farming list
      </button>
    </section>
  ) : null;

  return (
    <article className="detail arc-detail" data-arc-type={a.type.toLowerCase()} aria-labelledby="arc-detail-name">
      <header className="detail__head">
        <div className="arc-detail__art">
          {NO_ART.has(a.id) ? <ArcTypeIcon type={a.type} size={56} /> : <ArcPlayer arc={a} spin />}
        </div>
        <div className="detail__title">
          <p className="eyebrow">
            <span className="eyebrow__meta">
              <RankBadge rank={a.rarity} size={18} />
              <ArcTypeIcon type={a.type} size={16} />
              <span>
                {a.type} Arc · {a.rarity}-rank
              </span>
            </span>
          </p>
          <h2 id="arc-detail-name" className="detail__name">
            {a.name}
          </h2>
          {(sig || field) && (
            <ul className="tags">
              {sig && <li>Signature: {sig.name}</li>}
              {field && <li>Exploration effect</li>}
            </ul>
          )}
        </div>
        <button className="btn btn--quiet detail__close" onClick={onClose} aria-label="Close details">
          ×
        </button>
      </header>

      {phone ? (
        <SwipeTabs
          key={a.id}
          label={`${a.name} details`}
          slides={[
            { id: 'overview', label: 'Overview', content: info },
            { id: 'obtain', label: 'How to get', content: obtain },
            cost && {
              id: 'materials',
              label: 'Materials',
              content: (
                <>
                  {ascend}
                  {farmCta}
                </>
              ),
            },
          ].filter(Boolean)}
        />
      ) : (
        <>
          <div className="detail__grid">
            <div className="detail__main">
              {info}
              {obtain}
            </div>
            {ascend}
          </div>
          {farmCta}
        </>
      )}

      {sharing && (
        <ExportDialog
          title="Arc farming list image"
          name={a.name}
          suffix="nte-arc-farming-list"
          onClose={() => setSharing(false)}
          render={(opts) => import('../lib/farmCard.js').then((m) => m.renderArcFarmCard(a, opts))}
        />
      )}
    </article>
  );
}
