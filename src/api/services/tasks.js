import { apiRequest } from "../http.js";
import { normalizeTaskBody } from "../normalizers.js";
import { normalizeRole } from "../../lib/authRoles.js";

function tasksBasePath(role) {
  return normalizeRole(role) === "admin" ? "/admin/tasks" : "/company/tasks";
}

export function listTasks({ role, ...filters } = {}) {
  return apiRequest(tasksBasePath(role), { auth: true, query: filters });
}

export function createTask(body, { role } = {}) {
  return apiRequest(tasksBasePath(role), {
    method: "POST",
    auth: true,
    body: normalizeTaskBody(body)
  });
}

export function getTask(id, { role } = {}) {
  return apiRequest(`${tasksBasePath(role)}/${id}`, { auth: true });
}

export function updateTask(id, body, { role } = {}) {
  return apiRequest(`${tasksBasePath(role)}/${id}`, {
    method: "PUT",
    auth: true,
    body: normalizeTaskBody(body, { partial: true })
  });
}

export function updateTaskStatus(id, status, { role } = {}) {
  return apiRequest(`${tasksBasePath(role)}/${id}/status`, {
    method: "PATCH",
    auth: true,
    body: { status }
  });
}

export function updateTaskProgress(id, progress = {}, { role } = {}) {
  const body = typeof progress === "object" && !Array.isArray(progress)
    ? progress
    : { completed: Boolean(progress) };

  return apiRequest(`${tasksBasePath(role)}/${id}/progress`, {
    method: "PATCH",
    auth: true,
    body
  });
}

export function deleteTask(id, { role } = {}) {
  return apiRequest(`${tasksBasePath(role)}/${id}`, { method: "DELETE", auth: true });
}

export function restoreTask(id, { role } = {}) {
  return apiRequest(`${tasksBasePath(role)}/${id}/restore`, { method: "PATCH", auth: true });
}

export function forceDeleteTask(id, { role } = {}) {
  return apiRequest(`${tasksBasePath(role)}/${id}/force-delete`, { method: "DELETE", auth: true });
}

export function addTaskAssignees(id, body, { role } = {}) {
  return apiRequest(`${tasksBasePath(role)}/${id}/assignees`, { method: "POST", auth: true, body });
}

export function removeTaskAssignee(id, userId, { role } = {}) {
  return apiRequest(`${tasksBasePath(role)}/${id}/assignees/${userId}`, { method: "DELETE", auth: true });
}

export function addTaskDependencies(id, body, { role } = {}) {
  return apiRequest(`${tasksBasePath(role)}/${id}/dependencies`, { method: "POST", auth: true, body });
}

export function removeTaskDependency(id, dependencyId, { role } = {}) {
  return apiRequest(`${tasksBasePath(role)}/${id}/dependencies/${dependencyId}`, { method: "DELETE", auth: true });
}

export function addTaskNote(id, body, { role } = {}) {
  return apiRequest(`${tasksBasePath(role)}/${id}/notes`, { method: "POST", auth: true, body });
}

export function deleteTaskNote(id, noteId, { role } = {}) {
  return apiRequest(`${tasksBasePath(role)}/${id}/notes/${noteId}`, { method: "DELETE", auth: true });
}
