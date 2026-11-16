// The Endgame page: Hunter's Crucible bosses (weakness, resistance
// conditions, bonus objectives, rewards) with a score calculator.
// Special Route will join it later.
import { useMemo, useState } from 'react';
import { CRUCIBLE, CRUCIBLE_STAGE_BY_ID, conditionPoints, crucibleScore } from '../data/crucible.js';
import { CHARACTERS, CHARACTER_BY_ID } from '../data/characters.js';
import { ELEMENT_BY_ID } from '../data/elements.js';
import { navigate } from '../lib/route.js';
import ElementGlyph from './ElementGlyph.jsx';
import MaterialIcon from './MaterialIcon.jsx';
import Portrait from './Portrait.jsx';

// "A, B or C"
const orList = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} or ${xs.at(-1)}`);
const fmt = (n) => n.toLocaleString('en-US');
const STAGES = CRUCIBLE.stages;
const blankPicks = () => ({ difficulty: 'easy', objectives: [], time: -1, hp: -1, atk: -1, res: {} });

// One row of mutually exclusive condition options (plus "None").
function OptionRow({ label, options, value, onChange, stage }) {
  return (
    <div className="crux-row">
      <span className="crux-row__label">{label}</span>
      <div className="chips" role="group" aria-label={label}>
        <button type="button" className="chip" aria-pressed={value === -1} onClick={() => onChange(-1)}>
          None
        </button>
        {options.map((o, i) => (
          <button key={o.label} type="button" className="chip" aria-pressed={value === i} onClick={() => onChange(i)}>
            {o.label} <span className="crux-pts">+{fmt(conditionPoints(stage, o.points))}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ElementName({ id }) {
  return (
    <span className="crux-el">
      <ElementGlyph element={id} size={16} />
      {ELEMENT_BY_ID[id]?.name ?? id}
    </span>
  );
}

export default function EndgamePage({ stageId, activeTeam }) {
  const stage = CRUCIBLE_STAGE_BY_ID[stageId] ?? STAGES[0];
  // Picks per stage, kept while you switch between bosses.
  const [allPicks, setAllPicks] = useState({});
  const picks = allPicks[stage.id] ?? blankPicks();
  const setPicks = (patch) => setAllPicks((p) => ({ ...p, [stage.id]: { ...picks, ...patch } }));
  const score = crucibleScore(stage, picks);
  const C = CRUCIBLE.conditions;

  // The active team's elements: Resistance Up for any other element costs nothing.
  const teamEls = useMemo(
    () => new Set((activeTeam?.members ?? []).filter(Boolean).map((id) => CHARACTER_BY_ID[id]?.element)),
    [activeTeam],
  );
  const freeRes = teamEls.size ? (stage.resists ?? []).filter((el) => !teamEls.has(el)) : [];
  const hitters = stage.weakness
    ? CHARACTERS.filter((c) => c.element === stage.weakness && !c.upcoming)
    : [];
  const levels = Object.entries(stage.levels ?? {}).filter(([, v]) => v);

  return (
    <div className="page">
      <header className="page__head">
        <h2 className="page__title">Endgame</h2>
        <p className="muted">
          Hunter’s Crucible: pick a boss for its rules, rewards and a score calculator. Special Route comes later.
        </p>
      </header>

      <div className="chips crux-stages" role="group" aria-label="Hunter’s Crucible stages">
        {STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`chip${s.tallyOnly ? ' crux-stage--tally' : ''}`}
            aria-pressed={s.id === stage.id}
            onClick={() => navigate(`endgame-${s.id}`)}
          >
            {s.weakness && <ElementGlyph element={s.weakness} size={16} />}
            {s.boss}
          </button>
        ))}
      </div>

      <section className="crux">
        <div className="crux__head">
          <div>
            <p className="crux__stage">
              {stage.name}
              {stage.tallyOnly && <span className="crux-tag">Tally only</span>}
            </p>
            <h3 className="crux__boss">{stage.boss}</h3>
            {levels.length > 0 && (
              <p className="muted crux__levels">
                {levels
                  .map(([d, lv]) => `Lv ${lv} on ${CRUCIBLE.difficulties.find((x) => x.id === d)?.label ?? d}`)
                  .join(' · ')}
              </p>
            )}
          </div>
          <dl className="crux__facts">
            <div>
              <dt>Weak to</dt>
              <dd>{stage.weakness ? <ElementName id={stage.weakness} /> : <span className="muted">None shown</span>}</dd>
            </div>
            <div>
              <dt>Resistance conditions</dt>
              <dd className="crux__els">
                {(stage.resists ?? []).map((el) => (
                  <ElementName key={el} id={el} />
                ))}
              </dd>
            </div>
          </dl>
        </div>
        {stage.about && <p className="crux__about">{stage.about}</p>}
        {stage.tallyOnly && (
          <p className="banner">
            This stage gives no rewards of its own. Its score counts toward the {fmt(CRUCIBLE.scoreRewardTotal)}{' '}
            Score Reward total, and its conditions are worth {CRUCIBLE.tallyMultiplier}× the usual points.
          </p>
        )}

        <h4 className="crux__h">Score calculator</h4>
        <div className="crux-row">
          <span className="crux-row__label">Difficulty</span>
          <div className="chips" role="group" aria-label="Difficulty">
            {CRUCIBLE.difficulties.map((d) => (
              <button
                key={d.id}
                type="button"
                className="chip"
                aria-pressed={picks.difficulty === d.id}
                onClick={() => setPicks({ difficulty: d.id })}
              >
                {d.label} <span className="crux-pts">×{d.multiplier}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="crux-row crux-row--stack">
          <span className="crux-row__label">Bonus objectives</span>
          <ul className="crux-objs">
            {(stage.bonusObjectives ?? []).map((o, i) => (
              <li key={i}>
                <label className="crux-obj">
                  <input
                    type="checkbox"
                    checked={picks.objectives.includes(i)}
                    onChange={(e) =>
                      setPicks({
                        objectives: e.target.checked
                          ? [...picks.objectives, i]
                          : picks.objectives.filter((x) => x !== i),
                      })
                    }
                  />
                  <span>{o.text}</span>
                  <span className="crux-pts">+{fmt(o.points)}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <OptionRow label="Target time" options={C.targetTime} value={picks.time} onChange={(time) => setPicks({ time })} stage={stage} />
        <OptionRow label="Enemy HP Up" options={C.enemyHp} value={picks.hp} onChange={(hp) => setPicks({ hp })} stage={stage} />
        <OptionRow label="Enemy ATK Up" options={C.enemyAtk} value={picks.atk} onChange={(atk) => setPicks({ atk })} stage={stage} />
        {(stage.resists ?? []).map((el) => (
          <OptionRow
            key={el}
            label={`${ELEMENT_BY_ID[el]?.name} Resistance Up`}
            options={C.resistance}
            value={picks.res[el] ?? -1}
            onChange={(v) => setPicks({ res: { ...picks.res, [el]: v } })}
            stage={stage}
          />
        ))}

        {freeRes.length > 0 && (
          <p className="crux-free">
            Your team “{activeTeam.name}” doesn’t deal {orList(freeRes.map((el) => ELEMENT_BY_ID[el].name))}{' '}
            damage, so {freeRes.length === 1 ? 'that resistance is' : 'those resistances are'} free points.{' '}
            <button
              type="button"
              className="btn btn--quiet btn--small"
              onClick={() =>
                setPicks({ res: { ...picks.res, ...Object.fromEntries(freeRes.map((el) => [el, C.resistance.length - 1])) } })
              }
            >
              Take them at +30%
            </button>
          </p>
        )}

        <div className="crux-total" aria-live="polite">
          <span>
            ({fmt(score.basic)} basic + {fmt(score.conditions)} conditions) × {score.multiplier}
          </span>
          <strong>{fmt(score.total)}</strong>
          <button type="button" className="btn btn--quiet btn--small" onClick={() => setPicks(blankPicks())}>
            Reset
          </button>
        </div>

        {hitters.length > 0 && (
          <>
            <h4 className="crux__h">Espers that hit its weakness</h4>
            <ul className="crux-espers">
              {hitters.map((c) => (
                <li key={c.id}>
                  <a href={`#character-${c.id}`} className="crux-esper">
                    <Portrait character={c} size="md" />
                    <span>{c.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}

        {!stage.tallyOnly && (
          <>
            <h4 className="crux__h">Rewards (once per stage, by best score)</h4>
            <ul className="crux-rewards">
              {CRUCIBLE.milestones.map((m) => (
                <li key={m.score} className={score.total >= m.score ? 'is-reached' : undefined}>
                  <span className="crux-rewards__score">{fmt(m.score)}</span>
                  <span className="crux-rewards__items">
                    {m.rewards.map(([name, n]) => (
                      <span key={name} className="crux-item" title={name}>
                        <MaterialIcon name={name} size={28} />
                        <span>
                          {name} ×{fmt(n)}
                        </span>
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
