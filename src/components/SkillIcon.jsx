// A skill, passive or awakening icon on a dark disc (or nothing without one).
import { skillIconUrl } from '../lib/skillIcons.js';

export default function SkillIcon({ character, k, size = 34 }) {
  const src = skillIconUrl(character, k);
  if (!src) return null;
  return (
    <span className="skill-icon" style={{ width: size, height: size }} aria-hidden="true">
      <img src={src} alt="" width={size - 8} height={size - 8} loading="lazy" decoding="async" />
    </span>
  );
}
