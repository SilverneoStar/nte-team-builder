// A skill, passive or awakening icon on a dark disc (or nothing without one).
import { hasSkillIcons, skillIconUrl } from '../lib/skillIcons.js';

/** Credit line for pages that show skill icons. */
export function SkillIconCredit({ character }) {
  if (!hasSkillIcons(character)) return null;
  return (
    <p className="muted small icon-credit">
      Skill and awakening icons are from the game. Kit details cross-checked with{' '}
      <a href="https://www.ntebuild.com" target="_blank" rel="noopener noreferrer">
        NTEBuild
      </a>
      .
    </p>
  );
}

export default function SkillIcon({ character, k, size = 42 }) {
  const src = skillIconUrl(character, k);
  if (!src) return null;
  return (
    <span className="skill-icon" style={{ width: size, height: size }} aria-hidden="true">
      <img src={src} alt="" width={size - 6} height={size - 6} loading="lazy" decoding="async" />
    </span>
  );
}
