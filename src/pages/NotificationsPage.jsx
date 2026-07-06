import { useEffect, useState } from "react";
import AppShell, { PageHeader } from "../components/app/AppShell.jsx";
import {
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

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setStatus({ loading: true, error: "" });

    try {
      const [notificationsPayload, countPayload] = await Promise.all([
        listNotifications(),
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
            <button className="product-button" type="button" onClick={markAllRead} disabled={unreadCount === 0 || status.loading}>
              Mark all as read
            </button>
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
                  <button
                    className={`notifications-item notifications-item--${notification.type} ${notification.is_read ? "is-read" : "is-unread"}`}
                    key={notification.id}
                    type="button"
                    onClick={() => openNotification(notification)}
                  >
                    <span className="notifications-icon">{Icon ? <Icon aria-hidden="true" /> : null}</span>
                    <div>
                      <div className="notifications-item-head">
                        <h2>{notification.title}</h2>
                        <time>{formatNotificationTime(notification.created_at)}</time>
                      </div>
                      <p>{notification.message}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}
        </section>
      </main>
    </AppShell>
  );
}
