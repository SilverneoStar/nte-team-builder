// Editor for a Cartridge's main and sub attributes.
import { CARTRIDGE_MAIN_STATS, MODULE_SUB_STATS, isPercentStat } from '../data/gear.js';
import { favouredStats } from '../data/buildProfiles.js';
import { cartHasEmptyValues, cartStatMax, fillChosenCartValues } from '../data/cartValues.js';

// Editor for a Cartridge's 1 main + 4 sub attributes.
// With a character: their favoured stats are listed first and marked Rec., and
// sub stats they don't use are dimmed.
/**
 * "Fill values" for the editor's header (beside "Use suggested stats"): gives
 * each picked stat with no value yet its S-rank value.
 */
export function FillValuesButton({ value, onChange }) {
  const empty = cartHasEmptyValues(value);
  return (
    <button
      type="button"
      className="btn btn--quiet"
      disabled={!empty}
      onClick={() => onChange(fillChosenCartValues(value))}
      title={
        empty
          ? 'Gives each stat you picked that has no value yet its S-rank value. Edit any of them after.'
          : 'Every stat you picked has a value.'
      }
    >
      Fill values
    </button>
  );
}

// fillButton: false when the page shows FillValuesButton in its own header.
export default function CartStatsEditor({ value, onChange, idPrefix = 'cs', character = null, cartridge = null, fillButton = true }) {
  const fav = character ? favouredStats(character, cartridge) : null;
  const order = (opts, map) =>
    map ? [...opts].sort((a, b) => (map.has(a) ? map.get(a) : 99) - (map.has(b) ? map.get(b) : 99)) : opts;
  return (
    <div className="cstats">
      {(fav || (fillButton && cartHasEmptyValues(value))) && (
        <div className="cstats__top">
          {fav && (
            <p className="cstats__fav small muted">
              Favoured sub stats: <b>{fav.text}</b>
            </p>
          )}
          {fillButton && cartHasEmptyValues(value) && (
            <button
              type="button"
              className="btn btn--quiet cstats__fill"
              onClick={() => onChange(fillChosenCartValues(value))}
              title="Gives each stat you picked that has no value yet its S-rank value. Edit any of them after."
            >
              Fill values
            </button>
          )}
        </div>
      )}
      <StatRow
        id={`${idPrefix}-main`}
        kind="main"
        label="Main"
        rec={fav?.main}
        options={order(CARTRIDGE_MAIN_STATS, fav?.main)}
        value={value.main}
        onChange={(v) => onChange({ ...value, main: v })}
      />
      <hr className="cstats__rule" aria-hidden="true" />
      {value.subs.map((sub, i) => (
        <StatRow
          key={i}
          id={`${idPrefix}-sub-${i}`}
          kind="sub"
          label={`Sub ${i + 1}`}
          rec={fav?.subs}
          off={!!(fav && sub && !fav.subs.has(sub.stat))}
          options={order(MODULE_SUB_STATS, fav?.subs)}
          value={sub}
          onChange={(v) => onChange({ ...value, subs: value.subs.map((x, j) => (j === i ? v : x)) })}
        />
      ))}
    </div>
  );
}

// One attribute: stat picker + value. Empty stat clears the row.
// Changing the stat: a value that was the old stat's S-rank value (filled or
// suggested) moves to the new stat's S-rank value; a typed value is cleared,
// since it was for the old stat.
function StatRow({ id, kind, label, options, value, onChange, rec = null, off = false }) {
  const pick = (stat) => {
    if (!stat) return onChange(null);
    const wasMax = value?.stat && value.value && value.value === cartStatMax(kind, value.stat);
    onChange({ stat, value: wasMax ? cartStatMax(kind, stat) : 0 });
  };
  const pct = value && isPercentStat(value.stat);
  return (
    <div className={`${value ? 'cstat cstat--on' : 'cstat'}${off ? ' is-off' : ''}`} title={off ? 'Not one of this character’s favoured stats' : undefined}>
      <label className="cstat__label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        value={value?.stat ?? ''}
        onChange={(e) => pick(e.target.value)}
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
            {rec?.has(o) ? ' · Rec.' : ''}
          </option>
        ))}
      </select>
      <span className="cstat__value">
        <label className="sr-only" htmlFor={`${id}-v`}>
          {label} value
        </label>
        <input
          id={`${id}-v`}
          type="number"
          inputMode="decimal"
          min="0"
          step={pct ? '0.01' : '1'}
          disabled={!value}
          value={value ? value.value : ''}
          placeholder="0"
          onChange={(e) => {
            const n = Math.max(0, Math.min(10000, Number(e.target.value) || 0));
            onChange({ ...value, value: Math.round(n * 100) / 100 });
          }}
        />
        <span className="cstat__unit" aria-hidden="true">
          {pct ? '%' : ''}
        </span>
      </span>
    </div>
  );
}
