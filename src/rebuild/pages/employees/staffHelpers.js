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
  const roles = {
    admin: { ar: "Ù…Ø¯ÙŠØ± Ø§Ù„Ù…Ù†ØµØ©", en: "Platform admin" },
    company_owner: { ar: "Ù…Ø§Ù„Ùƒ Ø§Ù„Ø´Ø±ÙƒØ©", en: "Company owner" },
    company_manager: { ar: "Ù…Ø¯ÙŠØ± Ø§Ù„Ø´Ø±ÙƒØ©", en: "Company manager" },
    company_member: { ar: "Ø¹Ø¶Ùˆ Ø§Ù„ÙØ±ÙŠÙ‚", en: "Team member" }
  };
  return roles[role]?.[language] || role || "â€”";
}
