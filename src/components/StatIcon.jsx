// Stat icons from the game's Attributes screen (public/icons/stats), drawn as a
// mask so they take the text colour in light and dark themes.
const BASE = import.meta.env.BASE_URL;

// Keys used around the app → icon file. Names from stat lists ("CRIT Rate",
// "ATK%", "Chaos DMG%"...) go through statIconKey() first.
const FILES = {
  hp: 'hp', atk: 'atk', def: 'def', stamina: 'stamina',
  critRate: 'crit-rate', critDmg: 'crit-dmg', charge: 'charge-efficiency',
  cycle: 'cycle-intensity', breakInt: 'break-intensity',
  healing: 'healing-bonus', healingReceived: 'healing-received', dmgBonus: 'dmg-bonus',
  mentalDmg: 'mental-dmg', mentalRes: 'mental-res',
  res: 'chaos-res', 'res-cosmos': 'cosmos-res', 'res-anima': 'anima-res', 'res-incantation': 'incantation-res',
  'res-chaos': 'chaos-res', 'res-psyche': 'psyche-res', 'res-lakshana': 'lakshana-res', 'res-mental': 'mental-res',
};

/** A stat name as the stat lists write it ("CRIT Rate", "HP%", "Mental DMG%") → icon key, or null. */
export function statIconKey(name) {
  const n = String(name).replace(/%$/, '').replace(/ Bonus$/, '').trim().toLowerCase();
  const map = {
    hp: 'hp', atk: 'atk', def: 'def', stamina: 'stamina', 'crit rate': 'critRate', 'crit dmg': 'critDmg',
    'charge efficiency': 'charge', 'cycle intensity': 'cycle', 'break intensity': 'breakInt',
    healing: 'healing', 'healing received': 'healingReceived', dmg: 'dmgBonus', 'universal dmg': 'dmgBonus',
    'mental dmg': 'mentalDmg',
  };
  return map[n] ?? null;
}

export default function StatIcon({ stat, size = 16 }) {
  const file = FILES[stat] ?? FILES[statIconKey(stat)];
  if (!file) return null;
  const url = `url(${BASE}icons/stats/${file}.webp)`;
  return (
    <span
      className="stat-icon"
      aria-hidden="true"
      style={{ width: size, height: size, WebkitMaskImage: url, maskImage: url }}
    />
  );
}
