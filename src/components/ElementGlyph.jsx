// Official element icon (or just its symbol), usable in HTML and inside SVG.
import { ELEMENT_BY_ID } from '../data/elements.js';
import { elementIconUrl, elementSymbolUrl } from '../lib/icons.js';

// Official element icon. Rendered as an <svg> wrapping an <image> so it works
// both in normal HTML and inside other SVG drawings (the Esper Cycle).
// `symbol`: the bare symbol with no round badge.
export default function ElementGlyph({ element, size = 16, title, x, y, symbol = false }) {
  const name = ELEMENT_BY_ID[element]?.name ?? element;
  return (
    <svg
      className="glyph"
      width={size}
      height={size}
      x={x}
      y={y}
      viewBox="0 0 20 20"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title ?? undefined}
    >
      {title && <title>{name}</title>}
      <image href={symbol ? elementSymbolUrl(element) : elementIconUrl(element)} width="20" height="20" />
    </svg>
  );
}
