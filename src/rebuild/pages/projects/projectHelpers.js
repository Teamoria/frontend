import { statusKey } from "../../appData.js";

export function projectStatusOptions() {
  return ["active", "pending", "paused", "completed", "cancelled"];
}

export function projectStatusKey(value = "") {
  const normalized = String(value).toLowerCase().replace(/[\s-]+/g, "_");
  return projectStatusOptions().includes(normalized) ? normalized : statusKey(value);
}

export function getProjectMemberIds(project) {
  return normalizeProjectMembers(project).map((member) => member.id).filter(Boolean);
}

export function normalizeProjectMembers(project) {
  const members = project?.members || project?.users || [];
  return (Array.isArray(members) ? members : []).map((member) => {
    const value = member.user || member;
    return {
      id: String(value.id || value.user_id || ""),
      name: value.name || value.full_name || value.email || "Member",
      email: value.email || "",
      role: value.role || member.role || member.pivot?.role || ""
    };
  });
}

export function normalizeStaffOption(member) {
  const value = member.user || member;
  return {
    id: String(value.id || ""),
    name: value.name || value.full_name || value.email || "Member",
    email: value.email || "",
    role: value.role || member.role || ""
  };
}

export function getDefaultProjectDates() {
  const start = new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return {
    start_date: toDateInputValue(start),
    end_date: toDateInputValue(end)
  };
}

export function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}
