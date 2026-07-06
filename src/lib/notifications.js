import { FiBell, FiCheckCircle, FiCpu, FiFileText } from "react-icons/fi";
import { getPayloadData } from "./api.js";

export const notificationIconByType = {
  ai: FiCpu,
  file: FiFileText,
  system: FiBell,
  task: FiCheckCircle
};

export function extractNotifications(payload) {
  const data = getPayloadData(payload);
  const rows = data?.notifications || data?.data || data?.items || data || [];
  return Array.isArray(rows) ? rows.map(normalizeNotification).filter((item) => item.id) : [];
}

export function extractUnreadCount(payload) {
  const data = getPayloadData(payload);
  return Number(data?.unread_count ?? data?.count ?? data?.total ?? data ?? 0) || 0;
}

export function normalizeNotification(notification) {
  const type = String(notification.type || notification.category || "system").toLowerCase();
  const isRead = Boolean(notification.is_read ?? notification.read ?? notification.read_at ?? notification.readAt);

  return {
    id: notification.id || notification.uuid,
    title: notification.title || "Notification",
    message: notification.message || notification.body || notification.text || "",
    type: ["task", "file", "system", "ai"].includes(type) ? type : "system",
    is_read: isRead,
    created_at: notification.created_at || notification.createdAt || notification.time || "",
    action_url: notification.action_url || notification.actionUrl || notification.url || ""
  };
}

export function formatNotificationTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export function isNotificationsRouteUnavailable(error) {
  return error?.status === 404;
}
