// Reads the code from a team or build image saved from this site: first the
// note inside the PNG file (lib/pngText.js, exact), else the QR code in the
// picture (re-shared or re-saved images drop the note). Read on the device;
// the picture isn't uploaded or kept. Ported from the ZZZ site.
import { readCode } from './pngText.js';
import { parseQrText } from './qr.js';

// QR reading: the browser's own BarcodeDetector where there is one, else jsQR
// (Apache 2.0), loaded from the CDN the first time it's needed.
const JSQR = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
let jsqrLoading = null;
const loadJsQR = () =>
  window.jsQR
    ? Promise.resolve(window.jsQR)
    : (jsqrLoading ??= new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = JSQR;
        s.onload = () => resolve(window.jsQR);
        s.onerror = () => {
          jsqrLoading = null;
          reject(new Error('qr'));
        };
        document.head.appendChild(s);
      }));

/** Part of the picture (fractions of its width and height), scaled so QR squares are a few pixels each. */
function cropped(bitmap, [x0, y0, x1, y1]) {
  const w = bitmap.width * (x1 - x0);
  const h = bitmap.height * (y1 - y0);
  const k = Math.min(2, 1600 / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.round(w * k);
  c.height = Math.round(h * k);
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(bitmap, bitmap.width * x0, bitmap.height * y0, w, h, 0, 0, c.width, c.height);
  return ctx.getImageData(0, 0, c.width, c.height);
}

async function readQR(bitmap) {
  if ('BarcodeDetector' in window) {
    try {
      const found = await new window.BarcodeDetector({ formats: ['qr_code'] }).detect(bitmap);
      if (found[0]?.rawValue) return found[0].rawValue;
    } catch {
      /* fall back to jsQR */
    }
  }
  const jsQR = await loadJsQR().catch(() => null);
  if (!jsQR) throw new Error('Couldn’t load the QR reader. Check your connection and try again.');
  // Team images: bottom right. Build images: top right (wide) or bottom right (Instagram).
  for (const area of [[0.55, 0.55, 1, 1], [0.5, 0, 1, 0.3], [0, 0, 1, 1]]) {
    const img = cropped(bitmap, area);
    const r = jsQR(img.data, img.width, img.height);
    if (r?.data) return r.data;
  }
  return null;
}

/** { kind: 'team'|'console', code, exact } or null when the picture has no site code. */
export async function readImageCode(file) {
  const note = await readCode(file).catch(() => null);
  const fromNote = parseQrText(note);
  if (fromNote) return { ...fromNote, exact: true };
  const bitmap = await createImageBitmap(file);
  try {
    const text = await readQR(bitmap);
    const parsed = parseQrText(text);
    return parsed ? { ...parsed, exact: false } : null;
  } finally {
    bitmap.close?.();
  }
}
