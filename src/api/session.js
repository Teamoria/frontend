const TOKEN_KEY = "teamoria_access_token";
const USER_KEY = "teamoria_current_user";
const SESSION_CHANGED_EVENT = "teamoria:session-changed";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token) {
  if (token) {
    const previousToken = localStorage.getItem(TOKEN_KEY);
    localStorage.setItem(TOKEN_KEY, token);
    if (previousToken !== token) {
      emitSessionChanged();
    }
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
  const hadSession = Boolean(localStorage.getItem(TOKEN_KEY) || localStorage.getItem(USER_KEY));
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  if (hadSession) {
    emitSessionChanged();
  }
}

export function subscribeToSessionChanges(listener) {
  const handleSessionChanged = () => listener();
  const handleStorage = (event) => {
    if (event.key === TOKEN_KEY || event.key === USER_KEY) {
      listener();
    }
  };

  window.addEventListener(SESSION_CHANGED_EVENT, handleSessionChanged);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(SESSION_CHANGED_EVENT, handleSessionChanged);
    window.removeEventListener("storage", handleStorage);
  };
}

function emitSessionChanged() {
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}
