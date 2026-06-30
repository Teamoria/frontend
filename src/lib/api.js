const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_ORIGIN ||
  "http://localhost:8000";
const API_VERSION = import.meta.env.VITE_API_VERSION || "v1";
const TOKEN_KEY = "teamoria_access_token";

function buildUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const cleanBaseUrl = API_BASE_URL.replace(/\/$/, "");

  if (cleanBaseUrl.endsWith(`/api/${API_VERSION}`)) {
    return `${cleanBaseUrl}${cleanPath}`;
  }

  return `${cleanBaseUrl}/api/${API_VERSION}${cleanPath}`;
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
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
  return payload?.token || payload?.data?.token || payload?.access_token || payload?.data?.access_token || "";
}

function getProfileFromPayload(payload) {
  return payload?.data?.user || payload?.data || payload?.user || payload || null;
}

export async function apiRequest(path, { method = "GET", body, auth = false, query } = {}) {
  const headers = {
    Accept: "application/json"
  };

  if (body) {
    headers["Content-Type"] = "application/json";
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
    body: body ? JSON.stringify(body) : undefined
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
      clearAccessToken();
      window.location.hash = "/signin";
      throw new ApiError(message || "Session expired. Please sign in again.", { status: response.status, payload });
    }

    if (response.status === 403) {
      throw new ApiError(message || "You are not authorized", { status: response.status, payload });
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
  try {
    const profilePayload = await getCurrentUser();
    return { token, user: getProfileFromPayload(profilePayload), payload };
  } catch (error) {
    clearAccessToken();
    throw error;
  }
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
  try {
    const profilePayload = await getCurrentUser();
    return { token, user: getProfileFromPayload(profilePayload), payload };
  } catch (error) {
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
      confirm_password: password
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
  return apiRequest("/profile", { auth: true });
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

  return apiRequest("/profile", {
    method: "PATCH",
    auth: true,
    body: cleanBody
  });
}

export function listUsers({ page, archived } = {}) {
  return apiRequest("/users", { auth: true, query: { page, archived: archived ? "true" : undefined } });
}

export function createUser(body) {
  return apiRequest("/users", { method: "POST", auth: true, body });
}

export function updateUser(id, body) {
  return apiRequest(`/users/${id}`, { method: "PUT", auth: true, body });
}

export function deleteUser(id) {
  return apiRequest(`/users/${id}`, { method: "DELETE", auth: true });
}

export function restoreUser(id) {
  return apiRequest(`/users/${id}/restore`, { method: "PATCH", auth: true });
}

export function forceDeleteUser(id) {
  return apiRequest(`/users/${id}/force-delete`, { method: "DELETE", auth: true });
}

export function listCompanies({ page, archived } = {}) {
  return apiRequest("/companies", { auth: true, query: { page, archived: archived ? "true" : undefined } });
}

export function createCompany(body) {
  return apiRequest("/companies", { method: "POST", auth: true, body });
}

export function updateCompany(id, body) {
  return apiRequest(`/companies/${id}`, { method: "PUT", auth: true, body });
}

export function deleteCompany(id) {
  return apiRequest(`/companies/${id}`, { method: "DELETE", auth: true });
}

export function restoreCompany(id) {
  return apiRequest(`/companies/${id}/restore`, { method: "PATCH", auth: true });
}

export function forceDeleteCompany(id) {
  return apiRequest(`/companies/${id}/force-delete`, { method: "DELETE", auth: true });
}

export function listStaff({ page, archived, roles, statuses } = {}) {
  return apiRequest("/staff", {
    auth: true,
    query: {
      page,
      archived: archived ? "true" : undefined,
      "roles[]": roles,
      "statuses[]": statuses
    }
  });
}

export function getStaffMember(id) {
  return apiRequest(`/staff/${id}`, { auth: true });
}

export function createStaffMember(body) {
  return apiRequest("/staff", { method: "POST", auth: true, body: normalizeStaffBody(body) });
}

export function updateStaffMember(id, body) {
  return apiRequest(`/staff/${id}`, { method: "PUT", auth: true, body: normalizeStaffBody(body, { partial: true }) });
}

export function deleteStaffMember(id) {
  return apiRequest(`/staff/${id}`, { method: "DELETE", auth: true });
}

export function restoreStaffMember(id) {
  return apiRequest(`/staff/${id}/restore`, { method: "PATCH", auth: true });
}

export function forceDeleteStaffMember(id) {
  return apiRequest(`/staff/${id}/force-delete`, { method: "DELETE", auth: true });
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
