import { Link } from "react-router-dom";
import UserProfile from "./UserProfile.jsx";

function renderItem(item) {
  const content = (
    <>
      {item.icon ? <span className="nav-item-icon">{item.icon}</span> : null}
      <span>{item.label}</span>
    </>
  );

  if (item.to) {
    return (
      <Link
        key={item.key || item.label}
        to={item.to}
        className={["nav-item", item.active ? "active" : ""].join(" ")}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      key={item.key || item.label}
      type="button"
      className={["nav-item", item.active ? "active" : ""].join(" ")}
      onClick={item.onClick}
    >
      {content}
    </button>
  );
}

function DashboardSidebar({
  user,
  credits = "--",
  sections = [],
  footer
}) {
  return (
    <aside className="sidebar">
      <UserProfile user={user} credits={credits} />

      {sections.map((section) => (
        <div key={section.title || section.key} className="sidebar-section">
          {section.title ? <div className="nav-section-title">{section.title}</div> : null}
          <div className="sidebar-section-items">{section.items?.map(renderItem)}</div>
        </div>
      ))}

      {footer ? <div className="sidebar-footer">{footer}</div> : null}
    </aside>
  );
}

export default DashboardSidebar;
