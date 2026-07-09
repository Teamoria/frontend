import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getAccessToken, getPublicApiKey } from "./api.js";

const REVERB_APP_KEY = import.meta.env.VITE_REVERB_APP_KEY || "";
const REVERB_HOST = import.meta.env.VITE_REVERB_HOST || "api.teamoria.online";
const REVERB_PORT = Number(import.meta.env.VITE_REVERB_PORT || 443);
const REVERB_SCHEME = import.meta.env.VITE_REVERB_SCHEME || "https";
const REVERB_AUTH_ENDPOINT =
  import.meta.env.VITE_REVERB_AUTH_ENDPOINT || `https://${REVERB_HOST}/broadcasting/auth`;

let echo = null;

export function isRealtimeChatConfigured() {
  return Boolean(REVERB_APP_KEY);
}

export function getEcho() {
  if (!isRealtimeChatConfigured()) {
    return null;
  }

  if (echo) {
    return echo;
  }

  window.Pusher = Pusher;

  const apiKey = getPublicApiKey();
  const token = getAccessToken();

  echo = new Echo({
    broadcaster: "reverb",
    key: REVERB_APP_KEY,
    wsHost: REVERB_HOST,
    wsPort: REVERB_PORT,
    wssPort: REVERB_PORT,
    forceTLS: REVERB_SCHEME === "https",
    enabledTransports: ["ws", "wss"],
    authEndpoint: REVERB_AUTH_ENDPOINT,
    auth: {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(apiKey ? { "x-api-key": apiKey } : {}),
        Accept: "application/json",
      },
    },
  });

  return echo;
}

export function disconnectEcho() {
  if (!echo) {
    return;
  }

  echo.disconnect();
  echo = null;
}
