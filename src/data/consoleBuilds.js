// Suggested Console builds: a starting point for each character, not a
// community-tested build. Layouts were found by an exhaustive search over each
// character's grid (see data/console.js) that fills all 20 cells, reaches the
// chosen Cartridge set's 4-piece bonus, then uses as many modules of the
// character's bonus Type as possible. There is one per Cartridge set. Stats come from recommendStats() in buildProfiles.js;
// values are left blank because they depend on your Cartridge's rolls.

import { CHARACTER_BY_ID } from './characters.js';
import { CHARACTER_CONSOLE, SHAPE_ORDER } from './console.js';
import { cartridgesFor } from './gear.js';
import { recommendStats } from './buildProfiles.js';

// Best layout per grid, bonus module Type and Cartridge set.
// Key: 'layout:type:set'. Value: 3 characters per module = shape index (hex,
// in SHAPE_ORDER) + row + column of its top-left.
const LAYOUTS = {
  'A:2:crimson-twin-butterflies': '010012114020022030132133134040',
  'A:2:devils-blood-curse': '010012114020022030132133134040',
  'A:2:diabolos': '010012114020022030132133134040',
  'A:2:fireflies-and-the-forest': '010012114020022030032134040042',
  'A:2:kingdoms-guard': '010012114020622230733240',
  'A:2:lost-radiance': '010012114020022030032134040042',
  'A:2:quiet-manor': '010012114020022030032134040042',
  'A:2:shadow-creed': '010012114020022030032134040042',
  'A:2:speedy-hedgehog': '010012114020622430631733',
  'A:2:street-boxer': '010012114020022030032134040042',
  'A:2:theas-night-tavern': '010012114220323230134240',
  'A:2:tiny-big-adventure': '010012114020022030032134040042',
  'A:3:crimson-twin-butterflies': '010212220323324230240',
  'A:3:devils-blood-curse': '010212320321322323324',
  'A:3:diabolos': '010212220523530731733',
  'A:3:fireflies-and-the-forest': '010212220323324430631',
  'A:3:kingdoms-guard': '010212220323324230240',
  'A:3:lost-radiance': '010212220623430631433',
  'A:3:quiet-manor': '010012114020522530633241',
  'A:3:shadow-creed': '010012114020522530633241',
  'A:3:speedy-hedgehog': '010212220523430631733',
  'A:3:street-boxer': '010212220323324230240',
  'A:3:theas-night-tavern': '010212220323324230240',
  'A:3:tiny-big-adventure': '010012114020522530633241',
  'B:3:crimson-twin-butterflies': '000303304210220231241',
  'B:3:devils-blood-curse': '000303304510312321732',
  'B:3:diabolos': '000303304510711531732',
  'B:3:fireflies-and-the-forest': '000303304210220431632',
  'B:3:kingdoms-guard': '000303304210220231241',
  'B:3:lost-radiance': '000303304410611431632',
  'B:3:quiet-manor': '000003010012713220231241',
  'B:3:shadow-creed': '000003010012713220231241',
  'B:3:speedy-hedgehog': '000303304410611431632',
  'B:3:street-boxer': '000303304210220231241',
  'B:3:theas-night-tavern': '000303304210220231241',
  'B:3:tiny-big-adventure': '000003010012713220231241',
  'C:2:crimson-twin-butterflies': '000002010012020023131132133134',
  'C:2:devils-blood-curse': '000002010012020023131132133134',
  'C:2:diabolos': '000002010012020023131132133134',
  'C:2:fireflies-and-the-forest': '000002010012020023031033041043',
  'C:2:kingdoms-guard': '000002010012620323324731',
  'C:2:lost-radiance': '000002010012020023031033041043',
  'C:2:quiet-manor': '000002010012020023031033041043',
  'C:2:shadow-creed': '000002010012020023031033041043',
  'C:2:speedy-hedgehog': '000002010012620523731733',
  'C:2:street-boxer': '000002010012020023031033041043',
  'C:2:theas-night-tavern': '000002110011313321324432',
  'C:2:tiny-big-adventure': '000002010012020023031033041043',
  'C:3:crimson-twin-butterflies': '100201211620323324731',
  'C:3:devils-blood-curse': '000502510313321324432',
  'C:3:diabolos': '000502510413321532733',
  'C:3:fireflies-and-the-forest': '000502510313321324432',
  'C:3:kingdoms-guard': '000602210620323324731',
  'C:3:lost-radiance': '000502510413321432633',
  'C:3:quiet-manor': '000002010012620323324731',
  'C:3:shadow-creed': '000002010012620323324731',
  'C:3:speedy-hedgehog': '000502510413321432633',
  'C:3:street-boxer': '000602210620323324731',
  'C:3:theas-night-tavern': '000502510313321324432',
  'C:3:tiny-big-adventure': '000002010012620323324731',
  'D:3:crimson-twin-butterflies': '201703210220124530241',
  'D:3:devils-blood-curse': '001503210314320521241',
  'D:3:diabolos': '001503510711314530241',
  'D:3:fireflies-and-the-forest': '301202310512314730042',
  'D:3:kingdoms-guard': '001503210314220530241',
  'D:3:lost-radiance': '401602904910521241',
  'D:3:quiet-manor': '001003010012314220530241',
  'D:3:shadow-creed': '001003010012314220530241',
  'D:3:speedy-hedgehog': '001503410611314530241',
  'D:3:street-boxer': '001503210314220530241',
  'D:3:theas-night-tavern': '001503210314220530241',
  'D:3:tiny-big-adventure': '001003010012314220530241',
};

// Layouts for one character and set, used instead of the shared search result.
// Exe + Diabolos: the in-game layout the project owner marked as best (Nov 2026):
// Hen2, ZhiJiao2, ZhiJiao4, Shu2, Hen4, ZhiJiao1, ZhiJiao3 (4 Type III, Diabolos x4).
const CHARACTER_LAYOUTS = {
  'exe:diabolos': '000510702104821431632',
};

const decodeLayout = (str) =>
  (str.match(/.{3}/g) ?? []).map(([sh, r, col]) => ({ shape: SHAPE_ORDER[parseInt(sh, 16)], r: Number(r), c: Number(col) }));

/**
 * Suggested build for a character and Cartridge set (defaults to their
 * recommended set): { id, name, suggested, cartridge, pieces, cartStats } or null.
 */
export function suggestedBuild(characterId, cartridgeId) {
  const c = CHARACTER_BY_ID[characterId];
  const info = CHARACTER_CONSOLE[characterId];
  if (!c || !info) return null;
  const cartridge = cartridgeId || cartridgesFor(c)[0];
  const layout = CHARACTER_LAYOUTS[`${characterId}:${cartridge}`] ?? LAYOUTS[`${info.layout}:${info.spec.type}:${cartridge}`];
  if (!layout) return null;
  return {
    id: `suggested-${characterId}-${cartridge}`,
    name: 'Suggested build',
    suggested: true,
    cartridge,
    pieces: decodeLayout(layout),
    cartStats: suggestedCartStats(c, cartridge),
  };
}

/** Suggested Cartridge main + sub stats for a character and set (values left at 0). */
export function suggestedCartStats(c, cartridgeId = null) {
  const st = recommendStats(c, cartridgeId);
  return {
    main: { stat: st.main, value: 0 },
    subs: st.subs.map((stat) => ({ stat, value: 0 })),
  };
}
