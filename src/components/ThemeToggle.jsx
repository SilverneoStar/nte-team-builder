import { useEffect, useState } from 'react';

// The site's light / dark switch. Starts from the device's setting, and remembers the reader's choice.
const KEY = 'site-theme';
const systemDark = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
const saved = () => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => saved() ?? (systemDark() ? 'dark' : 'light'));
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => {
        setTheme(next);
        try {
          localStorage.setItem(KEY, next);
        } catch {
          /* private mode: still switches for this visit */
        }
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {theme === 'dark' ? (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="currentColor" />
        ) : (
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
            <circle cx="12" cy="12" r="4" fill="currentColor" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </g>
        )}
      </svg>
      <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  );
}
