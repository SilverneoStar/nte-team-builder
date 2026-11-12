// Draws a shareable single-character build card, laid out like the game's
// Character Guide screen: portrait on the left, a header strip with the
// Console bonus, build stats / Arc / Cartridge panels, and a Console
// Development panel with current and recommended modules plus the grid.
import { loadArcArt } from './arcPlayer.js';
import { portraitPath } from './portraits.js';
import { ELEMENT_BY_ID } from '../data/elements.js';
import { ARCS, ARC_BY_ID, FREE_ARCS, RECOMMENDED, arcAccess, arcTag } from '../data/arcs.js';
import { CARTRIDGE_BY_ID, bonusStats, cartridgesFor, isPercentStat, moduleLevel } from '../data/gear.js';
import {
  CHARACTER_CONSOLE,
  CONSOLE_SIZE,
  SHAPES,
  consoleStats,
  maskOf,
  occupancy,
  setProgress,
} from '../data/console.js';
import { suggestedBuild, suggestedCartStats } from '../data/consoleBuilds.js';
import { MAX_STATS_LEVEL, confirmedStats } from '../data/maxStats.js';
import { ENDGAME } from '../data/endgame.js';
import { AWAKENING_ORDER } from '../data/awakeningOrder.js';
import { skillIconUrl } from './skillIcons.js';
import { encodeConsoleCode } from './consoleCode.js';
import { fillStatText } from './statText.js';
import { drawLinksBlock, drawLinksLine, measureLinksLine } from './cardLinks.js';
import { drawQR, qrText } from './qr.js';
import { COMMUNITY_BUILDS } from '../data/communityBuilds.js';
import { drawSkillPriority, loadSkillPriorityIcons, skillPriorityFor } from './skillPriorityDraw.js';
import { drawTagPills, loadTagMarks } from './cardTags.js';
import { loadoutOf } from './teamsReducer.js';
import { drawPortraitBackdrop, setPortraitShadow } from './arcPattern.js';
import {
  BODY,
  DISPLAY,
  EL,
  MONO,
  clipCard,
  drawRank,
  drawSilverFrame,
  ensureFonts,
  loadImage,
  roundRect,
  wrap,
  drawBandBackdrop,
  evenBands,
  goldCells,
  fitLine,
  loadRoleIcons,
  drawRoles,
  rolesWidth,
  drawMascot,
} from './teamCard.js';

export const BUILD_W = 1600;
export const BUILD_H = 880;

// Charcoal panels and gold modules, like the in-game guide.
const K = {
  bg: '#121318',
  panel: 'rgba(29, 30, 36, 0.94)',
  inset: '#26272e',
  line: '#34353e',
  fg: '#eceef3',
  muted: '#cdd1dc',
  pink: '#e8488c',
  pinkSoft: 'rgba(232, 72, 140, 0.18)',
  gold: '#f2c14e',
  goldDeep: '#c98a23',
  goldTile: '#3b3120',
  // Stat highlights: values warm gold, stat names a soft periwinkle, labels light grey.
  num: '#ffc061',
  key: '#b9c3ff',
  label: '#dde0e8',
};

const ROMAN = { 2: 'II', 3: 'III', 4: 'IV' };

// The game's names for stats: "ATK Bonus", "Chaos DMG Bonus"…
export function statLabel(stat) {
  const map = { 'ATK%': 'ATK Bonus', 'HP%': 'HP Bonus', 'DEF%': 'DEF Bonus', 'DMG%': 'DMG Bonus' };
  if (map[stat]) return map[stat];
  if (/ DMG%$/.test(stat)) return stat.replace(/%$/, ' Bonus');
  if (stat.endsWith('%')) return stat.slice(0, -1);
  return stat;
}
const statValue = (stat, value) => {
  const n = Number(value);
  const text = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return `${text}${isPercentStat(stat) ? '%' : ''}`;
};

// Shorter wording for the narrower Instagram header.
const specShort = (spec) => {
  const stat = spec.stat.endsWith('DMG') && !spec.stat.startsWith('CRIT') ? `${spec.stat} Bonus` : spec.stat;
  return `${stat} +${spec.value}% per Type ${ROMAN[spec.type]} Module`;
};

const specText = (spec) => {
  const stat = spec.stat.endsWith('DMG') && !spec.stat.startsWith('CRIT') ? `${spec.stat} Bonus` : spec.stat;
  return `Increases ${stat} by ${spec.value}% for each Type ${ROMAN[spec.type]} Module equipped.`;
};

/**
 * Collects what a build card shows for one character.
 * `current` (optional): { pieces, cartridge, cartStats, arc } from the Console page.
 * Otherwise the character's loadout in `team` is used, if they are in it.
 */
export function characterBuild(character, { team = null, current = null, source = null, recStats = null } = {}) {
  const inTeam = team?.members.includes(character.id);
  const lo = inTeam ? loadoutOf(team, character.id) : null;
  const recArcId = ARCS.find((a) => a.signature === character.id)?.id ?? (RECOMMENDED[character.id] ?? [])[0];
  const arcId = current?.arc ?? lo?.arc ?? null;
  const arc = arcId ? ARC_BY_ID[arcId] : null;
  const pieces = current?.pieces ?? lo?.console ?? [];
  const cartridge = current?.cartridge ?? lo?.cartridge ?? null;
  const cartStats = current?.cartStats ?? lo?.cartStats ?? null;
  const rec = suggestedBuild(character.id, cartridge);
  const shownArc = arc ?? (recArcId ? ARC_BY_ID[recArcId] : null);
  const shownCart = cartridge ?? rec?.cartridge ?? null;
  return {
    character,
    source: source ?? (current ? 'Console build' : inTeam ? `Team · ${team.name}` : 'Recommended build'),
    arc: shownArc,
    arcState: arc ? 'Equipped' : 'Recommended',
    arcDupes: current?.arcDupes ?? lo?.arcDupes ?? null,
    awakeningOrder: current?.awakeningOrder ?? null,
    cartridge: cartridge ?? rec?.cartridge ?? null,
    cartStats,
    pieces,
    recommended: rec,
    recStats: recStats ?? suggestedCartStats(character, cartridge ?? rec?.cartridge ?? null),
    alternatives: alternativesFor(character, shownArc?.id, [shownCart, rec?.cartridge]),
  };
}

const EASY = ['free', 'pass'];

/**
 * Best backup picks beside what the card shows. The Arc is one anyone can
 * get: the first free or battle-pass S/A-rank Arc in the signature + guide
 * list, else the Fluff Arc of the character's type, else the strongest free
 * Arc of that type. Limited and paid Arcs are never suggested. Cartridge sets
 * are the next ones in the guides' ranking.
 */
export function alternativesFor(character, arcId, shownCarts = []) {
  const ok = (a) =>
    a && a.id !== arcId && a.type === character.arcType && a.rarity !== 'B' && EASY.includes(arcAccess(a.id));
  const sig = ARCS.find((a) => a.signature === character.id)?.id;
  // Free picks first (S-rank, then A-rank), then the signature and the guides' list.
  const listed = [...new Set([...(FREE_ARCS[character.id] ?? []), sig, ...(RECOMMENDED[character.id] ?? [])])].map(
    (id) => ARC_BY_ID[id],
  );
  const altArc =
    listed.find(ok) ??
    ARCS.find((a) => ok(a) && a.name.startsWith('Fluff of')) ??
    ARCS.filter(ok).sort((a, b) => b.atk - a.atk)[0];
  const carts = cartridgesFor(character)
    .filter((id) => !shownCarts.includes(id))
    .slice(0, 2);
  return { arc: altArc ?? null, cartridges: carts };
}

function panel(ctx, x, y, w, h, title) {
  ctx.fillStyle = K.panel;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = K.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  if (title) {
    ctx.fillStyle = K.muted;
    ctx.font = `600 17px ${BODY}`;
    ctx.fillText(title, x + 18, y + 30);
  }
}

// A module tile: dark gold square, the shape in gold, a pink level badge.
function moduleTile(ctx, x, y, size, shape, level) {
  ctx.fillStyle = K.goldTile;
  roundRect(ctx, x, y, size, size, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(232, 150, 84, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  const cells = SHAPES[shape].cells;
  const w = Math.max(...cells.map(([, c]) => c)) + 1;
  const h = Math.max(...cells.map(([r]) => r)) + 1;
  const cell = Math.min(13, Math.floor((size - 22) / Math.max(w, h)));
  const gap = 2;
  const gw = w * cell + (w - 1) * gap;
  const gh = h * cell + (h - 1) * gap;
  goldCells(ctx, x + (size - gw) / 2, y + (size - gh) / 2 + 4, cells, cell, gap);
  if (level != null) {
    ctx.font = `700 15px ${MONO}`;
    const t = String(level);
    const bw = ctx.measureText(t).width + 10;
    ctx.fillStyle = K.pink;
    roundRect(ctx, x + size - bw - 3, y - 7, bw, 18, 9);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(t, x + size - bw / 2 - 3, y + 6.5);
    ctx.textAlign = 'left';
  }
}

export function cartTile(ctx, x, y, size, img) {
  const g = ctx.createRadialGradient(x + size / 2, y + size / 2, 4, x + size / 2, y + size / 2, size * 0.7);
  g.addColorStop(0, '#5a4422');
  g.addColorStop(1, K.goldTile);
  ctx.fillStyle = g;
  roundRect(ctx, x, y, size, size, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(242, 193, 78, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  if (img) ctx.drawImage(img, x + 8, y + 8, size - 16, size - 16);
}

// One "Current" / "Recommended" row. Returns the height used.
/**
 * One line of alternatives: a small mono label, then icon + name items.
 * Items that don't fit before `right` are dropped; the last kept name is shortened.
 */
function altLine(ctx, x, y, right, label, items) {
  ctx.font = `700 14px ${MONO}`;
  ctx.fillStyle = K.muted;
  ctx.fillText(label, x, y);
  let cx = x + ctx.measureText(label).width + 14;
  const ICON = 24;
  items.forEach((it, i) => {
    if (cx + ICON + 40 > right) return;
    if (it.img) {
      ctx.save();
      roundRect(ctx, cx, y - 18, ICON, ICON, 6);
      ctx.clip();
      ctx.drawImage(it.img, cx, y - 18, ICON, ICON);
      ctx.restore();
      cx += ICON + 7;
    }
    ctx.font = `600 18px ${BODY}`;
    ctx.fillStyle = K.fg;
    const name = fitLine(ctx, it.name, right - cx, 11);
    ctx.fillText(name, cx, y);
    cx += ctx.measureText(name).width;
    if (it.note) {
      ctx.font = `600 16px ${BODY}`;
      ctx.fillStyle = K.muted;
      const note = `  ·  ${it.note}`;
      if (cx + ctx.measureText(note).width <= right) {
        ctx.fillText(note, cx, y);
        cx += ctx.measureText(note).width;
      }
    }
    if (i < items.length - 1) cx += 22;
  });
}

function moduleRow(ctx, x, y, w, label, cartId, pieces, cartImg) {
  ctx.fillStyle = K.muted;
  ctx.font = `600 18px ${BODY}`;
  ctx.fillText(label, x, y + 16);
  if (cartId) {
    const prog = setProgress(cartId, pieces);
    const name = `${CARTRIDGE_BY_ID[cartId].name} ×${Math.min(prog.count, 4)}`;
    ctx.textAlign = 'right';
    ctx.fillStyle = prog.four ? K.gold : K.fg;
    ctx.font = `700 18px ${BODY}`;
    ctx.fillText(name, x + w, y + 16);
    ctx.textAlign = 'left';
  }
  const tile = 64;
  const gap = 10;
  const top = y + 34;
  cartTile(ctx, x, top, 72, cartImg);
  ctx.fillStyle = K.muted;
  ctx.font = `700 22px ${BODY}`;
  ctx.fillText('+', x + 82, top + 44);
  const startX = x + 106;
  const perRow = Math.max(1, Math.floor((w - 106 + gap) / (tile + gap)));
  if (!pieces.length) {
    ctx.fillStyle = K.muted;
    ctx.font = `600 17px ${BODY}`;
    ctx.fillText('No modules placed', startX, top + 42);
    return 34 + 72;
  }
  pieces.forEach((p, i) => {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    moduleTile(
      ctx,
      startX + col * (tile + gap),
      top + 4 + row * (tile + gap + 6),
      tile,
      p.shape,
      p.stats ? moduleLevel(p.stats) : 20,
    );
  });
  const rows = Math.ceil(pieces.length / perRow);
  return 34 + Math.max(72, rows * (tile + gap + 6) + 4);
}

// Outline of a module on the grid as a clockwise list of corner points.
// Each square spans [at, at + cell]; squares of the same module are joined
// across the gap between them.
function pieceOutline(cells, same, at, atY, cell, gap) {
  // Sides run clockwise. A side's end reaches across the gap when the next
  // square along it is in the module; its start reaches back across the gap
  // at an inner corner. That way every side starts where the last one ended.
  const segs = [];
  for (const [r, c] of cells) {
    const x0 = at(r, c);
    const y0 = atY(r);
    const x1 = x0 + cell;
    const y1 = y0 + cell;
    if (!same(r - 1, c)) {
      const s0 = same(r, c - 1) && same(r - 1, c - 1) ? gap : 0;
      const e0 = same(r, c + 1) ? gap : 0;
      segs.push([
        [x0 - s0, y0],
        [x1 + e0, y0],
      ]);
    }
    if (!same(r, c + 1)) {
      const s0 = same(r - 1, c) && same(r - 1, c + 1) ? gap : 0;
      const e0 = same(r + 1, c) ? gap : 0;
      segs.push([
        [x1, y0 - s0],
        [x1, y1 + e0],
      ]);
    }
    if (!same(r + 1, c)) {
      const s0 = same(r, c + 1) && same(r + 1, c + 1) ? gap : 0;
      const e0 = same(r, c - 1) ? gap : 0;
      segs.push([
        [x1 + s0, y1],
        [x0 - e0, y1],
      ]);
    }
    if (!same(r, c - 1)) {
      const s0 = same(r + 1, c) && same(r + 1, c - 1) ? gap : 0;
      const e0 = same(r - 1, c) ? gap : 0;
      segs.push([
        [x0, y1 + s0],
        [x0, y0 - e0],
      ]);
    }
  }
  const key = ([px, py]) => `${Math.round(px * 10)},${Math.round(py * 10)}`;
  const byStart = new Map(segs.map((sg) => [key(sg[0]), sg]));
  const pts = [];
  let cur = segs[0];
  for (let guard = 0; guard <= segs.length && cur; guard += 1) {
    pts.push(cur[0]);
    cur = byStart.get(key(cur[1]));
    if (cur === segs[0]) break;
  }
  // Drop points that sit on a straight line.
  return pts.filter((pt, i) => {
    const a = pts[(i - 1 + pts.length) % pts.length];
    const b = pts[(i + 1) % pts.length];
    return Math.abs((pt[0] - a[0]) * (b[1] - pt[1]) - (pt[1] - a[1]) * (b[0] - pt[0])) > 0.01;
  });
}

// Closed path through `pts` with every corner rounded.
function roundedPolygon(ctx, pts, radius) {
  const n = pts.length;
  ctx.beginPath();
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(pts[n - 1], pts[0]);
  ctx.moveTo(start[0], start[1]);
  for (let i = 0; i < n; i += 1) {
    const p = pts[i];
    const q = pts[(i + 1) % n];
    const prev = pts[(i - 1 + n) % n];
    const r = Math.min(
      radius,
      Math.hypot(p[0] - prev[0], p[1] - prev[1]) / 2,
      Math.hypot(q[0] - p[0], q[1] - p[1]) / 2,
    );
    ctx.arcTo(p[0], p[1], q[0], q[1], r);
  }
  ctx.closePath();
}

// The 5x5 template: each module is one gold block, seams between modules,
// blocked cells left as faint outlines.
function consoleGrid(ctx, x, y, cell, layout, pieces) {
  const mask = maskOf(layout);
  const occ = occupancy(pieces);
  const gap = 5;
  const at = (_r, c) => x + c * (cell + gap);
  const atY = (r) => y + r * (cell + gap);
  const same = (r, c, me) => r >= 0 && c >= 0 && r < CONSOLE_SIZE && c < CONSOLE_SIZE && occ[r][c] === me;
  for (let r = 0; r < CONSOLE_SIZE; r += 1) {
    for (let c = 0; c < CONSOLE_SIZE; c += 1) {
      const cx = at(r, c);
      const cy = atY(r);
      if (!mask[r][c]) {
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 1;
        roundRect(ctx, cx + 3, cy + 3, cell - 6, cell - 6, 5);
        ctx.stroke();
      } else if (occ[r][c] === -1) {
        ctx.fillStyle = K.inset;
        roundRect(ctx, cx, cy, cell, cell, 6);
        ctx.fill();
      }
    }
  }
  pieces.forEach((p, me) => {
    const cells = SHAPES[p.shape].cells.map(([a, b]) => [p.r + a, p.c + b]);
    const outline = pieceOutline(cells, (r, c) => same(r, c, me), at, atY, cell, gap);
    const radius = Math.max(2.5, cell * 0.09); // slight rounding, like the in-game template
    const xs = outline.map(([px]) => px);
    const ys = outline.map(([, py]) => py);
    const x0 = Math.min(...xs);
    const y0 = Math.min(...ys);
    const x1 = Math.max(...xs);
    const y1 = Math.max(...ys);

    // Body: one rounded shape per module (outer and inner corners rounded).
    ctx.save();
    roundedPolygon(ctx, outline, radius);
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, '#f8c27a');
    g.addColorStop(0.55, '#e4954c');
    g.addColorStop(1, '#c46a2c');
    ctx.fillStyle = g;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundedPolygon(ctx, outline, radius);
    ctx.clip();
    // Faint large circles across the module, like the game's tile pattern.
    const cxm = (x0 + x1) / 2;
    const cym = (y0 + y1) / 2;
    ctx.strokeStyle = 'rgba(255, 228, 196, 0.22)';
    ctx.lineWidth = 1.4;
    for (const k of [0.55, 1.05, 1.6]) {
      ctx.beginPath();
      ctx.arc(cxm + cell * 0.35, cym + cell * 0.3, cell * k, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Light rim just inside each square.
    ctx.strokeStyle = 'rgba(255, 226, 196, 0.38)';
    ctx.lineWidth = 1.2;
    for (const [r, c] of cells) {
      roundRect(ctx, at(r, c) + 3, atY(r) + 3, cell - 6, cell - 6, Math.max(1.5, cell * 0.05));
      ctx.stroke();
    }
    // Engraved grooves between the squares of one module: a dark cut with a
    // light lip beside it, running edge to edge so they notch the outline.
    const groove = (ax, ay, bx, by, horizontal) => {
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(112, 50, 16, 0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 222, 190, 0.55)';
      ctx.lineWidth = 1.2;
      const o = 2.2;
      ctx.beginPath();
      ctx.moveTo(ax + (horizontal ? 0 : o), ay + (horizontal ? o : 0));
      ctx.lineTo(bx + (horizontal ? 0 : o), by + (horizontal ? o : 0));
      ctx.stroke();
    };
    for (const [r, c] of cells) {
      if (same(r, c + 1, me)) {
        const gx = at(r, c) + cell + gap / 2;
        const top = same(r - 1, c, me) && same(r - 1, c + 1, me) ? atY(r) - gap / 2 : atY(r) - 2;
        const bottom = same(r + 1, c, me) && same(r + 1, c + 1, me) ? atY(r) + cell + gap / 2 : atY(r) + cell + 2;
        groove(gx, top, gx, bottom, false);
      }
      if (same(r + 1, c, me)) {
        const gy = atY(r) + cell + gap / 2;
        const left = same(r, c - 1, me) && same(r + 1, c - 1, me) ? at(r, c) - gap / 2 : at(r, c) - 2;
        const right = same(r, c + 1, me) && same(r + 1, c + 1, me) ? at(r, c) + cell + gap / 2 : at(r, c) + cell + 2;
        groove(left, gy, right, gy, true);
      }
    }
    // Bevel: light inner edge on top/left, dark on bottom/right.
    roundedPolygon(ctx, outline, radius);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 230, 200, 0.35)';
    ctx.stroke();
    ctx.restore();
    roundedPolygon(ctx, outline, radius);
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = 'rgba(104, 46, 14, 0.95)';
    ctx.stroke();
  });
  return CONSOLE_SIZE * cell + (CONSOLE_SIZE - 1) * gap;
}

// A flat Awakening badge, like the game's Awakening screen: dark disc, thick
// glowing ring in the element colour. `first` adds a stronger glow and a check badge.
/** Official awakening icons for a character, by id (A1–A6); missing ones are left out. */
export async function loadAwakeningIcons(characterId) {
  const ids = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'];
  const imgs = await Promise.all(ids.map((id) => {
    const url = skillIconUrl(characterId, id);
    return url ? loadImage(url).catch(() => null) : null;
  }));
  return Object.fromEntries(ids.map((id, i) => [id, imgs[i]]).filter(([, im]) => im));
}

/**
 * One step of the awakening order: the orb with the game's awakening icon and a
 * small "A1" tag on its lower edge, or just the "A1" label when there's no icon.
 */
function luminance(hex) {
  const m = /^#?([0-9a-f]{6})/i.exec(hex);
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  const lin = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}

export function drawAwakenStep(ctx, cx, cy, d, color, first, id, icon, tagScale = 0.25) {
  drawOrb(ctx, cx, cy, d / 2, color, first);
  ctx.save();
  ctx.textAlign = 'center';
  if (!icon) {
    ctx.font = `800 ${Math.round(d * 0.34)}px ${MONO}`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(id, cx, cy + d * 0.12);
    ctx.restore();
    return;
  }
  const s = d * 0.7;
  ctx.drawImage(icon, cx - s / 2, cy - s / 2 - d * 0.06, s, s);
  const fs = Math.max(10, Math.round(d * tagScale));
  ctx.font = `800 ${fs}px ${MONO}`;
  const w = ctx.measureText(id).width + fs * 0.7;
  const h = fs * 1.25;
  const ty = cy + d / 2 - h * 0.45;
  const tagBg = first ? shade(color, 0.15) : color;
  ctx.fillStyle = tagBg;
  roundRect(ctx, cx - w / 2, ty, w, h, h / 2);
  ctx.fill();
  // Dark text on light element colours (Lakshana gold, Anima green), white on the rest.
  ctx.fillStyle = luminance(tagBg) > 0.45 ? '#16131b' : '#ffffff';
  ctx.fillText(id, cx, ty + h * 0.76);
  ctx.restore();
}

export function drawOrb(ctx, cx, cy, r, color, first) {
  const ring = Math.max(3, r * 0.17);
  ctx.save();
  // Outer glow
  ctx.shadowColor = `${color}66`;
  ctx.shadowBlur = first ? r * 0.5 : r * 0.22;
  ctx.fillStyle = '#16131b';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Ring
  ctx.lineWidth = ring;
  ctx.strokeStyle = first ? shade(color, 0.15) : color;
  ctx.beginPath();
  ctx.arc(cx, cy, r - ring / 2, 0, Math.PI * 2);
  ctx.stroke();
  // Faint inner glow just inside the ring
  ctx.lineWidth = 2;
  ctx.strokeStyle = `${color}33`;
  ctx.beginPath();
  ctx.arc(cx, cy, r - ring - 1.5, 0, Math.PI * 2);
  ctx.stroke();
  if (first) {
    // Check badge, top-left
    const br = r * 0.3;
    const bx = cx - r * 0.72;
    const by = cy - r * 0.72;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = shade(color, -0.35);
    ctx.lineWidth = Math.max(2, br * 0.32);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(bx - br * 0.45, by + br * 0.02);
    ctx.lineTo(bx - br * 0.1, by + br * 0.38);
    ctx.lineTo(bx + br * 0.5, by - br * 0.35);
    ctx.stroke();
  }
}

// Lighten (amt > 0) or darken (amt < 0) a #rrggbb colour.
function shade(hex, amt) {
  const v = parseInt(hex.slice(1), 16);
  const f = (c) => Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt);
  const [r, g, b] = [f((v >> 16) & 255), f((v >> 8) & 255), f(v & 255)];
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** Renders the build card and returns the canvas. */
/** Card sizes: the wide card, or the Instagram portrait post (4:5). */
export const BUILD_IG_W = 1080;
export const BUILD_IG_H = 1350;

/**
 * Renders the build card and returns the canvas.
 * format: 'wide' (1600 x 880) or 'ig' (1080 x 1350, Instagram 4:5): the same
 * panels, with the portrait and name across the top and the two columns below.
 */
export async function renderBuildCard(build, { base = '/', scale = 2, format = 'wide' } = {}) {
  const ig = format === 'ig';
  const W = ig ? BUILD_IG_W : BUILD_W;
  const H = ig ? BUILD_IG_H : BUILD_H;
  await ensureFonts(base);
  const c = build.character;
  const el = ELEMENT_BY_ID[c.element];
  const sp = skillPriorityFor(c.id);
  const spIcons = sp ? await loadSkillPriorityIcons(c.id) : {};
  const ao = build.awakeningOrder?.length ? { order: build.awakeningOrder } : AWAKENING_ORDER[c.id];
  const awakenIcons = await loadAwakeningIcons(c.id);
  const info = CHARACTER_CONSOLE[c.id];
  const elColor = EL[c.element] ?? K.pink;
  const alt = build.alternatives ?? { arc: null, cartridges: [] };
  const [altArcArt, ...altCartImgs] = await Promise.all([
    alt.arc ? loadArcArt(base, alt.arc.id, 256) : null,
    ...alt.cartridges.map((id) => loadImage(`${base}icons/cartridges/${id}.webp`)),
  ]);
  const [portrait, elIcon, cartImg, recCartImg, arcImg, arcArt] = await Promise.all([
    // 512 px portrait (AI-upscaled from the 256 px source) so the card stays sharp.
    loadImage(`${base}characters/hd/${portraitPath(c.id)}`),
    loadImage(`${base}icons/elements/${c.element}.webp`),
    build.cartridge ? loadImage(`${base}icons/cartridges/${build.cartridge}.webp`) : null,
    build.recommended ? loadImage(`${base}icons/cartridges/${build.recommended.cartridge}.webp`) : null,
    build.arc ? loadImage(`${base}icons/arc-types/${build.arc.type.toLowerCase()}.webp`) : null,
    build.arc ? loadArcArt(base, build.arc.id, 512) : null,
  ]);

  const roleIcons = await loadRoleIcons(base, c.roles);
  const tagMarks = await loadTagMarks(base, c.tags);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.imageSmoothingQuality = 'high';
  clipCard(ctx, W, H);
  drawBandBackdrop(ctx, W, H, evenBands(H));

  const PAD = 32;

  // ---- Left: portrait and identity ----
  const LW = ig ? 280 : 340;
  const px = PAD;
  const py = PAD;
  const MS = 96;
  // Name and details: under the portrait (wide) or beside it (Instagram).
  const tx0 = ig ? PAD + LW + 28 : px;
  const TW = ig ? W - PAD - MS - 12 - tx0 : LW;
  // Wide: the portrait frame is a little shorter than it is wide (cropped at
  // the foot) to leave room for the Awakening order below.
  const PH = ig || !ao ? LW : LW - 44;
  await drawPortraitBackdrop(ctx, { x: px, y: py, w: LW, h: PH, r: 22, arcType: c.arcType, base });
  if (portrait) {
    ctx.save();
    roundRect(ctx, px, py, LW, PH, 22);
    ctx.clip();
    setPortraitShadow(ctx, LW);
    ctx.drawImage(portrait, px, py, LW, LW);
    ctx.restore();
  }
  ctx.strokeStyle = elColor;
  ctx.lineWidth = 3;
  roundRect(ctx, px, py, LW, PH, 22);
  ctx.stroke();

  let ly = ig ? py + 58 : py + PH + 58;
  ctx.fillStyle = K.fg;
  ctx.font = `italic 700 24px ${DISPLAY}`;
  const lvW = ctx.measureText(`LV. ${MAX_STATS_LEVEL}`).width + 14;
  let nameSize = 54;
  ctx.font = `italic 800 ${nameSize}px ${DISPLAY}`;
  while (nameSize > 30 && ctx.measureText(c.name.toUpperCase()).width > TW - lvW) {
    nameSize -= 2;
    ctx.font = `italic 800 ${nameSize}px ${DISPLAY}`;
  }
  ctx.fillText(c.name.toUpperCase(), tx0, ly);
  const nameW = ctx.measureText(c.name.toUpperCase()).width;
  ctx.font = `italic 700 24px ${DISPLAY}`;
  ctx.fillStyle = K.muted;
  ctx.fillText(`LV. ${MAX_STATS_LEVEL}`, tx0 + nameW + 14, ly);

  ly += 40;
  drawRank(ctx, c.rarity, tx0, ly - 8, 36);
  if (elIcon) ctx.drawImage(elIcon, tx0 + 46, ly - 24, 32, 32);
  ctx.fillStyle = elColor;
  ctx.font = `700 19px ${BODY}`;
  ctx.fillText(el.name, tx0 + 86, ly);
  // Roles beside the element when they fit, otherwise on their own line.
  const roleOpts = { font: `600 18px ${BODY}`, color: K.muted, size: 22 };
  let roleX = tx0 + 86 + ctx.measureText(el.name).width + 18;
  if (roleX + rolesWidth(ctx, c.roles, roleIcons, roleOpts) > tx0 + TW) {
    roleX = tx0;
    ly += 32;
  }
  drawRoles(ctx, c.roles, roleIcons, roleX, ly, roleOpts);
  // In-game tags (Main DPS, Instant Cycle...) on their own row.
  if (c.tags?.length) ly = drawTagPills(ctx, c.tags, tagMarks, tx0, ly + 16, TW, { size: 14, color: K.fg }) - 6;

  ly += 36;
  ctx.font = `600 18px ${BODY}`;
  ctx.fillStyle = K.muted;
  const factionText = c.faction
    ? `${c.faction}${c.unit ? ` · ${c.unit}` : ''}`
    : c.formerFaction
      ? `Former ${c.formerFaction}`
      : '';
  const lines = ig ? 1 : 2;
  // Instagram: the tag row takes the faction line's place, so the header still
  // clears the Console panel.
  const showFaction = !(ig && c.tags?.length);
  for (const line of showFaction ? wrap(ctx, factionText, TW, lines) : []) {
    ctx.fillText(line, tx0, ly);
    ly += 22;
  }
  if (c.ability) {
    ctx.fillStyle = K.fg;
    // Wide: one line, shrinking a little to fit, so the column below has room.
    const txt = `Esper ability: ${c.ability}`;
    let fs = 18;
    for (; !ig && fs > 14; fs -= 1) {
      ctx.font = `italic 500 ${fs}px ${BODY}`;
      if (ctx.measureText(txt).width <= TW) break;
    }
    ctx.font = `italic 500 ${fs}px ${BODY}`;
    for (const line of wrap(ctx, txt, TW, ig ? lines : 2)) {
      ctx.fillText(line, tx0, ly + 4);
      ly += 22;
    }
  }

  // Site and socials at the foot of the left column, under the character info.
  // (Instagram: under the Cartridge stats panel, drawn further down.)
  const linksBottom = H - 74 - 4;
  // Wide: skill priority, then the Awakening order as a 2 × 3 grid, under the
  // character info (the site links move to the footer line).
  if (!ig) {
    const colBottom = H - 50;
    const aoH = ao ? 26 + 2 * 76 : 0;
    const spRoom = colBottom - aoH - (ly + 6);
    if (sp && spRoom >= 84) {
      const sy = ly + 6;
      ctx.fillStyle = K.muted;
      ctx.font = `600 17px ${BODY}`;
      ctx.fillText('Level skills first', tx0, sy + 16);
      ly = sy + 26 + drawSkillPriority(ctx, sp.tiers, spIcons, tx0, sy + 26, TW, {
        d: Math.min(ao ? 42 : 56, spRoom - 50), labelPx: 15, font: BODY, color: K.fg, muted: K.muted, disc: K.inset, accent: elColor,
      });
    }
    if (ao && colBottom - (ly + 4) >= 26 + 2 * 50) {
      const ay = Math.max(ly + 4, colBottom - aoH);
      ctx.fillStyle = K.muted;
      ctx.font = `600 17px ${BODY}`;
      ctx.fillText('Awakening order', tx0, ay + 16);
      ctx.font = `600 14px ${BODY}`;
      ctx.fillText('one per duplicate', tx0 + ctx.measureText('Awakening order  ').width + 22, ay + 16);
      // Each row leaves room for the orb's A-tag hanging below it.
      const rowH = Math.min(76, (colBottom - 8 - ay - 26) / 2);
      const d = rowH - 19;
      const cw = TW / 3;
      ao.order.forEach((id, i) => {
        const cx = tx0 + cw * (i % 3) + cw / 2;
        const cy = ay + 26 + rowH * Math.floor(i / 3) + d / 2;
        drawAwakenStep(ctx, cx, cy, d, elColor, i === 0, id, awakenIcons[id], 0.3);
        ctx.fillStyle = K.muted;
        ctx.font = `700 ${Math.round(d * 0.5)}px ${BODY}`;
        ctx.textAlign = 'center';
        if (i % 3 < 2 && i < ao.order.length - 1) ctx.fillText('›', cx + cw / 2, cy + d * 0.17);
        ctx.textAlign = 'left';
      });
    }
  }

  // The console code, also carried by a QR code and inside the PNG file.
  const consoleCode =
    info && (build.pieces.length || build.cartridge)
      ? encodeConsoleCode({ layout: info.layout, cartridge: build.cartridge, cartStats: build.cartStats, pieces: build.pieces })
      : '';
  const qrCode = consoleCode ? qrText('console', consoleCode) : '';
  if (qrCode && ctx.canvas.dataset) ctx.canvas.dataset.code = qrCode;
  const QS = 72;

  // ---- Header strip ---- (wide: top right; Instagram: beside the portrait's foot)
  const RX = PAD + LW + 28;
  const RW = W - RX - PAD;
  const HY = ig ? PAD + LW - 84 : PAD;
  ctx.fillStyle = K.panel;
  roundRect(ctx, RX, HY, RW, 84, 16);
  ctx.fill();
  ctx.strokeStyle = K.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Pink ring with the rank letter, like the guide header.
  ctx.beginPath();
  ctx.arc(RX + 50, HY + 42, 30, 0, Math.PI * 2);
  ctx.fillStyle = K.pink;
  ctx.fill();
  drawRank(ctx, c.rarity, RX + 25, HY + 42, 50);
  ctx.fillStyle = K.fg;
  ctx.font = `italic 800 30px ${DISPLAY}`;
  ctx.fillText('CONSOLE DEVELOPMENT', RX + 98, HY + 38);
  const specPx = ig ? 17 : 19;
  ctx.font = `600 ${specPx}px ${BODY}`;
  const specRoom = RW - 98 - (ig ? 24 : 380);
  // The short form when the full sentence won't fit beside the QR code.
  const spec = info
    ? ig || ctx.measureText(specText(info.spec)).width > specRoom
      ? specShort(info.spec)
      : specText(info.spec)
    : 'Console data not published yet.';
  fillStatText(ctx, spec, RX + 98, HY + 67, {
    font: `600 ${specPx}px ${BODY}`,
    numFont: `700 ${specPx}px ${BODY}`,
    color: K.muted,
    keyColor: K.key,
    numColor: K.num,
    maxWidth: specRoom,
  });
  const mascotX = ig ? W - PAD - MS + 6 : RX + RW - MS - 6;
  drawMascot(ctx, await loadImage(`${base}mascot.svg`), mascotX, PAD - 8, MS);
  ctx.textAlign = 'right';
  ctx.font = `700 14px ${MONO}`;
  ctx.fillStyle = K.pink;
  if (ig) ctx.fillText(build.source.toUpperCase(), RX + RW - 18, HY + 36 - 42 - 12);
  else ctx.fillText(build.source.toUpperCase(), RX + RW - MS - 14 - (qrCode ? QS + 14 : 0), PAD + 36);
  if (qrCode && !ig) {
    // QR code with the console code (lib/qr.js), between the label and Cortado.
    drawQR(ctx, qrCode, RX + RW - MS - 14 - QS, HY + (84 - QS) / 2, QS);
    ctx.font = `600 11px ${MONO}`;
    ctx.fillStyle = K.muted;
    ctx.fillText('SCAN OR UPLOAD', RX + RW - MS - 28 - QS, PAD + 58);
  }
  ctx.textAlign = 'left';

  const top = ig ? PAD + LW + 16 : PAD + 84 + 16;
  const bottom = H - 74;
  const LCW = ig ? 456 : 500;
  const LCX = ig ? PAD : RX;
  const RCX = LCX + LCW + 16;
  const RCW = (ig ? W - PAD : RX + RW) - RCX;
  // Instagram: fixed Arc / Cartridge panels, the site links under them, and
  // the Key attributes panel takes the rest of the column.
  const IG_CART_H = 236;
  const IG_LINKS_H = 96;

  // ---- Key attributes: Level 80 base (when known) plus what the build adds ----
  const extra = bonusStats(
    build.arc && build.arcState === 'Equipped' ? build.arc : null,
    build.cartStats,
    consoleStats(c.id, build.pieces, build.cartridge),
  );
  // Only confirmed in-game values are shown.
  const ms = confirmedStats(c.id);
  let stats = extra;
  if (ms) {
    const take = (stat) => {
      const i = stats.findIndex((x) => x.stat === stat);
      if (i === -1) return 0;
      const [x] = stats.splice(i, 1);
      return x.value;
    };
    stats = [...extra];
    const elDmg = `${el.name} DMG%`;
    const round = (n) => Math.round(n * 100) / 100;
    // Base value unknown (estimated stats): show only what the build adds, or nothing.
    const plus = (b, add) => (b == null ? (add ? round(add) : null) : round(b + add));
    stats = [
      { stat: 'HP', value: round(ms.hp + take('HP')) },
      { stat: 'ATK', value: round(ms.atk + take('ATK')) },
      { stat: 'DEF', value: round(ms.def + take('DEF')) },
      { stat: 'CRIT Rate', value: plus(ms.critRate, take('CRIT Rate')) },
      { stat: 'CRIT DMG', value: plus(ms.critDmg, take('CRIT DMG')) },
      { stat: elDmg, value: plus(ms.estimated ? null : (ms.dmg?.[c.element] ?? 0), take(elDmg)) },
      { stat: 'Universal DMG%', value: plus(ms.universal, take('Universal DMG%') + take('DMG%')) },
      ...stats,
    ];
    if (ms.cycle) stats.push({ stat: 'Cycle Intensity', value: round(ms.cycle + take('Cycle Intensity')) });
    if (ms.breakInt) stats.push({ stat: 'Break Intensity', value: round(ms.breakInt + take('Break Intensity')) });
  }
  // Recommended endgame targets, shown beside each value.
  const eg = ENDGAME[c.id]?.endgame;
  const targetKey = {
    HP: 'hp',
    ATK: 'atk',
    DEF: 'def',
    'CRIT Rate': 'critRate',
    'CRIT DMG': 'critDmg',
    'Universal DMG%': 'universal',
    [`${el.name} DMG%`]: 'element',
    'Cycle Intensity': 'cycle',
    'Break Intensity': 'break',
  };
  const target = (stat) => eg?.[targetKey[stat]] ?? null;
  if (eg && !ms) {
    // No Level 80 stats yet: list the targets on their own.
    const have = new Set(stats.map((x) => x.stat));
    for (const [stat, key] of Object.entries(targetKey))
      if (eg[key] && !have.has(stat)) stats.push({ stat, value: null });
  }
  if (eg) {
    // Rows with a target first, then the rest; drop base-only rows without a target or bonus.
    const extraStats = new Set(extra.map((x) => x.stat));
    stats = stats.filter((x) => target(x.stat) || extraStats.has(x.stat) || !ms);
    stats.sort((a, b) => (target(b.stat) ? 1 : 0) - (target(a.stat) ? 1 : 0));
  }
  const arcHFor = build.arc && alt.arc ? 172 : 132;
  const statsH = ig ? bottom - top - arcHFor - IG_CART_H - 28 - IG_LINKS_H : eg ? 250 : 214;
  panel(ctx, LCX, top, LCW, statsH, 'Key attributes');
  ctx.textAlign = 'right';
  ctx.fillStyle = K.muted;
  ctx.font = `600 16px ${BODY}`;
  ctx.fillText(
    `${ms ? `Lv ${MAX_STATS_LEVEL} base${ms.estimated ? ' (est.)' : ''} + build` : 'from this build'}${eg ? ' / endgame target' : ''}`,
    LCX + LCW - 18,
    top + 30,
  );
  ctx.textAlign = 'left';
  if (!stats.length) {
    ctx.fillStyle = K.muted;
    ctx.font = `600 18px ${BODY}`;
    ctx.fillText('No stat values entered yet.', LCX + 18, top + 70);
  } else {
    // One row per stat: name, value, endgame target (gold).
    const maxRows = Math.floor((statsH - 52) / 22);
    const rowH = Math.min(ig ? 36 : 30, Math.floor((statsH - 52) / Math.min(stats.length, maxRows)));
    const valueX = LCX + LCW - (eg ? 150 : 28);
    const short = (t) => t.replace(/%?\s*~\s*/, '–');
    stats.slice(0, maxRows).forEach((st, i) => {
      const sy = top + 44 + i * rowH;
      if (i % 2 === 0) {
        ctx.fillStyle = K.inset;
        roundRect(ctx, LCX + 12, sy, LCW - 24, rowH, 5);
        ctx.fill();
      }
      const base = sy + rowH / 2 + 5;
      ctx.font = `600 18px ${BODY}`;
      ctx.fillStyle = K.label;
      ctx.fillText(wrap(ctx, statLabel(st.stat), valueX - LCX - 130, 1)[0], LCX + 24, base);
      ctx.textAlign = 'right';
      ctx.font = `700 17px ${MONO}`;
      ctx.fillStyle = st.value == null ? K.muted : K.num;
      const capped = st.stat === 'CRIT Rate' && Number(st.value) > 100;
      // Estimated base (no in-game Level 80 values yet): mark HP/ATK/DEF as approximate.
      const approx = ms?.estimated && ['HP', 'ATK', 'DEF'].includes(st.stat) && st.value != null;
      const v =
        st.value == null
          ? '—'
          : capped
            ? '100% (cap)'
            : isPercentStat(st.stat)
              ? statValue(st.stat, Number(st.value))
              : `${approx ? '≈ ' : ''}${Number(st.value).toLocaleString('en-US')}`;
      ctx.fillText(v, valueX, base);
      const t = target(st.stat);
      if (t) {
        ctx.font = `500 17px ${MONO}`;
        ctx.fillStyle = K.label;
        ctx.fillText(`\u2192 ${short(t)}`, LCX + LCW - 24, base);
      }
      ctx.textAlign = 'left';
    });
  }

  // ---- Arc ----
  const arcY = top + statsH + 14;
  const arcH = arcHFor;
  panel(ctx, LCX, arcY, LCW, arcH, 'Arc');
  if (build.arc) {
    const a = build.arc;
    // Arc art in a tile, with the Arc type icon on the details line.
    const AS = 80;
    const ax = LCX + 16;
    const ay = arcY + 40;
    ctx.save();
    roundRect(ctx, ax, ay, AS, AS, 14);
    ctx.fillStyle = '#1b1c22';
    ctx.fill();
    ctx.clip();
    if (arcArt) ctx.drawImage(arcArt, ax - 4, ay - 4, AS + 8, AS + 8);
    else if (arcImg) ctx.drawImage(arcImg, ax + 12, ay + 12, AS - 24, AS - 24);
    ctx.restore();
    ctx.strokeStyle = K.line;
    ctx.lineWidth = 1.5;
    roundRect(ctx, ax, ay, AS, AS, 14);
    ctx.stroke();
    const tx = ax + AS + 16;
    ctx.fillStyle = K.fg;
    ctx.font = `700 22px ${BODY}`;
    const nm = fitLine(ctx, a.name, LCX + LCW - tx - 150, 14);
    ctx.fillText(nm, tx, arcY + 66);
    const tag =
      arcTag(a, c) === 'sig' ? 'Signature' : build.source === 'Recommended build' ? 'Recommended' : build.arcState;
    ctx.font = `700 15px ${MONO}`;
    const tw = ctx.measureText(tag.toUpperCase()).width + 16;
    ctx.fillStyle = tag === 'Signature' ? K.gold : K.pinkSoft;
    roundRect(ctx, LCX + LCW - tw - 18, arcY + 14, tw, 24, 12);
    ctx.fill();
    ctx.fillStyle = tag === 'Signature' ? '#1b1405' : K.pink;
    ctx.fillText(tag.toUpperCase(), LCX + LCW - tw - 10, arcY + 31);
    ctx.font = `600 18px ${BODY}`;
    ctx.fillStyle = K.muted;
    const dupes = build.arcDupes ? ` · +${build.arcDupes}` : '';
    if (arcImg) ctx.drawImage(arcImg, tx, arcY + 76, 18, 18);
    ctx.fillText(`${a.rarity}-rank ${a.type}${dupes}`, tx + (arcImg ? 24 : 0), arcY + 90);
    // "ATK 570   Crit DMG 48%": names light, values gold.
    let sx = tx;
    const [subName, subVal] = [a.sub.replace(/\s*[\d.]+%?$/, ''), (a.sub.match(/[\d.]+%?$/) || [''])[0]];
    for (const [name, val] of [
      ['ATK', String(a.atk)],
      [subName, subVal],
    ]) {
      ctx.font = `600 17px ${BODY}`;
      ctx.fillStyle = K.label;
      ctx.fillText(name, sx, arcY + 115);
      sx += ctx.measureText(name).width + 7;
      ctx.font = `700 18px ${MONO}`;
      ctx.fillStyle = K.num;
      ctx.fillText(val, sx, arcY + 115);
      sx += ctx.measureText(val).width + 22;
    }
    if (alt.arc) {
      // Best backup Arc, under a hairline.
      ctx.strokeStyle = K.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(LCX + 18, arcY + 134.5);
      ctx.lineTo(LCX + LCW - 18, arcY + 134.5);
      ctx.stroke();
      altLine(ctx, LCX + 18, arcY + 160, LCX + LCW - 18, 'ALTERNATIVE', [
        {
          img: altArcArt,
          name: alt.arc.name,
          note: `${alt.arc.rarity}-rank · ${arcAccess(alt.arc.id) === 'pass' ? 'Battle pass' : 'Free'}`,
        },
      ]);
    }
  } else {
    ctx.fillStyle = K.muted;
    ctx.font = `600 18px ${BODY}`;
    ctx.fillText('No Arc chosen.', LCX + 18, arcY + 74);
  }

  // ---- Cartridge stats ----
  const cY = arcY + arcH + 14;
  const cH = ig ? IG_CART_H : bottom - cY;
  if (ig) drawLinksBlock(ctx, LCX + 6, bottom - 6, { font: `600 15px ${BODY}`, color: K.muted, accent: K.fg });
  panel(ctx, LCX, cY, LCW, cH, 'Cartridge stats');
  const cs = build.cartStats;
  const rows = [
    cs?.main ? { k: 'Main', ...cs.main } : null,
    ...(cs?.subs ?? []).map((x) => (x ? { k: 'Sub', ...x } : null)),
  ].filter(Boolean);
  const list = rows.length
    ? rows
    : [{ k: 'Main', ...build.recStats.main }, ...build.recStats.subs.map((x) => ({ k: 'Sub', ...x }))];
  if (!rows.length) {
    ctx.textAlign = 'right';
    ctx.fillStyle = K.muted;
    ctx.font = `600 16px ${BODY}`;
    ctx.fillText('suggested priorities', LCX + LCW - 18, cY + 30);
    ctx.textAlign = 'left';
  }
  const rowH = Math.min(30, (cH - 58) / 5);
  list.slice(0, 5).forEach((r, i) => {
    const ry = cY + 44 + i * rowH + (i ? 8 : 0);
    if (i === 1) {
      // Divider between the main stat and the sub stats.
      ctx.strokeStyle = K.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(LCX + 18, ry - 6.5);
      ctx.lineTo(LCX + LCW - 18, ry - 6.5);
      ctx.stroke();
    }
    ctx.fillStyle = i === 0 ? 'rgba(242, 193, 78, 0.12)' : K.inset;
    roundRect(ctx, LCX + 18, ry, LCW - 36, rowH - 5, 6);
    ctx.fill();
    ctx.font = `700 14px ${MONO}`;
    ctx.fillStyle = i === 0 ? K.gold : K.muted;
    ctx.fillText(r.k.toUpperCase(), LCX + 30, ry + rowH / 2 + 2);
    ctx.font = `600 18px ${BODY}`;
    ctx.fillStyle = r.value ? K.label : K.key;
    ctx.fillText(statLabel(r.stat), LCX + 82, ry + rowH / 2 + 3);
    if (r.value) {
      ctx.textAlign = 'right';
      ctx.font = `700 17px ${MONO}`;
      ctx.fillStyle = K.num;
      ctx.fillText(statValue(r.stat, r.value), LCX + LCW - 30, ry + rowH / 2 + 3);
      ctx.textAlign = 'left';
    }
  });

  // ---- Console development ----
  panel(ctx, RCX, top, RCW, bottom - top, 'Console development');
  const innerX = RCX + 18;
  const innerW = RCW - 36;
  let y = top + 46;
  const sameAsRec =
    build.recommended &&
    build.cartridge === build.recommended.cartridge &&
    JSON.stringify(build.pieces.map(({ shape, r, c: col }) => [shape, r, col])) ===
      JSON.stringify(build.recommended.pieces.map(({ shape, r, c: col }) => [shape, r, col]));
  const hasCurrent = build.pieces.length > 0 && !sameAsRec;
  // A player's own build shows only their modules; other cards compare with the recommendation.
  const ownBuild = build.source === 'My build';
  if (hasCurrent || (ownBuild && build.pieces.length)) {
    y += moduleRow(ctx, innerX, y, innerW, 'Current', build.cartridge, build.pieces, cartImg) + 14;
  }
  if (build.recommended && !ownBuild) {
    y +=
      moduleRow(
        ctx,
        innerX,
        y,
        innerW,
        'Recommended',
        build.recommended.cartridge,
        build.recommended.pieces,
        recCartImg,
      ) + 14;
  }
  if (ig && alt.cartridges.length) {
    // Other sets the build guides rank for this character.
    altLine(
      ctx,
      innerX,
      y + 14,
      innerX + innerW,
      'ALTERNATIVE SETS',
      alt.cartridges.map((id, i) => ({
        img: altCartImgs[i],
        name: CARTRIDGE_BY_ID[id].name,
      })),
    );
    y += 34;
  }

  // Attribute priorities + grid template.
  const gridPieces = hasCurrent || ownBuild ? build.pieces : (build.recommended?.pieces ?? []);
  // Leave room under the grid for the Awakening order orbs.
  // Wide: the bottom of this panel holds the alternative Cartridge and stats;
  // Instagram: the Awakening order orbs.
  const altCart = alt.cartridges[0];
  const altStats = COMMUNITY_BUILDS[c.id];
  const footH = ig ? (ao ? 96 : 0) : altCart || altStats ? 150 : 0;
  const avail = bottom - 18 - y - footH;
  const cell = Math.max(22, Math.min(ig ? 48 : 46, Math.floor((avail - 30 - 20) / 5)));
  const gridSize = cell * 5 + 20;
  const gx = RCX + RCW - 18 - gridSize;
  ctx.fillStyle = K.muted;
  ctx.font = `600 18px ${BODY}`;
  ctx.fillText(ownBuild ? 'Attributes & template' : 'Recommended attributes & template', innerX, y + 16);
  if (info) consoleGrid(ctx, gx, y + 30, cell, info.layout, gridPieces);
  const recList = [build.recStats.main.stat, ...build.recStats.subs.map((s) => s.stat)];
  const lw = gx - innerX - 16;
  const lh = Math.min(38, (gridSize - 8) / recList.length);
  recList.forEach((stat, i) => {
    const ry = y + 30 + i * lh + (i ? 8 : 0);
    if (i === 1) {
      // Divider between the main stat and the sub stats.
      ctx.strokeStyle = K.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(innerX, ry - 7);
      ctx.lineTo(innerX + lw, ry - 7);
      ctx.stroke();
    }
    ctx.fillStyle = K.inset;
    roundRect(ctx, innerX, ry, lw, lh - 6, 8);
    ctx.fill();
    ctx.font = `700 13px ${MONO}`;
    ctx.fillStyle = i === 0 ? K.gold : K.muted;
    ctx.fillText(i === 0 ? 'MAIN' : `SUB ${i}`, innerX + 10, ry + (lh - 6) / 2 + 4);
    ctx.font = `600 ${ig ? 16 : 18}px ${BODY}`;
    ctx.fillStyle = i === 0 ? K.num : K.key;
    ctx.fillText(wrap(ctx, statLabel(stat), lw - (ig ? 62 : 70), 1)[0], innerX + (ig ? 56 : 62), ry + (lh - 6) / 2 + 5);
  });

  // Awakening unlock order in the space under the attributes and grid:
  // element-coloured orbs, A6 → A4 → A1 …, one per duplicate.
  const orbTop = Math.max(y + 30 + recList.length * lh + 8, y + 30 + gridSize) + 18;
  if (!ig && (altCart || altStats)) {
    // Alternative Cartridge (the next one the guides rank) and alternative stats.
    let ay = orbTop;
    const half = altCart && altStats ? (innerW - 20) / 2 : innerW;
    if (altCart) {
      const cart = CARTRIDGE_BY_ID[altCart];
      ctx.fillStyle = K.muted;
      ctx.font = `600 17px ${BODY}`;
      ctx.fillText('Alternative Cartridge', innerX, ay + 14);
      cartTile(ctx, innerX, ay + 28, 48, altCartImgs[0]);
      ctx.fillStyle = K.fg;
      ctx.font = `700 18px ${BODY}`;
      ctx.fillText(wrap(ctx, cart.name, half - 62, 1)[0], innerX + 60, ay + 46);
      ctx.fillStyle = K.muted;
      ctx.font = `600 14px ${BODY}`;
      wrap(ctx, `4PC: ${cart.four}`, half - 62, 3).forEach((l, i) => ctx.fillText(l, innerX + 60, ay + 68 + i * 19));
      if (alt.cartridges[1]) {
        ctx.font = `600 14px ${BODY}`;
        ctx.fillText(`Also: ${CARTRIDGE_BY_ID[alt.cartridges[1]].name}`, innerX, ay + 136);
      }
    }
    if (altStats) {
      const sx = altCart ? innerX + half + 20 : innerX;
      ctx.fillStyle = K.muted;
      ctx.font = `600 17px ${BODY}`;
      ctx.fillText('Alternative stats', sx, ay + 14);
      ctx.font = `600 13px ${BODY}`;
      ctx.fillText('community sheet', sx + 150, ay + 14);
      ctx.font = `700 13px ${MONO}`;
      ctx.fillStyle = K.pink;
      ctx.fillText('MAIN', sx, ay + 44);
      ctx.fillText('SUB', sx, ay + 96);
      ctx.fillStyle = K.fg;
      ctx.font = `600 16px ${BODY}`;
      wrap(ctx, altStats.main, half - 52, 2).forEach((l, i) => ctx.fillText(l, sx + 48, ay + 44 + i * 21));
      wrap(ctx, altStats.sub, half - 52, 2).forEach((l, i) => ctx.fillText(l, sx + 48, ay + 96 + i * 21));
    }
  }
  if (ig && ao && bottom - 14 - orbTop >= 78) {
    ctx.fillStyle = K.muted;
    ctx.font = `600 18px ${BODY}`;
    ctx.fillText('Awakening order', innerX, orbTop + 14);
    const tw = ctx.measureText('Awakening order  ').width;
    ctx.font = `600 15px ${BODY}`;
    ctx.fillText('one per duplicate', innerX + tw, orbTop + 14);
    // Two rows of three, as big as the space allows (the QR code takes the
    // bottom-right corner under them).
    const n = ao.order.length;
    const cols = 3;
    const rows = Math.ceil(n / cols);
    const top0 = orbTop + 30;
    const space = bottom - 14 - (qrCode ? 112 : 0) - top0;
    const cw = innerW / cols;
    const d = Math.max(44, Math.min(80, Math.floor(space / rows) - 16, cw - 56));
    const rowH = d + 16;
    ao.order.forEach((id, i) => {
      const cx = innerX + cw * (i % cols) + cw / 2;
      const cy = top0 + rowH * Math.floor(i / cols) + d / 2;
      drawAwakenStep(ctx, cx, cy, d, elColor, i === 0, id, awakenIcons[id], 0.3);
      ctx.textAlign = 'center';
      if (i % cols < cols - 1 && i < n - 1) {
        ctx.font = `600 ${Math.round(d * 0.4)}px ${BODY}`;
        ctx.fillStyle = K.muted;
        ctx.fillText('→', cx + cw / 2, cy + d * 0.14);
      }
      ctx.textAlign = 'left';
    });
  }

  if (qrCode && ig) {
    // Instagram: the QR code sits at the foot of the right column.
    const Q = 100;
    const qx = RCX + RCW - 20 - Q;
    const qy = bottom - 14 - Q;
    drawQR(ctx, qrCode, qx, qy, Q);
    ctx.textAlign = 'right';
    ctx.font = `600 12px ${MONO}`;
    ctx.fillStyle = K.muted;
    ctx.fillText('SCAN, OR UPLOAD THIS', qx - 14, qy + Q - 22);
    ctx.fillText('IMAGE ON THE SITE', qx - 14, qy + Q - 4);
    ctx.textAlign = 'left';
  }

  // ---- Footer: console code + legal line ----
  const code = consoleCode;
  ctx.font = `600 13px ${BODY}`;
  ctx.fillStyle = K.muted;
  ctx.fillText(
    'Unofficial fan project · Neverness to Everness © Hotta Studio / Perfect World Games',
    PAD,
    H - 30,
  );
  if (!ig) {
    // The site links sit on the footer line, between the legal note and the code
    // (one size smaller when they'd run into it).
    const legalW = ctx.measureText('Unofficial fan project · Neverness to Everness © Hotta Studio / Perfect World Games').width;
    ctx.font = `700 20px ${MONO}`;
    const codeW = code ? ctx.measureText(code).width + 14 + 100 : 0;
    const room = W - PAD - codeW - (PAD + legalW + 30) - 16;
    let lf = 14;
    while (lf > 11 && measureLinksLine(ctx, { font: `600 ${lf}px ${BODY}`, iconSize: lf, gap: 20 }) > room) lf -= 1;
    drawLinksLine(ctx, PAD + legalW + 30, H - 30, { font: `600 ${lf}px ${BODY}`, color: K.muted, accent: K.fg, iconSize: lf, gap: lf + 4 });
  }
  if (code) {
    ctx.textAlign = 'right';
    ctx.font = `700 20px ${MONO}`;
    ctx.fillStyle = K.fg;
    ctx.fillText(code, W - PAD, H - 28);
    const cw = ctx.measureText(code).width;
    ctx.font = `600 12px ${MONO}`;
    ctx.fillStyle = K.pink;
    ctx.fillText('CONSOLE CODE', W - PAD - cw - 14, H - 30);
    ctx.textAlign = 'left';
  }

  drawSilverFrame(ctx, W, H);
  return canvas;
}
