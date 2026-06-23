import AppShell, { PageHeader, Panel } from "../components/app/AppShell.jsx";
import { reports } from "../data/teamoriaData.js";

export default function ReportsPage() {
  return (
    <AppShell active="Reports">
      <PageHeader
        title="Analytics & Reports"
        eyebrow="Project performance, team productivity, task completion, and AI insights."
        actions={(
          <>
            <button className="filter-button" type="button">Export PDF</button>
            <button className="filter-button" type="button">Export Excel</button>
          </>
        )}
      />

      <div className="stats-grid-modern">
        {reports.map(([title, value, text]) => (
          <article className="stat-card" key={title}>
            <span className="stat-icon">{value}</span>
            <div><small>{title}</small><strong>{value}</strong><em>{text}</em></div>
          </article>
        ))}
      </div>

      <div className="dashboard-grid-modern">
        <Panel title="Task Completion Trend">
          <div className="modern-chart">
            <div className="chart-grid-lines" />
            <i className="chart-line" style={{ "--line-color": "#4c36ef", "--top": "70px", "--angle": "-9deg" }} />
            <i className="chart-line" style={{ "--line-color": "#32bea6", "--top": "112px", "--angle": "-6deg" }} />
          </div>
        </Panel>
        <Panel title="AI Insights">
          <div className="insight-stack">
            {["Operations workspace has the highest document reuse.", "Two projects need manager review this week.", "Source citation coverage is above target."].map((item) => (
              <article key={item}>{item}</article>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
