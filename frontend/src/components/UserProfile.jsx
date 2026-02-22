import Chip from "./ui/Chip.jsx";

function getInitials(name) {
  if (!name) {
    return "--";
  }

  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function UserProfile({ user, credits = "--" }) {
  const roleTone = user?.role === "ADMIN" ? "warning" : "info";

  return (
    <div className="user-profile-wrap">
      <div className="user-profile">
        <div className="user-profile-avatar">{getInitials(user?.name)}</div>
        <div className="user-profile-content">
          <p className="user-profile-name">{user?.name || "Usuario"}</p>
          <p className="user-profile-email">{user?.email || "-"}</p>
        </div>
        <button type="button" className="user-profile-menu" aria-label="Mais opcoes">
          <span />
          <span />
          <span />
        </button>
      </div>
      <div className="user-profile-badges">
        <Chip tone="accent">{credits} creditos</Chip>
        <Chip tone={roleTone}>{user?.role || "USER"}</Chip>
      </div>
    </div>
  );
}

export default UserProfile;
