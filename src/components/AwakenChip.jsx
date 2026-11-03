// One step of an awakening order: the game's awakening icon in an element
// ring with a small "A1" tag, or just "A1" for Espers without icons.
import { skillIconUrl } from '../lib/skillIcons.js';
import { CHARACTER_BY_ID } from '../data/characters.js';

// Light element rings (Lakshana gold, Anima green) get dark tag text.
const LIGHT = new Set(['lakshana', 'anima']);

export default function AwakenChip({ character, id, first = false, title }) {
  const src = skillIconUrl(character, id);
  return (
    <span
      className={`awaken-chain__id${first ? ' is-first' : ''}${src ? ' has-icon' : ''}${
        LIGHT.has(CHARACTER_BY_ID[character]?.element) ? ' is-light' : ''
      }`}
      title={title}
    >
      {src ? (
        <>
          <img src={src} alt="" width="34" height="34" loading="lazy" decoding="async" />
          <span className="awaken-chain__tag">{id}</span>
        </>
      ) : (
        id
      )}
    </span>
  );
}
