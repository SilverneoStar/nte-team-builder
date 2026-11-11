// "Level these skills first" row for the export cards: the character's skill
// icons in priority order, with › between tiers and = inside a tier.
import { SKILL_KEYS, SKILL_PRIORITY } from '../data/skillPriority.js';
import { skillIconUrl } from './skillIcons.js';
import { loadImage } from './loadImage.js';

const ICON_KEY = { B: 'basic', S: 'redirect', U: 'ultimate', P: 'support', X: 'p1' };
const SHORT = { B: 'Basic', S: 'Skill', U: 'Ultimate', P: 'Support', X: 'Passives' };

export const skillPriorityFor = (id) => SKILL_PRIORITY[id] ?? null;

/** Loads the icons a priority row needs: { B: img, ... } (missing ones null). */
export async function loadSkillPriorityIcons(id) {
  const sp = SKILL_PRIORITY[id];
  if (!sp) return {};
  const keys = [...new Set(sp.tiers.flat())];
  const imgs = await Promise.all(
    keys.map((k) => {
      const url = skillIconUrl(id, ICON_KEY[k]);
      return url ? loadImage(url).catch(() => null) : null;
    }),
  );
  return Object.fromEntries(keys.map((k, i) => [k, imgs[i]]));
}

/**
 * Draws the row at (x, y) = top-left, filling width w. Returns its height.
 * opts: { d: icon disc size, font, color, muted, disc, accent, labels }
 */
export function drawSkillPriority(ctx, tiers, icons, x, y, w, opts = {}) {
  const { d = 44, labelPx: lp = null, font = 'sans-serif', color = '#eceef3', muted = '#9aa0ad', disc = '#26272e', accent = '#e8488c' } = opts;
  const items = [];
  tiers.forEach((tier, ti) => {
    tier.forEach((k, ki) => {
      items.push({ k, first: ti === 0 });
      if (ki < tier.length - 1) items.push({ sep: '=' });
    });
    if (ti < tiers.length - 1) items.push({ sep: '›' });
  });
  const nIcons = items.filter((i) => i.k).length;
  const sepW = Math.min(26, w * 0.05);
  const nSeps = items.length - nIcons;
  const slot = (w - nSeps * sepW) / nIcons;
  const dd = Math.min(d, slot - 8);
  const labelPx = lp ?? Math.max(12, Math.min(15, Math.round(slot / 6)));
  let cx = x;
  ctx.save();
  ctx.textAlign = 'center';
  for (const it of items) {
    if (it.sep) {
      ctx.fillStyle = muted;
      ctx.font = `700 ${Math.round(dd * 0.5)}px ${font}`;
      ctx.fillText(it.sep, cx + sepW / 2, y + dd / 2 + dd * 0.17);
      cx += sepW;
      continue;
    }
    const mx = cx + slot / 2;
    const my = y + dd / 2;
    ctx.beginPath();
    ctx.arc(mx, my, dd / 2, 0, Math.PI * 2);
    ctx.fillStyle = disc;
    ctx.fill();
    ctx.lineWidth = it.first ? 2.5 : 1.5;
    ctx.strokeStyle = it.first ? accent : 'rgba(255,255,255,0.22)';
    ctx.stroke();
    const img = icons[it.k];
    if (img) {
      const s = dd * 0.7;
      ctx.drawImage(img, mx - s / 2, my - s / 2, s, s);
    } else {
      ctx.fillStyle = color;
      ctx.font = `800 ${Math.round(dd * 0.42)}px ${font}`;
      ctx.fillText(it.k, mx, my + dd * 0.15);
    }
    ctx.fillStyle = it.first ? color : muted;
    ctx.font = `${it.first ? 700 : 600} ${labelPx}px ${font}`;
    ctx.fillText(SHORT[it.k] ?? SKILL_KEYS[it.k], mx, y + dd + labelPx + 5);
    cx += slot;
  }
  ctx.restore();
  return dd + labelPx + 8;
}
