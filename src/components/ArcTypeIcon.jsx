// Small official Arc type icon.
import { arcTypeIconUrl } from '../lib/icons.js';

// Official Arc type icon (Solid, Liquid, Gas, Plasma, Condensate).
export default function ArcTypeIcon({ type, size = 16 }) {
  if (!type) return null;
  return (
    <img
      className="arctype-icon"
      src={arcTypeIconUrl(type)}
      width={size}
      height={size}
      alt=""
      loading="lazy"
      decoding="async"
    />
  );
}
