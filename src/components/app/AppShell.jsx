import { useState, useRef, useEffect } from "react";
import { FiAlertTriangle, FiBarChart2, FiBell, FiBriefcase, FiCheckCircle, FiCloud, FiChevronDown, FiClock, FiFolder, FiHome, FiLogOut, FiMenu, FiMessageCircle, FiSettings, FiShield, FiUser, FiUsers, FiZap } from "react-icons/fi";
import Brand from "../Brand.jsx";
import { navItems } from "../../data/teamoriaData.js";
import { useAuth } from "../../lib/AuthContext.jsx";
import { getDemoRole } from "../../lib/demoMode.js";
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

const sampleNotifications = [
  {
    title: "Project review requested",
    text: "The onboarding project is ready for your approval.",
    time: "5m ago",
    tone: "info",
    icon: FiMessageCircle
  },
  {
    title: "Deadline approaching",
    text: "The launch checklist is due in less than two hours.",
    time: "28m ago",
    tone: "warning",
    icon: FiAlertTriangle
  },
  {
    title: "Task completed",
    text: "Your weekly status update was approved by the team lead.",
    time: "1h ago",
    tone: "success",
    icon: FiCheckCircle
  }
];

const ownerNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: "grid" },
  { label: "Employees", path: "/employees", icon: "users" },
  { label: "Projects", path: "/owner/projects", icon: "folder" },
  { label: "Tasks", path: "/tasks", icon: "check" },
  { label: "Operations Board", path: "/owner/operations", icon: "check" },
  { label: "Upload Center", path: "/owner/uploads", icon: "upload" },
  { label: "AI Chat", path: "/ai-chat", icon: "spark" },
  { label: "Settings", path: "/settings", icon: "settings" },
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

  return (
    <aside className="product-sidebar">
      <div className="sidebar-brand-wrap">
        <Brand compact tagline="Enterprise AI PM" />
      </div>
      <nav>
        {visibleNav.map((item) => {
          const Icon = sidebarIconMap[item.icon] || FiMessageCircle;
          return (
            <a className={active === item.label ? "active" : ""} href={`#${item.path}`} key={item.label} onClick={onNavigate}>
              <Icon className="sidebar-nav-icon" aria-hidden="true" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
      {normalizedRole === "company_member" ? null : (
        <a className="sidebar-new-project" href={normalizedRole === "company_owner" ? "#/owner/projects" : "#/projects"} onClick={onNavigate}>+ <span>New Project</span></a>
      )}
    </aside>
  );
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const { logout } = useAuth();
  const initials = (user || "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    function handleClickOutside(e) {
      const clickedOutsideProfile = profileRef.current && !profileRef.current.contains(e.target);
      const clickedOutsideNotifications = notificationRef.current && !notificationRef.current.contains(e.target);

      if (clickedOutsideProfile && clickedOutsideNotifications) {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    }
    function handleEsc(e) {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
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
      <button className="mobile-nav-toggle" type="button" aria-label="Open navigation menu" onClick={onMobileNavToggle}>
        <FiMenu aria-hidden="true" />
      </button>
      <label className="product-search">
        <span className="search-icon" aria-hidden="true" />
        <input placeholder="Search everywhere..." />
      </label>
      <div className="topbar-cluster">
        <div className="product-notification-anchor" ref={notificationRef}>
          <button
            className={`notification-button ${notificationsOpen ? "is-active" : ""}`}
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            onClick={() => {
              setProfileOpen(false);
              setNotificationsOpen((v) => !v);
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V10a6 6 0 1 0-12 0v4.2a2 2 0 0 1-.6 1.4L4 17h5" />
              <path d="M9 17a3 3 0 0 0 6 0" />
            </svg>
            <span>3</span>
          </button>
          {notificationsOpen ? (
            <section className="product-notifications-panel" aria-label="Notifications panel">
              <header>
                <h3>Notifications</h3>
                <button type="button">Mark all as read</button>
              </header>
              <div className="product-notifications-list">
                {sampleNotifications.map(({ icon: Icon, text, time, title, tone }) => (
                  <article className={`product-notification-item tone-${tone}`} key={title}>
                    <span>
                      <Icon aria-hidden="true" />
                    </span>
                    <div>
                      <h4>{title}</h4>
                      <p>{text}</p>
                      <time>{time}</time>
                    </div>
                  </article>
                ))}
              </div>
              <footer>
                <button type="button">View all notifications</button>
              </footer>
            </section>
          ) : null}
        </div>
        <div className="product-profile" ref={profileRef}>
          <div className="avatar-image" />
          <div>
            <b>{user}</b>
            <small>{role}</small>
          </div>
          <div className="pd-wrap">
            <button
              className="profile-caret"
              type="button"
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              onClick={() => {
                setNotificationsOpen(false);
                setProfileOpen((v) => !v);
              }}
            >
              <FiChevronDown style={{ transition: "transform .18s", transform: profileOpen ? "rotate(180deg)" : "none" }} />
            </button>
            {profileOpen && (
              <div className="pd-menu" role="menu">
                <div className="pd-header">
                  <div className="pd-avatar">{initials}</div>
                  <div>
                    <b>{user}</b>
                    <small>{role}</small>
                  </div>
                </div>
                <div className="pd-items">
                  <a className="pd-item" href="#/profile" role="menuitem" onClick={() => setProfileOpen(false)}>
                    <FiUser /> View Profile
                  </a>
                  <a className="pd-item" href="#/settings" role="menuitem" onClick={() => setProfileOpen(false)}>
                    <FiSettings /> Settings
                  </a>
                  <a className="pd-item" href="#/settings" role="menuitem" onClick={() => setProfileOpen(false)}>
                    <FiShield /> Security
                  </a>
                  <a className="pd-item" href="#/settings" role="menuitem" onClick={() => setProfileOpen(false)}>
                    <FiBell /> Notifications
                  </a>
                  <hr className="pd-divider" />
                  <button
                    className="pd-item pd-danger"
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                  >
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
