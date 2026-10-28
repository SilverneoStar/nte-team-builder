// The team builder's synergy score, shown by Cortado: its face screen shows
// the rank letter, and the higher the score the happier it looks (a sweat drop
// at C, a smile from A, a wagging tail at S, sparkles at S+). The breakdown
// below says where the points came from (see lib/synergy.js). Ported from
// the ZZZ site, with NTE's own mechanics in the score.
import { useMemo, useState } from 'react';
import { MASCOT_HATS, Star, Tail } from './Mascot.jsx';
import { SYNERGY_MOODS as MOODS, SYNERGY_RANKS, SYNERGY_RANK_STOPS as RANK_STOPS, synergyScore } from '../lib/synergy.js';

const BASE = import.meta.env.BASE_URL;


/** Cortado with the rank letter on its face screen. */
function RankCortado({ rank }) {
  const stops = RANK_STOPS[rank];
  const mood = MOODS[rank];
  const gid = `syn-grad-${rank === 'S+' ? 'sp' : rank}`;
  return (
    <span className={`syn-cortado syn-cortado--${rank === 'S+' ? 'sp' : rank.toLowerCase()}`} aria-hidden="true">
      <span className="syn-cortado__rig">
        <svg className="mascot__layer mascot__layer--back" viewBox="0 0 64 64">
          {(rank === 'S' || rank === 'S+') && (
            <g className="syn-cortado__tail">
              <Tail d="M42 50 Q54 52 57 42 Q59.4 34 56 27.6" />
            </g>
          )}
        </svg>
        <img src={`${BASE}${MASCOT_HATS[0].file}`} alt="" className="syn-cortado__img" width="96" height="96" />
        <svg className="mascot__layer mascot__layer--front" viewBox="0 0 64 64">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              {stops.map((c, i) => (
                <stop key={c} offset={`${(i / (stops.length - 1)) * 100}%`} stopColor={c} />
              ))}
            </linearGradient>
          </defs>
          {/* The face screen, with the unibrow and the rank letter in place of eyes */}
          <rect x="20.2" y="27.2" width="23.6" height="13.1" rx="6.5" fill="#2E1F17" />
          <path d={mood.brow} stroke="#9A8F88" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          {rank !== 'C' && (
            <>
              <ellipse cx="22.6" cy="38" rx="1.6" ry="0.9" fill="#F4A7A0" />
              <ellipse cx="41.4" cy="38" rx="1.6" ry="0.9" fill="#F4A7A0" />
            </>
          )}
          <text
            x="32"
            y="38.4"
            textAnchor="middle"
            fontSize={rank === 'S+' ? 9.4 : 10.4}
            fontStyle="italic"
            fontWeight="900"
            fontFamily="Inter, 'Arial Black', sans-serif"
            fill={`url(#${gid})`}
            style={{ filter: 'drop-shadow(0 0 0.8px rgba(255,226,176,0.7))' }}
          >
            {rank}
          </text>
          {rank === 'C' && (
            <path
              className="syn-cortado__sweat"
              d="M47 24 Q49.4 27.4 47 29 Q44.6 27.4 47 24 Z"
              fill="#9fd4f0"
              stroke="#2B1D16"
              strokeWidth="0.5"
            />
          )}
          {rank === 'S+' && (
            <>
              <Star x={8} y={14} s={1.1} className="syn-cortado__star" />
              <Star x={57} y={18} s={0.9} className="syn-cortado__star syn-cortado__star--2" />
              <Star x={52} y={4} s={0.7} className="syn-cortado__star syn-cortado__star--3" />
            </>
          )}
        </svg>
      </span>
    </span>
  );
}

export default function SynergyScore({ members, loadouts }) {
  const [open, setOpen] = useState(false);
  const result = useMemo(() => synergyScore(members, loadouts), [members, loadouts]);
  if (!result.filled) return null;
  const { score, rank, parts } = result;
  const mood = MOODS[rank].word;
  const geared = parts.some((p) => p.id === 'gear');
  const next = [...SYNERGY_RANKS].reverse().find((r) => r.min > score);
  return (
    <section className="syn" aria-label={`Synergy score ${score} out of 100, rank ${rank}`}>
      <RankCortado rank={rank} />
      <div className="syn__body">
        <span className="syn__label">Synergy score</span>
        <span className="syn__score">
          <b>{score}</b>
          <span className="muted">/100</span>
          <span className="syn__mood">Cortado is {mood.toLowerCase()}</span>
        </span>
        {/* Rounded fill inside the frame, coloured by the full scale */}
        <div className="syn__bar" role="presentation">
          <span className="syn__bar-fill" style={{ width: `${score}%`, '--fill': Math.max(1, score) }} />
        </div>
        <p className="muted small syn__hint">
          {result.filled < 4
            ? 'Add all four characters for the full score.'
            : next
              ? `${next.min - score} more for ${next.rank}.`
              : 'Top rank.'}{' '}
          {geared ? 'Includes the equipped gear. ' : 'Equip Arcs and Cartridges to count gear too. '}A guide
          to how well the team fits together, not to its damage.
        </p>
        <button type="button" className="syn-btn" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? 'Hide breakdown' : 'Show breakdown'}
        </button>
        {open && (
          <ul className="syn__parts">
            {parts.map((p) => (
              <li key={p.id}>
                <span className="syn__part-head">
                  <b>{p.label}</b>
                  <span>{p.bonus ? `+${p.points}` : `${p.points}/${p.max}`}</span>
                </span>
                <span className="syn__part-bar">
                  <span style={{ width: `${(p.points / p.max) * 100}%` }} />
                </span>
                <span className="muted small">{p.detail}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
