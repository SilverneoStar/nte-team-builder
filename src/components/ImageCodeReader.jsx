// "Read a code from an image": load a team (team builder) or a console
// (Console page) from an image saved from this site (lib/imageCode.js).
import { useRef, useState } from 'react';
import { readImageCode } from '../lib/imageCode.js';

const OTHER = {
  team: 'That’s a build image: load it on the Console page.',
  console: 'That’s a team image: load it in the team builder’s Presets & sharing.',
};

export default function ImageCodeReader({ kind, onCode }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function read(file) {
    setBusy(true);
    setMsg(null);
    try {
      const r = await readImageCode(file);
      if (!r) setMsg({ error: true, text: 'No code found. Use a team or build image saved from this site, or type the code.' });
      else if (r.kind !== kind) setMsg({ error: true, text: OTHER[kind] });
      else {
        const ok = onCode(r.code);
        setMsg(ok === false ? { error: true, text: 'Found a code, but it isn’t valid.' } : { text: `Loaded the ${kind === 'team' ? 'team' : 'console'} from the image.` });
      }
    } catch (e) {
      setMsg({ error: true, text: e.message || 'Couldn’t read that picture.' });
    }
    setBusy(false);
    if (input.current) input.current.value = ''; // forget the file
  }

  return (
    <div className="imgcode">
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => e.target.files?.[0] && read(e.target.files[0])}
      />
      <button type="button" className="btn" onClick={() => input.current?.click()} disabled={busy}>
        {busy ? 'Reading…' : 'Read a code from an image'}
      </button>
      <p className="muted small imgcode__hint">
        A {kind === 'team' ? 'team' : 'build'} image saved from this site: its code is inside the file and in its QR
        code, so re-shared pictures work too. Read on your device; nothing is uploaded or kept.
      </p>
      {msg && (
        <p className={msg.error ? 'field__error' : 'muted small'} role={msg.error ? 'alert' : 'status'}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
