// Matcha hiding at the edge of a page. Tapping her opens her listening room.
import { navigate } from '../lib/route.js';

const BASE = import.meta.env.BASE_URL;

/** Matcha peeking out from an edge; tapping her opens the listening room. */
export default function MatchaPeek() {
  return (
    <button
      type="button"
      className="matcha-peek"
      onClick={() => navigate('music')}
      aria-label="Matcha is hiding here. Open her listening room"
      title="Psst…"
    >
      <img src={`${BASE}matcha/peek.webp`} alt="" width="260" height="161" />
    </button>
  );
}
