// The Achievements page: categories, tiers and a per-browser progress tracker.
import { useMemo, useState } from 'react';
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_CHARACTERS,
  TIERS,
} from '../data/achievements.js';
import { useAchievementProgress } from '../lib/achievementProgress.js';

const TIER_LABEL = Object.fromEntries(TIERS.map((t) => [t.id, t.label]));
const TIER_RANK = { G: 0, S: 1, B: 2, H: 3 };
const CAT_INDEX = Object.fromEntries(ACHIEVEMENT_CATEGORIES.map((c, i) => [c.id, i]));
const CAT_LABEL = Object.fromEntries(ACHIEVEMENT_CATEGORIES.map((c) => [c.id, c.label]));

const SORTS = [
  { id: 'game', label: 'Category order' },
  { id: 'tier-high', label: 'Gold first' },
  { id: 'tier-low', label: 'Bronze first' },
  { id: 'name', label: 'Name A–Z' },
  { id: 'todo', label: 'Not done first' },
];

function Medal({ tier }) {
  return (
    <span className={`medal medal--${tier.toLowerCase()}`} title={TIER_LABEL[tier]}>
      <span className="sr-only">{TIER_LABEL[tier]}</span>
    </span>
  );
}

function ProgressBar({ value, total, label }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="ach-progress">
      <div
        className="ach-progress__bar"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={value}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
      <span className="ach-progress__num">
        {value} / {total} <span className="muted">({pct}%)</span>
      </span>
    </div>
  );
}

export default function AchievementsPage({ category: catParam }) {
  const category = CAT_LABEL[catParam] ? catParam : 'all';
  const { done, toggle, setMany, reset } = useAchievementProgress();
  const [tier, setTier] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('game');
  const [query, setQuery] = useState('');
  const [who, setWho] = useState('all');
  const [spoilers, setSpoilers] = useState(false);
  const [revealed, setRevealed] = useState(() => new Set());

  const inCategory = useMemo(
    () => (category === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter((a) => a.category === category)),
    [category],
  );

  const stats = useMemo(() => {
    const byCat = {};
    const byTier = {};
    for (const a of ACHIEVEMENTS) {
      const c = (byCat[a.category] ||= { done: 0, total: 0 });
      const t = (byTier[a.tier] ||= { done: 0, total: 0 });
      c.total += 1;
      t.total += 1;
      if (done.has(a.id)) {
        c.done += 1;
        t.done += 1;
      }
    }
    return { byCat, byTier, done: ACHIEVEMENTS.filter((a) => done.has(a.id)).length };
  }, [done]);

  const showWho = category === 'all' || category === 'social';

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = inCategory.filter((a) => {
      if (tier !== 'all' && a.tier !== tier) return false;
      if (status === 'done' && !done.has(a.id)) return false;
      if (status === 'todo' && done.has(a.id)) return false;
      if (showWho && who !== 'all' && !new RegExp(`\\b${who}\\b`).test(a.text)) return false;
      if (q) {
        // Hidden requirements only count toward a search once they're shown.
        const textVisible = a.tier !== 'H' || spoilers || revealed.has(a.id);
        if (!a.name.toLowerCase().includes(q) && !(textVisible && a.text.toLowerCase().includes(q))) return false;
      }
      return true;
    });
    const byGame = (a, b) => CAT_INDEX[a.category] - CAT_INDEX[b.category] || a.order - b.order;
    const cmp = {
      game: byGame,
      'tier-high': (a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier] || byGame(a, b),
      'tier-low': (a, b) => TIER_RANK[b.tier] - TIER_RANK[a.tier] || byGame(a, b),
      name: (a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }),
      todo: (a, b) => Number(done.has(a.id)) - Number(done.has(b.id)) || byGame(a, b),
    }[sort];
    return [...filtered].sort(cmp);
  }, [inCategory, tier, status, who, showWho, query, sort, done, spoilers, revealed]);

  const shownIds = list.map((a) => a.id);
  const shownDone = shownIds.filter((id) => done.has(id)).length;
  const catInfo = ACHIEVEMENT_CATEGORIES.find((c) => c.id === category);
  const catStats = category === 'all' ? { done: stats.done, total: ACHIEVEMENTS.length } : stats.byCat[category];
  const filtersOn = tier !== 'all' || status !== 'all' || who !== 'all' || query.trim() !== '';

  const markShown = (value) => {
    const n = shownIds.filter((id) => done.has(id) !== value).length;
    if (n === 0) return;
    const verb = value ? 'Mark' : 'Unmark';
    if (n > 10 && !window.confirm(`${verb} ${n} achievements as done?`)) return;
    setMany(shownIds, value);
  };

  return (
    <div className="page achievements">
      <header className="page__head">
        <h2 className="page__title">Achievements</h2>
        <p className="muted">
          {ACHIEVEMENTS.length} achievements in {ACHIEVEMENT_CATEGORIES.length} categories. Tick them off as you go: your
          progress is saved in this browser on this device.
        </p>
      </header>

      <section className="ach-summary" aria-label="Your progress">
        <ProgressBar value={stats.done} total={ACHIEVEMENTS.length} label="All achievements done" />
        <ul className="ach-tiers">
          {TIERS.map((t) => (
            <li key={t.id}>
              <Medal tier={t.id} />
              <span>{t.label}</span>
              <strong>
                {stats.byTier[t.id]?.done ?? 0}/{stats.byTier[t.id]?.total ?? 0}
              </strong>
            </li>
          ))}
        </ul>
      </section>

      <div className="type-tabs" role="tablist" aria-label="Achievement category">
        <a className="type-tab" role="tab" aria-selected={category === 'all'} href="#achievements">
          All <span>{stats.done}/{ACHIEVEMENTS.length}</span>
        </a>
        {ACHIEVEMENT_CATEGORIES.map((c) => (
          <a
            key={c.id}
            className="type-tab"
            role="tab"
            aria-selected={category === c.id}
            href={`#achievements-${c.id}`}
          >
            {c.label}{' '}
            <span>
              {stats.byCat[c.id]?.done ?? 0}/{stats.byCat[c.id]?.total ?? 0}
            </span>
          </a>
        ))}
      </div>

      {catInfo && (
        <div className="ach-cat">
          <p className="muted">{catInfo.blurb}</p>
          <ProgressBar value={catStats.done} total={catStats.total} label={`${catInfo.label} achievements done`} />
        </div>
      )}

      <div className="filters filters--page filters--row ach-filters">
        <label className="sr-only" htmlFor="ach-search">Search achievements</label>
        <input
          id="ach-search"
          className="search search--inline"
          type="search"
          placeholder="Search name or requirement"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips" role="group" aria-label="Filter by tier">
          <button className="chip" aria-pressed={tier === 'all'} onClick={() => setTier('all')}>Any tier</button>
          {TIERS.map((t) => (
            <button
              key={t.id}
              className="chip chip--medal"
              aria-pressed={tier === t.id}
              onClick={() => setTier(tier === t.id ? 'all' : t.id)}
            >
              <Medal tier={t.id} />
              {t.label}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Filter by progress">
          {[
            ['all', 'All'],
            ['todo', 'Not done'],
            ['done', 'Done'],
          ].map(([id, label]) => (
            <button key={id} className="chip" aria-pressed={status === id} onClick={() => setStatus(id)}>
              {label}
            </button>
          ))}
        </div>
        <label className="ach-select">
          <span>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </label>
        {showWho && (
          <label className="ach-select">
            <span>Character</span>
            <select value={who} onChange={(e) => setWho(e.target.value)}>
              <option value="all">Anyone</option>
              {ACHIEVEMENT_CHARACTERS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        )}
        <label className="ach-toggle">
          <input type="checkbox" checked={spoilers} onChange={(e) => setSpoilers(e.target.checked)} />
          <span>Show hidden requirements</span>
        </label>
      </div>

      <div className="ach-bar">
        <span className="muted small">
          Showing {list.length} · {shownDone} done
        </span>
        <div className="ach-bar__actions">
          <button type="button" className="btn btn--quiet" onClick={() => markShown(true)} disabled={shownDone === list.length}>
            Mark shown as done
          </button>
          <button type="button" className="btn btn--quiet" onClick={() => markShown(false)} disabled={shownDone === 0}>
            Clear shown
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="empty">
          No achievements match these filters.
          {filtersOn && ' Try clearing the search or a filter.'}
        </p>
      ) : (
        <ul className="ach-list">
          {list.map((a) => {
            const isDone = done.has(a.id);
            const hidden = a.tier === 'H' && !spoilers && !revealed.has(a.id);
            return (
              <li key={a.id} className={`ach${isDone ? ' ach--done' : ''}`} data-tier={a.tier.toLowerCase()}>
                <input
                  id={`ach-${a.id}`}
                  type="checkbox"
                  className="ach__check"
                  checked={isDone}
                  onChange={() => toggle(a.id)}
                />
                <Medal tier={a.tier} />
                <div className="ach__body">
                  <label htmlFor={`ach-${a.id}`} className="ach__name">{a.name}</label>
                  {hidden ? (
                    <button
                      type="button"
                      className="ach__reveal"
                      onClick={() => setRevealed((s) => new Set(s).add(a.id))}
                    >
                      Hidden achievement · show requirement
                    </button>
                  ) : (
                    <p className="ach__text">{a.text}</p>
                  )}
                </div>
                <span className="ach__meta">
                  {category === 'all' && <span className="ach__cat">{CAT_LABEL[a.category]}</span>}
                  <span className="ach__tier">{TIER_LABEL[a.tier]}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="ach-foot">
        <p className="muted small">
          Achievement list compiled from community sources (Aug 2026) and may lag behind new patches. Requirements are
          summaries; check the in-game text for exact wording.
        </p>
        <button
          type="button"
          className="btn btn--quiet"
          onClick={() => {
            if (stats.done && window.confirm('Clear all achievement progress saved in this browser?')) reset();
          }}
          disabled={stats.done === 0}
        >
          Reset all progress
        </button>
      </div>
    </div>
  );
}
