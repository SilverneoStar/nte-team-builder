// QR codes on the team and build images. They carry the image's code
// ("NTE:" + a team code, "NTEC:" + a console code), so "Read a code from an
// image" on the site reads it exactly, even from a re-shared or cropped
// picture, and a phone camera gives text that can be pasted into the site.
// Letters, digits and ":" only, so the QR uses its compact alphanumeric mode.
// Encoder: lib/vendor/qrcode.js (Kazuhiko Arase, MIT). Ported from the ZZZ site.
import QRCode, { QRErrorCorrectLevel } from './vendor/qrcode.js';

export const QR_PREFIX = { team: 'NTE:', console: 'NTEC:' };
export const qrText = (kind, code) => `${QR_PREFIX[kind]}${code.replace(/-/g, '')}`;

/** { kind: 'team'|'console', code } from a QR's (or a PNG note's) text, or null. */
export function parseQrText(text) {
  const t = (text ?? '').trim();
  const m = t.match(/^(NTEC?):\s*([0-9A-Za-z-]+)$/i);
  if (!m) return null;
  return { kind: m[1].toUpperCase() === 'NTEC' ? 'console' : 'team', code: m[2].toUpperCase() };
}

/** A QR code for `text` in a white rounded box of `size` (quiet zone included), top-left at x, y. */
export function drawQR(ctx, text, x, y, size) {
  const q = new QRCode(-1, QRErrorCorrectLevel.L);
  q.addData(text);
  q.make();
  const n = q.getModuleCount();
  // Whole device pixels per module, so the squares stay crisp.
  const k = ctx.getTransform().a || 1;
  const m = Math.max(1, Math.floor((size * k) / (n + 4))) / k;
  const side = m * (n + 4);
  const ox = x + (size - side) / 2;
  const oy = y + (size - side) / 2;
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, 8);
  ctx.fill();
  ctx.fillStyle = '#111111';
  for (let r = 0; r < n; r += 1)
    for (let c = 0; c < n; c += 1) if (q.isDark(r, c)) ctx.fillRect(ox + (c + 2) * m, oy + (r + 2) * m, m, m);
  ctx.restore();
}
