// Reads and writes a text note inside a PNG file (a tEXt chunk), so an exported
// team or build image carries its full code (the same text as its QR code): uploading the saved image gives the
// exact code back without reading the picture. Apps that re-save images (most
// social media) drop it; then the code is read from the picture instead.
const KEY = 'nte-team-builder-code';

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (bytes) => {
  let c = 0xffffffff;
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const u32 = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];

/** A copy of the PNG blob with the code stored in it (or the blob as it was). */
export async function withCode(blob, code) {
  if (!blob || !code) return blob;
  const png = new Uint8Array(await blob.arrayBuffer());
  const data = new TextEncoder().encode(`${KEY}\0${code}`);
  const type = new TextEncoder().encode('tEXt');
  const body = new Uint8Array([...type, ...data]);
  const chunk = new Uint8Array([...u32(data.length), ...body, ...u32(crc32(body))]);
  // After the IHDR chunk: 8-byte signature + 25-byte IHDR.
  const at = 33;
  const out = new Uint8Array(png.length + chunk.length);
  out.set(png.slice(0, at), 0);
  out.set(chunk, at);
  out.set(png.slice(at), at + chunk.length);
  return new Blob([out], { type: 'image/png' });
}

/** The code stored in a PNG file, or null. */
export async function readCode(file) {
  const png = new Uint8Array(await file.arrayBuffer());
  if (png[0] !== 0x89 || png[1] !== 0x50) return null;
  let p = 8;
  const dv = new DataView(png.buffer);
  while (p + 8 <= png.length) {
    const len = dv.getUint32(p);
    const type = String.fromCharCode(...png.slice(p + 4, p + 8));
    if (type === 'tEXt') {
      const text = new TextDecoder().decode(png.slice(p + 8, p + 8 + len));
      const [k, v] = text.split('\0');
      if (k === KEY && v) return v;
    }
    if (type === 'IDAT' || type === 'IEND') break;
    p += 12 + len;
  }
  return null;
}

