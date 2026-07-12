export const PENDING_SIGNUP_KEY = "teamoria_pending_signup";

let pendingPassword = "";

function readStoredPending() {
  try {
    return JSON.parse(sessionStorage.getItem(PENDING_SIGNUP_KEY) || "null");
  } catch {
    return null;
  }
}

function storePending({ email, companyName = "", type = "register", otpSent = false }) {
  try {
    sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify({
      email,
      companyName,
      type,
      otpSent
    }));
  } catch {
    // The email and flow type also travel in the URL, so private storage is optional.
  }
}

export function setPendingSignup({ email, companyName, password, type = "register", otpSent = false }) {
  pendingPassword = password || "";
  storePending({ email, companyName, type, otpSent });
}

export function getPendingSignup() {
  const hashQuery = window.location.hash.split("?")[1] || "";
  const params = new URLSearchParams(hashQuery);
  const email = params.get("email");
  const type = params.get("type");
  const stored = readStoredPending();

  if (email) {
    const matchingStored = stored?.email?.toLowerCase() === email.toLowerCase() ? stored : null;
    return {
      ...(matchingStored || {}),
      email,
      type: type || matchingStored?.type || "register",
      password: pendingPassword
    };
  }

  return stored ? { ...stored, password: pendingPassword } : null;
}

export function markPendingOtpSent() {
  const pending = getPendingSignup();
  if (!pending?.email) return;

  storePending({
    email: pending.email,
    companyName: pending.companyName,
    type: pending.type,
    otpSent: true
  });
}

export function clearPendingSignup({ keepCompany = false } = {}) {
  pendingPassword = "";

  if (!keepCompany) {
    try {
      sessionStorage.removeItem(PENDING_SIGNUP_KEY);
    } catch {
      // There is nothing else to clear when session storage is unavailable.
    }
    return;
  }

  const pending = getPendingSignup();
  if (pending?.companyName || pending?.email) {
    storePending({
      email: pending.email || "",
      companyName: pending.companyName || "",
      type: pending.type || "register"
    });
  }
}

export function getPendingCompanyName() {
  return getPendingSignup()?.companyName || "";
}
