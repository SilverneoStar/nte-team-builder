// The My build tab: a reader's own build for a character, saved in this browser.
import { useEffect, useMemo, useState } from 'react';
import { arcTag, arcsFor } from '../data/arcs.js';
import { CARTRIDGES, CARTRIDGE_BY_ID, cartridgesFor } from '../data/gear.js';
import { CHARACTER_CONSOLE, FREE_CELLS, setProgress, usedCells } from '../data/console.js';
import { suggestedBuild } from '../data/consoleBuilds.js';
import { bestBuild, withBestModuleStats } from '../data/bestBuild.js';
import { AWAKENING_ORDER } from '../data/awakeningOrder.js';
import { AWAKENINGS, MAX_ARC_DUPES } from '../data/awakenings.js';
import { loadSavedConsoles } from '../lib/consoles.js';
import { loadMyBuilds, saveMyBuild } from '../lib/myBuilds.js';
import { loadoutOf } from '../lib/teamsReducer.js';
import CartStatsEditor from './CartStatsEditor.jsx';
import CartridgeIcon from './CartridgeIcon.jsx';
import { MiniBoard } from './ConsolePage.jsx';
import ExportIcon from './ExportIcon.jsx';

const ALL_AWAKENINGS = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'];

/** A fresh "my build" for a character, copied from the recommended build. */
export function startingBuild(c) {
  const best = bestBuild(c);
  const rec = AWAKENING_ORDER[c.id]?.order ?? [];
  return {
    arc: best?.arc ?? arcsFor(c)[0]?.id ?? null,
    arcDupes: 0,
    cartridge: best?.cartridge ?? cartridgesFor(c)[0] ?? null,
    cartStats: best?.cartStats ?? { main: null, subs: [null, null, null, null] },
    pieces: best?.pieces ?? [],
    consoleFrom: 'suggested',
    awakeningOrder: [...rec, ...ALL_AWAKENINGS.filter((a) => !rec.includes(a))],
  };
}

/** The player's saved build for a character, or null. */
export const myBuildFor = (id) => loadMyBuilds()[id] ?? null;

// The player's own build for one character: Arc, Cartridge, Console and
// Awakening order, saved in this browser and shared as a build card.
export default function MyBuildEditor({ character: c, activeTeam, onShare }) {
  const [build, setBuild] = useState(() => myBuildFor(c.id) ?? startingBuild(c));
  const [saved, setSaved] = useState(() => Boolean(myBuildFor(c.id)));
  useEffect(() => {
    setBuild(myBuildFor(c.id) ?? startingBuild(c));
    setSaved(Boolean(myBuildFor(c.id)));
  }, [c.id]);

  const set = (patch) => {
    const next = { ...build, ...patch };
    setBuild(next);
    saveMyBuild(c.id, next);
    setSaved(true);
  };

  const layout = CHARACTER_CONSOLE[c.id]?.layout;
  const arcs = arcsFor(c);
  const recSets = cartridgesFor(c);
  const names = Object.fromEntries((AWAKENINGS[c.id] ?? []).map((w) => [w.id, w.name]));

  // Console sources: suggested for the chosen set, saved consoles on this grid,
  // or the one this character wears in the current team.
  const consoleOptions = useMemo(() => {
    const out = [];
    const sug = suggestedBuild(c.id, build.cartridge);
    if (sug) out.push({ id: 'suggested', label: `Suggested for ${CARTRIDGE_BY_ID[sug.cartridge].name}`, pieces: sug.pieces, cartridge: sug.cartridge });
    if (activeTeam?.members.includes(c.id)) {
      const lo = loadoutOf(activeTeam, c.id);
      if (lo.console?.length) out.push({ id: 'team', label: `From team “${activeTeam.name}”`, pieces: lo.console, cartridge: lo.cartridge, cartStats: lo.cartStats });
    }
    for (const b of loadSavedConsoles().filter((x) => x.layout === layout)) {
      out.push({ id: `saved:${b.id}`, label: `Saved: ${b.name}`, pieces: b.pieces, cartridge: b.cartridge, cartStats: b.cartStats });
    }
    return out;
  }, [c.id, build.cartridge, activeTeam, layout]);

  function pickConsole(id) {
    if (id === 'none') return set({ consoleFrom: 'none', pieces: [] });
    const o = consoleOptions.find((x) => x.id === id);
    if (!o) return;
    const patch = { consoleFrom: id, pieces: o.pieces };
    if (id === 'suggested') patch.pieces = withBestModuleStats(c, o.pieces, build.cartridge);
    if (o.cartStats && (o.cartStats.main || o.cartStats.subs?.some(Boolean))) patch.cartStats = o.cartStats;
    if (o.cartridge && id !== 'suggested') patch.cartridge = o.cartridge;
    set(patch);
  }

  function pickCartridge(id) {
    const patch = { cartridge: id || null };
    // Keep the suggested layout in step with the set.
    if (build.consoleFrom === 'suggested') {
      const sug = suggestedBuild(c.id, id);
      patch.pieces = withBestModuleStats(c, sug?.pieces ?? [], id);
    }
    set(patch);
  }

  const move = (i, dir) => {
    const order = [...build.awakeningOrder];
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    set({ awakeningOrder: order });
  };

  const prog = build.cartridge ? setProgress(build.cartridge, build.pieces) : null;

  return (
    <section className="mybuild" aria-labelledby="mybuild-title">
      <div className="mybuild__head">
        <h3 id="mybuild-title" className="mini-title">Your build <span>{saved ? 'saved in this browser' : 'starts from the recommended build'}</span></h3>
        <button
          type="button"
          className="btn btn--quiet"
          onClick={() => {
            saveMyBuild(c.id, null);
            setBuild(startingBuild(c));
            setSaved(false);
          }}
        >
          Reset to recommended
        </button>
      </div>

      <div className="mybuild__grid">
        <label className="mybuild__field">
          <span>Arc</span>
          <select id="mybuild-arc" value={build.arc ?? ''} onChange={(e) => set({ arc: e.target.value || null })}>
            <option value="">No Arc</option>
            {arcs.map((a) => {
              const tag = arcTag(a, c);
              return (
                <option key={a.id} value={a.id}>
                  {a.name}{tag ? ` (${tag === 'sig' ? 'Sig' : 'Rec'})` : ''} · {a.rarity}
                </option>
              );
            })}
          </select>
        </label>
        <label className="mybuild__field mybuild__field--short">
          <span>Arc copies</span>
          <select id="mybuild-arc-dupes" value={build.arcDupes ?? 0} onChange={(e) => set({ arcDupes: Number(e.target.value) })} disabled={!build.arc}>
            {Array.from({ length: MAX_ARC_DUPES + 1 }, (_, n) => (
              <option key={n} value={n}>
                {n === 0 ? '1 copy (base)' : n === MAX_ARC_DUPES ? `+${n} duplicates (max)` : `+${n} duplicate${n > 1 ? 's' : ''}`}
              </option>
            ))}
          </select>
        </label>
        <label className="mybuild__field">
          <span>Cartridge set</span>
          <select id="mybuild-cart" value={build.cartridge ?? ''} onChange={(e) => pickCartridge(e.target.value)}>
            <option value="">No set</option>
            <optgroup label="Recommended">
              {recSets.map((id) => <option key={id} value={id}>{CARTRIDGE_BY_ID[id].name}</option>)}
            </optgroup>
            <optgroup label="Other sets">
              {CARTRIDGES.filter((x) => !recSets.includes(x.id)).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
            </optgroup>
          </select>
        </label>
        {layout && (
          <label className="mybuild__field">
            <span>Console build</span>
            <select id="mybuild-console" value={build.consoleFrom ?? 'suggested'} onChange={(e) => pickConsole(e.target.value)}>
              <option value="none">No console</option>
              {consoleOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </label>
        )}
      </div>

      {layout && (
        <div className="console-summary mybuild__console">
          <MiniBoard layout={layout} pieces={build.pieces} cell={11} />
          <div className="console-summary__body">
            <span><b>{usedCells(build.pieces)}</b> / {FREE_CELLS} cells · {build.pieces.length} modules</span>
            {prog && (
              <span className="muted small">
                {build.cartridge && <CartridgeIcon id={build.cartridge} size={16} />} {CARTRIDGE_BY_ID[build.cartridge].name}: {Math.min(prog.count, 4)} / 4 set modules
              </span>
            )}
            <a className="btn btn--quiet console-summary__link" href={`#console-${c.id}`}>Build or save a console</a>
          </div>
        </div>
      )}

      <p className="mini-title mybuild__sub">Cartridge stats <span>1 main · 4 sub</span></p>
      <CartStatsEditor value={build.cartStats} onChange={(v) => set({ cartStats: v })} idPrefix="mb" />

      <p className="mini-title mybuild__sub">Awakening order <span>one per duplicate · use the arrows to reorder</span></p>
      <ol className="awaken-chain awaken-chain--edit" aria-label="Your Awakening order">
        {build.awakeningOrder.map((id, i) => (
          <li key={id}>
            {i > 0 && <span className="awaken-chain__arrow" aria-hidden="true">→</span>}
            <span className="awaken-edit">
              <span className={`awaken-chain__id${i === 0 ? ' is-first' : ''}`} title={names[id] ?? id}>{id}</span>
              <span className="awaken-edit__moves">
                <button type="button" aria-label={`Move ${id} earlier`} disabled={i === 0} onClick={() => move(i, -1)}>‹</button>
                <button type="button" aria-label={`Move ${id} later`} disabled={i === build.awakeningOrder.length - 1} onClick={() => move(i, 1)}>›</button>
              </span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mybuild__actions">
        <button type="button" className="btn btn--primary" onClick={() => onShare(build)}><ExportIcon />Share my build image</button>
      </div>
    </section>
  );
}

/** Build data for the card renderer from a saved "my build". */
export function myBuildCurrent(build) {
  return {
    arc: build.arc,
    arcDupes: build.arcDupes,
    cartridge: build.cartridge,
    cartStats: build.cartStats,
    pieces: build.pieces,
    awakeningOrder: build.awakeningOrder,
  };
}

