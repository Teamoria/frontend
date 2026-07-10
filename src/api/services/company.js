import { apiRequest } from "../http.js";
import { normalizeCompanyBody, normalizeStaffBody } from "../normalizers.js";

export function registerCompany(body) {
  return apiRequest("/company/register", {
    method: "POST",
    auth: true,
    body: normalizeCompanyBody(body)
  });
}

export function getCompanyDashboard() {
  return apiRequest("/company/dashboard", { auth: true });
}

export function getCompanyProfile() {
  return apiRequest("/company/profile", { auth: true });
}

export function updateCompanyProfile(body) {
  return apiRequest("/company/profile", { method: "PATCH", auth: true, body });
}

export function listStaff({ page, archived, roles, statuses } = {}) {
  return apiRequest("/company/staff", {
    auth: true,
    query: {
      page,
      archived: archived ? "1" : undefined,
      "roles[]": roles,
      "statuses[]": statuses
    }
  });
}

export function getStaffMember(id) {
  return apiRequest(`/company/staff/${id}`, { auth: true });
}

export function createStaffMember(body) {
  return apiRequest("/company/staff", {
    method: "POST",
    auth: true,
    body: normalizeStaffBody(body)
  });
}

export function updateStaffMember(id, body) {
  return apiRequest(`/company/staff/${id}`, {
    method: "PUT",
    auth: true,
    body: normalizeStaffBody(body, { partial: true })
  });
}

export function deleteStaffMember(id) {
  return apiRequest(`/company/staff/${id}`, { method: "DELETE", auth: true });
}

export function restoreStaffMember(id) {
  return apiRequest(`/company/staff/${id}/restore`, { method: "PATCH", auth: true });
}

export function forceDeleteStaffMember(id) {
  return apiRequest(`/company/staff/${id}/force-delete`, { method: "DELETE", auth: true });
}
