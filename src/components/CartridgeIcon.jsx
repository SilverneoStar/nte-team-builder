// Small official Cartridge set icon.
import { cartridgeIconUrl } from '../lib/icons.js';

// Official Cartridge set icon.
export default function CartridgeIcon({ id, size = 20 }) {
  return (
    <img
      className="cart-icon"
      src={cartridgeIconUrl(id)}
      width={size}
      height={size}
      alt=""
      loading="lazy"
      decoding="async"
    />
  );
}
