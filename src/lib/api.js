import { isDemoMode } from "./demoMode.js";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_ORIGIN ||
  "http://localhost:8000";
const API_VERSION = import.meta.env.VITE_API_VERSION || "v1";
const API_KEY = import.meta.env.VITE_API_KEY || "";
const TOKEN_KEY = "teamoria_access_token";
const USER_KEY = "teamoria_current_user";

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

function buildUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const cleanBaseUrl = getRuntimeApiBaseUrl().replace(/\/$/, "");

  if (cleanPath.startsWith("/api/")) {
    return `${cleanBaseUrl}${cleanPath}`;
  }

  if (cleanBaseUrl.endsWith(`/api/${API_VERSION}`)) {
    return `${cleanBaseUrl}${cleanPath}`;
  }

  return `${cleanBaseUrl}/api/${API_VERSION}${cleanPath}`;
}

function getRuntimeApiBaseUrl() {
  if (typeof window === "undefined") {
    return API_BASE_URL;
  }

  try {
    const configuredUrl = new URL(API_BASE_URL, window.location.origin);
    const configuredHost = configuredUrl.hostname;
    const pageHost = window.location.hostname;
    const configuredIsLocal = ["localhost", "127.0.0.1", "::1"].includes(configuredHost);
    const pageIsLocal = ["localhost", "127.0.0.1", "::1"].includes(pageHost);

    if (configuredIsLocal && !pageIsLocal) {
      return window.location.origin;
    }
  } catch {
    return API_BASE_URL;
  }

  return API_BASE_URL;
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export class ApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function normalizeData(payload) {
  return payload?.data ?? payload;
}

function extractToken(payload) {
  return (
    payload?.token ||
    payload?.data?.token ||
    payload?.access_token ||
    payload?.data?.access_token ||
    payload?.bearer_token ||
    payload?.data?.bearer_token ||
    payload?.plain_text_token ||
    payload?.data?.plain_text_token ||
    ""
  );
}

function getProfileFromPayload(payload) {
  return payload?.data?.user || payload?.data || payload?.user || payload || null;
}

function normalizeRole(role) {
  const cleanRole = String(role || "").toLowerCase().replace(/[\s-]+/g, "_");

  if (cleanRole === "owner" || cleanRole === "company_admin") return "company_owner";
  if (cleanRole === "manager") return "company_manager";
  if (cleanRole === "member") return "company_member";

  return cleanRole;
}

function getProfilePath(user = getStoredUser()) {
  return normalizeRole(user?.role) === "admin" ? "/admin/profile" : "/company/profile";
}

async function requestCurrentUserWithFallback() {
  const preferredPath = getProfilePath();
  const fallbackPath = preferredPath === "/admin/profile" ? "/company/profile" : "/admin/profile";

  try {
    return await apiRequest(preferredPath, { auth: true, redirectOnUnauthorized: false });
  } catch (error) {
    if (error.status === 401 || error.status === 403 || error.status === 404) {
      return apiRequest(fallbackPath, { auth: true, redirectOnUnauthorized: false });
    }

    throw error;
  }
}

export async function apiRequest(path, { method = "GET", body, auth = false, query, redirectOnUnauthorized = true } = {}) {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headers = {
    Accept: "application/json"
  };

  if (body && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (API_KEY) {
    headers["x-api-key"] = API_KEY;
  }

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const url = new URL(buildUrl(path));

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== undefined && item !== null && item !== "") {
            url.searchParams.append(key, item);
          }
        });
      } else if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    let message = payload?.message || "Something went wrong. Please try again.";

    // Teamoria API returns validation errors in payload.data when error_code is VALIDATION_ERROR
    // Format: { data: { field: ["error1", "error2"], ... }, error_code: "VALIDATION_ERROR" }
    const validationErrors =
      (payload?.error_code === "VALIDATION_ERROR" && payload?.data) ||
      payload?.errors;

    if (validationErrors && typeof validationErrors === "object" && !Array.isArray(validationErrors)) {
      const errorMessages = Object.values(validationErrors).flat();
      if (errorMessages.length > 0) {
        message = errorMessages.join("\n");
      }
    }

    if (response.status === 401) {
      if (redirectOnUnauthorized) {
        clearAccessToken();
        window.location.hash = "/signin";
      }
      throw new ApiError(message || "Session expired. Please sign in again.", { status: response.status, payload });
    }

    if (response.status === 403) {
      throw new ApiError(message || "You are not authorized", { status: response.status, payload });
    }

    if (response.status === 404) {
      const route = url.pathname.replace(`/api/${API_VERSION}`, "") || path;
      throw new ApiError(`API route is not available yet: ${route}`, { status: response.status, payload });
    }

    throw new ApiError(message, { status: response.status, payload });
  }

  return payload;
}

export async function loginWithEmail({ email, password }) {
  const payload = await apiRequest("/auth/login", {
    method: "POST",
    body: { email, password }
  });

  const token = extractToken(payload);
  setAccessToken(token);
  const userFromLogin = getProfileFromPayload(payload);
  setStoredUser(userFromLogin);
  try {
    const profilePayload = await getCurrentUser();
    const user = getProfileFromPayload(profilePayload);
    setStoredUser(user);
    return { token, user, payload };
  } catch (error) {
    if (error.status === 404 && userFromLogin) {
      setStoredUser(userFromLogin);
      return { token, user: userFromLogin, payload };
    }

    clearAccessToken();
    throw error;
  }
}

export function getApiHealth() {
  return apiRequest("/api/health");
}

export async function loginWithGoogle(providerToken) {
  const payload = await apiRequest("/auth/google", {
    method: "POST",
    body: {
      provider_token: providerToken
    }
  });

  const token = extractToken(payload);
  setAccessToken(token);
  const userFromLogin = getProfileFromPayload(payload);
  setStoredUser(userFromLogin);
  try {
    const profilePayload = await getCurrentUser();
    const user = getProfileFromPayload(profilePayload);
    setStoredUser(user);
    return { token, user, payload };
  } catch (error) {
    if (error.status === 404 && userFromLogin) {
      setStoredUser(userFromLogin);
      return { token, user: userFromLogin, payload };
    }

    clearAccessToken();
    throw error;
  }
}

export async function registerWithEmail({ name, email, password }) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: {
      name,
      email,
      password,
      password_confirmation: password
    }
  });
}

export async function sendOtp({ email, type = "register" }) {
  return apiRequest("/otp/send", {
    method: "POST",
    body: {
      email,
      type
    }
  });
}

export async function verifyOtp({ email, code, type = "register", newPassword }) {
  const body = {
    email,
    code,
    type
  };

  if (newPassword) {
    body.new_password = newPassword;
  }

  return apiRequest("/otp/verify", {
    method: "POST",
    body
  });
}

export async function getCurrentUser() {
  return requestCurrentUserWithFallback();
}

export async function logoutUser() {
  try {
    await apiRequest("/auth/logout", { auth: true });
  } finally {
    clearAccessToken();
  }
}

export async function forgotPasswordSendOtp({ email }) {
  return sendOtp({ email, type: "forgot-password" });
}

export async function forgotPasswordVerify({ email, code, newPassword }) {
  return verifyOtp({ email, code, type: "forgot-password", newPassword });
}

export async function resetPassword({ old_password, new_password, new_password_confirmation }) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    auth: true,
    body: { old_password, new_password, new_password_confirmation }
  });
}

export async function updateProfile(body) {
  const allowedFields = ["name", "email", "phone", "timezone", "password", "password_confirmation"];
  const cleanBody = {};

  allowedFields.forEach((field) => {
    if (body[field] !== undefined && body[field] !== "") {
      cleanBody[field] = body[field];
    }
  });

  return apiRequest(getProfilePath(), {
    method: "PATCH",
    auth: true,
    body: cleanBody
  });
}

export function uploadFiles({ files, project_id, category }) {
  const formData = new FormData();
  const fileList = Array.from(files || []);

  fileList.forEach((file) => {
    formData.append("files[]", file);
  });

  formData.append("project_id", project_id);
  formData.append("category", category);

  return apiRequest("/uploads/", {
    method: "POST",
    auth: true,
    body: formData
  });
}

export function listUploads() {
  return apiRequest("/uploads/list", { auth: true });
}

export function listProjectUploads(projectId) {
  return apiRequest(`/uploads/${projectId}/list`, { auth: true });
}

export function listUsers({ page, archived } = {}) {
  if (isDemoMode()) {
    return Promise.resolve({
      success: true,
      data: {
        users: archived ? [] : demoUsers,
        pagination: demoPagination(archived ? [] : demoUsers, page)
      }
    });
  }

  return apiRequest("/admin/users", { auth: true, query: { page, archived: archived ? "1" : undefined } });
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
    return Promise.resolve({
      success: true,
      data: {
        companies: archived ? [] : demoCompanies,
        pagination: demoPagination(archived ? [] : demoCompanies, page)
      }
    });
  }

  return apiRequest("/admin/companies", { auth: true, query: { page, archived: archived ? "1" : undefined } });
}

export function createCompany(body) {
  if (isDemoMode()) {
    return Promise.resolve({ success: true, data: { company: { id: `demo-company-${Date.now()}`, ...body } } });
  }

  return apiRequest("/admin/companies", { method: "POST", auth: true, body });
}

export function updateCompany(id, body) {
  if (isDemoMode()) {
    return Promise.resolve({ success: true, data: { company: { id, ...body } } });
  }

  return apiRequest(`/admin/companies/${id}`, { method: "PUT", auth: true, body });
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

export function registerCompany(body) {
  return apiRequest("/company/register", { method: "POST", auth: true, body });
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
  return apiRequest("/company/staff", { method: "POST", auth: true, body: normalizeStaffBody(body) });
}

export function updateStaffMember(id, body) {
  return apiRequest(`/company/staff/${id}`, { method: "PUT", auth: true, body: normalizeStaffBody(body, { partial: true }) });
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

export function listAdminProjects({ page, archived } = {}) {
  return apiRequest("/admin/projects", { auth: true, query: { page, archived: archived ? "1" : undefined } });
}

export function createAdminProject(body) {
  return apiRequest("/admin/projects", { method: "POST", auth: true, body });
}

export function updateAdminProject(id, body) {
  return apiRequest(`/admin/projects/${id}`, { method: "PUT", auth: true, body });
}

export function deleteAdminProject(id) {
  return apiRequest(`/admin/projects/${id}`, { method: "DELETE", auth: true });
}

export function restoreAdminProject(id) {
  return apiRequest(`/admin/projects/${id}/restore`, { method: "PATCH", auth: true });
}

export function forceDeleteAdminProject(id) {
  return apiRequest(`/admin/projects/${id}/force-delete`, { method: "DELETE", auth: true });
}

export function addAdminProjectMembers(id, body) {
  return apiRequest(`/admin/projects/${id}/members`, { method: "POST", auth: true, body });
}

export function removeAdminProjectMember(id, userId) {
  return apiRequest(`/admin/projects/${id}/members/${userId}`, { method: "DELETE", auth: true });
}

export function listCompanyProjects({ page, archived } = {}) {
  return apiRequest("/company/projects", { auth: true, query: { page, archived: archived ? "1" : undefined } });
}

export function createCompanyProject(body) {
  return apiRequest("/company/projects", { method: "POST", auth: true, body: normalizeCompanyProjectBody(body) });
}

export function updateCompanyProject(id, body) {
  return apiRequest(`/company/projects/${id}`, { method: "PUT", auth: true, body: normalizeCompanyProjectBody(body) });
}

export function deleteCompanyProject(id) {
  return apiRequest(`/company/projects/${id}`, { method: "DELETE", auth: true });
}

export function restoreCompanyProject(id) {
  return apiRequest(`/company/projects/${id}/restore`, { method: "PATCH", auth: true });
}

export function forceDeleteCompanyProject(id) {
  return apiRequest(`/company/projects/${id}/force-delete`, { method: "DELETE", auth: true });
}

export function addCompanyProjectMembers(id, body) {
  return apiRequest(`/company/projects/${id}/members`, { method: "POST", auth: true, body });
}

export function removeCompanyProjectMember(id, userId) {
  return apiRequest(`/company/projects/${id}/members/${userId}`, { method: "DELETE", auth: true });
}

export function getPayloadData(payload) {
  return normalizeData(payload);
}

function normalizeStaffBody(body, { partial = false } = {}) {
  const allowedFields = ["name", "email", "password", "password_confirmation", "role", "status"];
  const cleanBody = {};

  allowedFields.forEach((field) => {
    if (body[field] !== undefined && body[field] !== "") {
      cleanBody[field] = body[field];
    }
  });

  if (!partial && cleanBody.password && !cleanBody.password_confirmation) {
    cleanBody.password_confirmation = cleanBody.password;
  }

  return cleanBody;
}

function normalizeCompanyProjectBody(body) {
  const allowedFields = ["name", "description", "status", "progress", "start_date", "end_date"];
  const cleanBody = {};

  allowedFields.forEach((field) => {
    if (body[field] !== undefined && body[field] !== "") {
      cleanBody[field] = body[field];
    }
  });

  return cleanBody;
}
