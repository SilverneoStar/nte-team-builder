// Small icons for the in-game role tags (Main DPS, Burst DPS, Summoner...).
// Drawn for this site in the spirit of the game's tag icons; they take the
// text colour (tinted with the character's element on the profile).

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' };

const ICONS = {
  // A peak over a bowl, like the game's Main DPS mark.
  'Main DPS': (
    <>
      <path d="M12 3.5 19 13H5Z" fill="currentColor" />
      <path d="M3.5 15.5Q12 23 20.5 15.5" {...S} />
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
  // A spiky burst on a base.
  'Burst DPS': (
    <path d="M3 20 4.6 9.5l4 4L12 3.5l3.4 10 4-4L21 20Z" fill="currentColor" />
  ),
  // A loop closing on itself.
  'Instant Cycle': (
    <>
      <path d="M19 12a7 7 0 1 1-2.05-4.95" {...S} />
      <path d="M20.2 4.2v4.6h-4.6" {...S} />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
    </>
  ),
  // A gem lifted by chevrons.
  'DMG Boost': (
    <>
      <path d="M12 2.8 16.8 8 12 13.5 7.2 8Z" fill="currentColor" />
      <path d="m6 20.5 6-4 6 4" {...S} />
    </>
  ),
  // A six-point star with an open centre.
  Summoner: (
    <path
      fillRule="evenodd"
      d="M12 2.5l2.6 4.6 5.3-.1-2.7 4.6 2.7 4.6-5.3-.1L12 21.5l-2.6-4.4-5.3.1 2.7-4.6-2.7-4.6 5.3.1Zm0 6.8a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4Z"
      fill="currentColor"
    />
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

export const hasTagIcon = (tag) => tag in ICONS;

export default function TagIcon({ tag, size = 16 }) {
  const icon = ICONS[tag];
  if (!icon) return null;
  return (
    <svg className="tag-icon" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      {icon}
    </svg>
  );
}
