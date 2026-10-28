// Community team archetypes, then kit-based ideas marked `idea: true` (Mobalytics team guide, Sep 2026; Blackbird,
// Aurelia, Mint and Skia teams from Kaiden, Icy Veins, GameWith and other community guides,
// Oct 2026; Akane Rin teams from Gurugamer, mone.gg and TopUpLive, Oct 2026,
// pre-release ideas until she is out on global). Loading one copies it into the team you're editing, with each
// member's recommended kit (see presetLoadouts).
import { CHARACTER_BY_ID } from './characters.js';
import { bestBuild } from './bestBuild.js';

export const PRESETS = [
  { name: 'Mono Blossom', members: ['nanally', 'jiuyuan', 'zero', 'hotori'] },
  { name: 'Chaos Charge', members: ['chaos', 'jiuyuan', 'zero', 'hathor'] },
  { name: 'Shinku Charge', members: ['shinku', 'iroi', 'zero', 'hathor'] },
  { name: 'Hyper Chiz', members: ['chiz', 'jiuyuan', 'hathor', 'hotori'] },
  { name: 'Hyper Nanally', members: ['nanally', 'sakiri', 'iroi', 'linko'] },
  { name: 'Lacrimosa Scorch DoT', members: ['lacrimosa', 'sakiri', 'adler', 'fadia'] },
  { name: 'Mono Scorch', members: ['baicang', 'sakiri', 'adler', 'daffodill'] },
  { name: 'Zankou Hexed', members: ['zankou', 'daffodill', 'sakiri', 'linko'] },
  { name: 'Mono Nova', members: ['lacrimosa', 'fadia', 'haniel', 'hotori'] },
  { name: 'Break Discord', members: ['fadia', 'daffodill', 'sakiri', 'hotori'] },
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
  { name: 'Zankou Scorch', members: ['zankou', 'daffodill', 'sakiri', 'adler'], idea: true,
    why: 'Zankou’s Silent Sunset stacks Scorch; Sakiri and Adler make the target take more DoT, and Adler shields.' },
  { name: 'Zankou Discord', members: ['zankou', 'lacrimosa', 'haniel', 'adler'], idea: true,
    why: 'A Discord trio with Lacrimosa; Haniel’s Nova drain lifts ATK and Adler keeps the team shielded.' },
  { name: 'Chaos Remora', members: ['chaos', 'hathor', 'zero', 'fadia'], idea: true,
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
  { name: 'Aurelia Discord', members: ['aurelia', 'daffodill', 'sakiri', 'fadia'], idea: true,
    why: 'Aurelia’s Harmonics hits again when Nova ends; Daffodill and Sakiri complete the Discord trio.' },
  { name: 'Aurelia Nova Stain', members: ['aurelia', 'lacrimosa', 'hathor', 'fadia'], idea: true,
    why: 'Lacrimosa sets up Nova for Aurelia’s Harmonics; Hathor and Fadia add Stain.' },
  { name: 'Baicang Discord', members: ['baicang', 'daffodill', 'haniel', 'iroi'], idea: true,
    why: 'Baicang’s Scorch with Daffodill’s Discord; Haniel adds Nova drain and Iroi heals and adds Hexed.' },
  { name: 'Mint Blossom', members: ['mint', 'zero', 'hotori', 'edgar'], idea: true,
    why: 'Mint’s Super Mint widens Vita Pistils; Zero and Hotori bring Cosmos for Blossom and Edgar heals.' },
  // Version 1.5 pre-release ideas (Oct 2026), from the role tags shown in the
  // preview stream. Revisit once Elyms’s and Exe’s kits are out.
  { name: 'Elyms Remora', members: ['chaos', 'elyms', 'hathor', 'fadia'], idea: true,
    why: 'Pre-release idea: Elyms brings Instant Cycle and a DMG Boost for Chaos, Hathor keeps Remora rolling and Fadia adds Stain and survival.' },
  { name: 'Elyms Charge', members: ['nanally', 'elyms', 'hathor', 'iroi'], idea: true,
    why: 'Pre-release idea: Elyms bursts and buffs inside a Charge trio, with Nanally’s Blossom, Hathor’s Remora and Iroi’s healing.' },
  { name: 'Exe Discord', members: ['exe', 'sakiri', 'blackbird', 'fadia'], idea: true,
    why: 'Pre-release idea: Exe as the main damage in a Discord trio; Blackbird adds Instant Cycle, Sakiri Scorch and Fadia keeps the team alive.' },
  { name: 'Exe Scorch', members: ['exe', 'sakiri', 'haniel', 'adler'], idea: true,
    why: 'Pre-release idea: Exe’s Chaos with Sakiri’s Scorch and Haniel’s Nova for Discord; Adler shields while the summons work.' },
];

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
