// Bond (affection) levels and favourite gifts per character.
// Sources (Oct 2026): Dexerto character Bond guides (favourite gifts with
// Affinity values and shops, Bond level rewards), GameWith "Best Gifts for
// Each Character" (gift lists, best-value gift), Icy Veins item database
// (which characters prefer each gift), ntebuild (Zankou).
// Every gift gives some Affinity to anyone and more to the characters who
// favour it (how much more varies: Glimmering Ice gives Fadia +400, Elyms
// +200). The values below are each character's favourite values. null = value not published.

export const BOND_MAX = 10;
export const BOND_TOTAL = 56000; // Affinity from Lv 1 to Lv 10, per community charts
export const GIFT_LIMITS = { perCharacter: 3, perDay: 10 };

// Liked by every character.
export const UNIVERSAL_GIFTS = [
  { name: 'A Handwritten Letter', value: 2000, where: 'Warp Exchange, Circle Bounty' },
  { name: 'Floe Cinema Ticket', value: 400, where: 'Events and the Bolt Shop' },
];

// The reward schedule is the same for everyone; each character has their own
// sticker (Lv 7), avatar (Lv 8), frame (Lv 9) and namecard (Lv 10).
export const BOND_LEVELS = [
  { lv: 1, rewards: '10 Annulith, 3 Senior Hunter Guides' },
  { lv: 2, rewards: '10 Annulith, 2 Chaotic Dye', stage: 'Acquainted', unlocks: 'Passenger seat and Little Sparrow invites' },
  { lv: 3, rewards: '10 Annulith, 2 Elite Hunter Guides' },
  { lv: 4, rewards: '10 Annulith, 3 Elite Hunter Guides', stage: 'Familiar', unlocks: 'Basic interactions, home visits and City Hangouts' },
  { lv: 5, rewards: 'Annulith and Dreamless Seeds' },
  { lv: 6, rewards: '20 Annulith, 20,000 Beetle Coins', stage: 'Close Friends', unlocks: 'Special interactions' },
  { lv: 7, rewards: '20,000 Beetle Coins', cosmetic: 'sticker' },
  { lv: 8, rewards: '30,000 Beetle Coins', cosmetic: 'avatar', stage: 'Heartbond' },
  { lv: 9, rewards: '40,000 Beetle Coins', cosmetic: 'frame' },
  { lv: 10, rewards: '50,000 Beetle Coins', cosmetic: 'namecard' },
];

const BLOOMS = 'Hillside Blooms Florist';
const OOPS = 'Oops! Chest Gift Shop';
const MOBY = 'Moby-Dick Bookstore';
const DSD = 'DSD POP';
const BROWN = 'Brown Electronics Store';
const g = (name, value, where = null) => ({ name, value, where });

// gifts: favourites other than the universal ones, best first.
// best: the most cost-effective favourite, per the gift guides.
// cosmetics: Bond reward names; extras: other named Bond rewards by level.
export const BOND = {
  adler: {
    best: 'Golden Dawn',
    gifts: [
      g('Promise', 400, `${OOPS} (Bridge Crossings)`),
      g('Holy Worship Month', 200, `${BLOOMS} (Bridge Crossings)`),
      g('Golden Dawn', 200, `${BLOOMS} (Bridge Crossings, Miguel District)`),
      g('Great Defender!', 100, 'Bamboo Pharmacy'),
      g('Wanderer’s Banjo', 100, 'A.R.P.T.S Bar (Miguel District, New Herland)'),
      g('Purification Guard Lozenges', 100, 'Bamboo Pharmacy'),
    ],
    cosmetics: { sticker: 'And So It Is', avatar: 'reldA', frame: 'Freedom in Self-Awareness', namecard: 'Welcome' },
    extras: { 5: 'The Butler’s Manner (home decor)', 10: '“Lotus C198” Record Player (home decor)' },
  },
  akane: {
    gifts: [
      g('Refulgent Agreement', 200, `${BLOOMS} (Illusion Town)`),
      g('Fever Dream', 200, OOPS),
      g('Pineapple Yakitori Bowl', 100, '2-Four Convenience Store (Illusion Town, Miguel District)'),
    ],
    partial: true,
  },
  aurelia: {
    best: 'Fantasia',
    gifts: [
      g('Ambient Night Light', 400, `${BROWN} (Miguel District)`),
      g('Promise', 400, `${OOPS} (Bridge Crossings)`),
      g('Blue Fable', 200, `${BLOOMS} (Bridge Crossings)`),
      g('Fantasia', 200, `${BLOOMS} (all districts)`),
      g('Mousou Puzzle', 200, `${MOBY} (Bridge Crossings, Miguel District)`),
      g('Bigmouth Custard Baozi', 100, 'Bigmouth Baozi'),
      g('Ebisu Royal Tower', 100, 'Story reward'),
      g('Refreshing Fruity', 100, 'Refresh Vending Machine, 2-Four Convenience Store'),
    ],
  },
  baicang: {
    best: 'Refulgent Agreement',
    gifts: [
      g('Gigafluff - The Strong', 400, `${DSD} (Bridge Crossings, Miguel District)`),
      g('Gigafluff - Musclology', 400, `${DSD} (Bridge Crossings, Miguel District)`),
      g('Gigafluff - Reign of Darkness', 400, 'Gacha Machine'),
      g('Gigafluff - Absolute Power', 200, 'Gacha Machine'),
      g('9331', 200, `${OOPS} (Bridge Crossings)`),
      g('Refulgent Agreement', 200, `${BLOOMS} (Illusion Town)`),
      g('Kids Energy Meal', 100, 'Food First Family Restaurant'),
      g('Nekomaru Vegan Ramen', 100, 'Nekomaru Ramen'),
      g('Puka Chocoa Spicy Challenge', 100, 'Puka Vending Machine, Puka Candy Shop'),
    ],
    cosmetics: { sticker: 'Wander Among the Clouds', avatar: 'gnaciaB', frame: 'Dawn', namecard: 'Just a Little Card' },
    extras: { 5: 'Old Cocoon (home decor)', 6: 'Dream Cocoon (home decor)' },
  },
  blackbird: {
    gifts: [
      g('Celestial Astrolabe', 1200, 'Special gift'),
      g('Moonmelt Tea Set', 400, `${OOPS} (Miguel District)`),
    ],
    partial: true,
  },
  chaos: {
    best: 'Kokoro Rider L1 - Eradicator',
    gifts: [
      g('Kokoro Rider L1 - Eradicator', 400, `${DSD} (Illusion Town, New Herland)`),
      g('Kokoro Rider L1 - Metal Strategist', 400, `${DSD} (Bridge Crossings, Miguel District)`),
      g('On Track', 400, `${BROWN} (Miguel District, New Herland)`),
      g('Kokoro Rider L1 - Silent Vow', 200, 'Gacha Machine'),
      g('Sin, Vice, Crime', 200, `${MOBY} (New Herland)`),
      g('9331', 200, `${OOPS} (Bridge Crossings)`),
      g('Delux Ship Model Kit', null),
      g('Kokoro Rider L1 - Splendor', null),
      g('Hamburger Steak XL', 100),
      g('Refreshing Fruity', 100, 'Refresh Vending Machine, 2-Four Convenience Store'),
    ],
  },
  chiz: {
    best: 'Fantasia',
    gifts: [
      g('Bunny Box', 400, `${BROWN} (Bridge Crossings)`),
      g('Fantasia', 200, `${BLOOMS} (all districts)`),
      g('Holy Worship Month', 200, `${BLOOMS} (Bridge Crossings)`),
      g('Sweet Pink', 200, `${BLOOMS} (Illusion Town)`),
      g('Rose Lychee Cake', 100, 'Alice’s Bakery (Bridge Crossings, New Herland)'),
      g('Nyanko Punch Taro Pudding Milktea', 100, 'Crazy Cat Milk Tea Shop'),
      g('Puka Sweet Dreams Marshmallow', 100, 'Puka Vending Machine, Puka Candy Shop'),
    ],
    cosmetics: { sticker: 'Patchwork Flute Song', avatar: 'Zinnia', frame: 'Like Dew, Like Lightning', namecard: 'Love Letter' },
    extras: { 10: 'Velvet Spring Day (outfit)' },
  },
  daffodill: {
    best: 'Promise',
    gifts: [
      g('Promise', 400, `${OOPS} (Bridge Crossings)`),
      g('Lost Eyes', 200, `${OOPS} (Illusion Town)`),
      g('Eternal Purity', 200, `${BLOOMS} (Illusion Town)`),
      g('Cooly Cool Refresher', 100, 'Bamboo Pharmacy'),
      g('Puka Sweet Dreams Marshmallow', 100, 'Puka Vending Machine, Puka Candy Shop'),
      g('Nyanko Cozy Uji Matcha', 100, 'Crazy Cat Milk Tea Shop (Bridge Crossings, Illusion Town)'),
    ],
    cosmetics: { sticker: 'Kaleidoscope Reflections', avatar: 'llidoffaD', frame: 'In the Middle of the Lake', namecard: 'The One Certainty' },
  },
  edgar: {
    best: 'HAHA',
    gifts: [
      g('Unrecorded Sound', 400),
      g('Bear-o-metry', 400, `${OOPS} (Illusion Town)`),
      g('Blue Fable', 200, `${BLOOMS} (Bridge Crossings)`),
      g('HAHA', 200, MOBY),
      g('Day Off', 200, MOBY),
      g('Boss’s Approval', 200, MOBY),
      g('Snowy Tofu Pudding', 100, 'Shigezou Tofu, Natsunari Tofu'),
      g('Bigmouth Custard Baozi', 100, 'Bigmouth Baozi'),
      g('Clicky Fries', 100, 'Clicky Fast Food Restaurant'),
    ],
    cosmetics: { sticker: 'Explore the Unknown', avatar: 'ragdE', frame: 'The Omniscience Paradox', namecard: 'Formal Application, Reading Report' },
  },
  // From CN server gift cards shared by the project owner (Nov 16, 2026).
  elyms: {
    best: 'Blink! Wink Battle!',
    gifts: [
      g('Solitude', 400, `${OOPS} (Illusion Town), 10,000 Fons`),
      g('Glimmering Ice', 200, `${BLOOMS} (Bridge Crossings), 5,400 Fons`),
      g('Good Friend Sticker', 200, 'From Elyms herself, once a day when you stay idle with her on screen'),
      g('Blink! Wink Battle!', 100, 'Bamboo Pharmacy (Bridge Crossings), 600 Fons'),
    ],
    partial: true,
    cnOnly: true,
  },
  fadia: {
    best: 'Glimmering Ice',
    gifts: [
      g('Glimmering Ice', 400, `${BLOOMS} (Bridge Crossings, Miguel District)`),
      g('Golden Spring', 200, BLOOMS),
      g('Balance', 200, `${OOPS} (Illusion Town)`),
      g('Deep in the Heart', 100, 'A.R.P.T.S Bar (Miguel District, New Herland)'),
      g('Classic Trio', 100, 'Marigny Pizza Restaurant'),
      g('Refreshing Mystery', 100, 'Refresh Vending Machine'),
    ],
    cosmetics: { sticker: 'The Origin of Desire', avatar: 'aidaF', frame: 'Savior', namecard: 'A Little Test' },
    extras: { 10: 'Tales of the Night (outfit)' },
  },
  haniel: {
    best: 'Fantasia',
    gifts: [
      g('Asahi Inori - Moonlight', 400, `${DSD} (Illusion Town, New Herland)`),
      g('Asahi Inori - Crimson', 400, `${DSD} (Illusion Town, New Herland)`),
      g('Fantasia', 200, `${BLOOMS} (all districts)`),
      g('Sin, Vice, Crime', 200, `${MOBY} (New Herland)`),
      g('Cool-lala Spicy Snack', 100, 'Vending Machine, 2-Four Convenience Store'),
      g('Puka Chocoa Ellie Tour Special', 100, 'Puka Vending Machine, Puka Candy Shop'),
      g('Sakai Melon Bread', 100, 'Vending Machine, 2-Four Convenience Store'),
    ],
    cosmetics: { sticker: 'Leave a Good Review!', avatar: 'leinaH', frame: 'Honey Overture', namecard: 'The Answer is Crossroads' },
  },
  hathor: {
    best: 'Fever Dream',
    gifts: [
      g('On Track', 400, `${BROWN} (Miguel District, New Herland)`),
      g('Fever Dream', 200, OOPS),
      g('Nightingale’s Sonata', 200, `${BLOOMS} (Bridge Crossings)`),
      g('Colorful Light Salad', 100, 'Food First Family Restaurant'),
      g('Cooly Cool Refresher', 100, 'Bamboo Pharmacy'),
      g('0-K Cold Brew', 100, 'Vending Machine, 2-Four Convenience Store'),
    ],
    cosmetics: { sticker: 'Asymmetric Connection', avatar: 'rohtaH', frame: 'I Am Not Myself', namecard: 'S-Class Operations Lead' },
    extras: { 5: 'Express Logistics (home decor)' },
  },
  hotori: {
    best: 'Yellow Glaze Vase',
    gifts: [
      g('Golden Moon', 400, BROWN),
      g('Golden Spring', 200, BLOOMS),
      g('Yellow Glaze Vase', null, `${BLOOMS} (Bridge Crossings, Miguel District)`),
      g('Zhu! Vitamin!', null),
      g('Chiyo Family Brew', 100),
      g('Ebisu Royal Tower', 100, 'Story reward'),
    ],
  },
  iroi: {
    best: 'Refulgent Agreement',
    gifts: [
      g('Golden Moon', 400, BROWN),
      g('Bear-o-metry', 400, `${OOPS} (Illusion Town)`),
      g('Refulgent Agreement', 200, `${BLOOMS} (Illusion Town)`),
      g('Fever Dream', 200, OOPS),
      g('999 Nights', null),
      g('Solitude', null),
      g('Unknown Mystery Box', null),
      g('Asahi Inori - Flowing Delusion', null),
      g('Asahi Inori - Argentum Persona', null),
      g('Asahi Inori - Galactic Fabrication', null),
      g('Asahi Inori - Moon in the Mirror', null),
      g('Puka Sweet Dreams Marshmallow', 100, 'Puka Vending Machine, Puka Candy Shop'),
    ],
  },
  jiuyuan: {
    best: 'Moon Vase',
    gifts: [
      g('On Track', 400, `${BROWN} (Miguel District, New Herland)`),
      g('Moon Vase', 200, `${BLOOMS} (Bridge Crossings, Miguel District)`),
      g('Nightingale’s Sonata', 200, `${BLOOMS} (Bridge Crossings)`),
      g('Magi-Puff Whole Wheat Bread', 100),
      g('0-K Cold Brew', 100, 'Vending Machine, 2-Four Convenience Store'),
      g('Ebisu Royal Tower', 100, 'Story reward'),
    ],
    partial: true,
  },
  lacrimosa: {
    best: 'Chill Out',
    gifts: [
      g('Tomato Family Bucket', 1200, 'Tomato 100 Vending Machine'),
      g('Bunny Box', 400, `${BROWN} (Bridge Crossings)`),
      g('Holy Worship Month', 200, `${BLOOMS} (Bridge Crossings)`),
      g('Chill Out', 200, MOBY),
      g('Tomato 100', 100, 'Tomato 100 Vending Machine'),
      g('Tomato 100 Juice', 100, 'Tomato 100 Vending Machine'),
      g('Tomato 100 Jelly', 100, 'Tomato 100 Vending Machine'),
      g('Tomato 100 Milkshake', 100, 'Tomato 100 Vending Machine'),
    ],
    cosmetics: { sticker: 'Suspended Heart', avatar: 'asomircaL', frame: 'Tomato No. 626', namecard: 'The Rest is Omitted' },
    extras: { 5: 'Old Cocoon (home decor)', 6: 'New Moon Lullaby (outfit)' },
  },
  linko: {
    gifts: [
      g('Fantasia', 200, `${BLOOMS} (all districts)`),
      g('Puka Sweet Dreams Marshmallow', 100, 'Puka Vending Machine, Puka Candy Shop'),
    ],
    partial: true,
  },
  mint: {
    best: 'Waltz',
    gifts: [
      g('Asahi Inori - Moonsilver', 400, 'Gacha Machine'),
      g('Asahi Inori - Crimson', 400, `${DSD} (Illusion Town, New Herland)`),
      g('Asahi Inori - Moonlight', 400, `${DSD} (Illusion Town, New Herland)`),
      g('Waltz', 200, `${BLOOMS} (all districts)`),
      g('Secrets of the Bag...', 200, MOBY),
      g('Super Tonkotsu Ramen', 100, 'Budoriya Izakaya, Senjo Brewhouse Izakaya'),
      g('Nyanko Punch Taro Pudding Milktea', 100, 'Crazy Cat Milk Tea Shop'),
      g('Gubicrisp', 100, 'Gubichi Vending Machine, 2-Four Convenience Store'),
    ],
    cosmetics: { sticker: 'Paws and Bells', avatar: 'tniM', frame: 'Long Summer', namecard: 'Whispers on the Breeze' },
    extras: { 5: 'Taste of Everything (home decor)', 10: 'Leisurely Holiday (outfit)' },
  },
  nanally: {
    best: 'Blazing Crimson',
    gifts: [
      g('Kokoro Rider L1 - Ultimate Skill', 400, 'Gacha Machine'),
      g('Kokoro Rider L1 - Metal Strategist', 400, `${DSD} (Bridge Crossings, Miguel District)`),
      g('Kokoro Rider L1 - Eradicator', 400, `${DSD} (Illusion Town, New Herland)`),
      g('Kokoro Rider L1 - Silent Vow', 200, 'Gacha Machine'),
      g('Sin, Vice, Crime', 200, `${MOBY} (New Herland)`),
      g('We Are One', 200, `${MOBY} (Bridge Crossings, Miguel District)`),
      g('Blazing Crimson', 200, `${BLOOMS} (Illusion Town)`),
      g('Nekomaru Oni Ramen', 100, 'Nekomaru Ramen'),
      g('Gubichi Original Flavor Chips', 100, 'Gubichi Vending Machine, 2-Four Convenience Store'),
      g('Cool-lala Spicy Snack', 100, 'Vending Machine, 2-Four Convenience Store'),
    ],
    cosmetics: { sticker: 'Call the Boss', avatar: 'yllanaN', frame: 'King of the Shell' },
  },
  sakiri: {
    best: 'Fever Dream',
    gifts: [
      g('Bunny Box', 400, `${BROWN} (Bridge Crossings)`),
      g('Blue Fable', 200, `${BLOOMS} (Bridge Crossings)`),
      g('Fever Dream', 200, OOPS),
      g('Kids Energy Meal', 100, 'Food First Family Restaurant'),
      g('Nyanko Splash Black Sugar Boba Dirty Chai', 100, 'Crazy Cat Milk Tea Shop'),
      g('Crave Bites! Milk Flavor', 100, 'Gubichi Vending Machine, 2-Four Convenience Store'),
    ],
    cosmetics: { sticker: 'Growth Milestones', avatar: 'irikaS', frame: 'Hide and Seek', namecard: 'Family Member' },
    extras: { 5: 'Kiroumaru’s Chew Toy' },
  },
  shinku: {
    best: 'Puka Chocoa Ellie Tour Special',
    gifts: [
      g('Golden Moon', 400, BROWN),
      g('Gigafluff - The Strong', 400, DSD),
      g('Kokoro Rider L3 - Hero’s Arrival', 400, DSD),
      g('Gigafluff - Absolute Power', 200, 'Gacha Machine'),
      g('Golden Spring', 200, BLOOMS),
      g('999 Nights', null),
      g('Exclusively Colored GK', null),
      g('Gigafluff - Ever Victorious', null),
      g('Asahi Inori - Flowing Delusion', null),
      g('Asahi Inori - Moon in the Mirror', null),
      g('Puka Chocoa Ellie Tour Special', 100, 'Puka Vending Machine, Puka Candy Shop'),
    ],
  },
  skia: {
    best: 'Chill Out',
    gifts: [
      g('White Jade Lamp', null, `${BROWN} (Miguel District)`),
      g('Song of the Gladiator', null, 'A.R.P.T.S Bar (Miguel District, New Herland)'),
      g('Chill Out', 200, MOBY),
      g('Secrets of the Bag...', 200, MOBY),
      g('Shout!', null, MOBY),
      g('Clicky Lavaburger', null, 'Clicky Fast Food Restaurant'),
      g('Bob’s Tea Garden', 100, 'Bob’s Vending Machine, 2-Four Convenience Store'),
    ],
    cosmetics: { sticker: 'Working Like a Dog', avatar: 'aikS', frame: 'All but Flesh and Form', namecard: 'Business Template' },
    extras: { 5: 'I Am Me (home decor)' },
  },
  zankou: {
    best: 'Serenade',
    gifts: [
      g('Moonmelt Tea Set', 400, `${OOPS} (Miguel District)`),
      g('Serenade', 200, `${BLOOMS} (Bridge Crossings)`),
      g('Nightingale’s Sonata', 200, `${BLOOMS} (Bridge Crossings)`),
      g('Blazing Crimson', 200, `${BLOOMS} (Illusion Town)`),
    ],
    partial: true,
  },
};

// The player character: no Bond of her own.
export const NO_BOND = {
  zero: 'Esper Zero is the player character, so she has no Bond level. Her Five-Star Paragon life skill makes gifts give more Affinity to everyone else.',
};
