// Kit checks: things in an Esper's own kit that only work with the right
// teammates, shown in Cortado's team check as a ticked or open line.
//
// Two kinds:
//  - Passive 1 reaction boosts (data/passives.js `boosts`) are checked for every
//    Esper automatically: can this team trigger that reaction?
//  - Anything else lives here, per Esper. `test(team)` gets the team's
//    characters (the Esper itself included) and returns the teammates that make
//    it work (an empty array when nothing does); `ok(names)` and `miss` are the
//    lines shown.
//
// Add an entry when a kit gets stronger from a specific kind of teammate.

const others = (team, id) => team.filter((c) => c.id !== id);

export const KIT_CHECKS = {
  exe: [
    {
      // Burst Overclock (Passive 2): DMG Bonus stacks per allied summon hit;
      // A4 (kill Process) and Dotted Horizon also raise all summons' DMG.
      test: (team) => others(team, 'exe').filter((c) => c.summons),
      ok: (team) =>
        `Exe: ${team.map((c) => `${c.name} (${c.summons})`).join(' and ')} also ${team.length > 1 ? 'summon' : 'summons'}, so his Burst Overclock DMG stacks build faster, and his A4 and Dotted Horizon boost those summons too.`,
      miss: 'Exe: no other summoner, so his Burst Overclock DMG stacks come only from his own Digital Echoes. A summoner such as Haniel (Hootie) or Nanally adds more.',
    },
  ],
};
