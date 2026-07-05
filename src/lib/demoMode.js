const demoUsers = {
  admin: {
    id: "demo-company-admin",
    name: "Ahmed Alyazouri",
    email: "admin@teamoria.demo",
    role: "company_owner",
    company: { name: "Teamoria Demo Company" },
    isDemo: true
  },
  owner: {
    id: "demo-company-owner",
    name: "Company Owner",
    email: "owner@teamoria.demo",
    role: "company_owner",
    company: { name: "Teamoria Demo Company" },
    isDemo: true
  },
  manager: {
    id: "demo-company-manager",
    name: "Aseel Harazeen",
    email: "manager@teamoria.demo",
    role: "company_manager",
    company: { name: "Teamoria Demo Company" },
    isDemo: true
  },
  employee: {
    id: "demo-company-member",
    name: "Sarah Johnson",
    email: "employee@teamoria.demo",
    role: "company_member",
    company: { name: "Teamoria Demo Company" },
    isDemo: true
  },
  "super-admin": {
    id: "demo-super-admin",
    name: "Super Admin",
    email: "superadmin@teamoria.demo",
    role: "admin",
    isDemo: true
  }
};

const roleAliases = {
  "company-admin": "admin",
  company_admin: "admin",
  "company-owner": "owner",
  company_owner: "owner",
  "general-manager": "manager",
  general_manager: "manager",
  "project-manager": "manager",
  project_manager: "manager",
  member: "employee",
  company_member: "employee",
  staff: "employee",
  "platform-admin": "super-admin",
  platform_admin: "super-admin",
  super_admin: "super-admin"
};
const DEMO_ROLE_KEY = "teamoria_demo_role";

function getHashPath() {
  const hash = window.location.hash.replace("#", "");
  return hash.split("?")[0] || "/";
}

function isSuperAdminPath() {
  return getHashPath().startsWith("/super-admin");
}

export function getHashSearchParams() {
  const hashQuery = window.location.hash.split("?")[1] || "";
  const pageQuery = window.location.search.replace(/^\?/, "");
  return new URLSearchParams(hashQuery || pageQuery);
}

export function getDemoRole() {
  const params = getHashSearchParams();
  const role = String(params.get("role") || "").toLowerCase();
  const demo = String(params.get("demo") || "").toLowerCase();

  if (role) {
    const nextRole = roleAliases[role] || role;
    localStorage.setItem(DEMO_ROLE_KEY, nextRole);
    return nextRole;
  }

  if (["1", "true", "yes"].includes(demo)) {
    localStorage.setItem(DEMO_ROLE_KEY, "admin");
    return "admin";
  }

  return localStorage.getItem(DEMO_ROLE_KEY) || "";
}

export function isDemoMode() {
  return Boolean(getDemoRole());
}

export function getDemoUser() {
  const role = getDemoRole();
  if (isSuperAdminPath() && role === "admin") {
    return demoUsers["super-admin"];
  }

  return demoUsers[role] || demoUsers.admin;
}

export function clearDemoMode() {
  localStorage.removeItem(DEMO_ROLE_KEY);
}
