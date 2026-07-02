import {
  FiCreditCard,
  FiDownload,
  FiFileText,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiTrendingDown,
  FiTrendingUp
} from "react-icons/fi";
import { SuperAdminShell } from "./SuperAdminConsolePage.jsx";
import "../styles/super-admin-console.css";

const paymentMetrics = [
  { label: "Total Revenue", value: "$1.42M", detail: "+12% month-over-month", icon: FiCreditCard, tone: "primary" },
  { label: "Pending Invoices", value: "14", detail: "Totaling $42,500.00", icon: FiFileText, tone: "secondary" },
  { label: "Active Subscriptions", value: "1,240", detail: "Across 850 verified companies", icon: FiRefreshCw, tone: "neutral" },
  { label: "Subscription Churn", value: "1.2%", detail: "Low risk", icon: FiTrendingDown, tone: "alert" }
];

const revenueBars = [
  ["May", "$180k", 45],
  ["Jun", "$198k", 55],
  ["Jul", "$226k", 70],
  ["Aug", "$214k", 65],
  ["Sep", "$245k", 85],
  ["Oct", "$288k", 95]
];

const planRevenue = [
  ["Enterprise", "62%", "primary"],
  ["Pro", "28%", "secondary"],
  ["Growth", "10%", "muted"]
];

const transactions = [
  {
    code: "ND",
    company: "Nova Dynamics",
    domain: "nova-corp.ai",
    id: "#TXN-8821",
    plan: "Enterprise",
    amount: "$12,500.00",
    status: "Completed",
    date: "Oct 28, 2023",
    tone: "primary"
  },
  {
    code: "AF",
    company: "Apex Financial",
    domain: "apex.finance",
    id: "#TXN-8822",
    plan: "Pro",
    amount: "$2,450.00",
    status: "Pending",
    date: "Oct 27, 2023",
    tone: "secondary"
  },
  {
    code: "SL",
    company: "Stellar Labs",
    domain: "stellar.io",
    id: "#TXN-8823",
    plan: "Enterprise",
    amount: "$12,500.00",
    status: "Failed",
    date: "Oct 27, 2023",
    tone: "warning"
  },
  {
    code: "VM",
    company: "Velo Media",
    domain: "velo.media",
    id: "#TXN-8824",
    plan: "Growth",
    amount: "$499.00",
    status: "Completed",
    date: "Oct 26, 2023",
    tone: "tertiary"
  }
];

export default function SuperAdminPaymentsPage() {
  return (
    <SuperAdminShell active="Payments">
      <div className="super-admin-page">
        <header className="super-admin-heading super-admin-heading--management">
          <div>
            <span className="super-admin-kicker">Super Admin</span>
            <h1>Payments &amp; Billing</h1>
            <p>Real-time oversight of Teamoria revenue, subscriptions, invoices, and transaction health.</p>
          </div>
          <div className="super-admin-action-row">
            <button className="super-admin-secondary-action" type="button">
              <FiFilter aria-hidden="true" />
              <span>Filter View</span>
            </button>
            <button className="super-admin-primary-action" type="button">
              <FiDownload aria-hidden="true" />
              <span>Export Statement</span>
            </button>
          </div>
        </header>

        <section className="super-admin-metrics" aria-label="Payment metrics">
          {paymentMetrics.map((metric) => (
            <PaymentMetric key={metric.label} {...metric} />
          ))}
        </section>

        <section className="super-admin-payments-grid">
          <RevenueGrowth />
          <PlanDistribution />
        </section>

        <TransactionsTable />
      </div>
    </SuperAdminShell>
  );
}

function PaymentMetric({ detail, icon: Icon, label, tone, value }) {
  return (
    <article className={`super-admin-metric tone-${tone}`}>
      <div className="super-admin-metric-head">
        <span>
          <Icon aria-hidden="true" />
        </span>
        {label === "Total Revenue" ? (
          <em>
            <FiTrendingUp aria-hidden="true" />
            +12%
          </em>
        ) : null}
      </div>
      <p>{label}</p>
      <div className="super-admin-metric-value">
        <strong>{value}</strong>
      </div>
      <small>{detail}</small>
      {label === "Subscription Churn" ? (
        <div className="super-admin-mini-progress" aria-hidden="true">
          <i style={{ width: "12%" }} />
        </div>
      ) : null}
    </article>
  );
}

function RevenueGrowth() {
  return (
    <section className="super-admin-panel super-admin-revenue-panel">
      <div className="super-admin-panel-head">
        <div>
          <h2>Revenue Growth</h2>
          <p>Monthly revenue performance across active billing accounts</p>
        </div>
        <select aria-label="Revenue period" defaultValue="6">
          <option value="6">Last 6 Months</option>
          <option value="12">Last 12 Months</option>
          <option value="ytd">Year to Date</option>
        </select>
      </div>
      <div className="super-admin-revenue-chart" aria-label="Revenue growth chart">
        {revenueBars.map(([month, amount, height]) => (
          <div key={month} style={{ "--bar-width": `${height}%` }}>
            <span style={{ height: `${height}%` }}>
              <em>{amount}</em>
            </span>
            <b>{month}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlanDistribution() {
  return (
    <section className="super-admin-panel super-admin-plan-panel">
      <h2>Revenue by Plan</h2>
      <div className="super-admin-plan-list">
        {planRevenue.map(([plan, percent, tone]) => (
          <article key={plan}>
            <div>
              <span className={`tone-${tone}`} />
              <b>{plan}</b>
              <strong>{percent}</strong>
            </div>
            <i>
              <em className={`tone-${tone}`} style={{ width: percent }} />
            </i>
          </article>
        ))}
      </div>
      <footer>
        <span>Top Performing:</span>
        <b>Enterprise Plus</b>
      </footer>
    </section>
  );
}

function TransactionsTable() {
  return (
    <section className="super-admin-panel super-admin-transactions-panel">
      <div className="super-admin-management-toolbar">
        <h2>Recent Transactions</h2>
        <div className="super-admin-management-controls">
          <label className="super-admin-management-search super-admin-transaction-search">
            <FiSearch aria-hidden="true" />
            <input placeholder="Search company..." />
          </label>
          <button type="button" aria-label="Filter transactions">
            <FiFilter aria-hidden="true" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="super-admin-table-wrap">
        <div className="container--scroll-x">
          <table className="super-admin-management-table super-admin-transactions-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Transaction ID</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th aria-label="Action" />
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <span className={`super-admin-company-code tone-${transaction.tone}`}>{transaction.code}</span>
                    <span className="super-admin-user-cell">
                      <b>{transaction.company}</b>
                      <small>{transaction.domain}</small>
                    </span>
                  </td>
                  <td className="super-admin-mono">{transaction.id}</td>
                  <td>
                    <span className={`super-admin-plan ${transaction.plan === "Enterprise" ? "enterprise" : ""}`}>
                      {transaction.plan}
                    </span>
                  </td>
                  <td>
                    <b>{transaction.amount}</b>
                  </td>
                  <td>
                    <span className={`super-admin-payment-status tone-${transaction.status.toLowerCase()}`}>
                      <i />
                      {transaction.status}
                    </span>
                  </td>
                  <td>{transaction.date}</td>
                  <td>
                    <button type="button" aria-label={`Open invoice for ${transaction.company}`}>
                      <FiFileText aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="super-admin-pagination">
        <p>Showing 1 to 4 of 285 transactions</p>
        <nav aria-label="Transactions pagination">
          <button type="button" disabled>Prev</button>
          <button className="active" type="button">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <span>...</span>
          <button type="button">15</button>
          <button type="button">Next</button>
        </nav>
      </footer>
    </section>
  );
}
