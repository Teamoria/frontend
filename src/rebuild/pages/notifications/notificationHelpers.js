import { getPayloadData, extractPagination } from "../../../lib/api.js";
import { extractNotifications } from "../../../lib/notifications.js";

export const notificationStatusFilters = ["all", "unread", "read"];

export function buildNotificationQuery({ page, perPage, status }) {
  return {
    page,
    per_page: perPage,
    status: notificationStatusFilters.includes(status) ? status : "all"
  };
}

export function normalizeNotificationsPayload(payload, fallbackPage = 1, fallbackPerPage = 15) {
  const data = getPayloadData(payload);
  const rows = extractNotifications(payload);
  const meta = extractPagination(data) || data?.pagination || data?.meta || {};
  const currentPage = Number(meta.current_page ?? meta.currentPage ?? fallbackPage) || 1;
  const lastPage = Number(meta.last_page ?? meta.lastPage ?? meta.pages ?? 1) || 1;
  const perPage = Number(meta.per_page ?? meta.perPage ?? fallbackPerPage) || fallbackPerPage;
  const total = Number(meta.total ?? rows.length) || 0;
  const unreadCount = Number(data?.unread_count ?? 0) || 0;

  return {
    rows,
    unreadCount,
    pagination: {
      currentPage,
      lastPage,
      perPage,
      total
    }
  };
}

export function notificationTone(notification) {
  if (!notification?.is_read) return "unread";
  return "read";
}

export function notificationStatusLabel(status, local) {
  if (status === "read") return local.read;
  if (status === "unread") return local.unread;
  return local.all;
}
