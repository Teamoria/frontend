import { addInternalHeaders, API_KEY, buildAiUrl, buildApiUrl, buildOriginUrl } from "./config.js";
import { getAccessToken, clearAccessToken } from "./session.js";
import { ApiError, assertApiKeyConfigured, getApiErrorMessage, getValidationErrors } from "./errors.js";

function appendQueryParams(url, query) {
  if (!query) return;

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

function addSharedHeaders(headers, { auth = false, includeApiKey = true, includeInternalHeaders = false } = {}) {
  if (includeApiKey && API_KEY) {
    headers["x-api-key"] = API_KEY;
  }

  if (includeInternalHeaders) {
    addInternalHeaders(headers);
  }

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
}

export async function apiRequest(path, {
  method = "GET",
  body,
  auth = false,
  query,
  redirectOnUnauthorized = true,
  includeApiKey = true,
  includeInternalHeaders = false
} = {}) {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const url = new URL(buildApiUrl(path));
  const headers = { Accept: "application/json" };

  assertApiKeyConfigured(url.pathname);
  appendQueryParams(url, query);

  if (body && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  addSharedHeaders(headers, { auth, includeApiKey, includeInternalHeaders });

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
      `Unable to reach the Teamoria API at ${url.origin}. Check that Laravel is online and CORS allows this frontend domain.`,
      { status: 0, payload: { original_error: error.message } }
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    const message = getApiErrorMessage(payload, `API request failed with status ${response.status}.`);
    const validationErrors = getValidationErrors(payload);

    if (response.status === 401 && redirectOnUnauthorized) {
      clearAccessToken();
      window.location.hash = "/signin";
    }

    throw new ApiError(message, { status: response.status, payload, validationErrors });
  }

  return payload;
}

export async function originRequest(path, {
  method = "GET",
  body,
  auth = false,
  query,
  includeApiKey = false
} = {}) {
  const url = new URL(buildOriginUrl(path));
  const headers = { Accept: "application/json" };

  appendQueryParams(url, query);

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  addSharedHeaders(headers, { auth, includeApiKey });

  const response = await fetch(url.toString(), {
    method,
    headers,
    cache: "no-store",
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    throw new ApiError(getApiErrorMessage(payload, `Request failed with status ${response.status}.`), {
      status: response.status,
      payload
    });
  }

  return payload;
}

export async function aiServiceRequest(path, { method = "GET", body, query } = {}) {
  const url = new URL(buildAiUrl(path));
  const headers = { Accept: "application/json" };

  appendQueryParams(url, query);
  if (body) headers["Content-Type"] = "application/json";
  addInternalHeaders(headers);

  const response = await fetch(url.toString(), {
    method,
    headers,
    cache: "no-store",
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.status === "error" || payload?.success === false) {
    throw new ApiError(getApiErrorMessage(payload, `AI service request failed with status ${response.status}.`), {
      status: response.status,
      payload
    });
  }

  return payload;
}

export async function blobRequest(path, { auth = true } = {}) {
  const url = buildApiUrl(path);
  const headers = { Accept: "*/*" };

  assertApiKeyConfigured(new URL(url).pathname);
  addSharedHeaders(headers, { auth });

  const response = await fetch(url, { method: "GET", headers, cache: "no-store" });
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    const payload = contentType.includes("application/json") ? await response.json().catch(() => null) : null;
    throw new ApiError(getApiErrorMessage(payload, "Unable to download file."), { status: response.status, payload });
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

export function uploadRequestWithProgress(path, {
  method = "POST",
  body,
  auth = true,
  onUploadProgress
} = {}) {
  const url = buildApiUrl(path);
  const headers = { Accept: "application/json" };

  assertApiKeyConfigured(new URL(url).pathname);
  addSharedHeaders(headers, { auth, includeInternalHeaders: true });

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open(method, url, true);
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
        reject(new ApiError(getApiErrorMessage(payload, `Upload request failed with status ${request.status}.`), {
          status: request.status,
          payload
        }));
        return;
      }

      resolve(payload);
    };

    request.onerror = () => {
      reject(new ApiError("Unable to reach the Teamoria upload API.", {
        status: 0,
        payload: { original_error: "XMLHttpRequest network error" }
      }));
    };

    request.send(body || null);
  });
}
