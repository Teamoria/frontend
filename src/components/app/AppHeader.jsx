import { useEffect, useRef, useState } from "react";
import {
  FiActivity,
  FiBell,
  FiChevronDown,
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
import { isDemoMode } from "../../lib/demoMode.js";
import { usePreferences } from "../../lib/PreferencesContext.jsx";
import { useRealtime } from "../../lib/RealtimeContext.jsx";
import {
  extractNotifications,
  extractUnreadCount,
  formatNotificationTime,
  isNotificationsRouteUnavailable,
  notificationIconByType
} from "../../lib/notifications.js";
import PreferenceControls from "./PreferenceControls.jsx";
import "../../styles/app-header.css";

export default function AppHeader({
  classNamePrefix = "product",
  onMobileNavToggle,
  profile,
  role,
  user
}) {
  const { logout, user: authUser } = useAuth();
  const { direction, label, language, t } = usePreferences();
  const { configured, connectionError, connectionStatus, isConnected } = useRealtime();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsError, setNotificationsError] = useState("");
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);
  const notificationsRef = useRef(null);
  const displayName = authUser?.name || authUser?.email || user || profile?.label || "Teamoria User";
  const displayRole = label(role || profile?.label || authUser?.role || "Workspace Member");
  const initials = getInitials(displayName || profile?.initials);
  const isPreview = isDemoMode();

  async function loadNotifications({ silent = false } = {}) {
    if (isPreview) {
      setNotifications([]);
      setUnreadCount(0);
      setNotificationsError("");
      setNotificationsLoading(false);
      return;
    }

    if (!silent) setNotificationsLoading(true);
    setNotificationsError("");

    try {
      const [notificationsPayload, countPayload] = await Promise.all([
        listNotifications({ per_page: 8 }),
        getUnreadNotificationsCount()
      ]);
      setNotifications(extractNotifications(notificationsPayload));
      setUnreadCount(extractUnreadCount(countPayload));
    } catch (error) {
      setNotifications([]);
      setUnreadCount(0);
      setNotificationsError(isNotificationsRouteUnavailable(error) ? "" : error.message || t("notificationError"));
    } finally {
      if (!silent) setNotificationsLoading(false);
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setIsNotificationsOpen(false);
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (isPreview) {
      setNotifications([]);
      setUnreadCount(0);
      setNotificationsError("");
      setNotificationsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    Promise.all([listNotifications({ per_page: 8 }), getUnreadNotificationsCount()])
      .then(([notificationsPayload, countPayload]) => {
        if (!isMounted) return;
        setNotifications(extractNotifications(notificationsPayload));
        setUnreadCount(extractUnreadCount(countPayload));
      })
      .catch((error) => {
        if (!isMounted) return;
        setNotifications([]);
        setUnreadCount(0);
        setNotificationsError(isNotificationsRouteUnavailable(error) ? "" : error.message || t("notificationError"));
      })
      .finally(() => {
        if (isMounted) setNotificationsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isPreview]);

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
          setNotificationsError(error.message || t("notificationError"));
        }
      }
    }

    if (notification.action_url) window.location.href = notification.action_url;
  }

  async function handleMarkAllRead() {
    setNotificationsError("");

    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      if (!isNotificationsRouteUnavailable(error)) {
        setNotificationsError(error.message || t("notificationError"));
      }
    }
  }

  return (
    <header className={`${classNamePrefix}-topbar app-header tm-app-header`}>
      <button
        className="mobile-nav-toggle tm-header-icon-button tm-header-menu-button"
        type="button"
        aria-label={t("openNavigation")}
        onClick={onMobileNavToggle}
      >
        <FiMenu aria-hidden="true" />
      </button>

      <div className="tm-header-context" aria-hidden="true">
        <span>{direction === "rtl" ? "مساحة القيادة" : "Command space"}</span>
        <b>{direction === "rtl" ? "اليوم" : "Today"}</b>
      </div>

      <label className={`${classNamePrefix}-search app-header__search tm-command-search`}>
        <FiSearch aria-hidden="true" />
        <input type="search" placeholder={t("search")} aria-label={t("search")} />
        <kbd aria-hidden="true">⌘ K</kbd>
      </label>

      <div className={`${classNamePrefix}-top-actions app-header__actions tm-header-actions`}>
        <RealtimeStatus
          configured={configured}
          connectionError={connectionError}
          connectionStatus={connectionStatus}
          direction={direction}
          isConnected={isConnected}
          t={t}
        />
        <PreferenceControls className="tm-header-preferences" />

        <div className="dashboard-notifications-wrap tm-popover-wrap" ref={notificationsRef}>
          <button
            className="tm-header-icon-button tm-notification-trigger"
            type="button"
            aria-label={t("notifications")}
            aria-expanded={isNotificationsOpen}
            onClick={() => {
              setIsMenuOpen(false);
              setIsNotificationsOpen((current) => !current);
              if (!isNotificationsOpen) loadNotifications({ silent: true });
            }}
          >
            <FiBell aria-hidden="true" />
            {unreadCount > 0 ? <span>{unreadCount > 99 ? "99+" : unreadCount}</span> : null}
          </button>

          {isNotificationsOpen ? (
            <section className="dashboard-notifications-panel tm-popover tm-notifications-popover" aria-label={t("notifications")}>
              <header>
                <div>
                  <span className="tm-popover-kicker">{direction === "rtl" ? "آخر نشاط" : "Latest activity"}</span>
                  <h3>{t("notifications")}</h3>
                </div>
                {notifications.length > 0 || unreadCount > 0 ? (
                  <button type="button" onClick={handleMarkAllRead} disabled={unreadCount === 0 || notificationsLoading}>
                    {t("markAllRead")}
                  </button>
                ) : null}
              </header>
              <div className="dashboard-notifications-list" aria-live="polite">
                {notificationsLoading ? <NotificationSkeleton /> : null}
                {!notificationsLoading && notificationsError ? (
                  <div className="dashboard-notifications-error">
                    <h4>{t("notificationError")}</h4>
                    <p>{notificationsError}</p>
                    <button type="button" onClick={() => loadNotifications()}>{t("retry")}</button>
                  </div>
                ) : null}
                {!notificationsLoading && !notificationsError && notifications.length === 0 ? <NotificationEmptyState t={t} /> : null}
                {!notificationsLoading && !notificationsError && notifications.length > 0 ? (
                  <NotificationSections
                    language={language}
                    notifications={notifications.slice(0, 8)}
                    onOpen={handleNotificationClick}
                    t={t}
                  />
                ) : null}
              </div>
              <footer>
                <button type="button" onClick={() => {
                  setIsNotificationsOpen(false);
                  window.location.hash = "/notifications";
                }}>
                  {t("viewAllNotifications")}
                </button>
              </footer>
            </section>
          ) : null}
        </div>

        <div className="dashboard-profile-menu-wrap tm-popover-wrap" ref={menuRef}>
          <button
            className="tm-account-trigger"
            type="button"
            aria-label={t("openAccount")}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            onClick={() => {
              setIsNotificationsOpen(false);
              setIsMenuOpen((current) => !current);
            }}
          >
            <span className={`${classNamePrefix}-avatar dashboard-avatar-button tm-avatar`}>{initials}</span>
            <span className="tm-account-trigger__copy">
              <b dir="auto">{displayName}</b>
              <small>{displayRole}</small>
            </span>
            <FiChevronDown aria-hidden="true" />
          </button>

          {isMenuOpen ? (
            <div className="dashboard-profile-menu tm-popover tm-account-popover" role="menu">
              <div className="dashboard-menu-header">
                <div className="dashboard-menu-avatar tm-avatar">{initials}</div>
                <div>
                  <b dir="auto">{displayName}</b>
                  <small>{displayRole}</small>
                </div>
              </div>
              <PreferenceControls className="tm-account-preferences" showLabels />
              <a className="dashboard-menu-item" href="#/profile" role="menuitem" onClick={() => setIsMenuOpen(false)}>
                <FiUser aria-hidden="true" />
                <span>{t("profile")}</span>
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
                <span>{t("signOut")}</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function RealtimeStatus({ configured, connectionError, connectionStatus, direction, isConnected, t }) {
  const state = !configured
    ? "disabled"
    : isConnected
      ? "connected"
      : connectionStatus === "connecting"
        ? "connecting"
        : "disconnected";
  const statusText = state === "connected"
    ? t("realtimeConnected")
    : state === "connecting"
      ? t("realtimeConnecting")
      : state === "disabled"
        ? t("realtimeUnavailable")
        : t("realtimeDisconnected");

  return (
    <div
      className={`tm-realtime-status is-${state}`}
      role="status"
      aria-live="polite"
      title={connectionError?.message || statusText}
    >
      <FiActivity aria-hidden="true" />
      <span>{statusText}</span>
      {state === "disabled" && direction === "rtl" ? <small>أضف مفتاح Reverb</small> : null}
    </div>
  );
}

function NotificationEmptyState({ t }) {
  return (
    <div className="dashboard-notifications-empty">
      <span aria-hidden="true"><FiBell /></span>
      <h4>{t("noNotifications")}</h4>
      <p>{t("notificationEmptyText")}</p>
    </div>
  );
}

function NotificationSections({ language, notifications, onOpen, t }) {
  const groups = groupNotificationsByDay(notifications, t);

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
              <span><Icon aria-hidden="true" /></span>
              <div>
                <h5 dir="auto">{notification.title}</h5>
                <p dir="auto">{notification.message}</p>
                <time>{formatNotificationTime(notification.created_at, language)}</time>
              </div>
              {!notification.is_read ? <i aria-label={language === "ar" ? "إشعار غير مقروء" : "Unread notification"} /> : null}
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
        <div key={item}><span /><p /><p /></div>
      ))}
    </div>
  );
}

function groupNotificationsByDay(notifications, t) {
  const groups = [
    { label: t("today"), items: [] },
    { label: t("yesterday"), items: [] },
    { label: t("earlier"), items: [] }
  ];
  const now = new Date();
  const todayKey = getDateKey(now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = getDateKey(yesterday);

  notifications.forEach((notification) => {
    const date = new Date(notification.created_at);
    const key = Number.isNaN(date.getTime()) ? "" : getDateKey(date);
    if (key === todayKey) groups[0].items.push(notification);
    else if (key === yesterdayKey) groups[1].items.push(notification);
    else groups[2].items.push(notification);
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
