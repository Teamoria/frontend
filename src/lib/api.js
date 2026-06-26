const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:8000";
const API_VERSION = import.meta.env.VITE_API_VERSION || "v1";
const API_KEY = import.meta.env.VITE_API_KEY || "";
const TOKEN_KEY = "teamoria_access_token";

function buildUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_ORIGIN}/api/${API_VERSION}${cleanPath}`;
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

export async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
  const headers = {
    Accept: "application/json"
  };

  if (body) {
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

  const response = await fetch(buildUrl(path), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    const message = payload?.message || "Something went wrong. Please try again.";
    throw new Error(message);
  }

  return payload;
}

export async function loginWithEmail({ email, password }) {
  const payload = await apiRequest("/auth/login", {
    method: "POST",
    body: { email, password }
  });

  setAccessToken(payload?.data?.token);
  return payload;
}

export async function loginWithGoogle(providerToken) {
  const payload = await apiRequest("/auth/google", {
    method: "POST",
    body: {
      provider_token: providerToken
    }
  });

  setAccessToken(payload?.data?.token);
  return payload;
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
  return apiRequest("/test-if-logged-in", { auth: true });
}
