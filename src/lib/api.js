import { isDemoMode } from "./demoMode.js";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_ORIGIN ||
  "http://localhost:8000";
const AI_API_BASE_URL =
  import.meta.env.VITE_AI_API_BASE_URL ||
  import.meta.env.VITE_AI_SERVICE_URL ||
  "http://127.0.0.1:8001";
const API_VERSION = import.meta.env.VITE_API_VERSION || "v1";
const API_KEY = import.meta.env.VITE_API_KEY || "";
const INTERNAL_API_KEY = import.meta.env.VITE_INTERNAL_API_KEY || import.meta.env.VITE_AI_INTERNAL_API_KEY || "";
const INTERNAL_USER_ID = import.meta.env.VITE_INTERNAL_USER_ID || "";
const INTERNAL_USER_ROLE = import.meta.env.VITE_INTERNAL_USER_ROLE || "";
const INTERNAL_COMPANY_ID = import.meta.env.VITE_INTERNAL_COMPANY_ID || "";
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

function buildUploadUrl(path) {
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

function buildAiUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const cleanBaseUrl = AI_API_BASE_URL.replace(/\/$/, "");

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
      const originOverride = import.meta.env.VITE_API_ORIGIN;
      if (originOverride) {
        const originUrl = new URL(originOverride, window.location.origin);
        const originIsLocal = ["localhost", "127.0.0.1", "::1"].includes(originUrl.hostname);
        if (!originIsLocal) {
          return originOverride;
        }
      }

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

function assertApiKeyConfigured(pathname) {
  if (!pathname.includes(`/api/${API_VERSION}/`) || API_KEY) {
    return;
  }

  throw new ApiError(
    `Missing VITE_API_KEY. The Teamoria API requires x-api-key for ${pathname}. Add VITE_API_KEY to the frontend environment and rebuild/redeploy.`,
    { status: 0, payload: { error_code: "MISSING_API_KEY" } }
  );
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
  const url = new URL(buildUrl(path));

  assertApiKeyConfigured(url.pathname);

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

  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      cache: "no-store",
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined
    });
  } catch (error) {
    throw new ApiError(
      `Unable to reach the Teamoria API at ${url.origin}. Check that the API is online, CORS allows this frontend domain, and VITE_API_BASE_URL is configured correctly.`,
      { status: 0, payload: { original_error: error.message } }
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    let message = payload?.message || payload?.detail || "Something went wrong. Please try again.";

    if (Array.isArray(payload?.detail)) {
      message = payload.detail
        .map((item) => item.msg || item.message || JSON.stringify(item))
        .join("\n");
    }

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

export async function loginWithEmail({ email, password, fetchProfile = true }) {
  const payload = await apiRequest("/auth/login", {
    method: "POST",
    body: { email, password }
  });

  const token = extractToken(payload);
  setAccessToken(token);
  const userFromLogin = getProfileFromPayload(payload);
  setStoredUser(userFromLogin);

  if (!fetchProfile) {
    return { token, user: userFromLogin, payload };
  }

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

export function getConfiguredApiBaseUrl() {
  return getRuntimeApiBaseUrl().replace(/\/$/, "");
}

export function getConfiguredUploadApiBaseUrl() {
  return buildUploadUrl("").replace(/\/$/, "");
}

export function getInternalCompanyId() {
  return INTERNAL_COMPANY_ID;
}

export function getInternalUserId() {
  return INTERNAL_USER_ID;
}

export function getInternalUserRole() {
  return INTERNAL_USER_ROLE;
}

async function aiServiceRequest(path, { method = "GET", body, query } = {}) {
  const headers = {
    Accept: "application/json"
  };
  const url = new URL(buildAiUrl(path));

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  addTemporaryInternalHeaders(headers);

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

  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      cache: "no-store",
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (error) {
    throw new ApiError(
      `Unable to reach the Teamoria AI service at ${url.origin}. Check that ai-service is online, CORS allows this frontend domain, and VITE_AI_API_BASE_URL is configured correctly.`,
      { status: 0, payload: { original_error: error.message } }
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.status === "error" || payload?.success === false) {
    const message = getApiErrorMessage(payload, `AI service request failed with status ${response.status}.`);
    throw new ApiError(message, { status: response.status, payload });
  }

  return payload;
}

async function uploadApiRequest(path, { method = "GET", body, auth = false, query } = {}) {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headers = { Accept: "application/json" };
  const url = new URL(buildUploadUrl(path));

  assertApiKeyConfigured(url.pathname);

  if (body && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (API_KEY) {
    headers["x-api-key"] = API_KEY;
  }

  addTemporaryInternalHeaders(headers);

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

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

  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      cache: "no-store",
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined
    });
  } catch (error) {
    throw new ApiError(
      `Unable to reach the Teamoria upload API at ${url.origin}. Check that the Laravel API is online, CORS allows this frontend domain, and VITE_API_BASE_URL is configured correctly.`,
      { status: 0, payload: { original_error: error.message } }
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    const message = getApiErrorMessage(payload, `Upload request failed with status ${response.status}.`);

    throw new ApiError(message, { status: response.status, payload });
  }

  return payload;
}

function uploadApiRequestWithProgress(path, { method = "POST", body, auth = false, onUploadProgress } = {}) {
  const headers = { Accept: "application/json" };
  const url = new URL(buildUploadUrl(path));

  assertApiKeyConfigured(url.pathname);

  if (API_KEY) {
    headers["x-api-key"] = API_KEY;
  }

  addTemporaryInternalHeaders(headers);

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open(method, url.toString(), true);
    Object.entries(headers).forEach(([key, value]) => request.setRequestHeader(key, value));

    request.upload.onprogress = (event) => {
      if (typeof onUploadProgress !== "function") return;
      if (event.lengthComputable && event.total > 0) {
        onUploadProgress({
          loaded: event.loaded,
          total: event.total,
          percent: Math.round((event.loaded / event.total) * 100)
        });
      } else {
        onUploadProgress({ loaded: event.loaded, total: null, percent: null });
      }
    };

    request.onload = () => {
      let payload = null;
      try {
        payload = request.responseText ? JSON.parse(request.responseText) : null;
      } catch {
        payload = null;
      }

      if (request.status < 200 || request.status >= 300 || payload?.success === false) {
        const message = getApiErrorMessage(payload, `Upload request failed with status ${request.status}.`);
        reject(new ApiError(message, { status: request.status, payload }));
        return;
      }

      resolve(payload);
    };

    request.onerror = () => {
      reject(new ApiError(
        `Unable to reach the Teamoria upload API at ${url.origin}. Check that the Laravel API is online, CORS allows this frontend domain, and VITE_API_BASE_URL is configured correctly.`,
        { status: 0, payload: { original_error: "XMLHttpRequest network error" } }
      ));
    };

    request.send(body || null);
  });
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

async function apiBlobRequest(path, { auth = true, upload = false } = {}) {
  const headers = { Accept: "*/*" };
  const url = upload ? buildUploadUrl(path) : buildUrl(path);

  assertApiKeyConfigured(new URL(url).pathname);

  if (API_KEY) {
    headers["x-api-key"] = API_KEY;
  }

  if (upload) {
    addTemporaryInternalHeaders(headers);
  }

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, { method: "GET", headers, cache: "no-store" });
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    const payload = contentType.includes("application/json") ? await response.json().catch(() => null) : null;
    throw new ApiError(payload?.message || "Unable to download file.", { status: response.status, payload });
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const disposition = response.headers.get("content-disposition") || "";
  const filenameMatch = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);

  return {
    blob: await response.blob(),
    filename: filenameMatch ? decodeURIComponent(filenameMatch[1]) : "download"
  };
}

function addTemporaryInternalHeaders(headers) {
  if (INTERNAL_API_KEY) headers["X-Internal-API-Key"] = INTERNAL_API_KEY;
  if (INTERNAL_USER_ID) headers["X-User-Id"] = INTERNAL_USER_ID;
  if (INTERNAL_USER_ROLE) headers["X-User-Role"] = INTERNAL_USER_ROLE;
  if (INTERNAL_COMPANY_ID) headers["X-Company-Id"] = INTERNAL_COMPANY_ID;
}

export function uploadFiles({
  files,
  scope = "personal",
  visibility = "private",
  company_id,
  project_id,
  task_id,
  shared_with_user_ids,
  document_type,
  job_description,
  category,
  onUploadProgress
}) {
  const formData = new FormData();
  const fileList = Array.from(files || []);

  fileList.forEach((file) => {
    formData.append("files[]", file);
  });

  formData.append("scope", scope);
  formData.append("visibility", visibility);

  if (company_id) formData.append("company_id", company_id);
  if (project_id) formData.append("project_id", project_id);
  if (task_id) formData.append("task_id", task_id);
  if (document_type && document_type !== "auto") formData.append("document_type", document_type);
  if (job_description) formData.append("job_description", job_description);
  if (category) formData.append("category", category);

  Array.from(shared_with_user_ids || []).forEach((userId) => {
    formData.append("shared_with_user_ids[]", userId);
  });

  const requestOptions = {
    method: "POST",
    auth: true,
    body: formData
  };

  if (typeof onUploadProgress === "function") {
    return uploadApiRequestWithProgress("/uploads", {
      ...requestOptions,
      onUploadProgress
    });
  }

  return uploadApiRequest("/uploads", requestOptions);
}

export function listUploads(filters = {}) {
  return uploadApiRequest("/uploads", { auth: true, query: normalizeUploadListFilters(filters) });
}

export function listUploadCollection(filters = {}) {
  return uploadApiRequest("/uploads/list", { auth: true, query: normalizeUploadListFilters(filters) });
}

export function listMyUploads(filters = {}) {
  return uploadApiRequest("/uploads/mine", { auth: true, query: normalizeUploadListFilters(filters) });
}

export function listProjectUploads(projectId, filters = {}) {
  return uploadApiRequest(`/uploads/${projectId}/list`, { auth: true, query: normalizeUploadListFilters(filters) });
}

export function getUpload(uploadId) {
  return uploadApiRequest(`/uploads/${uploadId}`, { auth: true });
}

export function getUploadStatus(uploadId) {
  return uploadApiRequest(`/uploads/${uploadId}/status`, { auth: true });
}

export function downloadUpload(uploadId) {
  return apiBlobRequest(`/uploads/${uploadId}/download`, { auth: true, upload: true });
}

export function previewUpload(uploadId) {
  return apiBlobRequest(`/uploads/${uploadId}/download`, { auth: true, upload: true });
}

export function deleteUpload(uploadId) {
  return uploadApiRequest(`/uploads/${uploadId}`, { method: "DELETE", auth: true });
}

function normalizeUploadListFilters(filters = {}) {
  return {
    per_page: 15,
    ...filters
  };
}

function normalizeNotificationFilters(filters = {}) {
  return {
    status: filters.status || undefined,
    per_page: filters.per_page || undefined
  };
}

export function updateUploadPermissions(uploadId, body) {
  return uploadApiRequest(`/uploads/${uploadId}/permissions`, { method: "POST", auth: true, body });
}

export function deleteUploadPermission(uploadId, userId) {
  return uploadApiRequest(`/uploads/${uploadId}/permissions/${userId}`, { method: "DELETE", auth: true });
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
    return Promise.resolve({ success: true, data: { company: { id: `demo-company-${Date.now()}`, ...normalizeCompanyBody(body) } } });
  }

  return apiRequest("/admin/companies", { method: "POST", auth: true, body: normalizeCompanyBody(body) });
}

export function updateCompany(id, body) {
  if (isDemoMode()) {
    return Promise.resolve({ success: true, data: { company: { id, ...normalizeCompanyBody(body, { partial: true }) } } });
  }

  return apiRequest(`/admin/companies/${id}`, { method: "PUT", auth: true, body: normalizeCompanyBody(body, { partial: true }) });
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
  return apiRequest("/company/register", { method: "POST", auth: true, body: normalizeCompanyBody(body) });
}

export function getCompanyDashboard() {
  return apiRequest("/company/dashboard", { auth: true });
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

export function listAiConversations() {
  return listChatSessions();
}

export function listChatSessions() {
  return aiServiceRequest("/chat/sessions");
}

export function listChatSessionMessages(sessionId, cursor) {
  return apiRequest(`/chat/sessions/${encodeURIComponent(sessionId)}/messages`, {
    auth: true,
    query: { cursor }
  });
}

export function sendChatMessage({
  user_id,
  company_id,
  project_id,
  message,
  message_content,
  chat_history
}) {
  const cleanBody = {
    user_id: user_id || undefined,
    company_id: company_id || undefined,
    project_id: project_id || undefined,
    message: message || message_content || "",
    chat_history: Array.isArray(chat_history) && chat_history.length ? chat_history : undefined
  };

  return aiServiceRequest("/ai/chat/generate", {
    method: "POST",
    body: cleanBody
  });
}

export function createAiConversation(body = {}) {
  return Promise.resolve({
    success: true,
    data: {
      conversation: {
        id: `local-${Date.now()}`,
        title: body.title || "New chat",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  });
}

export function getAiConversationMessages(conversationId) {
  return listChatSessionMessages(conversationId);
}

export function sendAiConversationMessage(conversationId, body = {}) {
  return sendChatMessage({
    user_id: body.user_id,
    company_id: body.company_id,
    project_id: body.project_id,
    message: body.message_content || body.question || body.message || "",
    chat_history: body.chat_history
  });
}

export function deleteAiConversation(conversationId) {
  return Promise.resolve({ success: true, data: { id: conversationId } });
}

export function updateAiConversation(conversationId, body) {
  return Promise.resolve({ success: true, data: { id: conversationId, ...body } });
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

function getTasksBasePath(role) {
  return normalizeRole(role) === "admin" ? "/admin/tasks" : "/company/tasks";
}

export function listTasks({ role, ...filters } = {}) {
  return apiRequest(getTasksBasePath(role), { auth: true, query: filters });
}

export function createTask(body, { role } = {}) {
  return apiRequest(getTasksBasePath(role), { method: "POST", auth: true, body: normalizeTaskBody(body) });
}

export function getTask(id, { role } = {}) {
  return apiRequest(`${getTasksBasePath(role)}/${id}`, { auth: true });
}

export function updateTask(id, body, { role } = {}) {
  return apiRequest(`${getTasksBasePath(role)}/${id}`, { method: "PUT", auth: true, body: normalizeTaskBody(body, { partial: true }) });
}

export function updateTaskStatus(id, status, { role } = {}) {
  return apiRequest(`${getTasksBasePath(role)}/${id}/status`, {
    method: "PATCH",
    auth: true,
    body: { status }
  });
}

export function updateTaskProgress(id, progress, { role } = {}) {
  return apiRequest(`${getTasksBasePath(role)}/${id}/progress`, {
    method: "PATCH",
    auth: true,
    body: { progress }
  });
}

export function deleteTask(id, { role } = {}) {
  return apiRequest(`${getTasksBasePath(role)}/${id}`, { method: "DELETE", auth: true });
}

export function restoreTask(id, { role } = {}) {
  return apiRequest(`${getTasksBasePath(role)}/${id}/restore`, { method: "PATCH", auth: true });
}

export function forceDeleteTask(id, { role } = {}) {
  return apiRequest(`${getTasksBasePath(role)}/${id}/force-delete`, { method: "DELETE", auth: true });
}

export function addTaskAssignees(id, body, { role } = {}) {
  return apiRequest(`${getTasksBasePath(role)}/${id}/assignees`, { method: "POST", auth: true, body });
}

export function removeTaskAssignee(id, userId, { role } = {}) {
  return apiRequest(`${getTasksBasePath(role)}/${id}/assignees/${userId}`, { method: "DELETE", auth: true });
}

export function addTaskDependencies(id, body, { role } = {}) {
  return apiRequest(`${getTasksBasePath(role)}/${id}/dependencies`, { method: "POST", auth: true, body });
}

export function removeTaskDependency(id, dependencyId, { role } = {}) {
  return apiRequest(`${getTasksBasePath(role)}/${id}/dependencies/${dependencyId}`, { method: "DELETE", auth: true });
}

export function addTaskNote(id, body, { role } = {}) {
  return apiRequest(`${getTasksBasePath(role)}/${id}/notes`, { method: "POST", auth: true, body });
}

export function deleteTaskNote(id, noteId, { role } = {}) {
  return apiRequest(`${getTasksBasePath(role)}/${id}/notes/${noteId}`, { method: "DELETE", auth: true });
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

function normalizeCompanyBody(body, { partial = false } = {}) {
  const allowedFields = ["name", "industry", "website", "address", "logo_path", "status"];
  const cleanBody = {};

  allowedFields.forEach((field) => {
    const value = body?.[field];
    if (value !== undefined && value !== "") {
      cleanBody[field] = value;
    }
  });

  if (!partial) {
    cleanBody.status = cleanBody.status || "active";
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

function normalizeTaskBody(body, { partial = false } = {}) {
  const allowedFields = [
    "project_id",
    "title",
    "description",
    "status",
    "priority",
    "due_date",
    "assignee_ids",
    "dependency_ids"
  ];
  const cleanBody = {};

  allowedFields.forEach((field) => {
    const value = body?.[field];
    if (Array.isArray(value)) {
      cleanBody[field] = value.filter(Boolean);
    } else if (value !== undefined && value !== "") {
      cleanBody[field] = value;
    }
  });

  if (!partial) {
    cleanBody.status = cleanBody.status || "todo";
    cleanBody.priority = cleanBody.priority || "medium";
  }

  return cleanBody;
}

function getApiErrorMessage(payload, fallback = "Something went wrong. Please try again.") {
  if (Array.isArray(payload?.detail)) {
    return payload.detail.map((item) => item.msg || item.message || JSON.stringify(item)).join("\n");
  }

  const validationErrors = payload?.errors || payload?.data;
  if (validationErrors && typeof validationErrors === "object" && !Array.isArray(validationErrors)) {
    const messages = Object.entries(validationErrors).flatMap(([field, value]) => {
      const values = Array.isArray(value) ? value : [value];
      return values.map((item) => `${field}: ${item}`);
    });
    if (messages.length) return messages.join("\n");
  }

  return payload?.message || payload?.detail || fallback;
}
