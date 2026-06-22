import AppShell, { AvatarStack, Panel, StatCard } from "../components/app/AppShell.jsx";
import { dashboardStats, recentTasks, todayMeetings } from "../data/teamoriaData.js";

export default function DashboardPage() {
  return (
    <AppShell active="Dashboard">
      <div className="product-page-head">
        <div>
          <h1>Good morning, Sarah 👋</h1>
          <p>Here's what's happening with your projects today.</p>
        </div>
      </div>

      <div className="stats-grid-modern">
        {dashboardStats.map((item) => <StatCard item={item} key={item.label} />)}
      </div>

      <div className="dashboard-grid-modern">
        <Panel title="Project Progress">
          <div className="modern-chart">
            <div className="chart-grid-lines" />
            <i className="chart-line" style={{ "--line-color": "#4c36ef", "--top": "64px", "--angle": "-10deg" }} />
            <i className="chart-line" style={{ "--line-color": "#8a5cff", "--top": "92px", "--angle": "-8deg" }} />
            <i className="chart-line" style={{ "--line-color": "#39aee8", "--top": "112px", "--angle": "-7deg" }} />
            <div className="chart-legend">
              <span>Website Redesign</span>
              <span>Mobile App</span>
              <span>AI Dashboard</span>
            </div>
          </div>
        </Panel>

        <Panel className="ai-recommendation">
          <h2>✦ AI Recommendation</h2>
          <h3>Focus on high-impact tasks</h3>
          <p>Your team's velocity is highest when focusing on 2-3 priority tasks. Consider reducing WIP to improve delivery speed by 23%.</p>
          <a className="white-action" href="#/ai-chat">View Insights →</a>
        </Panel>
      </div>

      <div className="dashboard-lower-grid">
        <Panel title="Recent Tasks" action="View all tasks">
          <div className="task-table">
            {recentTasks.map(([task, project, date, priority], index) => (
              <label className="task-row" key={task}>
                <input defaultChecked={index === 1} type="checkbox" />
                <b>{task}</b>
                <span>{project}</span>
                <span>{date}</span>
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
                <button type="button">▣</button>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
