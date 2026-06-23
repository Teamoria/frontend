import AppShell, { AvatarStack, Panel, QuickAction, StatCard } from "../components/app/AppShell.jsx";
import { dashboardStats, recentTasks, todayMeetings } from "../data/teamoriaData.js";

export default function DashboardPage() {
  return (
    <AppShell active="Dashboard">
      <div className="product-page-head dashboard-command-head">
        <div>
          <span className="page-kicker">Live workspace command center</span>
          <h1>Good morning, Sarah</h1>
          <p>Track projects, meetings, uploads, and AI workspace knowledge from one operational view.</p>
        </div>
      </div>

      <section className="quick-actions-grid">
        <QuickAction href="#/workspace" label="Workspace" caption="Open project command view" />
        <QuickAction href="#/uploads" label="Upload" caption="Process files and meetings" />
        <QuickAction href="#/ai-chat" label="Ask AI" caption="Query sources with citations" />
        <QuickAction href="#/agent-runs" label="Agent Run" caption="Inspect execution logs" />
      </section>

      <div className="stats-grid-modern">
        {dashboardStats.map((item) => <StatCard item={item} key={item.label} />)}
      </div>

      <div className="dashboard-grid-modern">
        <Panel title="Project Progress">
          <div className="modern-chart">
            <div className="chart-grid-lines" />
            <i className="chart-line" style={{ "--line-color": "#4c36ef", "--top": "64px", "--angle": "-10deg" }} />
            <i className="chart-line" style={{ "--line-color": "#8a5cff", "--top": "92px", "--angle": "-8deg" }} />
            <i className="chart-line" style={{ "--line-color": "#32bea6", "--top": "112px", "--angle": "-7deg" }} />
            <div className="chart-legend">
              <span>AI Platform</span>
              <span>Client Portal</span>
              <span>Mobile Team</span>
            </div>
          </div>
        </Panel>

        <Panel className="ai-recommendation">
          <h2>AI Recommendation</h2>
          <h3>Focus on high-impact tasks</h3>
          <p>Your team's velocity is highest when focusing on 2-3 priority tasks. Consider reducing WIP to improve delivery speed by 23%.</p>
          <div className="ai-pulse-row"><span /><span /><span /></div>
          <a className="white-action" href="#/ai-chat">View Insights -&gt;</a>
        </Panel>
      </div>

      <div className="dashboard-lower-grid">
        <Panel title="Recent Tasks" action="View all tasks">
          <div className="task-table">
            {recentTasks.map(([task, project, date, priority, sourceType], index) => (
              <label className={`task-row ${sourceType ? "task-row--ai" : ""}`} key={task}>
                <input defaultChecked={index === 1} type="checkbox" />
                <span className={`task-source-icon task-source-icon--${sourceType || "manual"}`} aria-hidden="true">
                  {sourceType === "video" ? "VID" : sourceType === "pdf" ? "PDF" : "TASK"}
                </span>
                <span className="recent-task-copy">
                  <b>{task}</b>
                  {sourceType ? (
                    <span className="ai-task-badges">
                      <small>{sourceType === "video" ? "AI extracted" : "From HR document"}</small>
                      <small>{date}</small>
                    </span>
                  ) : null}
                </span>
                <span>{project}</span>
                <em className={`priority priority--${priority}`}>{priority}</em>
              </label>
            ))}
          </div>
        </Panel>

        <Panel title="Meetings Today" action="View calendar">
          <div className="meeting-timeline">
            {todayMeetings.map(([time, title, duration]) => (
              <article className="meeting-mini" key={title}>
                <strong>{time}</strong>
                <div>
                  <b>{title}</b>
                  <AvatarStack people={["SJ", "EB", "+3"]} />
                </div>
                <small>{duration}</small>
                <button type="button">Open</button>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
