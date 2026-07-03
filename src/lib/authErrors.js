export function formatAuthErrorMessage(error, mode = "signin") {
  const code = error?.payload?.error_code || error?.payload?.code || "";
  const rawMessage = String(error?.message || "Something went wrong. Please try again.").trim();
  const message = rawMessage.replace(/\s*\([A-Z_]+\)\s*$/g, "");
  const normalized = message.toLowerCase();

  if (code === "VALIDATION_ERROR" && normalized.includes("email address is not registered")) {
    return "This email is not registered. Check the address or create a new account.";
  }

  if (code === "VALIDATION_ERROR" && normalized.includes("already")) {
    return "An account already exists for this email. Sign in or use a different address.";
  }

  if (normalized.includes("invalid") && normalized.includes("password")) {
    return "The email or password is incorrect. Check your details and try again.";
  }

  if (normalized.includes("network") || normalized.includes("failed to fetch")) {
    return "We could not reach the server. Check your connection and try again.";
  }

  if (mode === "signup" && code === "VALIDATION_ERROR") {
    return message || "Check the highlighted details and try creating the account again.";
  }

  return message;
}
