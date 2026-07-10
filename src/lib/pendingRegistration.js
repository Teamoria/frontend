export const PENDING_SIGNUP_KEY = "teamoria_pending_signup";

let pendingPassword = "";

export function setPendingSignup({ email, companyName, password, type = "register" }) {
  pendingPassword = password || "";
  sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify({
    email,
    companyName,
    type
  }));
}

export function getPendingSignup() {
  const hashQuery = window.location.hash.split("?")[1] || "";
  const params = new URLSearchParams(hashQuery);
  const email = params.get("email");
  const type = params.get("type");

  if (email) {
    return {
      email,
      type: type || "register",
      password: pendingPassword
    };
  }

  try {
    const stored = JSON.parse(sessionStorage.getItem(PENDING_SIGNUP_KEY) || "null");
    return stored ? { ...stored, password: pendingPassword } : null;
  } catch {
    return null;
  }
}

export function clearPendingSignup({ keepCompany = false } = {}) {
  pendingPassword = "";

  if (!keepCompany) {
    sessionStorage.removeItem(PENDING_SIGNUP_KEY);
    return;
  }

  const pending = getPendingSignup();
  if (pending?.companyName || pending?.email) {
    sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify({
      email: pending.email || "",
      companyName: pending.companyName || "",
      type: pending.type || "register"
    }));
  }
}

export function getPendingCompanyName() {
  return getPendingSignup()?.companyName || "";
}
