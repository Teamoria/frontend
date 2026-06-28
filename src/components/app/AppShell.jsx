import { FiBarChart2, FiBriefcase, FiCloud, FiFolder, FiHome, FiMessageCircle, FiSettings, FiShield, FiUser, FiUsers, FiZap } from "react-icons/fi";
import Brand from "../Brand.jsx";
import { navItems } from "../../data/teamoriaData.js";
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
  admin: { user: "Ahmed Alyazouri", role: "Company Admin", roleId: "admin" },
  "general-manager": { user: "Aseel Harazeen", role: "General Manager", roleId: "general-manager" },
  "project-manager": { user: "Fares Namlah", role: "Project Manager", roleId: "project-manager" },
  employee: { user: "Sarah Johnson", role: "Employee", roleId: "employee" }
};

export default function AppShell({ active = "Dashboard", children, user = "Sarah Johnson", role = "Project Manager", roleId = "project-manager" }) {
  const previewRole = new URLSearchParams(window.location.search).get("role");
  const profile = rolePreviewProfiles[previewRole] || { user, role, roleId };
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
  const visibleNav = navItems;

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
      <a className="sidebar-new-project" href="#/projects">+ <span>New Project</span></a>
    </aside>
  );
}

export function Topbar({ user, role }) {
  return (
    <header className="product-topbar">
      <label className="product-search">
        <span className="search-icon" aria-hidden="true" />
        <input placeholder="Search everywhere..." />
      </label>
      <div className="command-strip">
        <button type="button">Create</button>
        <button type="button">Ask AI</button>
        <button type="button">Upload</button>
      </div>
      <div className="topbar-cluster">
        <div className="icon-control-group" aria-label="Language and appearance">
          <button className="icon-button active" type="button" title="Language">GL</button>
          <button className="icon-button" type="button" title="Light mode">SUN</button>
        </div>
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
          <button className="profile-caret" type="button" aria-label="Open profile menu">v</button>
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
