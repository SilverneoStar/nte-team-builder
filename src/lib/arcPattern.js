// Portrait backdrops: the character's element colour with the surface pattern
// of their Arc type's disc (public/arc-textures/<type>.webp, the disc art
// straightened into a flat square) faded in behind them.
// The site (CSS, .arc-backdrop) and the export cards (canvas, below) match.
import { loadImage } from './teamCard.js';

export const ARC_DISC_TYPES = ['liquid', 'solid', 'gas', 'plasma', 'condensate'];
export const arcDiscUrl = (base, arcType) => {
  const t = String(arcType || '').toLowerCase();
  return ARC_DISC_TYPES.includes(t) ? `${base}arc-textures/${t}.webp` : null;
};

// How strongly the pattern shows through the element colour.
export const PATTERN_OPACITY = 0.42;

const hexA = (hex, a) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h.slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

const discCache = new Map();
function discImage(base, arcType) {
  const url = arcDiscUrl(base, arcType);
  if (!url) return Promise.resolve(null);
  if (!discCache.has(url)) discCache.set(url, loadImage(url));
  return discCache.get(url);
}

/**
 * Fills a rounded box with the element-coloured backdrop and the faded
 * Arc-type disc. Draw the character portrait on top afterwards.
 */
export async function drawPortraitBackdrop(ctx, { x, y, w, h, r = 22, color, arcType, base = '/' }) {
  const disc = await discImage(base, arcType);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.clip();
  ctx.fillStyle = '#16171c';
  ctx.fillRect(x, y, w, h);
  const glow = ctx.createRadialGradient(x + w / 2, y + h * 0.45, 10, x + w / 2, y + h / 2, Math.max(w, h) * 0.8);
  glow.addColorStop(0, hexA(color, 0.5));
  glow.addColorStop(0.6, hexA(color, 0.26));
  glow.addColorStop(1, hexA(color, 0.12));
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, w, h);
  if (disc) {
    // Cover the box, keeping the texture square
    const side = Math.max(w, h);
    ctx.globalAlpha = PATTERN_OPACITY;
    ctx.drawImage(disc, x + (w - side) / 2, y + (h - side) / 2, side, side);
    ctx.globalAlpha = 1;
    // Element colour over it, so every pattern sits in the character's colour
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = hexA(color, 0.6);
    ctx.fillRect(x, y, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }
  // Soft dark halo right behind the character so they stand out
  const halo = ctx.createRadialGradient(x + w / 2, y + h * 0.5, 0, x + w / 2, y + h * 0.5, Math.max(w, h) * 0.55);
  halo.addColorStop(0, 'rgba(10, 11, 16, 0.3)');
  halo.addColorStop(1, 'rgba(10, 11, 16, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}
