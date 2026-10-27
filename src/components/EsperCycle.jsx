// The Esper Cycle ring, lighting up the reactions the team can trigger.
import { ELEMENTS, PAIR_REACTIONS } from '../data/elements.js';
import ElementGlyph from './ElementGlyph.jsx';

// The Esper Cycle drawn as a ring line with six stations.
// A segment lights up when the team has both elements on either end of it.
const SIZE = 300;
const C = SIZE / 2;
const R = 96;

// Extra room on each side so side labels never touch the drawing's edge.
const PAD_X = 56;

// Where an element's name sits: above/below the top and bottom stations,
// and beside the side stations, anchored to the disc's outer edge.
function labelPosition(i) {
  const [x, y] = point(i);
  const dx = x - C;
  if (Math.abs(dx) < 1) return { x, y: y + (y < C ? -30 : 31), anchor: 'middle' };
  return dx > 0 ? { x: x + 24, y, anchor: 'start' } : { x: x - 24, y, anchor: 'end' };
}

const point = (i, r = R) => {
  const a = (Math.PI * 2 * i) / ELEMENTS.length - Math.PI / 2;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
};

export default function EsperCycle({ elementCounts, reactions, trios }) {
  const active = new Set(reactions.map((r) => r.id));

  return (
    <figure className="cycle">
      <svg
        viewBox={`${-PAD_X} 0 ${SIZE + PAD_X * 2} ${SIZE}`}
        role="img"
        aria-label="Esper Cycle with this team's elements and reactions"
      >
        {/* Segments between neighbouring stations */}
        {ELEMENTS.map((el, i) => {
          const j = (i + 1) % ELEMENTS.length;
          const reaction = PAIR_REACTIONS.find(
            (r) => r.elements.includes(el.id) && r.elements.includes(ELEMENTS[j].id),
          );
          const lit = active.has(reaction.id);
          const [x1, y1] = point(i);
          const [x2, y2] = point(j);
          const [lx, ly] = point(i + 0.5, R - 34);
          return (
            <g key={reaction.id} className={lit ? 'seg seg--lit' : 'seg'}>
              <path d={`M${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2}`} />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle">
                {reaction.name}
              </text>
            </g>
          );
        })}

        {/* Stations */}
        {ELEMENTS.map((el, i) => {
          const [x, y] = point(i);
          const label = labelPosition(i);
          const count = elementCounts[el.id] || 0;
          return (
            <g
              key={el.id}
              className={count ? 'station station--on' : 'station'}
              style={{ '--glow': `var(--elb-${el.id})` }}
            >
              <circle cx={x} cy={y} r="17" style={count ? { stroke: `var(--elb-${el.id})` } : undefined} />
              <ElementGlyph element={el.id} size={34} x={x - 17} y={y - 17} />
              {count > 1 && (
                <g className="station__count">
                  <circle cx={x + 14} cy={y - 14} r="8" />
                  <text x={x + 14} y={y - 13.5} textAnchor="middle" dominantBaseline="middle">
                    {count}
                  </text>
                </g>
              )}
              <text
                className="station__name"
                x={label.x}
                y={label.y}
                textAnchor={label.anchor}
                dominantBaseline="middle"
              >
                {el.name}
              </text>
            </g>
          );
        })}

        {/* Hub */}
        <g className="hub">
          <text x={C} y={C - 8} textAnchor="middle" className="hub__num">
            {reactions.length}
          </text>
          <text x={C} y={C + 12} textAnchor="middle" className="hub__label">
            {reactions.length === 1 ? 'reaction' : 'reactions'}
          </text>
          {trios.map((t, k) => (
            <text key={t.id} x={C} y={C + 30 + k * 14} textAnchor="middle" className="hub__trio">
              + {t.name}
            </text>
          ))}
        </g>
      </svg>
    </figure>
  );
}
