import { useSyncExternalStore } from 'react';

// Esper Zero has a male and a female form. People pick which one the site
// shows (both together, male or female); the choice is kept on this device
// and used everywhere: lists, profiles, the team builder and exported cards.
const KEY = 'nte-zero-look';
export const ZERO_LOOKS = [
  { id: 'both', label: 'Both' },
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
];

const read = () => {
  try {
    const v = localStorage.getItem(KEY);
    return ZERO_LOOKS.some((l) => l.id === v) ? v : 'both';
  } catch {
    return 'both';
  }
};
let look = read();
const subs = new Set();

export const getZeroLook = () => look;
export function setZeroLook(v) {
  look = v;
  try {
    localStorage.setItem(KEY, v);
  } catch {
    /* storage unavailable */
  }
  subs.forEach((f) => f());
}
const subscribe = (f) => {
  subs.add(f);
  return () => subs.delete(f);
};
/** Re-renders the caller when the Esper Zero choice changes. */
export const useZeroLook = () => useSyncExternalStore(subscribe, getZeroLook, getZeroLook);

/** File name (without extension) of a character's portrait. */
export const portraitFile = (id) => (id === 'zero' && look !== 'both' ? `zero-${look}` : id);

// Portraits that were redrawn keep their file name, so browsers may still
// show a saved old copy. A version on the address makes them fetch the new
// one. Bump a portrait's version whenever its image is replaced.
const UPDATED = {
  jiuyuan: 3,
  shinku: 2,
  'zero-male': 3,
  'zero-female': 2,
};
/** File name and version of a character's portrait, e.g. "shinku.webp?v=2". */
export const portraitPath = (id) => {
  const f = portraitFile(id);
  return UPDATED[f] ? `${f}.webp?v=${UPDATED[f]}` : `${f}.webp`;
};
