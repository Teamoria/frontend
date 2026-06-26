import {
  FiAlertTriangle,
  FiArrowRight,
  FiBell,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDownload,
  FiHelpCircle,
  FiPlus,
  FiSearch,
  FiShield,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiZap
} from "react-icons/fi";
import {
  ActivityOverviewChart,
  AIInsightCard,
  DashboardMetricCard,
  ProjectProgressChart,
  TaskDistributionChart,
  WorkspaceActivityFeed
} from "../components/dashboard/DashboardComponents.jsx";
import { aiInsights, dashboardCharts, workspaceActivities } from "../data/dashboardInsights.js";
import { AppSidebar } from "../components/app/AppShell.jsx";

const roleProfiles = {
  admin: { label: "Company Admin", initials: "AD", dashboard: "owner" },
  "general-manager": { label: "General Manager", initials: "GM", dashboard: "owner" },
  "project-manager": { label: "Project Manager", initials: "PM", dashboard: "execution" },
  employee: { label: "Employee", initials: "EM", dashboard: "employee" }
};

const execMetrics = [
  { label: "Team Velocity", value: "48.2 pts", detail: "+12% vs last week", icon: FiTrendingUp, tone: "primary" },
  { label: "Sprint Progress", value: "64%", detail: "Sprint", icon: FiClock, tone: "secondary", progress: 64 },
  { label: "Workload Avg.", value: "82%", detail: "3 over 90%", icon: FiUsers, tone: "tertiary", progress: 82 },
  { label: "Critical Alerts", value: "3 Blocks", detail: "Immediate attention", icon: FiAlertTriangle, tone: "alert" }
];

const ownerMetrics = [
  { label: "Total Budget Utilization", value: "$142.8M", detail: "+12.4%", icon: FiCreditCard, tone: "primary", progress: 65 },
  { label: "Global Project Health", value: "94.2%", detail: "Optimal", icon: FiShield, tone: "secondary", progress: 75 },
  { label: "Total Workforce", value: "3,842", detail: "+42 hires", icon: FiUsers, tone: "neutral", progress: 84 },
  { label: "AI Efficiency ROI", value: "$24.5M Saved", detail: "3.2x Yield", icon: FiZap, tone: "ai", progress: 92 }
];

const ownerTeams = [
  ["AI-R", "AI Research Lab", "Zurich Office", "142 pts", "Elite", "primary", 3],
  ["SaaS", "SaaS Products", "Palo Alto", "118 pts", "Stable", "green", 2],
  ["Fin", "Finance Operations", "London Center", "94 pts", "Caution", "amber", 1]
];

const overdueTasks = [
  ["API Auth Integration", "Leon R.", "2 Days"],
  ["Client Feedback Loop", "Emily T.", "1 Day"],
  ["Documentation V2", "System", "4 Hours"]
];

export default function DashboardPage() {
  const roleId = getDashboardRole();
  const profile = roleProfiles[roleId] || roleProfiles["project-manager"];

  if (profile.dashboard === "owner") {
    return <OwnerDashboard roleId={roleId} profile={profile} />;
  }

  if (profile.dashboard === "employee") {
    return <EmployeeDashboard roleId={roleId} profile={profile} />;
  }

  return <ExecutionDashboard roleId={roleId} profile={profile} />;
}

function OwnerDashboard({ roleId, profile }) {
  return (
    <main className="owner-dashboard">
      <AppSidebar active="Dashboard" roleId={roleId} />
      <section className="owner-content">
        <header className="owner-topbar">
          <label className="owner-search">
            <FiSearch aria-hidden="true" />
            <input placeholder="Search organization data..." />
          </label>
          <TopActions avatar={profile.initials} classNamePrefix="owner" />
        </header>

        <div className="owner-page">
          <section className="owner-hero-row">
            <div>
              <h2>Organization Overview</h2>
              <p>
                Enterprise-wide analytics for Teamoria Group. Synchronized AI oversight
                across departments, regions, budgets, and project health.
              </p>
            </div>
            <div className="owner-period">
              <FiCalendar aria-hidden="true" />
              <span>{profile.label} View</span>
            </div>
          </section>

          <RoleSwitcher activeRole={roleId} variant="owner" />

          <section className="owner-metrics-grid">
            {ownerMetrics.map((metric) => (
              <DashboardMetricCard classNamePrefix="owner" key={metric.label} {...metric} />
            ))}
          </section>

          <section className="owner-insights-grid">
            <div className="owner-main-column">
              <section className="owner-panel owner-table-panel">
                <div className="owner-panel-head">
                  <h3><FiStar aria-hidden="true" />Top Performing Teams</h3>
                  <a href="#/reports">View All Units</a>
                </div>
                <div className="owner-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Velocity</th>
                        <th>Project Health</th>
                        <th>AI Integration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ownerTeams.map(([code, name, office, velocity, health, tone, avatars]) => (
                        <tr key={name}>
                          <td>
                            <div className={`owner-team-code tone-${tone}`}>{code}</div>
                            <div>
                              <b>{name}</b>
                              <span>{office}</span>
                            </div>
                          </td>
                          <td>{velocity}</td>
                          <td>
                            <span className={`owner-health tone-${tone}`}>
                              {health === "Elite" ? <FiCheckCircle /> : health === "Stable" ? <FiTrendingUp /> : <FiAlertTriangle />}
                              {health}
                            </span>
                          </td>
                          <td>
                            <div className="owner-avatar-stack">
                              {Array.from({ length: avatars }).map((_, index) => <i key={`${name}-${index}`} />)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="owner-risk-grid">
                <RiskCard
                  action="Audit Spend"
                  badge="High Priority"
                  classNamePrefix="owner"
                  icon={<FiAlertTriangle />}
                  text="Legacy Cloud Migration project in EMEA region has exceeded allocated monthly spend by 18%."
                  title="Budget Overrun Risk"
                  tone="error"
                />
                <RiskCard
                  action="Reallocate"
                  badge="In Progress"
                  classNamePrefix="owner"
                  icon={<FiBriefcase />}
                  text="Full-stack engineering capacity is at 104% across 4 projects. Estimated 2 week delay if not mitigated."
                  title="Resource Bottleneck"
                  tone="secondary"
                />
              </section>
            </div>

            <aside className="owner-right-rail">
              <section className="owner-ai-panel">
                <div className="owner-ai-head">
                  <span><FiZap aria-hidden="true" /></span>
                  <div>
                    <h3>AI Growth Hub</h3>
                    <p>Strategic Suggestions</p>
                  </div>
                </div>
                <div className="owner-ai-suggestions">
                  {aiInsights.filter((insight) => insight.scope === "company").map((insight) => (
                    <AIInsightCard classNamePrefix="owner" insight={insight} key={insight.id} />
                  ))}
                </div>
                <article className="owner-projection-card">
                  <span>Projection</span>
                  <h4>2025 Headcount Plan</h4>
                  <p>Model predicts needing 80+ additional Data Engineers to maintain current scaling trajectory.</p>
                  <button type="button">Generate HR Roadmap</button>
                </article>
              </section>
              <section className="owner-dashboard-charts">
                <ProjectProgressChart classNamePrefix="owner" data={dashboardCharts.projectProgress} />
                <ActivityOverviewChart classNamePrefix="owner" data={dashboardCharts.activityOverview} />
              </section>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}

function ExecutionDashboard({ roleId, profile }) {
  return (
    <main className="execution-dashboard">
      <AppSidebar active="Dashboard" roleId={roleId} />
      <section className="exec-shell">
        <header className="exec-topbar">
          <label className="exec-search">
            <FiSearch aria-hidden="true" />
            <input placeholder="Search tasks, teams, or AI insights..." />
          </label>
          <TopActions avatar={profile.initials} classNamePrefix="exec" />
        </header>

        <div className="exec-page">
          <section className="manager-hub-head">
            <div className="manager-hub-title">
              <span><FiZap aria-hidden="true" /></span>
              <div>
                <h2>AI Intelligence Hub</h2>
                <p>Real-time operational analysis and predictive project health indicators for {profile.label}.</p>
              </div>
            </div>
            <div className="exec-page-actions">
              <button className="exec-secondary-button" type="button">
                <FiDownload aria-hidden="true" />
                <span>Export Report</span>
              </button>
              <button className="exec-primary-button" type="button">Manage Sprint</button>
            </div>
          </section>

          <RoleSwitcher activeRole={roleId} variant="exec" />

          <section className="manager-intel-grid">
            <section className="manager-risks-column">
              <div className="manager-section-title">
                <h3><FiAlertTriangle aria-hidden="true" />Critical Risks</h3>
                <span>3 Active</span>
              </div>
              <RiskSignalCard
                detail="Sprint 24 Integration"
                level="HIGH RISK"
                progress={85}
                text="Probability of delay increased by 14% due to pending API documentation from backend team."
                title="Potential Delay: Frontend"
                tone="error"
              />
              <RiskSignalCard
                detail="Data Pipeline Refactor"
                level="MEDIUM"
                progress={40}
                text="Sarah J. is over-allocated at 115% capacity across 3 parallel high-priority streams."
                title="Resource Conflict"
                tone="secondary"
              />
              <a className="manager-text-link" href="#/reports">View Risk Register -&gt;</a>
            </section>

            <section className="manager-strategic-column">
              <div className="manager-section-title manager-section-title--plain">
                <h3><FiTrendingUp aria-hidden="true" />Strategic Insights</h3>
              </div>
              <div className="manager-insight-grid">
                <StrategicInsightCard
                  eyebrow="Structural Analytics"
                  icon={<FiBriefcase />}
                  title="Resource Bottleneck"
                  text="Detected in EMEA region delivery cluster for Project Odyssey. Review cycle is 42% slower than average."
                  variant="flow"
                />
                <StrategicInsightCard
                  eyebrow="Velocity Trends"
                  icon={<FiTrendingUp />}
                  title="Productivity Uplift"
                  text="AI-assisted coding has improved velocity by 18% in the last 30 days. Estimated early delivery of Milestone B."
                  variant="bars"
                />
              </div>
            </section>

            <section className="manager-recommendations">
              <div className="manager-section-title manager-section-title--plain">
                <h3><FiZap aria-hidden="true" />Actionable Recommendations</h3>
              </div>
              <div className="manager-recommendation-grid">
                <RecommendationCard
                  action="Apply Now"
                  detail="Move CSS Refactor from Sarah J. to Marcus L. to balance workload."
                  icon={<FiArrowRight />}
                  secondaryAction="Details"
                  title="Reassign 2 Sub-tasks"
                />
                <RecommendationCard
                  action="Reschedule"
                  detail="Move task to next sprint to accommodate current backend delays."
                  icon={<FiCalendar />}
                  secondaryAction="Ignore"
                  title={'Shift "Final QA"'}
                />
                <RecommendationCard
                  action="Auto-Schedule"
                  detail="Schedule a 15m huddle with the Design Team to unblock Frontend."
                  icon={<FiUsers />}
                  secondaryAction="Dismiss"
                  title="Sync Meeting Needed"
                />
              </div>
            </section>
          </section>
        </div>

        <AiHelper classNamePrefix="exec" />
      </section>
    </main>
  );
}

function RiskSignalCard({ detail, level, progress, text, title, tone }) {
  return (
    <article className={`manager-risk-card tone-${tone}`}>
      <div className="manager-risk-head">
        <div>
          <h4>{title}</h4>
          <p>{detail}</p>
        </div>
        <span>{level}</span>
      </div>
      <div className="manager-risk-progress">
        <i style={{ width: `${progress}%` }} />
      </div>
      <p>{text}</p>
    </article>
  );
}

function StrategicInsightCard({ eyebrow, icon, text, title, variant }) {
  return (
    <article className="manager-strategic-card">
      <div>
        <div className="manager-card-eyebrow">
          {icon}
          <span>{eyebrow}</span>
        </div>
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
      {variant === "flow" ? <FlowVisual /> : <TrendBars />}
    </article>
  );
}

function RecommendationCard({ action, detail, icon, secondaryAction, title }) {
  return (
    <article className="manager-recommendation-card">
      <span>{icon}</span>
      <div>
        <h4>{title}</h4>
        <p>{detail}</p>
        <div>
          <button type="button">{action}</button>
          <button type="button">{secondaryAction}</button>
        </div>
      </div>
    </article>
  );
}

function FlowVisual() {
  return (
    <div className="manager-flow-visual" aria-hidden="true">
      <span />
      <span />
      <span />
      <i />
    </div>
  );
}

function TrendBars() {
  return (
    <div className="manager-trend-bars" aria-hidden="true">
      {[40, 60, 55, 90].map((height) => <i style={{ height: `${height}%` }} key={height} />)}
    </div>
  );
}

function EmployeeDashboard({ roleId, profile }) {
  return (
    <main className="employee-dashboard">
      <AppSidebar active="Dashboard" roleId={roleId} />
      <section className="employee-shell">
        <header className="employee-topbar">
          <label className="employee-search">
            <FiSearch aria-hidden="true" />
            <input placeholder="Search projects or AI insights..." />
          </label>
          <TopActions avatar={profile.initials} classNamePrefix="employee" />
        </header>

        <div className="employee-page">
          <section className="employee-hero">
            <h2>Welcome back, Alex.</h2>
            <p>You have 4 primary tasks to tackle today. Your productivity score is up 12% this week.</p>
          </section>

          <RoleSwitcher activeRole={roleId} variant="employee" />

          <section className="employee-bento-grid">
            <article className="employee-panel employee-task-panel">
              <div className="employee-panel-head">
                <h3>My Tasks for Today</h3>
                <span>4 Remaining</span>
              </div>
              <div className="employee-task-list">
                {[
                  ["Finalize Q3 roadmap review", "Due by 2:00 PM - Priority High"],
                  ["Sync with Design System team", "Due by 4:30 PM - Teamoria Alpha"],
                  ["Review sprint velocity data", "No deadline - Operational"]
                ].map(([title, meta]) => (
                  <label className="employee-task-item" key={title}>
                    <input type="checkbox" />
                    <span>
                      <b>{title}</b>
                      <small>{meta}</small>
                    </span>
                  </label>
                ))}
              </div>
              <a className="employee-text-link" href="#/tasks">View all tasks <FiArrowRight aria-hidden="true" /></a>
            </article>

            <article className="employee-score-card">
              <div>
                <h3>Productivity Score</h3>
                <p>Based on deep work sessions</p>
              </div>
              <div className="employee-score-row">
                <strong>88<span>/100</span></strong>
                <div>
                  <b><FiTrendingUp aria-hidden="true" />+12%</b>
                  <small>Top 5% of team</small>
                </div>
              </div>
            </article>

            <article className="employee-panel employee-upcoming-panel">
              <div className="employee-panel-head">
                <h3>Upcoming</h3>
                <FiCalendar aria-hidden="true" />
              </div>
              <div className="employee-meeting-list">
                {[
                  ["10:00", "AM", "Stakeholder Monthly", "Main Conference Room"],
                  ["01:30", "PM", "Design Review", "Virtual Link"]
                ].map(([time, meridiem, title, place]) => (
                  <article key={title}>
                    <time><span>{time}</span><b>{meridiem}</b></time>
                    <div>
                      <b>{title}</b>
                      <small>{place}</small>
                    </div>
                  </article>
                ))}
              </div>
            </article>

            <article className="employee-ai-card">
              <div className="employee-ai-head">
                <span><FiZap aria-hidden="true" /></span>
                <div>
                  <h3>Teamoria AI</h3>
                  <p>I can summarize your docs or analyze team velocity.</p>
                </div>
              </div>
              <div className="employee-ai-message">
                <AIInsightCard
                  classNamePrefix="employee"
                  insight={aiInsights.find((insight) => insight.id === "insight-employee-focus")}
                />
              </div>
              <label className="employee-ai-input">
                <input placeholder="Ask anything... 'Summarize project delta feedback'" />
                <button type="button"><FiArrowRight aria-hidden="true" /></button>
              </label>
            </article>

            <article className="employee-panel employee-files-panel">
              <h3>Recent Files</h3>
              <div className="employee-file-list">
                {[
                  ["Q3_Roadmap_Draft.pdf", "Modified 2h ago", "doc"],
                  ["Budget_Allocation_Final.xlsx", "Modified Yesterday", "sheet"],
                  ["Team_Velocity_Q2.report", "Modified 3d ago", "report"]
                ].map(([name, meta, type]) => (
                  <article className={`file-${type}`} key={name}>
                    <span><FiBookOpen aria-hidden="true" /></span>
                    <div>
                      <b>{name}</b>
                      <small>{meta}</small>
                    </div>
                    <button type="button">...</button>
                  </article>
                ))}
              </div>
              <a className="employee-secondary-link" href="#/uploads">Open Upload Center</a>
            </article>

            <article className="employee-panel employee-schedule-panel">
              <div className="employee-schedule-head">
                <div>
                  <h3>Work Schedule</h3>
                  <span>Friday, June 14</span>
                </div>
                <div>
                  <button className="active" type="button">Day</button>
                  <button type="button">Week</button>
                  <button type="button">Month</button>
                </div>
              </div>
              <div className="employee-timeline">
                {[
                  ["8:00 AM", "Daily Standup", "Teamoria Squad", "primary"],
                  ["9:00 AM", "", "", ""],
                  ["10:00 AM", "Stakeholder Monthly", "", "secondary"],
                  ["11:00 AM", "Focus Block", "", "focus"]
                ].map(([time, title, subtitle, tone]) => (
                  <div className="employee-time-row" key={time}>
                    <span>{time}</span>
                    <div>
                      {title ? (
                        <article className={`tone-${tone}`}>
                          <b>{title}</b>
                          {subtitle ? <small>{subtitle}</small> : null}
                        </article>
                      ) : null}
                    </div>
                  </div>
                ))}
                <div className="employee-now-line">
                  <span>11:45</span>
                  <i />
                </div>
              </div>
            </article>
          </section>
        </div>

        <AiHelper classNamePrefix="employee" />
        <a className="employee-fab" href="#/tasks" aria-label="Create task"><FiPlus aria-hidden="true" /></a>
      </section>
    </main>
  );
}

function TopActions({ avatar, classNamePrefix }) {
  return (
    <div className={`${classNamePrefix}-top-actions`}>
      <button type="button" aria-label="Notifications"><FiBell /></button>
      <button type="button" aria-label="History"><FiClock /></button>
      <button type="button" aria-label="Help"><FiHelpCircle /></button>
      <div className={`${classNamePrefix}-avatar`}>{avatar}</div>
    </div>
  );
}

function RoleSwitcher({ activeRole, variant }) {
  return (
    <div className={`dashboard-role-switcher dashboard-role-switcher--${variant}`} aria-label="Preview dashboard role">
      {Object.entries(roleProfiles).map(([id, role]) => (
        <button className={activeRole === id ? "active" : ""} type="button" key={id} onClick={() => setDashboardRole(id)}>
          {role.label}
        </button>
      ))}
    </div>
  );
}

function RiskCard({ action, badge, classNamePrefix, icon, text, title, tone }) {
  return (
    <article className={`${classNamePrefix}-risk-card tone-${tone}`}>
      <h3>{icon}{title}</h3>
      <p>{text}</p>
      <div>
        <span>{badge}</span>
        <a href="#/reports">{action}</a>
      </div>
    </article>
  );
}

function AiHelper({ classNamePrefix }) {
  return (
    <nav className={`${classNamePrefix}-ai-helper`} aria-label="AI helper navigation">
      {[
        ["AI Assistant", FiZap, true],
        ["Ask Source", FiBookOpen, false],
        ["Cite", FiCheckCircle, false],
        ["History", FiClock, false]
      ].map(([label, Icon, active]) => (
        <a className={active ? "active" : ""} href="#/ai-chat" key={label}>
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}

function getDashboardRole() {
  const hashQuery = window.location.hash.split("?")[1] || "";
  const hashRole = new URLSearchParams(hashQuery).get("role");
  const urlRole = new URLSearchParams(window.location.search).get("role");
  const storedRole = localStorage.getItem("teamoria_preview_role");
  const role = hashRole || urlRole || storedRole || "project-manager";
  return roleProfiles[role] ? role : "project-manager";
}

function setDashboardRole(roleId) {
  localStorage.setItem("teamoria_preview_role", roleId);
  window.location.hash = `/dashboard?role=${roleId}`;
}
