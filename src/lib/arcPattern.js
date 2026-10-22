// Arc-type designs behind character portraits and on the Arc banners.
// Each type has a drawn design (public/arc-patterns/<type>.svg), made from the
// in-game disc artwork: Liquid currents and bubbles, Solid crystal facets,
// Gas smoke and brush streaks, Plasma lightning, Condensate rings.
// The site (CSS, .arc-backdrop) and the export cards (canvas, below) match.
import { loadImage } from './teamCard.js';

export const ARC_PATTERN_TYPES = ['liquid', 'solid', 'gas', 'plasma', 'condensate'];
export const arcPatternUrl = (base, arcType) => {
  const t = String(arcType || '').toLowerCase();
  return ARC_PATTERN_TYPES.includes(t) ? `${base}arc-patterns/${t}.svg` : null;
};

// How strongly the design shows behind a character.
export const PATTERN_OPACITY = 0.45;
// The designs are drawn 2:1 and cover whatever box they fill.
const RATIO = 2;

const cache = new Map();
function patternImage(base, arcType) {
  const url = arcPatternUrl(base, arcType);
  if (!url) return Promise.resolve(null);
  if (!cache.has(url)) cache.set(url, loadImage(url));
  return cache.get(url);
}

/** Fill a box with the design, cropped to cover it (like CSS background-size: cover). */
export function drawCover(ctx, img, x, y, w, h) {
  const dw = Math.max(w, h * RATIO);
  const dh = dw / RATIO;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

/**
 * Fills a rounded box with the Arc-type design behind a character.
 * Draw the portrait on top afterwards with setPortraitShadow() on.
 */
export async function drawPortraitBackdrop(ctx, { x, y, w, h, r = 22, arcType, base = '/' }) {
  const img = await patternImage(base, arcType);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.clip();
  ctx.fillStyle = '#16171c';
  ctx.fillRect(x, y, w, h);
  if (img) {
    ctx.globalAlpha = PATTERN_OPACITY;
    drawCover(ctx, img, x, y, w, h);
    ctx.globalAlpha = 1;
  }
  // Fade the design out behind the character: dark in the middle, the design
  // showing mostly toward the edges, so the character reads first.
  const halo = ctx.createRadialGradient(x + w / 2, y + h * 0.55, 0, x + w / 2, y + h * 0.55, Math.max(w, h) * 0.62);
  halo.addColorStop(0, 'rgba(18, 19, 24, 0.82)');
  halo.addColorStop(0.45, 'rgba(18, 19, 24, 0.55)');
  halo.addColorStop(1, 'rgba(18, 19, 24, 0.05)');
  ctx.fillStyle = halo;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/** Drop shadow for the portrait, so the character sits a layer above the design. */
export function setPortraitShadow(ctx, size) {
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = size * 0.03;
  ctx.shadowOffsetX = size * 0.018;
  ctx.shadowOffsetY = size * 0.025;
}
