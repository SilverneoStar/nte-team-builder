// A skill, passive or awakening icon on a dark disc (or nothing without one).
import { hasSkillIcons, skillIconUrl } from '../lib/skillIcons.js';
import { COMMUNITY_BUILDS, COMMUNITY_SOURCE } from '../data/communityBuilds.js';

/** Credit line for pages that show skill icons or community alternatives. */
export function SkillIconCredit({ character }) {
  const icons = hasSkillIcons(character);
  const community = !!COMMUNITY_BUILDS[character];
  if (!icons && !community) return null;
  return (
    <p className="muted small icon-credit">
      {icons && (
        <>
          Skill and awakening icons are from the game. Kit details cross-checked with{' '}
          <a href="https://www.ntebuild.com" target="_blank" rel="noopener noreferrer">
            NTEBuild
          </a>
          .{' '}
        </>
      )}
      {community && (
        <>
          Community alternatives from the{' '}
          <a href={COMMUNITY_SOURCE.url} target="_blank" rel="noopener noreferrer">
            {COMMUNITY_SOURCE.name}
          </a>{' '}
          sheet by {COMMUNITY_SOURCE.by}.
        </>
      )}
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
