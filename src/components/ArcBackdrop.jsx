import { PATTERN_OPACITY, arcDiscUrl } from '../lib/arcPattern.js';

// The pattern of the character's Arc type, faded in behind their portrait.
// Same look as on the export cards. Place inside a positioned box.
export default function ArcBackdrop({ arcType }) {
  const src = arcDiscUrl(import.meta.env.BASE_URL, arcType);
  if (!src) return null;
  return <span className="arc-backdrop" aria-hidden="true" style={{ backgroundImage: `url(${src})`, opacity: PATTERN_OPACITY * 0.85 }} />;
}
