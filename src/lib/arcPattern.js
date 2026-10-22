// Portrait backdrops for the export cards: the character's element colour
// plus a light pattern that matches their Arc type.
//   Liquid: bubbles · Gas: drifting swirls · Solid: crystal facets
//   Plasma: lightning · Condensate: frost stars
// Patterns are drawn by code (no images) and are the same every time for a
// character, so a card exported twice looks identical.

function rng(seed) {
  let s = 0;
  for (const ch of String(seed)) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  s = s || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

const hexA = (hex, a) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, '$&$&') : h.slice(0, 6), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

// Spots spread over the box, a little denser toward the edges where the
// character art doesn't cover them.
function spots(rand, x, y, w, h, n) {
  const out = [];
  for (let i = 0; i < n * 3 && out.length < n; i++) {
    const px = x + rand() * w;
    const py = y + rand() * h;
    const dx = (px - (x + w / 2)) / (w / 2);
    const dy = (py - (y + h / 2)) / (h / 2);
    const edge = Math.min(1, Math.hypot(dx, dy));
    if (rand() < 0.35 + edge * 0.65) out.push([px, py, edge]);
  }
  return out;
}

function bubbles(ctx, rand, x, y, w, h, col, u) {
  for (const [px, py] of spots(rand, x, y, w, h, 26)) {
    const r = u * (0.025 + rand() ** 2 * 0.09);
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fillStyle = hexA(col, 0.10);
    ctx.fill();
    ctx.lineWidth = Math.max(1.2, r * 0.09);
    ctx.strokeStyle = hexA(col, 0.55);
    ctx.stroke();
    // Shine
    ctx.beginPath();
    ctx.arc(px - r * 0.3, py - r * 0.3, r * 0.5, Math.PI * 1.05, Math.PI * 1.55);
    ctx.lineWidth = Math.max(1.2, r * 0.12);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.stroke();
  }
}

function swirls(ctx, rand, x, y, w, h, col, u) {
  ctx.lineCap = 'round';
  for (const [px, py] of spots(rand, x, y, w, h, 13)) {
    const r = u * (0.05 + rand() * 0.08);
    const turns = 1.4 + rand() * 0.8;
    const dir = rand() < 0.5 ? 1 : -1;
    const start = rand() * Math.PI * 2;
    ctx.beginPath();
    for (let t = 0; t <= 1.0001; t += 0.02) {
      const a = start + dir * t * turns * Math.PI * 2;
      const rr = r * (0.15 + t);
      const qx = px + Math.cos(a) * rr;
      const qy = py + Math.sin(a) * rr * 0.8;
      if (t === 0) ctx.moveTo(qx, qy); else ctx.lineTo(qx, qy);
    }
    // Trailing wisp off the swirl
    const a = start + dir * turns * Math.PI * 2;
    ctx.quadraticCurveTo(px + Math.cos(a) * r * 2.2, py + Math.sin(a) * r * 0.6, px + Math.cos(a) * r * 3.2 + r, py + Math.sin(a) * r * 1.2);
    ctx.lineWidth = Math.max(2, u * 0.009);
    ctx.strokeStyle = hexA(col, 0.7);
    ctx.stroke();
  }
  // Long drifting streams
  for (let i = 0; i < 5; i++) {
    const yy = y + h * (0.1 + rand() * 0.8);
    ctx.beginPath();
    ctx.moveTo(x - 10, yy);
    ctx.bezierCurveTo(x + w * 0.3, yy - h * 0.12 * (rand() - 0.5) * 2, x + w * 0.7, yy + h * 0.15 * (rand() - 0.5) * 2, x + w + 10, yy - h * 0.05);
    ctx.lineWidth = Math.max(1.2, u * 0.005);
    ctx.strokeStyle = hexA(col, 0.4);
    ctx.stroke();
  }
}

function crystals(ctx, rand, x, y, w, h, col, u) {
  ctx.lineJoin = 'round';
  for (const [px, py] of spots(rand, x, y, w, h, 16)) {
    const s = u * (0.04 + rand() * 0.09);
    const rot = (rand() - 0.5) * 0.9;
    const tall = 1.6 + rand() * 0.8;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rot);
    // Shard: a long hexagon with a centre facet line
    const pts = [[0, -s * tall], [s * 0.5, -s * 0.5], [s * 0.5, s * 0.7], [0, s * tall * 0.7], [-s * 0.5, s * 0.7], [-s * 0.5, -s * 0.5]];
    ctx.beginPath();
    pts.forEach(([a, b], i) => (i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)));
    ctx.closePath();
    ctx.fillStyle = hexA(col, 0.12);
    ctx.fill();
    ctx.lineWidth = Math.max(1.2, s * 0.06);
    ctx.strokeStyle = hexA(col, 0.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -s * tall);
    ctx.lineTo(0, s * tall * 0.7);
    ctx.moveTo(-s * 0.5, -s * 0.5);
    ctx.lineTo(0, -s * 0.15);
    ctx.lineTo(s * 0.5, -s * 0.5);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.stroke();
    ctx.restore();
  }
}

function lightning(ctx, rand, x, y, w, h, col, u) {
  ctx.lineJoin = 'miter';
  ctx.lineCap = 'round';
  const bolt = (sx, sy, len, ang, width, depth) => {
    let cx = sx;
    let cy = sy;
    const steps = 5 + Math.floor(rand() * 3);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    for (let i = 0; i < steps; i++) {
      const a = ang + (rand() - 0.5) * 1.2;
      cx += Math.cos(a) * (len / steps);
      cy += Math.sin(a) * (len / steps);
      ctx.lineTo(cx, cy);
      if (depth && rand() < 0.3) {
        ctx.stroke();
        bolt(cx, cy, len * 0.4, a + (rand() < 0.5 ? 0.7 : -0.7), width * 0.6, 0);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
      }
    }
    ctx.lineWidth = width * 3;
    ctx.strokeStyle = hexA(col, 0.25);
    ctx.stroke();
    ctx.lineWidth = width;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.stroke();
    ctx.lineWidth = width * 0.6;
    ctx.strokeStyle = hexA(col, 0.9);
    ctx.stroke();
  };
  for (const [px, py] of spots(rand, x, y, w, h, 10)) {
    bolt(px, py, u * (0.16 + rand() * 0.16), Math.PI / 2 + (rand() - 0.5) * 1.4, Math.max(2, u * 0.008), 1);
  }
  // Sparks
  for (const [px, py] of spots(rand, x, y, w, h, 22)) {
    const r = u * (0.004 + rand() * 0.008);
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fillStyle = hexA(col, 0.7);
    ctx.fill();
  }
}

function frost(ctx, rand, x, y, w, h, col, u) {
  ctx.lineCap = 'round';
  for (const [px, py] of spots(rand, x, y, w, h, 16)) {
    const r = u * (0.025 + rand() ** 2 * 0.07);
    const rot = rand() * Math.PI;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rot);
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      const ex = Math.cos(a) * r;
      const ey = Math.sin(a) * r;
      ctx.moveTo(0, 0);
      ctx.lineTo(ex, ey);
      // little branches
      for (const f of [0.5, 0.75]) {
        const bx = Math.cos(a) * r * f;
        const by = Math.sin(a) * r * f;
        const bl = r * 0.28 * (1.1 - f);
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(a + 0.8) * bl, by + Math.sin(a + 0.8) * bl);
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(a - 0.8) * bl, by + Math.sin(a - 0.8) * bl);
      }
    }
    ctx.lineWidth = Math.max(1.2, r * 0.08);
    ctx.strokeStyle = hexA(col, 0.6);
    ctx.stroke();
    ctx.restore();
  }
  // Fine frost dots
  for (const [px, py] of spots(rand, x, y, w, h, 30)) {
    ctx.beginPath();
    ctx.arc(px, py, u * (0.003 + rand() * 0.004), 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();
  }
}

const PATTERNS = { liquid: bubbles, gas: swirls, solid: crystals, plasma: lightning, condensate: frost };

/**
 * Fills a rounded box with the element-coloured backdrop and the Arc-type
 * pattern. Draw the character portrait on top afterwards.
 */
export function drawPortraitBackdrop(ctx, { x, y, w, h, r = 22, color, arcType, seed = '' }) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.clip();
  // Base: element colour fading to charcoal toward the corners
  ctx.fillStyle = '#16171c';
  ctx.fillRect(x, y, w, h);
  const glow = ctx.createRadialGradient(x + w / 2, y + h * 0.45, 10, x + w / 2, y + h / 2, Math.max(w, h) * 0.8);
  glow.addColorStop(0, hexA(color, 0.55));
  glow.addColorStop(0.55, hexA(color, 0.22));
  glow.addColorStop(1, hexA(color, 0.05));
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, w, h);
  const draw = PATTERNS[String(arcType || '').toLowerCase()];
  if (draw) draw(ctx, rng(`${seed}:${arcType}`), x, y, w, h, color, Math.max(w, h));
  ctx.restore();
}
