import AppShell, { Badge, PageHeader, Panel, StatCard } from "../components/app/AppShell.jsx";
import { adminStats, payments, platformCompanies } from "../data/systemFlowData.js";

export default function AdminDashboardPage() {
  return (
    <AppShell active="Admin Dashboard" roleId="admin">
      <PageHeader
        title="Platform Command Center"
        eyebrow="Monitor subscriptions, companies, pending payments, and platform health."
        actions={(
          <>
            <a className="filter-button" href="#/admin/payments">Review Payments</a>
            <a className="product-button" href="#/admin/companies">Create Company</a>
          </>
        )}
      />

      <div className="stats-grid-modern">
        {adminStats.map((item) => <StatCard item={item} key={item.label} />)}
      </div>

      <section className="admin-command-grid">
        <Panel title="Companies Requiring Attention">
          <div className="data-table">
            <div className="admin-data-row admin-data-row--head"><b>Company</b><b>Plan</b><b>Status</b><b>Members</b><b>Action</b></div>
            {platformCompanies.map((company) => (
              <div className="admin-data-row" key={company.name}>
                <span><b>{company.name}</b><small>{company.owner}</small></span>
                <span>{company.plan}</span>
                <Badge tone={statusTone(company.status)}>{company.status}</Badge>
                <span>{company.members}</span>
                <a className="add-task-link" href="#/admin/companies/taqat">Open</a>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Payment Review Queue">
          <div className="payment-review-list">
            {payments.map((payment) => (
              <article key={payment.id}>
                <div>
                  <b>{payment.company}</b>
                  <span>{payment.id} - {payment.reference}</span>
                </div>
                <strong>{payment.amount}</strong>
                <Badge tone={statusTone(payment.status)}>{payment.status}</Badge>
              </article>
            ))}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}

function statusTone(status) {
  if (status.includes("Pending") || status === "Trialing") return "orange";
  if (status === "Rejected" || status === "Suspended") return "red";
  return "green";
}
