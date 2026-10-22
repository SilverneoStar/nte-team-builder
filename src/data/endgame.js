// Recommended endgame stats and Cartridge stat priorities per character.
// Source: published community build guides (recommended endgame stats, best
// stats and best Cartridges per character), collected Oct 2026.
// Values are written as the guides give them ("20,000+", "50% ~ 80%+"), tuned
// for the character's signature Arc.
//
// endgame keys: hp, atk, def, critRate, critDmg, universal, element (the
// character's own element DMG), cycle, break.
// main / subs: priority strings as written; parsePriority() turns them into stat names.
// builds: characters with more than one recommended build; the first is the default.

export const ENDGAME = {
  adler: {
    slug: 'adler',
    endgame: { hp: '20,000+', atk: '1000+', def: '3000+', critRate: '5%+', critDmg: '50%+', cycle: '50+', break: '75+' },
    main: 'DEF % > DEF > Break Intensity > Cycle Intensity > DMG %',
    subs: 'DEF % > DEF > Break Intensity > Cycle Intensity > DMG %',
    cartridges: ["Kingdom's Guard", 'Speedy Hedgehog'],
  },
  aurelia: {
    slug: 'aurelia',
    endgame: { hp: '17,000+', atk: '2500+', critRate: '60%+', critDmg: '90%+', universal: '15%+', element: '30%+' },
    main: 'Crit Rate > ATK % > Psyche DMG > Crit DMG',
    subs: 'Crit DMG > Crit Rate > ATK % > DMG % > Flat Attack',
    cartridges: ["Devil's Blood: Curse", 'Lost Radiance', 'Shadow Creed'],
  },
  akane: {
    slug: 'akane',
    main: 'Crit Rate > Crit DMG > ATK % > Lakshana DMG %',
    subs: 'Crit Rate = Crit DMG > ATK % > DMG % > ATK',
    notes: [
      'Street Boxer adds a lot of Crit Rate, so Crit Rate matters less with it.',
      'Lakshana DMG on the main slot is also fine when your Crit Rate and Crit DMG are balanced (about 1 : 2).',
    ],
    cartridges: ['Street Boxer'],
  },
  baicang: {
    slug: 'baicang',
    endgame: { hp: '20,000+', atk: '2000+', critRate: '75%+', critDmg: '100%+', break: '25+', universal: '10%+', element: '47.5%+' },
    notes: ['CRIT DMG is before the 80% from her Arc’s buff.'],
    main: 'Incantation DMG % > Crit Rate > Crit DMG = ATK % = Break Intensity',
    subs: 'Crit Rate > Crit DMG > ATK % = DMG % > ATK > Break Intensity',
    cartridges: ['Crimson: Twin Butterflies', 'Shadow Creed'],
  },
  blackbird: {
    slug: 'blackbird',
    endgame: { hp: '20,000+', atk: '1800+', critRate: '90%+', critDmg: '150%+', cycle: '100+', universal: '10%+', element: '10%+' },
    main: 'Crit DMG > Psyche DMG % > ATK % > Cycle Intensity',
    subs: 'Crit Rate > Crit DMG > DMG % = ATK % > ATK > Cycle Intensity',
    cartridges: ["Devil's Blood: Curse", 'Lost Radiance', 'Street Boxer'],
  },
  chaos: {
    slug: 'chaos',
    endgame: { hp: '20,000+', atk: '2000+', critRate: '64–74%+', critDmg: '160%+', universal: '15%+', element: '67.5%+' },
    notes: ['CRIT Rate is before Hathor’s Remora passive or Street Boxer’s extra 14%.'],
    main: 'Lakshana DMG % > Crit DMG > ATK % > Crit Rate',
    subs: 'Crit Rate > Crit DMG > DMG % > ATK % > ATK',
    cartridges: ['Street Boxer', 'Shadow Creed'],
  },
  chiz: {
    slug: 'chiz',
    endgame: { hp: '20,000+', atk: '2000+', critRate: '40%+', critDmg: '100%+', universal: '20%+', element: '55%+' },
    notes: ['Cosmos DMG is before the Arc bonus.'],
    main: 'Cosmos DMG > Crit DMG > DMG% > ATK %',
    subs: 'Crit DMG > DMG % > ATK % > ATK',
    cartridges: ['Lost Radiance', 'Shadow Creed'],
  },
  daffodill: {
    slug: 'daffodil',
    endgame: { hp: '20,000+', atk: '2300+', critRate: '45%+', critDmg: '90%+', universal: '10%+', element: '50%+', break: '150+' },
    endgameLabel: 'Awakening 0',
    alt: {
      label: 'Awakening 2+ (using Awakenings 3 and 5)',
      endgame: { hp: '20,000+', atk: '2300+', critRate: '30%+', critDmg: '60%+', universal: '10%+', element: '40%+', break: '350+' },
    },
    notes: ['Break Intensity becomes worth more than other stats once she has Awakenings 3 and 5.'],
    main: 'Crit Rate > Crit DMG > Break Intensity > Chaos DMG %',
    subs: 'Crit Rate > Crit DMG > ATK % > DMG % > Flat ATK > Break Intensity',
    cartridges: ['Diabolos'],
  },
  edgar: {
    slug: 'edgar',
    endgame: { hp: '50,000+', atk: '1000+', def: '1000+', critRate: '5%+', critDmg: '50%+', cycle: '50+', break: '50+' },
    main: 'Healing Bonus > HP % > Cycle Intensity > Break Intensity',
    subs: 'HP % > HP > Cycle Intensity > Break Intensity',
    cartridges: ["Thea's Night Tavern", 'Speedy Hedgehog'],
  },
  fadia: {
    slug: 'fadia',
    endgame: { hp: '60,000+', atk: '1200+', def: '1200+', critRate: '5%+', critDmg: '50%+', universal: '20%+' },
    main: 'HP % > Mental Damage > Psyche Damage',
    subs: 'HP % > HP > DMG > Crit Rate > Crit DMG',
    cartridges: ['Tiny Big Adventure', 'Quiet Manor'],
  },
  haniel: {
    slug: 'haniel',
    endgame: { hp: '17,000+', atk: '2300+', critRate: '50%+', critDmg: '90%+', universal: '15%+', element: '20%+' },
    main: 'Crit Rate > Psyche DMG > Crit DMG > Break Intensity',
    subs: 'Crit DMG > DMG % > Crit Rate > ATK % > Break Intensity > ATK',
    cartridges: ['Speedy Hedgehog', 'Fireflies and the Forest', "Devil's Blood: Curse"],
  },
  hathor: {
    slug: 'hathor',
    endgame: { hp: '20,000+', atk: '2500+', def: '1200+', critRate: '30%+', critDmg: '120%+', universal: '15%+', element: '62.5%+' },
    notes: ['CRIT Rate is before her Passive 1 or the Street Boxer set bonus.'],
    main: 'Lakshana DMG > Crit DMG > Crit Rate > ATK %',
    subs: 'Crit Rate > Crit DMG > DMG % > ATK % > ATK',
    cartridges: ['Street Boxer', "Devil's Blood: Curse", 'Fireflies and the Forest', 'Shadow Creed'],
  },
  hotori: {
    slug: 'hotori',
    endgame: { hp: '20,000+', atk: '2100+', critRate: '70%+', critDmg: '90%+', universal: '10%+', element: '50%+' },
    main: 'Crit Rate > Cosmos DMG % > Crit DMG > ATK %',
    subs: 'Crit DMG > Crit Rate > DMG % > ATK % > ATK',
    cartridges: ['Lost Radiance'],
  },
  iroi: {
    slug: 'iroi',
    endgame: { hp: '20,000+', atk: '2900+', critRate: '30%+', critDmg: '70%+', universal: '10%+', cycle: '150+' },
    main: 'Cycle Intensity > Anima DMG % > Crit DMG > Crit Rate > ATK %',
    subs: 'Cycle Intensity > Crit DMG > Crit Rate > DMG % > ATK %',
    cartridges: ['Speedy Hedgehog', 'Fireflies and the Forest'],
  },
  jiuyuan: {
    slug: 'jiuyuan',
    endgame: { hp: '20,000+', atk: '2200+', critRate: '80%+', critDmg: '100%+', universal: '10%+', element: '35%+' },
    notes: ['CRIT DMG is before the 56% from the Cartridge set bonus.'],
    main: 'Crit Rate > Crit DMG > ATK % > Anima DMG %',
    subs: 'Crit Rate > Crit DMG > ATK % = DMG % >> ATK',
    cartridges: ['Fireflies and the Forest', "Devil's Blood: Curse", 'Street Boxer', 'Shadow Creed'],
  },
  lacrimosa: {
    slug: 'lacrimosa',
    endgame: { hp: '20,000+', atk: '2200+', critRate: '50% ~ 80%+', critDmg: '100%+', universal: '10%+', element: '50% ~ 87.5%+' },
    notes: ['CRIT DMG is measured out of combat.'],
    main: 'Crit Rate > Chaos DMG % > Crit DMG > ATK %',
    subs: 'Crit DMG > Crit Rate > DMG % > ATK % > Flat ATK',
    cartridges: ['Diabolos', 'Shadow Creed'],
  },
  linko: {
    slug: 'linko',
    endgame: { hp: '20,000+', atk: '2000+', critRate: '90%+', critDmg: '90%+', universal: '15%+' },
    notes: ['CRIT DMG is before the set bonus.'],
    main: 'Anima DMG % > Crit DMG > ATK % > Cycle Intensity',
    subs: 'Crit Rate > Crit DMG > DMG % = ATK % > Cycle Intensity',
    cartridges: ['Fireflies and the Forest', 'Lost Radiance'],
  },
  mint: {
    slug: 'mint',
    endgame: { hp: '17,000+', atk: '2000+', critRate: '60%+', critDmg: '100%+', universal: '10%+', element: '47.5%+' },
    notes: ['CRIT DMG is before the 56% from the Cartridge set bonus.'],
    main: 'Anima DMG % > Crit Rate > Crit DMG > ATK %',
    subs: 'Crit Rate > Crit DMG > ATK % = DMG % >> ATK',
    cartridges: ['Fireflies and the Forest', 'Shadow Creed'],
  },
  nanally: {
    slug: 'nanally',
    endgame: { hp: '20,000+', atk: '2200+', critRate: '85%+', critDmg: '100%+', universal: '10%+', element: '47.5%+' },
    notes: ['CRIT DMG is before the 56% from the Cartridge set bonus.'],
    main: 'Anima DMG % > Crit DMG > ATK % > Crit Rate',
    subs: 'Crit Rate > Crit DMG > ATK % = DMG % >> ATK',
    cartridges: ['Fireflies and the Forest', 'Shadow Creed', 'Lost Radiance'],
  },
  sakiri: {
    slug: 'sakiri',
    endgame: { hp: '20,000+', atk: '2300+', critRate: '50%+', critDmg: '100%+', break: '50+', universal: '10%+', element: '54%+' },
    main: 'Crit Rate = Crit DMG > ATK % > Incantation DMG % > Cycle Intensity = Break Intensity',
    subs: 'Crit DMG = Crit Rate > ATK % > ATK > Break Intensity = Cycle Intensity',
    cartridges: ['Speedy Hedgehog', 'Crimson: Twin Butterflies'],
  },
  shinku: {
    slug: 'shinku',
    endgame: { hp: '20,000+', atk: '2000+', critRate: '75%+', critDmg: '150%+', universal: '15%+', element: '10%+' },
    notes: ['Cosmos DMG is before the Arc bonus.'],
    main: 'Crit Rate > Crit DMG > ATK % > Cosmos DMG %',
    subs: 'Crit Rate > Crit DMG > DMG % > ATK % > ATK',
    cartridges: ['Lost Radiance', 'Street Boxer', 'Fireflies and the Forest'],
  },
  skia: {
    slug: 'skia',
    endgame: { hp: '18,000+', atk: '2000+', def: '1200+', critRate: '30%+', critDmg: '135%+', universal: '15%+', element: '37.5%+' },
    notes: ['CRIT Rate is before Awakening 2 or the Street Boxer set bonus.'],
    main: 'Lakshana DMG > Crit DMG > Crit Rate > ATK %',
    subs: 'Crit Rate > Crit DMG > DMG % > ATK % > ATK',
    cartridges: ['Street Boxer', 'Shadow Creed'],
  },
  zankou: {
    slug: 'zankou',
    endgame: { hp: '20,000+', atk: '2000+', critRate: '60%+', critDmg: '200%+', cycle: '200+', universal: '10%+', element: '10%+' },
    main: 'Crit DMG > Cycle Intensity > Incantation DMG % > Crit Rate > ATK %',
    subs: 'Crit DMG > Cycle Intensity = Crit Rate > DMG % > ATK % > Break Intensity',
    builds: [
      {
        label: 'Sub-DPS',
        main: 'Crit DMG = Cycle Intensity > Incantation DMG % > Crit Rate = ATK %',
        subs: 'Crit DMG > Cycle Intensity = DMG % = Crit Rate > ATK % > Break Intensity',
      },
    ],
    notes: ['Break Intensity sub stats are for the Break build with Awakening 5.'],
    cartridges: ['Crimson: Twin Butterflies', 'Lost Radiance', 'Shadow Creed'],
  },
  zero: {
    slug: 'zero',
    endgameLabel: 'Day Off build',
    endgame: { hp: '20,000+', atk: '2600+', critRate: '45%+', critDmg: '100%+', universal: '10%+', cycle: '50+' },
    main: 'Crit Rate > Crit DMG > ATK %',
    subs: 'Crit DMG > Crit Rate > DMG % > ATK % > ATK',
    alt: {
      label: 'The Rain That Shook the World build',
      endgame: { hp: '20,000+', atk: '2000+', critRate: '45%+', critDmg: '90%+', universal: '10%+', cycle: '250+' },
      main: 'Cycle Intensity > Crit Rate > Crit DMG > ATK %',
      subs: 'Cycle Intensity > Crit Rate > Crit DMG > DMG % > ATK % > ATK',
    },
    cartridges: ['Speedy Hedgehog', 'Lost Radiance', 'Fireflies and the Forest', 'Shadow Creed'],
  },
};

// Display order and labels for endgame stats.
export const ENDGAME_STATS = [
  ['hp', 'HP'], ['atk', 'ATK'], ['def', 'DEF'], ['critRate', 'CRIT Rate'], ['critDmg', 'CRIT DMG'],
  ['universal', 'Universal DMG'], ['element', 'Element DMG'], ['cycle', 'Cycle Intensity'], ['break', 'Break Intensity'],
];

/** First number in a value like "20,000+" or "50% ~ 80%+", for sorting. */
export const endgameNumber = (v) => {
  const m = /[\d,.]+/.exec(v ?? '');
  return m ? Number(m[0].replace(/,/g, '')) : null;
};

// The guides' stat names → the app's stat names.
const NAME_MAP = {
  'crit rate': 'CRIT Rate',
  'crit dmg': 'CRIT DMG',
  'atk %': 'ATK%', 'atk%': 'ATK%',
  atk: 'ATK', 'flat atk': 'ATK', 'flat attack': 'ATK',
  'hp %': 'HP%', 'hp%': 'HP%', hp: 'HP',
  'def %': 'DEF%', 'def%': 'DEF%', def: 'DEF',
  'dmg %': 'DMG%', 'dmg%': 'DMG%', dmg: 'DMG%',
  'healing bonus': 'Healing%',
  'cycle intensity': 'Cycle Intensity',
  'break intensity': 'Break Intensity',
};
function statName(raw) {
  const s = raw.trim().replace(/\*+$/, '').toLowerCase();
  if (NAME_MAP[s]) return NAME_MAP[s];
  const el = /^(cosmos|anima|incantation|chaos|psyche|lakshana|mental)\s+(dmg|damage)\s*%?$/.exec(s);
  if (el) return `${el[1][0].toUpperCase()}${el[1].slice(1)} DMG%`;
  return null;
}

/**
 * "Crit Rate > Crit DMG = ATK %" → [['CRIT Rate'], ['CRIT DMG', 'ATK%']]
 * (groups of equal priority, best first; unknown names dropped).
 */
export function parsePriority(text) {
  if (!text) return [];
  return text
    .split(/>+/)
    .map((g) => g.split(/=|≈/).map(statName).filter(Boolean))
    .filter((g) => g.length);
}
