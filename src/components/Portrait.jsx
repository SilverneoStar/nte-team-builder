// A character's round or square portrait, with element badge and optional Arc backdrop.
import { portraitPath, useZeroLook } from '../lib/portraits.js';
import { useState } from 'react';
import { ELEMENT_BY_ID } from '../data/elements.js';
import ElementGlyph from './ElementGlyph.jsx';
import ArcBackdrop from './ArcBackdrop.jsx';

// Looks for public/characters/<id>.webp. If the file is missing,
// it falls back to the character's initials on their element colour.
const BASE = import.meta.env.BASE_URL;

// Largest shown width of each size (px), for picking the image resolution.
const SIZE_PX = { sm: 28, md: 44, lg: 76, xl: 88 };

// `backdrop`: show the Arc-type disc behind the art (large profile portrait).
export default function Portrait({ character, size = 'md', backdrop = false }) {
  useZeroLook();
  const src = `${BASE}characters/${portraitPath(character.id)}`;
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
          // Sharp on high-density screens: the 512 px art for larger portraits.
          srcSet={`${src} 256w, ${BASE}characters/hd/${portraitPath(character.id)} 512w`}
          sizes={`${SIZE_PX[size] ?? 44}px`}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(src)}
        />
      )}
      <span className="portrait__glyph">
        <ElementGlyph element={character.element} size={size === 'lg' ? 16 : 12} />
      </span>
    </span>
  );
}
