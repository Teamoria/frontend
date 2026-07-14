import { FiBell } from "react-icons/fi";
import { formatNotificationTime, notificationIconByType } from "../../../lib/notifications.js";
import { notificationTone } from "./notificationHelpers.js";

export default function NotificationItem({ language, local, notification }) {
  const Icon = notificationIconByType[notification.type] || FiBell;
  const tone = notificationTone(notification);

  return (
    <article className={`notification-item notification-item--${tone}`}>
      <span className="notification-item__icon" aria-hidden="true"><Icon /></span>
      <div className="notification-item__body">
        <header>
          <h2 dir="auto">{notification.title}</h2>
          {notification.created_at ? <time dateTime={notification.created_at}>{formatNotificationTime(notification.created_at, language)}</time> : null}
        </header>
        {notification.message ? <p dir="auto">{notification.message}</p> : null}
        <footer>
          <span>{notification.type || local.system}</span>
          <strong>{notification.is_read ? local.read : local.unread}</strong>
        </footer>
      </div>
    </article>
  );
}
