// The hash router: which page and item the address points to.
import { useEffect, useState } from 'react';

// Tiny hash router: #builder, #characters, #character-<id>, #arcs,
// #arcs-<type>, #arc-<id>, #console, #console-<id>, #achievements,
// #achievements-<category>, #glossary.
// Hashes stay plain tokens so links work everywhere the app is hosted.
export const VIEWS = [
  { id: 'builder', label: 'Team Builder' },
  { id: 'characters', label: 'Espers' },
  { id: 'arcs', label: 'Arcs' },
  { id: 'console', label: 'Console' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'glossary', label: 'Glossary' },
];

export function parseHash(hash) {
  const h = (hash || '').replace(/^#/, '');
  if (h.startsWith('character-')) return { view: 'characters', characterId: h.slice(10) };
  if (h.startsWith('arc-')) return { view: 'arcs', arcId: h.slice(4) };
  if (h.startsWith('arcs-')) return { view: 'arcs', arcType: h.slice(5) };
  if (h.startsWith('achievements-')) return { view: 'achievements', category: h.slice(13) };
  if (h.startsWith('console-')) return { view: 'console', characterId: h.slice(8) };
  if (VIEWS.some((v) => v.id === h)) return { view: h, characterId: null };
  return { view: 'builder', characterId: null };
}

export function navigate(target) {
  if (window.location.hash !== `#${target}`) window.location.hash = target;
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
