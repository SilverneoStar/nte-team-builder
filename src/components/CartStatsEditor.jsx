// Editor for a Cartridge's main and sub attributes.
import { CARTRIDGE_MAIN_STATS, MODULE_SUB_STATS, isPercentStat } from '../data/gear.js';

// Editor for a Cartridge's 1 main + 4 sub attributes.
export default function CartStatsEditor({ value, onChange, idPrefix = 'cs' }) {
  return (
    <div className="cstats">
      <StatRow
        id={`${idPrefix}-main`}
        label="Main"
        options={CARTRIDGE_MAIN_STATS}
        value={value.main}
        onChange={(v) => onChange({ ...value, main: v })}
      />
      <hr className="cstats__rule" aria-hidden="true" />
      {value.subs.map((sub, i) => (
        <StatRow
          key={i}
          id={`${idPrefix}-sub-${i}`}
          label={`Sub ${i + 1}`}
          options={MODULE_SUB_STATS}
          value={sub}
          onChange={(v) => onChange({ ...value, subs: value.subs.map((x, j) => (j === i ? v : x)) })}
        />
      ))}
    </div>
  );
}

// One attribute: stat picker + value. Empty stat clears the row.
function StatRow({ id, label, options, value, onChange }) {
  const pct = value && isPercentStat(value.stat);
  return (
    <div className={value ? 'cstat cstat--on' : 'cstat'}>
      <label className="cstat__label" htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value?.stat ?? ''}
        onChange={(e) => onChange(e.target.value ? { stat: e.target.value, value: value?.value ?? 0 } : null)}
      >
        <option value="">—</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span className="cstat__value">
        <label className="sr-only" htmlFor={`${id}-v`}>{label} value</label>
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
        <span className="cstat__unit" aria-hidden="true">{pct ? '%' : ''}</span>
      </span>
    </div>
  );
}
