// Community team archetypes (Game8 Best Team Compositions and per-Esper pages, Nov 2026; Mobalytics team guide, Nov 2026, and Game Rant's Elyms teams; Icy Veins team pages for Edgar, Mint, Skia and Aurelia),, then kit-based ideas marked `idea: true` (Mobalytics team guide, Sep 2026; Blackbird,
// Aurelia, Mint and Skia teams from Kaiden, Icy Veins, GameWith and other community guides,
// Oct 2026; Akane Rin teams from Gurugamer, mone.gg and TopUpLive, Oct 2026,
// pre-release ideas until she is out on global). Loading one copies it into the team you're editing, with each
// member's recommended kit (see presetLoadouts).
import { CHARACTER_BY_ID } from './characters.js';
import { bestBuild } from './bestBuild.js';

// Every team, community and kit idea. The kit ideas are hidden for now (Nov
// 2026): players found some of them don't work in practice, so the site only
// shows teams community guides recommend. They stay here to revisit.
export const ALL_PRESETS = [
  // Game8's Best Team Compositions (screenshots from the project owner, Nov
  // 21, 2026). Teams it shares with the guides below are listed once, there.
  { name: 'Akane Rin Synced', members: ['akane', 'blackbird', 'linko', 'elyms'], why: 'Akane Rin stays on field building String Energy; Blackbird enables Stain, Linko adds Synced Strikes and Elyms supports Remora. Hathor can take Elyms’s place.' },
  { name: 'Blackbird Stain', members: ['blackbird', 'chaos', 'hathor', 'elyms'], why: 'Blackbird leads on field with Chaos and Hathor on Lakshana reactions; Elyms speeds up Cycles and keeps Remora up. Esper Zero can take Elyms’s place.' },
  { name: 'Linko Hexed', members: ['linko', 'zankou', 'sakiri', 'iroi'], why: 'Linko’s Synced Strikes and RES shred for Zankou’s Hexed team; Sakiri buffs and Iroi heals. Daffodill can take Iroi’s place.' },
  { name: 'Zankou Scorch', members: ['zankou', 'lacrimosa', 'sakiri', 'iroi'], why: 'Sustained Scorch and DoT: Lacrimosa adds Nightmare, Sakiri DoT pressure and Iroi healing. Linko is an offensive option for Iroi.' },
  { name: 'Chaos Stain', members: ['chaos', 'blackbird', 'elyms', 'fadia'], why: 'Room for Chaos’s Lakshana attacks: Blackbird enables Stain, Elyms adds Cycle support and Fadia protects.' },
  { name: 'Hotori Time Stop', members: ['hotori', 'nanally', 'iroi', 'elyms'], why: 'Hotori records and replays allied skills; Nanally deals steady damage, Elyms buffs and Iroi enables Blossom. Esper Zero can take Elyms’s place.' },
  { name: 'Nanally Follow-Up', members: ['nanally', 'linko', 'elyms', 'sakiri'], why: 'Follow-Up hypercarry: Linko’s Synced Strikes, Elyms’s off-field attacks and Sakiri’s Hexed and ATK.' },
  { name: 'Hathor Stain Charge', members: ['hathor', 'blackbird', 'iroi', 'elyms'], why: 'Blackbird enables Stain, Elyms helps with Remora and fast Cycles, Iroi brings Blossom and healing. Esper Zero can take Elyms’s place.' },
  { name: 'Mint F2P', members: ['mint', 'zero', 'skia', 'adler'], why: 'Budget Anima team: Zero and Skia set up Blossom, Remora and Charge; Adler shields.' },
  { name: 'Skia F2P Charge', members: ['skia', 'mint', 'zero', 'haniel'], why: 'Mint and Zero produce Blossom and Remora; Haniel boosts ATK and adds Stain.' },
  { name: 'Chiz F2P Charge', members: ['chiz', 'skia', 'mint', 'adler'], why: 'Starter Charge team: Skia brings Remora and Mint Blossom; Adler shields and adds Hexed. Haniel instead gives more ATK and Stain.' },
  // Game8's per-Esper pages (Edgar, Chaos, Baicang, Aurelia; PDFs from the
  // project owner, Nov 21, 2026).
  { name: 'Edgar Charge Support', members: ['edgar', 'hathor', 'nanally', 'jiuyuan'], why: 'Charge team where Edgar refills the active Esper’s Ultimate Energy. Skia can take Hathor’s place, Mint Nanally’s, and Esper Zero Jiuyuan’s for faster Cycles.' },
  { name: 'Edgar Blossom Support', members: ['edgar', 'nanally', 'zero', 'jiuyuan'], why: 'Blossom team: Edgar heals, Esper Zero triggers Blossom and Jiuyuan strengthens it. Mint can take Nanally’s place.' },
  { name: 'Chaos Remora', members: ['chaos', 'hathor', 'zero', 'haniel'], why: 'Chaos’s best team: his explosion grows with Remora’s duration, which Hathor extends. Skia can take Hathor’s place; Fadia Haniel’s for more survival.' },
  { name: 'Chaos Stain (Haniel)', members: ['chaos', 'zero', 'fadia', 'haniel'], why: 'Stain raises the Lakshana DMG Chaos spends his field time on; Haniel buffs and Fadia protects. Game8’s text also suggests Blackbird for Stain.' },
  // Exe teams from the project owner (Nov 2026): a premium pick with his
  // current limited teammates and a free-to-play one for new players.
  { name: 'Exe Premium', members: ['exe', 'blackbird', 'sakiri', 'haniel'], why: 'His current best team: Blackbird and Sakiri support his Chaos damage and Haniel buffs ATK, with Hootie adding another summon for Burst Overclock’s DMG stacks. Iroi can take Haniel’s place for healing.' },
  { name: 'Exe F2P', members: ['exe', 'sakiri', 'haniel', 'daffodill'], why: 'Free-to-play option for new players: Sakiri and Haniel buff him (Hootie also counts as a summon for his DMG stacks) and Daffodill breaks enemies for the team.' },
  // Exe teams from @Nteupdates' Exe guide (Nov 2026), ahead of his release.
  // Its "prediction" team with unreleased Espers is left out.
  { name: 'Exe Synced', members: ['exe', 'blackbird', 'linko', 'sakiri'], why: 'Blackbird and Sakiri support Exe’s Chaos damage; Linko adds Synced Strikes.' },
  { name: 'Exe Sustain', members: ['exe', 'blackbird', 'sakiri', 'iroi'], why: 'Iroi heals and buffs the team.' },
  { name: 'Exe Scorch', members: ['exe', 'blackbird', 'zankou', 'sakiri'], why: 'Zankou adds Scorch and Blackbird Nova for Discord.' },
  { name: 'Exe Hootie', members: ['exe', 'haniel', 'sakiri', 'iroi'], why: 'Haniel buffs ATK and summons Hootie; Iroi heals.' },
  { name: 'Exe Break', members: ['exe', 'daffodill', 'sakiri', 'adler'], why: 'Daffodill breaks and Adler shields.' },
  { name: 'Exe Nova', members: ['exe', 'blackbird', 'fadia', 'sakiri'], why: 'Fadia protects while Blackbird and Sakiri support.' },
  { name: 'Esper Zero F2P', members: ['zero', 'mint', 'haniel', 'sakiri'], why: 'Beginner Blossom and Hexed team around Zero’s fast Cycles.' },
  // Version 1.5 teams (Mobalytics team guide, Nov 2026; Game Rant's Elyms
  // teams, Nov 11, 2026).
  { name: 'Mono Blossom (Elyms)', members: ['nanally', 'jiuyuan', 'elyms', 'hotori'], why: 'Blossom team for the upper half of the Esper Cycle; pairs with Shinku Charge.' },
  { name: 'Shinku Charge (Elyms)', members: ['shinku', 'iroi', 'elyms', 'akane'], why: 'Elyms gives Shinku a Charge boost and keeps energy flowing; Akane Rin extends Remora and Iroi heals and buffs.' },
  { name: 'Hyper Chiz', members: ['chiz', 'iroi', 'akane', 'elyms'], why: 'Charge team built around Chiz.' },
  { name: 'Elyms Remora', members: ['elyms', 'akane', 'blackbird', 'iroi'], why: 'Elyms and Akane Rin keep Remora up; Blackbird buffs Lakshana DMG and triggers Stain with Akane Rin. Game8 has it too, with Esper Zero as a swap for Elyms.' },
  { name: 'Elyms F2P', members: ['elyms', 'chiz', 'hathor', 'jiuyuan'], why: 'Chiz deals the damage; Hathor extends Remora and Jiuyuan doubles Blossom’s Vita Buds.' },
  { name: 'Lacrimosa Discord', members: ['lacrimosa', 'sakiri', 'zankou', 'blackbird'], why: 'Scorch, Nova and Discord for the lower half of the Esper Cycle.' },
  { name: 'Zankou Hexed (Lacrimosa)', members: ['zankou', 'linko', 'lacrimosa', 'sakiri'], why: 'Hexed with Scorch on the side.' },
  { name: 'Baicang Hexed', members: ['baicang', 'lacrimosa', 'sakiri', 'linko'], why: 'Hexed plus Scorch, with Baicang on damage.' },
  // Per-character team pages (Icy Veins, Sep–Oct 2026).
  { name: 'Edgar F2P Charge', members: ['edgar', 'mint', 'skia', 'haniel'], why: 'All A-rank: a Charge team where Edgar heals and refills Ultimate Energy.' },
  { name: 'Skia Charge', members: ['skia', 'iroi', 'hotori', 'zero'], why: 'Skia on field with Iroi supporting and Hotori and Zero as sub-DPS.' },
  { name: 'Mint Charge', members: ['mint', 'sakiri', 'zero', 'skia'], why: 'Charge reactions; Sakiri adds team-wide damage buffs.' },
  { name: 'Mint Blossom', members: ['mint', 'nanally', 'chiz', 'haniel'], why: 'Stacks Blossom Cycle enhancements.' },
  { name: 'Mint Charge (Shinku)', members: ['mint', 'zero', 'shinku', 'skia'], why: 'Zero and Shinku trigger Charge often, so Mint casts her Ultimate more.' },
  { name: 'Aurelia Discord', members: ['aurelia', 'daffodill', 'haniel', 'sakiri'], why: 'Daffodill breaks and adds Nova with Aurelia; Haniel buffs and Sakiri adds Scorch for Discord. Fadia can take Haniel’s place, Adler Sakiri’s.' },
  { name: 'Mono Blossom', members: ['nanally', 'jiuyuan', 'zero', 'hotori'] },
  { name: 'Chaos Charge', members: ['chaos', 'jiuyuan', 'zero', 'hathor'] },
  { name: 'Shinku Charge', members: ['shinku', 'iroi', 'zero', 'hathor'] },
  { name: 'Hyper Chiz (F2P)', members: ['chiz', 'jiuyuan', 'hathor', 'zero'], why: 'The free swaps for Hyper Chiz: Jiuyuan for Iroi, Zero for Elyms and Hathor for Akane Rin.' },
  { name: 'Hyper Nanally', members: ['nanally', 'sakiri', 'iroi', 'linko'] },
  { name: 'Lacrimosa Scorch DoT', members: ['lacrimosa', 'sakiri', 'adler', 'fadia'] },
  { name: 'Mono Scorch', members: ['baicang', 'sakiri', 'adler', 'daffodill'], why: 'Baicang on damage, Daffodill breaks and triggers Scorch. Haniel can take Sakiri’s place to open Discord; Jiuyuan or Fadia Adler’s.' },
  { name: 'Zankou Hexed', members: ['zankou', 'daffodill', 'sakiri', 'linko'] },
  { name: 'Mono Nova', members: ['lacrimosa', 'blackbird', 'hotori', 'fadia'], why: 'Nova-focused; Haniel or Sakiri can take Fadia’s place.' },
  { name: 'Break Discord', members: ['zankou', 'daffodill', 'blackbird', 'sakiri'], why: 'Break-focused Discord team.' },
  { name: 'Break Discord (budget)', members: ['zankou', 'daffodill', 'adler', 'sakiri'], why: 'Adler in for Blackbird if you don’t have her.' },
  { name: 'Hyper Hathor', members: ['hathor', 'haniel', 'daffodill', 'zero'] },
  { name: 'Blackbird Discord', members: ['blackbird', 'daffodill', 'sakiri', 'fadia'] },
  { name: 'Aurelia Nova', members: ['aurelia', 'daffodill', 'haniel', 'fadia'] },
  { name: 'Mint Hexed', members: ['mint', 'zero', 'sakiri', 'linko'] },
  { name: 'Skia Remora', members: ['skia', 'zero', 'nanally', 'haniel'] },
  { name: 'Akane Remora', members: ['akane', 'blackbird', 'zero', 'iroi'] },
  { name: 'Akane Stain', members: ['akane', 'blackbird', 'haniel', 'fadia'] },
  { name: 'Shinku Akane Charge', members: ['shinku', 'akane', 'zero', 'iroi'] },
  { name: 'Akane Stain Nova', members: ['akane', 'blackbird', 'hotori', 'daffodill'] },
  // Kit-based ideas (this site, Oct 2026): built from each kit's passives,
  // the Esper Cycle (neighbouring elements react; Charge and Discord trios) and
  // faction links, for characters the community guides cover thinly.
  // Checked with analyzeTeam: every one triggers a reaction and has a Damage role.
  { name: 'ETD-4 Squad', members: ['baicang', 'lacrimosa', 'fadia', 'skia'], idea: true,
    why: 'Baicang’s Moderate Working teams up with Skia, Fadia and Lacrimosa: a Discord trio with Scorch, Nova and Stain.' },
  { name: 'CSU-2 Charge', members: ['shinku', 'mint', 'iroi', 'hathor'], idea: true,
    why: 'Shinku’s Lone Stride feeds Charge; her CSU-2 squadmates Mint and Iroi add Blossom and healing, and Hathor completes the trio.' },
  { name: 'Eibon Antique Shop', members: ['nanally', 'sakiri', 'hotori', 'edgar'], idea: true,
    why: 'The antique shop crew: Nanally’s Blossom, Sakiri’s Hexed, Hotori’s buffs and Edgar’s healing.' },
  { name: 'Zankou Scorch (idea)', members: ['zankou', 'daffodill', 'sakiri', 'adler'], idea: true,
    why: 'Zankou’s Silent Sunset stacks Scorch; Sakiri and Adler make the target take more DoT, and Adler shields.' },
  { name: 'Zankou Discord', members: ['zankou', 'lacrimosa', 'haniel', 'adler'], idea: true,
    why: 'A Discord trio with Lacrimosa; Haniel’s Nova drain lifts ATK and Adler keeps the team shielded.' },
  { name: 'Chaos Remora (idea)', members: ['chaos', 'hathor', 'zero', 'fadia'], idea: true,
    why: 'Chaos’s usual core: Zero gives Instant Cycle, Hathor buffs Remora and Lakshana DMG, and Fadia adds Stain and survival.' },
  { name: 'Chaos Blackbird', members: ['chaos', 'blackbird', 'hathor', 'zero'], idea: true,
    why: 'Blackbird as second damage: she brings Instant Cycle and Stain, casts her Ultimate to buff the team, then swaps to Chaos so he fights under it. Zero and Hathor keep Remora rolling.' },
  { name: 'Blackbird Nova Stain', members: ['blackbird', 'daffodill', 'hathor', 'fadia'], idea: true,
    why: 'Blackbird’s Thrushsong boosts both Stain and Nova: Daffodill sets up Nova, Hathor Stain, and Fadia keeps the team alive.' },
  { name: 'Zankou × Blackbird', members: ['zankou', 'blackbird', 'daffodill', 'adler'], idea: true,
    why: 'A Discord trio with Blackbird as second damage and Instant Cycle; Zankou keeps Scorch stacked and Adler shields.' },
  { name: 'Zankou Hexed Sustain', members: ['zankou', 'linko', 'iroi', 'adler'], idea: true,
    why: 'Zankou’s Hexed with Linko’s Weakness Radar and RES shred; Iroi heals and Adler shields.' },
  { name: 'Akane Charge', members: ['akane', 'hotori', 'linko', 'iroi'], idea: true,
    why: 'Akane Rin’s Remora inside a Charge trio: Hotori buffs, Linko shreds RES and Iroi heals.' },
  { name: 'The Whoots!!!!', members: ['akane', 'nanally', 'zero', 'haniel'], idea: true,
    why: 'The band from the story: Akane Rin and Nanally lead on damage while Zero and Haniel support. Charge trio with Remora, Blossom and Stain.' },
  { name: 'Shinku Sustain Charge', members: ['shinku', 'hathor', 'jiuyuan', 'edgar'], idea: true,
    why: 'Shinku’s Lone Stride with a sturdier Charge trio: Hathor buffs, Jiuyuan adds Blossom and Edgar heals and refills Ultimate Energy.' },
  { name: 'Chiz Charge', members: ['chiz', 'skia', 'linko', 'iroi'], idea: true,
    why: 'Chiz’s Hanahaki Disease boosts Charge; Skia, Linko and Iroi complete the trio with Remora and Blossom.' },
  { name: 'Chiz Remora', members: ['chiz', 'akane', 'iroi', 'haniel'], idea: true,
    why: 'Chiz with Akane Rin’s Remora; Iroi heals and Haniel adds Stain.' },
  { name: 'Shinku × Chaos', members: ['shinku', 'chaos', 'iroi', 'linko'], idea: true,
    why: 'Shinku’s Lone Stride and Chaos’s Remora in one Charge team; Iroi heals and Linko shreds RES.' },
  { name: 'Edgar Charge', members: ['hathor', 'edgar', 'linko', 'haniel'], idea: true,
    why: 'Edgar’s Gentle Edge refills Ultimate Energy on Charge; Hathor and Linko deal damage and Haniel adds Stain.' },
  { name: 'Aurelia Discord (idea)', members: ['aurelia', 'daffodill', 'sakiri', 'fadia'], idea: true,
    why: 'Aurelia’s Harmonics hits again when Nova ends; Daffodill and Sakiri complete the Discord trio.' },
  { name: 'Aurelia Nova Stain', members: ['aurelia', 'lacrimosa', 'hathor', 'fadia'], idea: true,
    why: 'Lacrimosa sets up Nova for Aurelia’s Harmonics; Hathor and Fadia add Stain.' },
  { name: 'Baicang Discord', members: ['baicang', 'daffodill', 'haniel', 'iroi'], idea: true,
    why: 'Baicang’s Scorch with Daffodill’s Discord; Haniel adds Nova drain and Iroi heals and adds Hexed.' },
  { name: 'Mint Blossom (idea)', members: ['mint', 'zero', 'hotori', 'edgar'], idea: true,
    why: 'Mint’s Super Mint widens Vita Pistils; Zero and Hotori bring Cosmos for Blossom and Edgar heals.' },
  // Version 1.5 pre-release ideas (Oct 2026), from the role tags shown in the
  // preview stream. Revisit once Elyms’s and Exe’s kits are out.
  { name: 'Elyms Remora (idea)', members: ['chaos', 'elyms', 'hathor', 'fadia'], idea: true,
    why: 'Pre-release idea: Elyms brings Instant Cycle and a DMG Boost for Chaos, Hathor keeps Remora rolling and Fadia adds Stain and survival.' },
  { name: 'Elyms Charge', members: ['nanally', 'elyms', 'hathor', 'iroi'], idea: true,
    why: 'Pre-release idea: Elyms bursts and buffs inside a Charge trio, with Nanally’s Blossom, Hathor’s Remora and Iroi’s healing.' },
  { name: 'Exe Discord', members: ['exe', 'sakiri', 'blackbird', 'fadia'], idea: true,
    why: 'Pre-release idea: Exe as the main damage in a Discord trio; Blackbird adds Instant Cycle, Sakiri Scorch and Fadia keeps the team alive.' },
  { name: 'Exe Scorch (idea)', members: ['exe', 'sakiri', 'haniel', 'adler'], idea: true,
    why: 'Pre-release idea: Exe’s Chaos with Sakiri’s Scorch and Haniel’s Nova for Discord; Adler shields while the summons work.' },
];

/** The teams the site shows: community-recommended ones only. */
export const PRESETS = ALL_PRESETS.filter((p) => !p.idea);

/**
 * Each member's recommended kit: signature (or top) Arc, recommended Cartridge
 * set with best-roll stats, and the suggested Console layout.
 */
export function presetLoadouts(members) {
  return Object.fromEntries(
    members.filter(Boolean).map((id) => {
      const c = CHARACTER_BY_ID[id];
      const b = c && bestBuild(c);
      return [id, b ? { arc: b.arc, arcDupes: 0, cartridge: b.cartridge, cartStats: b.cartStats, console: b.pieces } : {}];
    }),
  );
}
