import AppShell, { Badge, PageHeader, Panel } from "../components/app/AppShell.jsx";
import { payments } from "../data/systemFlowData.js";

export default function AdminPaymentsPage() {
  return (
    <AppShell active="Payments" roleId="admin">
      <PageHeader
        title="Payment Review"
        eyebrow="Review pending bank transfers and confirm or reject subscriptions."
        actions={<button className="filter-button" type="button">Export Ledger</button>}
      />

      <section className="payments-layout">
        <Panel title="Pending & Recent Payments">
          <div className="data-table">
            <div className="admin-data-row admin-data-row--head"><b>Payment</b><b>Company</b><b>Amount</b><b>Status</b><b>Submitted</b><b>Actions</b></div>
            {payments.map((payment) => (
              <div className="admin-data-row admin-data-row--payments" key={payment.id}>
                <span><b>{payment.id}</b><small>{payment.reference}</small></span>
                <span>{payment.company}<small>{payment.plan}</small></span>
                <strong>{payment.amount}</strong>
                <Badge tone={statusTone(payment.status)}>{payment.status}</Badge>
                <span>{payment.submitted}</span>
                <span className="row-actions">
                  <button type="button">Confirm</button>
                  <button type="button">Reject</button>
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Selected Payment">
          <div className="payment-inspector">
            <span className="page-kicker">Bank transfer</span>
            <h2>PAY-2048</h2>
            <p>Afaq Consulting submitted transfer reference BT-882104 for Basic plan renewal.</p>
            <div className="inspector-grid">
              <div><small>Amount</small><b>$490</b></div>
              <div><small>Status</small><b>Pending</b></div>
              <div><small>Plan</small><b>Basic</b></div>
              <div><small>Submitted</small><b>Jun 24</b></div>
            </div>
            <div className="modal-actions">
              <button className="filter-button" type="button">Reject</button>
              <button className="product-button" type="button">Confirm & Activate</button>
            </div>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}

function statusTone(status) {
  if (status === "Pending") return "orange";
  if (status === "Rejected") return "red";
  return "green";
}
