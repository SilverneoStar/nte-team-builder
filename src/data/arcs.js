// Arcs (weapons). Max-level base ATK and secondary stat.
// Sources (Oct 2026): neverness.gg Arc list (type, rarity, stats) and Icy Veins
// weapon pages for Arcs added after that list. `passive` is a short summary for
// cards; the full S-rank passive text lives in arcPassives.js.
// "signature" links an Arc to the character whose kit its passive is built
// around. Signatures cross-checked against GameWith's top pick per character.

const arc = (name, rarity, type, atk, sub, passive, signature = null) => ({
  id: name.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  name,
  rarity,
  type,
  atk,
  sub,
  passive,
  signature,
});

export const ARCS = [
  // S-rank
  arc('Blow up the Crowd', 'S', 'Solid', 512, 'ATK 27.5%', 'Raises ATK while off-field; Basic Attacks boost Psyche DMG.', 'haniel'),
  arc('Blushing Mirage', 'S', 'Condensate', 570, 'Crit Rate 24%', 'ATK +16%. After Ultimate, Cosmos DMG +30% and ignores 12% DEF for 20s.', 'shinku'),
  arc('Camellia Society', 'S', 'Condensate', 666, 'Crit Rate 12%', 'Crit DMG stacks as HP drops; triggers Silent Garden attacks.', 'baicang'),
  arc('Contemplative Cat', 'S', 'Gas', 512, 'Crit DMG 44%', 'Cosmos DMG rises with Fons held, up to 10 stacks.', 'chiz'),
  arc('Crime and Punishment', 'S', 'Gas', 570, 'Crit Rate 24%', 'Psyche DMG +20% and Cycle Intensity up. After Ultimate, team Crit DMG up.', 'blackbird'),
  arc('Day Off', 'S', 'Solid', 512, 'Charge Efficiency 33%', 'ATK up; Eclipse restores Ultimate Energy on kills. Free from the Eclipse side quest; built for Esper Zero.'),
  arc('Eternal Waltz', 'S', 'Condensate', 424, 'HP 41.25%', 'Max HP up; Mental DMG up after Ultimate.', 'fadia'),
  arc('Far Side of the Moon', 'S', 'Liquid', 570, 'Crit DMG 48%', 'Crit Rate +15%; Redirect Skill and Basic Attack DMG up, plus Lakshana DMG for 15s after a Redirect Skill.', 'akane'),
  arc('Fluff of Fearlessness', 'S', 'Solid', 512, 'Crit Rate 22%', 'ATK up for 10s after Ultimate.'),
  arc('Fluff of Ferocity', 'S', 'Condensate', 512, 'ATK 27.5%', 'Crit DMG stacks on critical hits, up to 10.'),
  arc('Fluff of Finesse', 'S', 'Gas', 512, 'ATK 27.5%', 'DMG up for 10s after a Critical Dodge, up to 3 stacks.'),
  arc('Fluff of Fleetness', 'S', 'Liquid', 512, 'Crit DMG 44%', 'ATK stacks each second on-field, up to 5.'),
  arc('Fluff of Fortitude', 'S', 'Plasma', 512, 'ATK 27.5%', 'DMG up; more against enemies below 50% HP.'),
  arc("Good Boy's Grand Adventure", 'S', 'Gas', 474, 'ATK 45%', 'Charge Efficiency and team ATK up after Ultimate.', 'sakiri'),
  arc("Hethereau's Keeper", 'S', 'Solid', 512, 'ATK 27.5%', 'ATK and Boss DMG up; summons Officer Whisker.'),
  arc('Marching Beyond Time', 'S', 'Solid', 570, 'Crit Rate 24%', 'ATK up; Wastetime stacks raise Ultimate Crit DMG.', 'hotori'),
  arc('Raging Flames', 'S', 'Plasma', 666, 'Crit DMG 24%', 'Stacking Redirect Skill DMG after Ultimate.', 'hathor'),
  arc('Ravenous Blade', 'S', 'Gas', 570, 'Crit Rate 24%', 'Crit Rate +16%; stacking Crit DMG when dealing Incantation DMG.', 'zankou'),
  arc('Ready-Ready', 'S', 'Plasma', 570, 'Crit Rate 24%', 'ATK and Basic Attack DMG up; Tiger Talismans add Boss DMG.', 'nanally'),
  arc('Reality Refuge', 'S', 'Solid', 570, 'ATK 30%', 'Anima DMG up; Attachment DMG doubled after Ultimate.', 'jiuyuan'),
  arc('Song of the Whale', 'S', 'Plasma', 512, 'ATK 27.5%', 'ATK and DMG vs Broken enemies up; heals on Broken kills.'),
  arc('Stellar Veil', 'S', 'Plasma', 512, 'ATK 27.5%', 'Psyche DMG up; Crit DMG stacks on Psyche hits.', 'aurelia'),
  arc('Tears Beneath the Mask', 'S', 'Gas', 512, 'ATK 27.5%', 'Ultimate debuffs enemies, lowering their DMG.'),
  arc('The Last Rose', 'S', 'Liquid', 570, 'Crit Rate 24%', 'ATK up; Chaos Thorn stacks build Crit DMG from DoT.', 'lacrimosa'),
  arc('The Rain That Shook the World', 'S', 'Solid', 512, 'Crit Rate 22%', 'Cosmos DMG up on Redirect Skill and Ultimate.', 'zero'),
  arc('The Wrong Gate', 'S', 'Liquid', 570, 'ATK 30%', 'Anima DMG up; healing boosts allies’ DMG.', 'iroi'),
  arc('Voice of the Voyager', 'S', 'Plasma', 570, 'Crit Rate 24%', 'Support Skill Crit DMG up; stacks Ultimate Crit DMG.', 'linko'),
  arc("What's Desired", 'S', 'Condensate', 570, 'Crit Rate 24%', 'Lakshana DMG up; Crit DMG up after Redirect Skill or Ultimate.', 'chaos'),
  arc('Your Happiness is Priceless', 'S', 'Solid', 512, 'DEF 38.5%', 'HP up; random heal or shield after Ultimate.'),
  arc('Youthful Fantasy', 'S', 'Liquid', 570, 'ATK 30%', 'Break Intensity up; summons Black Tome for Chaos DMG.', 'daffodill'),
  // A-rank
  arc('A Time Will Come', 'A', 'Condensate', 475, 'Crit Rate 20%', 'ATK, DEF and HP up with 3+ different Esper types in the team.'),
  arc('Call of the Twisted City', 'A', 'Liquid', 395, 'HP 37.5%', 'Healing Bonus up for 10s after Redirect Skill.'),
  arc('Clear Skies', 'A', 'Liquid', 475, 'ATK 25%', 'Anima DMG up for Redirect Skill and Ultimate.'),
  arc('Cosmos Daze, Wild Reverie', 'A', 'Gas', 475, 'ATK 25%', 'DMG up for 10s after Support Skill.'),
  arc('Drawn Blade', 'A', 'Plasma', 395, 'ATK 37.5%', 'Extra Incantation DMG on Parry Attacks.'),
  arc('Failing You, Heavy in My Heart', 'A', 'Gas', 475, 'Break Intensity 120', 'Basic Attacks build stacks that raise team ATK.'),
  arc('Mind Royale', 'A', 'Liquid', 555, 'Break Intensity 60', 'Redirect Skill restores Ultimate Energy.'),
  arc('Oraora!', 'A', 'Plasma', 395, 'ATK 37.5%', 'Basic Attack DMG stacks per hit, up to 10.'),
  arc('Shiny Days', 'A', 'Liquid', 475, 'ATK 25%', 'Break Intensity and DMG vs Broken enemies up.'),
  arc("The Fools' Spring", 'A', 'Condensate', 395, 'DEF 52.5%', 'ATK up while shielded.'),
  arc('The Forgotten', 'A', 'Solid', 475, 'HP 25%', 'ATK up above 50% HP; DEF up below it.'),
  arc('The Good, The Bad, The Bitter', 'A', 'Condensate', 475, 'HP 25%', 'DEF up for 10s after taking damage.'),
  arc('The Great Thief', 'A', 'Condensate', 475, 'Break Intensity 120', 'Break Intensity up for allies of the same Esper type.'),
  arc('Time Bandit', 'A', 'Solid', 475, 'HP 25%', 'Break Intensity up after Redirect Skill.'),
  arc('Umbrella', 'A', 'Condensate', 395, 'DEF 52.5%', 'HP and shield strength up above 50% HP.'),
  arc('Watch Your Heads!', 'A', 'Gas', 475, 'Crit DMG 40%', 'ATK and Lakshana DMG up vs Remora or Stain targets.'),
  // B-rank
  arc('Be Happy', 'B', 'Gas', 316, 'HP 30%', 'Restores HP when defeating enemies.'),
  arc('Dangerous Game', 'B', 'Condensate', 380, 'Break Intensity 96', 'Break Intensity up when reducing Break.'),
  arc('First Step to Success', 'B', 'Solid', 380, 'ATK 20%', 'ATK up for 10s after Redirect Skill.'),
  arc('Real Music', 'B', 'Liquid', 380, 'ATK 20%', 'Redirect Skill DMG up.'),
  arc('Us', 'B', 'Plasma', 380, 'ATK 20%', 'Basic Attack DMG up.'),
];

// Effects outside combat, such as exploration tools.
// Source (Oct 2026): Icy Veins Time Bandit page and heist article.
export const FIELD_EFFECTS = {
  'time-bandit': {
    name: 'Arc - Picky',
    text: 'Summons Picky to pry open all lockable objects nearby, so every safe in a heist room opens at once. Doesn’t reach other floors. 50s cooldown.',
  },
};

// How to get each Arc, most useful route first.
// Sources (Oct 2026): GameWith "How to Get S-Rank Arcs for Free" and per-Arc
// "How to Obtain" sections; Gfinity (Marching Beyond Time banner); playnews
// (Crime and Punishment banner); AllThings.how (Elite Hunter Supplies).
// "Character banners" are the Scarborough Fair boards (GameWith: "Gacha"),
// "Arc banners" the Arc Research Program, and the Arc Shop is the Arc
// Exchange paid in U-00NE from anomaly bosses.
// Limited Arc banner names (Oct 2026): NTE Global on X (Resolve Special);
// GameWith banner list (Dreamgate, Spellbound, Tiger, Bright Moon, Chorus);
// The Games Wiki (Nocturne, Pursuit); AllThings.how 1.4 banners (Roostfeather,
// Celestial).
// The Great Thief: Arc Exchange, like the other A-rank Arcs (confirmed by the site owner).
const limited = (banner, who) =>
  `Limited Arc banner “${banner} Special” (Arc Research Program, Tri-Keys), alongside ${who} banner`;
const CHAR_BANNERS = 'Character banners (Scarborough Fair)';
const ARC_BANNERS = 'Arc banners (Arc Research Program)';
const ARC_SHOP = 'Arc Shop (Arc Exchange, paid in U-00NE from anomaly bosses)';
const PASS = 'Elite Hunter Supplies (paid Circle Bounty pass): pick any S-rank Arc at Bounty Rank 30';
const commission = (name, where) => `Anomaly Commission “${name}”${where ? ` (${where})` : ''}`;

export const ARC_SOURCES = {
  // S-rank
  'blow-up-the-crowd': [commission('Rhythm Master', 'Illusion Town')],
  'blushing-mirage': [limited('Resolve', 'Shinku’s')],
  'camellia-society': ['First clear of the Serenetti Anomaly Hunt', ARC_BANNERS],
  'contemplative-cat': ['City Tycoon reward at Tycoon Level 21'],
  'crime-and-punishment': [limited('Roostfeather', 'Blackbird’s')],
  'day-off': ['Eclipse side quest at the Bureau of Anomaly Control'],
  'eternal-waltz': ['Anomaly Pilgrimage: first clear against The Never-ending Arachne'],
  'far-side-of-the-moon': [limited('Celestial', 'Akane Rin’s')],
  'fluff-of-fearlessness': [PASS],
  'fluff-of-ferocity': [PASS],
  'fluff-of-finesse': [PASS],
  'fluff-of-fleetness': [PASS],
  'fluff-of-fortitude': [PASS],
  'good-boys-grand-adventure': ['Anomaly Pilgrimage: first clear against Morphix', ARC_BANNERS],
  'hethereaus-keeper': ['Max out your Wanted Level, defeat the Justice Executioner, then visit the Security Office'],
  'marching-beyond-time': [limited('Bright Moon', 'Hotori’s')],
  'raging-flames': [commission('Ride Assault', 'Bridge Crossings'), ARC_BANNERS],
  'ravenous-blade': [limited('Spellbound', 'Zankou’s')],
  'ready-ready': [limited('Tiger', 'Nanally’s')],
  'reality-refuge': [commission('Let’s Go See a Movie', 'New Herland District'), ARC_BANNERS],
  'song-of-the-whale': [commission('Deep Blue Sorrow', 'New Herland District')],
  'stellar-veil': ['Login bonus event'],
  'tears-beneath-the-mask': [commission('Call of the Lost', 'New Herland District')],
  'the-last-rose': [limited('Nocturne', 'Lacrimosa’s')],
  'the-rain-that-shook-the-world': ['Limited Press Arc Pack in the Mall (paid)', 'Arc Shop, after buying the pack'],
  'the-wrong-gate': [limited('Dreamgate', 'Iroi’s')],
  'voice-of-the-voyager': [limited('Chorus', 'Linko’s')],
  'whats-desired': [limited('Pursuit', 'Chaos’s')],
  'your-happiness-is-priceless': ['Mall, for Nacupeda Coins: “Make a Sincere Wish” once a day at Nacupeda’s Pool, southwest Illusion Town'],
  'youthful-fantasy': [commission('The Book of Post-Adolescence', 'New Herland District'), ARC_BANNERS],
  // A-rank
  'a-time-will-come': [commission('Dragon Gate Substitute'), commission('Heaven’s Forsaken'), ARC_SHOP],
  'call-of-the-twisted-city': [commission('Kindness Hard to Refuse'), ARC_SHOP],
  'clear-skies': [CHAR_BANNERS, ARC_SHOP],
  'cosmos-daze-wild-reverie': [commission('Lightspeed Tagger')],
  'drawn-blade': [commission('Where Is Home'), CHAR_BANNERS, ARC_BANNERS, ARC_SHOP],
  'failing-you-heavy-in-my-heart': [commission('Video Cemetery'), ARC_SHOP],
  'mind-royale': [commission('Reclaim Inspiration'), commission('Plot Hole Repair Project'), ARC_SHOP],
  oraora: ['Anomaly Commissions “Backstreet Boxer”, “Rooftop Boxer”, “Court Boxer” and “Party Boxer”', ARC_SHOP],
  'shiny-days': [ARC_SHOP],
  'the-fools-spring': [ARC_SHOP],
  'the-forgotten': ['Pre-release reward', CHAR_BANNERS, ARC_SHOP],
  'the-good-the-bad-the-bitter': [ARC_SHOP],
  'the-great-thief': [ARC_SHOP],
  'time-bandit': ['Arc Shop (Arc Exchange): 100 U-00NE'],
  umbrella: [commission('Prepare for Rain'), CHAR_BANNERS, ARC_BANNERS, ARC_SHOP],
  'watch-your-heads': [CHAR_BANNERS, ARC_BANNERS, ARC_SHOP],
  // B-rank
  'be-happy': [CHAR_BANNERS, ARC_BANNERS],
  'dangerous-game': [CHAR_BANNERS, ARC_BANNERS],
  'first-step-to-success': [CHAR_BANNERS, ARC_BANNERS],
  'real-music': [CHAR_BANNERS, ARC_BANNERS],
  us: [CHAR_BANNERS, ARC_BANNERS],
};

export const ARC_BY_ID = Object.fromEntries(ARCS.map((a) => [a.id, a]));

// Recommended Arcs per character, best first. A character's signature Arc is
// marked separately via `signature` above and always listed first. A-rank
// characters can have an S-rank signature (Haniel: Blow up the Crowd, Aurelia:
// Stellar Veil).
// Sources (Oct 2026): GameWith "best Arcs by character" (its "Doomrain" is
// The Rain That Shook the World); neverness.gg build guides for Linko, Zankou
// and Blackbird; Icy Veins best-builds ranking for Akane Rin (Oct 2026).
export const RECOMMENDED = {
  adler: ['umbrella', 'the-fools-spring', 'a-time-will-come'],
  akane: ['the-wrong-gate', 'fluff-of-fleetness', 'youthful-fantasy', 'shiny-days'],
  aurelia: ['stellar-veil', 'fluff-of-fortitude', 'oraora'],
  baicang: ['camellia-society', 'a-time-will-come', 'fluff-of-ferocity'],
  blackbird: ['ravenous-blade', 'watch-your-heads'],
  chaos: ['whats-desired', 'fluff-of-ferocity', 'camellia-society'],
  chiz: ['contemplative-cat', 'cosmos-daze-wild-reverie', 'watch-your-heads'],
  daffodill: ['youthful-fantasy', 'shiny-days', 'fluff-of-fleetness'],
  edgar: ['call-of-the-twisted-city', 'mind-royale'],
  fadia: ['eternal-waltz', 'the-good-the-bad-the-bitter', 'a-time-will-come'],
  haniel: ['blow-up-the-crowd', 'time-bandit', 'day-off'],
  hathor: ['raging-flames', 'fluff-of-fortitude', 'song-of-the-whale'],
  hotori: ['marching-beyond-time', 'fluff-of-fearlessness', 'the-rain-that-shook-the-world'],
  iroi: ['the-wrong-gate', 'youthful-fantasy', 'mind-royale'],
  jiuyuan: ['reality-refuge', 'blow-up-the-crowd', 'the-forgotten'],
  lacrimosa: ['the-last-rose', 'fluff-of-fleetness', 'shiny-days'],
  linko: ['fluff-of-fortitude', 'oraora'],
  mint: ['clear-skies', 'the-last-rose', 'fluff-of-fleetness'],
  nanally: ['ready-ready', 'raging-flames', 'oraora'],
  sakiri: ['good-boys-grand-adventure', 'failing-you-heavy-in-my-heart', 'tears-beneath-the-mask'],
  shinku: ['fluff-of-ferocity', 'camellia-society'],
  skia: ['good-boys-grand-adventure', 'watch-your-heads', 'fluff-of-finesse'],
  zankou: ['contemplative-cat', 'watch-your-heads'],
  zero: ['day-off', 'blow-up-the-crowd'],
};

/**
 * How an Arc is obtained, from ARC_SOURCES:
 * 'limited' (limited banners only), 'paid' (paid pack), 'pass' (Elite Hunter
 * Supplies battle pass), 'free' (commissions, quests, events, Arc Exchange)
 * or 'banner' (standard banners only).
 */
export function arcAccess(id) {
  const src = ARC_SOURCES[id] ?? [];
  if (!src.length) return null;
  if (src.every((x) => x.startsWith('Limited Arc banner'))) return 'limited';
  if (src.some((x) => /\(paid\)/.test(x))) return 'paid';
  if (src.includes(PASS)) return 'pass';
  if (src.some((x) => x !== CHAR_BANNERS && x !== ARC_BANNERS && !x.startsWith('Limited Arc banner'))) return 'free';
  return 'banner';
}

/** 'sig', 'rec' or null for an Arc on a given character. */
export function arcTag(arc, character) {
  if (arc.signature === character.id) return 'sig';
  if (RECOMMENDED[character.id]?.includes(arc.id)) return 'rec';
  return null;
}

const RANK_ORDER = { S: 0, A: 1, B: 2 };

/** Arcs a character can equip: matching type; signature, then recommended
 *  (in guide order), then the rest by rank and ATK. */
export function arcsFor(character) {
  const rec = RECOMMENDED[character.id] ?? [];
  const priority = (a) => {
    if (a.signature === character.id) return -1;
    const i = rec.indexOf(a.id);
    return i === -1 ? Infinity : i;
  };
  return ARCS.filter((a) => a.type === character.arcType).sort(
    (a, b) =>
      priority(a) - priority(b) ||
      RANK_ORDER[a.rarity] - RANK_ORDER[b.rarity] ||
      b.atk - a.atk ||
      a.name.localeCompare(b.name),
  );
}
