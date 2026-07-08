import { useEffect, useState } from "react";
import AppShell, { PageHeader } from "../components/app/AppShell.jsx";
import { FiRefreshCw, FiTrash2 } from "react-icons/fi";
import {
  deleteNotification,
  getUnreadNotificationsCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";
import {
  extractNotifications,
  extractUnreadCount,
  formatNotificationTime,
  isNotificationsRouteUnavailable,
  notificationIconByType
} from "../lib/notifications.js";
import "../styles/notifications.css";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [unreadCount, setUnreadCount] = useState(0);
  const [filters, setFilters] = useState({ status: "all", per_page: 20 });

  useEffect(() => {
    loadNotifications();
  }, [filters.status, filters.per_page]);

  async function loadNotifications() {
    setStatus({ loading: true, error: "" });

    try {
      const [notificationsPayload, countPayload] = await Promise.all([
        listNotifications(filters),
        getUnreadNotificationsCount()
      ]);

      setNotifications(extractNotifications(notificationsPayload));
      setUnreadCount(extractUnreadCount(countPayload));
      setStatus({ loading: false, error: "" });
    } catch (error) {
      setNotifications([]);
      setUnreadCount(0);
      setStatus({
        loading: false,
        error: isNotificationsRouteUnavailable(error) ? "" : error.message || "Unable to load notifications."
      });
    }
  }

  async function removeNotification(event, notification) {
    event.stopPropagation();
    setStatus({ loading: false, error: "" });

    try {
      await deleteNotification(notification.id);
      setNotifications((current) => current.filter((item) => item.id !== notification.id));
      if (!notification.is_read) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }
    } catch (error) {
      if (!isNotificationsRouteUnavailable(error)) {
        setStatus({ loading: false, error: error.message || "Unable to delete notification." });
      }
    }
  }

  async function openNotification(notification) {
    if (!notification.is_read) {
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, is_read: true } : item
      )));
      setUnreadCount((current) => Math.max(0, current - 1));

      try {
        await markNotificationRead(notification.id);
      } catch (error) {
        if (!isNotificationsRouteUnavailable(error)) {
          setStatus({ loading: false, error: error.message || "Unable to mark notification as read." });
        }
        return;
      }
    }

    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  }

  async function markAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
      setStatus({ loading: false, error: "" });
    } catch (error) {
      if (!isNotificationsRouteUnavailable(error)) {
        setStatus({ loading: false, error: error.message || "Unable to mark notifications as read." });
      }
    }
  }

  return (
    <AppShell active="Notifications" user={user?.name || "Teamoria User"} role={user?.role || "Workspace Member"}>
      <main className="notifications-page">
        <PageHeader
          title="Notifications"
          eyebrow="Task, file, system, and AI alerts from your workspace."
          actions={(
            <div className="notifications-actions">
              <button className="filter-button" type="button" onClick={loadNotifications} disabled={status.loading}>
                <FiRefreshCw aria-hidden="true" />Refresh
              </button>
              <button className="product-button" type="button" onClick={markAllRead} disabled={unreadCount === 0 || status.loading}>
                Mark all as read
              </button>
            </div>
          )}
        />

        <section className="notifications-summary" aria-label="Notification summary">
          <article>
            <span>Unread</span>
            <strong>{unreadCount}</strong>
          </article>
          <article>
            <span>Total</span>
            <strong>{notifications.length}</strong>
          </article>
        </section>

        <section className="notifications-filter-bar" aria-label="Notification filters">
          <div className="notifications-status-tabs">
            {["all", "unread", "read"].map((item) => (
              <button
                className={filters.status === item ? "active" : ""}
                key={item}
                type="button"
                onClick={() => setFilters((current) => ({ ...current, status: item }))}
              >
                {formatFilterLabel(item)}
              </button>
            ))}
          </div>
          <label>
            <span>Per page</span>
            <select
              value={filters.per_page}
              onChange={(event) => setFilters((current) => ({ ...current, per_page: Number(event.target.value) }))}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </label>
        </section>

        <section className="notifications-panel">
          {status.loading ? <p className="notifications-state">Loading notifications...</p> : null}
          {!status.loading && status.error ? <p className="notifications-state notifications-state--error">{status.error}</p> : null}
          {!status.loading && !status.error && notifications.length === 0 ? (
            <p className="notifications-state">No notifications yet.</p>
          ) : null}

          {!status.loading && !status.error && notifications.length > 0 ? (
            <div className="notifications-list">
              {notifications.map((notification) => {
                const Icon = notificationIconByType[notification.type];
                return (
                  <article
                    className={`notifications-item notifications-item--${notification.type} ${notification.is_read ? "is-read" : "is-unread"}`}
                    key={notification.id}
                  >
                    <button className="notifications-open-button" type="button" onClick={() => openNotification(notification)}>
                      <span className="notifications-icon">{Icon ? <Icon aria-hidden="true" /> : null}</span>
                      <span>
                        <span className="notifications-item-head">
                          <h2>{notification.title}</h2>
                          <time>{formatNotificationTime(notification.created_at)}</time>
                        </span>
                        <p>{notification.message}</p>
                      </span>
                    </button>
                    <button
                      className="notifications-delete-button"
                      type="button"
                      aria-label={`Delete ${notification.title}`}
                      onClick={(event) => removeNotification(event, notification)}
                    >
                      <FiTrash2 aria-hidden="true" />
                    </button>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      </main>
    </AppShell>
  );
}

function formatFilterLabel(value) {
  return String(value).replace(/\b\w/g, (char) => char.toUpperCase());
}
