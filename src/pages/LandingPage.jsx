import Brand from "../components/Brand.jsx";

const features = [
  ["AI-Powered Planning", "Let AI break down goals, estimate timelines, and build the perfect project plan."],
  ["Smart Task Management", "Create, prioritize, and assign tasks with intelligent suggestions and automation."],
  ["Real-time Collaboration", "Communicate, share updates, and collaborate in one connected workspace."],
  ["Advanced Analytics", "Get real-time insights into progress, performance, and project health."],
  ["Resource Optimization", "Balance workloads and allocate resources to maximize team productivity."],
  ["Seamless Integrations", "Connect with your favorite tools and sync data across your ecosystem."]
];

const stats = [
  ["10,000+", "Teams Trust Teamoria"],
  ["98%", "Project Success Rate"],
  ["45%", "Faster Project Delivery"],
  ["4.9/5", "Customer Satisfaction"],
  ["50+", "Countries Worldwide"]
];

export default function LandingPage() {
  return (
    <main className="site-page">
      <header className="topbar">
        <Brand compact />
        <nav>
          <a href="#/">Product</a>
          <a href="#/">Features</a>
          <a href="#/">Solutions</a>
          <a href="#/">Resources</a>
          <a href="#/">Pricing</a>
        </nav>
        <div className="topbar-actions">
          <a href="#/signin">Log in</a>
          <a className="small-primary" href="#/signup">Get Started</a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="pill">AI - The Intelligent Project Nervous System</span>
          <h1>Transform the Way Your Team Manages Projects <span>with AI</span></h1>
          <p>
            Teamoria is the intelligent hub that connects your people, projects, and data-helping your team plan smarter, execute faster, and deliver extraordinary results.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="#/signup">Get Started <span>-&gt;</span></a>
            <a className="secondary-link" href="#/dashboard">Request Demo</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card floating-card--schedule">
            <b>AI Schedule</b>
            <span>Optimized 3 tasks</span>
            <i />
          </div>
          <div className="floating-card floating-card--risk">
            <b>Risk Detected</b>
            <span>Web Redesign High Risk</span>
            <i />
          </div>
          <div className="floating-card floating-card--pulse">
            <b>Team Pulse</b>
            <span>High Productivity</span>
            <i />
          </div>
          <DashboardMockup />
        </div>
      </section>

      <section className="features">
        <h2>Everything your team needs to ship great work</h2>
        <div className="feature-grid">
          {features.map(([title, copy], index) => (
            <article className="feature-card" key={title}>
              <span>{["AI", "TM", "CO", "AN", "RO", "IN"][index]}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="stats-band">
        {stats.map(([value, label], index) => (
          <div key={label}>
            <span>{["T", "P", "F", "S", "G"][index]}</span>
            <strong>{value}</strong>
            <small>{label}</small>
          </div>
        ))}
      </section>
    </main>
  );
}

function DashboardMockup() {
  return (
    <div className="dashboard-mockup" aria-hidden="true">
      <aside>
        <Brand compact />
        {["Overview", "Projects", "Tasks", "AI Insights", "Timeline", "Resources", "Reports", "Team", "Settings"].map((item, index) => (
          <span className={index === 0 ? "active" : ""} key={item}>{item}</span>
        ))}
      </aside>
      <div className="mock-content">
        <div className="mock-head">
          <b>Good morning, Alex</b>
          <span>Search anything...</span>
        </div>
        <div className="metric-row">
          {["24 Projects", "128 Tasks Completed", "85% On Track", "6 At Risk"].map((item) => (
            <div key={item}>{item}</div>
          ))}
        </div>
        <div className="chart-panel">
          <b>Project Progress</b>
          <div className="line-chart">
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="mock-grid">
          <div className="donut">128</div>
          <div className="bars">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="insight-box">
            <b>AI Insight</b>
            <p>The Phoenix Project is at risk of missing its deadline by 5 days.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
