// Portrait backdrops for the export cards: the character's element colour
// plus a faded pattern that matches their Arc type, like the Arc list banners.
//   Solid: crystal sheen · Liquid: gloss and bubbles · Gas: wind haze
//   Plasma: fine filaments · Condensate: rings
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

// Patterns in the style of the Arc list banners (Arcs page), as flat line
// work drawn onto a separate layer that is then faded and masked out of the
// middle, so the character always reads first.
const TYPE_PATTERNS = {
  // Crystal facets: broad sheen bands at a few angles
  solid(ctx, rand, x, y, w, h) {
    const band = (ang, at, width, a) => {
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(ang);
      const d = Math.hypot(w, h);
      ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
      ctx.fillRect(-d / 2 + at * d, -d / 2, width * d, d);
      ctx.restore();
    };
    band(-0.78, 0.0, 0.16, 0.5);
    band(-0.78, 0.38, 0.12, 0.3);
    band(0.84, 0.58, 0.12, 0.35);
    band(-1.2, 0.74, 0.08, 0.3);
    band(0.4, 0.86, 0.06, 0.25);
  },
  // Water: glossy highlight from the top and a few soft bubbles
  liquid(ctx, rand, x, y, w, h) {
    const u = Math.max(w, h);
    const g = ctx.createRadialGradient(x + w / 2, y - h * 0.25, 0, x + w / 2, y - h * 0.25, u * 0.7);
    g.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
    g.addColorStop(0.6, 'rgba(255, 255, 255, 0.18)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    for (const [px, py] of spots(rand, x, y, w, h, 14)) {
      const r = u * (0.02 + rand() ** 2 * 0.07);
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(1.5, r * 0.1);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.stroke();
    }
  },
  // Wind: soft white haze clouds
  gas(ctx, rand, x, y, w, h) {
    const u = Math.max(w, h);
    for (const [cx, cy, rx] of [[0.12, 0.7, 0.42], [0.52, 0.08, 0.38], [0.92, 0.85, 0.45], [0.95, 0.25, 0.3], [0.05, 0.15, 0.3]]) {
      const g = ctx.createRadialGradient(x + cx * w, y + cy * h, 0, x + cx * w, y + cy * h, rx * u);
      g.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
    }
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const yy = y + h * (0.08 + i * 0.17 + rand() * 0.05);
      ctx.beginPath();
      ctx.moveTo(x - 10, yy);
      ctx.bezierCurveTo(x + w * 0.3, yy - h * 0.08, x + w * 0.6, yy + h * 0.08, x + w + 10, yy - h * 0.03);
      ctx.lineWidth = Math.max(1.5, u * 0.004);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.stroke();
    }
  },
  // Electric filaments: fine diagonal lines with a glow at one side
  plasma(ctx, rand, x, y, w, h) {
    const u = Math.max(w, h);
    const g = ctx.createRadialGradient(x + w, y + h / 2, 0, x + w, y + h / 2, u * 0.6);
    g.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    const step = u * 0.055;
    ctx.lineWidth = Math.max(1.2, u * 0.0035);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    for (let k = -h; k < w + h; k += step) {
      ctx.moveTo(x + k, y + h);
      ctx.lineTo(x + k + h * 0.53, y);
    }
    ctx.stroke();
  },
  // Rings radiating from one side
  condensate(ctx, rand, x, y, w, h) {
    const u = Math.max(w, h);
    const cx = x + w * 0.9;
    const cy = y + h * 0.5;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, u * 0.55);
    g.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.lineWidth = Math.max(1.5, u * 0.006);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    for (let r = u * 0.05; r < u * 1.1; r += u * 0.045) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  },
};

/**
 * Fills a rounded box with the element-coloured backdrop and a faded
 * Arc-type pattern. Draw the character portrait on top afterwards.
 */
export function drawPortraitBackdrop(ctx, { x, y, w, h, r = 22, color, arcType, seed = '' }) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.clip();
  // Base: element colour, deeper toward the corners
  ctx.fillStyle = '#16171c';
  ctx.fillRect(x, y, w, h);
  const glow = ctx.createRadialGradient(x + w / 2, y + h * 0.45, 10, x + w / 2, y + h / 2, Math.max(w, h) * 0.8);
  glow.addColorStop(0, hexA(color, 0.5));
  glow.addColorStop(0.6, hexA(color, 0.26));
  glow.addColorStop(1, hexA(color, 0.12));
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, w, h);

  const draw = TYPE_PATTERNS[String(arcType || '').toLowerCase()];
  if (draw && typeof document !== 'undefined') {
    // Pattern on its own layer at the card's pixel scale
    const t = ctx.getTransform();
    const k = Math.hypot(t.a, t.b) || 1;
    const layer = document.createElement('canvas');
    layer.width = Math.ceil(w * k);
    layer.height = Math.ceil(h * k);
    const lc = layer.getContext('2d');
    lc.scale(k, k);
    draw(lc, rng(`${seed}:${arcType}`), 0, 0, w, h);
    // Tint the white line work toward the element colour
    lc.globalCompositeOperation = 'source-atop';
    lc.fillStyle = hexA(color, 0.35);
    lc.fillRect(0, 0, w, h);
    // Fade it out of the middle, where the character is
    lc.globalCompositeOperation = 'destination-in';
    const m = lc.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.18, w / 2, h * 0.5, Math.max(w, h) * 0.72);
    m.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
    m.addColorStop(1, 'rgba(0, 0, 0, 1)');
    lc.fillStyle = m;
    lc.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.32;
    ctx.drawImage(layer, x, y, w, h);
    ctx.globalAlpha = 1;
  }
  // Soft dark halo right behind the character so they stand out
  const halo = ctx.createRadialGradient(x + w / 2, y + h * 0.55, 0, x + w / 2, y + h * 0.55, Math.max(w, h) * 0.55);
  halo.addColorStop(0, 'rgba(10, 11, 16, 0.28)');
  halo.addColorStop(1, 'rgba(10, 11, 16, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}
