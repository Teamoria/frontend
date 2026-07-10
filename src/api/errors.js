import { API_KEY, API_VERSION } from "./config.js";

export class ApiError extends Error {
  constructor(message, { status = 0, payload = null, validationErrors = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
    this.validationErrors = validationErrors;
    this.errorCode = payload?.error_code || payload?.code || "";
  }
}

export function assertApiKeyConfigured(pathname) {
  if (!pathname.includes(`/api/${API_VERSION}/`) || API_KEY) {
    return;
  }

  throw new ApiError(
    `Missing VITE_API_KEY. The Teamoria API requires x-api-key for ${pathname}.`,
    { status: 0, payload: { error_code: "MISSING_API_KEY" } }
  );
}

export function getValidationErrors(payload) {
  const validationErrors =
    (payload?.error_code === "VALIDATION_ERROR" && payload?.data) ||
    payload?.errors;

  if (!validationErrors || typeof validationErrors !== "object" || Array.isArray(validationErrors)) {
    return null;
  }

  return validationErrors;
}

export function getApiErrorMessage(payload, fallback = "Something went wrong. Please try again.") {
  if (Array.isArray(payload?.detail)) {
    return payload.detail.map((item) => item.msg || item.message || JSON.stringify(item)).join("\n");
  }

  const validationErrors = getValidationErrors(payload);
  if (validationErrors) {
    const messages = Object.values(validationErrors).flat();
    if (messages.length > 0) {
      return messages.join("\n");
    }
  }

  return payload?.message || payload?.detail || fallback;
}

export function isMissingCompanyError(error) {
  const message = `${error?.message || ""} ${error?.payload?.message || ""}`.toLowerCase();

  return (
    error?.status === 403 &&
    (
      message.includes("assigned to a company") ||
      message.includes("not assigned to a company") ||
      message.includes("create company") ||
      message.includes("company profile")
    )
  );
}
