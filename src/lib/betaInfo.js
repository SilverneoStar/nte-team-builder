// React hook for the beta-info choice; the state itself lives in betaState.js.
import { useSyncExternalStore } from 'react';
import { showBeta, subscribeBeta } from './betaState.js';

export { BETA, BETA_ARCS, isBeta, setShowBeta, showBeta } from './betaState.js';
export const useShowBeta = () => useSyncExternalStore(subscribeBeta, showBeta, showBeta);
