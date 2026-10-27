// Suggested Cartridge stats for a character and set, with reasons.
import { recommendStats } from '../data/buildProfiles.js';
import { CARTRIDGE_BY_ID } from '../data/gear.js';

// The suggested Cartridge stats for a character and set, with the reasons.
export default function StatAdvice({ character, cartridge }) {
  const r = recommendStats(character, cartridge);
  return (
    <div className="stat-advice">
      <p className="stat-advice__picks">
        <span className="stat-advice__label">Suggested</span>
        <b>{r.main}</b> main · {r.subs.join(', ')}
        {cartridge && <span className="muted"> · with {CARTRIDGE_BY_ID[cartridge].name}</span>}
      </p>
      <ul className="stat-advice__why">
        {r.reasons.map((x) => <li key={x}>{x}</li>)}
      </ul>
    </div>
  );
}
