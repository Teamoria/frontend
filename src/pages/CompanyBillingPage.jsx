import AppShell, { Badge, PageHeader, Panel } from "../components/app/AppShell.jsx";
import { payments, subscriptionStates } from "../data/systemFlowData.js";

export default function CompanyBillingPage() {
  return (
    <AppShell active="Billing" roleId="owner">
      <PageHeader
        title="Subscription & Billing"
        eyebrow="Track trial access, submit bank transfers, and understand subscription state."
        actions={<button className="product-button" type="button">Submit Bank Transfer</button>}
      />

      <section className="billing-state-grid">
        {subscriptionStates.map((state) => (
          <article className={`billing-state-card billing-state-card--${state.tone}`} key={state.state}>
            <span>{state.state}</span>
            <h2>{state.label}</h2>
            <p>{state.copy}</p>
          </article>
        ))}
      </section>

      <section className="payments-layout">
        <Panel title="Current Subscription">
          <div className="subscription-summary">
            <Badge tone="orange">Trialing</Badge>
            <h2>Enterprise Plan</h2>
            <p>Full access is enabled for 3 more days. Submit a bank transfer to keep projects, uploads, and AI Chat active.</p>
            <div className="inspector-grid">
              <div><small>Trial ends</small><b>Jun 27, 2026</b></div>
              <div><small>Members</small><b>64</b></div>
              <div><small>Projects</small><b>8</b></div>
              <div><small>Amount due</small><b>$4,900</b></div>
            </div>
          </div>
        </Panel>

        <Panel title="Payment History">
          <div className="compact-list">
            {payments.map((payment) => (
              <article key={payment.id}>
                <div className="list-title-row">
                  <b>{payment.id}</b>
                  <Badge tone={payment.status === "Rejected" ? "red" : payment.status === "Pending" ? "orange" : "green"}>{payment.status}</Badge>
                </div>
                <span>{payment.reference} - {payment.amount} - {payment.submitted}</span>
              </article>
            ))}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
