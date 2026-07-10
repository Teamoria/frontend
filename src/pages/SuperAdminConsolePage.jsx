import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiBarChart2,
  FiBell,
  FiBriefcase,
  FiCalendar,
  FiChevronDown,
  FiCreditCard,
  FiMenu,
  FiLogOut,
  FiMoreVertical,
  FiSearch,
  FiShield,
  FiUser,
  FiUsers
} from "react-icons/fi";
import {
  getUnreadNotificationsCount,
  listCompanies,
  listNotifications,
  listUsers,
  markAllNotificationsRead,
  markNotificationRead
} from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";
import {
  extractNotifications,
  extractUnreadCount,
  formatNotificationTime,
  isNotificationsRouteUnavailable,
  notificationIconByType
} from "../lib/notifications.js";
import "../styles/super-admin-console.css";

const navItems = [
  { label: "Dashboard", icon: FiBarChart2, path: "/super-admin" },
  { label: "Companies Management", icon: FiBriefcase, path: "/super-admin/companies" },
  { label: "User Management", icon: FiUsers, path: "/super-admin/users" },
  { label: "Payments", icon: FiCreditCard, path: "/super-admin/payments" },
  { label: "Profile", icon: FiUser, path: "/super-admin/profile" }
];

const adoptionBars = [
  ["May", 40],
  ["Jun", 55],
  ["Jul", 45],
  ["Aug", 70],
  ["Sep", 85],
  ["Oct", 95]
];

const alerts = [
  {
    level: "Critical",
    time: "2m ago",
    text: "Service response delay detected in the eastern operations cluster.",
    tone: "critical"
  },
  {
    level: "Warning",
    time: "15m ago",
    text: "High latency detected in reporting data node number 4.",
    tone: "warning"
  },
  {
    level: "Notice",
    time: "1h ago",
    text: "Weekly backup sequence finished and verification is pending.",
    tone: "notice"
  }
];

const companies = [
  ["NT", "NexuTech Solutions", "Enterprise", "Active", "1,240", "Oct 29, 2023", "primary"],
  ["QL", "Quantum Labs", "Growth", "Pending", "12", "Oct 28, 2023", "secondary"],
  ["VA", "Velo Analytics", "Enterprise", "Active", "850", "Oct 27, 2023", "tertiary"]
];

export default function SuperAdminConsolePage() {
  const [stats, setStats] = useState({ users: null, companies: null });
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    let ignore = false;

    async function loadStats() {
      setStatus({ loading: true, error: "" });
      try {
        const [usersPayload, companiesPayload] = await Promise.all([
          listUsers(),
          listCompanies()
        ]);
        const usersPagination = usersPayload?.data?.pagination || {};
        const companiesPagination = companiesPayload?.data?.pagination || {};

        if (!ignore) {
          setStats({
            users: usersPagination.total ?? usersPayload?.data?.users?.length ?? 0,
            companies: companiesPagination.total ?? companiesPayload?.data?.companies?.length ?? 0
          });
          setStatus({ loading: false, error: "" });
        }
      } catch (error) {
        if (!ignore) {
          setStatus({ loading: false, error: error.message });
        }
      }
    }

    loadStats();

    return () => {
      ignore = true;
    };
  }, []);

  const metrics = [
    {
      label: "Total Companies",
      value: status.loading ? "..." : formatNumber(stats.companies),
      detail: "From companies pagination",
      change: "Live API",
      icon: FiBriefcase,
      tone: "primary"
    },
    {
      label: "Total Users",
      value: status.loading ? "..." : formatNumber(stats.users),
      detail: "From users pagination",
      change: "Live API",
      icon: FiUsers,
      tone: "secondary"
    },
    {
      label: "Monthly Revenue",
      value: "Placeholder",
      change: "Waiting for API",
      icon: FiBarChart2,
      tone: "neutral"
    },
    {
      label: "System Health",
      value: "Placeholder",
      change: "Waiting for API",
      icon: FiShield,
      tone: "alert"
    }
  ];

  return (
    <SuperAdminShell active="Dashboard">
      <div className="super-admin-page">
        <header className="super-admin-heading">
          <div>
            <h1>Command Dashboard</h1>
            <p>Real-time operational overview of the Teamoria ecosystem.</p>
          </div>
          <div className="super-admin-period">
            <FiCalendar aria-hidden="true" />
            <span>Oct 24, 2023 - Oct 31, 2023</span>
          </div>
        </header>

        <section className="super-admin-metrics" aria-label="Key metrics">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>
        {status.error ? <p className="super-admin-state super-admin-state--error">{status.error}</p> : null}

        <section className="super-admin-bento">
          <PlatformAdoptionChart />
          <SystemAlerts />
          <RecentOnboardingTable />
        </section>
      </div>
    </SuperAdminShell>
  );
}

export function SuperAdminShell({ active = "Dashboard", children }) {
  return (
    <main className="super-admin-console">
      <SuperAdminSidebar active={active} />
      <section className="super-admin-main">
        <SuperAdminTopbar />
        {children}
      </section>
    </main>
  );
}

function SuperAdminSidebar({ active }) {
  const { logout } = useAuth();

  return (
    <aside className="super-admin-sidebar">
      <a className="super-admin-brand" href="#/super-admin">
        <span>Teamoria</span>
        <small>Super Admin Console</small>
      </a>

      <nav aria-label="Super admin navigation">
        {navItems.map(({ icon: Icon, label, path }) => (
          <a className={active === label ? "active" : ""} href={`#${path}`} key={label}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </a>
        ))}
      </nav>

      <div className="super-admin-sidebar-footer">
        <button type="button" onClick={logout}>
          <FiLogOut aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

function SuperAdminTopbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsStatus, setNotificationsStatus] = useState({ loading: true, error: "" });
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const initials = getInitials(user?.name || user?.email || "Admin User");

  useEffect(() => {
    let ignore = false;

    async function loadNotifications() {
      setNotificationsStatus({ loading: true, error: "" });

      try {
        const [notificationsPayload, countPayload] = await Promise.all([
          listNotifications(),
          getUnreadNotificationsCount()
        ]);

        if (!ignore) {
          setNotifications(extractNotifications(notificationsPayload));
          setUnreadCount(extractUnreadCount(countPayload));
          setNotificationsStatus({ loading: false, error: "" });
        }
      } catch (error) {
        if (!ignore) {
          setNotifications([]);
          setUnreadCount(0);
          setNotificationsStatus({
            loading: false,
            error: isNotificationsRouteUnavailable(error) ? "" : error.message || "Unable to load notifications."
          });
        }
      }
    }

    loadNotifications();

    return () => {
      ignore = true;
    };
  }, []);

  async function openNotification(notification) {
    if (!notification.is_read) {
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, is_read: true } : item
      )));
      setUnreadCount((current) => Math.max(0, current - 1));

      try {
        await markNotificationRead(notification.id);
      } catch (error) {
        if (!isNotificationsRouteUnavailable(error)) {
          setNotificationsStatus({ loading: false, error: error.message || "Unable to mark notification as read." });
        }
        return;
      }
    }

    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  }

  async function markAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
      setNotificationsStatus({ loading: false, error: "" });
    } catch (error) {
      if (!isNotificationsRouteUnavailable(error)) {
        setNotificationsStatus({ loading: false, error: error.message || "Unable to mark notifications as read." });
      }
    }
  }

  return (
    <header className="super-admin-topbar">
      <button
        className="super-admin-mobile-menu-button"
        type="button"
        aria-expanded={mobileMenuOpen}
        aria-label="Open admin menu"
        onClick={() => setMobileMenuOpen((open) => !open)}
      >
        <FiMenu aria-hidden="true" />
      </button>
      <label className="super-admin-search">
        <FiSearch aria-hidden="true" />
        <input placeholder="Search systems, companies or users..." />
      </label>
      <div className="super-admin-actions">
        <div className="super-admin-notification-anchor">
          <button
            type="button"
            aria-expanded={notificationsOpen}
            aria-label="Notifications"
            onClick={() => {
              setProfileOpen(false);
              setNotificationsOpen((open) => !open);
            }}
          >
            <FiBell aria-hidden="true" />
            {unreadCount > 0 ? <i /> : null}
            {unreadCount > 0 ? <span className="super-admin-notification-count">{unreadCount > 99 ? "99+" : unreadCount}</span> : null}
          </button>
          {notificationsOpen ? (
            <NotificationsOverlay
              notifications={notifications}
              onMarkAllRead={markAllRead}
              onOpenNotification={openNotification}
              status={notificationsStatus}
              unreadCount={unreadCount}
            />
          ) : null}
        </div>
        <div className="super-admin-profile-anchor">
          <button
            className="super-admin-profile-trigger"
            type="button"
            aria-expanded={profileOpen}
            aria-label="Open profile menu"
            onClick={() => {
              setNotificationsOpen(false);
              setProfileOpen((open) => !open);
            }}
          >
            <span>{initials}</span>
            <strong>
              <b>{user?.name || "Admin User"}</b>
              <small>{formatRole(user?.role || "admin")}</small>
            </strong>
            <FiChevronDown aria-hidden="true" />
          </button>
          {profileOpen ? <ProfileContextMenu user={user} initials={initials} /> : null}
        </div>
      </div>
      {mobileMenuOpen ? <SuperAdminMobileMenu onClose={() => setMobileMenuOpen(false)} /> : null}
    </header>
  );
}

function SuperAdminMobileMenu({ onClose }) {
  const { logout } = useAuth();

  function handleLogout() {
    onClose();
    logout();
  }

  return (
    <div className="super-admin-mobile-menu-layer" role="presentation">
      <button className="super-admin-mobile-menu-backdrop" type="button" aria-label="Close admin menu" onClick={onClose} />
      <section className="super-admin-mobile-menu" aria-label="Admin mobile navigation">
        <header>
          <span>Teamoria</span>
          <small>Super Admin Console</small>
        </header>
        <nav>
          {navItems.map(({ icon: Icon, label, path }) => (
            <a href={`#${path}`} key={label} onClick={onClose}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </a>
          ))}
        </nav>
        <button type="button" onClick={handleLogout}>
          <FiLogOut aria-hidden="true" />
          <span>Logout</span>
        </button>
      </section>
    </div>
  );
}

function ProfileContextMenu({ user, initials }) {
  return (
    <section className="super-admin-profile-menu" aria-label="Profile context menu">
      <header>
        <span>{initials}</span>
        <div>
          <h2>{user?.name || "Admin User"}</h2>
          <p>{user?.email || "admin@example.com"}</p>
          <small>{user?.role || "admin"}</small>
        </div>
      </header>
      <nav aria-label="Profile actions">
        <a href="#/super-admin/profile">
          <FiUser aria-hidden="true" />
          <span>Profile</span>
        </a>
      </nav>
    </section>
  );
}

function NotificationsOverlay({ notifications, onMarkAllRead, onOpenNotification, status, unreadCount }) {
  return (
    <section className="super-admin-notifications-overlay" aria-label="Notifications overlay">
      <header>
        <h2>Notifications</h2>
        <button type="button" onClick={onMarkAllRead} disabled={unreadCount === 0 || status.loading}>Mark all as read</button>
      </header>
      <div className="super-admin-notification-list">
        {status.loading ? <p className="super-admin-notification-state">Loading notifications...</p> : null}
        {!status.loading && status.error ? <p className="super-admin-notification-state super-admin-notification-state--error">{status.error}</p> : null}
        {!status.loading && !status.error && notifications.length === 0 ? <p className="super-admin-notification-state">No notifications yet.</p> : null}
        {!status.loading && !status.error ? notifications.slice(0, 5).map((notification) => {
          const Icon = notificationIconByType[notification.type] || FiBell;
          return (
            <button
              className={`tone-${notification.type} ${notification.is_read ? "is-read" : "is-unread"}`}
              key={notification.id}
              type="button"
              onClick={() => onOpenNotification(notification)}
            >
              <span>
                <Icon aria-hidden="true" />
              </span>
              <div>
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <time>{formatNotificationTime(notification.created_at)}</time>
              </div>
            </button>
          );
        }) : null}
      </div>
      <footer>
        <button type="button" onClick={() => { window.location.hash = "/super-admin/notifications"; }}>View all notifications</button>
      </footer>
    </section>
  );
}

function MetricCard({ change, detail, icon: Icon, label, tone, value }) {
  return (
    <article className={`super-admin-metric tone-${tone}`}>
      <div className="super-admin-metric-head">
        <span>
          <Icon aria-hidden="true" />
        </span>
        <em>{change}</em>
      </div>
      <p>{label}</p>
      <div className="super-admin-metric-value">
        <strong>{value}</strong>
        {detail ? <small>{detail}</small> : null}
      </div>
      {label === "System Health" ? (
        <div className="super-admin-health-bars" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
      ) : null}
    </article>
  );
}

function PlatformAdoptionChart() {
  return (
    <section className="super-admin-panel super-admin-chart-panel">
      <div className="super-admin-panel-head">
        <div>
          <h2>Platform Adoption</h2>
          <p>User and company growth trends over 6 months</p>
        </div>
        <select aria-label="Platform adoption period" defaultValue="6">
          <option value="6">Last 6 Months</option>
          <option value="12">Last 12 Months</option>
        </select>
      </div>
      <div className="super-admin-bars" aria-label="Platform adoption bar chart">
        {adoptionBars.map(([month, height]) => (
          <div className={month === "Oct" ? "active" : ""} key={month} style={{ "--bar-width": `${height}%` }}>
            <span style={{ height: `${height}%` }} />
            <b>{month}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function SystemAlerts() {
  return (
    <section className="super-admin-panel super-admin-alerts">
      <div className="super-admin-alert-title">
        <FiAlertTriangle aria-hidden="true" />
        <h2>System Alerts</h2>
      </div>
      <div className="super-admin-alert-list">
        {alerts.map((alert) => (
          <article className={`tone-${alert.tone}`} key={alert.level}>
            <div>
              <strong>{alert.level}</strong>
              <time>{alert.time}</time>
            </div>
            <p>{alert.text}</p>
          </article>
        ))}
      </div>
      <button type="button">View All Logs</button>
    </section>
  );
}

function RecentOnboardingTable() {
  return (
    <section className="super-admin-panel super-admin-table-panel">
      <div className="super-admin-table-head">
        <h2>Recent Onboarding</h2>
        <button type="button">View All Companies</button>
      </div>
      <div className="super-admin-table-wrap">
        <div className="container--scroll-x">
          <table>
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Users</th>
                <th>Onboarding Date</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {companies.map(([code, name, plan, status, users, date, tone]) => (
                <tr key={name}>
                  <td>
                    <span className={`super-admin-company-code tone-${tone}`}>{code}</span>
                    <b>{name}</b>
                  </td>
                  <td>
                    <span className={`super-admin-plan ${plan === "Enterprise" ? "enterprise" : ""}`}>{plan}</span>
                  </td>
                  <td>
                    <span className={`super-admin-status ${status === "Active" ? "active" : ""}`}>
                      <i />
                      {status}
                    </span>
                  </td>
                  <td>{users}</td>
                  <td>{date}</td>
                  <td>
                    <button type="button" aria-label={`Open actions for ${name}`}>
                      <FiMoreVertical aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function formatNumber(value) {
  if (value === null || value === undefined) return "0";
  return Number(value).toLocaleString();
}

function formatRole(value) {
  if (value === "admin") return "Platform Admin";
  return String(value || "User").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getInitials(value) {
  return String(value)
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AU";
}
