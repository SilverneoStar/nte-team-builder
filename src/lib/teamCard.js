// Draws a shareable team card on a canvas. No libraries: plain Canvas 2D,
// so the image looks the same in every browser and works offline.
import { loadArcArt } from './arcPlayer.js';
import { portraitPath } from './portraits.js';
import { loadPatterns, paintBackdrop, setPortraitShadow } from './arcPattern.js';
import { drawLinksLine, measureLinksLine } from './cardLinks.js';
import { CHARACTER_BY_ID } from '../data/characters.js';
import { ELEMENT_BY_ID } from '../data/elements.js';
import { ARC_BY_ID, arcTag } from '../data/arcs.js';
import { CARTRIDGE_BY_ID, bonusStats, cartridgesFor, isPercentStat } from '../data/gear.js';
import { loadoutOf } from './teamsReducer.js';
import { analyzeTeam } from './analyze.js';
import { activeResonance } from '../data/awakenings.js';
import { encodeCardCode, splitCardCode } from './cardCode.js';
import { consoleStats } from '../data/console.js';

export const CARD_W = 1200;
export const CARD_H = 675;

export const DISPLAY = '"Big Shoulders Display", "Arial Narrow", sans-serif';
export const BODY = '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif';
export const MONO = '"IBM Plex Mono", ui-monospace, Menlo, monospace';

// The card always uses the dark look, like the game's UI.
const C = {
  bg: '#0e1119',
  panel: 'rgba(22, 26, 37, 0.9)',
  panel2: '#1f2432',
  line: '#2b3242',
  fg: '#e7eaf2',
  muted: '#bec5d4',
  accent: '#8e9cff',
  sig: '#f3d03e',
  num: '#ffc061',
  label: '#c9cdd8',
};

// Bright element colours (same values as the --elb-* tokens).
export const EL = {
  cosmos: '#e6eaf2',
  anima: '#3fd3ad',
  incantation: '#f0576b',
  chaos: '#ad93f7',
  psyche: '#4fbcf3',
  lakshana: '#f3d03e',
};

// Short module stat labels that fit a small tile.
const STAT_SHORT = {
  'HP%': 'HP%',
  'ATK%': 'ATK%',
  'DEF%': 'DEF%',
  HP: 'HP',
  ATK: 'ATK',
  DEF: 'DEF',
  'DMG%': 'DMG%',
  'CRIT Rate': 'CRIT RATE',
  'CRIT DMG': 'CRIT DMG',
  'Cycle Intensity': 'CYCLE INT.',
  'Break Intensity': 'BREAK INT.',
  'Healing%': 'HEALING%',
  'Cosmos DMG%': 'COSMOS DMG%',
  'Anima DMG%': 'ANIMA DMG%',
  'Incantation DMG%': 'INCANT. DMG%',
  'Chaos DMG%': 'CHAOS DMG%',
  'Psyche DMG%': 'PSYCHE DMG%',
  'Lakshana DMG%': 'LAK. DMG%',
  'Mental DMG%': 'MENTAL DMG%',
  'Charge Efficiency%': 'CHARGE EFF.',
};

// Cortado, the site mascot, as a little sticker on every exported card.
export function drawMascot(ctx, img, x, y, size) {
  if (!img) return;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = size * 0.12;
  ctx.shadowOffsetY = size * 0.04;
  ctx.drawImage(img, x, y, size, size);
  ctx.restore();
}

// Element colour as a polished metal strip (matches .metal-strip on the site).
const mix = (hex, to, t) => {
  const n = parseInt(hex.replace('#', '').slice(0, 6), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (to - v) * t));
  return `rgb(${c.join(',')})`;
};
let brushed = null;
// Load the brushed-metal texture once before drawing (renderTeamCard does).
export async function loadMetal(base) {
  if (!brushed) brushed = await loadImage(`${base}icons/brushed-metal.webp`);
  return brushed;
}
export function metalStrip(ctx, x, y, w, h, color, vertical = false) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = mix(color, 0, 0.22);   // a touch dimmer than the element colour
  ctx.fillRect(x, y, w, h);
  if (brushed) {
    ctx.globalCompositeOperation = 'overlay';
    if (vertical) {
      ctx.translate(x + w, y);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(brushed, 0, 0, Math.max(h, 300), w);
    } else {
      ctx.drawImage(brushed, x, y, Math.max(w, 300), h);
    }
    ctx.setTransform(ctx.getTransform());
  }
  ctx.restore();
  ctx.save();
  const g = vertical ? ctx.createLinearGradient(x, 0, x + w, 0) : ctx.createLinearGradient(0, y, 0, y + h);
  // Pressed in: shade on the top edge, a thin light catch on the bottom edge
  g.addColorStop(0, 'rgba(0,0,0,0.55)');
  g.addColorStop(0.3, 'rgba(0,0,0,0.12)');
  g.addColorStop(0.6, 'rgba(0,0,0,0)');
  g.addColorStop(0.85, 'rgba(255,255,255,0.08)');
  g.addColorStop(1, 'rgba(255,255,255,0.35)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/**
 * Character portrait in a rounded frame (a circle when r is half the size):
 * Arc-type backdrop, the art casting a soft shadow, an element-colour border.
 * The art fills the frame width and is cropped from the top.
 */
function framedPortrait(ctx, img, c, { x, y, w, h, r, color, patterns }) {
  paintBackdrop(ctx, { x, y, w, h, r, img: patterns[String(c.arcType || '').toLowerCase()] });
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
  if (img) {
    const s = Math.max(w, h);
    setPortraitShadow(ctx, s);
    ctx.drawImage(img, x + (w - s) / 2, y - (s - h) * 0.3, s, s);
  } else {
    ctx.fillStyle = C.fg;
    ctx.font = `800 44px ${DISPLAY}`;
    ctx.textAlign = 'center';
    ctx.fillText(c.name.slice(0, 1), x + w / 2, y + h / 2 + 15);
    ctx.textAlign = 'left';
  }
  ctx.restore();
  roundRect(ctx, x, y, w, h, r);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();
}

export function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Fits text to maxWidth, wrapping onto at most `lines` lines with an ellipsis.
/** Charcoal background with the brand's diagonal pink bands (build and farm cards). */
export function drawBandBackdrop(ctx, w, h, bands) {
  ctx.fillStyle = '#121318';
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate((-14 * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);
  for (const b of bands) {
    ctx.globalAlpha = b.a;
    ctx.fillStyle = 'rgba(194, 24, 91, 0.2)';
    roundRect(ctx, -400, b.y, w + 800, b.h, b.h / 2);
    ctx.fill();
    ctx.setLineDash([12, 9]);
    ctx.strokeStyle = 'rgba(232, 72, 140, 0.28)';
    ctx.lineWidth = 2;
    roundRect(ctx, -300, b.y + 24, w + 600, b.h - 48, (b.h - 48) / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

/** Gold module squares at grid cells [[row, col], …]. */
export function goldCells(ctx, x, y, cells, size, gap) {
  for (const [r, c] of cells) {
    const cx = x + c * (size + gap);
    const cy = y + r * (size + gap);
    const g = ctx.createLinearGradient(cx, cy, cx + size, cy + size);
    g.addColorStop(0, '#f8c27a');
    g.addColorStop(1, '#c46a2c');
    ctx.fillStyle = g;
    roundRect(ctx, cx, cy, size, size, Math.max(2, size * 0.18));
    ctx.fill();
  }
}

/** Role icons for a character's roles: { role: img }. */
export async function loadRoleIcons(base, roles) {
  const imgs = await Promise.all(roles.map((r) => loadImage(`${base}icons/roles/${r.toLowerCase()}.webp`)));
  return Object.fromEntries(roles.map((r, i) => [r, imgs[i]]));
}

/**
 * Roles as icon + name pairs on one line, separated by " · ", starting at x.
 * Returns the x after the last role.
 */
export function drawRoles(ctx, roles, icons, x, y, { font, color, size = 20, gap = 6, sep = 16 }) {
  ctx.font = font;
  ctx.fillStyle = color;
  let cx = x;
  roles.forEach((role, i) => {
    if (i > 0) {
      ctx.fillText('·', cx + sep / 2 - 3, y);
      cx += sep;
    }
    const img = icons?.[role];
    if (img) ctx.drawImage(img, cx, y - size + 3, size, size);
    cx += img ? size + gap : 0;
    ctx.fillText(role, cx, y);
    cx += ctx.measureText(role).width;
  });
  return cx;
}

/**
 * One line of text that fits maxWidth: the font steps down from its current
 * size (as set in ctx.font) to `min` before anything is cut. Leaves ctx.font
 * at the size used and returns the text to draw (with "…" only if even the
 * smallest size is too wide).
 */
export function fitLine(ctx, text, maxWidth, min = 11) {
  const m = /(\d+(?:\.\d+)?)px/.exec(ctx.font);
  if (!m) return wrap(ctx, text, maxWidth, 1)[0];
  let size = parseFloat(m[1]);
  const base = ctx.font;
  const at = (s) => base.replace(m[0], `${s}px`);
  while (size > min && ctx.measureText(text).width > maxWidth) {
    size = Math.max(min, size - 1);
    ctx.font = at(size);
  }
  return ctx.measureText(text).width > maxWidth ? wrap(ctx, text, maxWidth, 1)[0] : text;
}

export function wrap(ctx, text, maxWidth, lines) {
  const words = text.split(' ');
  const out = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) out.push(line);
      line = word;
    }
  }
  if (line) out.push(line);
  if (out.length > lines) {
    out.length = lines;
    let last = out[lines - 1];
    while (ctx.measureText(`${last}\u2026`).width > maxWidth && last.length) last = last.slice(0, -1);
    out[lines - 1] = `${last}\u2026`;
  }
  return out;
}

export function pill(ctx, x, y, text, { bg, fg, font = `700 12px ${MONO}`, padX = 8, h = 22 }) {
  ctx.font = font;
  const w = ctx.measureText(text).width + padX * 2;
  ctx.fillStyle = bg;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + padX, y + h / 2 + 1);
  ctx.textBaseline = 'alphabetic';
  return w;
}

// Silver frame: the site's top line (muted silver with smoke wisps) as a
// rounded outline around the whole card. Call clipCard first so the corners
// outside the frame stay transparent, and drawSilverFrame last.
export const FRAME_RADIUS = 28;
export const FRAME_WIDTH = 8;

export function clipCard(ctx, w, h, radius = FRAME_RADIUS) {
  roundRect(ctx, 0, 0, w, h, radius);
  ctx.clip();
}

export function drawSilverFrame(ctx, w, h, { width = FRAME_WIDTH, radius = FRAME_RADIUS } = {}) {
  const ring = () => {
    ctx.beginPath();
    roundRectPath(ctx, 0, 0, w, h, radius);
    roundRectPath(ctx, width, width, w - width * 2, h - width * 2, radius - width);
  };
  ctx.save();
  ring();
  ctx.clip('evenodd');
  const silver = ctx.createLinearGradient(0, 0, w, h);
  [
    [0, '#4a4f5c'], [0.18, '#727886'], [0.36, '#9ea4b1'], [0.5, '#c3c8d2'],
    [0.64, '#979dab'], [0.82, '#6b7180'], [1, '#464b57'],
  ].forEach(([at, col]) => silver.addColorStop(at, col));
  ctx.fillStyle = silver;
  ctx.fillRect(0, 0, w, h);

  // Wisps drift along each edge, placed by a fixed pseudo-random sequence so
  // every export looks the same.
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const perimeter = 2 * (w + h);
  const count = Math.round(perimeter / 28);
  for (let i = 0; i < count; i += 1) {
    const dark = i % 3 === 2;
    let t = rand() * perimeter;
    const across = rand() * width;
    let cx;
    let cy;
    let vertical = false;
    if (t < w) { cx = t; cy = across; }
    else if ((t -= w) < h) { cx = w - across; cy = t; vertical = true; }
    else if ((t -= h) < w) { cx = w - t; cy = h - across; }
    else { t -= w; cx = across; cy = h - t; vertical = true; }
    const rx = 14 + rand() * 40;
    const ry = 1.5 + rand() * 3.5;
    const a = dark ? 0.18 + rand() * 0.2 : 0.14 + rand() * 0.26;
    const tint = dark ? '22, 24, 32' : '245, 247, 252';
    ctx.save();
    ctx.translate(cx, cy);
    if (vertical) ctx.rotate(Math.PI / 2);
    ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, `rgba(${tint}, ${a})`);
    g.addColorStop(1, `rgba(${tint}, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // A faint inner highlight so the frame reads as a raised edge.
  ctx.save();
  ctx.beginPath();
  roundRectPath(ctx, width + 0.5, width + 0.5, w - width * 2 - 1, h - width * 2 - 1, radius - width);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

// Sub-path version of roundRect (no beginPath), so paths can be combined.
function roundRectPath(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Rank badge matching RankBadge.jsx: dark disc, heavy italic gradient letter,
// white outline drawn under the fill.
const RANK_FONT = '"Inter", "Arial Black", "Segoe UI Black", sans-serif';
const RANK_GRADIENTS = {
  S: ['#ffe866', '#ff9d3a', '#ff3d8f'],
  A: ['#ff7ad9', '#e04cff', '#9c46ff'],
  B: ['#c35bff', '#7f7dff', '#47d9ff'],
};
export function drawRank(ctx, rank, x, centerY, size) {
  const stops = RANK_GRADIENTS[rank] ?? ['#d7dbe4', '#a9b0bf', '#7d869a'];
  const r = size / 2;
  const cx = x + r;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, centerY, r, 0, Math.PI * 2);
  ctx.fillStyle = '#141826';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 1;
  ctx.stroke();
  const fs = size * 0.69;
  ctx.font = `italic 900 ${fs}px ${RANK_FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  // Centre the letter's ink, not its advance width (italic glyphs lean right).
  const mt = ctx.measureText(rank);
  const lx = cx - (mt.actualBoundingBoxRight - mt.actualBoundingBoxLeft) / 2;
  const base = centerY + (mt.actualBoundingBoxAscent - mt.actualBoundingBoxDescent) / 2;
  const g = ctx.createLinearGradient(cx - r * 0.3, centerY - r, cx + r * 0.3, centerY + r);
  g.addColorStop(0, stops[0]);
  g.addColorStop(0.5, stops[1]);
  g.addColorStop(1, stops[2]);
  ctx.lineJoin = 'round';
  ctx.lineWidth = size * 0.045;
  ctx.strokeStyle = '#ffffff';
  ctx.strokeText(rank, lx, base);
  ctx.fillStyle = g;
  ctx.fillText(rank, lx, base);
  ctx.restore();
}

// Tilted pink rounded bands with dashed inner tracks, matching the app's backdrop.
const BANDS = [
  { y: -40, x: -120, h: 170, a: 1 },
  { y: 150, x: -420, h: 110, a: 0.7 },
  { y: 310, x: -60, h: 190, a: 1 },
  { y: 500, x: -480, h: 120, a: 0.6 },
  { y: 660, x: -180, h: 160, a: 0.8 },
];
function drawBands(ctx, W = CARD_W, H = CARD_H) {
  // Taller cards repeat the band pattern down the page.
  const bands = H > CARD_H ? [...BANDS, ...BANDS.map((b) => ({ ...b, y: b.y + CARD_H }))] : BANDS;
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate((-12 * Math.PI) / 180);
  ctx.translate(-W / 2, -H / 2);
  for (const b of bands) {
    const w = W * 1.6;
    ctx.globalAlpha = b.a;
    ctx.fillStyle = 'rgba(194, 24, 91, 0.16)';
    roundRect(ctx, b.x, b.y, w, b.h, b.h / 2);
    ctx.fill();
    ctx.setLineDash([10, 8]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(232, 72, 140, 0.24)';
    const inset = 22;
    roundRect(ctx, b.x + 90, b.y + inset, w - 180, b.h - inset * 2, (b.h - inset * 2) / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

export async function ensureFonts() {
  if (!document.fonts?.load) return;
  try {
    await Promise.all([
      document.fonts.load(`800 64px ${DISPLAY}`),
      document.fonts.load(`600 20px ${BODY}`),
      document.fonts.load(`500 12px ${MONO}`),
      document.fonts.load(`italic 900 16px ${RANK_FONT}`),
    ]);
  } catch {
    /* fall back to system fonts */
  }
}

// Team card layouts: 'row' is the wide 1x4 card (16:9), 'grid' a 2x2 card (4:5)
// with twice the width per member, so names, gear and stats don't get cut off.
export const TEAM_LAYOUTS = [
  { id: 'row', label: '1 × 4', hint: 'Wide' },
  { id: 'grid', label: '2 × 2', hint: 'Tall' },
  { id: 'side', label: '2 × 2', hint: 'Side by side' },
];
export const GRID_W = 1080;
export const GRID_H = 1350;
// 'side': 2x2 with each member as a wide card, portrait on the left, details on the right.
export const SIDE_W = 1600;
export const SIDE_H = 1000;
// Member panel metrics per layout (offsets from the panel top).
const METRICS = {
  row: {
    r: 58, cy: 86, shift: 0, frame: { w: 136, h: 126, y: 20, r: 18 }, nameFont: 22, gearFont: 15, gearLine: 19, bonusLine: 17, bonusName: 12, bonusNum: 14, alwaysTwoLines: false,
    aw: { w: 34, h: 20, step: 24, font: 11, rr: 14, rStep: 34 }, elFont: 13, elIcon: 20, rank: 24, roleFont: 14, roleIcon: 16, roleGap: 0,
    dupFont: 12, label: 12, tiles: false,
  },
  grid: {
    r: 74, cy: 104, shift: 34, frame: { w: 236, h: 148, y: 22, r: 22 }, nameFont: 28, gearFont: 18, gearLine: 22, bonusLine: 27, bonusName: 16, bonusNum: 18, alwaysTwoLines: true,
    aw: { w: 42, h: 28, step: 36, font: 14, rr: 19, rStep: 40 }, awTwoCol: true, elFont: 17, elIcon: 26, rank: 30, roleFont: 18, roleIcon: 20, roleGap: 10,
    dupFont: 15, label: 14, tiles: true,
  },
};

/**
 * Arc and Cartridge side by side as image tiles (2x2 layouts). Each column:
 * a label with its tag, then the tile with the name (up to 2 lines) beside it.
 * Returns the height used.
 */
function gearTiles(ctx, x, y, w, o) {
  const colW = (w - 16) / 2;
  const cols = [
    { label: 'ARC', name: o.arc?.name, img: o.arcImg, tag: o.arcTag, extra: o.arcExtra, gold: false },
    { label: 'CARTRIDGE', name: o.cart?.name, img: o.cartImg, tag: o.cartTag, extra: null, gold: true },
  ];
  cols.forEach((col, i) => {
    const cx = x + i * (colW + 16);
    ctx.fillStyle = C.muted;
    ctx.font = `500 ${o.label}px ${MONO}`;
    ctx.fillText(col.label, cx, y + 4);
    let lx = cx + ctx.measureText(col.label).width + 8;
    if (col.extra) {
      ctx.fillStyle = C.fg;
      ctx.fillText(col.extra, lx, y + 4);
      lx += ctx.measureText(col.extra).width + 8;
    }
    if (col.tag) {
      pill(ctx, lx, y - 11, col.tag === 'sig' ? 'SIG' : 'REC', {
        bg: col.tag === 'sig' ? C.sig : '#2a3150', fg: col.tag === 'sig' ? '#1a1400' : C.accent, font: `700 12px ${MONO}`, padX: 7, h: 20,
      });
    }
    const ty = y + 16;
    const s = o.size;
    if (col.gold) {
      const g = ctx.createRadialGradient(cx + s / 2, ty + s / 2, 3, cx + s / 2, ty + s / 2, s * 0.7);
      g.addColorStop(0, '#5a4422');
      g.addColorStop(1, '#2a2416');
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = C.panel2;
    }
    roundRect(ctx, cx, ty, s, s, 10);
    ctx.fill();
    if (col.img) {
      ctx.save();
      roundRect(ctx, cx, ty, s, s, 10);
      ctx.clip();
      const pad = col.gold ? 8 : 0;
      ctx.drawImage(col.img, cx + pad, ty + pad, s - pad * 2, s - pad * 2);
      ctx.restore();
    }
    ctx.strokeStyle = col.gold ? 'rgba(242, 193, 78, 0.6)' : C.line;
    ctx.lineWidth = 1.5;
    roundRect(ctx, cx, ty, s, s, 10);
    ctx.stroke();
    ctx.fillStyle = col.name ? C.fg : C.muted;
    ctx.font = `${col.name ? 600 : 400} ${o.nameFont}px ${BODY}`;
    const lines = wrap(ctx, col.name || '\u2014', colW - s - 12, 2);
    const blockH = lines.length * o.lineH;
    lines.forEach((ln, k) => ctx.fillText(ln, cx + s + 12, ty + (s - blockH) / 2 + o.lineH * (k + 1) - 5));
  });
  return 16 + o.size;
}

/**
 * Renders the team card and returns the canvas.
 * team: { name, members, loadouts }; base: URL prefix for /characters/<id>.webp;
 * layout: 'row' (1x4, default) or 'grid' (2x2).
 */
export async function renderTeamCard(team, { base = '/', layout = 'row', scale = 2 } = {}) {
  const side = layout === 'side';
  const grid = layout === 'grid' || side;
  const W = side ? SIDE_W : grid ? GRID_W : CARD_W;
  const H = side ? SIDE_H : grid ? GRID_H : CARD_H;
  const M = METRICS[grid ? 'grid' : 'row'];
  await ensureFonts();
  const members = team.members.map((id) => (id ? CHARACTER_BY_ID[id] : null));
  const mascot = await loadImage(`${base}mascot.svg`);
  const patterns = await loadPatterns(base, [...new Set(members.filter(Boolean).map((c) => c.arcType))]);
  await loadMetal(base);
  const images = await Promise.all(
    members.map((c) => (c ? loadImage(`${base}characters/hd/${portraitPath(c.id)}`) : null)),
  );
  const analysis = analyzeTeam(team.members);
  // Official element and role icons.
  const elementIds = [...new Set(members.filter(Boolean).map((c) => c.element))];
  const roleIds = [...new Set(members.filter(Boolean).flatMap((c) => c.roles))];
  const cartIds = [...new Set(members.filter(Boolean).map((c) => loadoutOf(team, c.id).cartridge).filter(Boolean))];
  // Arc type icons, shown before each Arc name.
  const arcTypes = [...new Set(team.members.map((id) => {
    const g = id && loadoutOf(team, id);
    return g?.arc && ARC_BY_ID[g.arc]?.type;
  }).filter(Boolean))];
  const arcTypeIcons = Object.fromEntries(
    await Promise.all(arcTypes.map(async (t) => [t, await loadImage(`${base}icons/arc-types/${t.toLowerCase()}.webp`)])),
  );
  const arcArtIds = grid ? [...new Set(team.members.map((id) => id && loadoutOf(team, id).arc).filter(Boolean))] : [];
  const arcArts = Object.fromEntries(
    await Promise.all(arcArtIds.map(async (id) => [id, await loadArcArt(base, id, 256)])),
  );
  const cartIcons = Object.fromEntries(
    await Promise.all(cartIds.map(async (id) => [id, await loadImage(`${base}icons/cartridges/${id}.webp`)])),
  );
  const [elIcons, roleIcons] = await Promise.all([
    Promise.all(elementIds.map((id) => loadImage(`${base}icons/elements/${id}.webp`))).then((l) =>
      Object.fromEntries(elementIds.map((id, i) => [id, l[i]])),
    ),
    Promise.all(roleIds.map((r) => loadImage(`${base}icons/roles/${r.toLowerCase()}.webp`))).then((l) =>
      Object.fromEntries(roleIds.map((r, i) => [r, l[i]])),
    ),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  // Best resampling when portraits are scaled onto the card.
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  clipCard(ctx, W, H);

  // Background
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#121624');
  g.addColorStop(1, C.bg);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  drawBands(ctx, W, H);

  // Header
  const PAD = 48;
  ctx.fillStyle = C.muted;
  ctx.font = `500 13px ${MONO}`;
  ctx.fillText('NEVERNESS TO EVERNESS  \u00b7  TEAM BUILD', PAD, 52);
  ctx.fillStyle = C.fg;
  // Long names step the font down before they'd be cut off.
  const titleText = (team.name || 'Untitled team').toUpperCase();
  const titleW = W - PAD * 2 - 400;
  let titleSize = 58;
  ctx.font = `800 ${titleSize}px ${DISPLAY}`;
  while (titleSize > 30 && ctx.measureText(titleText).width > titleW) {
    titleSize -= 2;
    ctx.font = `800 ${titleSize}px ${DISPLAY}`;
  }
  const title = wrap(ctx, titleText, titleW, 1)[0];
  ctx.fillText(title, PAD, 108);

  // Cortado in the top right corner, role counts beside him
  const MS = 92;
  drawMascot(ctx, mascot, W - PAD - MS + 8, 22, MS);
  ctx.font = `600 15px ${BODY}`;
  let rx = W - PAD - MS - 6;
  for (const [role, n] of Object.entries(analysis.roleCounts).reverse()) {
    const text = `${n} ${role}`;
    ctx.font = `600 14px ${BODY}`;
    const w = ctx.measureText(text).width + 22;
    rx -= w;
    ctx.fillStyle = n ? C.panel2 : C.panel;
    roundRect(ctx, rx, 76, w, 30, 15);
    ctx.fill();
    ctx.fillStyle = n ? C.fg : C.muted;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, rx + 11, 92);
    ctx.textBaseline = 'alphabetic';
    rx -= 8;
  }

  // Member cards
  const top = 136;
  const gap = 18;
  const cols = grid ? 2 : 4;
  const cw = (W - PAD * 2 - gap * (cols - 1)) / cols;
  // 2x2: two rows share the height left over by the header, reactions and footer.
  const ch = grid ? Math.floor((H - top - gap - (side ? 150 : 180)) / 2) : 416;
  (side ? [] : members).forEach((c, i) => {
    const x = PAD + (i % cols) * (cw + gap);
    const top = 136 + Math.floor(i / cols) * (ch + gap);
    if (!c) {
      ctx.strokeStyle = C.line;
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 2;
      roundRect(ctx, x + 1, top + 1, cw - 2, ch - 2, 14);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = C.muted;
      ctx.font = `500 16px ${BODY}`;
      ctx.textAlign = 'center';
      ctx.fillText('Open slot', x + cw / 2, top + ch / 2);
      ctx.textAlign = 'left';
      return;
    }
    const el = EL[c.element];

    ctx.fillStyle = C.panel;
    roundRect(ctx, x, top, cw, ch, 14);
    ctx.fill();
    ctx.save();
    roundRect(ctx, x, top, cw, ch, 14);
    ctx.clip();
    metalStrip(ctx, x, top, cw, 8, el);
    ctx.restore();

    // Portrait in a frame shaped for the layout, on the Arc-type backdrop:
    // Wide (1 x 4): an upright rounded frame. Tall (2 x 2): a broad rounded frame.
    const cx = x + cw / 2;
    const F = M.frame;
    framedPortrait(ctx, images[i], c, { x: cx - F.w / 2, y: top + F.y, w: F.w, h: F.h, r: F.r, color: el, patterns });

    // Awakenings A1-A6 down the left edge, then R3 / R6 Resonance circles.
    const gearAw = loadoutOf(team, c.id);
    const onSet = new Set(gearAw.awakenings);
    const colX = x + 14;
    const pillW = M.aw.w;
    const pillH = M.aw.h;
    // Tall (2 x 2) layout: two columns of three, Resonance side by side below.
    const twoCol = !!M.awTwoCol;
    for (let k = 0; k < 6; k++) {
      const id = `A${k + 1}`;
      const on = onSet.has(id);
      const px = twoCol ? colX + (k % 2) * (pillW + 6) : colX;
      const py = twoCol ? top + 18 + Math.floor(k / 2) * M.aw.step : top + 18 + k * M.aw.step;
      ctx.fillStyle = on ? el : 'rgba(255, 255, 255, 0.06)';
      roundRect(ctx, px, py, pillW, pillH, 6);
      ctx.fill();
      if (!on) {
        ctx.strokeStyle = C.line;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.fillStyle = on ? C.bg : C.muted;
      ctx.font = `700 ${M.aw.font}px ${MONO}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(id, px + pillW / 2, py + pillH / 2 + 1);
    }
    const reso = activeResonance(onSet.size);
    ['R3', 'R6'].forEach((id, k) => {
      const on = reso[id];
      const rcx = twoCol ? colX + pillW / 2 + k * (pillW + 6) : colX + pillW / 2;
      const rcy = twoCol
        ? top + 18 + 3 * M.aw.step + M.aw.rr + 6
        : top + 18 + 6 * M.aw.step + M.aw.rr + 4 + k * M.aw.rStep;
      ctx.beginPath();
      ctx.arc(rcx, rcy, M.aw.rr, 0, Math.PI * 2);
      ctx.fillStyle = on ? el : 'rgba(255, 255, 255, 0.04)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = on ? el : C.line;
      ctx.stroke();
      ctx.fillStyle = on ? C.bg : C.muted;
      ctx.font = `700 ${M.aw.font}px ${MONO}`;
      ctx.fillText(id, rcx, rcy + 1);
    });
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Duplicate count, top-right corner
    if (gearAw.dupes) {
      const dText = `+${gearAw.dupes}`;
      ctx.font = `700 ${M.dupFont}px ${MONO}`;
      const dW = ctx.measureText(dText).width + 16;
      pill(ctx, x + cw - 12 - dW, top + 16, dText, { bg: C.panel2, fg: C.muted, font: `700 ${M.dupFont}px ${MONO}`, h: M.dupFont + 10 });
    }

    // Name and element
    ctx.textAlign = 'center';
    ctx.fillStyle = C.fg;
    const d = M.shift;
    ctx.font = `700 ${M.nameFont}px ${BODY}`;
    ctx.fillText(fitLine(ctx, c.name, cw - 24, 16), cx, top + 176 + d);
    ctx.font = `${M.tiles ? 600 : 500} ${M.elFont}px ${MONO}`;
    ctx.fillStyle = el;
    const elName = ELEMENT_BY_ID[c.element].name.toUpperCase();
    const elW = ctx.measureText(elName).width;
    ctx.textAlign = 'left';
    const elIcon = elIcons[c.element];
    const iconW = elIcon ? M.elIcon + 4 : 0;
    const startX = cx - (iconW + elW + M.rank + 8) / 2;
    const elY = top + 199 + d + (M.tiles ? 6 : 0);
    if (elIcon) ctx.drawImage(elIcon, startX, elY - M.elIcon + 3, M.elIcon, M.elIcon);
    ctx.fillText(elName, startX + iconW, elY);
    drawRank(ctx, c.rarity, startX + iconW + elW + 8, elY - 5, M.rank);

    // Roles, each with its icon, centred as one line
    ctx.font = `500 ${M.roleFont}px ${BODY}`;
    const ROLE_ICON = M.roleIcon;
    const roleY = top + 222 + d + M.roleGap;
    const parts = c.roles.map((role) => ({ role, w: ROLE_ICON + 4 + ctx.measureText(role).width }));
    const sepW = ctx.measureText('  \u00b7  ').width;
    const total = parts.reduce((sum, p) => sum + p.w, 0) + sepW * (parts.length - 1);
    // Stay clear of the awakening column on the left edge.
    let rx2 = Math.max(cx - total / 2, x + 56);
    ctx.fillStyle = C.muted;
    parts.forEach((p, k) => {
      if (k > 0) {
        ctx.fillText('  \u00b7  ', rx2, roleY);
        rx2 += sepW;
      }
      const icon = roleIcons[p.role];
      if (icon) ctx.drawImage(icon, rx2, roleY - ROLE_ICON + 3, ROLE_ICON, ROLE_ICON);
      ctx.fillText(p.role, rx2 + ROLE_ICON + 4, roleY);
      rx2 += p.w;
    });
    ctx.textAlign = 'left';

    // Gear
    const gear = loadoutOf(team, c.id);
    const arc = gear.arc && ARC_BY_ID[gear.arc];
    const cart = gear.cartridge && CARTRIDGE_BY_ID[gear.cartridge];
    const gx = x + 16;
    const gw = cw - 32;
    let gy = top + 248 + d + M.roleGap;

    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gx, gy - 12);
    ctx.lineTo(gx + gw, gy - 12);
    ctx.stroke();

    const bonus = bonusStats(arc, gear.cartStats, consoleStats(c.id, gear.console, gear.cartridge));
    const hasBonus = bonus.length > 0;
    // With bonus stats shown, names stay on one line so the stats have room.
    const maxLines = hasBonus && !M.alwaysTwoLines ? 1 : 2;

    const gearRow = (label, value, tag, extra, icon) => {
      ctx.fillStyle = C.muted;
      ctx.font = `500 11px ${MONO}`;
      ctx.fillText(label, gx, gy + 4);
      let lx = gx + ctx.measureText(label).width + 8;
      if (extra) {
        ctx.fillStyle = C.fg;
        ctx.fillText(extra, lx, gy + 4);
        lx += ctx.measureText(extra).width + 8;
      }
      if (tag) {
        pill(ctx, lx, gy - 9, tag === 'sig' ? 'SIG' : 'REC', {
          bg: tag === 'sig' ? C.sig : '#2a3150',
          fg: tag === 'sig' ? '#1a1400' : C.accent,
          font: `700 10px ${MONO}`,
          padX: 6,
          h: 17,
        });
      }
      ctx.fillStyle = value ? C.fg : C.muted;
      ctx.font = `${value ? 600 : 400} ${M.gearFont}px ${BODY}`;
      const ICON = 20;
      const tx = icon ? gx + ICON + 6 : gx;
      if (icon) {
        ctx.save();
        roundRect(ctx, gx, gy + 10, ICON, ICON, 5);
        ctx.clip();
        ctx.drawImage(icon, gx, gy + 10, ICON, ICON);
        ctx.restore();
      }
      const lines = wrap(ctx, value || '\u2014', gw - (tx - gx), maxLines);
      lines.forEach((ln, k) => ctx.fillText(ln, tx, gy + 24 + k * M.gearLine));
      gy += 30 + lines.length * M.gearLine;
    };
    if (M.tiles) {
      gy += gearTiles(ctx, gx, gy, gw, {
        arc, arcImg: arc && arcArts[arc.id], arcTag: arc ? arcTag(arc, c) : null, arcExtra: arc && gear.arcDupes ? `+${gear.arcDupes}` : null,
        cart, cartImg: cart && cartIcons[cart.id], cartTag: cart && cartridgesFor(c).includes(cart.id) ? 'rec' : null,
        size: 54, label: M.label, nameFont: 17, lineH: 20,
      }) + 22;
    } else {
      gearRow('ARC', arc?.name, arc ? arcTag(arc, c) : null, arc && gear.arcDupes ? `+${gear.arcDupes}` : null, arc && arcTypeIcons[arc.type]);
      gearRow('CARTRIDGE', cart?.name, cart && cartridgesFor(c).includes(cart.id) ? 'rec' : null, null, cart && cartIcons[cart.id]);
    }

    // Bonus stats: Arc + Cartridge, two columns along the bottom of the panel.
    if (hasBonus) {
      // Sits right under the Cartridge row: label, then up to 4 rows x 2 columns.
      const rows = 4;
      const lineH = M.bonusLine;
      const colW = (gw - 10) / 2;
      const by = gy + 10 + (M.tiles ? 12 : 0);
      ctx.fillStyle = C.muted;
      ctx.font = `500 ${M.label}px ${MONO}`;
      ctx.fillText('BONUS STATS', gx, gy - 6);
      const shown = bonus.length > rows * 2 ? bonus.slice(0, rows * 2 - 1) : bonus;
      shown.forEach((b, k) => {
        const bx = gx + Math.floor(k / rows) * (colW + 10);
        const yy = by + (k % rows) * lineH;
        const v = Number.isInteger(b.value) ? String(b.value) : b.value.toFixed(2).replace(/0$/, '');
        const valText = `${v}${isPercentStat(b.stat) ? '%' : ''}`;
        ctx.font = `700 ${M.bonusNum}px ${MONO}`;
        const vw = ctx.measureText(valText).width;
        ctx.fillStyle = C.label;
        // Long names (Lakshana DMG%, Charge Eff.) step down a little before they'd be cut off.
        const name = STAT_SHORT[b.stat] ?? b.stat;
        let fs = M.bonusName;
        ctx.font = `500 ${fs}px ${MONO}`;
        while (fs > M.bonusName - 2 && ctx.measureText(name).width > colW - vw - 5) {
          fs -= 0.5;
          ctx.font = `500 ${fs}px ${MONO}`;
        }
        ctx.fillText(fitLine(ctx, name, colW - vw - 5, 9), bx, yy);
        ctx.fillStyle = C.num;
        ctx.font = `700 ${M.bonusNum}px ${MONO}`;
        ctx.textAlign = 'right';
        ctx.fillText(valText, bx + colW, yy);
        ctx.textAlign = 'left';
      });
      if (shown.length < bonus.length) {
        ctx.fillStyle = C.muted;
        ctx.font = `500 11px ${MONO}`;
        ctx.fillText(`+${bonus.length - shown.length} more`, gx + colW + 10, by + (rows - 1) * lineH);
      }
    }
  });

  // Side-by-side 2x2: portrait and awakenings on the left, details on the right.
  if (side) members.forEach((c, i) => {
    const x = PAD + (i % 2) * (cw + gap);
    const top = 136 + Math.floor(i / 2) * (ch + gap);
    if (!c) {
      ctx.strokeStyle = C.line;
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 2;
      roundRect(ctx, x + 1, top + 1, cw - 2, ch - 2, 14);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = C.muted;
      ctx.font = `500 18px ${BODY}`;
      ctx.textAlign = 'center';
      ctx.fillText('Open slot', x + cw / 2, top + ch / 2);
      ctx.textAlign = 'left';
      return;
    }
    const el = EL[c.element];
    const gear = loadoutOf(team, c.id);
    ctx.fillStyle = C.panel;
    roundRect(ctx, x, top, cw, ch, 14);
    ctx.fill();
    ctx.save();
    roundRect(ctx, x, top, cw, ch, 14);
    ctx.clip();
    metalStrip(ctx, x, top, 8, ch, el, true);
    ctx.restore();

    // Portrait: round frame on the Arc-type backdrop
    const r = Math.min(92, (ch - 100) / 2);
    const cx = x + 30 + r;
    const cy = top + 24 + r;
    framedPortrait(ctx, images[i], c, { x: cx - r, y: cy - r, w: r * 2, h: r * 2, r, color: el, patterns });

    // Awakenings A1-A6 in a row under the portrait, Resonance and duplicates below.
    const onSet = new Set(gear.awakenings);
    const colW = r * 2 + 16;
    const pw = Math.min(32, (colW - 5 * 4) / 6);
    const ax0 = cx - (pw * 6 + 20) / 2;
    const ay = cy + r + 14;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let k = 0; k < 6; k++) {
      const on = onSet.has(`A${k + 1}`);
      const px = ax0 + k * (pw + 4);
      ctx.fillStyle = on ? el : 'rgba(255, 255, 255, 0.06)';
      roundRect(ctx, px, ay, pw, 24, 6);
      ctx.fill();
      if (!on) {
        ctx.strokeStyle = C.line;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.fillStyle = on ? C.bg : C.muted;
      ctx.font = `700 13px ${MONO}`;
      ctx.fillText(`A${k + 1}`, px + pw / 2, ay + 13);
    }
    const reso = activeResonance(onSet.size);
    const ry2 = ay + 44;
    ['R3', 'R6'].forEach((id, k) => {
      const on = reso[id];
      const rcx = cx - 36 + k * 38;
      ctx.beginPath();
      ctx.arc(rcx, ry2, 15, 0, Math.PI * 2);
      ctx.fillStyle = on ? el : 'rgba(255, 255, 255, 0.04)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = on ? el : C.line;
      ctx.stroke();
      ctx.fillStyle = on ? C.bg : C.muted;
      ctx.font = `700 13px ${MONO}`;
      ctx.fillText(id, rcx, ry2 + 1);
    });
    if (gear.dupes) {
      ctx.fillStyle = C.panel2;
      roundRect(ctx, cx + 22, ry2 - 14, 48, 28, 14);
      ctx.fill();
      ctx.fillStyle = C.muted;
      ctx.font = `700 15px ${MONO}`;
      ctx.fillText(`+${gear.dupes}`, cx + 46, ry2 + 1);
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Details
    const dx = x + 30 + r * 2 + 34;
    const dw = x + cw - 26 - dx;
    let y = top + 54;
    ctx.fillStyle = C.fg;
    ctx.font = `700 34px ${BODY}`;
    ctx.fillText(fitLine(ctx, c.name, dw, 20), dx, y);
    y += 36;
    let fx = dx;
    const elIcon = elIcons[c.element];
    if (elIcon) ctx.drawImage(elIcon, fx, y - 22, 28, 28);
    fx += elIcon ? 34 : 0;
    ctx.font = `600 18px ${MONO}`;
    ctx.fillStyle = el;
    const elName = ELEMENT_BY_ID[c.element].name.toUpperCase();
    ctx.fillText(elName, fx, y);
    fx += ctx.measureText(elName).width + 10;
    drawRank(ctx, c.rarity, fx, y - 6, 30);
    fx += 44;
    ctx.font = `500 19px ${BODY}`;
    ctx.fillStyle = C.muted;
    c.roles.forEach((role, k) => {
      if (k > 0) {
        ctx.fillText('·', fx, y);
        fx += 16;
      }
      const icon = roleIcons[role];
      if (icon) ctx.drawImage(icon, fx, y - 17, 20, 20);
      ctx.fillText(role, fx + 25, y);
      fx += 25 + ctx.measureText(role).width + 12;
    });
    y += 18;
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(dx, y);
    ctx.lineTo(dx + dw, y);
    ctx.stroke();

    const arc = gear.arc && ARC_BY_ID[gear.arc];
    const cart = gear.cartridge && CARTRIDGE_BY_ID[gear.cartridge];
    y += 30;
    y += gearTiles(ctx, dx, y, dw, {
      arc, arcImg: arc && arcArts[arc.id], arcTag: arc ? arcTag(arc, c) : null, arcExtra: arc && gear.arcDupes ? `+${gear.arcDupes}` : null,
      cart, cartImg: cart && cartIcons[cart.id], cartTag: cart && cartridgesFor(c).includes(cart.id) ? 'rec' : null,
      size: 56, label: 14, nameFont: 18, lineH: 21,
    });

    // Bonus stats: three columns.
    const bonus = bonusStats(arc, gear.cartStats, consoleStats(c.id, gear.console, gear.cartridge));
    if (bonus.length) {
      y += 30;
      ctx.fillStyle = C.muted;
      ctx.font = `500 14px ${MONO}`;
      ctx.fillText('BONUS STATS', dx, y);
      const cols3 = 3;
      const LH = 25;
      const rowsN = Math.max(1, Math.floor((top + ch - 12 - (y + 4)) / LH));
      const cap = cols3 * rowsN;
      const shown = bonus.length > cap ? bonus.slice(0, cap - 1) : bonus;
      const bw = (dw - 18 * (cols3 - 1)) / cols3;
      shown.forEach((b, k) => {
        const bx = dx + Math.floor(k / rowsN) * (bw + 18);
        const yy = y + 26 + (k % rowsN) * LH;
        const v = Number.isInteger(b.value) ? String(b.value) : b.value.toFixed(2).replace(/0$/, '');
        const valText = `${v}${isPercentStat(b.stat) ? '%' : ''}`;
        ctx.font = `700 17px ${MONO}`;
        const vw = ctx.measureText(valText).width;
        const name = STAT_SHORT[b.stat] ?? b.stat;
        let fs = 15;
        ctx.font = `500 ${fs}px ${MONO}`;
        while (fs > 12 && ctx.measureText(name).width > bw - vw - 6) {
          fs -= 0.5;
          ctx.font = `500 ${fs}px ${MONO}`;
        }
        ctx.fillStyle = C.label;
        ctx.fillText(fitLine(ctx, name, bw - vw - 6, 10), bx, yy);
        ctx.fillStyle = C.num;
        ctx.font = `700 17px ${MONO}`;
        ctx.textAlign = 'right';
        ctx.fillText(valText, bx + bw, yy);
        ctx.textAlign = 'left';
      });
      if (shown.length < bonus.length) {
        ctx.fillStyle = C.muted;
        ctx.font = `500 14px ${MONO}`;
        const k = shown.length;
        ctx.fillText(`+${bonus.length - shown.length} more`, dx + Math.floor(k / rowsN) * (bw + 18), y + 26 + (k % rowsN) * LH);
      }
    }
  });

  // Reactions
  const rows = grid ? 2 : 1;
  let ry = top + rows * ch + (rows - 1) * gap + 30;
  ctx.fillStyle = C.muted;
  ctx.font = `500 12px ${MONO}`;
  ctx.fillText('REACTIONS', PAD, ry);
  let px = PAD + 96;
  const chips = [
    ...analysis.trios.map((t) => ({ text: `${t.name} \u00b7 Trio`, trio: true, els: t.elements })),
    ...analysis.reactions.map((r) => ({ text: r.name, els: r.elements })),
  ];
  if (chips.length === 0) {
    ctx.fillStyle = C.muted;
    ctx.font = `400 15px ${BODY}`;
    ctx.fillText('No reactions yet', px, ry);
  }
  let line = 1;
  for (const chip of chips) {
    ctx.font = `600 15px ${BODY}`;
    const dots = chip.els.length * 12;
    const w = ctx.measureText(chip.text).width + 28 + dots;
    if (px + w > W - PAD) {
      if (!grid || line === 2) break;
      line += 1;
      px = PAD + 96;
      ry += 40;
    }
    ctx.fillStyle = chip.trio ? '#262c4a' : C.panel2;
    roundRect(ctx, px, ry - 22, w, 32, 16);
    ctx.fill();
    chip.els.forEach((e, k) => {
      ctx.beginPath();
      ctx.arc(px + 16 + k * 12, ry - 6, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = EL[e];
      ctx.fill();
    });
    ctx.fillStyle = chip.trio ? C.accent : C.fg;
    ctx.fillText(chip.text, px + 14 + dots + 4, ry);
    px += w + 8;
  }

  // Footer: legal line on the left, card code on the right.
  // Long codes (full gear) move the legal line up and wrap onto two lines.
  const LEGAL = 'Unofficial fan project. Neverness to Everness \u00a9 Hotta Studio / Perfect World Games.';
  const code = encodeCardCode(team, loadoutOf);
  ctx.font = `400 12px ${BODY}`;
  const legalW = ctx.measureText(LEGAL).width;
  const labelW = 46;
  const fits = (text, size) => {
    ctx.font = `600 ${size}px ${MONO}`;
    return ctx.measureText(text).width;
  };
  const maxW = W - PAD * 2 - labelW;
  let codeSize = 20;
  let codeLines = [code];
  const sideBySide = PAD + legalW + 32 + labelW + fits(code, 20) <= W - PAD;
  if (!sideBySide) {
    codeSize = Math.max(15, Math.min(20, Math.floor((20 * maxW) / fits(code, 20))));
    if (fits(code, codeSize) > maxW) {
      // Two lines: the team part, then the team name's part.
      const [teamPart, namePart] = splitCardCode(code);
      const groups = code.split('-');
      const half = Math.ceil(groups.length / 2);
      codeLines = namePart
        ? [`${teamPart}-`, namePart]
        : [groups.slice(0, half).join('-') + '-', groups.slice(half).join('-')];
      codeSize = Math.max(13, Math.min(18, Math.floor((codeSize * maxW) / fits(codeLines[0], codeSize))));
    }
  }
  const lineGap = codeSize + 4;
  const codeTop = H - 22 - (codeLines.length - 1) * lineGap;
  // Site and socials sit right-aligned just above the code. When the legal
  // line also moves up and the two would meet, the legal line goes one row higher.
  const linksFont = `500 12px ${BODY}`;
  const linksY = codeTop - codeSize - 10;
  const linksW = measureLinksLine(ctx, { font: linksFont, iconSize: 13, gap: 18 });
  let legalY = sideBySide ? H - 24 : linksY;
  if (!sideBySide && PAD + legalW + 24 > W - PAD - linksW) legalY = linksY - 18;
  ctx.fillStyle = C.muted;
  ctx.font = `400 12px ${BODY}`;
  ctx.fillText(LEGAL, PAD, legalY);
  drawLinksLine(ctx, W - PAD, linksY, { font: linksFont, color: C.muted, accent: C.fg, iconSize: 13, gap: 18, align: 'right' });
  // Card code: type it into the builder to rebuild this team and its gear.
  ctx.textAlign = 'right';
  ctx.font = `600 ${codeSize}px ${MONO}`;
  ctx.fillStyle = C.fg;
  codeLines.forEach((ln, i) => ctx.fillText(ln, W - PAD, codeTop + i * lineGap));
  const firstW = ctx.measureText(codeLines[0]).width;
  ctx.font = `500 11px ${MONO}`;
  ctx.fillStyle = C.muted;
  ctx.fillText('CODE', W - PAD - firstW - 12, codeTop - 2);
  ctx.textAlign = 'left';


  drawSilverFrame(ctx, W, H);
  return canvas;
}

export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
