import { useState } from 'react';
import { ELEMENT_BY_ID } from '../data/elements.js';
import ElementGlyph from './ElementGlyph.jsx';
import ArcBackdrop from './ArcBackdrop.jsx';

// Looks for public/characters/<id>.webp. If the file is missing,
// it falls back to the character's initials on their element colour.
const BASE = import.meta.env.BASE_URL;

// `backdrop`: show the Arc-type disc behind the art (large profile portrait).
export default function Portrait({ character, size = 'md', backdrop = false }) {
  const src = `${BASE}characters/${character.id}.webp`;
  // Remember which image failed, so switching characters retries.
  const [failedSrc, setFailedSrc] = useState(null);
  const failed = failedSrc === src;
  const color = ELEMENT_BY_ID[character.element].color;
  const initials = character.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);

  return (
    <span className={`portrait portrait--${size}`} style={{ '--el': color }}>
      {backdrop && !failed && <ArcBackdrop arcType={character.arcType} />}
      {failed ? (
        <span className="portrait__initials">{initials}</span>
      ) : (
        <img
          className="portrait__img"
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailedSrc(src)}
        />
      )}
      <span className="portrait__glyph">
        <ElementGlyph element={character.element} size={size === 'lg' ? 16 : 12} />
      </span>
    </span>
  );
}
