import Brand from "../components/Brand.jsx";

const menu = ["Overview", "Projects", "Tasks", "AI Insights", "Timeline", "Resources", "Reports", "Team", "Integrations", "Settings"];
const projects = [
  ["Phoenix Website Redesign", "Design", "84%", "On track"],
  ["Mobile App Launch", "Engineering", "61%", "At risk"],
  ["Q2 Marketing Campaign", "Marketing", "42%", "Review"]
];

export default function DashboardPage() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Brand compact />
        <nav>
          {menu.map((item, index) => <a className={index === 0 ? "active" : ""} href="#/dashboard" key={item}>{item}</a>)}
        </nav>
      </aside>
      <section className="workspace">
        <header className="workspace-head">
          <div>
            <h1>Good morning, Alex</h1>
            <p>Here's what's happening with your projects today.</p>
          </div>
          <input placeholder="Search anything..." />
        </header>
        <div className="metric-row dashboard-metrics">
          <div><strong>24</strong><span>Projects</span></div>
          <div><strong>128</strong><span>Tasks Completed</span></div>
          <div><strong>85%</strong><span>On Track</span></div>
          <div><strong>6</strong><span>At Risk</span></div>
        </div>
        <div className="workspace-grid">
          <section className="panel chart-large">
            <h2>Project Progress</h2>
            <div className="line-chart big">
              <i />
              <i />
              <i />
            </div>
          </section>
          <section className="panel">
            <h2>AI Insight</h2>
            <p>The Phoenix Project needs 5 more design hours this week to stay on schedule.</p>
            <button type="button">View Recommendation</button>
          </section>
          <section className="panel">
            <h2>Tasks by Status</h2>
            <div className="donut large">128</div>
          </section>
          <section className="panel">
            <h2>Team Workload</h2>
            <div className="bars tall">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </section>
          <section className="panel project-list">
            <h2>Upcoming Projects</h2>
            {projects.map(([name, team, progress, status]) => (
              <article key={name}>
                <div>
                  <b>{name}</b>
                  <span>{team}</span>
                </div>
                <strong>{progress}</strong>
                <em>{status}</em>
              </article>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
