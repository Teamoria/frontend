import Brand from "../Brand.jsx";
import { navItems } from "../../data/teamoriaData.js";

const iconSymbolMap = {
  folder: "24",
  check: "186",
  trend: "94%",
  calendar: "3"
};

export default function AppShell({ active = "Dashboard", children, user = "Sarah Johnson", role = "Product Manager" }) {
  return (
    <main className="product-shell">
      <aside className="product-sidebar">
        <Brand compact />
        <nav>
          {navItems.map((item) => (
            <a className={active === item.label ? "active" : ""} href={`#${item.path}`} key={item.label}>
              <span className={`app-nav-icon app-nav-icon--${item.icon}`} aria-hidden="true" />
              {item.label}
              {item.label === "Tasks" && active === "Tasks" ? <b>3</b> : null}
            </a>
          ))}
        </nav>
      </aside>
      <section className="product-main">
        <Topbar user={user} role={role} />
        {children}
      </section>
    </main>
  );
}

export function Topbar({ user, role }) {
  return (
    <header className="product-topbar">
      <label className="product-search">
        <span>Search</span>
        <input placeholder="Search projects, tasks, teams..." />
      </label>
      <div className="product-profile">
        <button className="notification-button" type="button"><span>3</span></button>
        <div className="avatar-image" />
        <div>
          <b>{user}</b>
          <small>{role}</small>
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

export function StatCard({ item }) {
  return (
    <article className="stat-card">
      <span className="stat-icon">{iconSymbolMap[item.icon] || "AI"}</span>
      <div>
        <small>{item.label}</small>
        <strong>{item.value}</strong>
        <em className={item.direction === "down" ? "down" : ""}>{item.direction === "down" ? "Down" : "Up"} {item.trend}</em>
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
