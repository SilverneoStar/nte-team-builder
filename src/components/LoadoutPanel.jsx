// Gear editor for one team member: Arc, Cartridge set, Console and awakenings.
import { ARC_BY_ID, arcTag, arcsFor } from '../data/arcs.js';
import CartridgeIcon from './CartridgeIcon.jsx';
import ArcTypeIcon from './ArcTypeIcon.jsx';
import { MiniBoard } from './ConsolePage.jsx';
import { CHARACTER_CONSOLE, FREE_CELLS, setProgress, specBonus, usedCells } from '../data/console.js';
import { CARTRIDGES, CARTRIDGE_BY_ID, cartridgesFor, keepCartValues } from '../data/gear.js';
import { suggestedBuild, suggestedCartStats } from '../data/consoleBuilds.js';
import StatAdvice from './StatAdvice.jsx';
import { loadSavedConsoles } from '../lib/consoles.js';
import CartStatsEditor from './CartStatsEditor.jsx';
import { ELEMENT_BY_ID } from '../data/elements.js';
import Portrait from './Portrait.jsx';
import RankBadge from './RankBadge.jsx';
import { AWAKENINGS, MAX_ARC_DUPES, MAX_DUPES } from '../data/awakenings.js';
import ResonanceBadges from './ResonanceBadges.jsx';
import StatText from './StatText.jsx';

// Gear editor for one team member: Arc, Cartridge set and Console build.
export default function LoadoutPanel({ character: c, loadout, onChange, onClose, dispatch }) {
  const awakenings = AWAKENINGS[c.id];
  const arcs = arcsFor(c);
  const arc = loadout.arc && ARC_BY_ID[loadout.arc];
  const cart = loadout.cartridge && CARTRIDGE_BY_ID[loadout.cartridge];
  const TAG_LABEL = { sig: 'Signature', rec: 'Recommended' };
  const picks = arcs.filter((a) => arcTag(a, c));
  const others = arcs.filter((a) => !arcTag(a, c));
  const ranks = ['S', 'A', 'B'].filter((r) => others.some((a) => a.rarity === r));
  const arcOption = (a) => {
    const tag = arcTag(a, c);
    return (
      <option key={a.id} value={a.id}>
        {a.name}
        {tag ? ` (${tag === 'sig' ? 'Sig' : 'Rec'})` : ''} · {a.rarity} · {a.atk} ATK
      </option>
    );
  };
  const arcTagNow = arc ? arcTag(arc, c) : null;
  const recSets = cartridgesFor(c);
  const otherSets = CARTRIDGES.filter((s) => !recSets.includes(s.id));
  const cartIsRec = cart && recSets.includes(cart.id);

  return (
    <section className="loadout" style={{ '--el': ELEMENT_BY_ID[c.element].color }} aria-labelledby="loadout-title">
      <header className="loadout__head">
        <Portrait character={c} size="md" />
        <div>
          <p className="eyebrow">Loadout</p>
          <h2 id="loadout-title" className="loadout__name">
            {c.name}
          </h2>
        </div>
        <button className="btn btn--quiet loadout__close" onClick={onClose} aria-label="Close loadout">
          Done
        </button>
      </header>

      <div className="loadout__grid">
        {/* Duplicates and awakenings */}
        <div className="gear-block gear-block--wide">
          <div className="awaken-head">
            <label className="mini-title" htmlFor="gear-dupes">
              Duplicates{' '}
              <span>
                {loadout.awakenings.length}/{loadout.dupes} awakenings on
              </span>
            </label>
            <div className="stepper" role="group" aria-label="Duplicate copies">
              {Array.from({ length: MAX_DUPES + 1 }, (_, n) => (
                <button
                  key={n}
                  type="button"
                  className="stepper__btn"
                  aria-pressed={loadout.dupes === n}
                  title={n === 0 ? 'No duplicates: one copy' : `${n} duplicate${n > 1 ? 's' : ''}`}
                  onClick={() => dispatch({ type: 'setDupes', charId: c.id, dupes: n })}
                >
                  {n === 0 ? '0' : `+${n}`}
                </button>
              ))}
            </div>
          </div>
          {awakenings ? (
            <ul className="awaken-pick">
              {awakenings.map((w) => {
                const on = loadout.awakenings.includes(w.id);
                const full = !on && loadout.awakenings.length >= loadout.dupes;
                return (
                  <li key={w.id}>
                    <button
                      type="button"
                      className={`awaken-btn${on ? ' is-on' : ''}${full ? ' is-locked' : ''}`}
                      aria-pressed={on}
                      onClick={() => dispatch({ type: 'toggleAwakening', charId: c.id, id: w.id })}
                    >
                      <span className="awaken-id">{w.id}</span>
                      <span className="awaken-body">
                        <b>{w.name}</b>
                        <span>
                          <StatText>{w.effect}</StatText>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted small">Awakenings will be added once they’re published.</p>
          )}
          <ResonanceBadges characterId={c.id} awakeningCount={loadout.awakenings.length} />
          <p className="muted small">
            {loadout.dupes === 0
              ? 'Add duplicates to unlock awakenings. Each one lets you turn on any awakening, in any order.'
              : `${loadout.dupes - loadout.awakenings.length} of ${loadout.dupes} slot${loadout.dupes > 1 ? 's' : ''} free. Pick any awakenings, in any order.`}
          </p>
        </div>

        {/* Arc */}
        <div className="gear-block">
          <label className="mini-title" htmlFor="gear-arc">
            Arc{' '}
            <span>
              {c.arcType ? (
                <>
                  <ArcTypeIcon type={c.arcType} size={14} /> {c.arcType} only
                </>
              ) : (
                'Arc type not announced'
              )}
            </span>
          </label>
          <select id="gear-arc" value={loadout.arc ?? ''} onChange={(e) => onChange({ arc: e.target.value || null })}>
            <option value="">No Arc</option>
            {picks.length > 0 && <optgroup label="Signature & recommended">{picks.map(arcOption)}</optgroup>}
            {ranks.map((r) => (
              <optgroup key={r} label={`${r}-rank`}>
                {others.filter((a) => a.rarity === r).map(arcOption)}
              </optgroup>
            ))}
          </select>
          {arc && (
            <label className="arc-dupes">
              <span>Arc copies</span>
              <select
                id="gear-arc-dupes"
                value={loadout.arcDupes}
                onChange={(e) => dispatch({ type: 'setArcDupes', charId: c.id, arcDupes: Number(e.target.value) })}
              >
                {Array.from({ length: MAX_ARC_DUPES + 1 }, (_, n) => (
                  <option key={n} value={n}>
                    {n === 0
                      ? '1 copy (base)'
                      : n === MAX_ARC_DUPES
                        ? `+${n} duplicates (max)`
                        : `+${n} duplicate${n > 1 ? 's' : ''}`}
                  </option>
                ))}
              </select>
            </label>
          )}
          {arc ? (
            <div className="gear-card">
              <div className="gear-card__top">
                <RankBadge rank={arc.rarity} size={22} />
                <b>{arc.name}</b>
                {arcTagNow && <span className={`arc-tag arc-tag--${arcTagNow}`}>{TAG_LABEL[arcTagNow]}</span>}
              </div>
              <dl className="gear-stats">
                <div>
                  <dt>Base ATK</dt>
                  <dd>
                    {arc.atk} {arc.estimated && <span className="est-tag" title="Estimated: usual value for a limited S-rank Arc">est.</span>}
                  </dd>
                </div>
                <div>
                  <dt>Secondary</dt>
                  <dd>
                    {arc.sub} {arc.estimated && <span className="est-tag" title="Estimated: usual value for a limited S-rank Arc">est.</span>}
                  </dd>
                </div>
              </dl>
              <p>
                <StatText>{arc.passive}</StatText>
              </p>
            </div>
          ) : (
            <div className="arc-picks">
              {picks.length > 0 ? (
                picks.map((a) => {
                  const tag = arcTag(a, c);
                  return (
                    <button key={a.id} type="button" className="arc-pick" onClick={() => onChange({ arc: a.id })}>
                      <span className={`arc-tag arc-tag--${tag}`}>{tag === 'sig' ? 'Sig' : 'Rec'}</span>
                      {a.name}
                    </button>
                  );
                })
              ) : (
                <p className="muted small">
                  {arcs.length} {c.arcType} Arcs available.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Cartridge */}
        <div className="gear-block">
          <label className="mini-title" htmlFor="gear-cart">
            Cartridge set
          </label>
          <select
            id="gear-cart"
            value={loadout.cartridge ?? ''}
            onChange={(e) => onChange({ cartridge: e.target.value || null })}
          >
            <option value="">No set</option>
            <optgroup label="Recommended">
              {recSets.map((id) => (
                <option key={id} value={id}>
                  {CARTRIDGE_BY_ID[id].name} (Rec)
                </option>
              ))}
            </optgroup>
            <optgroup label="Other sets">
              {otherSets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </optgroup>
          </select>
          {cart ? (
            <div className="gear-card">
              <div className="gear-card__top">
                <CartridgeIcon id={cart.id} size={30} />
                <b>{cart.name}</b>
                {cartIsRec && <span className="arc-tag arc-tag--rec">Recommended</span>}
              </div>
              <dl className="gear-bonus">
                <div>
                  <dt>2-piece</dt>
                  <dd>
                    <StatText>{cart.two}</StatText>
                  </dd>
                </div>
                <div>
                  <dt>4-piece</dt>
                  <dd>
                    <StatText>{cart.four}</StatText>
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <>
              <div className="arc-picks">
                {recSets.map((id) => (
                  <button key={id} type="button" className="arc-pick" onClick={() => onChange({ cartridge: id })}>
                    <CartridgeIcon id={id} size={18} />
                    <span className="arc-tag arc-tag--rec">Rec</span>
                    {CARTRIDGE_BY_ID[id].name}
                  </button>
                ))}
              </div>
              <p className="muted small">
                Recommended for {c.name}’s element and roles. Bonuses activate with 2 and 4 matching pieces.
              </p>
            </>
          )}
        </div>

        {/* Console build: modules + Cartridge stats, following the chosen Cartridge set */}
        {CHARACTER_CONSOLE[c.id] &&
          (() => {
            const layout = CHARACTER_CONSOLE[c.id].layout;
            const suggested = suggestedBuild(c.id, loadout.cartridge);
            const saved = loadSavedConsoles().filter(
              (b) => b.layout === layout && (!loadout.cartridge || b.cartridge === loadout.cartridge),
            );
            const builds = [...saved, suggested].filter(Boolean);
            // Same layout = same shapes in the same places (module stats may differ).
            const layoutKey = (ps) => JSON.stringify((ps ?? []).map(({ shape, r, c: col }) => [shape, r, col]));
            const samePieces = (b) => layoutKey(b.pieces) === layoutKey(loadout.console);
            // Saved builds win over the suggested one when both match.
            const current = builds.find(samePieces);
            const sb = specBonus(c.id, loadout.console);
            const setName = cart ? cart.name : 'the recommended set';
            // Keep values the person already entered for the same stat.
            const withValues = (st) => keepCartValues(loadout.cartStats, st);
            return (
              <div className="gear-block gear-block--wide">
                <label className="mini-title" htmlFor="gear-console">
                  Console build <span>for {setName}</span>
                </label>
                <select
                  id="gear-console"
                  value={current?.id ?? (loadout.console.length ? 'custom' : '')}
                  onChange={(e) => {
                    const b = builds.find((x) => x.id === e.target.value);
                    if (b) {
                      onChange({
                        console: b.pieces,
                        cartridge: b.cartridge,
                        cartStats: b.suggested ? withValues(b.cartStats) : (b.cartStats ?? loadout.cartStats),
                      });
                    } else if (!e.target.value) {
                      onChange({ console: [] });
                    }
                  }}
                >
                  <option value="">No console</option>
                  {!current && loadout.console.length > 0 && <option value="custom">Current layout (custom)</option>}
                  {suggested && (
                    <option value={suggested.id}>
                      Suggested · best layout for {CARTRIDGE_BY_ID[suggested.cartridge].name}
                    </option>
                  )}
                  {saved.length > 0 && (
                    <optgroup label="Your saved consoles">
                      {saved.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <div className="console-summary">
                  <MiniBoard layout={layout} pieces={loadout.console} cell={11} />
                  <div className="console-summary__body">
                    {loadout.console.length ? (
                      <>
                        <span>
                          <b>{usedCells(loadout.console)}</b> / {FREE_CELLS} cells · {loadout.console.length} modules
                        </span>
                        {cart && (
                          <span className="muted small">
                            {cart.name}: {Math.min(setProgress(cart.id, loadout.console).count, 4)} / 4 set modules
                          </span>
                        )}
                        {sb && sb.count > 0 && (
                          <span className="muted small">
                            Bonus: +{sb.total}% {sb.stat}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="muted small">No modules placed yet.</span>
                    )}
                    <a className="btn btn--quiet console-summary__link" href={`#console-${c.id}`}>
                      {loadout.console.length ? 'Edit in Console' : 'Build in Console'}
                    </a>
                  </div>
                </div>

                <div className="cstats-head">
                  <p className="mini-title">
                    Cartridge stats <span>1 main · 4 sub</span>
                  </p>
                  <button
                    type="button"
                    className="btn btn--quiet"
                    onClick={() => onChange({ cartStats: withValues(suggestedCartStats(c, loadout.cartridge)) })}
                  >
                    Use suggested stats
                  </button>
                </div>
                <CartStatsEditor
                  value={loadout.cartStats}
                  onChange={(v) => onChange({ cartStats: v })}
                  idPrefix="lcs"
                />
                <StatAdvice character={c} cartridge={loadout.cartridge} />
                <p className="muted small">
                  Adjust the stats and enter the values from your Cartridge. Module stats are entered per module in the
                  Console tab.
                </p>
              </div>
            );
          })()}
      </div>
    </section>
  );
}
