import {
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiFilter,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiUsers
} from "react-icons/fi";
import { SuperAdminShell } from "./SuperAdminConsolePage.jsx";
import "../styles/super-admin-console.css";

const companyMetrics = [
  { label: "Active Companies", value: "1,242", detail: "+18 this month", icon: FiBriefcase, tone: "primary" },
  { label: "Pending Review", value: "42", detail: "Awaiting approval", icon: FiClock, tone: "alert" },
  { label: "Total Seats", value: "84,520", detail: "Across all plans", icon: FiUsers, tone: "secondary" },
  { label: "Paid Accounts", value: "96.8%", detail: "Billing healthy", icon: FiCreditCard, tone: "neutral" }
];

const companies = [
  {
    code: "NT",
    name: "NexuTech Solutions",
    owner: "Maya Carter",
    plan: "Enterprise",
    status: "Active",
    billing: "Paid",
    users: "1,240",
    workspaces: 28,
    joined: "Oct 29, 2023",
    tone: "primary"
  },
  {
    code: "QL",
    name: "Quantum Labs",
    owner: "Daniel Kim",
    plan: "Growth",
    status: "Pending",
    billing: "Trial",
    users: "12",
    workspaces: 3,
    joined: "Oct 28, 2023",
    tone: "secondary"
  },
  {
    code: "VA",
    name: "Velo Analytics",
    owner: "Sofia Martin",
    plan: "Enterprise",
    status: "Active",
    billing: "Paid",
    users: "850",
    workspaces: 19,
    joined: "Oct 27, 2023",
    tone: "tertiary"
  },
  {
    code: "AS",
    name: "Astra Systems",
    owner: "Omar Haddad",
    plan: "Starter",
    status: "Suspended",
    billing: "Overdue",
    users: "34",
    workspaces: 5,
    joined: "Oct 21, 2023",
    tone: "warning"
  }
];

export default function SuperAdminCompaniesPage() {
  return (
    <SuperAdminShell active="Companies">
      <div className="super-admin-page">
        <header className="super-admin-heading super-admin-heading--management">
          <div>
            <span className="super-admin-kicker">Super Admin</span>
            <h1>Companies Management</h1>
            <p>Manage tenant accounts, subscription state, seats, and onboarding status across Teamoria.</p>
          </div>
          <button className="super-admin-primary-action" type="button">
            <FiPlus aria-hidden="true" />
            <span>Add Company</span>
          </button>
        </header>

        <section className="super-admin-metrics" aria-label="Company management metrics">
          {companyMetrics.map((metric) => (
            <CompanyMetric key={metric.label} {...metric} />
          ))}
        </section>

        <section className="super-admin-panel super-admin-companies-panel">
          <div className="super-admin-management-toolbar">
            <label className="super-admin-management-search">
              <FiSearch aria-hidden="true" />
              <input placeholder="Search companies, owners, plans..." />
            </label>
            <div className="super-admin-management-controls">
              <button type="button">
                <FiFilter aria-hidden="true" />
                <span>Filters</span>
              </button>
              <select aria-label="Company status" defaultValue="all">
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="super-admin-table-wrap">
            <table className="super-admin-management-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Owner</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Billing</th>
                  <th>Users</th>
                  <th>Workspaces</th>
                  <th>Joined</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.name}>
                    <td>
                      <span className={`super-admin-company-code tone-${company.tone}`}>{company.code}</span>
                      <b>{company.name}</b>
                    </td>
                    <td>{company.owner}</td>
                    <td>
                      <span className={`super-admin-plan ${company.plan === "Enterprise" ? "enterprise" : ""}`}>
                        {company.plan}
                      </span>
                    </td>
                    <td>
                      <span className={`super-admin-status ${company.status === "Active" ? "active" : ""}`}>
                        <i />
                        {company.status}
                      </span>
                    </td>
                    <td>
                      <span className={`super-admin-billing tone-${company.billing.toLowerCase()}`}>{company.billing}</span>
                    </td>
                    <td>{company.users}</td>
                    <td>{company.workspaces}</td>
                    <td>{company.joined}</td>
                    <td>
                      <button type="button" aria-label={`Open actions for ${company.name}`}>
                        <FiMoreVertical aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </SuperAdminShell>
  );
}

function CompanyMetric({ detail, icon: Icon, label, tone, value }) {
  return (
    <article className={`super-admin-metric tone-${tone}`}>
      <div className="super-admin-metric-head">
        <span>
          <Icon aria-hidden="true" />
        </span>
        <em>
          <FiCheckCircle aria-hidden="true" />
        </em>
      </div>
      <p>{label}</p>
      <div className="super-admin-metric-value">
        <strong>{value}</strong>
      </div>
      <small>{detail}</small>
    </article>
  );
}
