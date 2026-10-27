// Share a team as a link or code, paste one back in, or load a preset team.
import { useState } from 'react';
import { PRESETS } from '../data/presets.js';
import { encodeTeam, decodeTeam } from '../lib/share.js';
import { decodeCardCode, encodeCardCode } from '../lib/cardCode.js';
import { loadoutOf } from '../lib/teamsReducer.js';

export default function SharePanel({ team, dispatch }) {
  const code = encodeTeam(team);
  const cardCode = encodeCardCode(team, loadoutOf);
  const [copied, setCopied] = useState(null);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  async function copy(text, fieldId) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(fieldId);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      // Clipboard blocked: select the text so it can be copied by hand.
      document.getElementById(fieldId)?.select();
    }
  }

  function importCode(e) {
    e.preventDefault();
    const card = decodeCardCode(input);
    const team = card ? { ...card, name: card.name || 'Imported team' } : decodeTeam(input);
    if (!team) {
      setError(
        'That code isn’t valid. Use a card code (groups of 5) or a link code starting with nte1~. Console codes go in the Console tab.',
      );
      return;
    }
    setError(
      card?.nameInvalid
        ? 'Imported the team, but the name part of the code had a typo, so it was named “Imported team”.'
        : '',
    );
    setInput('');
    dispatch({ type: 'import', ...team });
  }

  return (
    <section className="share" aria-labelledby="share-title">
      <h2 id="share-title" className="section-title">
        Presets &amp; sharing
      </h2>

      <label className="field">
        <span>Load a community preset into this team</span>
        <select
          id="preset"
          value=""
          onChange={(e) => {
            const p = PRESETS[Number(e.target.value)];
            if (p) dispatch({ type: 'loadPreset', name: p.name, members: p.members });
          }}
        >
          <option value="" disabled>
            Choose a preset…
          </option>
          <optgroup label="Community teams">
            {PRESETS.map(
              (p, i) =>
                !p.idea && (
                  <option key={p.name} value={i}>
                    {p.name}
                  </option>
                ),
            )}
          </optgroup>
          <optgroup label="Kit-based ideas">
            {PRESETS.map(
              (p, i) =>
                p.idea && (
                  <option key={p.name} value={i}>
                    {p.name}
                  </option>
                ),
            )}
          </optgroup>
        </select>
      </label>

      <div className="field">
        <label htmlFor="card-code">
          Card code <span className="muted">· team name, duplicates, Arcs and Cartridge sets</span>
        </label>
        <div className="code-row">
          <textarea
            id="card-code"
            className="code code--card"
            readOnly
            rows={cardCode.length > 60 ? 3 : cardCode.length > 14 ? 2 : 1}
            value={cardCode}
            onFocus={(e) => e.target.select()}
          />
          <button className="btn" onClick={() => copy(cardCode, 'card-code')}>
            {copied === 'card-code' ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="field">
        <label htmlFor="team-code">
          Link code <span className="muted">· team and name</span>
        </label>
        <div className="code-row">
          <input id="team-code" className="code" readOnly value={code} onFocus={(e) => e.target.select()} />
          <button className="btn" onClick={() => copy(code, 'team-code')}>
            {copied === 'team-code' ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <form className="field" onSubmit={importCode}>
        <label htmlFor="import-code">Paste a friend’s code</label>
        <div className="code-row">
          <input
            id="import-code"
            className="code"
            placeholder="Card code or nte1~…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn" type="submit" disabled={!input.trim()}>
            Add team
          </button>
        </div>
        {error && <p className="field__error">{error}</p>}
      </form>
    </section>
  );
}
