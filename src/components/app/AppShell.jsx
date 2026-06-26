import Brand from "../Brand.jsx";
import { navItems } from "../../data/teamoriaData.js";
import { useAuth } from "../../lib/AuthContext.jsx";

const iconSymbolMap = { folder: "12", check: "286", trend: "94%", calendar: "43", spark: "AI" };

export default function AppShell({ active = "Dashboard", children }) {
  const { user } = useAuth();
  const userName = user?.name || "User";
  const userRole = user?.role || user?.job_title || "Team Member";
  const roleId = user?.role_id || "project-manager";
  const visibleNav = navItems.filter((item) => item.roles.includes(roleId));
  return (
    <main className="product-shell" dir="ltr">
      <aside className="product-sidebar">
        <div className="sidebar-brand-wrap">
          <Brand compact />
          <span className="live-chip">Live MVP</span>
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
          <span>Company</span>
          <b>Taqat Digital</b>
          <small>Multi-company demo</small>
          <div className="sidebar-health"><i /><span>AI services ready</span></div>
        </div>
      </aside>
      <section className="product-main">
        <Topbar user={userName} role={userRole} />
        {children}
      </section>
    </main>
  );
}

export function Topbar({ user, role }) {
  const { logout } = useAuth();
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
        <button className="ghost-button logout-button" type="button" onClick={logout} title="Sign out">
          Logout
        </button>
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
