// Awakenings A1–A6. Each duplicate copy of a character unlocks one awakening
// slot, and the player may enable ANY awakenings up to that number, in any
// order (a single extra copy can enable A4 alone, for example).
// Sources (Oct 2026): neverness.gg build guides. Effects are short summaries;
// check the in-game text for exact values.

export const MAX_DUPES = 6;
// Arcs have five passive tiers, so four duplicate copies max one out.
export const MAX_ARC_DUPES = 4;

const a = (...list) => list.map(([name, effect], i) => ({ id: `A${i + 1}`, name, effect }));

export const AWAKENINGS = {
  adler: a(
    ['Form', 'Gains 20 Karma stacks when casting Tranquility.'],
    ['Sensation', 'Each Karma stack grants 3% DMG Bonus.'],
    ['Perception', 'Blessing shield strength +20%.'],
    ['Formation', 'When Blessing breaks, absorbs overflow damage based on 50% of DEF.'],
    ['Discernment', 'Gains 20 Ultimate Energy when casting Tranquility.'],
    ['All Forms Are Void', 'Blessing lasts 12s.'],
  ),
  aurelia: a(
    ['Futuristic Prelude', 'Crit Rate +15% in the Cadenza state.'],
    ['Unique Melody', 'Enters Cadenza for 5s after a Critical Dodge or Dissonance.'],
    ['Trio Rest', 'Canon Chorus DMG +20% in Cadenza.'],
    ['Staff Gap', 'DEF +20% when casting Staccato.'],
    ['Simple Melody', 'Canon Chorus Crit Rate +15%.'],
    ['Bygone Fugue', 'Crescendo caps at 20 stacks; Cadenza Aria grants 10 stacks.'],
  ),
  baicang: a(
    ['Yo, Captain!', 'Silence boosts the next Skill by 30%; Objurgate cuts Skill cooldown by 4s.'],
    ['Soul Caller', 'Each Power Word grants ATK +6%, up to 4 stacks (10s).'],
    ['Curses Spoken Into Being', 'Power Word limit raised to 4.'],
    ['Or Perhaps Blessings', 'Power Words heal 5% Max HP during Ultimate.'],
    ['In Honor of Moonlight', 'Judgment of Autumn lasts 16s.'],
    ['White Aspect', 'Crit Rate +30% during Judgment of Autumn.'],
  ),
  blackbird: a(
    ['Renegade', 'Flammae in Unum consumes all Malice; Flames of Deliverance DMG +150%.'],
    ['Wayward Chronicle', 'Netherplume Rite DMG +100%; DEF +20% as the Witch; heals after Flames of Deliverance.'],
    ['Blind Spot', 'Attacks that consume Malice deal 50% more DMG.'],
    ['Bad Seed', 'Ultimate team ATK buff lasts 25s and adds 12% DMG for all allies.'],
    ['Revenant', 'Hits lower Psyche, Lakshana and Chaos RES by 8% for 25s.'],
    ['Mortal Coil', 'Psyche DMG +25% after Ultimate; coordinated attacks grant Malice.'],
  ),
  chaos: a(
    ['Piercing Insight', 'Gains 30% more Crime when attacking Warrant targets.'],
    ['Charge / Sin', 'Ignores 20% DEF of Warrant targets.'],
    ['Emberflare', 'Crit DMG +30% for 20s after Retribution.'],
    ['Drowning Tide', 'Defeating a Warrant target moves Warrant to a nearby enemy.'],
    ['Voidgaze', 'DMG +20% when only one Warrant target remains.'],
    ['False Origin', 'Retribution instantly refills Crime to its cap.'],
  ),
  chiz: a(
    ['Sun, Sun… speak to me!', 'Grain and grain loan storage +25%.'],
    ['Fireworks in Silence', 'Earns 10% of current grain as interest per second in surplus.'],
    ['If There Were No Rainy Days', 'Grain price rise chance +50%.'],
    ['To Riceball, Bandage, Fons', 'Grain gain efficiency +20%.'],
    ['Blank Diary Pages', 'Entering combat fills grain to its storage limit.'],
    ['Thirty-Three Days', 'Grain’s extra Cosmos DMG +20%.'],
  ),
  daffodill: a(
    ['Eye', 'Each Support Skill cast raises Resonance DMG by 100% and Break by 250%.'],
    ['Mechanical March', 'A failed Phantom Step counter still Breaks and fully charges Ultimate.'],
    ['Assembly of Creations', 'Insight is kept and stacks up to 3.'],
    ['In Concealment', 'Break DMG +15% per Insight stack when an enemy is Broken.'],
    ['Perfect Truth', 'One extra Break hit per Insight stack.'],
    ['Bloom in the Lake', 'All DMG dealt +15%.'],
  ),
  edgar: a(
    ['Anomaly-Loving Observer', 'Gains a Key of Truth whenever a teammate casts a Support Skill.'],
    ['Intern Anomaly Hunter', 'Wild Current cooldown extension caps at 3s.'],
    ['One of the Eibon Detectives', 'Wild Current heals allies below 30% HP 15% more.'],
    ['Skilled Strategist', 'Wild Current DMG +50%.'],
    ['Guardian of the Antique Shop’s Light', 'Max HP +20%.'],
    ['Visitor from Planet Curiosity', 'Allies in Finnegan’s Wake gain 15% DEF.'],
  ),
  fadia: a(
    ['Apostate', 'Damage redirect ratio rises to 75%.'],
    ['Instinct', 'Destructive Experience damage rises to 600%, capped at 25% Max HP.'],
    ['Curser of Blessings', 'Base Max HP +30% in combat.'],
    ['Breaker of Taboos', 'Lilith healing becomes 30% Max HP, up to 60%.'],
    ['Survivor of Death', 'Crit Rate +50% in Lilith form.'],
    ['Bringer of Love and Death', 'Destructive Experience hits up to 10 targets.'],
  ),
  haniel: a(
    ['New here! Genius transfer student reporting in!', 'Paranormal Cannon ricochets up to 6 times.'],
    ['Legendary! The g’old back row window seat!', 'Hootie lasts 4s longer.'],
    ['Assemble! The hero team is formed!', 'Crit Rate +20% as Paranormal Ace.'],
    ['Seaside! Beach episode!', 'Ensemble boosts her next attack’s extra DMG by 100%.'],
    ['Crisis! Shattering trust!', 'Psyche DMG +30% as Paranormal Ace.'],
    ['Finale! For the coming dawn!', 'Hootie cooldown −4s.'],
  ),
  hathor: a(
    ['Elite Courier', 'First held Redirect Skill in battle grants 6 Express Delivery Power.'],
    ['Thorn Dominion', 'Gains Express Delivery Power when her locks expire naturally.'],
    ['Lost Wings', 'DMG +15% against non-Boss targets.'],
    ['Engine Resonance', 'Each Cyclone Strike raises the next one’s Crit Rate by 25%.'],
    ['Regular Sandwich', 'DMG +1% per Express Delivery Power stack, up to 15%.'],
    ['Daily Life Walkthrough', 'Crit DMG +30% in Emergency Delivery.'],
  ),
  hotori: a(
    ['Flourish', 'Time Stop DMG +12% per recorded Support or Redirect Skill, up to 3.'],
    ['Distant Memories', 'DMG +20% during Time Stop.'],
    ['Momentary Gaze', 'Refunds Present Replay energy once every 60s.'],
    ['Scattered Relics', 'Gains 10 energy per defeated target, up to 3 times per Ultimate.'],
    ['All-Seeing', 'Team DMG +15% against a lone enemy.'],
    ['Time Takes Away', 'Ignores 30% DEF during Time Stop.'],
  ),
  iroi: a(
    ['Iterated Prisoner’s Dilemma', 'Regains Imagination off-field (+30% gain); starts battle at max.'],
    ['Strategy: Tit for Tat', 'Allies’ skills summon a spirit that deals 200% ATK and heals (5s cooldown).'],
    ['Trait: Cooperative', 'Healing +36%.'],
    ['Trait: Retaliatory', 'Lamb replacement ATK ratios +30% during Regression.'],
    ['Trait: Transparent', 'Healing grants the team 15% Base ATK for 20s.'],
    ['Trait: Forgiving', 'Ultimate revives with full HP plus 50 Cycle and Ultimate Energy.'],
  ),
  jiuyuan: a(
    ['To Know, To Balance', 'ATK +5% per Lethal Rose Pact target, up to 15%.'],
    ['Intel Turns Into Blades', 'Lethal Rose Pact DMG +100%; heals for 20% of it.'],
    ['Advantage Established', 'Pact Settlement removes 4 more Break.'],
    ['Strike to Kill', 'Pact Settlement DMG +50% and hits targets in range.'],
    ['Intel Superiority', 'DMG +8% against Pact-bound targets.'],
    ['Know Every Secret', 'Pact targets take 200% DMG when they cast skills (5s cooldown).'],
  ),
  lacrimosa: a(
    ['Clock Out Clemency', 'Nightmare DMG +50%.'],
    ['Rise and Shine', 'DMG +15% for 15s after entering via Support Skill.'],
    ['Molten Ice Cream', 'The 5th hit triggers all stored Nightmare at once.'],
    ['Almighty Lord of Tomatoes', 'Nightmare lasts 6s.'],
    ['Tempered Glass Judgement', 'Healing no longer removes Nightmare.'],
    ['Morning Spell', 'Auto-casts her Support Skill after Devilish Gift, no Cycle cost.'],
  ),
  linko: a(
    ['All Frequencies Live', 'Spectral Rush appears 25% more often while off-field.'],
    ['Friendly Haunting', 'Oversync Anima Burst DMG +30%.'],
    ['Across the Airwaves', 'Oversync resets Full-Frequency Pulse cooldown.'],
    ['Starlit Whispers', 'Synced Strikes in the Resonance Field add Anima area DMG.'],
    ['Love, Loud and Clear', 'Pulse Synced Strikes trigger Cycle effects; +50% DMG if an ally can’t Cycle.'],
    ['The World Answers', 'Allies gain 25% Synced Strike Crit Rate and Charge while she is active.'],
  ),
  mint: a(
    ['Task Force Operation', 'Caramel Crisp hits reset Super Claws cooldown (once per 3s).'],
    ['Re-examination', 'Super Claws DMG +40%.'],
    ['Attendance Bonus', 'ATK +15% for 15s when allies trigger Blossom or Hexed.'],
    ['Lunch Break', 'Crit Rate +12% against the last enemy on the field.'],
    ['First Instinct', 'Crit DMG +25% for 6s after Super Claws.'],
    ['Elite Member', 'DMG +15% against targets below 40% HP.'],
  ),
  nanally: a(
    ['Gang Formation', 'Gains 2.5 Ultimate Energy per follow-up attack (once per second).'],
    ['Second Member', 'Underboss lasts 3s longer.'],
    ['Call Me the Boss', 'In Authority, hits add a 50% ATK Anima follow-up (once per second).'],
    ['Not a Troublemaker', 'Underboss DMG +30%.'],
    ['Followers Everywhere', 'ATK +2% per follow-up attack, up to 20%.'],
    ['Because We’re Family', 'Authority lasts 15s (20s out of combat).'],
  ),
  sakiri: a(
    ['Diffusive Haze', 'Feast of Gluttony immobilises for 6s.'],
    ['Dextrous Separation', 'Feast of Gluttony deals extra DMG to airborne enemies (up to 600% ATK).'],
    ['Adhesive Grip', 'Devour Whole and Feast DMG +6% per defeated enemy, up to 60%.'],
    ['Wishful Reliance', 'Team ATK (except Sakiri) +30% of her Base ATK for 20s.'],
    ['Sensory Collapse', 'Launching with Devour Whole refills and resets Feast of Gluttony.'],
    ['Gluttonous Dissolution', 'Kiroumaru can devour up to 3 enemies at once.'],
  ),
  shinku: a(
    ['Rain-Lashed Alley', 'Ignores 12% DEF.'],
    ['Pre-Dawn Training Grounds', 'Ultimate lowers Cosmos RES by 10% for 20s.'],
    ['Sunset Beach', 'Menacing Gaze persists and stacks while off-field.'],
    ['Snowfall Slope', 'Menacing Gaze caps at 16; full stacks empower Instant Strike with a stun.'],
    ['Room of Laughter', 'DEF and interrupt resistance +50% in Surging Crimson; heals after Scarlet Descent.'],
    ['Dragon’s Treasure', 'Scarlet Descent, Crimson Judgment and Dragonflame Verdict DMG +30%; pulls enemies in.'],
  ),
  skia: a(
    ['Process of Elimination', 'Fang Thrust auto-attack DMG +60%.'],
    ['Law and Order', 'Crit Rate +10% and interrupt resistance +50% for 15s after Shadow Hound Chase.'],
    ['Solution', 'DMG +4% against Fang Thrust targets, +4% more against a single target.'],
    ['Resolution', 'Tailed lasts 12s; Attachment DMG grows 2% per second locked, up to 40%.'],
    ['Social Contract', 'Each Fang Thrust lock slows the target 20%.'],
    ['Unbothered Appearance', 'Fang Thrust extra DMG +20% in Shadow Hound Gnaw.'],
  ),
  zankou: a(
    ['Abyss Within the Eyes', 'Spreads DoTs; permanent Hunt (+40% DMG) and Delusion (+50% team DoT Crit DMG).'],
    ['Kiss at the Bottom of the Abyss', 'Scorch and Hexed build Flame Reserve: next Inferno Flamenco final hit +150%.'],
    ['Dream Through a Kissmark', 'Hunt adds 50% interrupt resistance; Delusion heals 4% Max HP per second.'],
    ['Nightmare in Bloom', 'Bloodfeast Reverie casts automatically with Inferno Flamenco.'],
    ['Blood in Bloom', 'Sanguine Dash guarantees Break once per target; team Break DMG +300%.'],
    ['Blood-Stained Eyes', 'Oblivion final hit +12% per DoT stack, up to 240%.'],
  ),
  // Akane: global release text (Oct 21, 2026).
  akane: a(
    ['After-School Tabs', 'Each Synced Resonance heals her for 1000% of Base ATK; DEF +50% and interrupt resistance +60% for 15s.'],
    ['Capo On', 'Enemies with Overtone or inside her Reverb Field take Lakshana RES -12%.'],
    ['Shade Capsules', 'Tapped Rhythm Wave DMG ratio +1000%; Reverb Field 30% wider and pulls enemies in when held.'],
    ['Headphone Static', 'Crit DMG +30% for 15s after Synced Resonance.'],
    ['Rehearsal Click', 'Basic Attacks relayed by Overtone get a 64% DMG ratio bonus, and 90% in Reverb Field.'],
    ['Front-Row Supernova', 'Starlit Anthem also grants 16% DEF ignore.'],
  ),
  zero: a(
    ['Blooming Gaze', 'First hit on lower-level enemies adds 200% ATK, ignoring 75% DEF.'],
    ['Finding the Calling', 'Appraise and Engrave grants 8 Ultimate Energy.'],
    ['Anomalies Record', 'Divide by Zero Crit Rate +50%.'],
    ['Undecided Factors', 'Divide by Zero DMG +0.1% per Base ATK point, up to 25%.'],
    ['Theopneustos', 'ATK +10% for 20s after a Support Skill.'],
    ['Deceptive Liberation', 'Appraise and Engrave extra DMG becomes 300% ATK.'],
  ),
};

// Resonance: two bonuses that switch on automatically when a character has
// 3 (R3) and 6 (R6) awakenings active. Sources: neverness.gg build guides,
// Icy Veins (Zankou). Summaries; check in-game text for exact values.
export const RESONANCE_AT = { R3: 3, R6: 6 };

const r = (r3, r6) => [
  { id: 'R3', at: 3, name: r3[0], effect: r3[1] },
  { id: 'R6', at: 6, name: r6[0], effect: r6[1] },
];

export const RESONANCES = {
  adler: r(['Cleanse', 'Deliverance, Evil’s Bane and Tranquility +1 skill level.'], ['Enlightened Guardian', 'Team Incantation DMG +10% while protected by Blessing.']),
  aurelia: r(['Universal Harmony', 'Cappella, Cadenza Aria and Canon Chorus +1 skill level.'], ['Shared Melody', 'All allies’ Psyche DMG +8% for 15s when Cadenza starts or is extended.']),
  baicang: r(['Earth Sequence', 'Walk the Talk, Generous Guidance and Judgment of Autumn +1 skill level.'], ['Remained', 'Allies in the domain gain 20% ATK and Execution during Judgment of Autumn.']),
  blackbird: r(['Atonement Unveiled', 'Six skills +1 level; Ultimate DMG +100% and +50%; Ultimate grants 20 Malice.'], ['When the Stars Mourn', 'Team Crit DMG +30% while Blackbird is on the team.']),
  chaos: r(['Justice / Truth', 'Pursuit, Doubtmark and Retribution +1 skill level.'], ['Light / Daybreak', 'Enemies with Warrant have 10% less Lakshana RES.']),
  chiz: r(['Friends and Family', 'Grain gain +50% more while in Debt.'], ['Homecoming', 'Her hits lower the target’s Cosmos RES by 10%.']),
  daffodill: r(['Covert Operation', 'Still Waters, Resonance and Witness This Finale +1 skill level.'], ['Sunlight and Sanctuary', 'Targets entering Break lose 20% Chaos RES.']),
  edgar: r(['Pursuit of Knowledge', 'Wild Current, Finnegan’s Wake and Weight of Knowledge +1 skill level.'], ['Keen Insight', 'Each 3% Max HP a teammate loses grants a Finnegan’s Vigil Charge (up to 20).']),
  fadia: r(['The Disrespecting Saint', 'Wordless Rejection, Existence and Agony to Euphoria +1 skill level.'], ['The Unified Saint', 'Team ATK +10% while Fadia is on the team.']),
  haniel: r(['Prequel', 'Genesse Technique, Silent Moonlit Forest Guardian and A Melody Named Haniel +1 skill level.'], ['Sequel', 'Team Crit DMG +12% while she is Paranormal Ace.']),
  hathor: r(['Doubled Capacity', 'Rapid Delivery, Aerial Command and Rider Express +1 skill level.'], ['Unhindered Passage', 'Ignores 10% DEF in Emergency Delivery.']),
  hotori: r(['Eternity Shattered', 'Misty Moon Style, Present Replay and World’s Tide +1 skill level.'], ['The Ultimate Treasure of Clear Understanding', 'Team ATK +10% while Hotori is on the team and alive.']),
  iroi: r(['Primate Among All Things', 'Three skills +1 level; all team members’ DEF +30%.'], ['Self-Proclaimed Crown of Creation', 'Team Crit DMG +25% while Iroi is on the team; her DMG +15% and Crit Rate +5%.']),
  jiuyuan: r(['Doubled Capacity', 'When Secrets Take Shape, Intel Hunter and Final Reckoning +1 skill level.'], ['Unhindered Passage', 'Lethal Rose Pact targets lose 10% Anima RES.']),
  lacrimosa: r(['The Heart’s Drowsy Flames', 'Sweet and Sour, Morning Tomato, Devilish Gift and Working Day Judgement +1 skill level.'], ['Lullaby', 'Effect not published yet.']),
  linko: r(['Shared Pulse', 'Spectral Cross, Full-Frequency Pulse and Oversync +1 skill level; Linko ATK +20%.'], ['Perfect Reception', 'Resonance Field lasts 5s longer; allies’ Anima and Incantation DMG +30% inside it.']),
  mint: r(['Minty Bubble Tea', 'Perfect Containment, Super Claws and Thunderous Whirlwind Slash +1 skill level.'], ['Fluffy Mousse', 'Super Claws grants 5 extra Cycle Rate.']),
  nanally: r(['Colucci Secrets: Part 1', 'Colucci Secret Skill, Howling Technique and Ultimate Technique +1 skill level.'], ['Colucci Secrets: Part 2', 'Nanally’s DMG +10%.']),
  sakiri: r(['Insatiable Appetite', 'Kiroumaru Headbutt, Devour Whole and Feast of Gluttony +1 skill level.'], ['Fog Penetration', 'DMG +3% per negative effect on the target, up to 12%.']),
  shinku: r(['Awakened Resolve', 'Basic Attack, Redirect Skill and Ultimate +1 level; DMG +30% in Surging Crimson.'], ['Crimson Hero', 'Crit Rate +10% and ignores 15% DEF.']),
  skia: r(['Cubical Survival Manual', 'Arresting Art, Shadow Hound Chase and The Pack +1 skill level.'], ['Employee of the Month', 'Each Fang Thrust lock lowers the target’s Lakshana RES.']),
  zankou: r(['Scarlet Feast', 'Six skills +1 level; Bloodfeast Reverie and Inferno Flamenco DMG +20%.'], ['Venom Flame', 'ATK +40% for 20s after dealing DMG; enhanced for 60s after defeating a Scorched target.']),
  akane: r(['Diatonic', 'Basic Attack, Redirect Skill and Ultimate +1 skill level; full String Energy on entering battle; Synced Resonance and Sonic Boom hit harder.'], ['Counterpoint', 'Refunds 10 String Energy after each Synced Resonance; Crit DMG +64% for 25s after it.']),
  zero: r(['Discern', 'Appraisal, Appraise and Engrave and Divide by Zero +1 skill level.'], ['Zero Display', 'Team ATK +10% for 20s when Zero triggers a Cosmos Esper Cycle.']),
};

/** Which Resonances are active for a number of active awakenings. */
export const activeResonance = (awakeningCount) => ({
  R3: awakeningCount >= RESONANCE_AT.R3,
  R6: awakeningCount >= RESONANCE_AT.R6,
});
