// Arc-type design shown behind a character's portrait (site version of the card backdrop).
import { PATTERN_OPACITY, arcPatternUrl } from '../lib/arcPattern.js';

// The design of the character's Arc type, behind their portrait. Same look as
// on the export cards. Place inside a positioned box.
export default function ArcBackdrop({ arcType }) {
  const src = arcPatternUrl(import.meta.env.BASE_URL, arcType);
  if (!src) return null;
  return <span className="arc-backdrop" aria-hidden="true" style={{ backgroundImage: `url(${src})`, opacity: PATTERN_OPACITY }} />;
}
