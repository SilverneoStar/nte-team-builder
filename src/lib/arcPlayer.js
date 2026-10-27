// The flat 2D Arc player (see ArcPlayer.jsx) drawn onto a square canvas, for
// the exported cards. Drop-in for the old Arc images: same square shape,
// player centred, transparent around it.
import { ARC_BY_ID } from '../data/arcs.js';
import { loadImage } from './loadImage.js';

const TYPES = new Set(['liquid', 'plasma', 'condensate', 'solid', 'gas']);
const shared = new Map();
const once = (url) => {
  if (!shared.has(url)) shared.set(url, loadImage(url));
  return shared.get(url);
};

/** Square canvas (size px) of the Arc as a 2D player, or null if it has no art. */
export async function loadArcArt(base, arcId, size = 256) {
  const arc = ARC_BY_ID[arcId];
  if (!arc) return null;
  const P = `${base}arc-player`;
  const type = String(arc.type || '').toLowerCase();
  const [disc, hub, kase, art] = await Promise.all([
    TYPES.has(type) ? once(`${P}/disc-${type}.svg`) : null,
    once(`${P}/hub.svg`),
    once(`${P}/case.svg`),
    loadImage(`${P}/art/${arcId}.webp`),
  ]);
  if (!kase) return null;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const k = size / 680;
  ctx.translate(0, (size - 600 * k) / 2);
  ctx.scale(k, k);
  if (disc) ctx.drawImage(disc, 0, 0, 680, 600);
  if (hub) ctx.drawImage(hub, 0, 0, 680, 600);
  ctx.drawImage(kase, 0, 0, 680, 600);
  // Artwork in the window: 300 x 300 at (86, 62), bottom-right corner cut
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(96, 62);
  ctx.lineTo(386, 62);
  ctx.lineTo(386, 316);
  ctx.lineTo(340, 362);
  ctx.lineTo(96, 362);
  ctx.quadraticCurveTo(86, 362, 86, 352);
  ctx.lineTo(86, 72);
  ctx.quadraticCurveTo(86, 62, 96, 62);
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = '#171a22';
  ctx.fillRect(86, 62, 300, 300);
  if (art) ctx.drawImage(art, 86, 62, 300, 300);
  const g = ctx.createLinearGradient(86, 62, 386, 362);
  g.addColorStop(0, 'rgba(255,255,255,0.16)');
  g.addColorStop(0.35, 'rgba(255,255,255,0)');
  g.addColorStop(0.75, 'rgba(255,255,255,0)');
  g.addColorStop(1, 'rgba(255,255,255,0.06)');
  ctx.fillStyle = g;
  ctx.fillRect(86, 62, 300, 300);
  ctx.restore();
  return c;
}
