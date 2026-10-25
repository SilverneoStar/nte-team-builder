// The six elements, in Esper Cycle order. Each element reacts with its two
// neighbours on the ring (index - 1 and index + 1, wrapping around).
// Colours match the in-game Esper Cycle; values are theme tokens in styles.css.
// Reaction effects follow the in-game Esper Cycle descriptions (Oct 2026).
export const ELEMENTS = [
  { id: 'cosmos', name: 'Cosmos', color: 'var(--el-cosmos)' },
  { id: 'anima', name: 'Anima', color: 'var(--el-anima)' },
  { id: 'incantation', name: 'Incantation', color: 'var(--el-incantation)' },
  { id: 'chaos', name: 'Chaos', color: 'var(--el-chaos)' },
  { id: 'psyche', name: 'Psyche', color: 'var(--el-psyche)' },
  { id: 'lakshana', name: 'Lakshana', color: 'var(--el-lakshana)' },
];

// Upcoming characters whose element isn't confirmed use 'unknown'. It is not
// in ELEMENTS, so it never shows in filters or the Esper Cycle.
export const UNKNOWN_ELEMENT = { id: 'unknown', name: 'Unconfirmed', color: '#9aa0ad' };
export const ELEMENT_BY_ID = { ...Object.fromEntries(ELEMENTS.map((e) => [e.id, e])), unknown: UNKNOWN_ELEMENT };

// Pair reactions: one per neighbouring pair on the ring.
// "kind" groups them the way the community describes them.
export const PAIR_REACTIONS = [
  {
    id: 'blossom',
    name: 'Blossom',
    elements: ['cosmos', 'anima'],
    kind: 'Amplify',
    effect: 'After Esper Cycle, plants a Vita Bud that blossoms into 5 Vita Pistils, which fly at nearby enemies and explode every 2s for area DMG. Up to 3 Vita Buds at once.',
  },
  {
    id: 'hexed',
    name: 'Hexed',
    elements: ['anima', 'incantation'],
    kind: 'Weaken',
    effect: 'For 12s after Esper Cycle, the target takes an extra follow-up attack equal to 20% of the Anima or Incantation DMG it takes.',
  },
  {
    id: 'scorch',
    name: 'Scorch',
    elements: ['incantation', 'chaos'],
    kind: 'Amplify',
    effect: 'Burns the target with damage over time for 15s after Esper Cycle.',
  },
  {
    id: 'nova',
    name: 'Nova',
    elements: ['chaos', 'psyche'],
    kind: 'Control',
    effect: 'Marks the target for 5s after Esper Cycle; when the mark ends, the target takes massive Mental DMG.',
  },
  {
    id: 'stain',
    name: 'Stain',
    elements: ['psyche', 'lakshana'],
    kind: 'Weaken',
    effect: 'The target takes 20% more Psyche and Lakshana DMG for 12s after Esper Cycle.',
  },
  {
    id: 'remora',
    name: 'Remora',
    elements: ['lakshana', 'cosmos'],
    kind: 'Control',
    effect: 'Slows the target’s movement and attack speed for 5s after Esper Cycle. The slow fades over time and is shorter if reapplied.',
  },
];

// Trio reactions need three neighbouring elements.
export const TRIO_REACTIONS = [
  {
    id: 'charge',
    name: 'Charge',
    elements: ['lakshana', 'cosmos', 'anima'],
    effect: 'The active character gains 10 extra Ultimate Energy when Vita Pistils (Blossom) hit a target in Remora.',
  },
  {
    id: 'discord',
    name: 'Discord',
    elements: ['incantation', 'chaos', 'psyche'],
    effect: 'Removes part of the target’s Break bar while it has both Nova and Scorch.',
  },
];

export const ROLES = ['Damage', 'Buff', 'Survival'];
