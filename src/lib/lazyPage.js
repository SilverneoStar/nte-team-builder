// lazy() for pages, safe across site updates. Each deploy renames the page
// files, so a tab opened before the update asks for files that no longer exist
// and the import fails. Then we reload once to pick up the new version; a
// second failure within a minute is a real error, left for the ErrorBoundary.
import { lazy } from 'react';

const KEY = 'nte-team-builder:chunkReload';

export function lazyPage(load) {
  return lazy(() =>
    load().catch((err) => {
      let last = 0;
      try {
        last = Number(sessionStorage.getItem(KEY)) || 0;
      } catch {
        /* storage blocked: fall through to one reload */
      }
      if (Date.now() - last > 60_000) {
        try {
          sessionStorage.setItem(KEY, String(Date.now()));
        } catch {
          /* ignore */
        }
        window.location.reload();
        // Keep Suspense showing "Loading…" until the reload happens.
        return new Promise(() => {});
      }
      throw err;
    }),
  );
}
