export * from "../api/index.js";

import { getRuntimeApiBaseUrl } from "../api/config.js";

export function getConfiguredApiBaseUrl() {
  return getRuntimeApiBaseUrl().replace(/\/$/, "");
}

export function getConfiguredUploadApiBaseUrl() {
  return getConfiguredApiBaseUrl();
}
