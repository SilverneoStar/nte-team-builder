// The Tea Room's beat: a small engine that runs each frame while music plays
// and moves the bars and draws the pulse line (or wave, ripples or bloom), so they flow instead of
// looping. It can't hear the music (YouTube's player keeps its sound to
// itself), so it keeps the song's tempo and makes each beat a little
// different: every fourth beat is stronger, low bars take the kick, high bars
// shimmer, and everything rises fast and falls back slowly like a real meter.
import { useEffect, useRef, useState } from 'react';

const TAU = Math.PI * 2;
// Canvas styles that draw the levels as a spectrum (audioMotion-style looks).
export const SPECTRUM = new Set(['led', 'curve', 'radial', 'brush', 'wings', 'globe']);
// A steady pseudo-random number in 0..1 for a whole number.
const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Wings: Remielle's three pairs of wings drawn as glowing neon lines, each pair
// moving with its own part of the music, around a ball wrapped in curved
// feather blades like her W-Engine.
//  - Upper pair: her big mechanical wings. A swept leading edge with four long
//    panels hanging from it, each with a round light at its base; the panels
//    fan open with the bass.
//  - Middle pair: feathered wings, drawn like a neon sign: an edge with
//    scalloped feather lobes under it that reach out with the mids.
//  - Lower pair: small pointed feathers angled down, with the highs.
// Exported on its own so it can be drawn and checked outside the room.
export const drawWings = (ctx, w, h, dpr, L, p, clock) => {
  const band = (a, b) => {
    let s = 0;
    for (let i = a; i < b; i++) s += L[i] || 0;
    return s / (b - a);
  };
  const lo = band(0, 8);
  const mid = band(8, 16);
  const hi = band(16, 24);
  const cx = w / 2;
  const cy = h * 0.54;
  const R = h * 0.13;
  const sx = h * 1.05;
  const sy = h * 0.5;
  const breathe = Math.sin(clock * 1.5);
  const neon = (width = 1.6) => {
    ctx.lineWidth = width * dpr;
    ctx.strokeStyle = p.fill;
    if (p.glow) {
      ctx.shadowColor = p.glow;
      ctx.shadowBlur = p.blur * dpr * 0.9;
    }
  };
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Map wing space (u out from the body, v up) to the canvas for one side,
  // with the pair's own root height, lift and size.
  const mapper = (side, rootY, lift, size) => {
    const cs = Math.cos(lift);
    const sn = Math.sin(lift);
    return (u, v) => {
      const ru = (u * cs - v * sn) * size;
      const rv = (u * sn + v * cs) * size;
      return [cx + side * (R * 1.15 + ru * sx), rootY - rv * sy];
    };
  };
  const curve = (at, pts, close = false, fillAlpha = 0) => {
    const q = pts.map((t) => at(t[0], t[1]));
    ctx.beginPath();
    ctx.moveTo(q[0][0], q[0][1]);
    for (let k = 1; k + 1 < q.length; k += 2) ctx.quadraticCurveTo(q[k][0], q[k][1], q[k + 1][0], q[k + 1][1]);
    if (close) ctx.closePath();
    if (fillAlpha) {
      ctx.save();
      ctx.globalAlpha = fillAlpha;
      ctx.fillStyle = p.fill;
      ctx.fill();
      ctx.restore();
    }
    ctx.stroke();
  };
  // A long pointed blade from a to b, widest a third of the way along.
  const blade = (at, a, b, width, fillAlpha = 0.12) => {
    const du = b[0] - a[0];
    const dv = b[1] - a[1];
    const n = Math.hypot(du, dv) || 1;
    const nu = (-dv / n) * width;
    const nv = (du / n) * width;
    const m = [a[0] + du * 0.35, a[1] + dv * 0.35];
    curve(at, [a, [m[0] + nu, m[1] + nv], b, [m[0] - nu, m[1] - nv], a], true, fillAlpha);
  };
  for (const side of [-1, 1]) {
    // Upper pair: mechanical wings.
    {
      const at = mapper(side, cy - h * 0.06, 0.2 + lo * 0.1 + breathe * 0.02, 0.92 + lo * 0.1);
      neon(1.8);
      // Leading edge: a slim swept arm up to a sharp tip.
      blade(at, [0, 0], [1.1, 0.6], 0.06, 0.2);
      const spread = 0.22 + lo * 0.2;
      for (let k = 0; k < 4; k++) {
        const t = 0.22 + 0.2 * k;
        const base = [t * 1.0, t * 0.5];
        const ang = -0.75 + spread * (k - 1.5) * 0.5;
        const len = (0.42 + 0.12 * k) * (0.9 + 0.25 * (L[k * 2] || 0));
        const tip = [base[0] + Math.cos(ang) * len, base[1] + Math.sin(ang) * len];
        neon(1.5);
        blade(at, base, tip, 0.075, 0.14);
        // The round light near the panel's base, glowing brighter with its band.
        const dot = at(base[0] + Math.cos(ang) * 0.14, base[1] + Math.sin(ang) * 0.14);
        ctx.save();
        ctx.shadowColor = '#ff4f7a';
        ctx.shadowBlur = p.blur * dpr * (0.6 + (L[k * 2] || 0));
        ctx.globalAlpha = 0.6 + 0.4 * (L[k * 2] || 0);
        ctx.fillStyle = '#ff6f93';
        ctx.beginPath();
        ctx.arc(dot[0], dot[1], R * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffe3ec';
        ctx.beginPath();
        ctx.arc(dot[0], dot[1], R * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    // Middle pair: feathered, neon-sign lobes.
    {
      const at = mapper(side, cy + h * 0.06, -0.12 + mid * 0.1 - breathe * 0.02, 0.72 + mid * 0.1);
      neon(1.6);
      curve(at, [[0, 0], [0.45, 0.35], [1, 0.3]]);
      for (let k = 0; k < 4; k++) {
        const ext = 0.75 + 0.4 * (L[8 + k * 2] || 0);
        const au = 1 - 0.07 * k;
        const av = 0.3 - 0.16 * k;
        const nu = au - 0.04;
        const nv = av - 0.15;
        const eu = nu - (0.32 + 0.1 * k) * ext;
        // Out along the edge to a feather point, then back in toward the body.
        curve(at, [[au, av], [au + 0.12, av - 0.06], [nu, nv], [nu - 0.25, nv - 0.01], [eu, nv + 0.04]]);
      }
    }
    // Lower pair: small feathers angled down.
    {
      const at = mapper(side, cy + h * 0.16, -0.62 + hi * 0.12 + breathe * 0.02, 0.5 + hi * 0.1);
      neon(1.4);
      for (let k = 0; k < 3; k++) {
        const ang = -0.05 - 0.28 * k;
        const len = (0.9 - 0.15 * k) * (0.85 + 0.3 * (L[16 + k * 3] || 0));
        blade(at, [0.04 * k, -0.03 * k], [Math.cos(ang) * len, Math.sin(ang) * len], 0.06, 0.1);
      }
    }
  }
  // The feather ball: a pale orb with fine cracks, wrapped in three long
  // curved blades that sway, and a small pink-violet star at the top, like
  // her W-Engine. It swells with the bass.
  const r = R * (0.92 + 0.22 * lo);
  ctx.shadowColor = p.glow || '#ffffff';
  ctx.shadowBlur = p.blur * dpr * 1.3;
  const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.7, '#eceaf6');
  g.addColorStop(1, p.tip);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(120, 110, 160, 0.45)';
  ctx.lineWidth = 0.7 * dpr;
  for (let k = 0; k < 6; k++) {
    const a = k * 1.05 + 0.4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r * 0.15, cy + Math.sin(a) * r * 0.15);
    ctx.lineTo(cx + Math.cos(a + 0.3) * r * 0.55, cy + Math.sin(a + 0.3) * r * 0.55);
    ctx.lineTo(cx + Math.cos(a + 0.1) * r * 0.85, cy + Math.sin(a + 0.1) * r * 0.85);
    ctx.stroke();
  }
  const sway = Math.sin(clock * 0.9) * 0.12;
  for (let k = 0; k < 3; k++) {
    // Each blade: a crescent sweeping round the orb, thick in the middle and
    // tapering to points, on a tall oval like the W-Engine's blades.
    const a0 = -2.4 + k * 2.1 + sway;
    const a1 = a0 + 2.3;
    const ro = r * (1.6 + 0.12 * k);
    const thick = r * 0.5;
    const pt = (a, rad) => [cx + Math.cos(a) * rad * 0.85, cy + Math.sin(a) * rad * 1.12];
    ctx.beginPath();
    for (let j = 0; j <= 24; j++) {
      const [x, y] = pt(a0 + ((a1 - a0) * j) / 24, ro);
      if (j) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    for (let j = 24; j >= 0; j--) {
      const t = j / 24;
      const [x, y] = pt(a0 + (a1 - a0) * t, ro - thick * Math.sin(Math.PI * t) ** 0.8);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = '#f4f3fa';
    ctx.shadowColor = p.glow || '#ffffff';
    ctx.shadowBlur = p.blur * dpr * 0.8;
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = p.fill;
    ctx.lineWidth = 1.1 * dpr;
    ctx.stroke();
  }
  // The little four-point star where the blades meet at the top.
  const st = [cx - r * 0.5, cy - r * 1.85];
  const sr = r * (0.42 + 0.15 * hi);
  const sg = ctx.createLinearGradient(st[0] - sr, st[1] - sr, st[0] + sr, st[1] + sr);
  sg.addColorStop(0, '#7b5cff');
  sg.addColorStop(1, '#ff4f9a');
  ctx.fillStyle = sg;
  ctx.shadowColor = '#ff4f9a';
  ctx.shadowBlur = 6 * dpr;
  ctx.beginPath();
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4 + clock * 0.4;
    const rr = k % 2 ? sr * 0.28 : sr;
    const x = st[0] + Math.cos(a) * rr;
    const y = st[1] + Math.sin(a) * rr;
    if (k) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

// Globe: Remielle's W-Engine crystal ball as a snow globe. Glitter and little
// white feathers float inside the glass; every beat shakes the globe so they
// swirl up, and the louder the music the more they're stirred. The ball is
// held by curved white blades with a small violet-pink star, like the W-Engine.
// Exported on its own so it can be drawn and checked outside the room.
// The feather: a curved shaft, a soft body and many fine wavy barbs, fluffy toward the base.
const FEATHER = typeof Path2D === 'undefined' ? null : new Path2D('M14.9 85.6 L14.9 85.6 L12.8 84.5 L12.5 83.7 L10.3 82.5 L10.0 81.7 L10.0 81.0 L10.5 80.4 L10.1 79.6 L8.0 78.3 L7.7 77.5 L9.0 77.1 L7.4 75.8 L6.7 74.8 L7.4 74.3 L7.6 73.6 L7.6 72.8 L5.7 71.4 L7.0 71.1 L5.5 69.7 L5.5 69.0 L6.9 68.7 L6.5 67.8 L8.3 67.8 L5.5 65.8 L8.7 66.4 L7.7 65.2 L6.9 64.0 L4.7 62.1 L7.2 62.6 L6.3 61.3 L7.6 61.2 L7.8 60.5 L5.3 58.3 L9.0 59.6 L6.1 57.0 L8.5 57.6 L8.8 57.1 L9.5 56.7 L6.0 53.6 L6.8 53.3 L10.0 54.6 L6.1 51.1 L8.6 52.0 L7.9 50.6 L9.4 50.9 L8.9 49.7 L9.4 49.2 L9.7 48.6 L11.0 48.8 L13.2 49.8 L14.2 49.8 L13.1 48.1 L14.6 48.6 L15.0 48.1 L14.1 46.6 L12.0 44.0 L11.3 42.7 L12.0 42.4 L9.6 39.6 L9.0 38.2 L12.1 40.0 L13.0 40.1 L12.4 38.7 L10.4 36.0 L13.6 38.1 L13.0 36.7 L13.3 36.1 L13.8 35.8 L11.2 32.5 L11.2 31.6 L11.8 31.3 L12.4 31.0 L13.7 31.4 L15.0 31.7 L12.8 28.7 L15.0 30.0 L13.7 27.8 L14.0 27.2 L14.8 27.1 L19.5 31.1 L18.7 29.4 L19.0 28.8 L19.7 28.6 L19.6 27.6 L15.6 22.5 L18.7 24.9 L17.2 22.4 L17.2 21.5 L19.1 22.6 L17.4 19.8 L17.9 19.3 L18.4 19.0 L18.6 18.2 L18.9 17.7 L19.8 17.7 L19.6 16.5 L21.1 17.2 L22.5 18.0 L21.5 15.8 L21.2 14.5 L23.2 16.0 L22.2 13.7 L24.2 15.2 L22.9 12.5 L23.9 12.7 L23.8 11.6 L25.2 12.5 L24.3 10.2 L26.2 11.7 L25.3 9.4 L26.4 10.0 L26.3 8.7 L26.6 8.1 L27.9 8.8 L28.1 8.1 L28.9 8.1 L29.3 7.6 L29.4 6.6 L29.8 6.1 L30.1 5.4 L31.0 5.6 L31.3 5.0 L31.8 4.6 L32.5 4.5 L33.0 4.1 L33.3 3.5 L34.3 3.9 L35.0 3.8 L35.3 3.2 L35.7 2.6 L36.0 2.0 L36.0 2.0 L36.0 2.0 L35.7 2.6 L35.3 3.2 L35.0 3.8 L35.1 4.4 L35.1 5.1 L35.0 5.7 L35.0 6.3 L35.5 6.9 L34.8 7.5 L34.8 8.1 L34.8 8.7 L34.1 9.3 L33.9 9.9 L33.6 10.5 L33.5 11.1 L33.5 11.7 L32.9 12.3 L33.1 12.9 L33.0 13.5 L33.3 14.1 L33.4 14.7 L33.6 15.2 L31.7 15.9 L32.3 16.5 L32.8 17.0 L31.6 17.7 L32.4 18.2 L31.5 18.9 L31.7 19.4 L30.9 20.1 L31.7 20.6 L30.7 21.3 L30.8 21.9 L31.2 22.4 L30.8 23.0 L31.1 23.6 L30.1 24.2 L31.2 24.7 L30.3 25.4 L30.3 25.9 L28.7 26.8 L29.5 27.2 L29.1 27.8 L27.8 28.6 L30.1 28.8 L28.9 29.6 L28.9 30.2 L29.4 30.7 L29.1 31.3 L28.3 32.0 L27.3 32.8 L28.7 33.1 L27.9 33.8 L27.6 34.4 L27.6 35.0 L28.2 35.4 L25.7 36.5 L27.7 36.7 L26.2 37.6 L27.7 37.8 L23.6 39.3 L22.3 40.2 L22.6 40.7 L22.1 41.4 L22.8 41.9 L21.7 42.7 L23.9 42.8 L23.8 43.4 L24.7 43.7 L26.0 43.9 L24.4 44.9 L25.8 45.1 L23.2 46.4 L25.4 46.4 L24.2 47.3 L24.7 47.7 L24.1 48.5 L24.9 48.8 L24.1 49.7 L24.1 50.2 L22.7 51.3 L21.9 52.1 L22.5 52.5 L21.8 53.4 L23.0 53.6 L24.2 53.8 L23.2 54.8 L21.6 55.9 L21.9 56.5 L21.3 57.3 L23.5 57.2 L21.4 58.5 L20.9 59.3 L22.3 59.5 L23.4 59.8 L20.5 61.4 L22.1 61.5 L21.2 62.4 L22.1 62.8 L20.5 64.0 L21.1 64.4 L22.1 64.8 L20.8 65.8 L22.4 66.0 L20.4 67.3 L20.3 68.0 L21.8 68.2 L20.3 69.3 L19.9 70.0 L20.7 70.5 L20.7 71.2 L19.1 72.3 L20.6 72.5 L20.0 73.4 L19.9 74.1 L20.6 74.5 L20.1 75.4 L20.2 76.0 L18.1 77.3 L18.6 77.8 L18.1 78.6 L18.4 79.2 L18.5 79.9 L18.2 80.6 L18.4 81.3 L18.0 82.1 L16.7 83.1 L17.0 83.7 L16.5 84.5 L14.9 85.6Z');
const FEATHER_SHAFT = typeof Path2D === 'undefined' ? null : new Path2D('M16.0 100.0 L15.6 96.5 L15.3 93.1 L15.1 89.7 L15.0 86.2 L14.9 82.8 L14.9 79.4 L14.9 76.1 L15.1 72.7 L15.3 69.3 L15.6 66.0 L15.9 62.7 L16.3 59.4 L16.8 56.1 L17.4 52.8 L18.0 49.5 L18.7 46.2 L19.5 43.0 L20.3 39.8 L21.2 36.5 L22.2 33.3 L23.3 30.1 L24.4 27.0 L25.6 23.8 L26.9 20.6 L28.2 17.5 L29.6 14.4 L31.1 11.3 L32.7 8.2 L34.3 5.1 L36.0 2.0');
const FEATHER_BARBS = typeof Path2D === 'undefined' ? null : new Path2D('M14.9 85.6C14.9 85.6 14.9 85.6 14.9 85.6M14.9 84.9C12.8 84.8 13.7 84.4 11.9 84.0M14.9 84.2C13.4 84.1 12.6 83.6 11.4 83.2M14.9 83.5C14.5 83.3 8.1 82.4 8.3 81.5M14.9 82.9C10.6 82.7 11.5 81.5 7.9 80.6M14.9 82.2C11.0 82.0 11.1 80.8 7.9 79.8M14.9 81.5C10.4 81.3 12.5 80.2 8.6 79.3M14.9 80.8C15.2 80.6 7.0 79.3 8.0 78.3M14.9 80.2C14.2 79.8 4.7 77.9 5.1 76.4M14.9 79.5C8.5 79.0 10.1 77.1 4.7 75.5M14.9 78.8C12.9 78.5 7.7 76.7 6.5 75.4M14.9 78.1C14.5 77.7 3.5 75.3 4.2 73.6M14.9 77.5C6.5 76.8 10.3 74.4 3.1 72.3M14.9 76.8C12.7 76.3 5.3 73.8 4.2 71.9M14.9 76.1C8.3 75.5 10.0 73.2 4.5 71.2M15.0 75.5C7.6 74.7 10.7 72.5 4.4 70.4M15.0 74.8C14.4 74.2 0.9 70.6 1.7 68.2M15.0 74.1C9.1 73.3 8.4 70.6 3.7 68.3M15.0 73.5C11.0 72.6 4.0 69.0 1.5 66.3M15.1 72.8C14.1 72.1 1.0 68.1 1.5 65.4M15.1 72.1C10.2 71.3 7.2 68.2 3.5 65.6M15.1 71.5C10.1 70.5 6.6 67.2 2.9 64.4M15.2 70.8C10.2 70.0 9.3 67.3 5.4 65.0M15.2 70.1C5.4 68.7 9.8 65.3 1.5 61.8M15.3 69.5C12.9 68.8 7.4 65.8 6.0 63.7M15.3 68.8C11.7 67.9 7.0 64.5 4.6 61.9M15.4 68.1C9.7 67.0 7.8 63.4 3.5 60.3M15.4 67.5C6.5 65.8 7.4 61.4 0.3 57.3M15.5 66.8C8.7 65.5 9.2 62.1 3.9 58.8M15.5 66.1C8.7 64.7 7.8 60.6 2.6 57.0M15.6 65.5C13.5 64.6 5.0 60.2 4.3 57.3M15.7 64.8C12.1 63.8 6.8 59.7 4.6 56.6M15.7 64.2C6.3 62.2 8.7 57.7 1.1 53.0M15.8 63.5C10.5 62.3 10.4 59.1 6.3 56.1M15.9 62.8C11.9 61.5 4.4 55.9 2.2 51.9M16.0 62.2C10.9 60.9 9.2 57.0 5.5 53.6M16.0 61.5C12.0 60.3 8.6 56.3 6.0 53.1M16.1 60.9C13.9 59.9 7.9 55.8 6.9 53.0M16.2 60.2C15.1 59.0 1.1 51.9 2.0 47.8M16.3 59.6C15.2 58.4 2.3 51.7 3.1 47.8M16.4 58.9C11.8 57.6 10.8 54.0 7.5 50.8M16.5 58.2C13.5 56.7 3.0 49.5 2.1 44.9M16.6 57.6C15.4 56.5 5.1 50.6 5.5 47.1M16.7 56.9C14.4 55.6 5.0 49.2 4.5 45.1M16.8 56.3C11.0 54.5 10.8 50.2 6.6 46.2M16.9 55.6C10.3 53.6 10.8 49.1 5.9 44.5M17.0 55.0C15.8 53.9 6.1 47.7 6.5 44.1M17.1 54.3C10.3 52.3 12.1 48.1 7.0 43.7M17.2 53.7C12.3 52.1 12.3 48.3 8.7 44.6M17.3 53.0C14.7 52.0 13.4 49.3 11.7 47.0M17.4 52.4C14.7 51.5 15.1 49.6 13.0 47.6M17.6 51.7C14.9 50.7 13.1 47.6 11.5 45.1M17.7 51.1C15.0 50.2 15.5 48.4 13.5 46.5M17.8 50.4C15.6 49.6 15.6 47.9 14.0 46.2M17.9 49.8C14.8 48.6 14.9 46.2 12.7 43.8M18.1 49.1C14.8 47.7 11.7 43.2 9.8 39.8M18.2 48.5C17.3 47.4 8.2 41.1 8.9 37.8M18.4 47.8C15.1 46.3 11.5 41.5 9.7 37.9M18.5 47.2C13.0 44.9 9.8 38.5 6.5 33.2M18.6 46.5C13.2 44.1 8.6 36.9 5.6 31.2M18.8 45.9C14.6 44.1 12.2 39.2 9.7 35.2M18.9 45.2C15.3 43.6 13.1 39.3 11.0 35.8M19.1 44.6C17.6 43.4 9.9 37.2 10.1 33.8M19.2 44.0C14.4 41.6 9.9 34.8 7.4 29.5M19.4 43.3C15.1 41.5 14.5 37.6 11.7 33.8M19.6 42.7C14.4 40.5 14.3 36.2 10.8 31.9M19.7 42.0C18.2 40.8 11.0 34.7 11.1 31.3M19.9 41.4C14.3 39.1 15.8 35.5 11.8 31.2M20.1 40.7C15.7 38.4 10.3 31.0 8.2 25.7M20.2 40.1C14.5 37.3 11.5 30.5 8.2 24.7M20.4 39.5C16.8 37.3 10.2 29.7 8.9 24.7M20.6 38.8C17.7 36.9 10.3 29.3 9.7 24.7M20.8 38.2C14.5 35.4 15.8 31.0 11.4 25.9M20.9 37.5C19.5 36.3 12.8 30.3 13.0 27.1M21.1 36.9C19.5 35.3 9.5 26.6 10.2 22.2M21.3 36.3C18.7 34.6 13.9 28.8 13.0 25.1M21.5 35.6C18.1 33.5 12.4 26.4 11.3 21.7M21.7 35.0C17.6 32.6 13.4 25.9 11.5 21.0M21.9 34.4C19.0 32.5 13.3 25.7 12.5 21.4M22.1 33.7C21.6 33.2 18.4 30.4 18.7 29.0M22.3 33.1C19.0 31.5 19.9 29.3 17.6 26.5M22.5 32.5C21.9 31.8 17.4 27.7 17.9 25.9M22.7 31.8C19.8 30.4 20.7 28.5 18.7 26.1M22.9 31.2C20.0 29.7 20.5 27.5 18.6 24.9M23.1 30.6C20.0 28.4 14.2 20.9 13.3 16.2M23.4 29.9C19.3 27.8 19.8 24.6 17.3 20.9M23.6 29.3C20.4 27.2 16.6 21.2 15.4 17.1M23.8 28.7C22.5 27.2 14.5 19.5 15.3 15.9M24.0 28.0C19.0 25.5 21.1 22.5 17.6 18.4M24.3 27.4C17.4 23.9 20.1 19.7 15.4 13.9M24.5 26.8C18.4 23.5 19.9 19.1 16.0 13.6M24.7 26.1C22.7 24.4 16.6 17.3 16.6 13.5M25.0 25.5C21.6 23.3 18.1 17.0 16.8 12.7M25.2 24.9C19.9 21.9 20.4 17.2 17.2 12.2M25.4 24.3C21.3 21.8 20.5 17.1 18.3 12.8M25.7 23.6C23.7 21.9 17.9 14.9 18.0 11.2M25.9 23.0C23.2 21.2 20.8 16.3 19.7 12.9M26.2 22.4C22.5 20.3 23.9 17.9 21.5 14.6M26.4 21.7C23.5 19.8 21.3 14.9 20.1 11.3M26.7 21.1C24.0 19.1 20.5 13.3 19.8 9.5M26.9 20.5C24.3 18.8 23.6 15.5 22.3 12.6M27.2 19.9C24.4 17.9 21.9 12.8 20.9 9.1M27.5 19.2C26.6 18.3 23.1 14.2 23.4 12.2M27.7 18.6C23.0 15.8 24.6 12.4 21.6 8.0M28.0 18.0C25.1 16.0 24.2 12.2 22.8 8.8M28.3 17.4C24.8 15.1 24.4 11.1 22.6 7.3M28.6 16.8C26.5 15.3 25.2 11.9 24.4 9.3M28.8 16.1C24.4 13.3 25.9 10.1 23.1 5.8M29.1 15.5C27.7 14.4 25.8 11.0 25.5 8.9M29.4 14.9C27.0 13.1 25.1 8.6 24.3 5.4M29.7 14.3C28.8 13.3 25.3 8.9 25.7 6.8M30.0 13.7C26.3 11.3 27.7 8.8 25.4 5.1M30.3 13.0C27.0 10.8 27.6 7.9 25.7 4.4M30.6 12.4C29.8 11.6 27.0 7.9 27.3 6.1M30.9 11.8C30.0 10.9 27.3 7.2 27.5 5.3M31.2 11.2C30.6 10.5 28.1 7.3 28.4 5.8M31.5 10.6C29.4 9.2 30.0 7.5 28.9 5.4M31.8 10.0C29.9 8.6 29.7 6.3 28.9 4.1M32.1 9.3C31.6 8.7 28.8 5.2 29.3 3.7M32.4 8.7C29.9 7.0 31.1 5.5 29.6 3.0M32.7 8.1C31.7 7.3 30.8 5.2 30.6 3.8M33.0 7.5C32.3 6.8 30.9 4.4 30.9 3.1M33.3 6.9C31.7 5.8 32.4 4.6 31.5 3.0M33.7 6.3C33.3 5.9 32.1 4.1 32.2 3.3M34.0 5.7C33.6 5.3 32.7 3.8 32.8 3.0M34.3 5.0C33.8 4.6 33.2 3.2 33.1 2.4M34.6 4.4C34.5 4.3 34.2 3.8 34.2 3.5M35.0 3.8C35.0 3.8 35.0 3.8 35.0 3.8M35.3 3.2C35.3 3.2 35.3 3.2 35.3 3.2M35.7 2.6C35.7 2.6 35.7 2.6 35.7 2.6M36.0 2.0C36.0 2.0 36.0 2.0 36.0 2.0M14.9 85.6C14.9 85.6 14.9 85.6 14.9 85.6M14.9 84.9C15.4 84.8 16.9 84.4 17.1 84.1M14.9 84.2C14.9 84.1 18.2 83.6 17.9 83.2M14.9 83.5C14.9 83.4 17.8 83.0 17.5 82.6M14.9 82.9C15.1 82.7 19.6 81.9 19.3 81.3M14.9 82.2C16.0 82.0 19.3 81.1 20.0 80.4M14.9 81.5C15.9 81.3 19.1 80.5 19.7 79.8M14.9 80.8C14.7 80.6 20.8 79.7 20.1 78.9M14.9 80.2C18.6 80.0 16.6 79.0 19.9 78.3M14.9 79.5C17.1 79.3 17.7 78.4 19.5 77.7M14.9 78.8C15.8 78.6 19.8 77.6 20.2 76.8M14.9 78.1C14.6 78.0 20.3 77.1 19.5 76.4M14.9 77.5C19.7 77.3 18.4 75.7 22.5 74.5M14.9 76.8C19.4 76.6 18.5 75.0 22.3 73.9M14.9 76.1C15.4 75.8 23.4 74.3 23.1 72.9M15.0 75.5C17.4 75.2 20.3 73.8 22.1 72.6M15.0 74.8C20.1 74.7 17.8 73.0 22.2 71.8M15.0 74.1C20.8 74.0 18.0 72.0 23.1 70.8M15.0 73.5C17.8 73.3 18.7 72.0 20.9 71.0M15.1 72.8C19.4 72.6 19.6 70.7 23.1 69.4M15.1 72.1C19.9 72.0 19.0 70.0 23.1 68.7M15.1 71.5C19.7 71.4 18.1 69.6 22.1 68.5M15.2 70.8C18.3 70.6 20.2 68.9 22.6 67.6M15.2 70.1C19.9 70.0 20.9 67.6 24.7 66.0M15.3 69.5C16.3 69.2 22.0 67.7 22.5 66.3M15.3 68.8C18.5 68.7 20.1 66.9 22.7 65.5M15.4 68.1C21.6 68.1 20.1 65.3 25.6 63.5M15.4 67.5C17.5 67.2 21.8 65.5 23.3 63.9M15.5 66.8C17.3 66.4 24.0 64.4 25.1 62.4M15.5 66.1C15.7 65.7 24.1 64.3 23.6 62.4M15.6 65.5C18.2 65.3 20.7 63.6 22.7 62.2M15.7 64.8C19.5 64.7 21.9 62.3 25.0 60.5M15.7 64.2C20.6 64.2 19.4 61.8 23.7 60.4M15.8 63.5C17.0 63.1 24.5 61.3 24.9 59.2M15.9 62.8C20.1 62.9 19.0 60.8 22.7 59.6M16.0 62.2C22.2 62.3 21.3 58.9 26.8 57.0M16.0 61.5C18.1 61.2 23.8 59.1 25.2 57.1M16.1 60.9C17.5 60.6 22.2 59.1 23.1 57.5M16.2 60.2C20.5 60.3 20.0 57.9 23.8 56.5M16.3 59.6C21.3 59.6 22.5 56.4 26.8 54.4M16.4 58.9C17.8 58.6 22.7 57.0 23.7 55.3M16.5 58.2C20.9 58.4 20.5 55.8 24.4 54.3M16.6 57.6C20.0 57.6 20.9 55.4 23.9 53.9M16.7 56.9C20.0 56.8 23.5 54.2 26.3 52.1M16.8 56.3C19.1 55.9 26.0 53.4 27.7 50.8M16.9 55.6C18.4 55.3 24.9 53.3 25.8 51.1M17.0 55.0C17.8 54.6 23.7 53.2 24.0 51.4M17.1 54.3C18.3 54.0 24.3 52.3 25.1 50.2M17.2 53.7C20.9 53.9 20.8 51.5 24.1 50.1M17.3 53.0C21.3 53.2 21.8 50.6 25.3 49.0M17.4 52.4C21.6 52.5 23.7 49.5 27.3 47.5M17.6 51.7C22.6 52.0 22.7 48.7 27.3 47.0M17.7 51.1C22.1 51.2 24.5 48.0 28.4 45.9M17.8 50.4C21.6 50.5 23.8 47.8 27.1 45.9M17.9 49.8C21.4 49.8 25.1 47.1 28.0 45.0M18.1 49.1C19.6 48.8 26.1 47.1 27.2 44.8M18.2 48.5C21.5 48.5 26.1 45.8 28.9 43.5M18.4 47.8C19.6 47.6 24.6 46.3 25.5 44.5M18.5 47.2C20.8 47.0 27.5 44.8 29.3 42.3M18.6 46.5C22.0 46.7 24.3 44.3 27.3 42.7M18.8 45.9C21.4 45.8 27.4 43.5 29.6 41.1M18.9 45.2C21.3 45.2 25.5 43.3 27.6 41.5M19.1 44.6C22.4 44.9 23.0 42.7 26.1 41.6M19.2 44.0C22.7 44.3 22.9 42.1 26.2 41.0M19.4 43.3C20.0 43.2 22.4 42.7 22.8 41.9M19.6 42.7C21.7 42.9 22.4 41.4 24.4 40.7M19.7 42.0C20.9 42.1 22.2 41.2 23.3 40.6M19.9 41.4C21.5 41.5 22.4 40.4 23.9 39.7M20.1 40.7C21.6 40.9 22.1 39.9 23.5 39.4M20.2 40.1C22.2 40.3 23.5 38.9 25.3 38.1M20.4 39.5C25.7 40.2 26.3 36.7 31.3 35.2M20.6 38.8C24.4 39.3 25.5 36.8 29.0 35.5M20.8 38.2C24.3 38.5 27.9 36.0 31.2 34.2M20.9 37.5C23.5 37.8 25.8 36.1 28.1 34.8M21.1 36.9C23.5 36.9 29.7 35.1 31.8 32.9M21.3 36.3C25.7 37.0 26.6 34.1 30.8 32.8M21.5 35.6C22.6 35.3 29.9 34.5 30.7 32.3M21.7 35.0C23.6 35.0 29.3 33.6 31.0 31.6M21.9 34.4C25.7 34.9 28.6 32.4 32.1 30.7M22.1 33.7C25.7 34.3 26.5 32.0 29.9 31.0M22.3 33.1C24.5 33.2 29.4 31.7 31.4 29.9M22.5 32.5C27.1 33.3 28.1 30.3 32.4 29.1M22.7 31.8C27.3 32.7 28.4 29.7 32.8 28.4M22.9 31.2C26.3 31.7 28.7 29.5 32.0 28.2M23.1 30.6C25.8 30.9 29.3 29.2 31.9 27.7M23.4 29.9C25.8 30.1 31.3 28.6 33.6 26.6M23.6 29.3C26.0 29.7 27.7 28.1 30.0 27.2M23.8 28.7C26.3 29.0 29.4 27.4 31.9 26.1M24.0 28.0C25.7 28.1 30.9 27.1 32.4 25.4M24.3 27.4C25.1 27.3 30.2 26.9 31.0 25.4M24.5 26.8C28.5 27.7 29.5 25.0 33.4 24.1M24.7 26.1C25.9 26.0 32.1 25.5 33.2 23.6M25.0 25.5C28.9 26.4 30.5 23.8 34.4 22.8M25.2 24.9C25.9 24.7 32.1 24.5 32.8 22.7M25.4 24.3C28.4 24.8 31.3 23.0 34.1 21.8M25.7 23.6C26.5 23.4 32.7 23.3 33.4 21.5M25.9 23.0C26.8 22.8 33.1 22.6 34.0 20.8M26.2 22.4C27.3 22.3 32.2 22.0 33.2 20.5M26.4 21.7C29.3 22.5 30.1 20.6 32.9 20.0M26.7 21.1C29.9 21.9 31.3 19.9 34.4 19.1M26.9 20.5C28.4 20.7 31.5 20.0 33.0 19.0M27.2 19.9C28.0 19.7 33.4 19.7 34.2 18.1M27.5 19.2C30.4 20.1 30.8 18.2 33.7 17.7M27.7 18.6C30.8 19.5 31.9 17.5 34.9 16.9M28.0 18.0C30.0 18.5 31.6 17.3 33.6 16.7M28.3 17.4C30.8 18.0 32.7 16.5 35.2 15.8M28.6 16.8C29.5 16.8 33.4 16.6 34.3 15.4M28.8 16.1C30.7 16.7 31.3 15.5 33.2 15.2M29.1 15.5C30.5 15.7 34.6 15.2 36.0 14.0M29.4 14.9C30.9 15.2 34.0 14.5 35.6 13.6M29.7 14.3C32.0 15.0 33.0 13.5 35.3 13.1M30.0 13.7C31.5 14.1 33.1 13.2 34.7 12.7M30.3 13.0C31.5 13.3 33.3 12.7 34.6 12.2M30.6 12.4C31.3 12.5 33.5 12.3 34.2 11.7M30.9 11.8C32.6 12.4 33.1 11.2 35.0 11.0M31.2 11.2C32.5 11.6 33.4 10.8 34.7 10.5M31.5 10.6C33.0 11.1 33.2 10.1 34.8 10.0M31.8 10.0C32.2 10.0 34.6 10.0 35.1 9.4M32.1 9.3C33.5 9.8 33.8 8.9 35.3 8.8M32.4 8.7C34.0 9.3 34.5 8.3 36.2 8.1M32.7 8.1C33.2 8.1 35.5 8.2 36.0 7.6M33.0 7.5C33.7 7.7 35.0 7.4 35.8 7.0M33.3 6.9C33.9 6.9 36.1 7.0 36.7 6.3M33.7 6.3C34.5 6.6 34.8 6.1 35.7 6.0M34.0 5.7C34.7 5.9 34.8 5.5 35.5 5.4M34.3 5.0C34.7 5.2 35.2 5.0 35.6 4.9M34.6 4.4C34.9 4.5 35.0 4.4 35.3 4.3M35.0 3.8C35.0 3.8 35.0 3.8 35.0 3.8M35.3 3.2C35.3 3.2 35.3 3.2 35.3 3.2M35.7 2.6C35.7 2.6 35.7 2.6 35.7 2.6M36.0 2.0C36.0 2.0 36.0 2.0 36.0 2.0M15.8 97.9c2.2 -3.2 5.2 1.5 8.0 -3.3M15.7 97.6c-3.6 -2.7 -6.3 2.7 -11.2 -2.2M15.7 97.2c3.0 -3.3 6.7 1.3 10.6 -4.4M15.7 96.9c-5.3 -2.5 -9.9 3.0 -17.3 -3.4M15.6 96.5c3.7 -3.4 8.2 1.2 13.0 -5.3M15.6 96.2c-3.6 -2.7 -6.6 2.6 -11.5 -2.3M15.6 95.8c4.8 -3.4 10.3 1.1 16.4 -6.6M15.5 95.5c-3.1 -2.7 -5.5 2.5 -9.8 -2.0M15.5 95.2c2.7 -3.2 6.1 1.5 9.6 -3.8M15.5 94.8c-5.2 -2.6 -9.8 2.8 -17.0 -3.6M15.5 94.5c4.7 -3.4 10.1 1.2 16.1 -6.3M15.4 94.1c-4.5 -2.6 -8.3 2.7 -14.5 -3.1M15.4 93.8c4.8 -3.4 10.2 1.2 16.4 -6.4M15.4 93.4c-2.8 -2.8 -4.9 2.4 -8.7 -1.9M15.3 93.1c4.6 -3.4 9.8 1.3 15.7 -6.0M15.3 92.7c-4.5 -2.7 -8.4 2.6 -14.6 -3.2M15.3 92.4c4.0 -3.3 8.5 1.4 13.7 -5.2M15.3 92.1c-4.9 -2.7 -9.2 2.6 -15.9 -3.6M15.2 91.7c2.5 -3.2 5.5 1.6 8.7 -3.3M15.2 91.4c-3.1 -2.8 -5.7 2.4 -10.0 -2.3M15.2 91.0c2.6 -3.2 5.7 1.6 9.0 -3.3M15.2 90.7c-3.9 -2.8 -7.3 2.4 -12.5 -2.9M15.2 90.3c3.7 -3.2 7.9 1.5 12.7 -4.6M15.1 90.0c-4.0 -2.8 -7.6 2.4 -13.1 -3.1M15.1 89.7c3.2 -3.2 6.9 1.6 11.1 -4.0M15.1 89.3c-4.6 -2.8 -8.7 2.5 -14.9 -3.6M15.1 89.0c4.5 -3.2 9.4 1.5 15.3 -5.4M15.1 88.6c-4.6 -2.8 -8.8 2.4 -15.0 -3.7M15.1 88.3c2.4 -3.1 5.1 1.8 8.2 -2.9M15.0 87.9c-2.9 -2.9 -5.5 2.2 -9.5 -2.4M15.0 87.6c2.9 -3.1 6.1 1.7 9.8 -3.4M15.0 87.3c-3.2 -2.9 -6.0 2.2 -10.3 -2.6M15.0 86.9c3.8 -3.1 8.0 1.7 13.0 -4.4M15.0 86.6c-3.0 -2.9 -5.8 2.2 -9.8 -2.6M15.0 86.2c4.0 -3.1 8.2 1.7 13.5 -4.5M15.0 85.9c-3.4 -2.9 -6.6 2.2 -11.2 -3.0M14.9 85.6c3.3 -3.1 6.8 1.8 11.2 -3.7M14.9 85.2c-4.4 -2.9 -8.6 2.2 -14.5 -3.9M14.9 84.9c4.9 -3.1 9.9 1.7 16.4 -5.4M14.9 84.5c-3.0 -2.9 -5.8 2.1 -9.8 -2.7');
export const drawGlobe = (ctx, w, h, dpr, L, p, clock, dt, st, kick) => {
  const band = (a, b) => {
    let s = 0;
    for (let i = a; i < b; i++) s += L[i] || 0;
    return s / (b - a);
  };
  const lo = band(0, 8);
  const all = band(0, 24);
  const cx = w / 2;
  const cy = h * 0.5;
  const R = h * 0.27 * (1 + lo * 0.05);
  // The things inside: glitter flakes and a few feathers, in the globe's own
  // units (-1..1), kept between frames.
  if (!st.globe) {
    const bits = [];
    for (let i = 0; i < 70; i++) {
      const a = hash(i * 1.3) * Math.PI * 2;
      const r = Math.sqrt(hash(i * 2.7)) * 0.85;
      bits.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.6 + 0.35, vx: 0, vy: 0, s: 0.5 + hash(i * 5.1), k: i % 3 });
    }
    const feathers = [];
    // Nine feathers of a few sizes, spread through the lower half to start.
    for (let i = 0; i < 9; i++) {
      const a = hash(i * 4.7) * Math.PI;
      const r = 0.25 + hash(i * 6.1) * 0.55;
      feathers.push({
        x: Math.cos(a) * r,
        y: Math.sin(a) * r * 0.8,
        vx: 0,
        vy: 0,
        a: hash(i * 9.3) * 6,
        va: 0,
        s: 0.7 + hash(i * 3.9) * 0.55,
      });
    }
    st.globe = { bits, feathers };
  }
  const G = st.globe;
  G.rings = G.rings || [];
  if (kick) G.rings.push({ born: clock, amp: 0.4 + all });
  if (kick) {
    // A shake: everything is thrown up and round, harder when it's loud.
    const force = 0.7 + all * 1.1;
    for (const b of G.bits) {
      b.vx += (hash(b.x * 91 + clock) - 0.5) * force * 1.2 + -b.y * 0.4;
      b.vy -= (0.6 + hash(b.y * 57 + clock)) * force;
    }
    for (const f of G.feathers) {
      f.vx += (hash(f.x * 33 + clock) - 0.5) * force * 0.6;
      f.vy -= (0.3 + hash(f.y * 21 + clock) * 0.4) * force;
      f.va += (hash(f.a + clock) - 0.5) * 6;
    }
  }
  const step = Math.min(0.05, dt || 0.016);
  const move = (o, fall, drag) => {
    o.vy += fall * step;
    o.vx *= 1 - drag * step;
    o.vy *= 1 - drag * step;
    o.x += o.vx * step;
    o.y += o.vy * step;
    // Stay inside the glass, sliding along it.
    const d = Math.hypot(o.x, o.y);
    if (d > 0.9) {
      o.x *= 0.9 / d;
      o.y *= 0.9 / d;
      const n = (o.vx * o.x + o.vy * o.y) / 0.9;
      o.vx -= (n * o.x) / 0.9;
      o.vy -= (n * o.y) / 0.9;
    }
  };
  for (const b of G.bits) move(b, 1.5, 2.2);
  for (const f of G.feathers) {
    move(f, 0.6, 2.8);
    f.vx += Math.sin(clock * 1.7 + f.a) * 0.05 * step * 20;
    f.va *= 1 - 2 * step;
    f.a += (f.va + Math.sin(clock + f.x * 3) * 0.6) * step;
  }
  ctx.save();
  // Rippling pulses: a soft ring spreads out from the ball on every beat,
  // further and brighter when the music is louder, and fades as it goes.
  const LIFE = 1.6;
  G.rings = G.rings.filter((q) => clock - q.born < LIFE);
  for (const q of G.rings) {
    const t = (clock - q.born) / LIFE;
    const ease = 1 - (1 - t) ** 2;
    const rr = R * (1.1 + ease * (1.6 + 1.6 * q.amp));
    const alpha = (1 - t) ** 1.5 * Math.min(1, q.amp);
    ctx.save();
    ctx.globalAlpha = alpha * 0.8;
    ctx.strokeStyle = p.glow || '#cfc3f2';
    ctx.shadowColor = p.glow || '#cfc3f2';
    ctx.shadowBlur = 8 * dpr;
    ctx.lineWidth = (2.5 - 1.5 * t) * dpr;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rr * 1.35, rr, 0, 0, Math.PI * 2);
    ctx.stroke();
    // A fainter echo just inside it.
    ctx.globalAlpha = alpha * 0.35;
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rr * 1.35 * 0.88, rr * 0.88, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  // Curved blades cradle the ball like folded wings: they rise from under it
  // and wrap up its sides in layers, thickest low down and tapering to soft
  // points. The layered ones sit behind; two small layers in front hold it
  // from below. They breathe gently, and open a touch with the bass.
  const hold = 1 + Math.sin(clock * 0.8) * 0.03 + lo * 0.05;
  const blade = (a0, span, ro, thick, col, flare = 0) => {
    const pt = (a, rad) => [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
    const sp = span * hold;
    const N = 32;
    ctx.beginPath();
    // flare: how far the tip sweeps out, like a feather lifting at its end.
    const rad = (t) => ro + flare * t ** 2.5;
    for (let j = 0; j <= N; j++) {
      const [x, y] = pt(a0 + (sp * j) / N, rad(j / N));
      if (j) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    for (let j = N; j >= 0; j--) {
      const t = j / N;
      const [x, y] = pt(a0 + sp * t, rad(t) + thick * Math.sin(Math.PI * (0.2 + 0.8 * t)) ** 0.7);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.shadowColor = 'rgba(40, 30, 90, 0.45)';
    ctx.shadowBlur = 5 * dpr;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(190, 180, 235, 0.9)';
    ctx.lineWidth = 0.8 * dpr;
    ctx.stroke();
  };
  const DOWN = Math.PI / 2;
  // Layered like a wing on each side: the outer layers longest, each one in
  // front a little shorter and closer to the glass, every tip lifting out.
  const LAYERS = [
    [0.1, 2.75, 1.3, 0.24, '#dcd8f0', 0.28],
    [0.16, 2.5, 1.18, 0.24, '#e6e3f5', 0.22],
    [0.22, 2.2, 1.05, 0.24, '#f0eef9', 0.16],
  ];
  for (const [off, span, ro, th, col, fl] of LAYERS) {
    blade(DOWN + off, span, R * ro, R * th, col, R * fl);
    blade(DOWN - off, -span, R * ro, R * th, col, R * fl);
  }
  // The glass ball.
  ctx.shadowColor = p.glow || '#cfc3f2';
  ctx.shadowBlur = (10 + 14 * lo) * dpr;
  const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
  g.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  g.addColorStop(0.6, 'rgba(228, 222, 250, 0.75)');
  g.addColorStop(1, 'rgba(176, 190, 245, 0.85)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Inside the glass.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.97, 0, Math.PI * 2);
  ctx.clip();
  const cols = [p.glow || '#f0b0dc', '#9d8cf0', '#ffffff'];
  for (const b of G.bits) {
    const x = cx + b.x * R;
    const y = cy + b.y * R;
    const tw = 0.55 + 0.45 * Math.sin(clock * 6 + b.s * 20);
    ctx.globalAlpha = tw;
    ctx.fillStyle = cols[b.k];
    const r = b.s * 1.3 * dpr;
    if (b.k === 2) {
      // A tiny four-point sparkle, with a faint violet edge so it shows on the glass.
      ctx.shadowColor = 'rgba(120, 100, 220, 0.8)';
      ctx.shadowBlur = 2 * dpr;
      ctx.beginPath();
      ctx.moveTo(x, y - r * 2.2);
      ctx.lineTo(x + r * 0.5, y);
      ctx.lineTo(x, y + r * 2.2);
      ctx.lineTo(x - r * 0.5, y);
      ctx.closePath();
      ctx.moveTo(x - r * 2.2, y);
      ctx.lineTo(x, y + r * 0.5);
      ctx.lineTo(x + r * 2.2, y);
      ctx.lineTo(x, y - r * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  if (FEATHER) {
    for (const f of G.feathers) {
      ctx.save();
      ctx.translate(cx + f.x * R, cy + f.y * R);
      ctx.rotate(f.a);
      // The feather is drawn about 40 x 100; centre it and size it to the ball.
      const sc = (R / 60) * 0.4 * f.s;
      ctx.scale(sc, sc);
      ctx.translate(-22, -50);
      // Soft and fluffy: a blurred body, then the fine barbs with a white glow.
      // (A soft violet glow, so the white shows on the pale glass.)
      ctx.fillStyle = 'rgba(250, 249, 255, 0.85)';
      ctx.shadowColor = 'rgba(130, 110, 215, 0.7)';
      ctx.shadowBlur = 3 * dpr;
      ctx.fill(FEATHER);
      ctx.shadowColor = 'rgba(130, 110, 215, 0.55)';
      ctx.shadowBlur = 1.5 * dpr;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.6;
      ctx.stroke(FEATHER_BARBS);
      ctx.lineWidth = 1.6;
      ctx.stroke(FEATHER_SHAFT);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }
  ctx.restore();
  // Glass: a soft rim, a bright highlight and a little reflection.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 1.2 * dpr;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  ctx.ellipse(cx - R * 0.42, cy - R * 0.45, R * 0.24, R * 0.12, -0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.ellipse(cx + R * 0.5, cy + R * 0.5, R * 0.1, R * 0.05, -0.7, 0, Math.PI * 2);
  ctx.fill();
  // The two small blades in front, holding it from below, and the star on top.
  blade(DOWN + 0.05, 1.5, R * 0.9, R * 0.2, '#f6f5fc', R * 0.1);
  blade(DOWN - 0.05, -1.5, R * 0.9, R * 0.2, '#f6f5fc', R * 0.1);
  blade(DOWN + 0.12, 1.05, R * 0.98, R * 0.16, '#fbfaff', R * 0.08);
  blade(DOWN - 0.12, -1.05, R * 0.98, R * 0.16, '#fbfaff', R * 0.08);
  // A layered satin bow tied where the blades meet underneath, covering the
  // gap: lavender loops spread like a butterfly over crimson ribbons crossing
  // behind, and a silver four-point star charm hanging from a ring.
  {
    const bx = cx;
    const by = cy + R * 1.12;
    const k = R * 0.44;
    const swing = Math.sin(clock * 1.2) * 0.05;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(swing);
    ctx.lineJoin = 'round';
    const edge = (c) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = 0.7 * dpr;
      ctx.stroke();
    };
    const satin = (x0, y0, x1, y1, a, b, c) => {
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, a);
      g.addColorStop(0.5, b);
      g.addColorStop(1, c);
      return g;
    };
    ctx.shadowColor = 'rgba(20, 10, 40, 0.5)';
    ctx.shadowBlur = 4 * dpr;
    ctx.shadowOffsetY = 1 * dpr;
    // Crimson ribbon behind: one band crossing up-left to down-right, and one
    // hanging down, each with a square-cut end.
    const band = (x0, y0, x1, y1, wd) => {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const L = Math.hypot(dx, dy) || 1;
      const nx = (-dy / L) * wd;
      const ny = (dx / L) * wd;
      ctx.beginPath();
      ctx.moveTo(x0 + nx, y0 + ny);
      ctx.lineTo(x1 + nx, y1 + ny);
      ctx.lineTo(x1 - nx, y1 - ny);
      ctx.lineTo(x0 - nx, y0 - ny);
      ctx.closePath();
      ctx.fillStyle = satin(x0, y0, x1, y1, '#8f1236', '#d42f5c', '#9e1640');
      ctx.fill();
      edge('rgba(90, 10, 35, 0.7)');
    };
    // Crimson ribbons crossing behind in an X, with square-cut ends.
    band(-k * 1.6, -k * 0.95, k * 1.6, k * 0.95, k * 0.18);
    band(k * 1.55, -k * 0.85, -k * 1.5, k * 1.05, k * 0.18);
    // The bow spreads like a butterfly: two big upper loops angled up and out,
    // two smaller lower loops angled down and out, all from one knot, so the
    // whole bow reads as an X. Each loop has a satin sheen and a fold line.
    const loop = (ang, w, hgt, cols) => {
      ctx.save();
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(w * 0.35, -hgt, w * 1.05, -hgt * 0.95, w, 0);
      ctx.bezierCurveTo(w * 1.02, hgt * 0.7, w * 0.4, hgt * 0.75, 0, 0);
      ctx.closePath();
      ctx.fillStyle = satin(0, -hgt, w, hgt, ...cols);
      ctx.fill();
      edge('rgba(120, 95, 190, 0.85)');
      ctx.save();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 0.8 * dpr;
      ctx.beginPath();
      ctx.moveTo(w * 0.2, -hgt * 0.15);
      ctx.quadraticCurveTo(w * 0.6, -hgt * 0.7, w * 0.9, -hgt * 0.3);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(120, 95, 190, 0.55)';
      ctx.beginPath();
      ctx.moveTo(w * 0.22, hgt * 0.12);
      ctx.quadraticCurveTo(w * 0.6, hgt * 0.15, w * 0.88, hgt * 0.3);
      ctx.stroke();
      ctx.restore();
      ctx.restore();
    };
    const BACK = ['#a68ce2', '#cbb9f5', '#b49de8'];
    const FRONT = ['#c9b6f2', '#ebe3fd', '#c3aef0'];
    // Lower wings first (behind), then the upper ones over them.
    loop(0.6, k * 1.25, k * 0.55, BACK);
    loop(Math.PI - 0.6, k * 1.25, k * 0.55, BACK);
    loop(-0.42, k * 1.65, k * 0.7, BACK);
    loop(Math.PI + 0.42, k * 1.65, k * 0.7, BACK);
    loop(-0.32, k * 1.15, k * 0.5, FRONT);
    loop(Math.PI + 0.32, k * 1.15, k * 0.5, FRONT);
    // The knot, with a silver ring.
    ctx.fillStyle = satin(-k * 0.3, -k * 0.3, k * 0.3, k * 0.3, '#b49de8', '#ddd1fa', '#a991e4');
    ctx.beginPath();
    ctx.ellipse(0, 0, k * 0.27, k * 0.33, 0, 0, Math.PI * 2);
    ctx.fill();
    edge('rgba(120, 95, 190, 0.85)');
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#d9dde4';
    ctx.lineWidth = 1.4 * dpr;
    ctx.beginPath();
    ctx.ellipse(0, -k * 0.05, k * 0.2, k * 0.17, 0, 0, Math.PI * 2);
    ctx.stroke();
    // The silver star charm, hanging off the ring and swaying a touch more.
    ctx.save();
    ctx.translate(0, k * 0.12);
    ctx.rotate(Math.sin(clock * 1.6) * 0.12 - swing);
    const sy = k * 0.62;
    const sr = k * 0.42;
    ctx.strokeStyle = '#c7ccd6';
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, sy - sr);
    ctx.stroke();
    ctx.shadowColor = 'rgba(20, 10, 40, 0.5)';
    ctx.shadowBlur = 3 * dpr;
    ctx.beginPath();
    for (let q = 0; q < 8; q++) {
      const a = (q * Math.PI) / 4 - Math.PI / 2;
      const rr = q % 2 ? sr * 0.3 : sr;
      const x = Math.cos(a) * rr;
      const y = sy + Math.sin(a) * rr;
      if (q) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = satin(-sr, sy - sr, sr, sy + sr, '#f4f6fa', '#aeb4c0', '#e2e5ec');
    ctx.fill();
    ctx.shadowColor = 'transparent';
    edge('rgba(110, 115, 130, 0.9)');
    // Facets: lines from the centre to each point.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 0.6 * dpr;
    ctx.beginPath();
    for (let q = 0; q < 4; q++) {
      const a = (q * Math.PI) / 2 - Math.PI / 2;
      ctx.moveTo(0, sy);
      ctx.lineTo(Math.cos(a) * sr, sy + Math.sin(a) * sr);
    }
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  }
  const sp = [cx, cy - R * 1.3];
  const sr = R * (0.32 + 0.1 * band(16, 24));
  const sg = ctx.createLinearGradient(sp[0] - sr, sp[1] - sr, sp[0] + sr, sp[1] + sr);
  sg.addColorStop(0, '#7b5cff');
  sg.addColorStop(1, '#ff4f9a');
  ctx.fillStyle = sg;
  ctx.shadowColor = '#ff4f9a';
  ctx.shadowBlur = (4 + 8 * lo) * dpr;
  ctx.beginPath();
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4 - Math.PI / 2;
    const rr = k % 2 ? sr * 0.3 : sr;
    const x = sp[0] + Math.cos(a) * rr;
    const y = sp[1] + Math.sin(a) * rr;
    if (k) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

// A dry-brush stroke along a centre line: pressed and solid at the start, then
// splitting into bristles that each run out of ink at their own point, some
// breaking into dashes near the tail. pt(t) gives [x, y, nx, ny] (point and
// normal); reach (0..1) is how far the brush has travelled so far.
const dryStroke = (ctx, pt, width, seed, reach = 1, bristles = 6) => {
  if (reach <= 0 || width <= 0) return;
  const SEG = 14;
  // One tapered ribbon of a bristle, from a to b along the stroke.
  const ribbon = (off, bw, a, b, end) => {
    const left = [];
    const right = [];
    for (let k = 0; k <= SEG; k++) {
      const t = a + ((b - a) * k) / SEG;
      const [x, y, nx, ny] = pt(t);
      // Full width through the body, thinning to a point where the ink runs out.
      const r = (bw / 2) * Math.pow(Math.max(0, 1 - t / end), 0.45) * (1 - t * 0.25);
      const o = off * (0.8 + 0.2 * (1 - t));
      left.push([x + nx * (o + r), y + ny * (o + r)]);
      right.push([x + nx * (o - r), y + ny * (o - r)]);
    }
    ctx.beginPath();
    ctx.moveTo(left[0][0], left[0][1]);
    for (const [x, y] of left) ctx.lineTo(x, y);
    for (let k = right.length - 1; k >= 0; k--) ctx.lineTo(right[k][0], right[k][1]);
    ctx.closePath();
    ctx.fill();
  };
  for (let j = 0; j < bristles; j++) {
    const r1 = hash(seed * 13.1 + j * 7.7);
    const r2 = hash(seed * 5.3 + j * 3.1);
    const r3 = hash(seed * 2.9 + j * 11.3);
    const edge = Math.abs(j / (bristles - 1) - 0.5) * 2;
    const off = (j / (bristles - 1) - 0.5) * width * 0.8;
    const bw = (width / bristles) * (1.2 + r1 * 0.9);
    // Outer bristles run dry first.
    const end = 1 - r2 * 0.45 * (0.35 + edge);
    const stop = Math.min(reach, end);
    // Some bristles skip once near the tail, leaving a dry gap.
    const gap = r3 < 0.5 ? end * (0.62 + r3 * 0.4) : 2;
    if (gap < stop) {
      ribbon(off, bw, 0, gap, end);
      const g2 = gap + 0.04 + r1 * 0.05;
      if (g2 < stop) ribbon(off, bw, g2, stop, end);
    } else ribbon(off, bw, 0, stop, end);
  }
  // The pressed head.
  const [hx, hy] = pt(0.02);
  ctx.beginPath();
  ctx.ellipse(hx, hy, width * 0.46, width * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
};
// The pulse line at beat b: flat at the edges of each beat, a smooth swell of
// waves in the middle. Each beat has its own number of waves and height, and
// some stretches of four beats stay quiet, so it rests flat, then rolls.
const smooth = (x) => x * x * (3 - 2 * x);

// What kind of song it is, guessed from its name and album (or picked by the
// reader): how much energy it has, how many waves fit in a beat, and how often
// the line rests.
export const MOODS = {
  calm: { label: 'Calm', energy: 0.55, waves: [1, 2], rest: 0.35 },
  steady: { label: 'Steady', energy: 0.8, waves: [1.5, 3], rest: 0.22 },
  lively: { label: 'Lively', energy: 1, waves: [2, 3.5], rest: 0.15 },
  intense: { label: 'Intense', energy: 1.2, waves: [2.5, 4.5], rest: 0.08 },
};
// Gentle words win over everything (a "Crimson Lullaby" is still a lullaby).
const SOFT = /lullaby|acoustic|stripped|piano|nursery|\bsleep/i;
const INTENSE =
  /battle|boss|beast|chaos|fury|furyon|action|turbo|bite|\bexe\b|fight|duel|danger|storm|rampage|hunt|clash|prophecy|gambit|limbo|evil|enem|doom|chimera|perish|burning|crimson|panic|frontier|showdown|attack|golden mecha|resist|riot|混沌|狂|斗|危险|械尸|绝命|烈拳/i;
const CALM =
  /afternoon|\btea\b|relax|morning|letters|\bnight\b|\brain\b|gentle|memor|flora|blossom|farewell|\bempty\b|quiet|\bpeace\b|afterglow|the sea|until we meet|years of stars|fading|\bdew\b|serene|悠闲|静谧|岁岁|漫行|晓|絵本|闲|慢/i;
const LIVELY =
  /feat\.|party|holiday|summer|weekend|groove|dance|play on|link up|tango|\bpop\b|cheer|festival|vacation|angel|heartbeat|stars|wonderland|shining|battery|thump|champion|round and round|magical|frequency|whatever|夏日|派对|喵/i;
export const guessMood = (song) => {
  // An instrumental version goes by the song it comes from.
  const name = (song?.name ?? '').replace(/\s*[(（]?(instrumental|伴奏)[)）]?/gi, '');
  const text = `${name} ${song?.album ?? ''}`;
  if (SOFT.test(text)) return 'calm';
  if (INTENSE.test(text)) return 'intense';
  if (CALM.test(text)) return 'calm';
  // A single's songs share its name: the instrumental of a sung single stays lively.
  if (LIVELY.test(text) || (song?.album && name.startsWith(song.album) && song.album.length > 3 && !/hyper|极限|mix/i.test(song.album)))
    return 'lively';
  return 'steady';
};

// Where in the song: builds up over the opening, swells and settles through
// the middle, and fades over the last few seconds. p is 0..1 (or null).
const shapeOf = (p) => {
  if (p == null || !Number.isFinite(p)) return 1;
  const intro = smooth(Math.min(1, p / 0.1));
  const outro = smooth(Math.min(1, (1 - p) / 0.07));
  const swell = 0.88 + 0.12 * Math.sin(p * Math.PI * 6 - 1);
  return (0.45 + 0.55 * intro) * (0.35 + 0.65 * outro) * swell;
};

const wave = (b, mood = MOODS.steady) => {
  const k = Math.floor(b);
  const p = b - k;
  const phrase = Math.floor(k / 4);
  // About one stretch in five rests, never two in a row.
  const rests = (n) => hash(n + 900) < mood.rest;
  const quiet = rests(phrase) && !rests(phrase - 1);
  const height = (quiet ? 0.12 : 0.55 + 0.45 * hash(k + 300)) * (k % 4 === 0 ? 1 : 0.8);
  const [lo, hi] = mood.waves;
  const waves = lo + Math.floor(hash(k + 500) * (hi - lo + 1) * 2) / 2;
  // Rest flat for the first and last part of the beat; swell in between.
  const a = 0.12 + 0.1 * hash(k + 700);
  const e = p < a || p > 1 - a ? 0 : Math.sin((Math.PI * (p - a)) / (1 - 2 * a));
  return height * smooth(e) * Math.sin(TAU * waves * p + hash(k) * 2);
};

// How strong beat k is: downbeats strong, the rest varied.
const strength = (k) => (k % 4 === 0 ? 0.9 + 0.1 * hash(k) : 0.45 + 0.4 * hash(k));

/**
 * Drives the bars (span elements in `barsRef`) or the pulse line (a canvas in
 * `canvasRef`) at `bpm` while `playing`. Writes transforms and pixels straight
 * to the page, so React doesn't redraw anything each frame.
 */
export function useBeatEngine({ barsRef, canvasRef, viz, bpm, playing, mood = 'steady', progress, live = null }) {
  const s = useRef({ clock: 0, beat0: 0, at: 0, bpm, levels: [], last: 0, shape: 1, polled: 0 });
  s.current.mood = MOODS[mood] ?? MOODS.steady;
  s.current.progress = progress;
  // With reduced motion asked for, the bars rest and the line stays still.
  const still = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  // Listen mode: an AnalyserNode on the microphone. While it's on, the bars
  // show what it hears (even with the player paused).
  s.current.live = live;
  s.current.playing = (playing || !!live) && !still;

  // A new tempo carries on from the current beat, so nothing jumps.
  useEffect(() => {
    const st = s.current;
    st.beat0 = st.beat0 + (st.clock - st.at) * (st.bpm / 60);
    st.at = st.clock;
    st.bpm = bpm;
  }, [bpm]);

  useEffect(() => {
    const st = s.current;
    let raf = 0;
    st.last = performance.now();
    const beatAt = (t) => st.beat0 + (t - st.at) * (st.bpm / 60);

    // Live levels: n bands spread on a log scale from 40 Hz to 16 kHz, each the
    // loudest bin in its band (the analyser already maps -85..-25 dB to 0..255).
    const liveLevels = (n) => {
      const an = st.live;
      if (!an) return null;
      if (!st.bins || st.bins.length !== an.frequencyBinCount) st.bins = new Uint8Array(an.frequencyBinCount);
      an.getByteFrequencyData(st.bins);
      const hz = an.context.sampleRate / 2 / an.frequencyBinCount;
      const out = [];
      for (let i = 0; i < n; i++) {
        const f0 = 40 * Math.pow(400, i / n);
        const f1 = 40 * Math.pow(400, (i + 1) / n);
        let a = Math.floor(f0 / hz);
        const b = Math.max(a + 1, Math.ceil(f1 / hz));
        let m = 0;
        for (; a < b && a < st.bins.length; a++) m = Math.max(m, st.bins[a]);
        out.push(0.04 + 0.96 * Math.pow(m / 255, 1.4));
      }
      return out;
    };

    // Each bar's level this frame: live when listening, else the beat's guess.
    // Rises fast and falls back slowly, like a real meter; peaks hold, then drop.
    const levels = (n, dt) => {
      const live = liveLevels(n);
      const b = beatAt(st.clock);
      const k = Math.floor(b);
      const since = (b - k) * (60 / st.bpm);
      const kick = st.playing ? strength(k) * Math.exp(-since / ((60 / st.bpm) * 0.32)) * Math.min(1.2, st.energy) : 0;
      let moving = false;
      if (!st.peaks) st.peaks = [];
      for (let i = 0; i < n; i++) {
        const f = i / (n - 1);
        const t = st.clock;
        const shimmer = 0.5 + 0.5 * (0.6 * Math.sin(t * (2.1 + 3.7 * hash(i)) + i) + 0.4 * Math.sin(t * (5.3 + 4.1 * hash(i + 40)) + 2 * i));
        const target = live
          ? live[i]
          : st.playing
            ? Math.min(
                1,
                0.08 +
                  0.85 * kick * (0.35 + 0.65 * (1 - f)) * (0.65 + 0.6 * hash(i * 7 + k)) +
                  0.45 * shimmer * (0.4 + 0.6 * f) * (0.45 + 0.55 * kick) * Math.min(1.1, 0.4 + 0.6 * st.energy),
              )
            : 0.1;
        const cur = st.levels[i] ?? 0.1;
        const rate = target > cur ? (live ? 30 : 22) : live ? 8 : 5;
        const next = cur + (target - cur) * Math.min(1, rate * dt);
        st.levels[i] = next;
        if (Math.abs(next - target) > 0.002) moving = true;
        // Peak caps: jump to a new high, hang a moment, then fall.
        const pk = st.peaks[i] ?? { v: 0.1, hold: 0 };
        if (next >= pk.v) {
          pk.v = next;
          pk.hold = 0.5;
        } else if ((pk.hold -= dt) <= 0) pk.v = Math.max(next, pk.v - 0.9 * dt);
        if (pk.v - next > 0.002) moving = true;
        st.peaks[i] = pk;
      }
      return moving;
    };

    const drawBars = (dt) => {
      const bars = barsRef.current ? [...barsRef.current.children] : [];
      const n = bars.length;
      if (!n) return false;
      const moving = levels(n, dt);
      bars.forEach((el, i) => {
        el.style.transform = `scaleY(${st.levels[i].toFixed(3)})`;
      });
      // Styles that flicker (Illusion) pick this up from the page.
      const fl = st.flicker ? '1' : '';
      if (barsRef.current.dataset.flicker !== fl) barsRef.current.dataset.flicker = fl;
      return st.playing || moving;
    };

    // Colours for the canvas styles come from the page: --pulse-color, a
    // left-to-right gradient in --pulse-stops, and a glow.
    const paint = (c, ctx, w) => {
      const cs = getComputedStyle(c);
      const color = cs.getPropertyValue('--pulse-color').trim() || '#7fd35a';
      const stops = cs
        .getPropertyValue('--pulse-stops')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean);
      let fill = color;
      let tip = color;
      if (stops.length > 1) {
        const g = ctx.createLinearGradient(0, 0, w, 0);
        stops.forEach((col, i) => g.addColorStop(i / (stops.length - 1), col));
        fill = g;
        tip = stops[stops.length - 1];
      }
      // A style can flicker to another colour for a moment now and then
      // (Illusion: Daffodill's blue breaking through Zankou's reds).
      const flicker = cs.getPropertyValue('--pulse-flicker').trim();
      if (flicker && st.flicker) return { fill: flicker, tip: flicker, glow: flicker, blur: 12 };
      return {
        fill,
        tip,
        glow: cs.getPropertyValue('--pulse-glow').trim(),
        blur: parseFloat(cs.getPropertyValue('--pulse-blur')) || 8,
      };
    };
    const canvasOf = () => {
      const c = canvasRef.current;
      if (!c) return null;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(c.clientWidth * dpr);
      const h = Math.round(c.clientHeight * dpr);
      if (!w || !h) return null;
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      const ctx = c.getContext('2d');
      ctx.clearRect(0, 0, w, h);
      return { c, ctx, w, h, dpr };
    };
    const glowStroke = (ctx, p, width, dpr) => {
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = p.fill;
      ctx.globalAlpha = 0.22;
      ctx.lineWidth = width * 3.3 * dpr;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.lineWidth = width * dpr;
      if (p.glow) {
        ctx.shadowColor = p.glow;
        ctx.shadowBlur = p.blur * dpr;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    };
    const lift = () => Math.min(1.15, st.energy);

    // Pulse line: each wave lasts a beat and a half, five across the width.
    // Points sit at fixed places along the song, not the screen, so the line
    // slides smoothly instead of shimmering at the peaks.
    const drawPulse = () => {
      const k = canvasOf();
      if (!k) return st.playing;
      const { c, ctx, w, h, dpr } = k;
      const unit = 1.5;
      const span = 5;
      const base = h * 0.55;
      const amp = h * 0.42 * lift();
      const u = beatAt(st.clock) / unit;
      const du = span / (w / (3 * dpr));
      ctx.beginPath();
      let first = true;
      for (let v = Math.floor((u - span) / du) * du; v <= u + du; v += du) {
        const x = w - ((u - v) / span) * w;
        const y = base - amp * wave(v, st.mood);
        if (first) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        first = false;
      }
      const p = paint(c, ctx, w);
      glowStroke(ctx, p, 2.4, dpr);
      ctx.fillStyle = p.tip;
      ctx.beginPath();
      ctx.arc(w - 3 * dpr, base - amp * wave(u, st.mood), 3 * dpr, 0, TAU);
      ctx.fill();
      return st.playing;
    };

    // Wave: a filled sound wave, mirrored around the middle, swelling in
    // place. The middle takes the beat; the edges ripple.
    const drawWave = (dt) => {
      const k = canvasOf();
      if (!k) return st.playing;
      const { c, ctx, w, h, dpr } = k;
      const n = 64;
      const b = beatAt(st.clock);
      const kb = Math.floor(b);
      const since = (b - kb) * (60 / st.bpm);
      const kick = st.playing ? strength(kb) * Math.exp(-since / ((60 / st.bpm) * 0.4)) * lift() : 0;
      st.wave = st.wave ?? [];
      let moving = false;
      const lv = [];
      for (let i = 0; i < n; i++) {
        const f = i / (n - 1);
        const mid = Math.sin(Math.PI * f);
        const t = st.clock;
        // Ripples at several sizes, so the edge looks like sound rather than a smooth hump.
        const ripple =
          0.5 +
          0.5 * (0.45 * Math.sin(t * 2.3 + f * 23) + 0.35 * Math.sin(t * 4.1 - f * 41 + hash(i) * 6) + 0.2 * Math.sin(t * 6.7 + f * 67));
        const target = st.playing
          ? mid ** 0.7 * (0.12 + 0.55 * kick * (0.6 + 0.4 * mid) + 0.5 * ripple * (0.45 + 0.55 * lift()))
          : 0.04 * mid;
        const cur = st.wave[i] ?? 0.04;
        const next = cur + (target - cur) * Math.min(1, (target > cur ? 14 : 4) * dt);
        if (Math.abs(next - target) > 0.002) moving = true;
        st.wave[i] = next;
        lv.push(next);
      }
      const mid = h / 2;
      const half = h * 0.48;
      const xs = (i) => (i / (n - 1)) * w;
      // A smooth outline through the points, top edge then the mirrored bottom.
      const edge = (sign) => {
        ctx.moveTo(xs(0), mid - sign * lv[0] * half);
        for (let i = 1; i < n; i++) {
          const xm = (xs(i - 1) + xs(i)) / 2;
          const ym = mid - sign * ((lv[i - 1] + lv[i]) / 2) * half;
          ctx.quadraticCurveTo(xs(i - 1), mid - sign * lv[i - 1] * half, xm, ym);
        }
        ctx.lineTo(xs(n - 1), mid - sign * lv[n - 1] * half);
      };
      const p = paint(c, ctx, w);
      ctx.beginPath();
      edge(1);
      for (let i = n - 1; i >= 0; i--) ctx.lineTo(xs(i), mid + lv[i] * half);
      ctx.closePath();
      ctx.fillStyle = p.fill;
      ctx.globalAlpha = 0.35;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      edge(1);
      glowStroke(ctx, p, 1.8, dpr);
      ctx.beginPath();
      edge(-1);
      glowStroke(ctx, p, 1.8, dpr);
      return st.playing || moving;
    };

    // Ripples: a ring spreads out from the middle on every beat and fades,
    // stronger beats making brighter, wider rings.
    const drawRipples = () => {
      const k = canvasOf();
      if (!k) return st.playing;
      const { c, ctx, w, h, dpr } = k;
      const beatSec = 60 / st.bpm;
      const b = beatAt(st.clock);
      const kb = Math.floor(b);
      st.rings = st.rings ?? [];
      if (st.playing && kb !== st.lastRing) {
        st.lastRing = kb;
        st.rings.push({ born: st.clock - (b - kb) * beatSec, s: strength(kb) * lift() });
      }
      const life = beatSec * 3.2;
      st.rings = st.rings.filter((r) => st.clock - r.born < life);
      const p = paint(c, ctx, w);
      const cx = w / 2;
      const cy = h * 0.5;
      ctx.lineCap = 'round';
      for (const r of st.rings) {
        const a = (st.clock - r.born) / life;
        const e = 1 - (1 - a) ** 3;
        ctx.beginPath();
        ctx.ellipse(cx, cy, w * (0.04 + 0.44 * e), h * (0.06 + 0.4 * e), 0, 0, TAU);
        ctx.strokeStyle = p.fill;
        ctx.globalAlpha = Math.max(0, (1 - a) ** 1.6 * Math.min(1, r.s));
        ctx.lineWidth = (0.8 + 2.4 * (1 - a)) * dpr;
        if (p.glow) {
          ctx.shadowColor = p.glow;
          ctx.shadowBlur = p.blur * dpr;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;
      // A glowing core that throbs on the beat.
      const since = (b - kb) * beatSec;
      const throb = st.playing ? Math.exp(-since / (beatSec * 0.35)) * strength(kb) * lift() : 0;
      ctx.beginPath();
      ctx.ellipse(cx, cy, (6 + 10 * throb) * dpr, (2.5 + 4 * throb) * dpr, 0, 0, TAU);
      ctx.fillStyle = p.tip;
      ctx.globalAlpha = 0.55 + 0.45 * throb;
      ctx.fill();
      ctx.globalAlpha = 1;
      return st.playing;
    };

    // One sakura petal pointing up from (0, 0): rounded sides and a notched tip.
    const petal = (ctx, L, W) => {
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-W * 0.95, -L * 0.3, -W * 0.8, -L * 0.92, -W * 0.24, -L);
      ctx.lineTo(0, -L * 0.84);
      ctx.lineTo(W * 0.24, -L);
      ctx.bezierCurveTo(W * 0.8, -L * 0.92, W * 0.95, -L * 0.3, 0, 0);
      ctx.closePath();
    };

    // Bloom: a five-petal flower outline that turns slowly and swells on each
    // beat, shedding petals that drift off and fall (more on the downbeat).
    const drawBloom = (dt) => {
      const k = canvasOf();
      if (!k) return st.playing;
      const { c, ctx, w, h, dpr } = k;
      const beatSec = 60 / st.bpm;
      const b = beatAt(st.clock);
      const kb = Math.floor(b);
      const since = (b - kb) * beatSec;
      const throb = st.playing ? Math.exp(-since / (beatSec * 0.4)) * strength(kb) * lift() : 0;
      if (st.playing) st.spin = (st.spin ?? 0) + dt * 0.22;
      const spin = st.spin ?? 0;
      const cx = w / 2;
      const cy = h * 0.5;
      const R = Math.min(h * 0.4, w * 0.22) * (0.84 + 0.2 * throb);
      st.petals = st.petals ?? [];
      if (st.playing && kb !== st.lastBloom) {
        st.lastBloom = kb;
        const n = kb % 4 === 0 ? 4 : 1 + Math.round(hash(kb + 40));
        for (let i = 0; i < n; i++) {
          const r = (j) => hash(kb * 13 + i * 7 + j);
          st.petals.push({
            born: st.clock,
            a: spin + (i / n) * TAU + r(1) * 1.2,
            v: (0.35 + 0.4 * r(2)) * w * 0.5,
            rot: r(3) * TAU,
            turn: (r(4) - 0.5) * 5,
            size: R * (0.22 + 0.14 * r(5)),
            s: Math.min(1, 0.5 + strength(kb) * lift() * 0.6),
          });
        }
      }
      const life = beatSec * 4;
      st.petals = st.petals.filter((q) => st.clock - q.born < life);
      const p = paint(c, ctx, w);

      // Falling petals, behind the flower.
      for (const q of st.petals) {
        const t = st.clock - q.born;
        const a = t / life;
        const x = cx + Math.cos(q.a) * q.v * t * (1 - 0.35 * a) + Math.sin(t * 2.4 + q.rot) * 6 * dpr;
        const y = cy + Math.sin(q.a) * q.v * t * 0.45 + h * 0.5 * a * a;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(q.rot + q.turn * t);
        ctx.beginPath();
        petal(ctx, q.size, q.size * 0.62);
        ctx.fillStyle = p.fill;
        ctx.globalAlpha = (1 - a) ** 1.4 * q.s * 0.85;
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // The flower: a soft fill under a glowing outline.
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(spin);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.rotate((i * TAU) / 5);
        petal(ctx, R, R * 0.58);
        ctx.restore();
      }
      ctx.fillStyle = p.fill;
      ctx.globalAlpha = 0.1 + 0.18 * throb;
      ctx.fill();
      ctx.globalAlpha = 1;
      glowStroke(ctx, p, 1.4 + 0.8 * throb, dpr);
      // Stamens: short strokes out from the middle, ending in dots.
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const an = ((i + 0.5) * TAU) / 5;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(an) * R * 0.32, Math.sin(an) * R * 0.32);
      }
      glowStroke(ctx, p, 0.9, dpr);
      ctx.fillStyle = p.tip;
      for (let i = 0; i < 5; i++) {
        const an = ((i + 0.5) * TAU) / 5;
        ctx.beginPath();
        ctx.arc(Math.cos(an) * R * 0.34, Math.sin(an) * R * 0.34, (1.4 + throb) * dpr, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      // A glowing heart that throbs on the beat.
      ctx.beginPath();
      ctx.arc(cx, cy, (2.5 + 4 * throb) * dpr, 0, TAU);
      ctx.fillStyle = p.tip;
      ctx.globalAlpha = 0.6 + 0.4 * throb;
      ctx.fill();
      ctx.globalAlpha = 1;
      return st.playing || st.petals.length > 0;
    };

    // A four-point sparkle (Sunbringer's star) centred on (0, 0).
    const sparkle = (ctx, r) => {
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(r * 0.14, -r * 0.14, r, 0);
      ctx.quadraticCurveTo(r * 0.14, r * 0.14, 0, r);
      ctx.quadraticCurveTo(-r * 0.14, r * 0.14, -r, 0);
      ctx.quadraticCurveTo(-r * 0.14, -r * 0.14, 0, -r);
      ctx.closePath();
    };

    // Embers: a row of flames along the bottom that leap on each beat, with
    // sparks drifting up; every fourth beat they flare (Emberburst) and throw
    // a burst of sparkles.
    const drawEmbers = (dt) => {
      const k = canvasOf();
      if (!k) return st.playing;
      const { c, ctx, w, h, dpr } = k;
      const p = paint(c, ctx, w);
      const beatSec = 60 / st.bpm;
      const b = beatAt(st.clock);
      const kb = Math.floor(b);
      const since = (b - kb) * beatSec;
      const kick = st.playing ? Math.exp(-since / (beatSec * 0.38)) * strength(kb) * lift() : 0;
      const burst = st.playing && kb % 4 === 0 ? Math.exp(-since / (beatSec * 0.7)) : 0;
      st.sparks = st.sparks ?? [];
      if (st.playing && kb !== st.lastEmber) {
        st.lastEmber = kb;
        const n = kb % 4 === 0 ? 7 : 2 + Math.round(hash(kb + 9) * 2);
        for (let i = 0; i < n; i++) {
          const r = (j) => hash(kb * 17 + i * 5 + j);
          st.sparks.push({
            born: st.clock,
            x: (0.08 + 0.84 * r(1)) * w,
            vy: (0.45 + 0.5 * r(2)) * h,
            sway: (r(3) - 0.5) * 30 * dpr,
            size: (kb % 4 === 0 ? 3.5 : 2.2) * dpr * (0.7 + 0.6 * r(4)),
            star: kb % 4 === 0 || r(5) > 0.6,
          });
        }
      }
      const life = beatSec * 3;
      st.sparks = st.sparks.filter((q) => st.clock - q.born < life);

      // Flames: each tongue a soft teardrop that sways and leaps with the kick.
      const N = 19;
      const base = h * 0.98;
      for (let layer = 0; layer < 2; layer++) {
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const f = i / (N - 1);
          const x = (0.04 + 0.92 * f) * w;
          const t = st.clock;
          const flick = 0.5 + 0.5 * Math.sin(t * (5 + 3 * hash(i)) + i * 1.7);
          const centre = 1 - Math.abs(f - 0.5) * 1.1;
          const tall =
            h * (0.3 + 0.16 * flick * (st.playing ? 1 : 0.3) + (0.45 * kick + 0.3 * burst) * centre * (0.6 + 0.5 * hash(i + kb)));
          const hgt = layer ? tall * 0.55 : tall;
          const half = (w / N) * (layer ? 0.24 : 0.42);
          const lean = Math.sin(t * 2.3 + i) * half * 0.5;
          // Round at the bottom, curling to a sharp tip that leans with the sway.
          ctx.moveTo(x - half, base);
          ctx.bezierCurveTo(x - half * 1.1, base - hgt * 0.38, x + lean - half * 0.15, base - hgt * 0.62, x + lean * 1.4, base - hgt);
          ctx.bezierCurveTo(x + lean * 0.4 + half * 0.55, base - hgt * 0.55, x + half * 1.1, base - hgt * 0.35, x + half, base);
        }
        ctx.closePath();
        if (layer === 0) {
          ctx.fillStyle = p.fill;
          ctx.globalAlpha = 0.22 + 0.25 * kick + 0.2 * burst;
          ctx.fill();
          ctx.globalAlpha = 1;
          glowStroke(ctx, p, 1.1 + 0.6 * kick, dpr);
        } else {
          // The hot inner flames.
          ctx.fillStyle = p.tip;
          ctx.globalAlpha = 0.35 + 0.35 * kick + 0.3 * burst;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // Sparks and sparkles rising.
      for (const q of st.sparks) {
        const t = st.clock - q.born;
        const a = t / life;
        const x = q.x + Math.sin(t * 3 + q.x) * q.sway * a;
        const y = base - h * 0.15 - q.vy * t * (1 - 0.3 * a);
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = (1 - a) ** 1.3;
        ctx.fillStyle = q.star ? p.tip : p.fill;
        ctx.beginPath();
        if (q.star) sparkle(ctx, q.size * (1.6 + 0.6 * Math.sin(t * 9)));
        else ctx.arc(0, 0, q.size * 0.6, 0, TAU);
        if (p.glow) {
          ctx.shadowColor = p.glow;
          ctx.shadowBlur = 8 * dpr;
        }
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      return st.playing || st.sparks.length > 0;
    };

    // Spectrum styles, after audioMotion's looks: LED segments with peak caps,
    // mirrored bars with a reflection, a filled frequency curve, and a ring.
    const drawSpectrum = (kind, dt) => {
      const cv = canvasOf();
      if (!cv) return false;
      const { c, ctx, w, h, dpr } = cv;
      const n = kind === 'radial' ? 30 : kind === 'curve' ? 40 : kind === 'brush' || kind === 'wings' || kind === 'globe' ? 24 : 28;
      const moving = levels(n, dt);
      const p = paint(c, ctx, kind === 'radial' ? h : w);
      const L = st.levels;
      const P = st.peaks;
      ctx.fillStyle = p.fill;
      if (kind === 'led' || kind === 'mirror') {
        const gap = 3 * dpr;
        const bw = (w - gap * (n - 1)) / n;
        const base = kind === 'mirror' ? h * 0.62 : h;
        const top = kind === 'mirror' ? base : h;
        if (p.glow) {
          ctx.shadowColor = p.glow;
          ctx.shadowBlur = (p.blur * dpr) / 2;
        }
        for (let i = 0; i < n; i++) {
          const x = i * (bw + gap);
          if (kind === 'led') {
            // Stacked segments, lit up to the level; the peak cap above.
            const seg = 3 * dpr;
            const sgap = 1.5 * dpr;
            const rows = Math.floor(h / (seg + sgap));
            const lit = Math.round(L[i] * rows);
            for (let r = 0; r < lit; r++) ctx.fillRect(x, h - (r + 1) * (seg + sgap) + sgap, bw, seg);
            const pr = Math.round(P[i].v * rows);
            if (pr > lit) {
              ctx.globalAlpha = 0.9;
              ctx.fillStyle = p.tip;
              ctx.fillRect(x, h - pr * (seg + sgap) + sgap, bw, seg);
              ctx.fillStyle = p.fill;
              ctx.globalAlpha = 1;
            }
          } else {
            const bh = L[i] * top * 0.96;
            ctx.fillRect(x, base - bh, bw, bh);
            ctx.fillStyle = p.tip;
            ctx.fillRect(x, base - P[i].v * top * 0.96 - 2 * dpr, bw, 2 * dpr);
            ctx.fillStyle = p.fill;
            // The reflection below, fading out.
            ctx.save();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 0.28;
            ctx.fillRect(x, base + 2 * dpr, bw, bh * 0.55);
            ctx.restore();
          }
        }
        ctx.shadowBlur = 0;
      } else if (kind === 'globe') {
        // The snow globe gets a shake on every beat while music plays.
        const beatNow = Math.floor(beatAt(st.clock));
        const kick = st.playing && beatNow !== st.globeBeat;
        st.globeBeat = beatNow;
        drawGlobe(ctx, w, h, dpr, L, p, st.clock, dt, st, kick);
        return true;
      } else if (kind === 'wings') {
        drawWings(ctx, w, h, dpr, L, p, st.clock);
      } else if (kind === 'brush') {
        // Brush: calligraphy downstrokes. Each bar is pressed in at the top and
        // pulled down at a slight slant, splitting into dry bristles at its
        // tail, and on the beat the strongest strokes spatter ink off their tips.
        const gap = 5 * dpr;
        const bw = (w - gap * (n - 1)) / n;
        st.ink = st.ink ?? [];
        const beat = Math.floor(beatAt(st.clock));
        const fresh = st.playing && beat !== st.inkBeat;
        st.inkBeat = beat;
        // Which bars are loudest this beat: they spatter.
        const loud = fresh
          ? L.slice(0, n)
              .map((v, i) => [v, i])
              .sort((x, y) => y[0] - x[0])
              .slice(0, 3)
          : [];
        // All strokes share one slant, as from one hand; each varies a little.
        const SLANT = 0.32;
        for (let i = 0; i < n; i++) {
          // Every stroke hangs a good way down even when quiet, and reaches
          // the bottom of the strip on the loudest notes.
          // Each stroke has its own length, like a hand-made row.
          const bh = Math.min(h * 0.98, (0.6 + 0.4 * L[i]) * h * (0.75 + 0.35 * hash(i * 7.7)));
          const tilt = bh * (SLANT + (hash(i * 4.1) - 0.5) * 0.12);
          // Centred on its slot, so the slant doesn't push strokes off the edge.
          const cx = i * (bw + gap) + bw / 2 - tilt / 2;
          const bow = bw * 0.18 * (hash(i * 2.3) - 0.5);
          const pt = (t) => {
            const x = cx + t * tilt + Math.sin(t * Math.PI) * bow;
            const y = bw * 0.35 + t * (bh - bw * 0.35);
            const dx = tilt + Math.cos(t * Math.PI) * Math.PI * bow;
            const dy = bh - bw * 0.35;
            const len = Math.hypot(dx, dy) || 1;
            return [x, y, -dy / len, dx / len];
          };
          dryStroke(ctx, pt, bw * 0.78, i + 1, 1, 7);
          for (const [v, k] of loud) {
            if (k !== i || v < 0.2) continue;
            const [tx, ty] = pt(1);
            for (let d = 0; d < 3; d++) {
              const r = hash(beat * 3.3 + i * 1.7 + d * 9.1);
              st.ink.push({
                x: tx,
                y: ty,
                // Spattered out from where the stroke ends, then falling.
                vx: (((d % 2 ? 1 : -1) * (0.3 + r * 0.6) + SLANT * 0.5) * h) / dpr,
                vy: (-(0.35 + r * 0.5) * h) / dpr,
                r: (1 + r * 1.6) * dpr,
                born: st.clock,
              });
            }
          }
        }
        // Ink spatters off the tips and falls, fading.
        const life = 0.7;
        st.ink = st.ink.filter((q) => st.clock - q.born < life && q.y < h + 4 * dpr);
        ctx.fillStyle = p.tip;
        for (const q of st.ink) {
          q.vy += h * 3.2 * dt / dpr;
          q.x += q.vx * dt * dpr;
          q.y += q.vy * dt * dpr;
          ctx.globalAlpha = Math.max(0, 1 - (st.clock - q.born) / life);
          ctx.beginPath();
          ctx.ellipse(q.x, q.y, q.r, q.r * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = p.fill;
        if (st.ink.length) return true;
      } else if (kind === 'curve') {
        // A smooth line through the levels, filled underneath.
        const pts = L.slice(0, n).map((v, i) => [(i / (n - 1)) * w, h - v * h * 0.92]);
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < n; i++) {
          const [x0, y0] = pts[i - 1];
          const [x1, y1] = pts[i];
          ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
        }
        ctx.lineTo(w, pts[n - 1][1]);
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.globalAlpha = 0.35;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < n; i++) {
          const [x0, y0] = pts[i - 1];
          const [x1, y1] = pts[i];
          ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
        }
        ctx.lineTo(w, pts[n - 1][1]);
        glowStroke(ctx, p, 2.2, dpr);
      } else {
        // A ring of bars around the middle, mirrored left and right so low
        // notes sit at the bottom. It kicks on the beat: the ring swells, the
        // bars reach further and a glowing core flashes.
        const beatSec = 60 / st.bpm;
        const b = beatAt(st.clock);
        const kb = Math.floor(b);
        const kick = st.playing ? Math.exp(-((b - kb) * beatSec) / (beatSec * 0.3)) * strength(kb) * lift() : 0;
        const cx = w / 2;
        const cy = h / 2;
        const m = Math.min(w, h);
        const r0 = m * (0.16 + 0.03 * kick);
        const span = m * 0.3;
        // Glowing core.
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, r0 * 1.1);
        core.addColorStop(0, p.tip);
        core.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.globalAlpha = 0.25 + 0.55 * kick;
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(cx, cy, r0 * 1.1, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.lineCap = 'round';
        ctx.strokeStyle = p.fill;
        // Each side has n bars over half the circle, so keep them slim enough to stay apart.
        ctx.lineWidth = Math.max(2 * dpr, ((Math.PI * r0) / n) * 0.55);
        if (p.glow) {
          ctx.shadowColor = p.glow;
          ctx.shadowBlur = p.blur * dpr * (0.8 + kick);
        }
        for (let i = 0; i < n; i++) {
          const a = Math.PI / 2 + (i / n) * Math.PI;
          // Louder, with a floor so quiet bars still show, and a push on the beat.
          const lv = Math.min(1, 0.12 + L[i] * 1.25 + kick * 0.25);
          for (const side of [1, -1]) {
            const ang = Math.PI / 2 + side * (a - Math.PI / 2);
            const len = lv * span;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
            ctx.lineTo(cx + Math.cos(ang) * (r0 + len), cy + Math.sin(ang) * (r0 + len));
            ctx.stroke();
          }
        }
        // Peak dots riding just outside each bar.
        ctx.fillStyle = p.tip;
        for (let i = 0; i < n; i++) {
          const a = Math.PI / 2 + (i / n) * Math.PI;
          const pk = Math.min(1, 0.12 + P[i].v * 1.25) * span + 3 * dpr;
          for (const side of [1, -1]) {
            const ang = Math.PI / 2 + side * (a - Math.PI / 2);
            ctx.beginPath();
            ctx.arc(cx + Math.cos(ang) * (r0 + pk), cy + Math.sin(ang) * (r0 + pk), 1.3 * dpr, 0, TAU);
            ctx.fill();
          }
        }
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(cx, cy, r0 * 0.82, 0, TAU);
        ctx.lineWidth = (1.5 + 1.5 * kick) * dpr;
        ctx.strokeStyle = p.tip;
        ctx.globalAlpha = 0.6 + 0.4 * kick;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      return st.playing || moving;
    };

    const frame = (time) => {
      const dt = Math.min(0.05, (time - st.last) / 1000);
      st.last = time;
      // How far into the song, checked a few times a second; eased so changes glide.
      if (time - st.polled > 400) {
        st.polled = time;
        st.target = shapeOf(st.progress?.());
      }
      st.shape += ((st.target ?? 1) - st.shape) * Math.min(1, 2 * dt);
      st.energy = st.mood.energy * st.shape;
      if (st.playing) st.clock += dt;
      // Flicker: on about one beat in six, a stuttering moment just after the beat.
      {
        const b = beatAt(st.clock);
        const kb = Math.floor(b);
        const ph = b - kb;
        st.flicker = st.playing && hash(kb * 3.7 + 11) < 0.17 && ph > 0.08 && ph < 0.42 && Math.sin(st.clock * 70) > -0.2;
      }
      const keep =
        viz === 'pulse'
          ? drawPulse()
          : viz === 'wave'
            ? drawWave(dt)
            : viz === 'ripples'
              ? drawRipples()
              : viz === 'bloom'
                ? drawBloom(dt)
                : viz === 'embers'
                  ? drawEmbers(dt)
                  : SPECTRUM.has(viz)
                    ? drawSpectrum(viz, dt)
                    : drawBars(dt);
      // Keep going while playing, or until the bars have settled after a pause.
      raf = keep ? requestAnimationFrame(frame) : 0;
    };
    const start = () => {
      if (!raf) {
        st.last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    start();
    st.start = start;
    // Draw the still line once when paused, and on resize.
    const ro = new ResizeObserver(() => start());
    const el = viz === 'bars' ? barsRef.current : canvasRef.current;
    if (el) ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [viz, barsRef, canvasRef]);

  // Wake the engine when playback or listening starts or stops.
  useEffect(() => {
    s.current.start?.();
  }, [playing, live]);
}

/**
 * Listen mode: the microphone through an analyser, only while `on`. Returns
 * { analyser, error }. Nothing is recorded or sent anywhere; the sound only
 * feeds the bars, and the microphone is released when it's switched off.
 */
export function useMicAnalyser(on) {
  const [state, setState] = useState({ analyser: null, error: '' });
  useEffect(() => {
    if (!on) {
      setState({ analyser: null, error: '' });
      return undefined;
    }
    let stream = null;
    let ctx = null;
    let gone = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        });
        if (gone) return stream.getTracks().forEach((t) => t.stop());
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        const an = ctx.createAnalyser();
        an.fftSize = 4096;
        an.smoothingTimeConstant = 0.55;
        an.minDecibels = -85;
        an.maxDecibels = -25;
        ctx.createMediaStreamSource(stream).connect(an);
        setState({ analyser: an, error: '' });
      } catch (e) {
        setState({
          analyser: null,
          error:
            e?.name === 'NotAllowedError'
              ? 'Microphone access was blocked. Allow it in your browser’s site settings to listen.'
              : e?.message === 'unsupported'
                ? 'This browser can’t listen through the microphone.'
                : 'No microphone found.',
        });
      }
    })();
    return () => {
      gone = true;
      stream?.getTracks().forEach((t) => t.stop());
      ctx?.close();
    };
  }, [on]);
  return state;
}
