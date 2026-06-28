import { useState } from "react";
import {
  FiDownload,
  FiEye,
  FiFilter,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiUserCheck,
  FiUserPlus,
  FiUsers,
  FiX,
  FiZap
} from "react-icons/fi";
import { SuperAdminShell } from "./SuperAdminConsolePage.jsx";
import "../styles/super-admin-console.css";

const userMetrics = [
  { label: "Total Users", value: "84,520", detail: "Across all companies", icon: FiUsers, tone: "primary" },
  { label: "Active Now", value: "1,240", detail: "Live sessions", icon: FiZap, tone: "secondary" },
  { label: "New This Month", value: "3,184", detail: "+8% vs last month", icon: FiUserPlus, tone: "neutral" },
  { label: "Verified Users", value: "98.2%", detail: "Security coverage", icon: FiUserCheck, tone: "alert" }
];

const users = [
  {
    initials: "JV",
    name: "Julian Vane",
    email: "julian.v@nexustech.io",
    company: "Nexus Tech Solutions",
    role: "Company Admin",
    status: "Active",
    lastLogin: "Oct 24, 2023 - 09:12 AM",
    tone: "primary"
  },
  {
    initials: "SC",
    name: "Sarah Chen",
    email: "s.chen@globalreach.com",
    company: "Global Reach Corp",
    role: "Manager",
    status: "Active",
    lastLogin: "Oct 23, 2023 - 04:45 PM",
    tone: "secondary"
  },
  {
    initials: "RW",
    name: "Robert Wilson",
    email: "r.wilson@helios-energy.uk",
    company: "Helios Energy",
    role: "Employee",
    status: "Inactive",
    lastLogin: "Sep 12, 2023 - 11:02 AM",
    tone: "tertiary"
  },
  {
    initials: "AK",
    name: "Amira Kassis",
    email: "amira.k@vortex.com",
    company: "Vortex Creative",
    role: "Manager",
    status: "Suspended",
    lastLogin: "Oct 05, 2023 - 02:20 PM",
    tone: "warning"
  },
  {
    initials: "MJ",
    name: "Marcus Johnson",
    email: "marcus.j@skyline.org",
    company: "Skyline Logistics",
    role: "Employee",
    status: "Active",
    lastLogin: "Just now",
    tone: "primary"
  }
];

export default function SuperAdminUsersPage() {
  const [addUserOpen, setAddUserOpen] = useState(false);

  return (
    <SuperAdminShell active="Users">
      <div className="super-admin-page">
        <header className="super-admin-heading super-admin-heading--management">
          <div>
            <span className="super-admin-kicker">Super Admin</span>
            <h1>User Management</h1>
            <p>
              Monitor and manage individual user accounts across the Teamoria ecosystem with
              role, company, and account-status controls.
            </p>
          </div>
          <div className="super-admin-action-row">
            <button className="super-admin-secondary-action" type="button">
              <FiDownload aria-hidden="true" />
              <span>Export Users</span>
            </button>
            <button className="super-admin-primary-action" type="button" onClick={() => setAddUserOpen(true)}>
              <FiPlus aria-hidden="true" />
              <span>Create User</span>
            </button>
          </div>
        </header>

        <section className="super-admin-metrics" aria-label="User management metrics">
          {userMetrics.map((metric) => (
            <UserMetric key={metric.label} {...metric} />
          ))}
        </section>

        <section className="super-admin-panel super-admin-users-panel">
          <div className="super-admin-management-toolbar super-admin-user-filters">
            <label className="super-admin-management-search">
              <FiSearch aria-hidden="true" />
              <input placeholder="Search users by name or email..." />
            </label>
            <div className="super-admin-management-controls">
              <select aria-label="Role" defaultValue="all">
                <option value="all">All Roles</option>
                <option value="admin">Company Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
              <select aria-label="Company" defaultValue="all">
                <option value="all">All Companies</option>
                <option value="nexus">Nexus Tech Solutions</option>
                <option value="global">Global Reach Corp</option>
                <option value="helios">Helios Energy</option>
              </select>
              <select aria-label="Account status" defaultValue="all">
                <option value="all">Account Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <button type="button" aria-label="Apply filters">
                <FiFilter aria-hidden="true" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          <div className="super-admin-table-wrap">
            <table className="super-admin-management-table super-admin-users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.email}>
                    <td>
                      <span className={`super-admin-user-avatar tone-${user.tone}`}>{user.initials}</span>
                      <span className="super-admin-user-cell">
                        <b>{user.name}</b>
                        <small>{user.email}</small>
                      </span>
                    </td>
                    <td>{user.company}</td>
                    <td>
                      <span className={`super-admin-role-pill tone-${roleTone(user.role)}`}>{user.role}</span>
                    </td>
                    <td>
                      <span className={`super-admin-status ${user.status === "Active" ? "active" : ""} ${user.status === "Suspended" ? "suspended" : ""}`}>
                        <i />
                        {user.status}
                      </span>
                    </td>
                    <td>{user.lastLogin}</td>
                    <td>
                      <button type="button" aria-label={`Open actions for ${user.name}`}>
                        <FiMoreVertical aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="super-admin-pagination">
            <p>Showing 1 to 5 of 84,520 users</p>
            <nav aria-label="Users pagination">
              <button type="button" disabled>Prev</button>
              <button className="active" type="button">1</button>
              <button type="button">2</button>
              <button type="button">3</button>
              <span>...</span>
              <button type="button">16,904</button>
              <button type="button">Next</button>
            </nav>
          </footer>
        </section>
      </div>
      {addUserOpen ? <AddUserModal onClose={() => setAddUserOpen(false)} /> : null}
    </SuperAdminShell>
  );
}

function AddUserModal({ onClose }) {
  return (
    <div className="super-admin-modal-layer" role="presentation">
      <button className="super-admin-modal-backdrop" type="button" aria-label="Close add user modal" onClick={onClose} />
      <section className="super-admin-add-user-modal" role="dialog" aria-modal="true" aria-labelledby="add-user-title">
        <header>
          <h2 id="add-user-title">Add New User</h2>
          <button type="button" aria-label="Close add user modal" onClick={onClose}>
            <FiX aria-hidden="true" />
          </button>
        </header>

        <form>
          <div className="super-admin-modal-field">
            <label htmlFor="new-user-name">Full Name</label>
            <input id="new-user-name" placeholder="e.g. John Doe" type="text" />
          </div>

          <div className="super-admin-modal-field">
            <label htmlFor="new-user-company">Company</label>
            <select id="new-user-company" defaultValue="">
              <option value="" disabled>Select Company</option>
              <option>Nexus Tech Solutions</option>
              <option>Global Reach Corp</option>
              <option>Helios Energy</option>
              <option>Vortex Creative</option>
              <option>Skyline Logistics</option>
            </select>
          </div>

          <div className="super-admin-modal-field">
            <label htmlFor="new-user-role">Role</label>
            <select id="new-user-role" defaultValue="Employee">
              <option>Employee</option>
              <option>Manager</option>
              <option>Company Admin</option>
            </select>
          </div>

          <div className="super-admin-modal-field">
            <label htmlFor="new-user-email">Email Address</label>
            <input id="new-user-email" placeholder="john.doe@example.com" type="email" />
          </div>

          <div className="super-admin-modal-field">
            <label htmlFor="new-user-password">Password</label>
            <div className="super-admin-password-field">
              <input id="new-user-password" placeholder="********" type="password" />
              <button type="button" aria-label="Show password">
                <FiEye aria-hidden="true" />
              </button>
            </div>
          </div>

          <footer>
            <button className="super-admin-modal-cancel" type="button" onClick={onClose}>Cancel</button>
            <button className="super-admin-modal-submit" type="button">Create User</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function UserMetric({ detail, icon: Icon, label, tone, value }) {
  return (
    <article className={`super-admin-metric tone-${tone}`}>
      <div className="super-admin-metric-head">
        <span>
          <Icon aria-hidden="true" />
        </span>
      </div>
      <p>{label}</p>
      <div className="super-admin-metric-value">
        <strong>{value}</strong>
      </div>
      <small>{detail}</small>
    </article>
  );
}

function roleTone(role) {
  if (role === "Company Admin") return "admin";
  if (role === "Manager") return "manager";
  return "employee";
}
