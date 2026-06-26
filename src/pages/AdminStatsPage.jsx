import AppShell, { PageHeader, Panel, StatCard } from "../components/app/AppShell.jsx";
import { adminStats } from "../data/systemFlowData.js";

export default function AdminStatsPage() {
  return (
    <AppShell active="Platform Stats" roleId="admin">
      <PageHeader
        title="Platform Statistics"
        eyebrow="Revenue, company growth, subscription conversion, and operational activity."
        actions={<button className="filter-button" type="button">Export Report</button>}
      />

      <div className="stats-grid-modern">
        {adminStats.map((item) => <StatCard item={item} key={item.label} />)}
      </div>

      <section className="dashboard-grid-modern">
        <Panel title="Subscription Conversion">
          <div className="modern-chart">
            <div className="chart-grid-lines" />
            <i className="chart-line" style={{ "--line-color": "#4c36ef", "--top": "62px", "--angle": "-10deg" }} />
            <i className="chart-line" style={{ "--line-color": "#32bea6", "--top": "106px", "--angle": "-7deg" }} />
            <div className="chart-legend"><span>Trials</span><span>Active subscriptions</span></div>
          </div>
        </Panel>
        <Panel title="Operational Signals">
          <div className="insight-stack">
            {[
              "7 bank transfers need admin review.",
              "Enterprise companies generate 62% of revenue.",
              "Trial conversion is strongest after team invitations.",
              "Suspended companies should trigger billing follow-up."
            ].map((item) => <article key={item}>{item}</article>)}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
