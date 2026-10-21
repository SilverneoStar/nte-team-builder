// Character teams card: a tall (4:5) image for one character. Left column:
// portrait and recommended build. Right column: the featured teams they're in,
// with each team's reactions. Shared from the character page's "Featured in".
import { ELEMENT_BY_ID } from '../data/elements.js';
import { CHARACTER_BY_ID } from '../data/characters.js';
import { ARC_BY_ID, arcAccess, arcTag } from '../data/arcs.js';
import { CARTRIDGE_BY_ID } from '../data/gear.js';
import { PRESETS } from '../data/presets.js';
import { AWAKENING_ORDER } from '../data/awakeningOrder.js';
import { bestBuild } from '../data/bestBuild.js';
import { ENDGAME } from '../data/endgame.js';
import { analyzeTeam } from './analyze.js';
import { alternativesFor, cartTile, drawOrb, statLabel } from './buildCard.js';
import { drawLinksLine, measureLinksLine } from './cardLinks.js';
import {
  BODY, DISPLAY, EL, MONO, clipCard, drawBandBackdrop, drawRank, drawSilverFrame, ensureFonts, loadImage, roundRect, wrap, fitLine,
  loadRoleIcons, drawRoles, drawMascot
} from './teamCard.js';

export const CHAR_CARD_W = 1080;
export const CHAR_CARD_H = 1350;
const MAX_TEAMS = 5;

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
const BANDS = [{ y: -60, h: 190, a: 1 }, { y: 520, h: 130, a: 0.6 }, { y: 1100, h: 180, a: 0.8 }];

/** Presets this character is in: community teams first (their own named team leading), then kit ideas. */
export function teamsFor(character) {
  const list = PRESETS.filter((p) => p.members.includes(character.id));
  const own = (p) => (p.name.toLowerCase().includes(character.name.split(' ')[0].toLowerCase()) ? 0 : 1);
  return [...list].sort((a, b) => Number(!!a.idea) - Number(!!b.idea) || own(a) - own(b));
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = K.panel;
  roundRect(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = K.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function sectionLabel(ctx, text, x, y) {
  ctx.font = `700 15px ${MONO}`;
  ctx.fillStyle = K.pink;
  ctx.fillText(text, x, y);
}

/** Text with a dark outline and soft shadow, for headings over the pink bands. */
function outlined(ctx, text, x, y, font, fill, width = 5) {
  ctx.save();
  ctx.font = font;
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 10;
  ctx.strokeStyle = 'rgba(10, 11, 16, 0.92)';
  ctx.lineWidth = width;
  ctx.strokeText(text, x, y);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  ctx.restore();
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

/** Small rounded image, then a name and an optional note; returns the x after it. */
function iconLine(ctx, img, x, y, size, name, note, maxX, nameFont = `600 19px ${BODY}`) {
  if (img) {
    ctx.save();
    roundRect(ctx, x, y - size + 6, size, size, 7);
    ctx.clip();
    ctx.drawImage(img, x, y - size + 6, size, size);
    ctx.restore();
  }
  let cx = x + (img ? size + 10 : 0);
  ctx.font = nameFont;
  ctx.fillStyle = K.fg;
  const nm = fitLine(ctx, name, maxX - cx, 12);
  ctx.fillText(nm, cx, y);
  cx += ctx.measureText(nm).width;
  if (note) {
    ctx.font = `500 15px ${BODY}`;
    const t = `  ·  ${note}`;
    if (cx + ctx.measureText(t).width <= maxX) {
      ctx.fillStyle = K.muted;
      ctx.fillText(t, cx, y);
    }
  }
  return cx;
}

function chip(ctx, x, y, text, { bg, fg, dots = [] }) {
  ctx.font = `600 15px ${BODY}`;
  const dw = dots.length ? dots.length * 11 + 6 : 0;
  const w = ctx.measureText(text).width + 24 + dw;
  ctx.fillStyle = bg;
  roundRect(ctx, x, y, w, 30, 15);
  ctx.fill();
  dots.forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(x + 14 + i * 11, y + 15, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });
  ctx.fillStyle = fg;
  ctx.fillText(text, x + 12 + dw, y + 20);
  return w;
}

export async function renderCharacterCard(character, { base = '/', scale = 2 } = {}) {
  await ensureFonts();
  const c = character;
  const el = ELEMENT_BY_ID[c.element];
  const elColor = EL[c.element] ?? K.pink;
  const best = bestBuild(c);
  const arc = best?.arc ? ARC_BY_ID[best.arc] : null;
  const alt = alternativesFor(c, arc?.id, [best?.cartridge]);
  const teams = teamsFor(c);
  const shown = teams.slice(0, MAX_TEAMS);
  const mates = [...new Set(shown.flatMap((p) => p.members))];
  const ao = AWAKENING_ORDER[c.id];

  const [portrait, elIcon, mascot, arcArt, altArcArt, cartImg, ...rest] = await Promise.all([
    loadImage(`${base}characters/hd/${c.id}.webp`),
    loadImage(`${base}icons/elements/${c.element}.webp`),
    loadImage(`${base}mascot.svg`),
    arc ? loadImage(`${base}arcs/${arc.id}.webp`) : null,
    alt.arc ? loadImage(`${base}arcs/${alt.arc.id}.webp`) : null,
    best?.cartridge ? loadImage(`${base}icons/cartridges/${best.cartridge}.webp`) : null,
    ...alt.cartridges.map((id) => loadImage(`${base}icons/cartridges/${id}.webp`)),
    ...mates.map((id) => loadImage(`${base}characters/${id}.webp`)),
  ]);
  const altCartImgs = rest.slice(0, alt.cartridges.length);
  const mateImg = Object.fromEntries(mates.map((id, i) => [id, rest[alt.cartridges.length + i]]));

  const roleIcons = await loadRoleIcons(base, c.roles);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(CHAR_CARD_W * scale);
  canvas.height = Math.round(CHAR_CARD_H * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.imageSmoothingQuality = 'high';
  clipCard(ctx, CHAR_CARD_W, CHAR_CARD_H);
  drawBandBackdrop(ctx, CHAR_CARD_W, CHAR_CARD_H, BANDS);

  const PAD = 40;
  const GAP = 24;
  const COL = (CHAR_CARD_W - PAD * 2 - GAP) / 2;
  const LX = PAD;
  const RX = PAD + COL + GAP;
  const TOP = 48;
  const BOTTOM = CHAR_CARD_H - 112;

  // ---- Left: portrait ----
  const PS = COL;
  const PH = 400;
  ctx.save();
  roundRect(ctx, LX, TOP, PS, PH, 22);
  const glow = ctx.createRadialGradient(LX + PS / 2, TOP + PH / 2, 20, LX + PS / 2, TOP + PH / 2, PS * 0.75);
  glow.addColorStop(0, `${elColor}55`);
  glow.addColorStop(1, '#16171c');
  ctx.fillStyle = glow;
  ctx.fill();
  ctx.clip();
  if (portrait) {
    // Square art, cropped to the frame from just below the top so faces sit high.
    const s = PS;
    ctx.drawImage(portrait, LX, TOP - (s - PH) * 0.25, s, s);
  }
  ctx.restore();
  ctx.strokeStyle = elColor;
  ctx.lineWidth = 4;
  roundRect(ctx, LX, TOP, PS, PH, 22);
  ctx.stroke();

  let ly = TOP + PH + 66;
  ctx.font = `italic 900 54px ${DISPLAY}`;
  ctx.fillStyle = K.fg;
  ctx.fillText(fitLine(ctx, c.name.toUpperCase(), COL, 30), LX, ly);
  ly += 40;
  drawRank(ctx, c.rarity, LX, ly - 8, 32);
  if (elIcon) ctx.drawImage(elIcon, LX + 42, ly - 24, 32, 32);
  ctx.font = `700 19px ${BODY}`;
  ctx.fillStyle = elColor;
  ctx.fillText(el.name, LX + 82, ly);
  const ew = ctx.measureText(el.name).width;
  drawRoles(ctx, c.roles, roleIcons, LX + 94 + ew, ly, { font: `500 18px ${BODY}`, color: K.muted, size: 22 });

  // ---- Left: recommended build ----
  ly += 30;
  const bTop = ly;
  panel(ctx, LX, bTop, COL, BOTTOM - bTop);
  const ix = LX + 20;
  const iw = COL - 40;
  let y = bTop + 36;
  sectionLabel(ctx, 'RECOMMENDED BUILD', ix, y);

  if (arc) {
    y += 46;
    const tag = arcTag(arc, c) === 'sig' ? 'Signature' : null;
    iconLine(ctx, arcArt, ix, y, 40, arc.name, tag ?? `${arc.rarity}-rank`, ix + iw, `700 20px ${BODY}`);
    if (alt.arc) {
      y += 34;
      ctx.font = `700 12px ${MONO}`;
      ctx.fillStyle = K.muted;
      ctx.fillText('ALT', ix + 6, y);
      iconLine(ctx, altArcArt, ix + 50, y, 26, alt.arc.name,
        arcAccess(alt.arc.id) === 'pass' ? 'Battle pass' : 'Free', ix + iw, `600 16px ${BODY}`);
    }
  }
  if (best?.cartridge) {
    y += 22;
    cartTile(ctx, ix, y, 46, cartImg);
    ctx.font = `700 20px ${BODY}`;
    ctx.fillStyle = K.fg;
    ctx.fillText(fitLine(ctx, `${CARTRIDGE_BY_ID[best.cartridge].name} ×4`, iw - 58, 14), ix + 58, y + 30);
    y += 46;
    if (alt.cartridges.length) {
      y += 26;
      ctx.font = `700 12px ${MONO}`;
      ctx.fillStyle = K.muted;
      ctx.fillText('ALT', ix + 6, y);
      let ax = ix + 50;
      alt.cartridges.forEach((id, i) => {
        if (ax > ix + iw - 60) return;
        ax = iconLine(ctx, altCartImgs[i], ax, y, 22, CARTRIDGE_BY_ID[id].name, null, ix + iw, `600 16px ${BODY}`) + 18;
      });
    }
    // Cartridge stats: main, then sub priority
    const cs = best.cartStats;
    y += 40;
    ctx.font = `700 13px ${MONO}`;
    ctx.fillStyle = K.gold;
    ctx.fillText('MAIN', ix, y);
    ctx.font = `700 18px ${BODY}`;
    ctx.fillStyle = K.num;
    ctx.fillText(wrap(ctx, statLabel(cs.main.stat), iw - 64, 1)[0], ix + 64, y);
    y += 32;
    ctx.font = `700 13px ${MONO}`;
    ctx.fillStyle = K.muted;
    ctx.fillText('SUBS', ix, y);
    ctx.font = `600 17px ${BODY}`;
    ctx.fillStyle = K.key;
    const subLines = wrap(ctx, cs.subs.map((s) => statLabel(s.stat)).join('  ›  '), iw - 64, 2);
    subLines.forEach((ln, i) => ctx.fillText(ln, ix + 64, y + i * 24));
    y += (subLines.length - 1) * 24;
  }
  // Endgame targets: the four that matter most, as small tiles.
  const eg = ENDGAME[c.id]?.endgame;
  if (eg) {
    const names = { critRate: 'CRIT Rate', critDmg: 'CRIT DMG', element: `${el.name} DMG`, atk: 'ATK', hp: 'HP',
      universal: 'Universal DMG', break: 'Break Int.', cycle: 'Cycle Int.', def: 'DEF' };
    const picks = Object.keys(names).filter((k) => eg[k]).slice(0, 4);
    if (picks.length) {
      y += 46;
      ctx.font = `700 13px ${MONO}`;
      ctx.fillStyle = K.muted;
      ctx.fillText('ENDGAME TARGETS', ix, y);
      y += 14;
      const tw = (iw - 10) / 2;
      picks.forEach((k, i) => {
        const tx = ix + (i % 2) * (tw + 10);
        const ty = y + Math.floor(i / 2) * 54;
        ctx.fillStyle = K.inset;
        roundRect(ctx, tx, ty, tw, 46, 9);
        ctx.fill();
        ctx.font = `500 15px ${BODY}`;
        ctx.fillStyle = K.label;
        ctx.fillText(names[k], tx + 12, ty + 29);
        ctx.textAlign = 'right';
        ctx.font = `700 19px ${MONO}`;
        ctx.fillStyle = K.num;
        ctx.fillText(String(eg[k]).replace(/%?\s*~\s*/, '–'), tx + tw - 12, ty + 30);
        ctx.textAlign = 'left';
      });
      y += Math.ceil(picks.length / 2) * 54 - 14;
    }
  }
  if (ao?.order?.length) {
    y += 44;
    ctx.font = `700 13px ${MONO}`;
    ctx.fillStyle = K.muted;
    ctx.fillText('AWAKEN', ix, y);
    const n = ao.order.length;
    const room = BOTTOM - 16 - (y + 14);
    const d = Math.max(30, Math.min(44, room, (iw - (n - 1) * 14) / n));
    const gap = Math.min(22, (iw - n * d) / Math.max(1, n - 1));
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

  // ---- Right: featured teams ----
  let ry = TOP + 14;
  ctx.font = `700 17px ${MONO}`;
  drawMascot(ctx, mascot, RX + COL - 96, TOP - 10, 100);
  const kicker = wrap(ctx, `TEAM IDEAS WITH ${c.name.toUpperCase()}`, COL - 104, 1)[0];
  outlined(ctx, kicker, RX, ry, `700 17px ${MONO}`, '#ff8fbe');
  ry += 42;
  outlined(ctx, 'FEATURED TEAMS', RX, ry, `italic 900 42px ${DISPLAY}`, K.fg, 6);
  ry += 24;
  const avail = BOTTOM - ry - (teams.length > MAX_TEAMS ? 34 : 0);
  const TH = Math.min(214, (avail - (shown.length - 1) * 14) / Math.max(1, shown.length));
  shown.forEach((p) => {
    panel(ctx, RX, ry, COL, TH);
    const tx = RX + 20;
    ctx.font = `700 21px ${BODY}`;
    ctx.fillStyle = K.fg;
    const tname = fitLine(ctx, p.name, COL - 40 - (p.idea ? 100 : 0), 14);
    ctx.fillText(tname, tx, ry + 36);
    if (p.idea) {
      const nx = tx + ctx.measureText(tname).width + 10;
      ctx.font = `700 12px ${MONO}`;
      const tw = ctx.measureText('KIT IDEA').width + 14;
      ctx.fillStyle = 'rgba(142, 156, 255, 0.18)';
      roundRect(ctx, nx, ry + 20, tw, 22, 11);
      ctx.fill();
      ctx.fillStyle = K.key;
      ctx.fillText('KIT IDEA', nx + 7, ry + 35);
    }
    // Members: the featured character gets a thicker gold ring.
    const R = Math.min(38, (TH - 120) / 2 + 18);
    const step = (COL - 40) / 4;
    p.members.forEach((id, i) => {
      const m = CHARACTER_BY_ID[id];
      if (!m) return;
      const cx = tx + step * i + step / 2;
      const cy = ry + 58 + R;
      if (id === c.id) {
        // Soft highlight behind the featured character's slot.
        ctx.fillStyle = 'rgba(242, 193, 78, 0.14)';
        roundRect(ctx, cx - step / 2 + 4, cy - R - 8, step - 8, R * 2 + 36, 12);
        ctx.fill();
        ctx.strokeStyle = 'rgba(242, 193, 78, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      circle(ctx, mateImg[id], cx, cy, R, EL[m.element] ?? K.line, 3);
      ctx.textAlign = 'center';
      ctx.font = `${id === c.id ? 700 : 500} 14px ${BODY}`;
      ctx.fillStyle = id === c.id ? K.gold : K.label;
      ctx.fillText(fitLine(ctx, m.name, step - 6, 10), cx, cy + R + 20);
      ctx.textAlign = 'left';
    });
    // Reactions
    const a = analyzeTeam(p.members);
    const chips = [
      ...a.trios.map((t) => ({ text: `${t.name} · Trio`, dots: t.elements.map((e) => EL[e]), trio: true })),
      ...a.reactions.map((r) => ({ text: r.name, dots: r.elements.map((e) => EL[e]) })),
    ];
    let cx = tx;
    const cyChip = ry + TH - 44;
    for (const ch of chips) {
      ctx.font = `600 15px ${BODY}`;
      const need = ctx.measureText(ch.text).width + 24 + ch.dots.length * 11 + 6;
      if (cx + need > RX + COL - 20) break;
      cx += chip(ctx, cx, cyChip, ch.text, { bg: ch.trio ? '#262c4a' : K.inset, fg: ch.trio ? K.key : K.fg, dots: ch.dots }) + 8;
    }
    ry += TH + 14;
  });
  // Few featured teams: invite people to build their own in the leftover space.
  const spare = BOTTOM - ry;
  if (teams.length <= MAX_TEAMS && spare >= 200) {
    const h = Math.min(spare, 260);
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = 'rgba(232, 72, 140, 0.45)';
    ctx.lineWidth = 2;
    roundRect(ctx, RX + 1, ry + 1, COL - 2, h - 2, 16);
    ctx.stroke();
    ctx.setLineDash([]);
    const ms = Math.min(150, h - 60);
    if (mascot) ctx.drawImage(mascot, RX + COL - ms - 24, ry + (h - ms) / 2, ms, ms);
    const tx = RX + 26;
    const tw = COL - ms - 70;
    ctx.font = `italic 900 30px ${DISPLAY}`;
    ctx.fillStyle = K.fg;
    const head = wrap(ctx, 'MAKE YOUR OWN TEAM', tw, 2);
    let ty = ry + h / 2 - (head.length * 32 + 56) / 2 + 26;
    head.forEach((ln) => { ctx.fillText(ln, tx, ty); ty += 32; });
    ctx.font = `500 16px ${BODY}`;
    ctx.fillStyle = K.label;
    wrap(ctx, `Try ${c.name} with anyone in the Team Builder and see the reactions.`, tw, 3)
      .forEach((ln, i) => ctx.fillText(ln, tx, ty + 6 + i * 22));
  }
  if (teams.length > MAX_TEAMS) {
    ctx.font = `500 16px ${BODY}`;
    ctx.fillStyle = K.muted;
    ctx.fillText(`+${teams.length - MAX_TEAMS} more on the site`, RX + 4, ry + 8);
  }

  // ---- Footer: links, then the legal line ----
  const linksFont = `500 15px ${BODY}`;
  const lw = measureLinksLine(ctx, { font: linksFont, iconSize: 15, gap: 22 });
  drawLinksLine(ctx, (CHAR_CARD_W - lw) / 2, CHAR_CARD_H - 66, { font: linksFont, color: K.muted, accent: K.fg, iconSize: 15, gap: 22 });
  ctx.font = `400 13px ${BODY}`;
  ctx.fillStyle = K.muted;
  ctx.textAlign = 'center';
  ctx.fillText('Unofficial fan project · Neverness to Everness © Hotta Studio / Perfect World Games', CHAR_CARD_W / 2, CHAR_CARD_H - 34);
  ctx.textAlign = 'left';

  drawSilverFrame(ctx, CHAR_CARD_W, CHAR_CARD_H);
  return canvas;
}
