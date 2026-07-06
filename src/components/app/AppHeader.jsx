import { useEffect, useRef, useState } from "react";
import {
  FiBell,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiUser
} from "react-icons/fi";
import {
  getUnreadNotificationsCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "../../lib/api.js";
import { useAuth } from "../../lib/AuthContext.jsx";
import {
  extractNotifications,
  extractUnreadCount,
  formatNotificationTime,
  isNotificationsRouteUnavailable,
  notificationIconByType
} from "../../lib/notifications.js";
import "../../styles/app-header.css";

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
  const [notifications, setNotifications] = useState([]);
  const [notificationsError, setNotificationsError] = useState("");
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);
  const notificationsRef = useRef(null);
  const displayName = authUser?.name || authUser?.email || user || profile?.label || "Teamoria User";
  const displayRole = role || profile?.label || authUser?.role || "Workspace Member";
  const initials = getInitials(displayName || profile?.initials);

  async function loadNotifications({ silent = false } = {}) {
    if (!silent) {
      setNotificationsLoading(true);
    }
    setNotificationsError("");

    try {
      const [notificationsPayload, countPayload] = await Promise.all([
        listNotifications(),
        getUnreadNotificationsCount()
      ]);

      const nextNotifications = extractNotifications(notificationsPayload);
      setNotifications(nextNotifications);
      setUnreadCount(extractUnreadCount(countPayload));
    } catch (error) {
      setNotifications([]);
      setUnreadCount(0);
      setNotificationsError(isNotificationsRouteUnavailable(error) ? "" : error.message || "Unable to load notifications.");
    } finally {
      if (!silent) {
        setNotificationsLoading(false);
      }
    }
  }

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

  useEffect(() => {
    let isMounted = true;

    async function loadInitialNotifications() {
      setNotificationsLoading(true);
      setNotificationsError("");

      try {
        const [notificationsPayload, countPayload] = await Promise.all([
          listNotifications(),
          getUnreadNotificationsCount()
        ]);

        if (!isMounted) return;

        const nextNotifications = extractNotifications(notificationsPayload);
        setNotifications(nextNotifications);
        setUnreadCount(extractUnreadCount(countPayload));
      } catch (error) {
        if (!isMounted) return;
        setNotifications([]);
        setUnreadCount(0);
        setNotificationsError(isNotificationsRouteUnavailable(error) ? "" : error.message || "Unable to load notifications.");
      } finally {
        if (isMounted) setNotificationsLoading(false);
      }
    }

    loadInitialNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleNotificationClick(notification) {
    if (!notification.is_read) {
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, is_read: true } : item
      )));
      setUnreadCount((current) => Math.max(0, current - 1));

      try {
        await markNotificationRead(notification.id);
      } catch (error) {
        if (!isNotificationsRouteUnavailable(error)) {
          setNotificationsError(error.message || "Unable to mark notification as read.");
        }
      }
    }

    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  }

  async function handleMarkAllRead() {
    setNotificationsError("");

    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      if (!isNotificationsRouteUnavailable(error)) {
        setNotificationsError(error.message || "Unable to mark notifications as read.");
      }
    }
  }

  function openAllNotifications() {
    setIsNotificationsOpen(false);
    window.location.hash = "/notifications";
  }

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
            {unreadCount > 0 ? <span>{unreadCount > 99 ? "99+" : unreadCount}</span> : null}
          </button>

          {isNotificationsOpen ? (
            <section className="dashboard-notifications-panel" aria-label="Notifications panel">
              <header>
                <h3>Notifications</h3>
                {notifications.length > 0 || unreadCount > 0 ? (
                  <button type="button" onClick={handleMarkAllRead} disabled={unreadCount === 0 || notificationsLoading}>
                    Mark all as read
                  </button>
                ) : null}
              </header>
              <div className="dashboard-notifications-list">
                {notificationsLoading ? <NotificationSkeleton /> : null}
                {!notificationsLoading && notificationsError ? (
                  <div className="dashboard-notifications-error">
                    <h4>Could not load notifications</h4>
                    <p>{notificationsError}</p>
                    <button type="button" onClick={() => loadNotifications()}>Retry</button>
                  </div>
                ) : null}
                {!notificationsLoading && !notificationsError && notifications.length === 0 ? <NotificationEmptyState /> : null}
                {!notificationsLoading && !notificationsError && notifications.length > 0 ? (
                  <NotificationSections notifications={notifications.slice(0, 8)} onOpen={handleNotificationClick} />
                ) : null}
              </div>
              <footer>
                <button type="button" onClick={openAllNotifications}>View all notifications</button>
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

function NotificationEmptyState() {
  return (
    <div className="dashboard-notifications-empty">
      <span aria-hidden="true">
        <FiBell />
      </span>
      <h4>No notifications yet</h4>
      <p>New updates about tasks, files, and AI activity will appear here.</p>
    </div>
  );
}

function NotificationSections({ notifications, onOpen }) {
  const groups = groupNotificationsByDay(notifications);

  return groups.map((group) => (
    <section className="dashboard-notifications-section" key={group.label}>
      <h4>{group.label}</h4>
      <div>
        {group.items.map((notification) => {
          const Icon = notificationIconByType[notification.type] || FiBell;
          return (
            <button
              className={`dashboard-notification-item tone-${notification.type} ${notification.is_read ? "is-read" : "is-unread"}`}
              key={notification.id}
              type="button"
              onClick={() => onOpen(notification)}
            >
              <span>
                <Icon aria-hidden="true" />
              </span>
              <div>
                <h5>{notification.title}</h5>
                <p>{notification.message}</p>
                <time>{formatNotificationTime(notification.created_at)}</time>
              </div>
              {!notification.is_read ? <i aria-label="Unread notification" /> : null}
            </button>
          );
        })}
      </div>
    </section>
  ));
}

function NotificationSkeleton() {
  return (
    <div className="dashboard-notifications-skeleton" aria-label="Loading notifications">
      {[0, 1, 2].map((item) => (
        <div key={item}>
          <span />
          <p />
          <p />
        </div>
      ))}
    </div>
  );
}

function groupNotificationsByDay(notifications) {
  const groups = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Earlier", items: [] }
  ];
  const now = new Date();
  const todayKey = getDateKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = getDateKey(yesterday);

  notifications.forEach((notification) => {
    const date = new Date(notification.created_at);
    const key = Number.isNaN(date.getTime()) ? "" : getDateKey(date);

    if (key === todayKey) {
      groups[0].items.push(notification);
    } else if (key === yesterdayKey) {
      groups[1].items.push(notification);
    } else {
      groups[2].items.push(notification);
    }
  });

  return groups.filter((group) => group.items.length > 0);
}

function getDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getInitials(value) {
  return String(value || "U")
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}
