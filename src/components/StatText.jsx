// Game text with stat names and numbers highlighted.
import { statParts } from '../lib/statText.js';

// Game text with stat names and values highlighted.
export default function StatText({ children }) {
  if (typeof children !== 'string') return children ?? null;
  return statParts(children).map((p, i) =>
    p.t === 'text' ? (
      p.s
    ) : (
      <b key={i} className={p.t === 'key' ? 'hl-key' : 'hl-num'}>
        {p.s}
      </b>
    ),
  );
}
