// Links to the fan-run Cortado accounts and community Discord.
// These are the project's own channels, not official Neverness to Everness ones,
// and the footer says so next to them.

const LINKS = [
  {
    id: 'x',
    label: 'X',
    handle: '@SilverStarneo',
    href: 'https://x.com/SilverStarneo',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z"
        />
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    handle: 'SSN-Cortado',
    href: 'https://www.facebook.com/share/19TtHpBbu3/',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M13.5 21.9v-7.4h2.6l.4-3.1h-3V9.5c0-.9.3-1.5 1.6-1.5h1.6V5.2c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.3H7.9v3.1h2.6v7.4a10 10 0 1 1 3 0Z"
        />
      </svg>
    ),
  },
  {
    // A plain chat bubble rather than the Discord logo, as in the rest of the brand.
    id: 'discord',
    label: 'Discord',
    handle: 'Community server',
    href: 'https://discord.gg/YnC439yB3',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12Z" />
        <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
      </svg>
    ),
  },
];

export default function SocialLinks() {
  return (
    <section className="social" aria-labelledby="social-title">
      <h2 id="social-title" className="social__title">
        Follow Cortado
      </h2>
      <ul className="social__list">
        {LINKS.map((l) => (
          <li key={l.id}>
            <a
              className={`social__link social__link--${l.id}`}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${l.label}: ${l.handle} (opens in a new tab)`}
            >
              <span className="social__icon">{l.icon}</span>
              <span className="social__text">
                <span className="social__name">{l.label}</span>
                <span className="social__handle">{l.handle}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <a
        className="sister"
        href="https://silverneostar.github.io/zzz-team-builder/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img className="sister__icon" src={`${import.meta.env.BASE_URL}mascot.svg`} alt="" width="36" height="36" />
        <span className="sister__text">
          <span className="sister__kicker">Also by Cortado</span>
          <span className="sister__name">ZZZ Team Builder</span>
          <span className="sister__game">Teams, builds and farming for Zenless Zone Zero</span>
        </span>
        <span className="sister__arrow" aria-hidden="true">
          →
        </span>
      </a>
      <p className="social__note">
        These are the fan-run accounts and community server of this site, not official Neverness to Everness channels.
        For official news, follow the game&apos;s own accounts.
      </p>
    </section>
  );
}
