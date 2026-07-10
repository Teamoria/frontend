import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiCreditCard,
  FiFileText,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiTrendingDown,
  FiTrendingUp
} from "react-icons/fi";
import { SuperAdminShell } from "./SuperAdminConsolePage.jsx";
import {
  confirmAdminPayment,
  getPayloadData,
  listAdminPayments,
  listAdminPlans,
  listAdminSubscriptions
} from "../lib/api.js";
import "../styles/super-admin-console.css";

export default function SuperAdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "", action: "" });

  useEffect(() => {
    loadBilling();
  }, []);

  async function loadBilling() {
    setStatus({ loading: true, error: "", action: "" });

    const [paymentsResult, subscriptionsResult, plansResult] = await Promise.allSettled([
      listAdminPayments(),
      listAdminSubscriptions({ per_page: 50 }),
      listAdminPlans({ page: 1 })
    ]);

    setPayments(paymentsResult.status === "fulfilled" ? extractRows(getPayloadData(paymentsResult.value), ["payments"]) : []);
    setSubscriptions(subscriptionsResult.status === "fulfilled" ? extractRows(getPayloadData(subscriptionsResult.value), ["subscriptions"]) : []);
    setPlans(plansResult.status === "fulfilled" ? extractRows(getPayloadData(plansResult.value), ["plans"]) : []);

    const failed = [paymentsResult, subscriptionsResult, plansResult].find((result) => result.status === "rejected");
    setStatus({
      loading: false,
      error: failed ? failed.reason?.message || "Unable to load billing data." : "",
      action: ""
    });
  }

  async function confirmPayment(paymentId) {
    setStatus((current) => ({ ...current, action: paymentId, error: "" }));

    try {
      await confirmAdminPayment(paymentId);
      await loadBilling();
    } catch (error) {
      setStatus((current) => ({ ...current, action: "", error: error.message || "Unable to confirm payment." }));
    }
  }

  const paymentMetrics = useMemo(() => getPaymentMetrics(payments, subscriptions, plans, status.loading), [payments, plans, status.loading, subscriptions]);
  const revenueBars = useMemo(() => getRevenueBars(payments), [payments]);
  const planRevenue = useMemo(() => getPlanRevenue(subscriptions, plans), [plans, subscriptions]);
  const transactions = useMemo(() => payments.map(normalizePayment), [payments]);

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
            <button className="super-admin-primary-action" type="button" onClick={loadBilling} disabled={status.loading}>
              <FiRefreshCw aria-hidden="true" />
              <span>{status.loading ? "Refreshing" : "Refresh Billing"}</span>
            </button>
          </div>
        </header>

        <section className="super-admin-metrics" aria-label="Payment metrics">
          {paymentMetrics.map((metric) => (
            <PaymentMetric key={metric.label} {...metric} />
          ))}
        </section>
        {status.error ? <p className="super-admin-state super-admin-state--error">{status.error}</p> : null}
        {status.loading ? <p className="super-admin-state">Loading billing data from API...</p> : null}

        <section className="super-admin-payments-grid">
          <RevenueGrowth revenueBars={revenueBars} />
          <PlanDistribution planRevenue={planRevenue} />
        </section>

        <TransactionsTable
          actionId={status.action}
          onConfirm={confirmPayment}
          transactions={transactions}
        />
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

function RevenueGrowth({ revenueBars }) {
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

function PlanDistribution({ planRevenue }) {
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
        <b>{planRevenue[0]?.[0] || "No active plans"}</b>
      </footer>
    </section>
  );
}

function TransactionsTable({ actionId, onConfirm, transactions }) {
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
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7">No pending payments returned by the API.</td>
                </tr>
              ) : null}
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
                    <span className={`super-admin-payment-status tone-${transaction.statusTone}`}>
                      <i />
                      {transaction.status}
                    </span>
                  </td>
                  <td>{transaction.date}</td>
                  <td>
                    <button
                      type="button"
                      aria-label={`Confirm payment for ${transaction.company}`}
                      disabled={transaction.statusKey !== "pending" || actionId === transaction.rawId}
                      onClick={() => onConfirm(transaction.rawId)}
                    >
                      {actionId === transaction.rawId ? <FiRefreshCw aria-hidden="true" /> : <FiCheckCircle aria-hidden="true" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="super-admin-pagination">
        <p>Showing {transactions.length} pending payment{transactions.length === 1 ? "" : "s"}</p>
        <nav aria-label="Transactions pagination">
          <button type="button" disabled>Prev</button>
          <button className="active" type="button">1</button>
          <button type="button" disabled>Next</button>
        </nav>
      </footer>
    </section>
  );
}

function extractRows(data, keys) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
  }

  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getPaymentMetrics(payments, subscriptions, plans, isLoading) {
  const pendingPayments = payments.filter((payment) => normalizeStatus(payment.status) === "pending");
  const pendingAmount = pendingPayments.reduce((total, payment) => total + Number(payment.amount || 0), 0);
  const activeSubscriptions = subscriptions.filter((subscription) => normalizeStatus(subscription.status) === "active");

  return [
    {
      label: "Pending Amount",
      value: isLoading ? "..." : formatCurrency(pendingAmount),
      detail: `${pendingPayments.length} payment${pendingPayments.length === 1 ? "" : "s"} awaiting confirmation`,
      icon: FiCreditCard,
      tone: "primary"
    },
    {
      label: "Pending Invoices",
      value: isLoading ? "..." : String(pendingPayments.length),
      detail: "From GET /admin/payments",
      icon: FiFileText,
      tone: "secondary"
    },
    {
      label: "Active Subscriptions",
      value: isLoading ? "..." : String(activeSubscriptions.length),
      detail: "From GET /admin/subscriptions",
      icon: FiRefreshCw,
      tone: "neutral"
    },
    {
      label: "Available Plans",
      value: isLoading ? "..." : String(plans.length),
      detail: "From GET /admin/plans",
      icon: FiTrendingDown,
      tone: "alert"
    }
  ];
}

function getRevenueBars(payments) {
  const buckets = new Map();
  const formatter = new Intl.DateTimeFormat("en", { month: "short" });

  payments.forEach((payment) => {
    const date = new Date(payment.confirmed_at || payment.paid_at || payment.created_at || Date.now());
    const key = Number.isNaN(date.getTime()) ? "Current" : formatter.format(date);
    buckets.set(key, Number(buckets.get(key) || 0) + Number(payment.amount || 0));
  });

  const rows = Array.from(buckets.entries()).slice(-6);
  const max = Math.max(...rows.map(([, total]) => total), 1);

  if (!rows.length) {
    return [["Now", "$0", 8]];
  }

  return rows.map(([month, total]) => [
    month,
    formatCurrencyCompact(total),
    Math.max(8, Math.round((total / max) * 95))
  ]);
}

function getPlanRevenue(subscriptions, plans) {
  const counts = new Map();

  subscriptions.forEach((subscription) => {
    const planName = subscription.plan?.name || subscription.plan_name || "Unassigned";
    counts.set(planName, Number(counts.get(planName) || 0) + 1);
  });

  if (!counts.size) {
    plans.slice(0, 3).forEach((plan) => counts.set(plan.name || "Plan", 1));
  }

  const rows = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const total = rows.reduce((sum, [, count]) => sum + count, 0) || 1;
  const tones = ["primary", "secondary", "muted"];

  if (!rows.length) {
    return [["No plans", "0%", "muted"]];
  }

  return rows.map(([plan, count], index) => [plan, `${Math.round((count / total) * 100)}%`, tones[index] || "muted"]);
}

function normalizePayment(payment) {
  const company = payment.company || payment.subscription?.company || {};
  const plan = payment.subscription?.plan || payment.plan || {};
  const statusKey = normalizeStatus(payment.status || "pending");

  return {
    rawId: payment.id,
    code: getInitials(company.name || "Company"),
    company: company.name || payment.company_name || "Company",
    domain: company.website || company.email || payment.reference_number || "No reference",
    id: payment.reference_number || payment.id,
    plan: plan.name || payment.plan_name || "Subscription",
    amount: formatCurrency(payment.amount || 0),
    status: formatLabel(statusKey),
    statusKey,
    statusTone: ["rejected", "failed", "canceled", "cancelled"].includes(statusKey) ? "failed" : statusKey,
    date: formatDate(payment.paid_at || payment.confirmed_at || payment.created_at),
    tone: statusKey === "pending" ? "secondary" : statusKey === "completed" ? "primary" : "warning"
  };
}

function normalizeStatus(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, "_");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number(value) % 1 === 0 ? 0 : 2
  }).format(Number(value || 0));
}

function formatCurrencyCompact(value) {
  const amount = Number(value || 0);
  if (Math.abs(amount) >= 1000) return `$${Math.round(amount / 1000)}k`;
  return formatCurrency(amount);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

function formatLabel(value) {
  return String(value || "").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getInitials(value) {
  return String(value || "Company")
    .split(/\s/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CO";
}
