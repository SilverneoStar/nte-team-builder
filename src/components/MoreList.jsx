import { useState } from 'react';

// Shows the first `limit` items, then a "+n more" button that reveals the rest.
// `children` renders one item; set `li` when rendered inside a <ul>.
export default function MoreList({ items, limit = 3, li = false, children }) {
  const [open, setOpen] = useState(false);
  const extra = items.length - limit;
  const shown = open || extra <= 0 ? items : items.slice(0, limit);
  const btn = extra > 0 && (
    <button type="button" className="more-btn" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
      {open ? 'Show less' : `+${extra} more`}
    </button>
  );
  return (
    <>
      {shown.map(children)}
      {btn && (li ? <li>{btn}</li> : btn)}
    </>
  );
}
