// Draws a shareable "materials to farm" card for one character: everything
// needed to ascend them to Lv 80 and max their skills, grouped by where each
// material is farmed. Same look as the build card (charcoal panels, silver frame).
import { loadArcArt } from './arcPlayer.js';
import { portraitPath } from './portraits.js';
import { ELEMENT_BY_ID } from '../data/elements.js';
import { farmList } from '../data/farmList.js';
import { bestBuild } from '../data/bestBuild.js';
import { CARTRIDGE_BY_ID } from '../data/gear.js';
import { SET_SHAPES, SHAPES } from '../data/console.js';
import { materialIconUrl } from './icons.js';
import { ARC_DYES, ARC_MATERIAL_SOURCE, ARC_MAX_LEVEL, arcAscensionCost } from '../data/arcMaterials.js';
import { ARC_BY_ID, ARC_SOURCES, RECOMMENDED } from '../data/arcs.js';
import { CHARACTER_BY_ID } from '../data/characters.js';
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
  loadRoleIcons,
  drawRoles,
  rolesWidth,
  drawMascot,
} from './teamCard.js';
import { drawLinksLine } from './cardLinks.js';
import { drawTagPills, loadTagMarks } from './cardTags.js';
import { fmt } from './format.js';

export const FARM_W = 1600;
export const FARM_H = 920;
// Instagram portrait post (4:5), offered for both farming cards.
export const IG_W = 1080;
export const IG_H = 1350;

const K = {
  bg: '#121318',
  panel: 'rgba(29, 30, 36, 0.94)',
  inset: '#26272e',
  line: '#34353e',
  fg: '#eceef3',
  muted: '#cdd1dc',
  pink: '#e8488c',
};

// Fan-project line and site links. Wide: one row; Instagram: two rows.
function footer(ctx, W, H, PAD, ig, bottomGap = 30) {
  ctx.font = `600 13px ${BODY}`;
  ctx.fillStyle = K.muted;
  ctx.fillText(
    'Unofficial fan project · Neverness to Everness © Hotta Studio / Perfect World Games · Amounts may change with updates',
    PAD,
    H - bottomGap,
  );
  drawLinksLine(ctx, ig ? PAD : W - PAD, ig ? H - bottomGap - 26 : H - bottomGap, {
    font: `600 13px ${BODY}`,
    color: K.muted,
    accent: K.fg,
    align: ig ? 'left' : 'right',
  });
}

// Tile accent per material kind (tiers read low → high like the game's rarity colours).
const KIND = {
  tier1: '#6fbf73',
  tier2: '#4f9ee8',
  tier3: '#a46be8',
  boss: '#f2c14e',
  weekly: '#f28b4e',
  coins: '#c9a46a',
  life: '#e8488c',
};

const short = (n) => (n >= 1e6 ? `${+(n / 1e6).toFixed(2)}M` : n >= 1e4 ? `${+(n / 1e3).toFixed(1)}K` : fmt(n));

function panel(ctx, x, y, w, h, title, where) {
  ctx.fillStyle = K.panel;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = K.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = K.fg;
  ctx.font = `700 18px ${BODY}`;
  ctx.fillText(title, x + 18, y + 32);
  const tw = ctx.measureText(title).width;
  ctx.fillStyle = K.muted;
  ctx.font = `600 14px ${BODY}`;
  // Beside the title when it fits, otherwise on its own line underneath.
  if (ctx.measureText(where).width <= w - tw - 48) {
    ctx.fillText(where, x + 18 + tw + 12, y + 32);
    return 0;
  }
  const [line] = wrap(ctx, where, w - 36, 1);
  ctx.fillText(line ?? '', x + 18, y + 52);
  return 12;
}

// The item name under its icon: bold, bright and with a dark halo so it reads
// over the patterned panels.
function itemName(ctx, name, x, y, size) {
  ctx.save();
  ctx.font = `700 15px ${BODY}`;
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(8,8,12,0.75)';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#ffffff';
  wrap(ctx, name, size + 12, 2).forEach((l, i) => {
    ctx.strokeText(l, x + size / 2, y + size + 22 + i * 18);
    ctx.fillText(l, x + size / 2, y + size + 22 + i * 18);
  });
  ctx.restore();
}

// One material: its icon (no frame) with the amount on it, name underneath.
function tile(ctx, x, y, size, item, img) {
  if (img) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 3;
    const s = size * 0.96;
    ctx.drawImage(img, x + (size - s) / 2, y + (size - s) / 2 - 4, s, s);
    ctx.restore();
  }
  // Amount badge
  if (item.badge === false) {
    itemName(ctx, item.name, x, y, size);
    return;
  }
  const label = item.label ?? (item.qty == null ? 'as needed' : (item.approx ? `≈${short(item.qty)}` : `×${short(item.qty)}`));
  ctx.font = `800 ${item.qty == null ? 13 : 18}px ${MONO}`;
  const bw = ctx.measureText(label).width + 16;
  const bh = item.qty == null ? 22 : 26;
  const bx = x + size - bw - 2;
  const by = y + size - bh - 4;
  ctx.fillStyle = 'rgba(10,10,14,0.94)';
  roundRect(ctx, bx, by, bw, bh, bh / 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = item.qty == null ? '#c9cbd6' : '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, bx + 8, by + bh / 2 + 1);
  ctx.textBaseline = 'alphabetic';
  // Name
  itemName(ctx, item.name, x, y, size);
  ctx.textAlign = 'left';
}

function group(ctx, x, y, w, h, g, imgs, maxSize = 150) {
  const shift = panel(ctx, x, y, w, h, g.title, g.where);
  const n = g.items.length;
  // As large as the panel allows: under the title, above a two-line name.
  const size = Math.floor(Math.min(maxSize, h - 46 - shift - 12 - 44, (w - 36 - (n - 1) * 16) / n));
  const gap = Math.min(44, (w - 36 - n * size) / Math.max(1, n - 1));
  const startX = x + (w - (n * size + (n - 1) * gap)) / 2;
  // Tile plus a two-line name, centred in the space under the title.
  const top = y + 46 + shift;
  const startY = top + Math.max(6, (y + h - 12 - top - (size + 44)) / 2);
  g.items.forEach((item, i) => tile(ctx, startX + i * (size + gap), startY, size, item, imgs.get(item.name)));
}

const ROMAN = { 2: 'II', 3: 'III', 4: 'IV' };

// The recommended Cartridge set and the modules to farm for it.
function consolePanel(ctx, x, y, w, h, build, cartImg) {
  const cart = CARTRIDGE_BY_ID[build.cartridge];
  panel(ctx, x, y, w, h, 'Console gear', 'Rabbit Hole');
  const top = y + 50;
  const bottom = y + h - 16;

  // Left: the Cartridge set, as large as the column allows, name and main stat under it.
  const colW = Math.round(Math.min(170, w * 0.3));
  const main = build.cartStats?.main?.stat;
  const size = Math.floor(Math.min(colW - 8, bottom - top - 44 - (main ? 22 : 0)));
  const cx = x + 18 + (colW - size) / 2;
  const cy = top + Math.max(0, (bottom - top - size - 44 - (main ? 22 : 0)) / 2);
  tile(ctx, cx, cy, size, { name: cart.name, qty: null, kind: 'boss', badge: false }, cartImg);
  if (main) {
    ctx.font = `700 15px ${BODY}`;
    const nameLines = wrap(ctx, cart.name, size + 12, 2).length;
    ctx.fillStyle = K.muted;
    ctx.font = `600 13px ${BODY}`;
    ctx.textAlign = 'center';
    ctx.fillText('MAIN STAT', cx + size / 2, cy + size + 22 + nameLines * 18 + 2);
    ctx.fillStyle = '#ffd27a';
    ctx.font = `700 15px ${BODY}`;
    ctx.fillText(main, cx + size / 2, cy + size + 22 + nameLines * 18 + 20);
    ctx.textAlign = 'left';
  }

  // Right: one chip per module shape with its count, then the sub stats.
  const counts = new Map();
  for (const p of build.pieces) counts.set(p.shape, (counts.get(p.shape) ?? 0) + 1);
  const setShapes = new Set(SET_SHAPES[build.cartridge] ?? []);
  const mx = x + 18 + colW + 22;
  const mw = x + w - 20 - mx;
  let my = top + 4;
  ctx.fillStyle = K.fg;
  ctx.font = `700 17px ${BODY}`;
  const head = `${build.pieces.length} modules`;
  ctx.fillText(head, mx, my + 12);
  // Legend: gold outline = shapes that count toward the set bonus.
  ctx.font = `600 13px ${BODY}`;
  const legend = 'count toward the set';
  const lw = ctx.measureText(legend).width;
  const lx = mx + mw - lw;
  ctx.strokeStyle = '#f2c14e';
  ctx.lineWidth = 2;
  roundRect(ctx, lx - 22, my + 1, 14, 14, 4);
  ctx.stroke();
  ctx.fillStyle = K.muted;
  ctx.fillText(legend, lx, my + 12);
  my += 26;

  const n = counts.size;
  const gapC = 10;
  // One row when the chips can stay readable (at least 56px), otherwise wrap.
  let perRow = Math.min(n, Math.max(1, Math.floor((mw + gapC) / (56 + gapC))));
  // A tall panel (Instagram) has room for two rows of bigger chips.
  const oneRowW = (mw - (perRow - 1) * gapC) / perRow;
  if (oneRowW < 72 && bottom - my >= 200) perRow = Math.ceil(n / 2);
  const chipW = Math.min(perRow < n ? 68 : 96, Math.floor((mw - (perRow - 1) * gapC) / perRow));
  const chipH = Math.round(chipW * 0.92);
  [...counts].forEach(([shape, cnt], i) => {
    const sx = mx + (i % perRow) * (chipW + gapC);
    const sy = my + Math.floor(i / perRow) * (chipH + 8);
    const inSet = setShapes.has(shape);
    ctx.fillStyle = K.inset;
    roundRect(ctx, sx, sy, chipW, chipH, 12);
    ctx.fill();
    ctx.strokeStyle = inSet ? '#f2c14e' : K.line;
    ctx.lineWidth = inSet ? 2.5 : 1.5;
    ctx.stroke();
    const cells = SHAPES[shape].cells;
    const rows = Math.max(...cells.map((c) => c[0])) + 1;
    const cols = Math.max(...cells.map((c) => c[1])) + 1;
    const box = chipW * 0.42;
    const cs = Math.min(chipW * 0.16, (box - (Math.max(rows, cols) - 1) * 2) / Math.max(rows, cols));
    const gw = cols * cs + (cols - 1) * 2;
    const gh = rows * cs + (rows - 1) * 2;
    const area = chipH - 22;
    goldCells(ctx, sx + 10 + (box - gw) / 2, sy + 6 + (area - gh) / 2, cells, cs, 2);
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${Math.round(chipW * 0.22)}px ${MONO}`;
    ctx.textBaseline = 'middle';
    ctx.fillText(`×${cnt}`, sx + 14 + box, sy + 6 + area / 2);
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#c9cbd6';
    ctx.font = `700 11px ${MONO}`;
    ctx.textAlign = 'center';
    ctx.fillText(`TYPE ${ROMAN[SHAPES[shape].type]}`, sx + chipW / 2, sy + chipH - 9);
    ctx.textAlign = 'left';
  });
  my += Math.ceil(n / perRow) * (chipH + 8) + 10;

  // Sub stats to look for, as pills
  const subs = [...new Set((build.pieces[0]?.stats?.subs ?? []).map((sub) => sub.stat))];
  if (subs.length && my + 40 <= bottom + 8) {
    ctx.fillStyle = K.muted;
    ctx.font = `600 13px ${BODY}`;
    ctx.fillText('Module sub stats to look for', mx, my + 4);
    my += 14;
    // One row of pills when a slightly smaller font makes them fit.
    let f = 13;
    const rowW = () => subs.reduce((t, st) => t + ctx.measureText(st).width + 18 + 7, -7);
    for (ctx.font = `700 ${f}px ${BODY}`; f > 11 && rowW() > mw; ) ctx.font = `700 ${--f}px ${BODY}`;
    let px = mx;
    for (const st of subs) {
      const pw = ctx.measureText(st).width + 18;
      if (px > mx && px + pw > mx + mw) {
        px = mx;
        my += 30;
      }
      if (my + 24 > bottom + 8) break;
      ctx.fillStyle = K.inset;
      roundRect(ctx, px, my, pw, 24, 12);
      ctx.fill();
      ctx.strokeStyle = K.line;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = K.fg;
      ctx.textBaseline = 'middle';
      ctx.fillText(st, px + 9, my + 13);
      ctx.textBaseline = 'alphabetic';
      px += pw + 7;
    }
  }
}

/** Renders the farm card and returns the canvas (null without material data). */
export async function renderFarmCard(character, { base = '/', scale = 2, format = 'wide' } = {}) {
  const ig = format === 'ig';
  const W = ig ? IG_W : FARM_W;
  const H = ig ? IG_H : FARM_H;
  const list = farmList(character.id);
  if (!list) return null;
  await ensureFonts(base);
  const c = character;
  const el = ELEMENT_BY_ID[c.element];
  const elColor = EL[c.element] ?? K.pink;

  const names = [...new Set(list.groups.flatMap((g) => g.items.map((i) => i.name)))];
  const [portrait, elIcon, ...icons] = await Promise.all([
    loadImage(`${base}characters/hd/${portraitPath(c.id)}`),
    loadImage(`${base}icons/elements/${c.element}.webp`),
    ...names.map((n) => (materialIconUrl(n) ? loadImage(materialIconUrl(n)) : null)),
  ]);
  const imgs = new Map(names.map((n, i) => [n, icons[i]]));
  const build = bestBuild(c);
  const cartImg = build?.cartridge ? await loadImage(`${base}icons/cartridges/${build.cartridge}.webp`) : null;

  const roleIcons = await loadRoleIcons(base, c.roles);
  const tagMarks = await loadTagMarks(base, c.tags);
  // The best Arc (signature, else top recommended): Lv 20 → 80 ascension.
  const bestArc = build?.arc && ARC_BY_ID[build.arc];
  const arcCost = bestArc && arcAscensionCost(bestArc);
  const arcGroup = arcCost && {
    id: 'arc',
    title: `Arc · ${bestArc.name}`,
    where: `Lv 20 → ${ARC_MAX_LEVEL} · ${ARC_MATERIAL_SOURCE} and anomalies`,
    items: arcCost.filter((m) => m.kind !== 'coins'),
  };
  if (arcCost) {
    // Items the character already needs are added to that panel instead of
    // being listed twice (an Arc's anomaly drops, its Beetle Coin).
    for (const g of list.groups) {
      g.items = g.items.map((m) => {
        const extra = arcCost.find((x) => x.name === m.name);
        return extra ? { ...m, qty: m.qty + extra.qty } : m;
      });
    }
    const shared = new Set(list.groups.flatMap((g) => g.items.map((m) => m.name)));
    const merged = arcGroup.items.filter((m) => shared.has(m.name));
    arcGroup.items = arcGroup.items.filter((m) => !shared.has(m.name));
    if (merged.length) arcGroup.where = `Lv 20 → ${ARC_MAX_LEVEL} · ${ARC_MATERIAL_SOURCE} · anomaly drops added above`;
  }
  if (arcGroup) {
    const missing = arcGroup.items.map((m) => m.name).filter((n) => !imgs.has(n));
    const more = await Promise.all(missing.map((n) => (materialIconUrl(n) ? loadImage(materialIconUrl(n)) : null)));
    missing.forEach((n, k) => imgs.set(n, more[k]));
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.imageSmoothingQuality = 'high';
  clipCard(ctx, W, H);
  drawBandBackdrop(ctx, W, H, evenBands(H));

  const PAD = 32;

  // ---- Portrait and identity: left column (wide) or across the top (Instagram) ----
  const LW = ig ? 260 : 340;
  const tx0 = ig ? PAD + LW + 28 : PAD;
  const TW = ig ? W - PAD - tx0 : LW;
  const px = PAD;
  const py = PAD;
  await drawPortraitBackdrop(ctx, { x: px, y: py, w: LW, h: LW, r: 22, arcType: c.arcType, base });
  if (portrait) {
    ctx.save();
    roundRect(ctx, px, py, LW, LW, 22);
    ctx.clip();
    setPortraitShadow(ctx, LW);
    ctx.drawImage(portrait, px, py, LW, LW);
    ctx.restore();
  }
  ctx.strokeStyle = elColor;
  ctx.lineWidth = 3;
  roundRect(ctx, px, py, LW, LW, 22);
  ctx.stroke();

  let ly = ig ? py + 56 : py + LW + 58;
  let nameSize = 54;
  ctx.fillStyle = K.fg;
  ctx.font = `italic 800 ${nameSize}px ${DISPLAY}`;
  while (nameSize > 30 && ctx.measureText(c.name.toUpperCase()).width > TW) {
    nameSize -= 2;
    ctx.font = `italic 800 ${nameSize}px ${DISPLAY}`;
  }
  ctx.fillText(c.name.toUpperCase(), tx0, ly);

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

  // What the totals cover, in two columns.
  const lines = [
    'Level 20 → 80',
    '4 skills → Lv 10',
    'Both passives',
    'Life skill → Lv 5',
    // (Instagram: the Arc row's own title says it.)
    ...(arcGroup && !ig ? [`Best Arc → Lv ${ARC_MAX_LEVEL}`] : []),
  ];
  const boxH = 50 + Math.ceil(lines.length / 2) * 26;
  ly += 44;
  if (ig) ly = py + LW - boxH + 26;
  ctx.fillStyle = K.panel;
  const totalsBottom = ly - 26 + boxH;
  roundRect(ctx, tx0, ly - 26, TW, boxH, 14);
  ctx.fill();
  ctx.strokeStyle = K.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = K.pink;
  ctx.font = `700 13px ${MONO}`;
  ctx.fillText('TOTALS COVER', tx0 + 18, ly);
  ctx.fillStyle = K.fg;
  ctx.font = `600 16px ${BODY}`;
  lines.forEach((t, i) => {
    const lx = tx0 + 18 + (i % 2) * ((TW - 18) / 2);
    const lyy = ly + 26 + Math.floor(i / 2) * 26;
    ctx.fillStyle = K.pink;
    ctx.fillRect(lx, lyy - 6, 6, 6);
    ctx.fillStyle = K.fg;
    ctx.fillText(t, lx + 16, lyy);
  });

  // ---- Header strip ---- (wide: top right; Instagram: full width under the portrait)
  const RX = ig ? PAD : PAD + LW + 28;
  const RW = W - RX - PAD;
  const HY = ig ? PAD + LW + 20 : PAD;
  ctx.fillStyle = K.panel;
  roundRect(ctx, RX, HY, RW, 84, 16);
  ctx.fill();
  ctx.strokeStyle = K.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = K.fg;
  ctx.font = `italic 800 40px ${DISPLAY}`;
  ctx.fillText('MATERIALS TO FARM', RX + 24, HY + 55);
  const hw = ctx.measureText('MATERIALS TO FARM').width;
  ctx.fillStyle = K.muted;
  ctx.font = `600 17px ${BODY}`;
  ctx.fillText('Ascend to Lv 80 and max every skill', RX + 24 + hw + 20, HY + 53);
  drawMascot(ctx, await loadImage(`${base}mascot.svg`), RX + RW - 102, HY - 8, 96);

  // ---- Groups ----
  const by = Object.fromEntries(list.groups.map((g) => [g.id, g]));
  const GAP = 20;
  const TOP = HY + 84 + GAP;
  const ROW = ig ? (arcGroup ? 192 : 250) : 214;
  // Row 1: boss + weekly + EXP
  const w1 = ig ? 300 : 316;
  let x = RX;
  for (const id of ['boss', 'weekly']) {
    if (!by[id]) continue;
    group(ctx, x, TOP, w1, ROW, by[id], imgs);
    x += w1 + GAP;
  }
  group(ctx, x, TOP, RX + RW - x, ROW, by.exp, imgs);
  // Row 2: anomaly family + skill books
  const half = (RW - GAP) / 2;
  group(ctx, RX, TOP + ROW + GAP, half, ROW, by.family, imgs);
  group(ctx, RX + half + GAP, TOP + ROW + GAP, half, ROW, by.books, imgs);
  // Row 3: console gear beside the best Arc (wide: currency moves under the
  // totals in the left column); Instagram: currency + console, then the Arc.
  const r3 = TOP + 2 * (ROW + GAP);
  const ARC_ROW = arcGroup ? (ig ? 184 : ROW) : 0;
  const ROW3 = ig ? H - 96 - r3 - (arcGroup ? ARC_ROW + GAP : 0) : 250;
  if (!ig && arcGroup) {
    const my = totalsBottom + GAP;
    group(ctx, PAD, my, LW, H - 64 - my, { ...by.money, where: 'Coin: EXP zone · Seeds: Mall' }, imgs);
    if (build?.cartridge) {
      consolePanel(ctx, RX, r3, half, ROW3, build, cartImg);
      group(ctx, RX + half + GAP, r3, half, ROW3, arcGroup, imgs);
    } else {
      group(ctx, RX, r3, RW, ROW3, arcGroup, imgs);
    }
  } else {
    if (build?.cartridge) {
      group(ctx, RX, r3, half, ROW3, by.money, imgs);
      consolePanel(ctx, RX + half + GAP, r3, half, ROW3, build, cartImg);
    } else {
      group(ctx, RX, r3, RW, ROW3, by.money, imgs);
    }
    if (arcGroup) group(ctx, RX, r3 + ROW3 + GAP, RW, ARC_ROW, arcGroup, imgs);
  }

  // ---- Footer ----
  footer(ctx, W, H, PAD, ig);

  drawSilverFrame(ctx, W, H);
  return canvas;
}

// ---------- Arc farming card ----------
const ARC_COLORS = { Solid: '#8a7cf0', Liquid: '#18b3d8', Gas: '#8fa6d6', Plasma: '#3d63f0', Condensate: '#e0405e' };
export const ARC_FARM_H = 740;

function circleImage(ctx, img, x, y, d, ring) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + d / 2, y + d / 2, d / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = '#1b1c22';
  ctx.fill();
  ctx.clip();
  if (img) ctx.drawImage(img, x, y, d, d);
  ctx.restore();
  ctx.strokeStyle = ring;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x + d / 2, y + d / 2, d / 2, 0, Math.PI * 2);
  ctx.stroke();
}

/** Renders the farming card for one Arc (Lv 20 → 80), or null without data. */
export async function renderArcFarmCard(arc, { base = '/', scale = 2, format = 'wide' } = {}) {
  const ig = format === 'ig';
  const W = ig ? IG_W : FARM_W;
  const H = ig ? IG_H : ARC_FARM_H;
  const cost = arcAscensionCost(arc);
  if (!cost) return null;
  await ensureFonts(base);
  const color = ARC_COLORS[arc.type] ?? K.pink;

  const arcMats = cost.filter((m) => m.source === ARC_MATERIAL_SOURCE);
  const anomaly = cost.filter((m) => m.kind.startsWith('tier') && m.source !== ARC_MATERIAL_SOURCE);
  const coins = cost.find((m) => m.kind === 'coins');
  const groups = {
    arc: { title: 'Bubble Can Factory', where: 'Anomaly Zone · Character Pixels', items: arcMats },
    anomaly: { title: 'Open-world anomalies', where: 'Drops from anomalies', items: anomaly },
    exp: {
      title: 'Arc EXP',
      where: 'Houdinii’s Magic Stage',
      items: ARC_DYES.map((d, i) => ({ name: d.name, qty: null, kind: `tier${i + 1}` })),
    },
    money: { title: 'Currency', where: 'EXP & Beetle Coins zone', items: [coins] },
  };

  const sig = arc.signature && CHARACTER_BY_ID[arc.signature];
  const recs = Object.entries(RECOMMENDED)
    .filter(([cid, ids]) => ids.includes(arc.id) && cid !== arc.signature)
    .map(([cid]) => CHARACTER_BY_ID[cid])
    .filter(Boolean);
  const users = [...(sig ? [sig] : []), ...recs].slice(0, 5);

  const names = [...new Set(Object.values(groups).flatMap((g) => g.items.map((i) => i.name)))];
  const [art, typeIcon, ...rest] = await Promise.all([
    loadArcArt(base, arc.id, 512),
    loadImage(`${base}icons/arc-types/${arc.type.toLowerCase()}.webp`),
    ...names.map((n) => (materialIconUrl(n) ? loadImage(materialIconUrl(n)) : null)),
    ...users.map((c) => loadImage(`${base}characters/${portraitPath(c.id)}`)),
  ]);
  const imgs = new Map(names.map((n, i) => [n, rest[i]]));
  const userImgs = rest.slice(names.length);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.imageSmoothingQuality = 'high';
  clipCard(ctx, W, H);
  ctx.fillStyle = K.bg;
  ctx.fillRect(0, 0, W, H);
  drawBandBackdrop(ctx, W, H, evenBands(H));

  const PAD = 32;
  const LW = ig ? 300 : 340;
  const AH = 300;
  // Name, users and sources: under the art (wide) or beside it (Instagram).
  const tx0 = ig ? PAD + LW + 28 : PAD;
  const TW = ig ? W - PAD - 96 - tx0 : LW;
  // ---- Left: Arc art ----
  const glow = ctx.createRadialGradient(PAD + LW / 2, PAD + AH / 2, 10, PAD + LW / 2, PAD + AH / 2, LW * 0.7);
  glow.addColorStop(0, `${color}66`);
  glow.addColorStop(1, 'rgba(18,19,24,0)');
  ctx.fillStyle = '#1b1c22';
  roundRect(ctx, PAD, PAD, LW, AH, 22);
  ctx.fill();
  ctx.fillStyle = glow;
  roundRect(ctx, PAD, PAD, LW, AH, 22);
  ctx.fill();
  if (art) {
    const s = AH - 30;
    ctx.drawImage(art, PAD + (LW - s) / 2, PAD + 15, s, s);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  roundRect(ctx, PAD, PAD, LW, AH, 22);
  ctx.stroke();

  let ly = ig ? PAD + 50 : PAD + AH + 52;
  let size = 44;
  ctx.fillStyle = K.fg;
  const title = arc.name.toUpperCase();
  ctx.font = `italic 800 ${size}px ${DISPLAY}`;
  const nameLines = (() => {
    while (size > 30 && ctx.measureText(title).width > TW) {
      size -= 2;
      ctx.font = `italic 800 ${size}px ${DISPLAY}`;
    }
    return ctx.measureText(title).width > TW ? wrap(ctx, title, TW, 2) : [title];
  })();
  nameLines.forEach((l, i) => ctx.fillText(l, tx0, ly + i * (size + 2)));
  ly += (nameLines.length - 1) * (size + 2) + 38;

  drawRank(ctx, arc.rarity, tx0, ly - 8, 34);
  if (typeIcon) ctx.drawImage(typeIcon, tx0 + 44, ly - 24, 30, 30);
  ctx.fillStyle = color;
  ctx.font = `700 19px ${BODY}`;
  ctx.fillText(`${arc.type} Arc`, tx0 + 82, ly);
  const typeW = ctx.measureText(`${arc.type} Arc`).width;
  ctx.fillStyle = K.muted;
  ctx.font = `600 17px ${BODY}`;
  ctx.fillText(`·  ${arc.sub}`, tx0 + 82 + typeW + 10, ly);

  // Who it's for
  if (users.length) {
    ly += 30;
    ctx.fillStyle = K.pink;
    ctx.font = `700 13px ${MONO}`;
    ctx.fillText(
      sig && recs.length ? 'SIGNATURE · RECOMMENDED FOR' : sig ? 'SIGNATURE ARC OF' : 'RECOMMENDED FOR',
      tx0,
      ly,
    );
    users.forEach((_, i) => {
      const d = 52;
      const x = tx0 + i * (d + 12);
      circleImage(ctx, userImgs[i], x, ly + 12, d, i === 0 && sig ? '#f2c14e' : K.line);
    });
    ctx.fillStyle = K.fg;
    ctx.font = `600 15px ${BODY}`;
    const label = users.map((c) => c.name).join(', ');
    wrap(ctx, label, TW, 1).forEach((l) => ctx.fillText(l, tx0, ly + 90));
    ly += 90;
  }

  // How to get the Arc itself: the rest of the left column (wide), or a
  // full-width panel at the foot of the card (Instagram, placed below).
  const sources = ARC_SOURCES[arc.id] ?? [];
  // Instagram: the panel is as tall as its lines need (up to 230), and the
  // material rows above take the rest.
  ctx.font = `600 15px ${BODY}`;
  const srcLines = sources.reduce((n, src) => n + wrap(ctx, src, W - 2 * PAD - 52, 3).length, 0);
  const SRC_H = ig ? Math.min(230, 70 + srcLines * 20 + sources.length * 6) : 0;
  const SRC_TOP = ig ? H - 96 - SRC_H : 0;
  if (ig && sources.length) {
    ctx.fillStyle = K.panel;
    roundRect(ctx, PAD, SRC_TOP, W - 2 * PAD, SRC_H, 14);
    ctx.fill();
    ctx.strokeStyle = K.line;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ly = SRC_TOP + 34 - 40;
  }
  const SX = ig ? PAD + 18 : PAD;
  const SW = ig ? W - 2 * PAD - 36 : LW;
  if (sources.length) {
    ly += 40;
    ctx.fillStyle = K.pink;
    ctx.font = `700 13px ${MONO}`;
    ctx.fillText('HOW TO GET', SX, ly);
    ctx.font = `600 15px ${BODY}`;
    const LINE = 20;
    const bottom = ig ? SRC_TOP + SRC_H - 20 : ARC_FARM_H - 56;
    let y = ly + 24;
    let shown = 0;
    for (const src of sources) {
      const lines = wrap(ctx, src, SW - 16, 3);
      if (y + (lines.length - 1) * LINE > bottom) break;
      ctx.fillStyle = color;
      ctx.fillRect(SX + 1, y - 9, 6, 6);
      ctx.fillStyle = K.fg;
      lines.forEach((l, i) => ctx.fillText(l, SX + 16, y + i * LINE));
      y += lines.length * LINE + 6;
      shown += 1;
    }
    if (shown < sources.length && y <= bottom + LINE) {
      ctx.fillStyle = K.muted;
      ctx.fillText(`+${sources.length - shown} more on the site`, SX + 16, Math.min(y, bottom + LINE));
    }
  }

  // ---- Header strip ---- (wide: top right; Instagram: full width under the art)
  const RX = ig ? PAD : PAD + LW + 28;
  const RW = W - RX - PAD;
  const HY = ig ? PAD + AH + 20 : PAD;
  ctx.fillStyle = K.panel;
  roundRect(ctx, RX, HY, RW, 84, 16);
  ctx.fill();
  ctx.strokeStyle = K.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = K.fg;
  ctx.font = `italic 800 ${ig ? 36 : 40}px ${DISPLAY}`;
  ctx.fillText('ARC MATERIALS TO FARM', RX + 24, HY + 55);
  const hw = ctx.measureText('ARC MATERIALS TO FARM').width;
  ctx.fillStyle = K.muted;
  ctx.font = `600 17px ${BODY}`;
  ctx.fillText(ig ? 'Lv 20 → 80 · 6 ascensions' : 'Level cap 20 → 80 · all 6 ascensions', RX + 24 + hw + 20, HY + 53);
  drawMascot(ctx, await loadImage(`${base}mascot.svg`), ig ? W - PAD - 96 + 6 : RX + RW - 102, ig ? PAD - 8 : HY - 8, 96);

  // ---- Groups ----
  const GAP = 20;
  const TOP = HY + 84 + GAP;
  const ROW = ig ? Math.floor((H - 96 - SRC_H - GAP - TOP - (sources.length ? GAP : 0)) / 2) : 252;
  const half = (RW - GAP) / 2;
  group(ctx, RX, TOP, half, ROW, groups.arc, imgs);
  group(ctx, RX + half + GAP, TOP, half, ROW, groups.anomaly, imgs);
  const r2 = TOP + ROW + GAP;
  const wide = Math.round(RW * 0.62);
  group(ctx, RX, r2, wide, ROW, groups.exp, imgs);
  group(ctx, RX + wide + GAP, r2, RW - wide - GAP, ROW, groups.money, imgs);

  footer(ctx, W, H, PAD, ig, 28);

  drawSilverFrame(ctx, W, H);
  return canvas;
}
