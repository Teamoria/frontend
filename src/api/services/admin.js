import { apiRequest } from "../http.js";
import { normalizeCompanyBody } from "../normalizers.js";
import { isDemoMode } from "../../lib/demoMode.js";

const demoCompanies = [
  {
    id: "demo-company-1",
    name: "NexuTech Solutions",
    industry: "Enterprise Software",
    website: "https://nexutech.example",
    address: "San Francisco, CA",
    status: "active",
    created_at: "2026-04-12T09:00:00Z",
    updated_at: "2026-06-18T14:30:00Z"
  },
  {
    id: "demo-company-2",
    name: "Quantum Labs",
    industry: "AI Research",
    website: "https://quantumlabs.example",
    address: "Austin, TX",
    status: "active",
    created_at: "2026-03-04T11:20:00Z",
    updated_at: "2026-06-22T10:15:00Z"
  },
  {
    id: "demo-company-3",
    name: "Velo Analytics",
    industry: "Business Intelligence",
    website: "https://velo.example",
    address: "London, UK",
    status: "suspended",
    created_at: "2026-02-17T08:45:00Z",
    updated_at: "2026-06-08T16:10:00Z"
  }
];

const demoUsers = [
  {
    id: "demo-user-1",
    name: "Super Admin",
    email: "superadmin@teamoria.demo",
    role: "admin",
    status: "active",
    company: null,
    last_login_at: "2026-06-30T09:20:00Z"
  },
  {
    id: "demo-user-2",
    name: "Ahmed Alyazouri",
    email: "admin@teamoria.demo",
    role: "company_owner",
    status: "active",
    company: demoCompanies[0],
    company_id: demoCompanies[0].id,
    last_login_at: "2026-06-29T18:10:00Z"
  },
  {
    id: "demo-user-3",
    name: "Aseel Harazeen",
    email: "manager@teamoria.demo",
    role: "company_manager",
    status: "active",
    company: demoCompanies[1],
    company_id: demoCompanies[1].id,
    last_login_at: "2026-06-28T12:35:00Z"
  },
  {
    id: "demo-user-4",
    name: "Sarah Johnson",
    email: "employee@teamoria.demo",
    role: "company_member",
    status: "pending",
    company: demoCompanies[0],
    company_id: demoCompanies[0].id,
    last_login_at: null
  }
];

function demoPagination(items, page = 1) {
  return {
    current_page: Number(page || 1),
    last_page: 1,
    per_page: items.length,
    total: items.length,
    has_more: false
  };
}

export function getAdminDashboard() {
  return apiRequest("/admin/dashboard", { auth: true });
}

export function listUsers({ page, archived } = {}) {
  if (isDemoMode()) {
    const users = archived ? [] : demoUsers;
    return Promise.resolve({ success: true, data: { users, pagination: demoPagination(users, page) } });
  }

  return apiRequest("/admin/users", { auth: true, query: { page, archived: archived ? "1" : undefined } });
}

export function getUser(id) {
  return apiRequest(`/admin/users/${id}`, { auth: true });
}

export function createUser(body) {
  if (isDemoMode()) {
    return Promise.resolve({ success: true, data: { user: { id: `demo-user-${Date.now()}`, ...body } } });
  }

  return apiRequest("/admin/users", { method: "POST", auth: true, body });
}

export function updateUser(id, body) {
  if (isDemoMode()) {
    return Promise.resolve({ success: true, data: { user: { id, ...body } } });
  }

  return apiRequest(`/admin/users/${id}`, { method: "PUT", auth: true, body });
}

export function deleteUser(id) {
  if (isDemoMode()) {
    return Promise.resolve({ success: true, data: { id } });
  }

  return apiRequest(`/admin/users/${id}`, { method: "DELETE", auth: true });
}

export function restoreUser(id) {
  if (isDemoMode()) {
    return Promise.resolve({ success: true, data: { id } });
  }

  return apiRequest(`/admin/users/${id}/restore`, { method: "PATCH", auth: true });
}

export function forceDeleteUser(id) {
  if (isDemoMode()) {
    return Promise.resolve({ success: true, data: { id } });
  }

  return apiRequest(`/admin/users/${id}/force-delete`, { method: "DELETE", auth: true });
}

export function listCompanies({ page, archived } = {}) {
  if (isDemoMode()) {
    const companies = archived ? [] : demoCompanies;
    return Promise.resolve({ success: true, data: { companies, pagination: demoPagination(companies, page) } });
  }

  return apiRequest("/admin/companies", { auth: true, query: { page, archived: archived ? "1" : undefined } });
}

export function getCompany(id) {
  return apiRequest(`/admin/companies/${id}`, { auth: true });
}

export function createCompany(body) {
  if (isDemoMode()) {
    return Promise.resolve({
      success: true,
      data: { company: { id: `demo-company-${Date.now()}`, ...normalizeCompanyBody(body) } }
    });
  }

  return apiRequest("/admin/companies", {
    method: "POST",
    auth: true,
    body: normalizeCompanyBody(body)
  });
}

export function updateCompany(id, body) {
  if (isDemoMode()) {
    return Promise.resolve({
      success: true,
      data: { company: { id, ...normalizeCompanyBody(body, { partial: true }) } }
    });
  }

  return apiRequest(`/admin/companies/${id}`, {
    method: "PUT",
    auth: true,
    body: normalizeCompanyBody(body, { partial: true })
  });
}

export function deleteCompany(id) {
  if (isDemoMode()) {
    return Promise.resolve({ success: true, data: { id } });
  }

  return apiRequest(`/admin/companies/${id}`, { method: "DELETE", auth: true });
}

export function restoreCompany(id) {
  if (isDemoMode()) {
    return Promise.resolve({ success: true, data: { id } });
  }

  return apiRequest(`/admin/companies/${id}/restore`, { method: "PATCH", auth: true });
}

export function forceDeleteCompany(id) {
  if (isDemoMode()) {
    return Promise.resolve({ success: true, data: { id } });
  }

  return apiRequest(`/admin/companies/${id}/force-delete`, { method: "DELETE", auth: true });
}
