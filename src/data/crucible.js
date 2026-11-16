// Hunter's Crucible: the boss score-attack mode, for the Endgame tab (not
// shown on the site yet; filled in as screenshots arrive).
// Source: in-game screens the project owner shared (Nov 16, 2026).
//
// Each stage is one boss. A clear scores
//   (Basic Difficulty Score 500 + points of the conditions picked) x multiplier
// (x1 Easy, x2 Normal, x3 Hard, x5 Ultra). Checked against the game's totals:
// Taygedo on Ultra (500 + 600) x 5 = 5,500; Black Tome on Hard (500 + 600) x 3
// = 3,300. Bosses get stronger with difficulty (Taygedo Lv 42 Easy, 72 Ultra).
//
// Conditions: up to 3 bonus objectives, a target time, Enemy HP Up, Enemy
// ATK Up and Enemy <element> Resistance Up for the 3 elements the boss isn't
// weak to. weakness: the element shown by the boss's level with a red down
// arrow.
//
// Stages marked tallyOnly (pink in game) give no score rewards of their own;
// their points only count toward the overall Score Reward total (and title).
// Their condition points are 7x the usual (e.g. 90s target time: 3,500).

export const CRUCIBLE = {
  // Score Reward bar across all stages.
  scoreRewardTotal: 12000,

  difficulties: [
    { id: 'easy', label: 'Easy', multiplier: 1, basicScore: 500 },
    { id: 'normal', label: 'Normal', multiplier: 2, basicScore: null },
    { id: 'hard', label: 'Hard', multiplier: 3, basicScore: null },
    { id: 'ultra', label: 'Ultra', multiplier: 5, basicScore: null },
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

  // Score milestones per stage (rewards by score; item names to confirm).
  milestones: [500, 1000, 2000, 3000, 5000],

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
    { id: 'imaginary-friends', name: 'Imaginary Friends' },
    { id: 'curtain-call-courtesy', name: 'Curtain Call Courtesy' },
    { id: 'twisted-fairy-tales', name: 'Twisted Fairy Tales', tallyOnly: true },
    { id: 'settle-your-tab', name: 'Settle Your Tab' },
  ],
};
