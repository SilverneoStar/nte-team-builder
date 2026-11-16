// Hunter's Crucible: the boss score-attack mode, for the Endgame tab (not
// shown on the site yet; filled in as screenshots arrive).
// Source: in-game screens the project owner shared (Nov 16, 2026).
//
// Each stage is one boss. A clear scores
//   (Basic Difficulty Score 500 + points of the conditions picked) x multiplier
// (x1 Easy, x2 Normal, x3 Hard, x5 Ultra). Checked against the game's totals:
// Taygedo on Ultra (500 + 600) x 5 = 5,500; Black Tome on Hard (500 + 600) x 3
// = 3,300; Debt Collector on Hard (500 + 680) x 3 = 3,180 and on Ultra
// (500 + 875) x 5 = 6,875. Basic score is 500 on every difficulty. Bosses get stronger with difficulty (Taygedo Lv 42 Easy, 72 Ultra).
//
// Conditions: up to 3 bonus objectives, a target time, Enemy HP Up, Enemy
// ATK Up and Enemy <element> Resistance Up for 3 elements (never the boss's
// weakness). weakness: the element shown by the boss's level with a red down
// arrow.
//
// Stages marked tallyOnly (pink in game) give no score rewards of their own;
// their points only count toward the overall Score Reward total (and title).
// Their condition points are 7x the usual (e.g. 90s target time: 3,500), and
// they show no weakness. Mammon's stage has several enemies ("other surviving
// units").

export const CRUCIBLE = {
  // Score Reward bar across all stages.
  scoreRewardTotal: 12000,

  difficulties: [
    { id: 'easy', label: 'Easy', multiplier: 1, basicScore: 500 },
    { id: 'normal', label: 'Normal', multiplier: 2, basicScore: 500 },
    { id: 'hard', label: 'Hard', multiplier: 3, basicScore: 500 },
    { id: 'ultra', label: 'Ultra', multiplier: 5, basicScore: 500 },
  ],

  // Conditions shared by stages (seen on No Changing Channels; points per pick).
  conditions: {
    targetTime: [
      { label: '180s', points: 100 },
      { label: '120s', points: 300 },
      { label: '90s', points: 500 },
    ],
    enemyHp: [
      { label: '+50%', points: 40 },
      { label: '+100%', points: 60 },
      { label: '+150%', points: 100 },
    ],
    enemyAtk: [
      { label: '+25%', points: 10 },
      { label: '+50%', points: 30 },
      { label: '+75%', points: 50 },
    ],
    // Enemy <element> Resistance Up, for each element in stages[].resists.
    resistance: [
      { label: '+10%', points: 10 },
      { label: '+20%', points: 30 },
      { label: '+30%', points: 50 },
    ],
  },
  // Tally-only stages: every condition is worth 7x.
  tallyMultiplier: 7,

  // Rewards per stage by its best score (each paid once). Seen on No Changing
  // Channels and Imaginary Friends; tallyOnly stages give none. Item names
  // match the glossary (icons in public/icons/materials).
  milestones: [
    { score: 500, rewards: [['Fabricated Dice', 1], ['Fons', 30000], ['Beetle Coin', 100000]] },
    { score: 1000, rewards: [['Annulith', 40], ['Elite Hunter Guide', 8], ['Chaotic Dye', 8]] },
    { score: 2000, rewards: [['Beetle Coin', 50000], ['Senior Hunter Guide', 8], ['Colorless Dye', 8]] },
    { score: 3000, rewards: [['Expansion Core', 5], ['Heterogeneous Unit', 20]] },
    { score: 5000, rewards: [['Expansion Core', 2], ['Heterogeneous Unit', 10]] },
  ],

  stages: [
    {
      id: 'no-changing-channels',
      name: 'No Changing Channels',
      boss: 'Taygedo',
      levels: { easy: 42, hard: null, ultra: 72 },
      weakness: 'lakshana',
      resists: ['anima', 'incantation', 'chaos'],
      about:
        'An Oddity with a sea otter’s skin, a yellow coat and a TV for a head. Works as a repairman at Eibon Antique Shop.',
      bonusObjectives: [
        { text: 'Restores 25% HP to Taygedo the first time its HP falls below 50%.', points: 25 },
        {
          text: 'Reduces all allies’ CRIT Rate by 20%. Increases their CRIT Rate by 5% each time Critical Riposte is cast, up to 100%.',
          points: 25,
        },
        { text: 'Reduces the team’s Basic Attack and Ultimate DMG by 20%.', points: 25 },
      ],
    },
    {
      id: 'whats-your-name',
      name: 'What’s Your Name?',
      boss: 'Black Tome',
      levels: { hard: 67 },
      weakness: 'chaos',
      resists: ['cosmos', 'anima', 'lakshana'],
      about: 'A book that wants your name. “To become my master, you need only write down... your name.”',
      bonusObjectives: [
        {
          text: 'Prevents allies bound by the Black Tome from rejoining combat. Restores 25% of the Black Tome’s HP for each ally it binds.',
          points: 25,
        },
        { text: 'Disables the active character’s Redirect Skill for 5s whenever they’re hit by an enemy.', points: 25 },
        { text: 'Disables the active character’s Ultimate for 5s whenever they’re hit by an enemy.', points: 25 },
      ],
    },
    {
      id: 'heart-and-feather',
      name: 'Heart and Feather',
      tallyOnly: true,
      boss: 'The Arbiter',
      levels: { easy: 47 },
      weakness: null,
      resists: ['incantation', 'chaos', 'psyche'],
      about:
        'A Bio Anomaly from the anomaly known as “the witch-hunt”: once a human named Cotton, now host of the Oddity the Arbiter. Draws power from accusations, commands flames and burns any it deems a “witch”.',
      bonusObjectives: [
        { text: 'Increases each enemy’s ATK by 50% while its HP is above 50%, and its DEF by 150% while its HP is below 50%.', points: 700 },
        {
          text: 'Increases enemy HP, DEF, and All Resistances by 1% every 3s, up to 30%. Removes 1 stack of this increase whenever the character successfully uses Parry Attack.',
          points: 700,
        },
        { text: 'Increases enemy HP, DEF, and All Resistances by 20%.', points: 700 },
      ],
    },
    {
      id: 'the-endless-blue-flame',
      name: 'The Endless Blue Flame',
      boss: 'Headless Rider',
      levels: { hard: 67 },
      weakness: 'psyche',
      resists: ['cosmos', 'anima', 'incantation'],
      about:
        'A headless rider who roams the city streets at night on a black motorcycle, challenging street racers and taking their psyches with a scythe. “Bone-chilling blue flames will burn away all passion.”',
      bonusObjectives: [
        {
          text: 'Prevents the active character’s Normal Attacks from generating Cycle Energy during combat. Restores all allies’ Cycle Energy to full whenever an enemy enters the Broken state.',
          points: 25,
        },
        {
          text: 'Increases the Headless Rider’s Resistance to a random Esper Ability DMG type by 10% whenever its attack hits the active character.',
          points: 25,
        },
        {
          text: 'Increases all allies’ Redirect Skill cooldowns by 2s whenever an enemy attack hits the active character, up to 999s.',
          points: 25,
        },
      ],
    },
    {
      id: 'imaginary-friends',
      name: 'Imaginary Friends',
      boss: 'Teehee Bear',
      levels: { hard: 67 },
      weakness: 'incantation',
      resists: ['cosmos', 'psyche', 'lakshana'],
      about:
        'An Object Anomaly from the Anomaly known as “Cuddly Bear”, which can’t accept that the child it cared for has grown up and forgotten it. Looks like a plush toy that changes to suit the child it targets. “Revenge, all revenge... heh heh heh!!!”',
      bonusObjectives: [
        {
          text: 'Increases Teehee Bear’s ATK by 2% every 3s, up to a total increase of 20%. Increases its DEF by 50% upon reaching that cap.',
          points: 25,
        },
        {
          text: 'Increases enemy HP by 25%. Reduces the enemy’s HP by an additional 3% whenever the active character uses Parry Attack.',
          points: 25,
        },
        { text: 'Applies Disarray to the active character for 5s whenever an enemy attack hits, reversing movement controls.', points: 25 },
      ],
    },
    {
      // Matched by elimination (8 stages, 8 bosses) and the movie ticket stubs.
      id: 'curtain-call-courtesy',
      name: 'Curtain Call Courtesy',
      boss: 'Swallowtail',
      levels: { hard: 67 },
      weakness: 'anima',
      resists: ['chaos', 'psyche', 'lakshana'],
      about:
        'A massive, lumbering butterfly that drags a trail of movie ticket stubs, forever yearning for the sky. “Run away... but is escape even possible?”',
      bonusObjectives: [
        { text: 'Grants Swallowtail a Shield equal to 30% of its Max HP and increases its DEF by 50% at the start of battle.', points: 25 },
        { text: 'Reduces the active character’s Stamina by 30 each time they’re hit by an enemy attack, to a minimum of 0.', points: 25 },
        { text: 'Reduces the active character’s Ultimate Energy by 20 whenever they’re hit by an enemy, but not below 0.', points: 25 },
      ],
    },
    {
      id: 'twisted-fairy-tales',
      name: 'Twisted Fairy Tales',
      tallyOnly: true,
      boss: 'Mammon',
      levels: { easy: 47 },
      weakness: null,
      resists: ['cosmos', 'anima', 'lakshana'],
      about:
        'Sometimes, Anomalies work together for mutual gain. Just like now: Mammon, the wealth-devouring Anomaly, lurks in Cardboard Castle, waiting for the next hero foolish enough to walk right into its trap. “The next challenger to come knocking... Who will it be?”',
      bonusObjectives: [
        { text: 'Increases enemies’ HP by 25%. Causes all other surviving units to enter the Broken state whenever an enemy enters it.', points: 175 },
        { text: 'Increases all other surviving units’ ATK by 50% and DEF by 50% whenever an enemy is defeated.', points: 175 },
        { text: 'Enables enemies to land critical hits. Increases their Crit Rate by 50% and Crit DMG by 50%.', points: 175 },
      ],
    },
    {
      id: 'settle-your-tab',
      name: 'Settle Your Tab',
      boss: 'Debt Collector',
      levels: { hard: 67, ultra: 77 },
      weakness: 'cosmos',
      resists: ['incantation', 'chaos', 'psyche'],
      about:
        'An Anomaly born from the theft of time. It erases the effects of stolen time and reclaims what was gained through deception. Even the once-mighty Constantine family was ultimately brought to ruin by its relentless pursuit. “Ashes to ashes, dust to dust.”',
      bonusObjectives: [
        { text: 'Increases the Debt Collector’s ATK by 50% and DEF by 50% while its HP is below 50%.', points: 25 },
        { text: 'Causes all allies to lose 2% HP every 10s, but cannot reduce their HP below 20% of Max HP.', points: 25 },
        { text: 'Prevents enemies from entering the Broken state.', points: 25 },
      ],
    },
  ],
};
