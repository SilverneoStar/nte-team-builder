// Character picker for one team slot (bottom sheet on phones).
import { useEffect, useRef } from 'react';
import Roster from './Roster.jsx';

// Character picker for one team slot. A sheet from the bottom on phones,
// a dialog on wider screens, so nobody has to scroll down to the roster.
export default function PickDialog({ slot, members, analysis, usage, onPick, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="dialog-backdrop dialog-backdrop--sheet" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog dialog--sheet" role="dialog" aria-modal="true" aria-labelledby="pick-title">
        <header className="dialog__head">
          <h2 id="pick-title" className="section-title">
            Add to slot {slot + 1}
          </h2>
          <button ref={closeRef} className="btn btn--quiet" onClick={onClose}>
            Close
          </button>
        </header>
        <Roster members={members} analysis={analysis} usage={usage} onPick={onPick} />
      </div>
    </div>
  );
}
