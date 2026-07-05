import { useEffect, useRef, useState } from "react";
import {
  FiAlertTriangle,
  FiBell,
  FiCheckCircle,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiUser
} from "react-icons/fi";
import { useAuth } from "../../lib/AuthContext.jsx";
import "../../styles/app-header.css";

const defaultNotifications = [
  { title: "New task assigned", text: "You received a new task in the onboarding project.", time: "5m ago", tone: "info", icon: FiBell },
  { title: "Deadline approaching", text: "The launch checklist needs review soon.", time: "28m ago", tone: "warning", icon: FiAlertTriangle },
  { title: "Update approved", text: "Your weekly update was approved by the team lead.", time: "1h ago", tone: "success", icon: FiCheckCircle }
];

export default function AppHeader({
  classNamePrefix = "product",
  onMobileNavToggle,
  profile,
  role,
  user
}) {
  const { logout, user: authUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const menuRef = useRef(null);
  const notificationsRef = useRef(null);
  const displayName = authUser?.name || authUser?.email || user || profile?.label || "Teamoria User";
  const displayRole = role || profile?.label || authUser?.role || "Workspace Member";
  const initials = getInitials(displayName || profile?.initials);

  useEffect(() => {
    function handleClickOutside(event) {
      const clickedOutsideMenu = menuRef.current && !menuRef.current.contains(event.target);
      const clickedOutsideNotifications = notificationsRef.current && !notificationsRef.current.contains(event.target);

      if (clickedOutsideMenu) {
        setIsMenuOpen(false);
      }

      if (clickedOutsideNotifications) {
        setIsNotificationsOpen(false);
      }
    }

    function handleEsc(event) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <header className={`${classNamePrefix}-topbar app-header`}>
      <button className="mobile-nav-toggle" type="button" aria-label="Open navigation menu" onClick={onMobileNavToggle}>
        <FiMenu aria-hidden="true" />
      </button>

      <label className={`${classNamePrefix}-search app-header__search`}>
        <FiSearch aria-hidden="true" />
        <input placeholder="Search everywhere..." />
      </label>

      <div className={`${classNamePrefix}-top-actions app-header__actions`}>
        <div className="dashboard-notifications-wrap" ref={notificationsRef}>
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={isNotificationsOpen}
            onClick={() => {
              setIsMenuOpen(false);
              setIsNotificationsOpen((current) => !current);
            }}
          >
            <FiBell aria-hidden="true" />
            <span>3</span>
          </button>

          {isNotificationsOpen ? (
            <section className="dashboard-notifications-panel" aria-label="Notifications panel">
              <header>
                <h3>Notifications</h3>
                <button type="button">Mark all as read</button>
              </header>
              <div className="dashboard-notifications-list">
                {defaultNotifications.map(({ icon: Icon, text, time, title, tone }) => (
                  <article className={`dashboard-notification-item tone-${tone}`} key={title}>
                    <span>
                      <Icon aria-hidden="true" />
                    </span>
                    <div>
                      <h4>{title}</h4>
                      <p>{text}</p>
                      <time>{time}</time>
                    </div>
                  </article>
                ))}
              </div>
              <footer>
                <button type="button">View all notifications</button>
              </footer>
            </section>
          ) : null}
        </div>

        <div className="dashboard-profile-menu-wrap" ref={menuRef}>
          <div className="dashboard-account-summary">
            <div className="avatar-image" aria-hidden="true" />
            <div>
              <b>{displayName}</b>
              <small>{displayRole}</small>
            </div>
          </div>
          <button
            className={`${classNamePrefix}-avatar dashboard-avatar-button`}
            type="button"
            aria-label="Open account menu"
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
            onClick={() => {
              setIsNotificationsOpen(false);
              setIsMenuOpen((current) => !current);
            }}
          >
            {initials}
          </button>

          {isMenuOpen ? (
            <div className="dashboard-profile-menu" role="menu">
              <div className="dashboard-menu-header">
                <div className="dashboard-menu-avatar">{initials}</div>
                <div>
                  <b>{displayName}</b>
                  <small>{displayRole}</small>
                </div>
              </div>
              <a className="dashboard-menu-item" href="#/profile" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                <FiUser aria-hidden="true" />
                <span>Profile</span>
              </a>
              <button
                className="dashboard-menu-item dashboard-menu-item--danger"
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsMenuOpen(false);
                  logout();
                }}
              >
                <FiLogOut aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function getInitials(value) {
  return String(value || "U")
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}
