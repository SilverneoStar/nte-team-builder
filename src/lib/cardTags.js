// The in-game role tags (Main DPS, Instant Cycle...) as outlined pills for the
// personal export cards (build, guide and character cards; not team cards).
// Same look as the site: transparent pill, border and mark in the tag colour.
import { loadImage } from './loadImage.js';
import { BODY, roundRect } from './teamCard.js';

const KIND_COLOR = {
  damage: '#d9474f',
  support: '#d85a2a',
  cycle: '#c4458b',
  dot: '#a1656a',
  fua: '#9c8f5e',
  heal: '#48925f',
  control: '#8a8d96',
  shield: '#6270e6',
  redirect: '#3398a8',
};
const OWN_KIND = {
  'Instant Cycle': 'cycle',
  DoT: 'dot',
  'Follow-up Attack': 'fua',
  Healing: 'heal',
  Control: 'control',
  Shield: 'shield',
  'DMG Redirection': 'redirect',
};
const kindOf = (tag) =>
  OWN_KIND[tag] ?? (['DMG Boost', 'Summoner', 'Break Boost'].includes(tag) ? 'support' : 'damage');
export const tagColor = (tag) => KIND_COLOR[kindOf(tag)];

const markSlug = (tag) => tag.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** The tag marks, tinted to each tag's colour: { tag: canvas }. */
export async function loadTagMarks(base, tags = []) {
  const imgs = await Promise.all(tags.map((t) => loadImage(`${base}icons/tags/${markSlug(t)}.webp`)));
  const out = {};
  tags.forEach((t, i) => {
    const img = imgs[i];
    if (!img) return;
    const c = document.createElement('canvas');
    c.width = img.naturalWidth || img.width;
    c.height = img.naturalHeight || img.height;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0, c.width, c.height);
    x.globalCompositeOperation = 'source-in';
    // Metallic sheen like the site: lighter at the top, the tag colour below.
    const g = x.createLinearGradient(0, 0, 0, c.height);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.45, tagColor(t));
    g.addColorStop(1, tagColor(t));
    x.fillStyle = g;
    x.fillRect(0, 0, c.width, c.height);
    out[t] = c;
  });
  return out;
}

function pillWidth(ctx, tag, marks, { font, pad, icon }) {
  ctx.font = font;
  return pad * 2 + (marks[tag] ? icon + 6 : 0) + ctx.measureText(tag.toUpperCase()).width;
}

/** Width of the tags as one row of pills. */
export function tagPillsWidth(ctx, tags, marks, { size = 15, gap = 8 } = {}) {
  const opts = { font: `700 ${size}px ${BODY}`, pad: Math.round(size * 0.75), icon: Math.round(size * 1.25) };
  ctx.save();
  const w = (tags ?? []).reduce((sum, t, i) => sum + (i ? gap : 0) + pillWidth(ctx, t, marks, opts), 0);
  ctx.restore();
  return w;
}

/**
 * Tag pills from (x, y = pill top), wrapping to new rows within maxWidth.
 * Returns the y below the last row.
 */
export function drawTagPills(
  ctx,
  tags,
  marks,
  x,
  y,
  maxWidth,
  { size = 15, color = '#fff', gap = 8 } = {},
) {
  if (!tags?.length) return y;
  const h = Math.round(size * 1.85);
  const pad = Math.round(size * 0.75);
  const icon = Math.round(size * 1.25);
  const font = `700 ${size}px ${BODY}`;
  const opts = { font, h, pad, icon };
  let cx = x;
  let cy = y;
  ctx.save();
  ctx.textBaseline = 'middle';
  for (const tag of tags) {
    const w = pillWidth(ctx, tag, marks, opts);
    if (cx > x && cx + w > x + maxWidth) {
      cx = x;
      cy += h + gap;
    }
    const col = tagColor(tag);
    roundRect(ctx, cx, cy, w, h, h / 2);
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = col;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 2;
    ctx.strokeStyle = col;
    ctx.stroke();
    let tx = cx + pad;
    if (marks[tag]) {
      ctx.drawImage(marks[tag], tx, cy + (h - icon) / 2, icon, icon);
      tx += icon + 6;
    }
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(tag.toUpperCase(), tx, cy + h / 2 + 1);
    cx += w + gap;
  }
  ctx.restore();
  return cy + h;
}
