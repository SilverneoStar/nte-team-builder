// The site address and the project's own channels (not official NTE ones),
// printed small on export cards so people who see a shared image can find
// the builder. Facebook's share link isn't readable as text, so images carry
// the page name (SSN-Cortado) with the Facebook icon instead.

export const SITE = 'silverneostar.github.io/nte-team-builder';

const X_PATH =
  'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z';
const FB_PATH =
  'M13.5 21.9v-7.4h2.6l.4-3.1h-3V9.5c0-.9.3-1.5 1.6-1.5h1.6V5.2c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.3H7.9v3.1h2.6v7.4a10 10 0 1 1 3 0Z';
// A plain chat bubble, not the Discord logo (brand kit rule).
const BUBBLE_PATH = 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12Z';

// The site plus one pointer: the socials and news live in the site's footer,
// so cards don't need every handle (they changed and cluttered the cards).
export const LINKS = [
  { icon: 'web', text: SITE, main: true },
  { icon: 'chat', text: 'Socials & updates: see the site’s footer' },
];

/** Draws a 24-unit icon scaled to `size`, top-left at (x, y). */
function drawIcon(ctx, kind, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (kind === 'x') {
    ctx.fill(new Path2D(X_PATH));
  } else if (kind === 'fb') {
    ctx.fill(new Path2D(FB_PATH));
  } else if (kind === 'chat') {
    ctx.stroke(new Path2D(BUBBLE_PATH));
    for (const dx of [8.5, 12, 15.5]) {
      ctx.beginPath();
      ctx.arc(dx, 12, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Globe
    ctx.beginPath();
    ctx.arc(12, 12, 9, 0, Math.PI * 2);
    ctx.moveTo(3, 12);
    ctx.lineTo(21, 12);
    ctx.moveTo(12, 3);
    ctx.bezierCurveTo(7, 7, 7, 17, 12, 21);
    ctx.moveTo(12, 3);
    ctx.bezierCurveTo(17, 7, 17, 17, 12, 21);
    ctx.stroke();
  }
  ctx.restore();
}

function itemWidth(ctx, l, font, iconSize) {
  ctx.font = font;
  return iconSize + 6 + ctx.measureText(l.text).width;
}

/** Width drawLinksLine would use. */
export function measureLinksLine(ctx, { font, iconSize = 14, gap = 22 }) {
  return LINKS.reduce((a, l) => a + itemWidth(ctx, l, font, iconSize), 0) + gap * (LINKS.length - 1);
}

/**
 * One line: site · X · Discord. `align` 'left' starts at x, 'right' ends at x.
 * The site address uses `accent`; the rest use `color`. Returns the width.
 */
export function drawLinksLine(ctx, x, y, { font, color, accent, iconSize = 14, gap = 22, align = 'left' }) {
  const widths = LINKS.map((l) => itemWidth(ctx, l, font, iconSize));
  const total = widths.reduce((a, b) => a + b, 0) + gap * (LINKS.length - 1);
  let cx = align === 'right' ? x - total : x;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  LINKS.forEach((l, i) => {
    const c = l.main ? accent : color;
    drawIcon(ctx, l.icon, cx, y - iconSize + 2, iconSize, c);
    ctx.font = font;
    ctx.fillStyle = c;
    ctx.fillText(l.text, cx + iconSize + 6, y);
    cx += widths[i] + gap;
  });
  ctx.textAlign = prevAlign;
  return total;
}

/** Stacked rows (site first), baseline of the last row at `bottom`. Returns the block height. */
export function drawLinksBlock(ctx, x, bottom, { font, color, accent, iconSize = 16, rowH = 24 }) {
  const top = bottom - rowH * (LINKS.length - 1);
  LINKS.forEach((l, i) => {
    const y = top + i * rowH;
    const c = l.main ? accent : color;
    drawIcon(ctx, l.icon, x, y - iconSize + 3, iconSize, c);
    ctx.font = font;
    ctx.fillStyle = c;
    ctx.textAlign = 'left';
    ctx.fillText(l.text, x + iconSize + 8, y);
  });
  return rowH * (LINKS.length - 1) + iconSize;
}
