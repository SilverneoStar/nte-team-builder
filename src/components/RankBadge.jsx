// Rank badge in the style of the game's S / A / B icons: a dark disc with a
// heavy italic letter, gradient fill and a clean white outline.
const GRADIENTS = {
  S: ['#ffe866', '#ff9d3a', '#ff3d8f'],
  A: ['#ff7ad9', '#e04cff', '#9c46ff'],
  B: ['#c35bff', '#7f7dff', '#47d9ff'],
};

export default function RankBadge({ rank, size = 22 }) {
  const stops = GRADIENTS[rank] ?? ['#d7dbe4', '#a9b0bf', '#7d869a'];
  const id = `rank-grad-${rank}`;
  return (
    <svg className="rank-badge" width={size} height={size} viewBox="0 0 32 32" role="img" aria-label={`${rank}-rank`}>
      <defs>
        <linearGradient id={id} x1="0.3" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor={stops[0]} />
          <stop offset="0.5" stopColor={stops[1]} />
          <stop offset="1" stopColor={stops[2]} />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" className="rank-badge__disc" />
      {/* Placed by the letters' measured ink box (italic glyphs sit off their
          advance width), so S, A and B are centred in the disc. */}
      <text x="8.5" y="24" textAnchor="start" className="rank-badge__letter" fill={`url(#${id})`}>
        {rank}
      </text>
    </svg>
  );
}
