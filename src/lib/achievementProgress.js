// Achievement progress saved in this browser.
import { useCallback, useEffect, useState } from 'react';

// Which achievements the player has ticked off, saved in this browser only
// (like teams). Storage can be blocked, so every access is wrapped and the
// tracker still works for the session without it.
const KEY = 'nte-team-builder:achievements';

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const ids = raw ? JSON.parse(raw).done : null;
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

function save(done) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: 1, done: [...done] }));
  } catch {
    /* storage unavailable: progress lasts until the tab closes */
  }
}

export function useAchievementProgress() {
  const [done, setDone] = useState(load);

  // Keep several open tabs in step.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === KEY) setDone(load());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((fn) => {
    setDone((prev) => {
      const next = new Set(prev);
      fn(next);
      save(next);
      return next;
    });
  }, []);

  const toggle = useCallback((id) => update((s) => (s.has(id) ? s.delete(id) : s.add(id))), [update]);
  const setMany = useCallback((ids, value) => update((s) => ids.forEach((id) => (value ? s.add(id) : s.delete(id)))), [update]);
  const reset = useCallback(() => update((s) => s.clear()), [update]);

  return { done, toggle, setMany, reset };
}
