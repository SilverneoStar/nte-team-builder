// Hunter's Crucible: the boss score-attack mode, for the Endgame tab (not
// shown on the site yet; filled in as screenshots arrive).
// Source: in-game screens the project owner shared (Nov 16, 2026).
//
// Each stage is one boss. Clearing it scores:
//   the difficulty's Basic Difficulty Score (500 on Easy)
//   + points for the conditions picked (bonus objectives, target time, enemy
//     buffs), all shown in game with their points,
// and the Difficulty Multiplier scales the score (x1 Easy ... x5 Ultra).
// TODO: confirm how the multiplier combines with the condition points.
//
// Stages marked tallyOnly (pink in game) give no score rewards of their own;
// their points only count toward the overall Score Reward total (and title).

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
    // Per stage, the boss's own element resistance: see stages[].resistance.
  },

  // Score milestones per stage (rewards by score; item names to confirm).
  milestones: [500, 1000, 2000, 3000, 5000],

  stages: [
    {
      id: 'no-changing-channels',
      name: 'No Changing Channels',
      boss: 'Taygedo',
      level: 42,
      about:
        'An Oddity with a sea otter’s skin, a yellow coat and a TV for a head. Works as a repairman at Eibon Antique Shop.',
      // Enemy <element> Resistance Up condition: +10% (10), +20% (30), +30% (50).
      resistance: { element: 'anima', steps: [{ label: '+10%', points: 10 }, { label: '+20%', points: 30 }, { label: '+30%', points: 50 }] },
      bonusObjectives: [
        { text: 'Restores 25% HP to Taygedo the first time its HP falls below 50%.', points: 25 },
        {
          text: 'Reduces all allies’ CRIT Rate by 20%. Increases their CRIT Rate by 5% each time Critical Riposte is cast, up to 100%.',
          points: 25,
        },
        { text: 'Reduces the team’s Basic Attack and Ultimate DMG by 20%.', points: 25 },
      ],
    },
    { id: 'whats-your-name', name: 'What’s Your Name?' },
    { id: 'heart-and-feather', name: 'Heart and Feather', tallyOnly: true },
    { id: 'the-endless-blue-flame', name: 'The Endless Blue Flame' },
    { id: 'imaginary-friends', name: 'Imaginary Friends' },
    { id: 'curtain-call-courtesy', name: 'Curtain Call Courtesy' },
    { id: 'twisted-fairy-tales', name: 'Twisted Fairy Tales', tallyOnly: true },
    { id: 'settle-your-tab', name: 'Settle Your Tab' },
  ],
};
