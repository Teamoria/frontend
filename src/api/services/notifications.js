import { apiRequest } from "../http.js";

function normalizeNotificationFilters(filters = {}) {
  return {
    status: filters.status && filters.status !== "all" ? filters.status : undefined,
    per_page: filters.per_page || undefined,
    page: filters.page || undefined
  };
}

export function listNotifications(filters = {}) {
  return apiRequest("/notifications", { auth: true, query: normalizeNotificationFilters(filters) });
}

export function getUnreadNotificationsCount() {
  return apiRequest("/notifications/unread-count", { auth: true });
}

export function markNotificationRead(id) {
  return apiRequest(`/notifications/${id}/read`, { method: "PATCH", auth: true });
}

export function markAllNotificationsRead() {
  return apiRequest("/notifications/read-all", { method: "PATCH", auth: true });
}

export function deleteNotification(id) {
  return apiRequest(`/notifications/${id}`, { method: "DELETE", auth: true });
}
