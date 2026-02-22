import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Chip from "./ui/Chip.jsx";

function getInitials(name) {
  if (!name) {
    return "--";
  }

  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function UserProfile({ user, credits = "--" }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const menuRef = useRef(null);
  const roleTone = user?.role === "ADMIN" ? "warning" : "info";

  const closeMenu = useCallback(() => {
    if (!menuVisible || menuClosing) {
      return;
    }
    setMenuClosing(true);
    window.setTimeout(() => {
      setMenuOpen(false);
      setMenuVisible(false);
      setMenuClosing(false);
    }, 160);
  }, [menuClosing, menuVisible]);

  const toggleMenu = () => {
    if (menuOpen && menuVisible) {
      closeMenu();
      return;
    }
    setMenuOpen(true);
    setMenuVisible(true);
    setMenuClosing(false);
  };

  useEffect(() => {
    if (!menuOpen || !menuVisible) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        closeMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [closeMenu, menuOpen, menuVisible]);

  return (
    <div className="user-profile-wrap">
      <div className="user-profile" ref={menuRef}>
        <div className="user-profile-avatar">{getInitials(user?.name)}</div>
        <div className="user-profile-content">
          <p className="user-profile-name">{user?.name || "Usuario"}</p>
          <p className="user-profile-email">{user?.email || "-"}</p>
        </div>
        <button
          type="button"
          className="user-profile-menu"
          aria-label="Mais opcoes"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          <span />
          <span />
          <span />
        </button>

        {menuVisible ? (
          <div className={["dropdown-menu user-profile-dropdown", menuClosing ? "dropdown-exit" : "dropdown-enter"].join(" ")} role="menu">
            <button
              type="button"
              className="dropdown-item"
              role="menuitem"
              onClick={() => {
                closeMenu();
                navigate("/profile");
              }}
            >
              Editar perfil
            </button>
          </div>
        ) : null}
      </div>
      <div className="user-profile-badges">
        <Chip tone="accent">{credits} creditos</Chip>
        <Chip tone={roleTone}>{user?.role || "USER"}</Chip>
      </div>
    </div>
  );
}

export default UserProfile;
