// Which skills to level first, per character. Each entry is a list of tiers,
// best first; skills in one tier are equal. Keys: B Basic Attack, S Skill
// (Redirect Skill), U Ultimate, P Support Skill, X Passive Skills.
// Sources: Icy Veins character build guides (read Nov 2026); Elyms from an
// in-game skill screen the project owner shared (global 1.5).
// alt: a second order for a different use, with its label.

export const SKILL_KEYS = {
  B: 'Basic Attack',
  S: 'Skill',
  U: 'Ultimate',
  P: 'Support Skill',
  X: 'Passives',
};

const p = (order, note, alt) => ({
  tiers: order.split('>').map((t) => t.split('=').map((k) => k.trim())),
  note,
  ...(alt ? { alt: { label: alt[0], tiers: alt[1].split('>').map((t) => t.split('=').map((k) => k.trim())) } } : {}),
});

export const SKILL_PRIORITY = {
  adler: p('S > U > B > P', 'Most of his damage comes from his Skill and Ultimate.'),
  aurelia: p('B > U > S = P', 'Her Basic Attacks are her main damage.'),
  baicang: p('S > U > B > P', 'His Skill is his second main source of damage.'),
  blackbird: p('U = B > S > P', 'As an attacker; as a support, level her Skill first.', ['As support', 'S > U > B > P']),
  chaos: p('B > U > S > P', 'His Final Verdict Basic Attack does a big chunk of his damage.'),
  daffodill: p('S > U > B > P', 'Her Skill does most of her Break.'),
  edgar: p('S = U > P > B', 'He heals almost only with his Skill and Ultimate.'),
  elyms: p('U > S > B > P', 'Her Ultimate carries the team buff. Unlock the Support Skill’s bonus nodes as soon as you can.'),
  fadia: p('U > S > B > P', 'Her Ultimate is her main damage and her own healing.'),
  haniel: p('S > U > B > P', 'Her Skill and Ultimate both give team ATK% that grows with level.'),
  hathor: p('S > U > B > P', 'She builds Express Delivery Power, then spends it after her Ultimate.'),
  hotori: p('U = S > B > P', 'A secondary damage dealer; much of her damage is from her skills.'),
  iroi: p('S > U > B > P', 'Her Skill is her main healing and also hits hard.'),
  jiuyuan: p('U = B > S > P', 'Most of her damage is her Ultimate and Rose Pact Bullets.'),
  lacrimosa: p('B > S = U > P', 'Her Basic Attack scales the Nightmare damage over time.'),
  linko: p('P > U > B > S', 'Her Support Skill level sets her Synced Strikes’ damage.'),
  mint: p('S > B > U > P', 'Her Skill is her main damage.'),
  nanally: p('B = U > S > P', 'Most of her damage is her Basic Attacks and the enhanced ones from her Ultimate.'),
  sakiri: p('U > S > B > P', 'Her Ultimate gives most of her damage and her team ATK buff.'),
  shinku: p('B > U > S > P', 'Her Basic Attack is used often and makes up a big chunk of her damage.'),
  skia: p('U = X > S = B > P', 'His Ultimate is his main damage.'),
  zankou: p('U = B > S > P', 'Her damage over time comes from her Ultimate and Basic Attack.'),
  zero: p('U > S > B = P', 'The Ultimate comes first.'),
};
