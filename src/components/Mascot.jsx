// Cortado, the site mascot, with its hats and little animations.
import { useEffect, useRef, useState } from 'react';

// Cortado, the mascot: an anomaly that runs on coffee. Its headwear doubles as
// the lid over a hatch where coffee (or beans/powder and hot water) is poured
// in, and every hat carries its silver star. It usually floats; retractable
// wheels come out only when it's tired of floating or needs to dash. Its
// fluffy, ringed brown-and-cream tail (a little like a red panda's) stays out
// of sight from the front: at rest it wraps a small grip rung on the back,
// taking the shape of a mug handle to carry it by. It only shows from the
// front when wagging or in a fight. A grey unibrow sits on its face screen,
// and its hi-vis belt is an inflatable layer of its own that puffs up into a
// float ring by itself in water.
//
// Clicking Cortado plays the next emote. One of them swaps its headwear.
export const MASCOT_HATS = [
  { file: 'mascot.svg', label: 'Hard hat' },
  { file: 'mascot-beanie.svg', label: 'Knit beanie' },
  { file: 'mascot-beret.svg', label: 'Barista beret' },
  { file: 'mascot-lid.svg', label: 'Coffee cup lid' },
];
const HAT_KEY = 'nte-team-builder:mascotHat';

// Played in this order, one per click. `ms` matches the CSS animation length.
const EMOTES = [
  { id: 'wag', label: 'wags its tail', ms: 1200 },
  { id: 'hop', label: 'hops', ms: 900 },
  { id: 'hat', label: 'swaps its headwear', ms: 800 },
  { id: 'dash', label: 'dashes on its wheels', ms: 1100 },
  { id: 'swim', label: 'inflates its float belt', ms: 1600 },
  { id: 'sparkle', label: 'sparkles after a refill', ms: 1200 },
  { id: 'charge', label: 'goes into charging mode', ms: 2600 },
  { id: 'dice', label: 'rolls dice eyes', ms: 2000 },
];
// Dice eyes: faces flicker while they tumble, then land on the rolled values.
const DICE_ROLL_MS = 1000;
const DICE_TICK_MS = 85;
const d6 = () => 1 + Math.floor(Math.random() * 6);
// Pip positions for each face, as [col, row] in a 3×3 grid (-1..1).
const PIPS = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};
function Die({ cx, cy, value, fill, className }) {
  const s = 7.6;
  return (
    <g className={className}>
      <rect x={cx - s / 2} y={cy - s / 2} width={s} height={s} rx="1.6" fill={fill} stroke="#2B1D16" strokeWidth="0.7" />
      <path d={`M${cx - s / 2 + 1.2} ${cy - s / 2 + 1} h${s - 3}`} stroke="#ffffff" strokeOpacity="0.45" strokeWidth="0.7" strokeLinecap="round" />
      {PIPS[value].map(([c, r], i) => (
        <circle key={i} cx={cx + c * 2.1} cy={cy + r * 2.1} r="0.78" fill="#FFF9F0" />
      ))}
    </g>
  );
}
const HAT_SWAP_AT = 300;

const loadHat = () => {
  try {
    const n = Number(localStorage.getItem(HAT_KEY));
    return Number.isInteger(n) && n >= 0 && n < MASCOT_HATS.length ? n : 0;
  } catch {
    return 0;
  }
};

// The fluffy ringed tail, drawn in four layers like the concept sheet.
function Tail({ d }) {
  return (
    <>
      <path d={d} stroke="#2B1D16" strokeWidth="7.8" fill="none" strokeLinecap="round" strokeDasharray="0.01 2.6" />
      <path d={d} stroke="#2B1D16" strokeWidth="6.8" fill="none" strokeLinecap="round" />
      <path d={d} stroke="#7A5238" strokeWidth="5.2" fill="none" strokeLinecap="round" />
      <path d={d} stroke="#F3E3C8" strokeWidth="5.2" fill="none" strokeDasharray="2.6 2.6" />
    </>
  );
}

// The unibrow for each face, on the face screen above the eyes.
const BROWS = {
  happy: 'M24.2 28.3 Q28 27 32 27.9 Q36 27 39.8 28.3',
  sparkle: 'M24.2 28.3 Q28 27 32 27.9 Q36 27 39.8 28.3',
  focused: 'M24 28.2 Q28 28.6 32 30.2 Q36 28.6 40 28.2',
  dice: 'M23.8 28.2 Q27.6 26.6 32 27.6 Q36.4 26.6 40.2 28.2',
  battery: 'M24.2 28.6 Q28 29.2 32 28.8 Q36 29.2 39.8 28.6',
};

// A face-screen patch drawn over the mascot's own eyes and unibrow (same 64×64 grid as mascot.svg).
function Face({ kind, dice }) {
  const glow = { filter: 'drop-shadow(0 0 0.8px #FFE2B0)' };
  return (
    <g>
      <rect x="20.2" y="27.2" width="23.6" height="13.1" rx="6.5" fill="#2E1F17" />
      <path d={BROWS[kind]} stroke="#9A8F88" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="22.6" cy="38" rx="1.6" ry="0.9" fill="#F4A7A0" />
      <ellipse cx="41.4" cy="38" rx="1.6" ry="0.9" fill="#F4A7A0" />
      {kind === 'happy' && (
        <g stroke="#FFE2B0" strokeWidth="2" fill="none" strokeLinecap="round" style={glow}>
          <path d="M24.4 35 Q27 30.6 29.6 35" />
          <path d="M34.4 35 Q37 30.6 39.6 35" />
        </g>
      )}
      {kind === 'focused' && (
        <g fill="#FFE2B0" stroke="#FFE2B0" strokeWidth="0.8" strokeLinejoin="round" style={glow}>
          <path d="M24.3 31.4 L29.7 33.2 L29.7 36.6 L24.3 36.6 Z" />
          <path d="M39.7 31.4 L34.3 33.2 L34.3 36.6 L39.7 36.6 Z" />
        </g>
      )}
      {kind === 'battery' && (
        <g>
          {/* Both eyes merge into one battery; coffee fills it from the base toward the tip */}
          <clipPath id="cortado-batt-clip">
            <rect x="25.3" y="30.9" width="12.4" height="6.2" rx="0.9" />
          </clipPath>
          <linearGradient id="cortado-coffee" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6B4329" />
            <stop offset="70%" stopColor="#B07646" />
            <stop offset="100%" stopColor="#E7B27A" />
          </linearGradient>
          <g style={glow} className="mascot__batt">
            <rect x="24.2" y="29.8" width="14.6" height="8.4" rx="1.8" fill="none" stroke="#FFE2B0" strokeWidth="1.1" />
            <rect x="39.2" y="32.3" width="1.7" height="3.4" rx="0.6" fill="#FFE2B0" />
          </g>
          <g clipPath="url(#cortado-batt-clip)">
            <g className="mascot__coffee">
              <path
                d="M12 30 H37.8 Q38.8 31.2 37.8 32.4 T37.8 34.8 T37.8 37.2 Q38.2 37.8 37.8 38.4 H12 Z"
                fill="url(#cortado-coffee)"
              />
              <path
                d="M37.8 30 Q38.8 31.2 37.8 32.4 T37.8 34.8 T37.8 37.2 Q38.2 37.8 37.8 38.4"
                stroke="#FFE2B0"
                strokeWidth="0.5"
                fill="none"
              />
            </g>
          </g>
        </g>
      )}
      {kind === 'dice' && dice && (
        <g>
          <Die cx={27} cy={33.8} value={dice[0]} fill="#D9434E" className="mascot__die" />
          <Die cx={37} cy={33.8} value={dice[1]} fill="#3F7FD8" className="mascot__die mascot__die--2" />
        </g>
      )}
      {kind === 'sparkle' && (
        <g fill="#FFE2B0" style={glow}>
          <path d="M27 29.8 Q27.6 33 30.8 33.6 Q27.6 34.2 27 37.4 Q26.4 34.2 23.2 33.6 Q26.4 33 27 29.8 Z" />
          <path d="M37 29.8 Q37.6 33 40.8 33.6 Q37.6 34.2 37 37.4 Q36.4 34.2 33.2 33.6 Q36.4 33 37 29.8 Z" />
        </g>
      )}
    </g>
  );
}

// The CSS animation scales the wrapper; the inner path keeps its own transform.
const Star = ({ x, y, s = 1, className }) => (
  <g className={className}>
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -3 Q0.5 -0.5 3 0 Q0.5 0.5 0 3 Q-0.5 0.5 -3 0 Q-0.5 -0.5 0 -3 Z"
      fill="#FFE2B0"
      stroke="#2B1D16"
      strokeWidth="0.5"
    />
  </g>
);

export default function Mascot() {
  const [hat, setHat] = useState(loadHat);
  const [emote, setEmote] = useState(null); // { id, n }
  const [dice, setDice] = useState([1, 1]);
  const next = useRef(0);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach((t) => { clearTimeout(t); clearInterval(t); }), []);

  function swapHat() {
    setHat((h) => {
      const n = (h + 1) % MASCOT_HATS.length;
      try {
        localStorage.setItem(HAT_KEY, String(n));
      } catch {
        /* storage unavailable */
      }
      return n;
    });
  }

  function play() {
    timers.current.forEach((t) => { clearTimeout(t); clearInterval(t); });
    const e = EMOTES[next.current];
    next.current = (next.current + 1) % EMOTES.length;
    // A new key restarts the CSS animation even when the same emote repeats.
    setEmote({ id: e.id, n: Date.now() });
    if (e.id === 'dice') {
      const final = [d6(), d6()];
      const tick = setInterval(() => setDice([d6(), d6()]), DICE_TICK_MS);
      timers.current.push(tick);
      timers.current.push(setTimeout(() => { clearInterval(tick); setDice(final); }, DICE_ROLL_MS));
    }
    if (e.id === 'hat') timers.current.push(setTimeout(swapHat, HAT_SWAP_AT));
    timers.current.push(setTimeout(() => setEmote(null), e.ms));
  }

  const id = emote?.id;
  const face = { wag: 'happy', hop: 'happy', dash: 'focused', swim: 'happy', sparkle: 'sparkle', charge: 'battery', dice: 'dice' }[id];

  return (
    <button
      type="button"
      className="brand__mascot-btn"
      onClick={play}
      title={`Cortado · ${MASCOT_HATS[hat].label} (click for an emote)`}
      aria-label={`Cortado, the site mascot, wearing a ${MASCOT_HATS[hat].label.toLowerCase()}. Play an emote`}
    >
      <span key={emote?.n ?? 'idle'} className={`mascot${id ? ` mascot--${id}` : ''}`}>
        <span className="mascot__rig">
          {/* Behind the body: tail, wheels, speed lines */}
          <svg className="mascot__layer mascot__layer--back" viewBox="0 0 64 64" aria-hidden="true">
            {id === 'wag' && (
              <g className="mascot__tail">
                <Tail d="M42 50 Q54 52 57 42 Q59.4 34 56 27.6" />
              </g>
            )}
            {id === 'dash' && (
              <>
                <g className="mascot__speed" stroke="#B8A898" strokeWidth="1.2" strokeLinecap="round">
                  <path d="M-6 30 L5 30" />
                  <path d="M-9 38 L3 38" />
                  <path d="M-5 46 L5 46" />
                </g>
                <g className="mascot__wheels">
                  <rect x="22.6" y="52" width="2.2" height="4.6" rx="0.6" fill="#C9D0D9" stroke="#2B1D16" strokeWidth="0.6" />
                  <rect x="39.2" y="52" width="2.2" height="4.6" rx="0.6" fill="#C9D0D9" stroke="#2B1D16" strokeWidth="0.6" />
                  <circle cx="23.7" cy="57.6" r="3" fill="#3A271D" stroke="#2B1D16" strokeWidth="1" />
                  <circle cx="23.7" cy="57.6" r="1.1" fill="#C9D0D9" />
                  <circle cx="40.3" cy="57.6" r="3" fill="#3A271D" stroke="#2B1D16" strokeWidth="1" />
                  <circle cx="40.3" cy="57.6" r="1.1" fill="#C9D0D9" />
                </g>
              </>
            )}
          </svg>
          <img
            src={`${import.meta.env.BASE_URL}${MASCOT_HATS[hat].file}`}
            alt=""
            className="brand__mascot"
            width="200"
            height="200"
          />
          {/* In front: new face and sparkles */}
          {(face || id === 'sparkle' || id === 'swim') && (
            <svg className="mascot__layer mascot__layer--front" viewBox="0 0 64 64" aria-hidden="true">
              {face && <Face kind={face} dice={dice} />}
              {id === 'charge' && (
                <g className="mascot__bolt" fill="#FFE2B0" stroke="#2B1D16" strokeWidth="0.5" strokeLinejoin="round">
                  <path d="M53.4 9.6 L50.2 15 L52.6 15 L51 19.8 L55 13.6 L52.4 13.6 Z" />
                </g>
              )}
              {id === 'swim' && (
                <>
                  {/* The float belt inflates into a ring, then the water rises around it */}
                  <g className="mascot__ring">
                    <path d="M10.6 44.4 Q32 55 53.4 44.4 Q57.6 48.6 53.4 52.8 Q32 63 10.6 52.8 Q6.4 48.6 10.6 44.4 Z" fill="#E8833A" stroke="#2B1D16" strokeWidth="1.1" />
                    <path d="M18 47.4 Q17 51.6 18 55.7 M25 49.1 Q24.2 53.2 25 57.3 M39 49.1 Q39.8 53.2 39 57.3 M46 47.4 Q47 51.6 46 55.7" stroke="#B4561C" strokeWidth="0.6" fill="none" strokeLinecap="round" />
                    <path d="M12.6 46.2 Q32 55.8 51.4 46.2" stroke="#F7B07A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                    <path d="M8.6 49.4 Q32 60.6 55.4 49.4" stroke="#2B1D16" strokeWidth="2" fill="none" />
                    <path d="M8.6 49.4 Q32 60.6 55.4 49.4" stroke="#E6EBF0" strokeWidth="1.2" fill="none" />
                    <circle cx="32" cy="55" r="1.7" fill="#D5DBE3" stroke="#2B1D16" strokeWidth="0.6" />
                  </g>
                  <g className="mascot__water">
                    <path d="M-10 57 Q-4 55 2 57 T14 57 T26 57 T38 57 T50 57 T62 57 T74 57 L74 66 L-10 66 Z" fill="#7FC4E2" opacity="0.6" />
                    <path d="M-10 57 Q-4 55 2 57 T14 57 T26 57 T38 57 T50 57 T62 57 T74 57" stroke="#3F8FB5" strokeWidth="0.8" fill="none" />
                  </g>
                </>
              )}
              {id === 'sparkle' && (
                <>
                  <Star x={8} y={14} s={1.1} className="mascot__star" />
                  <Star x={57} y={18} s={0.9} className="mascot__star mascot__star--2" />
                  <Star x={52} y={4} s={0.7} className="mascot__star mascot__star--3" />
                </>
              )}
            </svg>
          )}
        </span>
      </span>
    </button>
  );
}
