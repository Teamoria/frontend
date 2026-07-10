const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_ORIGIN ||
  "http://localhost:8000";
const AI_API_BASE_URL =
  import.meta.env.VITE_AI_API_BASE_URL ||
  import.meta.env.VITE_AI_SERVICE_URL ||
  "";

export const API_VERSION = import.meta.env.VITE_API_VERSION || "v1";
export const API_KEY = import.meta.env.VITE_API_KEY || "";
export const INTERNAL_API_KEY =
  import.meta.env.VITE_INTERNAL_API_KEY ||
  import.meta.env.VITE_AI_INTERNAL_API_KEY ||
  "";
export const INTERNAL_USER_ID = import.meta.env.VITE_INTERNAL_USER_ID || "";
export const INTERNAL_USER_ROLE = import.meta.env.VITE_INTERNAL_USER_ROLE || "";
export const INTERNAL_COMPANY_ID = import.meta.env.VITE_INTERNAL_COMPANY_ID || "";

function isLocalHostname(hostname) {
  return ["localhost", "127.0.0.1", "::1"].includes(hostname);
}

function getRuntimeBaseUrl(configuredBaseUrl, { fallbackToSameOrigin = true } = {}) {
  if (typeof window === "undefined") {
    return configuredBaseUrl;
  }

  try {
    const configuredUrl = new URL(configuredBaseUrl, window.location.origin);
    const configuredIsLocal = isLocalHostname(configuredUrl.hostname);
    const pageIsLocal = isLocalHostname(window.location.hostname);

    if (configuredIsLocal && !pageIsLocal && fallbackToSameOrigin) {
      const originOverride = import.meta.env.VITE_API_ORIGIN;
      if (originOverride) {
        const originUrl = new URL(originOverride, window.location.origin);
        if (!isLocalHostname(originUrl.hostname)) {
          return originOverride;
        }
      }

      return window.location.origin;
    }
  } catch {
    return configuredBaseUrl;
  }

  return configuredBaseUrl;
}

export function getRuntimeApiBaseUrl() {
  return getRuntimeBaseUrl(API_BASE_URL).replace(/\/$/, "");
}

export function getRuntimeAiApiBaseUrl() {
  if (!AI_API_BASE_URL) {
    return getRuntimeApiBaseUrl();
  }

  return getRuntimeBaseUrl(AI_API_BASE_URL).replace(/\/$/, "");
}

export function getApiOrigin() {
  const baseUrl = getRuntimeApiBaseUrl();
  return baseUrl.replace(new RegExp(`/api/${API_VERSION}$`), "");
}

export function buildApiUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = getRuntimeApiBaseUrl();

  if (cleanPath.startsWith("/api/")) {
    return `${getApiOrigin()}${cleanPath}`;
  }

  if (baseUrl.endsWith(`/api/${API_VERSION}`)) {
    return `${baseUrl}${cleanPath}`;
  }

  return `${baseUrl}/api/${API_VERSION}${cleanPath}`;
}

export function buildOriginUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiOrigin()}${cleanPath}`;
}

export function buildAiUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = getRuntimeAiApiBaseUrl();

  if (cleanPath.startsWith("/api/")) {
    return `${baseUrl.replace(new RegExp(`/api/${API_VERSION}$`), "")}${cleanPath}`;
  }

  if (baseUrl.endsWith(`/api/${API_VERSION}`)) {
    return `${baseUrl}${cleanPath}`;
  }

  return `${baseUrl}/api/${API_VERSION}${cleanPath}`;
}

export function getPublicApiKey() {
  return API_KEY;
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

export function addInternalHeaders(headers) {
  if (INTERNAL_API_KEY) headers["X-Internal-API-Key"] = INTERNAL_API_KEY;
  if (INTERNAL_USER_ID) headers["X-User-Id"] = INTERNAL_USER_ID;
  if (INTERNAL_USER_ROLE) headers["X-User-Role"] = INTERNAL_USER_ROLE;
  if (INTERNAL_COMPANY_ID) headers["X-Company-Id"] = INTERNAL_COMPANY_ID;
}
