import { setShowBeta } from '../lib/betaInfo.js';

// Stand-in for a section built from beta information when the reader hid it.
export default function BetaHidden({ what = 'This section' }) {
  return (
    <p className="beta-hidden">
      <span className="beta-tag">Beta</span> {what}: hidden for now, as this is beta information that may change before
      release.{' '}
      <button type="button" className="btn btn--quiet btn--small" onClick={() => setShowBeta(true)}>
        Show beta info
      </button>
    </p>
  );
}
