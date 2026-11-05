// Beta-info state without React, so plain modules (synergy scoring) can read it.

// Whether the reader wants to see beta information (kits, builds and names of
// upcoming Espers taken from beta data). Hidden by default; the choice is
// remembered on this device and shared by every page.
const KEY = 'nte-team-builder:showBeta';
const listeners = new Set();

let show = (() => {
  try {
    return localStorage.getItem(KEY) === 'on';
  } catch {
    return false;
  }
})();

export const showBeta = () => show;

export function setShowBeta(v) {
  show = Boolean(v);
  try {
    localStorage.setItem(KEY, show ? 'on' : 'off');
  } catch {
    /* storage unavailable: the choice lasts until the page closes */
  }
  listeners.forEach((fn) => fn());
}

export const subscribeBeta = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};


// What comes from beta information (closed-beta text, leaks), per Esper and
// per Arc. Official info (stream, PVs, banners) always shows.
export const BETA = {
  exe: { awakenings: true, passives: true, life: true },
  elyms: { life: true, passives: true },
};
export const BETA_ARCS = new Set(['dotted-horizon']);
export const isBeta = (id, part) => !!BETA[id]?.[part];
