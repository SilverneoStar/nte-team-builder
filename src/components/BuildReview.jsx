// Cortado's check of a saved build (My build): what's missing, instead of a
// score (lib/checks.js). The old rating (lib/buildReview.js) is kept but unused.
import { useMemo } from 'react';
import { buildChecks } from '../lib/checks.js';
import Checks from './Checks.jsx';

export default function BuildReview({ characterId, build }) {
  const checks = useMemo(() => buildChecks(characterId, build), [characterId, build]);
  return <Checks title="Cortado’s build check" checks={checks} />;
}
