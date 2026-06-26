import Brand from "../Brand.jsx";
import { roleNavigation, roleProfiles } from "../../data/systemFlowData.js";

const iconSymbolMap = { building: "48", folder: "12", check: "286", trend: "94%", calendar: "43", payments: "$", plans: "3", spark: "AI", users: "64" };

export default function AppShell({ active = "Dashboard", children, user, role, roleId = "manager" }) {
  const normalizedRole = {
    "company-owner": "owner",
    "general-manager": "owner",
    "project-manager": "manager",
    employee: "member"
  }[roleId] || roleId;
  const profile = roleProfiles[normalizedRole] || roleProfiles.manager;
  const visibleNav = roleNavigation[normalizedRole] || roleNavigation.manager;
  const displayUser = user || profile.user;
  const displayRole = role || profile.role;
  return (
    <main className="product-shell" dir="ltr">
      <aside className="product-sidebar">
        <div className="sidebar-brand-wrap">
          <Brand compact />
          <span className="live-chip">{profile.badge}</span>
        </div>
        <nav>
          {visibleNav.map((item) => (
            <a className={active === item.label ? "active" : ""} href={`#${item.path}`} key={item.label}>
              <span className={`app-nav-icon app-nav-icon--${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
              {item.label === "Tasks" ? <b className="nav-badge">3</b> : null}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span>{normalizedRole === "admin" ? "Scope" : "Company"}</span>
          <b>{profile.company}</b>
          <small>{profile.status}</small>
          <div className="sidebar-health"><i /><span>AI services ready</span></div>
        </div>
      </aside>
      <section className="product-main">
        <Topbar user={displayUser} role={displayRole} />
        {children}
      </section>
    </main>
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
