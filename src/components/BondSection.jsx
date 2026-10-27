// A character's Bond tab: overworld abilities, bond levels and favourite gifts.
import { LIFE_MAX, SKILLS } from '../data/skills.js';
import { BOND, BOND_LEVELS, BOND_MAX, BOND_TOTAL, GIFT_LIMITS, NO_BOND, UNIVERSAL_GIFTS } from '../data/bond.js';
import StatText from './StatText.jsx';
import { fmt } from '../lib/format.js';

const COSMETIC = { sticker: 'Sticker', avatar: 'Avatar', frame: 'Frame', namecard: 'Namecard' };

function GiftRow({ gift, best }) {
  return (
    <li className={best ? 'is-best' : undefined}>
      <span className={`gift-value${gift.value ? '' : ' is-unknown'}`}>
        {gift.value ? `+${fmt(gift.value)}` : '—'}
      </span>
      <span className="gift-body">
        <b>
          {gift.name}
          {best && <span className="gift-best">Best value</span>}
        </b>
        {gift.where && <span className="muted">{gift.where}</span>}
      </span>
    </li>
  );
}

// Overworld (life) abilities, Bond levels and favourite gifts for one character.
export default function BondSection({ character: c }) {
  const life = SKILLS[c.id]?.life ?? [];
  const bond = BOND[c.id];
  const first = c.name.split(' ')[0];

  return (
    <section className="bond" aria-labelledby="bond-title">
      <h3 id="bond-title" className="mini-title">Overworld abilities <span>max Lv {LIFE_MAX}</span></h3>
      {life.length ? (
        <ol className="skill-list">
          {life.map((sk) => (
            <li key={sk.name}>
              <span className="skill-type skill-type--life">{sk.type}</span>
              <span className="awaken-body">
                <b>{sk.name}</b>
                <span><StatText>{sk.summary}</StatText></span>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted small">Overworld abilities will be added once they’re published.</p>
      )}

      {NO_BOND[c.id] ? (
        <>
          <h3 className="mini-title skill-life-title">Bond</h3>
          <p className="muted small">{NO_BOND[c.id]}</p>
        </>
      ) : (
        <>
          <h3 className="mini-title skill-life-title">Bond levels <span>max Lv {BOND_MAX}</span></h3>
          <ol className="bond-levels">
            {BOND_LEVELS.map((l) => {
              const cosmetic = l.cosmetic && bond?.cosmetics?.[l.cosmetic];
              const extra = bond?.extras?.[l.lv];
              return (
                <li key={l.lv} className={l.stage ? 'has-stage' : undefined}>
                  <span className="bond-lv">Lv {l.lv}</span>
                  <span className="bond-body">
                    {l.stage && (
                      <b className="bond-stage">
                        {l.stage}
                        {l.unlocks && <span> · {l.unlocks}</span>}
                      </b>
                    )}
                    <span>
                      {l.rewards}
                      {l.cosmetic && (
                        <>
                          {', '}
                          {COSMETIC[l.cosmetic]}
                          {cosmetic ? <>: <i>{cosmetic}</i></> : null}
                        </>
                      )}
                      {extra && <>, {extra}</>}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="muted small">
            About {fmt(BOND_TOTAL)} Affinity takes {first} from Lv 1 to Lv {BOND_MAX}. Raise it with gifts, City Hangouts,
            map encounters and home visits.
          </p>

          <h3 className="mini-title skill-life-title">Favourite gifts <span>Affinity per gift</span></h3>
          {bond ? (
            <>
              <ol className="gift-list">
                {bond.gifts.map((gift) => <GiftRow key={gift.name} gift={gift} best={gift.name === bond.best} />)}
              </ol>
              {bond.partial && (
                <p className="muted small">Only some of {first}’s favourites are published so far.</p>
              )}
            </>
          ) : (
            <p className="muted small">{first}’s favourite gifts will be added once they’re published.</p>
          )}
          <p className="gift-sub">Loved by everyone</p>
          <ol className="gift-list gift-list--universal">
            {UNIVERSAL_GIFTS.map((gift) => <GiftRow key={gift.name} gift={gift} />)}
          </ol>
          <p className="muted small">
            Favourite gifts give double Affinity. You can give up to {GIFT_LIMITS.perCharacter} gifts to each character
            and {GIFT_LIMITS.perDay} gifts in total per day.
          </p>
        </>
      )}
    </section>
  );
}
