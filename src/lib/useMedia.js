// React hook for CSS media queries, plus the phone breakpoint.
import { useSyncExternalStore } from 'react';

/** True while the CSS media query matches; follows resizes and rotation. */
export function useMedia(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

// Phones: below the width where detail pages switch to two columns.
export const PHONE = '(max-width: 639.98px)';
