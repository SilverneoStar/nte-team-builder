// Small icons for the in-game role tags (Main DPS, Burst DPS, Summoner...).
// Main DPS, Burst DPS, Summoner, Instant Cycle and DMG Boost use the game's own
// marks (GAME_MARKS); the rest are drawn in the same style. They take
// the text colour (white on the game-coloured tag pills).

/**
 * The game's pill colour group for a tag: damage (red), support (orange),
 * cycle (pink), DoT (dusty rose), follow-up (olive) or healing (green).
 */
const OWN_KIND = { 'Instant Cycle': 'cycle', DoT: 'dot', 'Follow-up Attack': 'fua', Healing: 'heal' };
export const tagKind = (tag) =>
  OWN_KIND[tag] ??
  (['DMG Boost', 'Summoner', 'Shield', 'Control', 'RES Shred', 'DMG Redirection'].includes(tag) ? 'support' : 'damage');

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' };

const ICONS = {
  // Game mark: a snow-capped peak over a ring.
  'Main DPS': (
    <>
      <path d="M12 2.5 21 13.6q-1.8-1.4-3 .4-1.4-1.6-2.8.2-1.5-1.7-3.2.2-1.6-1.9-3.2-.2-1.4-1.8-2.8-.2-1.3-1.8-3 -.4Z" fill="currentColor" />
      <ellipse cx="12" cy="18.4" rx="9" ry="2.7" fill="none" stroke="currentColor" strokeWidth="1.9" />
    </>
  ),
  // Two smaller peaks: supporting damage.
  'Sub-DPS': (
    <>
      <path d="M8.5 6 14 14H3Z" fill="currentColor" />
      <path d="M16 9.5 21 16h-7.5Z" fill="currentColor" opacity="0.65" />
      <path d="M3.5 18.5h17" {...S} />
    </>
  ),
  // Game mark: a jagged burst with a crack at its base.
  'Burst DPS': (
    <path
      fillRule="evenodd"
      fill="currentColor"
      d="M12 2 14.3 8.3 18.6 5.2 17.5 10.5 22 11.5 18.4 14.6 21 19.8 15.6 18.6 12 22 8.4 18.6 3 19.8 5.6 14.6 2 11.5 6.5 10.5 5.4 5.2 9.7 8.3Zm-1.8 14.4 1.4-2 1.2 1.4 1.6-2.4-.9 3.4-1.3-1.2-1.4 2.2Z"
    />
  ),
  // Game mark: a broken ring with arrows, a four-point burst inside.
  'Instant Cycle': (
    <>
      <path d="M5.2 8.6A7.8 7.8 0 0 1 12 4.2" {...S} />
      <path d="M15.4 4.9A7.8 7.8 0 0 1 19.6 10.6" {...S} />
      <path d="M19.4 14.4A7.8 7.8 0 0 1 14.2 19.5" {...S} />
      <path d="M10 19.6A7.8 7.8 0 0 1 4.4 13.8" {...S} />
      <path d="m10.4 2.6 2 1.6-1.8 1.8M21.4 9.2l-1.8 1.4-1.6-2M13.8 21.4l.4-1.9 2.3.4M2.6 15.4l1.8-1.6 1.6 2" {...S} strokeWidth="1.6" />
      <path d="M12 7.6 13.2 10.8 16.4 12 13.2 13.2 12 16.4 10.8 13.2 7.6 12 10.8 10.8Z" fill="currentColor" />
    </>
  ),
  // Game mark: a raised sword over an eye.
  'DMG Boost': (
    <>
      <path d="M15.8 2.6 19.6 4 18.2 7.9 11.6 14.5 9.6 12.5Z" fill="currentColor" />
      <path d="M7.6 11.6 12.4 16.4M9.2 15 5 19.2M4.2 17.6l2.2 2.2" {...S} strokeWidth="2" />
      <path d="M13 18.6q4.5-4.6 9 0-4.5 4.6-9 0Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="18.6" r="1.4" fill="currentColor" />
    </>
  ),
  // Game mark: two interlocked triangles with a sparkle in the middle.
  Summoner: (
    <>
      <path d="M12 2.8 20.6 17.6H3.4Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 21.2 3.4 6.4h17.2Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 8.2 13.1 10.9 15.8 12 13.1 13.1 12 15.8 10.9 13.1 8.2 12 10.9 10.9Z" fill="currentColor" />
    </>
  ),
  // A drop that keeps dripping.
  DoT: (
    <>
      <path d="M11 3s-5.5 6.3-5.5 10.3a5.5 5.5 0 0 0 11 0C16.5 9.3 11 3 11 3Z" fill="currentColor" />
      <path d="M19.5 15.5v1.2M19.5 19.6v.4" {...S} />
    </>
  ),
  // A cracked block.
  'Break Boost': (
    <>
      <path d="M11 3 4 10.5l4.5 4.5L6.5 21 11.5 14 9 11.5Z" fill="currentColor" />
      <path d="M14 3.5 20 10.5 13.5 20.5 15.5 13l-3-2.5Z" fill="currentColor" opacity="0.65" />
    </>
  ),
  // A hit turned aside.
  'DMG Redirection': (
    <>
      <path d="M3.5 7h8a5 5 0 0 1 0 10H8" {...S} />
      <path d="m10.5 13.5-3.5 3.5 3.5 3.5" {...S} />
      <path d="M18 4.5 21 7l-3 2.5" {...S} />
    </>
  ),
  // A cross in a ring.
  Healing: (
    <>
      <circle cx="12" cy="12" r="8.6" {...S} />
      <path d="M10 6.8h4v3.2h3.2v4H14v3.2h-4V14H6.8v-4H10Z" fill="currentColor" />
    </>
  ),
  // A ring held in place from four sides.
  Control: (
    <>
      <circle cx="12" cy="12" r="5.2" {...S} />
      <path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4" {...S} />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
    </>
  ),
  // A shield torn by claw marks.
  'RES Shred': (
    <>
      <path d="M12 3 19 5.8v5.4c0 4.4-3 7.6-7 9.3-4-1.7-7-4.9-7-9.3V5.8Z" {...S} />
      <path d="m9.2 8.2-1.4 6M12.8 8.2l-1.4 6M16.4 8.2 15 14" {...S} strokeWidth="1.8" />
    </>
  ),
  // Two strikes in a row.
  'Follow-up Attack': (
    <>
      <path d="m4 6 6 6-6 6" {...S} />
      <path d="m12 6 6 6-6 6" {...S} />
      <path d="M21 8v8" {...S} />
    </>
  ),
  // A solid shield with a highlight.
  Shield: (
    <>
      <path d="M12 2.8 19.5 5.8v5.6c0 4.6-3.2 7.9-7.5 9.8-4.3-1.9-7.5-5.2-7.5-9.8V5.8Z" fill="currentColor" />
      <path d="M9 8v6.5" stroke="var(--surface, #16171c)" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  // Close range: a short blade.
  Melee: (
    <>
      <path d="M19.5 4.5 9 15" {...S} />
      <path d="m6.5 12.5 5 5M5.5 18.5 3.5 20.5" {...S} />
    </>
  ),
};

// The game's own tag marks, cut from in-game screenshots (white on transparent),
// drawn as a mask so they take the text colour like the drawn ones.
const GAME_MARKS = {
  'Main DPS': 'main-dps',
  'Burst DPS': 'burst-dps',
  Summoner: 'summoner',
  'Instant Cycle': 'instant-cycle',
  'DMG Boost': 'dmg-boost',
  DoT: 'dot',
  'Follow-up Attack': 'follow-up-attack',
  Healing: 'healing',
};

export const hasTagIcon = (tag) => tag in ICONS || tag in GAME_MARKS;

export default function TagIcon({ tag, size = 16 }) {
  if (GAME_MARKS[tag]) {
    const url = `url(${import.meta.env.BASE_URL}icons/tags/${GAME_MARKS[tag]}.webp)`;
    return (
      <span
        className="tag-icon tag-icon--mark"
        style={{ width: size + 5, height: size + 5, WebkitMaskImage: url, maskImage: url }}
        aria-hidden="true"
      />
    );
  }
  const icon = ICONS[tag];
  if (!icon) return null;
  return (
    <svg className="tag-icon" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      {icon}
    </svg>
  );
}
