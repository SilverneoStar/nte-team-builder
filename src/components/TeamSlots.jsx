import { CHARACTER_BY_ID } from '../data/characters.js';
import { ARC_BY_ID, arcTag } from '../data/arcs.js';
import { CARTRIDGE_BY_ID, cartridgesFor } from '../data/gear.js';
import CartridgeIcon from './CartridgeIcon.jsx';
import { ELEMENT_BY_ID } from '../data/elements.js';
import { loadoutOf } from '../lib/teamsReducer.js';
import Portrait from './Portrait.jsx';
import RoleList from './RoleList.jsx';

// Four team slots. Selecting a filled slot opens its loadout below.
// Tapping an empty slot opens the character picker for that slot.
export default function TeamSlots({ team, selected, onSelect, onAdd, dispatch }) {
  return (
    <ol className="slots" aria-label="Team members">
      {team.members.map((id, index) => {
        const c = id && CHARACTER_BY_ID[id];
        if (!c) {
          return (
            <li key={index} className="slot slot--empty">
              <button type="button" className="slot__add" onClick={() => onAdd(index)} aria-label={`Add a character to slot ${index + 1}`}>
                <span className="slot__plus" aria-hidden="true">+</span>
                <span className="slot__hint">Add character</span>
              </button>
            </li>
          );
        }
        const gear = loadoutOf(team, c.id);
        const arc = gear.arc && ARC_BY_ID[gear.arc];
        const cart = gear.cartridge && CARTRIDGE_BY_ID[gear.cartridge];
        const isSelected = selected === index;
        return (
          <li
            key={index}
            className={`slot${isSelected ? ' slot--selected' : ''}`}
            style={{ '--el': ELEMENT_BY_ID[c.element].color }}
          >
            <button
              className="slot__btn"
              onClick={() => onSelect(isSelected ? null : index)}
              aria-expanded={isSelected}
              aria-label={`${c.name}: edit gear`}
            >
              <Portrait character={c} size="lg" backdrop />
              <span className="slot__name">{c.name}</span>
              <span className="slot__meta"><RoleList roles={c.roles} size={13} separator={false} /></span>
              <span className="slot__gear">
                <span className={arc ? 'gear-chip gear-chip--on' : 'gear-chip'} title={arc?.name ?? 'No Arc'}>
                  <span className="gear-chip__name">{arc ? arc.name : 'No Arc'}</span>
                  {arc && arcTag(arc, c) && (
                    <span className="chip-tag">· {arcTag(arc, c) === 'sig' ? 'Sig' : 'Rec'}</span>
                  )}
                </span>
                <span className="slot__gear-row">
                  <span className={cart ? 'gear-chip gear-chip--on' : 'gear-chip'} title={cart?.name ?? 'No Cartridge'}>
                    {cart && <CartridgeIcon id={cart.id} size={14} />}
                    <span className="gear-chip__name">{cart ? cart.name.split(':')[0] : 'No set'}</span>
                    {cart && cartridgesFor(c).includes(cart.id) && <span className="chip-tag">· Rec</span>}
                  </span>
                </span>
                {/* Awakenings on their own line; the ones turned on glow */}
                <span className="slot__aw" aria-label={gear.awakenings.length ? `Awakenings: ${[...gear.awakenings].sort().join(', ')}` : 'No awakenings'}>
                  {['A1', 'A2', 'A3', 'A4', 'A5', 'A6'].map((id) => (
                    <span key={id} className={gear.awakenings.includes(id) ? 'slot__aw-pill is-on' : 'slot__aw-pill'} aria-hidden="true">{id}</span>
                  ))}
                </span>
              </span>
            </button>
            <button
              className="slot__x"
              onClick={() => {
                if (isSelected) onSelect(null);
                dispatch({ type: 'clearSlot', index });
              }}
              aria-label={`Remove ${c.name} from team`}
              title="Remove from team"
            >
              ×
            </button>
          </li>
        );
      })}
    </ol>
  );
}
