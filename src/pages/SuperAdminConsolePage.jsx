import { useState } from "react";
import {
  FiAlertTriangle,
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiChevronDown,
  FiClock,
  FiCreditCard,
  FiHelpCircle,
  FiLock,
  FiLogOut,
  FiMoreVertical,
  FiSearch,
  FiSettings,
  FiShield,
  FiUser,
  FiUsers
} from "react-icons/fi";
import "../styles/super-admin-console.css";

const navItems = [
  { label: "Dashboard", icon: FiBarChart2, path: "/super-admin" },
  { label: "Companies", icon: FiBriefcase, path: "/super-admin/companies" },
  { label: "Users", icon: FiUsers, path: "/super-admin/users" },
  { label: "Payments", icon: FiCreditCard, path: "/super-admin/payments" },
  { label: "System Config", icon: FiSettings, path: "/super-admin/config" }
];

const metrics = [
  {
    label: "Total Companies",
    value: "1,284",
    detail: "(42 Pending)",
    change: "+12% vs LW",
    icon: FiBriefcase,
    tone: "primary"
  },
  {
    label: "Total Users",
    value: "84,520",
    change: "+8% vs LW",
    icon: FiUsers,
    tone: "secondary"
  },
  {
    label: "Monthly Revenue",
    value: "$1.42M",
    change: "+24% vs LM",
    icon: FiBarChart2,
    tone: "neutral"
  },
  {
    label: "System Health",
    value: "Stable",
    change: "Uptime: 99.9%",
    icon: FiShield,
    tone: "alert"
  }
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

const notifications = [
  {
    title: "Critical: Gateway latency increase",
    text: "Latency spike detected in the eastern operations cluster.",
    time: "2 mins ago",
    tone: "critical",
    icon: FiAlertTriangle
  },
  {
    title: "New Company Onboarded",
    text: "NexuTech Solutions has joined the platform.",
    time: "15 mins ago",
    tone: "company",
    icon: FiBriefcase
  },
  {
    title: "Security Insight",
    text: "3 users flagged for unusual login patterns.",
    time: "1 hour ago",
    tone: "security",
    icon: FiShield
  },
  {
    title: "Payment Received",
    text: "Quantum Labs completed Enterprise Plan renewal.",
    time: "3 hours ago",
    tone: "payment",
    icon: FiCreditCard
  }
];

export default function SuperAdminConsolePage() {
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

      <button className="super-admin-report-button" type="button">Generate Reports</button>

      <div className="super-admin-sidebar-footer">
        <a href="#/super-admin">
          <FiBookOpen aria-hidden="true" />
          <span>Documentation</span>
        </a>
        <a href="#/signin">
          <FiSettings aria-hidden="true" />
          <span>Logout</span>
        </a>
      </div>
    </aside>
  );
}

function SuperAdminTopbar() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="super-admin-topbar">
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
          <i />
        </button>
        {notificationsOpen ? <NotificationsOverlay /> : null}
        </div>
        <button type="button" aria-label="Help">
          <FiHelpCircle aria-hidden="true" />
        </button>
        <button type="button" aria-label="Settings">
          <FiSettings aria-hidden="true" />
        </button>
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
            <span>AU</span>
            <b>Admin User</b>
            <FiChevronDown aria-hidden="true" />
          </button>
          {profileOpen ? <ProfileContextMenu /> : null}
        </div>
      </div>
    </header>
  );
}

function ProfileContextMenu() {
  return (
    <section className="super-admin-profile-menu" aria-label="Profile context menu">
      <header>
        <span>AU</span>
        <div>
          <h2>Admin User</h2>
          <p>admin@gigem.ai</p>
          <small>Super Admin</small>
        </div>
      </header>
      <nav aria-label="Profile actions">
        <a href="#/profile">
          <FiUser aria-hidden="true" />
          <span>Profile Settings</span>
        </a>
        <a href="#/super-admin/config">
          <FiLock aria-hidden="true" />
          <span>Security</span>
        </a>
        <a href="#/super-admin">
          <FiClock aria-hidden="true" />
          <span>Activity Logs</span>
        </a>
      </nav>
      <footer>
        <a href="#/signin">
          <FiLogOut aria-hidden="true" />
          <span>Logout</span>
        </a>
      </footer>
    </section>
  );
}

function NotificationsOverlay() {
  return (
    <section className="super-admin-notifications-overlay" aria-label="Notifications overlay">
      <header>
        <h2>Notifications</h2>
        <button type="button">Mark all as read</button>
      </header>
      <nav aria-label="Notification filters">
        <button className="active" type="button">All</button>
        <button type="button">System</button>
        <button type="button">Activity</button>
      </nav>
      <div className="super-admin-notification-list">
        {notifications.map(({ icon: Icon, text, time, title, tone }) => (
          <article className={`tone-${tone}`} key={title}>
            <span>
              <Icon aria-hidden="true" />
            </span>
            <div>
              <h3>{title}</h3>
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
    </section>
  );
}
