// Full passive text for every S-rank Arc, keyed by Arc id.
// `text` is the effect with a single copy (M1); `max` lists the values that
// change when the Arc is fully mixed (M5). Everything else stays the same.
// Sources (Oct 2026): GameWith Arc pages (Default and max mixing), Icy Veins
// weapon pages for Crime and Punishment, Ravenous Blade and Voice of the
// Voyager (base text only, so no `max` line), and the in-game text for
// Far Side of the Moon.

export const ARC_PASSIVES = {
  'blow-up-the-crowd': {
    name: 'Beat King',
    text: [
      'While the wearer is on standby, the current character’s ATK +10%. Each time the wearer deals damage, this bonus gains another +2% ATK (up to 4 stacks, at most 1 stack every 2s). The bonus is removed when the wearer is switched in.',
      'While the wearer is the current character, their Psyche Esper Ability DMG +12%. Each Basic Attack that deals Psyche DMG adds another +2% (up to 10 stacks, at most once every 0.3s). The stacks reset when the wearer is switched out.',
    ],
    max: 'Standby ATK +14%, +3.2% per stack; Psyche Esper Ability DMG +20%, +3.2% per stack.',
  },
  'blushing-mirage': {
    name: 'Moonphase Shift',
    text: [
      'ATK +16%.',
      'After the wearer uses their Ultimate, their Cosmos DMG +30% and they ignore 12% of enemy DEF for 20s. Triggering it again resets the duration.',
    ],
    max: 'ATK +32%; Cosmos DMG +60%; ignores 24% DEF.',
  },
  'camellia-society': {
    name: 'Silent Garden',
    text: [
      'When the wearer loses HP while at full HP, their CRIT DMG +12% for 5s (up to 4 stacks), and the Arc Effect “Silent Garden” becomes available.',
      'Silent Garden consumes 5% of the wearer’s current HP and randomly casts one of two attacks (25s cooldown): Scathing Reproach, 5 hits of Incantation DMG at 24% ATK each, or Endless Slander, 6 hits at 18% ATK each with the final hit dealing double.',
    ],
    max: 'CRIT DMG +20% per stack; Scathing Reproach 40% ATK per hit; Endless Slander 30% ATK per hit.',
  },
  'contemplative-cat': {
    name: 'Mammon',
    text: ['For every 100,000 Fons the wearer holds, their Cosmos DMG +2.5% (up to 10 stacks).'],
    max: 'Cosmos DMG +4.5% per stack.',
  },
  'crime-and-punishment': {
    name: 'Twinflight',
    text: [
      'Cycle Intensity +72. The wearer’s Psyche DMG +20%.',
      'For 15s after the wearer casts their Ultimate, the whole team’s CRIT DMG +16%, and the wearer gains an extra +32% CRIT DMG. Triggering it again resets the duration.',
    ],
  },
  'day-off': {
    name: 'Eclipse',
    text: [
      'The wearer’s ATK +30%.',
      'Unlocks the Tuned Arc “Eclipse”: for 40s, each enemy defeated restores 6 Ultimate Energy (up to 5 times). 300s cooldown.',
    ],
    max: 'ATK +50%.',
  },
  'eternal-waltz': {
    name: 'Arachne',
    text: ['HP +20%.', 'When the wearer uses their Ultimate, their Mental DMG +10% for 10s.'],
    max: 'HP +32%; Mental DMG +18%.',
  },
  'far-side-of-the-moon': {
    name: 'Far Side of the Moon',
    text: [
      'CRIT Rate +15%. The wearer’s Redirect Skill DMG +7%.',
      'For 15s after casting a Redirect Skill, the wearer’s Basic Attack DMG +28% and Lakshana DMG +16%.',
    ],
  },
  'fluff-of-fearlessness': {
    name: 'Popping Candy',
    text: ['After the wearer uses their Ultimate, their ATK +25% for 10s. This effect does not stack.'],
    max: 'ATK +45%.',
  },
  'fluff-of-ferocity': {
    name: 'Knight’s Candy',
    text: ['Each time the wearer scores a critical hit, their CRIT DMG +4% for 10s (up to 10 stacks). Adding a stack refreshes the duration.'],
    max: 'CRIT DMG +7.2% per stack.',
  },
  'fluff-of-finesse': {
    name: 'Thief’s Candy',
    text: ['Each time the wearer performs a Critical Dodge, their DMG dealt +8% for 10s (up to 3 stacks). Adding a stack refreshes the duration.'],
    max: 'DMG dealt +14.4% per stack.',
  },
  'fluff-of-fleetness': {
    name: 'Motor Candy',
    text: ['While the wearer is the current character, their ATK +5% every second (up to 5 stacks). The stacks reset when the wearer returns to standby.'],
    max: 'ATK +9% per stack.',
  },
  'fluff-of-fortitude': {
    name: 'Jawbreaker’s Candy',
    text: ['The wearer’s DMG dealt +22%, rising to +28% against enemies below 50% HP.'],
    max: 'DMG dealt +38%, or +52% against enemies below 50% HP.',
  },
  'good-boys-grand-adventure': {
    name: 'Morphix',
    text: [
      'Charge Efficiency +18%.',
      'When the wearer uses their Ultimate, all team members’ ATK +10% for 20s. If enemies are hit by the Ultimate’s interrupt effect, all team members gain another +6% ATK. Effects of the same name don’t stack.',
    ],
    max: 'Charge Efficiency +30%; team ATK +16%, plus another +10%.',
  },
  'hethereaus-keeper': {
    name: 'Justice Executioner',
    text: [
      'ATK +15%. DMG dealt to bosses +15%.',
      'Unlocks the Arc Effect “Officer Whisker”: summons a helper that attacks continuously for 30s, each attack dealing 100% of the wearer’s ATK. 60s cooldown.',
    ],
    max: 'ATK +25%; boss DMG +25%; Officer Whisker attacks deal 200% ATK.',
  },
  'marching-beyond-time': {
    name: 'Time Beyond Time',
    text: [
      'ATK +16%.',
      'After using a Redirect Skill, the wearer enters the “Wastelab” state and clears their Wastetime stacks. Each teammate Redirect or Support Skill grants a Wastetime stack (up to 3).',
      'An Ultimate used in Wastelab consumes all stacks for Ultimate CRIT DMG +24%, plus +8% per stack consumed. Consuming 3 stacks at once also ignores 12% of enemy DEF for 70s.',
    ],
    max: 'ATK +32%; Ultimate CRIT DMG +48%, plus +16% per stack; ignores 24% DEF.',
  },
  'raging-flames': {
    name: 'Headless Rider',
    text: [
      'Lakshana Esper Ability DMG +15%.',
      'Using an Ultimate raises the wearer’s Redirect Skill and Ultimate DMG +10% for 10s. While it’s active, each Redirect Skill adds another +5% Redirect Skill DMG (up to 2 stacks).',
    ],
    max: 'Lakshana Esper Ability DMG +25%; Redirect Skill and Ultimate DMG +20%; +9% per Redirect Skill stack.',
  },
  'ravenous-blade': {
    name: 'Cursed Blade - Soulbound',
    text: [
      'CRIT Rate +16%.',
      'When the wearer deals Incantation DMG, their CRIT DMG +9% for 15s (up to 7 stacks, at most 1 stack every 0.3s). Triggering it again resets the duration.',
    ],
  },
  'ready-ready': {
    name: 'Commander Tiger Talisman',
    text: [
      'ATK +15%.',
      'Using a Redirect Skill or Ultimate raises the wearer’s Basic Attack and Critical Riposte DMG +15% for 15s (up to 2 stacks).',
      'A Redirect Skill grants the “Left Tiger Talisman” and an Ultimate grants the “Right Tiger Talisman”. Getting the other talisman within 15s unlocks the Arc Effect “Commander Tiger Talisman”: DMG dealt to bosses +10% for 10s.',
    ],
    max: 'ATK +30%; Basic Attack and Critical Riposte DMG +30% per stack.',
  },
  'reality-refuge': {
    name: 'Swallowtail',
    text: [
      'Anima Esper Ability DMG +15%.',
      'The wearer’s Attachment DMG +10%. After using an Ultimate, the bonus becomes +20% for 6s. This effect does not stack.',
    ],
    max: 'Anima Esper Ability DMG +25%; Attachment DMG +15%, or +30% after an Ultimate.',
  },
  'song-of-the-whale': {
    name: 'Deep Blue Sorrow',
    text: [
      'ATK +12%. The wearer’s DMG dealt to Broken enemies +12%.',
      'Defeating an enemy while it’s Broken restores 30% of the wearer’s HP. Can trigger once every 30s.',
    ],
    max: 'ATK +20%; DMG to Broken enemies +20%.',
  },
  'stellar-veil': {
    name: 'Aqua Astra',
    text: [
      'The wearer’s Psyche Esper Ability DMG +12%.',
      'When the wearer deals Psyche Esper Ability DMG, their CRIT DMG +2% for 5s (up to 10 stacks, at most 1 stack every 0.1s).',
    ],
    max: 'Psyche Esper Ability DMG +21%; CRIT DMG +3.6% per stack.',
  },
  'tears-beneath-the-mask': {
    name: 'Nestbound Bird',
    text: ['When the wearer hits an enemy with their Ultimate, it inflicts “Warning Gaze”: the enemy’s DMG dealt −18% for 20s. This effect does not stack.'],
    max: 'Enemy DMG dealt −30%.',
  },
  'the-last-rose': {
    name: 'Bohemian Rose',
    text: [
      'ATK +14%.',
      'Each time the wearer deals DoT, they gain 1 stack of “Chaos Thorn”: CRIT DMG +6% for 3s (up to 10 stacks, at most once every 0.3s). Adding a stack refreshes the duration. Using a Redirect Skill grants 10 stacks at once.',
      'Damaging a Broken enemy extends its Broken state by 3s (once per Broken state per enemy).',
    ],
    max: 'ATK +28%; CRIT DMG +12% per Chaos Thorn stack.',
  },
  'the-rain-that-shook-the-world': {
    name: 'Hypervortex',
    text: [
      'The wearer’s Cosmos Esper Ability DMG from Redirect Skills and Ultimates +30%.',
      'After using a Redirect Skill, the wearer’s Cycle Intensity +36 for 15s. Triggering it again refreshes the duration.',
    ],
    max: 'Cosmos Esper Ability DMG +42%; Cycle Intensity +72.',
  },
  'the-wrong-gate': {
    name: 'Reverie Gate',
    text: [
      'ATK +16%.',
      'When the wearer heals, allies’ DMG dealt +15% and the wearer’s Anima DMG +30% for 20s. Triggering it again resets the duration. Only one copy of this effect works per team.',
    ],
    max: 'ATK +32%; allies’ DMG +30%; Anima DMG +60%.',
  },
  'voice-of-the-voyager': {
    name: 'Golden Record',
    text: [
      'ATK +24%. The wearer’s Support Skill CRIT DMG +66%.',
      'Dealing DMG with a triggered Support Skill raises the wearer’s Ultimate CRIT DMG +22% for 3s (up to 3 stacks). Triggering it again resets the duration.',
    ],
  },
  'whats-desired': {
    name: 'Golden Fleece',
    text: [
      'The wearer’s Lakshana DMG +25%.',
      'When the wearer casts a Redirect Skill or Ultimate, their CRIT DMG +40% for 20s. Triggering it again resets the duration.',
    ],
    max: 'Lakshana DMG +50%; CRIT DMG +80%.',
  },
  'your-happiness-is-priceless': {
    name: 'Nacupeda',
    text: [
      'HP +24%.',
      'When the wearer uses their Ultimate, one of these happens at random (once every 30s): the team member with the lowest HP % recovers 20% of their max HP; the wearer gains a shield worth 20% of their max HP for 15s; or all team members recover 10% HP.',
    ],
    max: 'HP +40%; heal 40%; shield 40%; team heal 20%.',
  },
  'youthful-fantasy': {
    name: 'Black Tome',
    text: [
      'Break Intensity +60.',
      'The Black Tome starts sealed by two chains. Each Support Skill used by any team member breaks one. Once both are broken, the Black Tome is summoned for 20s and marks one enemy every 5s.',
      'The wearer’s Chaos Esper Ability DMG against the marked enemy +20%. When the marked enemy takes Break DMG, the Black Tome deals Chaos Esper Ability DMG equal to 200% of the wearer’s ATK.',
    ],
    max: 'Break Intensity +88; DMG vs marked enemy +36%; Black Tome hit 320% ATK.',
  },
};
