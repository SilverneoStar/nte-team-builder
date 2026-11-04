// Each character's two passive skills (unlocked with skill books; shown in the
// game beside the Support Skill), plus out-of-combat or extra traits.
// `p1` is usually the reaction upgrade ("Scorch Enhancement" and so on), split
// out into `boosts` so the page can tag it. Wording is ours; numbers follow the
// sources below.
// Sources (Oct 2026): Icy Veins skill pages (Support Skill entries after the
// main Support Skill, in game order), zeroluck.gg character pages (entries
// labelled Passive) and GameWith (Esper Zero). In-game check: Zankou (Silent
// Sunset first, Crimson Reverie second). Akane Rin's numbers aren't published.
// Hathor's order follows zeroluck.gg; Excellent Rating Lock is listed as a trait.

const p = (name, text, boosts = null) => ({ name, text, boosts });

export const PASSIVES = {
  // Elyms: closed-beta text, Nov 2026.
  elyms: {
    p1: p('Relay Node', 'Charge: when the active character gains Ultimate Energy through Charge, the team’s Cosmos DMG Bonus +3.75% for 3s, stacking up to 8 times (refreshes). Remora: when anyone applies Remora, Elyms applies another Remora to that target 7.5s later (once every 7s; it doesn’t trigger itself).', ['Charge', 'Remora']),
    p2: p('Guarantee Mechanism', 'Crit DMG +10%.'),
    trait: p('Are You There?', 'While Elyms is idle, there’s a chance she greets you with a small gift, once a day.'),
  },
  // Exe: closed-beta text (machine-translated, values not out yet; Nov 2026).
  exe: {
    p1: p('Bonus Points', 'When Exe triggers a Chaos Esper Cycle (“Dark Star” in the beta text) below SS Rating, his Rating jumps straight to SS.'),
    p2: p('Temporary Overclock', 'Each Digital Echo hit cuts the Redirect Skill cooldown by Xs. Whenever a summon on the team deals DMG, Exe gains X% DMG (stacking per summoner, up to a cap) for the rest of the battle.'),
    core: p('Quantization Algorithm', 'Hits earn Frames. His Rating (B, A, S, SS, SSS) climbs with hits, skills, his Ultimate, Support Skill, perfect dodges and counters, and each team Esper Cycle; higher Ratings earn Frames faster. Rating drains over time when idle and drops sharply when he is hit.'),
  },
  adler: {
    p1: p('Temperance', 'Whenever Scorch is inflicted, the target also gets one of three random debuffs for 15s: ATK -20%, Esper Resistance -10% or Break Efficiency +10%. The same debuff doesn’t stack.', 'Scorch'),
    p2: p('Righteous Heart', 'Adler’s DEF +20%.'),
  },
  akane: {
    p1: p('Perfect Pitch', 'After the team first triggers Remora, until Akane leaves combat: Remora is reapplied regularly to the Overtone target and to every enemy in her Reverb Field. Reapplying Remora to a target deals extra Lakshana DMG that grows with the Remora time left on it. Exact numbers aren’t published yet.', 'Remora'),
    p2: p('Starlit Anthem', 'Akane’s DMG dealt +20% for 25s after casting Sonic Boom. Doesn’t stack; casting it again resets the duration.'),
    trait: p('Play It by Ear', 'In the open world, Akane can pick up her guitar at any time and play whatever melody comes to mind.'),
  },
  aurelia: {
    p1: p('Harmonics', 'When a target’s Nova ends, it takes 3 more hits of Psyche DMG, each 50% of ATK.', 'Nova'),
    p2: p('Crescendo', 'Each jellyfish blast that hits gives Aurelia ATK +1% for 5s, up to 10 stacks.'),
    trait: p('Boundless Sound', 'Rides a jellyfish in the open world to glide and swim, and jumps higher, but can’t climb or vault.'),
  },
  baicang: {
    p1: p('Moderate Mischief', 'When a Power Word appears on a Scorched target, it gets another Scorch with the same effect.', 'Scorch'),
    p2: p('Moderate Working', 'Baicang’s ATK +20%, and she backs up ETD-4 teammates. Switching to her while Skia is stealthed attacks at once and adds a Power Word Silence (30s cooldown). When Fadia drops below 20% HP, Baicang attacks once, heals Fadia and adds a Power Word Silence (30s cooldown). Switching to her while Lacrimosa is a bat gives a super jump.'),
  },
  blackbird: {
    p1: p('Thrushsong', 'Stain’s base DMG Bonus becomes 30% and lasts 20s. When Nova ends, the target takes extra Mental DMG equal to 20% of the DMG it took during Nova (not counting the triggering Support Skill or Nova itself), up to 1,000× Blackbird’s base ATK and unaffected by other buffs, then gets Nova once more. That second Nova can’t repeat this.', 'Stain and Nova'),
    p2: p('Ever Onward', 'Casting Judgment Upon Me gives 20 Malice.'),
    trait: p('On the Wing', 'Outside combat, hold the movement stick and Dodge on the ground, or press Aim while falling, to become the Lonesome Bird and fly at high speed, collecting Oracle Stones in range. Flying drains Stamina.'),
  },
  chaos: {
    p1: p('Justice in Time', 'When Remora ends, the target takes Lakshana DMG equal to 800% of ATK. Each second of Remora beyond the base 5s adds 45%, up to 300% extra. Reapplying Remora resets its duration.', 'Remora'),
    p2: p('Prime Target', 'Warrant’s DMG bonus rises to 30%.'),
    trait: p('Ashen Shade', 'In the open world, hold Aim to leave his hound as a teleport anchor; teleporting from the map opens a doorway back to it.'),
  },
  chiz: {
    p1: p('Hanahaki Disease', 'Charge gives the active character 4 extra Ultimate Energy.', 'Charge'),
    p2: p('Hoarding', 'Chiz’s Charge Efficiency +20% while on the field.'),
  },
  daffodill: {
    p1: p('Blade Draw', 'Targets under Discord have their Break cap lowered by another 10% for 30s, up to 20% of the starting cap in total. Removed when leaving combat.', 'Discord'),
    p2: p('Cicada Shell', 'Phantom Step DMG +80%.'),
  },
  edgar: {
    p1: p('Gentle Edge', 'When a character triggers Charge with a Support Skill, they instantly gain 120 Ultimate Energy; afterwards, Vita Pistils hitting Slowed targets give no Ultimate Energy. 30s cooldown.', 'Charge'),
    p2: p('Unchanging Warmth', 'Casting Wild Current or Weight of Knowledge gives a Key of Truth (up to 3). Each Key makes Finnegan’s Vigil last 1s longer.'),
  },
  fadia: {
    p1: p('Furnace of Guilt', 'When Nova ends, the whole team drains Max HP from the target: it loses 200% of Fadia’s base Max HP and each ally gains 10% of it, up to 50% in total. Both return to normal after combat.', 'Nova'),
    p2: p('Denial and Plunder', 'While Fadia is on the team, the team’s Max HP +10%.'),
    trait: p('Queen Charming', 'Shopkeepers who like Fadia sometimes give her special gifts while she explores the city.'),
  },
  haniel: {
    p1: p('It’s Friendship!', 'When Nova ends, the team drains ATK from the target: it loses 4% of Haniel’s base ATK and each ally gains 8%, up to 16% in total and no more than 20% of the target’s starting ATK. Both return to normal after combat.', 'Nova'),
    p2: p('It’s Bond!', 'Each Ensemble from the active character gives Haniel 1 Plot Armor (2 in Paranormal Ace), up to 4, which also raises Paranormal Cannon’s ricochet cap.'),
  },
  hathor: {
    p1: p('Delay Warning', 'When allies attack a target under Remora, its Remora lasts 12s and the allies’ CRIT Rate +10%.', 'Remora'),
    p2: p('Efficiency Boost', 'Defeating a target gives 1 Express Delivery Power.'),
    trait: p('Excellent Rating Lock', 'With Hathor on the team, enemies nearby for over 5s are locked for 5s. If a locked enemy attacks the team, the lock breaks and she gains 1 Express Delivery Power, up to 6.'),
  },
  hotori: {
    p1: p('Ghost Orchid Crest', 'Vita Bud attacks keep going during Time Stop.', 'Blossom'),
    p2: p('All Treasures Under Heaven', 'World’s Tide’s finisher DMG Ratio +100%.'),
    trait: p('Frozen Snow Ritual', 'Out of combat, hold Basic Attack to slow time to a stop while her timepiece has energy, clearing and blocking time debuffs. Ends when the pointer fully rewinds, on entering combat or on other actions.'),
  },
  iroi: {
    p1: p('Mirror Image', 'After a Vita Bud has been out 3s it makes a copy (outside the Vita Bud limit) that fires 20 Copied Vita Pistils, one every 0.5s, each dealing 37.5% of a normal Vita Pistil.', 'Blossom'),
    p2: p('Sympathetic Nerves', 'Whenever a team member heals, the whole team ignores 5% more DEF for 20s.'),
    trait: p('95-Million-Year Divide', 'Interacting with small animals in the open world gives a random growth item, up to 3 times a day.'),
  },
  jiuyuan: {
    p1: p('Seize the Moment', 'Spawns 1 extra Vita Bud and raises the on-field Vita Bud limit to 6.', 'Blossom'),
    p2: p('Whispers at My Command', 'Vita Pistils bind targets with Fatal Rose Pact; hitting an already bound target triggers an extra hit for 15% more Anima DMG.'),
  },
  lacrimosa: {
    p1: p('Tomato Banquet', 'Triggering Discord on a Broken target deals an extra 400% of ATK.', 'Discord'),
    p2: p('Sleep In', 'Using Tomato Metal or Tomato Percussion 5 times during one cooldown gives 1 extra Morning Tomato, once per cooldown.'),
    trait: p('Sleepwalk', 'Turns into a bat to fly out of combat: hold Dodge to take off. Flying uses Stamina.'),
  },
  linko: {
    p1: p('Weakness Radar', 'While Linko is on the team, Hexed follow-up attacks’ base DMG rises to 30%, and Hexed targets take 10% more follow-up DMG.', 'Hexed'),
    p2: p('Precision Tuning', 'Each Synced Strike lowers the target’s Esper Ability RES for the triggering character’s attribute by 8% for 12s. Different attributes add up; the same one doesn’t stack, it refreshes.'),
    trait: p('Linko Rockethead Mk I', 'Out of combat, hold Basic Attack to charge (up to 2s) and launch forward on Xiaozhen’s ghostly arm.'),
  },
  mint: {
    p1: p('Transform! Super Mint!', 'Vita Pistils hit a wider area.', 'Blossom'),
    p2: p('Bingo! We’re Done Here!', 'While on the field, Mint’s DEF +20% and Interruption resistance +30%.'),
    trait: p('Minty Whirlwind', 'Hold Basic Attack to spin into a tornado that drains Stamina and deals continuous Anima DMG around her.'),
  },
  nanally: {
    p1: p('More Than Passionate', 'Vita Buds fire 10 Vita Pistils, one every 1s.', 'Blossom'),
    p2: p('Fair Duel', 'In Ichi-daime’s Authority, whenever an ally deals Esper Cycle DMG, Nanally follows up on one enemy for 60% of ATK as Anima DMG (scales with Basic Attack level). Once every 2s.'),
    trait: p('Wall Run', 'Out of combat, use her Redirect Skill to run along walls and other surfaces.'),
  },
  sakiri: {
    p1: p('Can I Eat This?', 'A Scorched target takes 25% more DoT for each type of DoT on it, up to 100%.', 'Scorch'),
    p2: p('Impish Trick', 'Enemies’ DEF -10% for 20s after Sakiri knocks them Airborne or Suppresses them.'),
  },
  shinku: {
    p1: p('Lone Stride', 'When the active character gains Ultimate Energy, off-field characters gain the same Charge. While Shinku is active in Charge, each trigger also deals area DMG of 400% ATK (scales with Basic Attack level) and gives ATK +5% for 30s, up to 10 stacks. 1s cooldown.', 'Charge'),
    p2: p('Wrathscale', 'Ultimate DMG against non-Boss enemies +50%.'),
    trait: p('Menacing Gaze', 'Standing still on the field for over 2s builds stacks (up to 8; Critical Dodges add more). Her next hit ends it with an Instant Strike worth +100% DMG per stack. Switching out clears it.'),
  },
  skia: {
    p1: p('Suppression', 'When Fang Thrust locks onto a target under Remora, it adds another Remora.', 'Remora'),
    p2: p('Apprehension', 'Fang Thrust DMG +10% for 15s after casting The Pack, including Shadow Hound collisions.'),
    trait: p('Shadow Hound', 'Hold Move and press Dodge to run across floors and walls unseen; ground hits, Basic Attack or switching end it.'),
  },
  zankou: {
    p1: p('Silent Sunset', 'Scorch stacks up to 3 times. When an ally inflicts a DoT on a Scorched target, Zankou adds 1 Scorch stack that takes on that DoT’s DMG, type and duration. Scorch added this way can’t trigger it again.', 'Scorch'),
    p2: p('Crimson Reverie', 'Sets Zankou’s Cycle Energy to 100 on entering battle (once per battle, 30s cooldown), and her Cycle Intensity +100 while she’s on the team.'),
    trait: p('Lost Focus', 'Out of combat, use the special skill to turn Invisible for 20s: Movement Speed +50% and enemies can’t detect Zankou.'),
  },
  zero: {
    p1: p('Appraiser', 'When the active character gains Ultimate Energy, restores HP equal to 50% of Zero’s base ATK.'),
    p2: p('Anomaly Perception', 'Divide by Zero DMG +25%.'),
  },
};
