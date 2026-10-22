// Recommended order to unlock Awakenings as duplicates come in (each duplicate
// unlocks one Awakening of your choice, in any order).
// Source (Oct 2026): Icy Veins "Guide and Best Builds" page for each character
// (https://www.icy-veins.com/neverness-to-everness/<name>-guide-best-builds),
// which ranks all six. Akane: guides only rank her first pick so far (A1 for its
// Crit Rate; Gurugamer, mone.gg, Oct 2026). `alt`: a note when another playstyle changes the order.

const o = (order, alt = null) => ({ order, alt });

export const AWAKENING_ORDER = {
  adler: o(['A1', 'A6', 'A2', 'A5', 'A3', 'A4'], 'Shield-focused: take A3, A6 and A4 first.'),
  aurelia: o(['A6', 'A1', 'A2', 'A5', 'A3', 'A4']),
  baicang: o(['A1', 'A6', 'A2', 'A5', 'A3', 'A4']),
  blackbird: o(['A1', 'A3', 'A6', 'A5', 'A4', 'A2'], 'Support build: A4 → A5 → A6 → A1 → A3 → A2.'),
  chaos: o(['A2', 'A6', 'A3', 'A1', 'A4', 'A5'], 'Against a single boss, take A5 before A4.'),
  chiz: o(['A6', 'A4', 'A5', 'A2', 'A1', 'A3']),
  daffodill: o(['A5', 'A3', 'A4', 'A2', 'A1', 'A6']),
  edgar: o(['A3', 'A5', 'A6', 'A2', 'A1', 'A4']),
  fadia: o(['A2', 'A3', 'A6', 'A5', 'A4', 'A1'], 'Against bosses, A5 can go before A6.'),
  haniel: o(['A2', 'A6', 'A1', 'A3', 'A5', 'A4']),
  hathor: o(['A2', 'A1', 'A6', 'A5', 'A4', 'A3'], 'If you often overcap stacks, take A1 first.'),
  hotori: o(['A6', 'A2', 'A1', 'A5', 'A3', 'A4']),
  iroi: o(['A5', 'A1', 'A2', 'A3', 'A4', 'A6'], 'If the team keeps dying, take A3 first. Some guides rate A2 highest.'),
  jiuyuan: o(['A2', 'A6', 'A1', 'A5', 'A3', 'A4']),
  lacrimosa: o(['A6', 'A4', 'A1', 'A5', 'A3', 'A2'], 'Without a Cycle-reaction team, A4 and A1 can beat A6.'),
  linko: o(['A5', 'A6', 'A1', 'A3', 'A4', 'A2']),
  mint: o(['A1', 'A5', 'A3', 'A2', 'A4', 'A6']),
  nanally: o(['A6', 'A3', 'A5', 'A1', 'A2', 'A4']),
  sakiri: o(['A4', 'A5', 'A3', 'A2', 'A1', 'A6']),
  shinku: o(['A2', 'A3', 'A6', 'A1', 'A4', 'A5'], 'For smoother play, take A5 (interrupt resistance) first.'),
  skia: o(['A6', 'A4', 'A1', 'A5', 'A2', 'A3']),
  zankou: o(['A5', 'A1', 'A2', 'A4', 'A6', 'A3'], 'If interrupts are a problem, take A3 earlier.'),
  zero: o(['A2', 'A3', 'A4', 'A5', 'A1', 'A6']),
  akane: o(['A2', 'A5', 'A6', 'A4', 'A3', 'A1'], 'Against groups, A3 rises; take A1 earlier if she keeps getting interrupted.'),
};

export const ORDINAL = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
