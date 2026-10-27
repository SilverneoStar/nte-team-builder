// Loads an image for canvas drawing. Resolves to null if it fails, so a
// missing file leaves a gap instead of breaking the whole export.
export function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
