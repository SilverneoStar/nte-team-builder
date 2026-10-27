// Small material icon, or a coloured letter tile when there's no icon.
import { materialIconUrl } from '../lib/icons.js';

// Tile colours for materials without an icon, picked from the name so each item keeps its colour.
const TILE = ['#c2185b', '#3245d1', '#2e9e6b', '#b8781f', '#7b4fb8', '#1f8fb8'];

// Official material icon, or a coloured tile with the item's first letter.
export default function MaterialIcon({ name, size = 30 }) {
  const src = materialIconUrl(name);
  if (!src) {
    const n = [...(name || '?')].reduce((a, ch) => a + ch.charCodeAt(0), 0);
    return (
      <span
        className="mat-icon mat-icon--letter"
        style={{ width: size, height: size, background: TILE[n % TILE.length], fontSize: size * 0.48 }}
        aria-hidden="true"
      >
        {(name || '?').trim()[0].toUpperCase()}
      </span>
    );
  }
  return <img className="mat-icon" src={src} width={size} height={size} alt="" loading="lazy" decoding="async" />;
}
