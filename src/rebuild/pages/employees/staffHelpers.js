export const COMPANY_ROLE_LABELS = {
  admin: { ar: "مدير المنصة", en: "Platform admin" },
  company_owner: { ar: "مالك الشركة", en: "Company owner" },
  company_manager: { ar: "مدير الشركة", en: "Company manager" },
  company_member: { ar: "عضو الفريق", en: "Team member" }
};

export function companyRoleOptions() {
  return ["company_owner", "company_manager", "company_member"];
}

export function staffRoleOptions() {
  return ["company_manager", "company_member"];
}

export function staffRoleKey(value = "") {
  return staffRoleOptions().includes(value) ? value : "company_member";
}

export function staffStatusOptions() {
  return ["pending", "active", "suspended", "inactive"];
}

export function staffStatusKey(value = "") {
  const normalized = String(value).toLowerCase().replace(/[\s-]+/g, "_");
  return staffStatusOptions().includes(normalized) ? normalized : "active";
}

export function localizedStaffStatus(copy, status) {
  if (status === "suspended") return "Suspended";
  if (status === "inactive") return "Inactive";
  return copy[status] || status;
}

export function roleText(role, language) {
  return COMPANY_ROLE_LABELS[role]?.[language] || COMPANY_ROLE_LABELS[role]?.en || role || "-";
}
