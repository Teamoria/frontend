import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getApiOrigin } from "../api/config.js";
import { getAccessToken } from "../api/session.js";

const realtimeConfig = createRealtimeConfig();
const realtimeListeners = new Set();
const channelReferences = new WeakMap();

let echo = null;
let echoToken = "";
let stopWatchingConnection = null;
let boundPusherConnection = null;
let pusherConnectionErrorHandler = null;
let realtimeState = Object.freeze({
  configured: realtimeConfig.configured,
  status: "disconnected",
  error: null,
  errorScope: null
});

export function isRealtimeChatConfigured() {
  return realtimeConfig.configured;
}

export function getRealtimeState() {
  return realtimeState;
}

export function subscribeToRealtimeState(listener) {
  realtimeListeners.add(listener);
  listener(realtimeState);
  return () => realtimeListeners.delete(listener);
}

export function getEcho() {
  if (!realtimeConfig.configured) {
    return null;
  }

  const token = getAccessToken() || "";
  if (!token) {
    disconnectEcho();
    return null;
  }

  if (echo && echoToken === token) {
    return echo;
  }

  if (echo) {
    disconnectEcho();
  }

  setRealtimeState({ status: "connecting", error: null, errorScope: null });

  try {
    echo = new Echo({
      broadcaster: "reverb",
      Pusher,
      key: realtimeConfig.appKey,
      wsHost: realtimeConfig.host,
      wsPort: realtimeConfig.wsPort,
      wssPort: realtimeConfig.wssPort,
      forceTLS: realtimeConfig.forceTLS,
      enabledTransports: ["ws", "wss"],
      authEndpoint: realtimeConfig.authEndpoint,
      bearerToken: token,
      auth: {
        headers: {
          Accept: "application/json"
        }
      }
    });
    echoToken = token;
    watchConnection(echo);
    setRealtimeState({ status: echo.connectionStatus() || "connecting" });
    return echo;
  } catch (error) {
    echo = null;
    echoToken = "";
    setRealtimeError(error, "connection", "connection_initialization_failed");
    return null;
  }
}

export function disconnectEcho() {
  const activeEcho = echo;
  echo = null;
  echoToken = "";
  clearConnectionWatchers();

  if (activeEcho) {
    try {
      activeEcho.leaveAllChannels();
      activeEcho.disconnect();
    } catch {
      // The transport may already be closed; local state still needs to reset.
    }
  }

  setRealtimeState({ status: "disconnected", error: null, errorScope: null });
}

export function subscribeToPrivateChannel({
  channelName,
  eventName,
  onEvent,
  onSubscribed,
  onError
}) {
  const activeEcho = getEcho();
  if (!activeEcho) {
    const error = createRealtimeError(
      realtimeConfig.configured
        ? "A valid authenticated session is required for realtime updates."
        : "Laravel Reverb is not configured in this build.",
      realtimeConfig.configured ? "authentication_required" : "not_configured"
    );
    onError?.(error);
    return () => {};
  }

  let channel;
  try {
    channel = activeEcho.private(channelName);
  } catch (error) {
    const normalizedError = setRealtimeError(error, "subscription", "subscription_initialization_failed");
    onError?.(normalizedError);
    return () => {};
  }

  retainChannel(activeEcho, channelName);

  const handleEvent = (event) => onEvent?.(event);
  const handleSubscribed = () => {
    if (realtimeState.errorScope === "subscription") {
      setRealtimeState({ error: null, errorScope: null });
    }
    onSubscribed?.();
  };
  const handleSubscriptionError = (error) => {
    const normalizedError = setRealtimeError(error, "subscription", "subscription_failed");
    onError?.(normalizedError);
  };

  channel.listen(eventName, handleEvent);
  channel.on("pusher:subscription_succeeded", handleSubscribed);
  channel.on("pusher:subscription_error", handleSubscriptionError);

  if (channel.subscription?.subscribed) {
    handleSubscribed();
  }

  let isActive = true;
  return () => {
    if (!isActive) return;
    isActive = false;
    channel.stopListening(eventName, handleEvent);
    channel.stopListening(".pusher:subscription_succeeded", handleSubscribed);
    channel.stopListening(".pusher:subscription_error", handleSubscriptionError);
    releaseChannel(activeEcho, channelName);
  };
}

function createRealtimeConfig() {
  const apiOrigin = getApiOrigin();
  const apiUrl = safeUrl(apiOrigin);
  const appKey = String(import.meta.env.VITE_REVERB_APP_KEY || "").trim();
  const host = String(import.meta.env.VITE_REVERB_HOST || apiUrl?.hostname || "").trim();
  const configuredScheme = String(import.meta.env.VITE_REVERB_SCHEME || apiUrl?.protocol.replace(":", "") || "https").toLowerCase();
  const scheme = configuredScheme === "http" ? "http" : "https";
  const explicitPort = parsePort(import.meta.env.VITE_REVERB_PORT);
  const authEndpoint = String(
    import.meta.env.VITE_REVERB_AUTH_ENDPOINT || `${apiOrigin.replace(/\/$/, "")}/broadcasting/auth`
  ).trim();

  return Object.freeze({
    appKey,
    host,
    wsPort: explicitPort || 80,
    wssPort: explicitPort || 443,
    forceTLS: scheme === "https",
    authEndpoint,
    configured: Boolean(appKey && host && authEndpoint)
  });
}

function safeUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function parsePort(value) {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 && port <= 65535 ? port : null;
}

function watchConnection(activeEcho) {
  clearConnectionWatchers();

  if (typeof activeEcho.connector?.onConnectionChange === "function") {
    stopWatchingConnection = activeEcho.connector.onConnectionChange((status) => {
      const patch = { status };
      if (status === "connected" && realtimeState.errorScope === "connection") {
        patch.error = null;
        patch.errorScope = null;
      }
      setRealtimeState(patch);
    });
  }

  boundPusherConnection = activeEcho.connector?.pusher?.connection || null;
  if (boundPusherConnection) {
    pusherConnectionErrorHandler = (error) => {
      setRealtimeError(error, "connection", "connection_failed");
    };
    boundPusherConnection.bind("error", pusherConnectionErrorHandler);
  }
}

function clearConnectionWatchers() {
  stopWatchingConnection?.();
  stopWatchingConnection = null;

  if (boundPusherConnection && pusherConnectionErrorHandler) {
    boundPusherConnection.unbind("error", pusherConnectionErrorHandler);
  }
  boundPusherConnection = null;
  pusherConnectionErrorHandler = null;
}

function retainChannel(activeEcho, channelName) {
  const references = channelReferences.get(activeEcho) || new Map();
  references.set(channelName, (references.get(channelName) || 0) + 1);
  channelReferences.set(activeEcho, references);
}

function releaseChannel(activeEcho, channelName) {
  const references = channelReferences.get(activeEcho);
  if (!references) return;

  const nextCount = Math.max(0, (references.get(channelName) || 1) - 1);
  if (nextCount > 0) {
    references.set(channelName, nextCount);
    return;
  }

  references.delete(channelName);
  activeEcho.leave(channelName);
}

function setRealtimeError(error, scope, fallbackCode) {
  const normalizedError = normalizeRealtimeError(error, fallbackCode);
  setRealtimeState({ status: scope === "connection" ? "failed" : realtimeState.status, error: normalizedError, errorScope: scope });
  return normalizedError;
}

function normalizeRealtimeError(error, fallbackCode) {
  if (error?.code && error?.message) {
    return error;
  }

  const nestedError = error?.error;
  const message =
    error?.message ||
    nestedError?.message ||
    (typeof nestedError === "string" ? nestedError : "") ||
    "The realtime connection could not be established.";

  return createRealtimeError(message, error?.type || fallbackCode, error?.status || nestedError?.status);
}

function createRealtimeError(message, code, status) {
  return Object.freeze({
    message,
    code: String(code || "realtime_error"),
    status: status || null
  });
}

function setRealtimeState(patch) {
  const nextState = Object.freeze({ ...realtimeState, ...patch, configured: realtimeConfig.configured });
  if (
    nextState.status === realtimeState.status &&
    nextState.error === realtimeState.error &&
    nextState.errorScope === realtimeState.errorScope &&
    nextState.configured === realtimeState.configured
  ) {
    return;
  }

  realtimeState = nextState;
  realtimeListeners.forEach((listener) => listener(realtimeState));
}
