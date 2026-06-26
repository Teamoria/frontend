import AppShell, { Badge, PageHeader, Panel } from "../components/app/AppShell.jsx";
import { plans } from "../data/systemFlowData.js";

export default function AdminPlansPage() {
  return (
    <AppShell active="Plans" roleId="admin">
      <PageHeader
        title="Plans & Subscriptions"
        eyebrow="Create, price, activate, and deactivate Teamoria subscription plans."
        actions={<button className="product-button" type="button">Create Plan</button>}
      />

      <section className="plans-layout">
        {plans.map((plan) => (
          <article className={`plan-admin-card ${plan.name === "Pro" ? "featured" : ""}`} key={plan.name}>
            <div className="plan-admin-head">
              <span>{plan.name.slice(0, 2).toUpperCase()}</span>
              <Badge>{plan.status}</Badge>
            </div>
            <h2>{plan.name}</h2>
            <strong>{plan.price}</strong>
            <div className="plan-admin-meta">
              <span>{plan.companies} companies</span>
              <span>{plan.members} members</span>
              <span>{plan.projects} projects</span>
            </div>
            <div className="page-actions">
              <button className="filter-button" type="button">Edit</button>
              <button className="filter-button" type="button">Deactivate</button>
            </div>
          </article>
        ))}
      </section>

      <Panel title="Plan Rules">
        <div className="settings-list">
          {["7-day trial enabled", "Bank transfer payment review", "Manual enterprise pricing", "Feature limits inherited by company workspace"].map((item) => (
            <label key={item}>
              <span>{item}</span>
              <input defaultChecked type="checkbox" />
            </label>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
