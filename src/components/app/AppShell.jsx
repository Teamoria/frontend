import { useState, useRef, useEffect } from "react";
import { FiBarChart2, FiBriefcase, FiBell, FiCloud, FiChevronDown, FiFolder, FiHome, FiLogOut, FiMessageCircle, FiSettings, FiShield, FiUser, FiUsers, FiZap } from "react-icons/fi";
import Brand from "../Brand.jsx";
import { navItems } from "../../data/teamoriaData.js";
import { useAuth } from "../../lib/AuthContext.jsx";
import "../../styles/app-shell.css";

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
  settings: FiSettings,
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
  { label: "Owner Projects", path: "/owner/projects", icon: "folder" },
  { label: "Operations Board", path: "/owner/operations", icon: "check" },
  { label: "Upload Center", path: "/owner/uploads", icon: "upload" },
  { label: "Team Performance", path: "/owner/team-performance", icon: "chart" }
];

export default function AppShell({ active = "Dashboard", children, user = "Sarah Johnson", role = "Project Manager", roleId = "project-manager" }) {
  const { user: authUser } = useAuth();
  const previewRole = new URLSearchParams(window.location.search).get("role");
  const profile =
    rolePreviewProfiles[previewRole] ||
    rolePreviewProfiles[roleId] ||
    {
      user: authUser?.name || user,
      role: authUser?.role || role,
      roleId: authUser?.role || roleId
    };
  return (
    <main className="product-shell" dir="ltr">
      <AppSidebar active={active} roleId={profile.roleId} />
      <section className="product-main">
        <Topbar user={profile.user} role={profile.role} />
        {children}
      </section>
    </main>
  );
}

export function AppSidebar({ active = "Dashboard", roleId = "project-manager" }) {
  const { isAdmin } = useAuth();
  const visibleNav = roleId === "owner" ? ownerNavItems : getWorkspaceNavItems(isAdmin, roleId);

  return (
    <aside className="product-sidebar">
      <div className="sidebar-brand-wrap">
        <Brand compact tagline="Enterprise AI PM" />
      </div>
      <nav>
        {visibleNav.map((item) => {
          const Icon = sidebarIconMap[item.icon] || FiMessageCircle;
          return (
            <a className={active === item.label ? "active" : ""} href={`#${item.path}`} key={item.label}>
              <Icon className="sidebar-nav-icon" aria-hidden="true" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
      <a className="sidebar-new-project" href={roleId === "owner" ? "#/owner/projects" : "#/projects"}>+ <span>New Project</span></a>
    </aside>
  );
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
export function Topbar({ user, role }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const initials = (user || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    function handleClickOutside(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <header className="product-topbar">
      <label className="product-search">
        <span className="search-icon" aria-hidden="true" />
        <input placeholder="Search everywhere..." />
      </label>
      <div className="topbar-cluster">
        <button className="notification-button" type="button" aria-label="Notifications">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V10a6 6 0 1 0-12 0v4.2a2 2 0 0 1-.6 1.4L4 17h5" />
            <path d="M9 17a3 3 0 0 0 6 0" />
          </svg>
          <span>3</span>
        </button>
        <div className="product-profile">
          <div className="avatar-image" />
          <div>
            <b>{user}</b>
            <small>{role}</small>
          </div>
          <div className="pd-wrap" ref={ref}>
            <button
              className="profile-caret"
              type="button"
              aria-label="Open profile menu"
              aria-expanded={open}
              aria-haspopup="true"
              onClick={() => setOpen((v) => !v)}
            >
              <FiChevronDown style={{ transition: "transform .18s", transform: open ? "rotate(180deg)" : "none" }} />
            </button>
            {open && (
              <div className="pd-menu" role="menu">
                <div className="pd-header">
                  <div className="pd-avatar">{initials}</div>
                  <div>
                    <b>{user}</b>
                    <small>{role}</small>
                  </div>
                </div>
                <div className="pd-items">
                  <a className="pd-item" href="#/profile" role="menuitem" onClick={() => setOpen(false)}>
                    <FiUser /> View Profile
                  </a>
                  <a className="pd-item" href="#/settings" role="menuitem" onClick={() => setOpen(false)}>
                    <FiSettings /> Settings
                  </a>
                  <a className="pd-item" href="#/settings" role="menuitem" onClick={() => setOpen(false)}>
                    <FiShield /> Security
                  </a>
                  <a className="pd-item" href="#/settings" role="menuitem" onClick={() => setOpen(false)}>
                    <FiBell /> Notifications
                  </a>
                  <hr className="pd-divider" />
                  <button className="pd-item pd-danger" type="button" role="menuitem" onClick={() => setOpen(false)}>
                    <FiLogOut /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
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
