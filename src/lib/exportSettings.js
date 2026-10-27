// Options shared by every exported image (team images and the character,
// build, farming and Arc cards). Kept apart from the drawing code so the
// export dialog can show its choices straight away, while the heavier canvas
// code (teamCard.js, buildCard.js, guideCard.js, farmCard.js,
// characterCard.js) loads only when an image is actually made.

/** Team image layouts: 'row' is the wide 1x4 card (16:9), 'grid' and 'side' are 2x2. */
export const TEAM_LAYOUTS = [
  { id: 'row', label: '1 × 4', hint: 'Wide' },
  { id: 'grid', label: '2 × 2', hint: 'Tall' },
  { id: 'side', label: '2 × 2', hint: 'Side by side' },
];

/** Cards the Export card button on a character's page can offer, in picker order. */
export const CHARACTER_CARDS = {
  build: { id: 'build', label: 'Build', title: 'Build image', suffix: 'nte-build' },
  farming: { id: 'farming', label: 'Farming', title: 'Farming list image', suffix: 'nte-farming-list' },
  guide: { id: 'guide', label: 'Guide', title: 'Build guide image', suffix: 'nte-build-guide' },
  teams: { id: 'teams', label: 'Teams', title: 'Character teams image', suffix: 'nte-teams' },
};

/** Default pixel scale for exports (HD). */
export const EXPORT_SCALE = 2;
/** Export sizes: the same layout at 1×, 2× or 3× the pixels. */
export const EXPORT_SIZES = [
  { scale: 1, label: 'Standard', hint: '1×' },
  { scale: 2, label: 'HD', hint: '2×' },
  { scale: 3, label: 'Max', hint: '3×' },
];

/** A finished canvas as a PNG file, for saving, copying or sharing. */
export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
