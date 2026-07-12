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
  const rawType = String(notification.type || notification.category || "system").toLowerCase();
  const data = notification.data || {};
  const isRead = Boolean(notification.is_read ?? notification.read ?? notification.read_at ?? notification.readAt);
  const type = getNotificationType(rawType, data);

  return {
    id: notification.id || notification.uuid,
    title: notification.title || data.title || data.subject || "Notification",
    message: notification.message || notification.body || notification.text || data.message || data.body || data.text || "",
    type,
    is_read: isRead,
    created_at: notification.created_at || notification.createdAt || notification.time || "",
    action_url: notification.action_url || notification.actionUrl || notification.url || data.action_url || data.url || ""
  };
}

function getNotificationType(rawType, data) {
  const haystack = `${rawType} ${data.type || ""} ${data.category || ""}`.toLowerCase();

  if (haystack.includes("task")) return "task";
  if (haystack.includes("upload") || haystack.includes("file") || haystack.includes("document")) return "file";
  if (haystack.includes("ai") || haystack.includes("chat")) return "ai";

  return "system";
}

export function formatNotificationTime(value, language = "en") {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  const locale = language === "ar" ? "ar" : "en";
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffMinutes < 1) return language === "ar" ? "الآن" : "Just now";
  if (diffMinutes < 60) return relative.format(-diffMinutes, "minute");

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return relative.format(-diffHours, "hour");

  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

export function isNotificationsRouteUnavailable(error) {
  return error?.status === 404;
}
