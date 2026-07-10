import { apiRequest, originRequest } from "../http.js";
import { isMissingCompanyError } from "../errors.js";
import { clearAccessToken, getStoredUser, setAccessToken, setStoredUser } from "../session.js";
import { getPayloadData, cleanObject } from "../normalizers.js";
import { normalizeRole } from "../../lib/authRoles.js";

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
  const data = getPayloadData(payload);
  const user = data?.user || payload?.user || data;

  if (user?.token && Object.keys(user).length === 1) {
    return null;
  }

  return user || null;
}

function getPreferredProfilePaths() {
  const storedRole = normalizeRole(getStoredUser()?.role);

  if (storedRole === "admin") {
    return ["/admin/profile", "/company/profile"];
  }

  if (storedRole) {
    return ["/company/profile", "/admin/profile"];
  }

  return ["/admin/profile", "/company/profile"];
}

async function requestCurrentUserWithFallback() {
  const [firstPath, secondPath] = getPreferredProfilePaths();
  let firstError = null;

  try {
    return await apiRequest(firstPath, { auth: true, redirectOnUnauthorized: false });
  } catch (error) {
    firstError = error;
    if (![401, 403, 404].includes(error.status)) {
      throw error;
    }
  }

  try {
    return await apiRequest(secondPath, { auth: true, redirectOnUnauthorized: false });
  } catch (secondError) {
    if (isMissingCompanyError(secondError)) {
      throw secondError;
    }

    throw secondError.status ? secondError : firstError;
  }
}

function createMissingCompanyUser(email) {
  const storedUser = getStoredUser();
  return {
    ...(storedUser || {}),
    email: storedUser?.email || email || "",
    role: storedUser?.role || "company_owner",
    status: storedUser?.status || "active",
    requires_company: true
  };
}

export async function loginWithEmail({ email, password, fetchProfile = true }) {
  const payload = await apiRequest("/auth/login", {
    method: "POST",
    body: { email, password }
  });

  const token = extractToken(payload);
  setAccessToken(token);

  if (!fetchProfile) {
    const user = getProfileFromPayload(payload) || createMissingCompanyUser(email);
    setStoredUser(user);
    return { token, user, payload };
  }

  try {
    const profilePayload = await getCurrentUser();
    const user = getProfileFromPayload(profilePayload);
    setStoredUser(user);
    return { token, user, payload };
  } catch (error) {
    if (isMissingCompanyError(error)) {
      const user = createMissingCompanyUser(email);
      setStoredUser(user);
      return { token, user, payload };
    }

    clearAccessToken();
    throw error;
  }
}

export async function loginWithGoogle(providerToken) {
  const payload = await apiRequest("/auth/google", {
    method: "POST",
    body: { provider_token: providerToken }
  });

  const token = extractToken(payload);
  setAccessToken(token);

  try {
    const profilePayload = await getCurrentUser();
    const user = getProfileFromPayload(profilePayload) || getProfileFromPayload(payload);
    setStoredUser(user);
    return { token, user, payload };
  } catch (error) {
    if (isMissingCompanyError(error)) {
      const user = createMissingCompanyUser(getProfileFromPayload(payload)?.email);
      setStoredUser(user);
      return { token, user, payload };
    }

    clearAccessToken();
    throw error;
  }
}

export function getGoogleRedirectUrl() {
  return apiRequest("/auth/google/redirect");
}

export function registerWithEmail({ name, email, password, password_confirmation }) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: {
      name,
      email,
      password,
      password_confirmation: password_confirmation || password
    }
  });
}

export function sendOtp({ email, type = "register" }) {
  return apiRequest("/otp/send", {
    method: "POST",
    body: { email, type }
  });
}

export function verifyOtp({ email, code, type = "register", newPassword }) {
  return apiRequest("/otp/verify", {
    method: "POST",
    body: cleanObject({
      email,
      code,
      type,
      new_password: newPassword
    })
  });
}

export function getCurrentUser() {
  return requestCurrentUserWithFallback();
}

export async function logoutUser() {
  try {
    await apiRequest("/auth/logout", { method: "POST", auth: true });
  } finally {
    clearAccessToken();
  }
}

export function forgotPasswordSendOtp({ email }) {
  return sendOtp({ email, type: "forgot-password" });
}

export function forgotPasswordVerify({ email, code, newPassword }) {
  return verifyOtp({ email, code, type: "forgot-password", newPassword });
}

export function resetPassword({ old_password, new_password, new_password_confirmation }) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    auth: true,
    body: { old_password, new_password, new_password_confirmation }
  });
}

export function updateProfile(body) {
  const storedRole = normalizeRole(getStoredUser()?.role);
  const path = storedRole === "admin" ? "/admin/profile" : "/company/profile";

  return apiRequest(path, {
    method: "PATCH",
    auth: true,
    body: cleanObject({
      name: body.name,
      email: body.email,
      phone: body.phone,
      timezone: body.timezone,
      password: body.password,
      password_confirmation: body.password_confirmation
    })
  });
}

export function getApiHealth() {
  return originRequest("/api/health", { includeApiKey: false });
}
