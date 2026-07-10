export function normalizeRole(role) {
  const cleanRole = String(role || "").toLowerCase().replace(/[\s-]+/g, "_");

  if (cleanRole === "owner" || cleanRole === "company_admin") return "company_owner";
  if (cleanRole === "manager") return "company_manager";
  if (cleanRole === "member") return "company_member";

  return cleanRole;
}

export function getPostLoginPath(user) {
  if (user?.requires_company) {
    return "/company/register";
  }

  return normalizeRole(user?.role) === "admin" ? "/super-admin" : "/dashboard";
}
