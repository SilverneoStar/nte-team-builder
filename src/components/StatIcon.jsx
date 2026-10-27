// Small stat icons, drawn for this app in the spirit of the in-game stat list.
const PATHS = {
  hp: (
    <path
      d="M10 17.2 3.6 11A3.9 3.9 0 0 1 9.1 5.5l.9.9.9-.9A3.9 3.9 0 0 1 16.4 11Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  ),
  atk: (
    <path
      d="m3 15 4.5-5L10 13l3-4.5L17 15M10 4.5v3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  def: (
    <path
      d="M10 2.8 16 5v4.6c0 3.6-2.6 6.4-6 7.6-3.4-1.2-6-4-6-7.6V5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  ),
  critRate: (
    <>
      <path
        d="M10 2.5 17.5 10 10 17.5 2.5 10Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.2" fill="currentColor" />
    </>
  ),
  critDmg: (
    <path
      d="M10 2.5 17.5 10 10 17.5 2.5 10Z M10 6.2 13.8 10 10 13.8 6.2 10Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  stamina: (
    <path
      d="M11.5 2.5 5 11h4.5L8.5 17.5 15 9h-4.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  charge: (
    <>
      <circle cx="10" cy="10" r="6.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 5.5v4.5l3 2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  cycle: (
    <path
      d="M15.5 7.5A6 6 0 1 0 16 12M15.8 3.8v3.9h-3.9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  breakInt: (
    <path
      d="M3 10h4l2-5 2.5 10 2-5H17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  healing: (
    <path
      d="M8 3.5h4v4.5h4.5v4H12v4.5H8V12H3.5V8H8Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  res: (
    <>
      <path
        d="M10 2.8 16 5v4.6c0 3.6-2.6 6.4-6 7.6-3.4-1.2-6-4-6-7.6V5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M7.2 10.2 9.2 12l3.6-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  dmgBonus: (
    <path d="M10 3.2 17.2 16H2.8Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
};

export default function StatIcon({ stat, size = 16 }) {
  return (
    <svg className="stat-icon" width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
      {PATHS[stat]}
    </svg>
  );
}
