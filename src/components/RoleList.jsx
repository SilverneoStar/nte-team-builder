// A character's roles with their icons.
import { roleIconUrl } from '../lib/icons.js';

// A character's roles, each with its official role icon.
export default function RoleList({ roles, size = 14, separator = true }) {
  return (
    <span className="role-list">
      {roles.map((role, i) => (
        <span key={role} className="role-item">
          {separator && i > 0 && <span className="role-sep" aria-hidden="true">·</span>}
          <img className="role-icon" src={roleIconUrl(role)} width={size} height={size} alt="" />
          {role}
        </span>
      ))}
    </span>
  );
}
