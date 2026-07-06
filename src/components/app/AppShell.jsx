import { useState, useEffect } from "react";
import {
  FiBarChart2,
  FiBriefcase,
  FiCloud,
  FiFolder,
  FiHome,
  FiMessageCircle,
  FiShield,
  FiUser,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import Brand from "../Brand.jsx";
import { navItems } from "../../data/teamoriaData.js";
import { useAuth } from "../../lib/AuthContext.jsx";
import { getDemoRole } from "../../lib/demoMode.js";
import "../../styles/app-shell.css";
import AppHeader from "./AppHeader.jsx";

const iconSymbolMap = { folder: "12", check: "286", trend: "94%", calendar: "43", spark: "AI" };
const sidebarIconMap = {
  grid: FiHome,
  folder: FiFolder,
  check: FiBriefcase,
  calendar: FiUsers,
  spark: FiZap,
  upload: FiCloud,
  users: FiUsers,
  chart: FiBarChart2,
  system: FiShield,
  profile: FiUser
};
const rolePreviewProfiles = {
  owner: { user: "Company Owner", role: "Company Owner", roleId: "owner" },
  admin: { user: "Ahmed Alyazouri", role: "Company Admin", roleId: "admin" },
  "general-manager": { user: "Aseel Harazeen", role: "General Manager", roleId: "general-manager" },
  "project-manager": { user: "Fares Namlah", role: "Project Manager", roleId: "project-manager" },
  employee: { user: "Sarah Johnson", role: "Employee", roleId: "employee" }
};

const ownerNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: "grid" },
  { label: "Employees", path: "/employees", icon: "users" },
  { label: "Projects", path: "/owner/projects", icon: "folder" },
  { label: "Tasks", path: "/tasks", icon: "check" },
  { label: "Upload Center", path: "/owner/uploads", icon: "upload" },
  { label: "AI Chat", path: "/ai-chat", icon: "spark" },
  { label: "Profile", path: "/profile", icon: "profile" }
];

const managerNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: "grid" },
  { label: "Projects", path: "/projects", icon: "folder" },
  { label: "Tasks", path: "/tasks", icon: "check" },
  { label: "Upload Center", path: "/uploads", icon: "upload" },
  { label: "AI Chat", path: "/ai-chat", icon: "spark" },
  { label: "Profile", path: "/profile", icon: "profile" }
];

const memberNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: "grid" },
  { label: "My Tasks", path: "/tasks", icon: "check" },
  { label: "Upload Center", path: "/uploads", icon: "upload" },
  { label: "AI Chat", path: "/ai-chat", icon: "spark" },
  { label: "Profile", path: "/profile", icon: "profile" }
];

const apiRoleToShellRole = {
  admin: "admin",
  company_owner: "owner",
  company_manager: "general-manager",
  company_member: "employee"
};

const apiRoleLabel = {
  admin: "Platform Admin",
  company_owner: "Company Owner",
  company_manager: "Company Manager",
  company_member: "Company Member"
};

export default function AppShell({ active = "Dashboard", children, user = "Sarah Johnson", role = "Project Manager", roleId = "project-manager" }) {
  const { user: authUser, normalizedRole } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setMobileNavOpen(false);
    }
    if (mobileNavOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);
  const previewRole = getDemoRole();
  const mappedAuthRole = apiRoleToShellRole[normalizedRole];
  const profile =
    (authUser ? {
      user: authUser.name || authUser.email || user,
      role: apiRoleLabel[normalizedRole] || normalizedRole || role,
      roleId: mappedAuthRole || roleId
    } : null) ||
    rolePreviewProfiles[previewRole] ||
    rolePreviewProfiles[roleId] ||
    {
      user: authUser?.name || user,
      role: authUser?.role || role,
      roleId: authUser?.role || roleId
    };
  return (
    <main className="product-shell" dir="ltr">
      <div className="product-sidebar-desktop">
        <AppSidebar active={active} roleId={profile.roleId} />
      </div>
      <div className={`mobile-sidebar-overlay mobile-nav-overlay ${mobileNavOpen ? "is-open" : ""}`} aria-hidden={!mobileNavOpen} onClick={() => setMobileNavOpen(false)}>
        <div className="mobile-sidebar-panel mobile-nav-panel" onClick={(event) => event.stopPropagation()}>
          <AppSidebar active={active} roleId={profile.roleId} onNavigate={() => setMobileNavOpen(false)} />
        </div>
      </div>
      <section className="product-main">
        <Topbar user={profile.user} role={profile.role} onMobileNavToggle={() => setMobileNavOpen((value) => !value)} />
        {children}
      </section>
    </main>
  );
}

export function AppSidebar({ active = "Dashboard", roleId = "project-manager", onNavigate }) {
  const { isAdmin, normalizedRole } = useAuth();
  const visibleNav = getRoleNavItems(normalizedRole, isAdmin, roleId);
  const groupedNav = groupSidebarNavItems(visibleNav);

  return (
    <aside className="product-sidebar">
      <div className="sidebar-brand-wrap">
        <Brand compact tagline="Enterprise AI PM" />
      </div>
      <nav className="sidebar-nav" aria-label="Workspace navigation">
        {groupedNav.map((group) => (
          <div className="sidebar-nav-section" key={group.label}>
            <span className="sidebar-nav-section-label">{group.label}</span>
            <div className="sidebar-nav-section-list">
              {group.items.map((item) => {
                const Icon = sidebarIconMap[item.icon] || FiMessageCircle;
                return (
                  <a className={active === item.label ? "active" : ""} href={`#${item.path}`} key={item.label} onClick={onNavigate}>
                    <Icon className="sidebar-nav-icon" aria-hidden="true" />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      {normalizedRole === "company_member" ? null : (
        <a className="sidebar-new-project" href={normalizedRole === "company_owner" ? "#/owner/projects" : "#/projects"} onClick={onNavigate}>
          <span aria-hidden="true">+</span>
          <span>New Project</span>
        </a>
      )}
    </aside>
  );
}

function groupSidebarNavItems(items) {
  const groups = [
    { label: "Workspace", keys: new Set(["Dashboard"]) },
    { label: "Management", keys: new Set(["Employees", "Projects", "Tasks", "My Tasks", "Upload Center", "Reports"]) },
    { label: "AI", keys: new Set(["AI Chat", "Agent Runs"]) },
    { label: "Account", keys: new Set(["Profile", "Notifications"]) }
  ];

  const grouped = groups.map((group) => ({
    label: group.label,
    items: items.filter((item) => group.keys.has(item.label))
  }));
  const knownLabels = new Set(groups.flatMap((group) => Array.from(group.keys)));
  const otherItems = items.filter((item) => !knownLabels.has(item.label));

  if (otherItems.length) {
    grouped.splice(1, 0, { label: "Tools", items: otherItems });
  }

  return grouped.filter((group) => group.items.length);
}

function getRoleNavItems(role, isAdmin, roleId) {
  if (role === "company_owner") return ownerNavItems;
  if (role === "company_manager") return managerNavItems;
  if (role === "company_member") return memberNavItems;
  if (roleId === "owner") return ownerNavItems;
  return getWorkspaceNavItems(isAdmin, roleId);
}

function getWorkspaceNavItems(isAdmin, roleId) {
  const navWithPerformance = navItems.flatMap((item) => {
    if (item.path === "/reports") {
      return [
        item
      ];
    }

    return [item];
  });
  return navWithPerformance.filter((item) => {
    if (item.path.startsWith("/super-admin")) {
      return isAdmin;
    }

    return !item.roles || item.roles.includes(roleId) || item.roles.includes("employee");
  });
}
export function Topbar({ user, role, onMobileNavToggle }) {
  return <AppHeader classNamePrefix="product" role={role} user={user} onMobileNavToggle={onMobileNavToggle} />;
}

export function PageHeader({ title, eyebrow, actions }) {
  return (
    <div className="product-page-head">
      <div>
        <h1>{title}</h1>
        {eyebrow ? <p>{eyebrow}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  );
}

export function PageShell({ actions, children, className = "", subtitle, title }) {
  return (
    <div className={`app-page-layout ${className}`.trim()}>
      {title ? <PageHeader title={title} eyebrow={subtitle} actions={actions} /> : null}
      <div className="app-page-content">
        {children}
      </div>
    </div>
  );
}

export const AppPageLayout = PageShell;

export function QuickAction({ href = "#/", label, caption }) {
  return (
    <a className="quick-action-card" href={href}>
      <span>{label.slice(0, 2).toUpperCase()}</span>
      <b>{label}</b>
      <small>{caption}</small>
    </a>
  );
}

export function StatCard({ item }) {
  return (
    <article className="stat-card">
      <span className="stat-icon">{iconSymbolMap[item.icon] || "AI"}</span>
      <div>
        <small>{item.label}</small>
        {item.ar ? <small className="arabic-caption">{item.ar}</small> : null}
        <strong>{item.value}</strong>
        <em className={item.direction === "down" ? "down" : ""}>
          {item.label === "Meetings Processed" ? item.trend : `${item.direction === "down" ? "Down" : "Up"} ${item.trend}`}
        </em>
      </div>
    </article>
  );
}

export function Panel({ title, action, children, className = "" }) {
  return (
    <section className={`product-panel ${className}`}>
      {(title || action) ? (
        <div className="panel-head">
          {title ? <h2>{title}</h2> : <span />}
          {action ? <a href="#/">{action}</a> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function AvatarStack({ people }) {
  return (
    <div className="team-stack">
      {people.map((person) => (
        <span key={person}>{person}</span>
      ))}
    </div>
  );
}

export function Badge({ children, tone = "green" }) {
  return <span className={`status-badge status-badge--${tone}`}>{children}</span>;
}
