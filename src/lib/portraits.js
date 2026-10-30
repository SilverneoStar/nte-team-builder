// Which portrait file a character uses (Esper Zero's form, cache-busting versions).
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
  elyms: 2,
  exe: 2,
};
/** File name and version of a character's portrait, e.g. "shinku.webp?v=2". */
export const portraitPath = (id) => {
  const f = portraitFile(id);
  return UPDATED[f] ? `${f}.webp?v=${UPDATED[f]}` : `${f}.webp`;
};

// Where each portrait's face sits, as a fraction of the image height (the
// middle of the face, between the eyes and the chin). Wide frames that crop a
// square portrait (the Tall team image) centre on this, so faces aren't cut.
const FACE_Y = {
  adler: 0.47, akane: 0.42, aurelia: 0.47, baicang: 0.43, blackbird: 0.5, chaos: 0.47, chiz: 0.47,
  daffodill: 0.43, edgar: 0.52, ellie: 0.55, elyms: 0.64, exe: 0.6, fadia: 0.55, haniel: 0.5,
  hathor: 0.47, hotori: 0.55, iroi: 0.58, jiuyuan: 0.55, lacrimosa: 0.55, linko: 0.52, mint: 0.58,
  nanally: 0.56, nitsa: 0.55, sakiri: 0.58, shinku: 0.6, skia: 0.55, zankou: 0.45,
  'zero-female': 0.52, 'zero-male': 0.5, zero: 0.52,
};
/** Face centre (0–1 of the image height) of a character's current portrait. */
export const faceY = (id) => FACE_Y[portraitFile(id)] ?? 0.5;
