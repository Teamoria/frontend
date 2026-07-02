import {
  FiAlertTriangle,
  FiArrowUpRight,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiLogOut,
  FiTarget,
  FiUsers,
  FiZap
} from "react-icons/fi";
import AppShell, { Badge, PageHeader, Panel } from "../components/app/AppShell.jsx";
import { useAuth } from "../lib/AuthContext.jsx";
import "../styles/team-performance.css";

const performanceMetrics = [
  { label: "Team Performance Score", value: "91%", detail: "+8% vs last month", icon: FiTarget, tone: "blue" },
  { label: "Delivery Reliability", value: "87%", detail: "14 projects on track", icon: FiCheckCircle, tone: "green" },
  { label: "Workload Balance", value: "76%", detail: "3 people above target", icon: FiUsers, tone: "amber" },
  { label: "AI Productivity Lift", value: "22%", detail: "Estimated hours saved", icon: FiZap, tone: "violet" }
];

const teams = [
  ["AI Platform", "Ahmed Alyazouri", "96%", "On Track", "124 pts", "High"],
  ["Client Portal", "Aseel Harazeen", "89%", "On Track", "98 pts", "Medium"],
  ["Operations Knowledge", "Fares Namlah", "74%", "Needs Review", "63 pts", "High"],
  ["Mobile Delivery", "Sarah Johnson", "82%", "Stable", "86 pts", "Low"]
];

const employees = [
  ["Ahmed Alyazouri", "Company Admin", "97", "12 tasks", "4 blockers cleared"],
  ["Aseel Harazeen", "General Manager", "92", "18 reviews", "2 risks escalated"],
  ["Fares Namlah", "Project Manager", "84", "21 tasks", "1 overloaded sprint"],
  ["Sarah Johnson", "Employee", "79", "16 tasks", "Needs workload review"]
];

const alerts = [
  ["Capacity Risk", "Operations Knowledge team is trending 18% above planned workload.", "Review today"],
  ["Delivery Delay", "Two high priority tasks have missed owner confirmation.", "Escalate"],
  ["AI Opportunity", "Client Portal team can automate recurring status reports.", "Enable workflow"]
];

export default function TeamPerformanceOversightPage() {
  const { logout } = useAuth();

  return (
    <AppShell active="Team Performance" role="Company Owner" roleId="owner" user="Company Owner">
      <PageHeader
        title="Team Performance Oversight"
        eyebrow="Company owner view for delivery health, team load, employee output, and executive alerts."
        actions={(
          <>
            <button className="filter-button" type="button">
              <FiDownload aria-hidden="true" />
              Export
            </button>
            <button className="performance-logout-button" type="button" onClick={logout}>
              <FiLogOut aria-hidden="true" />
              Logout
            </button>
          </>
        )}
      />

      <section className="performance-metric-grid">
        {performanceMetrics.map(({ detail, icon: Icon, label, tone, value }) => (
          <article className={`performance-metric-card tone-${tone}`} key={label}>
            <span><Icon aria-hidden="true" /></span>
            <div>
              <small>{label}</small>
              <strong>{value}</strong>
              <em>{detail}</em>
            </div>
          </article>
        ))}
      </section>

      <section className="performance-layout">
        <Panel title="Team Health Ranking" className="performance-table-panel">
          <div className="performance-table-wrap">
            <div className="container--scroll-x">
              <table className="performance-table">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Owner</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Velocity</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map(([team, owner, score, status, velocity, risk]) => (
                    <tr key={team}>
                      <td>
                        <b>{team}</b>
                        <span>Workspace performance</span>
                      </td>
                      <td>{owner}</td>
                      <td><strong>{score}</strong></td>
                      <td><Badge tone={status === "Needs Review" ? "amber" : "green"}>{status}</Badge></td>
                      <td>{velocity}</td>
                      <td>
                        <span className={`performance-risk risk-${risk.toLowerCase()}`}>{risk}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Panel>

        <aside className="performance-side-stack">
          <Panel title="Executive Alerts">
            <div className="performance-alert-list">
              {alerts.map(([title, text, action], index) => (
                <article key={title}>
                  <span>{index === 2 ? <FiZap aria-hidden="true" /> : <FiAlertTriangle aria-hidden="true" />}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                    <button type="button">{action}<FiArrowUpRight aria-hidden="true" /></button>
                  </div>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Performance Trend">
            <div className="performance-trend-card">
              <div className="performance-trend-head">
                <FiBarChart2 aria-hidden="true" />
                <strong>+14%</strong>
                <span>Quarterly improvement</span>
              </div>
              <div className="performance-bars" aria-hidden="true">
                {[46, 58, 64, 72, 68, 83, 91].map((height) => <i style={{ height: `${height}%` }} key={height} />)}
              </div>
            </div>
          </Panel>
        </aside>
      </section>

      <Panel title="Employee Performance Snapshot">
        <div className="employee-performance-grid">
          {employees.map(([name, role, score, activity, note]) => (
            <article className="employee-performance-card" key={name}>
              <div className="employee-performance-avatar">{name.split(" ").map((part) => part[0]).join("")}</div>
              <div>
                <h3>{name}</h3>
                <p>{role}</p>
              </div>
              <strong>{score}</strong>
              <small>{activity}</small>
              <em><FiClock aria-hidden="true" />{note}</em>
            </article>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
