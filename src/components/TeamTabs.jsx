// Saved teams as tabs, with rename, copy, delete and export actions.
import { useState } from 'react';
import ExportIcon from './ExportIcon.jsx';

// The list of saved teams plus actions for the one being edited.
export default function TeamTabs({ teams, activeId, dispatch, onExport }) {
  const active = teams.find((t) => t.id === activeId);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="tabs">
      <div className="tabs__list" role="tablist" aria-label="Your teams">
        {teams.map((t) => {
          const filled = t.members.filter(Boolean).length;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={t.id === activeId}
              className="tab"
              onClick={() => {
                setConfirming(false);
                dispatch({ type: 'select', id: t.id });
              }}
            >
              <span className="tab__name">{t.name || 'Untitled'}</span>
              <span className="tab__count">{filled}/4</span>
            </button>
          );
        })}
        <button className="tab tab--add" onClick={() => dispatch({ type: 'add' })}>
          + New team
        </button>
      </div>

      <div className="tabs__edit">
        <label className="sr-only" htmlFor="team-name">Team name</label>
        <input
          id="team-name"
          className="team-name"
          value={active.name}
          maxLength={40}
          onChange={(e) => dispatch({ type: 'rename', name: e.target.value })}
        />
        <div className="tabs__actions">
          <button
            className="btn btn--primary"
            onClick={onExport}
            disabled={!active.members.some(Boolean)}
          >
            <ExportIcon />Export image
          </button>
          <button className="btn btn--quiet" onClick={() => dispatch({ type: 'duplicate' })}>
            Duplicate
          </button>
          <button className="btn btn--quiet" onClick={() => dispatch({ type: 'clear' })}>
            Clear
          </button>
          {confirming ? (
            <span className="confirm">
              <button
                className="btn btn--danger"
                onClick={() => {
                  setConfirming(false);
                  dispatch({ type: 'remove' });
                }}
              >
                Delete team
              </button>
              <button className="btn btn--quiet" onClick={() => setConfirming(false)}>
                Keep
              </button>
            </span>
          ) : (
            <button className="btn btn--quiet" onClick={() => setConfirming(true)}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
