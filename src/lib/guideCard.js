// Build guide card: a tall (4:5) one-page guide for a character, exported from
// the profile header. Four panels: Cartridges (best + alternative, with set
// bonuses), Stats & Console (stat priority, module bonus, awakening order),
// Arcs (best, then premium / battle pass / free picks) and Teams.
import { ELEMENT_BY_ID } from '../data/elements.js';
import { CHARACTER_BY_ID } from '../data/characters.js';
import { ARCS, ARC_BY_ID, RECOMMENDED, arcAccess } from '../data/arcs.js';
import { CARTRIDGE_BY_ID, cartridgesFor } from '../data/gear.js';
import { CHARACTER_CONSOLE, SHAPES } from '../data/console.js';
import { AWAKENING_ORDER } from '../data/awakeningOrder.js';
import { ENDGAME, parsePriority } from '../data/endgame.js';
import { BUILD_PROFILES } from '../data/buildProfiles.js';
import { bestBuild } from '../data/bestBuild.js';
import { analyzeTeam } from './analyze.js';
import { alternativesFor, cartTile, drawOrb } from './buildCard.js';
import { teamsFor } from './characterCard.js';
import { fillStatText } from './statText.js';
import { drawLinksLine, measureLinksLine } from './cardLinks.js';
import {
  BODY, DISPLAY, EL, MONO, clipCard, drawBandBackdrop, drawRank, drawSilverFrame, ensureFonts, goldCells, loadImage, roundRect, wrap, fitLine,
  loadRoleIcons, drawRoles
} from './teamCard.js';

export const GUIDE_CARD_W = 1080;
export const GUIDE_CARD_H = 1350;

const K = {
  panel: 'rgba(29, 30, 36, 0.94)',
  inset: '#26272e',
  line: '#34353e',
  fg: '#eceef3',
  muted: '#bfc3cf',
  label: '#cfd2dc',
  pink: '#e8488c',
  gold: '#f2c14e',
  num: '#ffc061',
  key: '#b9c3ff',
};
const BANDS = [{ y: -40, h: 230, a: 1 }, { y: 760, h: 120, a: 0.55 }, { y: 1120, h: 170, a: 0.8 }];
const HL = { color: K.label, keyColor: K.key, numColor: K.num };

// ---------- data ----------

const PRETTY = { 'DMG%': 'Universal DMG', 'Healing%': 'Healing Bonus' };
const prettyStat = (s) => PRETTY[s] ?? (/ DMG%$/.test(s) ? s.slice(0, -1) : s);
const SEP = '  ›  ';
/** Priority groups as lines that only break between stats. */
function priorityLines(ctx, groups, w, lines) {
  const parts = groups.map((g) => g.map(prettyStat).join(' = '));
  const out = [];
  let cur = '';
  for (const part of parts) {
    const next = cur ? `${cur}${SEP}${part}` : part;
    if (cur && ctx.measureText(next).width > w) {
      out.push(cur);
      cur = part;
    } else cur = next;
  }
  if (cur) out.push(cur);
  return out.slice(0, lines);
}
function drawPriority(ctx, groups, x, y, w, lines, lh, size) {
  const font = `500 ${size}px ${BODY}`;
  ctx.font = font;
  const out = priorityLines(ctx, groups, w, lines);
  out.forEach((ln, i) => fillStatText(ctx, ln, x, y + i * lh, { font, maxWidth: w, ...HL }));
  return out.length;
}

/** Main and sub stat priority: the guides' order, or this site's own pick when it overrides them. */
export function statPriority(character, best) {
  const guide = ENDGAME[character.id];
  const own = !guide || BUILD_PROFILES[character.id]?.override;
  const cs = best?.cartStats;
  const main = own ? (cs ? [[cs.main.stat]] : []) : parsePriority(guide.main);
  const subs = own ? (cs ? cs.subs.map((s) => [s.stat]) : []) : parsePriority(guide.subs);
  return { main: main.slice(0, 4), subs: subs.slice(0, 5) };
}

// When the guides list only one Cartridge set: the general-purpose set for the main role.
const GENERIC_ALT = {
  Damage: ['shadow-creed'],
  Buff: ['speedy-hedgehog', 'shadow-creed'],
  Survival: ['tiny-big-adventure', 'theas-night-tavern'],
};

const ACCESS_LABEL = { free: 'F2P', pass: 'BATTLE PASS', banner: 'STANDARD', paid: 'PAID PACK', limited: 'LIMITED' };

/**
 * The best Arc, then up to three more from the guide list, each tagged by how it's
 * obtained. Always ends with at least one Arc anyone can get.
 */
export function arcPicks(character, best) {
  const sig = ARCS.find((a) => a.signature === character.id);
  const first = best?.arc ? ARC_BY_ID[best.arc] : sig ?? ARC_BY_ID[(RECOMMENDED[character.id] ?? [])[0]];
  if (!first) return { best: null, more: [] };
  const listed = [...new Set([sig?.id, ...(RECOMMENDED[character.id] ?? [])])]
    .filter((id) => id && id !== first.id)
    .map((id) => ARC_BY_ID[id])
    .filter(Boolean);
  let more = listed.slice(0, 3);
  const easy = (a) => ['free', 'pass'].includes(arcAccess(a.id));
  if (!more.some(easy)) {
    const alt = alternativesFor(character, first.id).arc;
    if (alt && !more.some((a) => a.id === alt.id)) more = [...more.slice(0, 2), alt];
  }
  return {
    best: first,
    bestTag: first.signature === character.id ? 'SIGNATURE' : 'BEST',
    more: more.map((a) => ({ arc: a, tag: ACCESS_LABEL[arcAccess(a.id)] ?? `${a.rarity}-RANK` })),
  };
}

// ---------- drawing helpers ----------

function panel(ctx, x, y, w, h, title, accent = K.pink) {
  ctx.fillStyle = K.panel;
  roundRect(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = K.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Title tab
  ctx.font = `italic 900 30px ${DISPLAY}`;
  ctx.fillStyle = K.fg;
  ctx.fillText(title, x + 22, y + 44);
  const tw = ctx.measureText(title).width;
  ctx.fillStyle = accent;
  roundRect(ctx, x + 22, y + 54, Math.min(tw, 80), 4, 2);
  ctx.fill();
}

function label(ctx, text, x, y, color = K.muted) {
  ctx.font = `700 13px ${MONO}`;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  return ctx.measureText(text).width;
}

function tag(ctx, text, x, y, { bg, fg }) {
  ctx.font = `700 12px ${MONO}`;
  const w = ctx.measureText(text).width + 14;
  ctx.fillStyle = bg;
  roundRect(ctx, x, y - 15, w, 21, 10.5);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.fillText(text, x + 7, y);
  return w;
}

const TAG_STYLE = {
  SIGNATURE: { bg: 'rgba(242, 193, 78, 0.18)', fg: K.gold },
  BEST: { bg: 'rgba(242, 193, 78, 0.18)', fg: K.gold },
  LIMITED: { bg: 'rgba(232, 72, 140, 0.18)', fg: '#ff8fbe' },
  'PAID PACK': { bg: 'rgba(232, 72, 140, 0.18)', fg: '#ff8fbe' },
  'BATTLE PASS': { bg: 'rgba(142, 156, 255, 0.18)', fg: K.key },
  F2P: { bg: 'rgba(110, 200, 140, 0.18)', fg: '#8fe0a8' },
  STANDARD: { bg: 'rgba(255, 255, 255, 0.08)', fg: K.label },
};

/** Game text wrapped over up to `lines` lines, stat names and values highlighted. Returns lines used. */
function statLines(ctx, text, x, y, w, lines, lh, size = 17) {
  const font = `500 ${size}px ${BODY}`;
  const numFont = `700 ${size}px ${BODY}`;
  ctx.font = numFont;
  const out = wrap(ctx, text, w, lines);
  out.forEach((ln, i) => fillStatText(ctx, ln, x, y + i * lh, { font, numFont, maxWidth: w, ...HL }));
  return out.length;
}

function art(ctx, img, x, y, size, r = 10, ring = null) {
  ctx.save();
  roundRect(ctx, x, y, size, size, r);
  ctx.fillStyle = '#1b1c22';
  ctx.fill();
  ctx.clip();
  if (img) ctx.drawImage(img, x, y, size, size);
  ctx.restore();
  if (ring) {
    ctx.strokeStyle = ring;
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, size, size, r);
    ctx.stroke();
  }
}

function circle(ctx, img, cx, cy, r, ring, ringW = 3) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#1b1c22';
  ctx.fill();
  ctx.clip();
  if (img) ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = ring;
  ctx.lineWidth = ringW;
  ctx.stroke();
}

function outlined(ctx, text, x, y, font, fill, width = 6) {
  ctx.save();
  ctx.font = font;
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 12;
  ctx.strokeStyle = 'rgba(10, 11, 16, 0.92)';
  ctx.lineWidth = width;
  ctx.strokeText(text, x, y);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ---------- card ----------

export async function renderGuideCard(character, { base = '/', scale = 2 } = {}) {
  await ensureFonts();
  const c = character;
  const el = ELEMENT_BY_ID[c.element];
  const elColor = EL[c.element] ?? K.pink;
  const best = bestBuild(c);
  const bestCart = best?.cartridge ?? cartridgesFor(c)[0] ?? null;
  const altCart = cartridgesFor(c).find((id) => id !== bestCart)
    ?? GENERIC_ALT[c.roles[0]]?.find((id) => id !== bestCart) ?? null;
  const arcs = arcPicks(c, best);
  const prio = statPriority(c, best);
  const spec = CHARACTER_CONSOLE[c.id]?.spec;
  const ao = AWAKENING_ORDER[c.id];
  const teams = teamsFor(c).slice(0, 4);
  const mates = [...new Set(teams.flatMap((p) => p.members))];

  const [portrait, elIcon, typeIcon, cartImg, altCartImg, bestArcImg, ...rest] = await Promise.all([
    loadImage(`${base}characters/hd/${c.id}.webp`),
    loadImage(`${base}icons/elements/${c.element}.webp`),
    c.arcType ? loadImage(`${base}icons/arc-types/${c.arcType.toLowerCase()}.webp`) : null,
    bestCart ? loadImage(`${base}icons/cartridges/${bestCart}.webp`) : null,
    altCart ? loadImage(`${base}icons/cartridges/${altCart}.webp`) : null,
    arcs.best ? loadImage(`${base}arcs/${arcs.best.id}.webp`) : null,
    ...arcs.more.map((m) => loadImage(`${base}arcs/${m.arc.id}.webp`)),
    ...mates.map((id) => loadImage(`${base}characters/${id}.webp`)),
  ]);
  const moreImgs = rest.slice(0, arcs.more.length);
  const mateImg = Object.fromEntries(mates.map((id, i) => [id, rest[arcs.more.length + i]]));

  const W = GUIDE_CARD_W;
  const H = GUIDE_CARD_H;
  const roleIcons = await loadRoleIcons(base, c.roles);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.imageSmoothingQuality = 'high';
  clipCard(ctx, W, H);
  drawBandBackdrop(ctx, W, H, BANDS);

  const PAD = 40;
  const GAP = 22;
  const COL = (W - PAD * 2 - GAP) / 2;
  const LX = PAD;
  const RX = PAD + COL + GAP;

  // ---- Header: name and facts on the left, portrait on the right ----
  const PW = 300;
  const PH = 300;
  const PX = W - PAD - PW;
  const PY = 36;
  ctx.save();
  roundRect(ctx, PX, PY, PW, PH, 24);
  const glow = ctx.createRadialGradient(PX + PW / 2, PY + PH / 2, 20, PX + PW / 2, PY + PH / 2, PW * 0.75);
  glow.addColorStop(0, `${elColor}66`);
  glow.addColorStop(1, '#16171c');
  ctx.fillStyle = glow;
  ctx.fill();
  ctx.clip();
  if (portrait) ctx.drawImage(portrait, PX, PY, PW, PW);
  ctx.restore();
  ctx.strokeStyle = elColor;
  ctx.lineWidth = 4;
  roundRect(ctx, PX, PY, PW, PH, 24);
  ctx.stroke();

  const HW = PX - LX - 30;
  let hy = PY + 34;
  outlined(ctx, 'COMPLETE BUILD GUIDE', LX, hy, `700 20px ${MONO}`, '#ff8fbe', 5);
  // Name: as large as fits on two lines.
  let size = 104;
  let nameLines;
  for (; size >= 60; size -= 4) {
    ctx.font = `italic 900 ${size}px ${DISPLAY}`;
    nameLines = wrap(ctx, c.name.toUpperCase(), HW, 2);
    if (nameLines.every((l) => !l.endsWith('…')) && (nameLines.length === 1 || size <= 84)) break;
  }
  hy += size * 0.95 + 4;
  nameLines.forEach((ln, i) => outlined(ctx, ln, LX, hy + i * size * 0.88, `italic 900 ${size}px ${DISPLAY}`, K.fg, 8));
  hy += (nameLines.length - 1) * size * 0.88 + 50;

  // Facts row: rank, element, Arc type
  drawRank(ctx, c.rarity, LX, hy - 9, 36);
  let fx = LX + 48;
  if (elIcon) ctx.drawImage(elIcon, fx, hy - 26, 32, 32);
  fx += 40;
  ctx.font = `700 22px ${BODY}`;
  ctx.fillStyle = elColor;
  ctx.fillText(el.name, fx, hy);
  fx += ctx.measureText(el.name).width + 22;
  if (c.arcType) {
    if (typeIcon) ctx.drawImage(typeIcon, fx, hy - 24, 28, 28);
    ctx.font = `600 20px ${BODY}`;
    ctx.fillStyle = K.label;
    ctx.fillText(c.arcType, fx + 34, hy);
  }
  hy += 38;
  const rx = drawRoles(ctx, c.roles, roleIcons, LX, hy, { font: `500 19px ${BODY}`, color: K.muted, size: 22 });
  if (c.faction) {
    ctx.font = `500 19px ${BODY}`;
    ctx.fillStyle = K.muted;
    ctx.fillText(fitLine(ctx, `  ·  ${c.faction}`, LX + HW - rx, 13), rx, hy);
  }

  const GY = PY + PH + 26;
  const BOTTOM = H - 104;
  const ROW1 = 470;
  const R2Y = GY + ROW1 + GAP;
  const ROW2 = BOTTOM - R2Y;

  // ---- Cartridges ----
  panel(ctx, LX, GY, COL, ROW1, 'CARTRIDGES', K.gold);
  {
    const ix = LX + 22;
    const iw = COL - 44;
    let y = GY + 88;
    const LBL = 52;
    const LH = 23;
    const bonusLines = (text) => {
      ctx.font = `700 17px ${BODY}`;
      return wrap(ctx, text, iw - LBL, 9).length;
    };
    const block = (id, img, kind, tileSize, maxBonusLines) => {
      const cart = CARTRIDGE_BY_ID[id];
      tag(ctx, kind, ix, y, kind === 'BEST' ? TAG_STYLE.BEST : TAG_STYLE.STANDARD);
      y += 12;
      cartTile(ctx, ix, y, tileSize, img);
      ctx.font = `700 ${tileSize > 56 ? 26 : 22}px ${BODY}`;
      ctx.fillStyle = K.fg;
      ctx.fillText(fitLine(ctx, cart.name, iw - tileSize - 16, 15), ix + tileSize + 16, y + tileSize / 2 + 9);
      y += tileSize + 26;
      label(ctx, '2PC', ix, y, K.gold);
      statLines(ctx, cart.two, ix + LBL, y, iw - LBL, 1, LH);
      y += 26;
      label(ctx, '4PC', ix, y, K.gold);
      const n = statLines(ctx, cart.four, ix + LBL, y, iw - LBL, maxBonusLines, LH);
      y += (n - 1) * LH + 36;
    };
    if (bestCart) block(bestCart, cartImg, 'BEST', 62, 3);
    // The alternative goes in only when its whole 4-piece text fits.
    if (altCart) {
      const need = 12 + 48 + 26 + 26 + (bonusLines(CARTRIDGE_BY_ID[altCart].four) - 1) * LH;
      if (y + need <= GY + ROW1 - 16) block(altCart, altCartImg, 'ALTERNATIVE', 48, 4);
    }
  }

  // ---- Stats & Console ----
  panel(ctx, RX, GY, COL, ROW1, 'STATS & CONSOLE', K.key);
  {
    const ix = RX + 22;
    const iw = COL - 44;
    let y = GY + 92;
    if (prio.main.length) {
      label(ctx, 'CARTRIDGE MAIN STAT', ix, y);
      y += 28;
      const n = drawPriority(ctx, prio.main, ix, y, iw, 2, 26, 19);
      y += (n - 1) * 26 + 40;
    }
    if (prio.subs.length) {
      label(ctx, 'SUB STATS', ix, y);
      y += 28;
      const n = drawPriority(ctx, prio.subs, ix, y, iw, 2, 26, 19);
      y += (n - 1) * 26 + 40;
    }
    if (spec) {
      label(ctx, 'CONSOLE BONUS', ix, y);
      y += 14;
      ctx.fillStyle = K.inset;
      roundRect(ctx, ix, y, iw, 62, 12);
      ctx.fill();
      // A corner piece for Type 3, otherwise the first shape of that Type.
      const shape = spec.type === 3 ? SHAPES.ZhiJiao1 : Object.values(SHAPES).find((sh) => sh.type === spec.type);
      const cell = 13;
      const sw = (Math.max(...shape.cells.map(([, cc]) => cc)) + 1) * (cell + 2);
      const sh = (Math.max(...shape.cells.map(([r]) => r)) + 1) * (cell + 2);
      goldCells(ctx, ix + 14 + (44 - sw) / 2, y + (62 - sh) / 2, shape.cells, cell, 2);
      const text = `${spec.stat} +${spec.value}% per Type ${spec.type} module`;
      let fs = 18;
      for (; fs > 13; fs -= 1) {
        ctx.font = `700 ${fs}px ${BODY}`;
        if (ctx.measureText(text).width <= iw - 84) break;
      }
      statLines(ctx, text, ix + 70, y + 38, iw - 84, 1, 24, fs);
      y += 62 + 40;
    }
    if (ao?.order?.length && y < GY + ROW1 - 70) {
      label(ctx, 'AWAKENING ORDER', ix, y);
      const n = ao.order.length;
      const d = Math.min(44, (iw - (n - 1) * 12) / n, GY + ROW1 - 22 - (y + 14));
      const gap = Math.min(20, (iw - n * d) / Math.max(1, n - 1));
      const cy = y + 14 + d / 2;
      ao.order.forEach((id, i) => {
        const cx = ix + d / 2 + i * (d + gap);
        drawOrb(ctx, cx, cy, d / 2, elColor, i === 0);
        ctx.textAlign = 'center';
        ctx.font = `800 ${Math.round(d * 0.34)}px ${MONO}`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(id, cx, cy + d * 0.12);
        ctx.textAlign = 'left';
      });
    }
  }

  // ---- Arcs ----
  panel(ctx, LX, R2Y, COL, ROW2, 'ARCS', elColor);
  if (arcs.best) {
    const ix = LX + 22;
    const iw = COL - 44;
    let y = R2Y + 76;
    const A = 100;
    art(ctx, bestArcImg, ix, y, A, 14, K.gold);
    const tx = ix + A + 18;
    tag(ctx, arcs.bestTag, tx, y + 18, TAG_STYLE[arcs.bestTag]);
    ctx.font = `700 24px ${BODY}`;
    ctx.fillStyle = K.fg;
    const nm = wrap(ctx, arcs.best.name, iw - A - 18, 2);
    nm.forEach((ln, i) => ctx.fillText(ln, tx, y + 50 + i * 28));
    const sy = y + 50 + nm.length * 28 + 4;
    ctx.font = `600 15px ${MONO}`;
    ctx.fillStyle = K.muted;
    const rk = `${arcs.best.rarity}-RANK  ·  `;
    ctx.fillText(rk, tx, sy);
    statLines(ctx, arcs.best.sub, tx + ctx.measureText(rk).width, sy, iw - A - 18 - ctx.measureText(rk).width, 1, 22, 16);
    y += A + 16;
    const room = R2Y + ROW2 - 14 - y;
    const rowH = Math.min(78, room / Math.max(1, arcs.more.length));
    const S = Math.min(62, rowH - 12);
    // Tag on top, name underneath: keep at least 42px between them.
    const nameY = Math.max(42, S - 6);
    arcs.more.forEach((m, i) => {
      const ry = y + i * rowH;
      art(ctx, moreImgs[i], ix, ry + (nameY + 6 - S) / 2, S, 10);
      const mx = ix + S + 16;
      tag(ctx, m.tag, mx, ry + 16, TAG_STYLE[m.tag] ?? TAG_STYLE.STANDARD);
      ctx.font = `600 19px ${BODY}`;
      ctx.fillStyle = K.fg;
      const t = fitLine(ctx, m.arc.name, iw - S - 16 - 64, 13);
      ctx.fillText(t, mx, ry + nameY);
      const tw = ctx.measureText(t).width;
      ctx.font = `600 14px ${MONO}`;
      ctx.fillStyle = K.muted;
      ctx.fillText(`${m.arc.rarity}-RANK`, mx + tw + 10, ry + nameY);
    });
  }

  // ---- Teams ----
  panel(ctx, RX, R2Y, COL, ROW2, 'TEAMS', '#ff8fbe');
  {
    const ix = RX + 22;
    const iw = COL - 44;
    const top = R2Y + 78;
    const avail = R2Y + ROW2 - 18 - top;
    const rowH = Math.min(116, avail / Math.max(1, teams.length));
    teams.forEach((p, i) => {
      const y = top + i * rowH;
      if (i > 0) {
        ctx.strokeStyle = K.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ix, y - 8);
        ctx.lineTo(ix + iw, y - 8);
        ctx.stroke();
      }
      ctx.font = `700 19px ${BODY}`;
      ctx.fillStyle = K.fg;
      const name = fitLine(ctx, p.name, iw - (p.idea ? 96 : 0), 13);
      ctx.fillText(name, ix, y + 16);
      if (p.idea) tag(ctx, 'KIT IDEA', ix + ctx.measureText(name).width + 10, y + 15, TAG_STYLE['BATTLE PASS']);
      const R = Math.min(26, (rowH - 44) / 2);
      const step = R * 2 + 10;
      p.members.forEach((id, j) => {
        const m = CHARACTER_BY_ID[id];
        if (!m) return;
        const cx = ix + R + j * step;
        const cy = y + 32 + R;
        circle(ctx, mateImg[id], cx, cy, R, id === c.id ? K.gold : EL[m.element] ?? K.line, id === c.id ? 3.5 : 2.5);
      });
      // Reactions beside the portraits
      const a = analyzeTeam(p.members);
      const names = [...a.trios.map((t) => `${t.name} Trio`), ...a.reactions.map((r) => r.name)];
      const rx = ix + 4 * step + 8;
      ctx.font = `500 15px ${BODY}`;
      ctx.fillStyle = K.label;
      wrap(ctx, names.join(' · '), ix + iw - rx, 2).forEach((ln, k) => ctx.fillText(ln, rx, y + 32 + R - 4 + k * 20));
    });
    if (!teams.length) {
      ctx.font = `500 18px ${BODY}`;
      ctx.fillStyle = K.muted;
      wrap(ctx, `Try ${c.name} with anyone in the Team Builder and see the reactions.`, iw, 3)
        .forEach((ln, k) => ctx.fillText(ln, ix, top + 20 + k * 26));
    }
  }

  // ---- Footer ----
  const linksFont = `500 15px ${BODY}`;
  const lw = measureLinksLine(ctx, { font: linksFont, iconSize: 15, gap: 22 });
  drawLinksLine(ctx, (W - lw) / 2, H - 60, { font: linksFont, color: K.muted, accent: K.fg, iconSize: 15, gap: 22 });
  ctx.font = `400 13px ${BODY}`;
  ctx.fillStyle = K.muted;
  ctx.textAlign = 'center';
  ctx.fillText('Unofficial fan project · Neverness to Everness © Hotta Studio / Perfect World Games', W / 2, H - 30);
  ctx.textAlign = 'left';

  drawSilverFrame(ctx, W, H);
  return canvas;
}
