import NotificationItem from "./NotificationItem.jsx";

export default function NotificationList({ language, local, notifications }) {
  return (
    <div className="notifications-list" aria-live="polite">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          language={language}
          local={local}
          notification={notification}
        />
      ))}
    </div>
  );
}
