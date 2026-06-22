import Brand from "./Brand.jsx";

export default function AuthLayout({ variant = "analytics", title, text, children }) {
  return (
    <main className={`auth-shell auth-shell--${variant}`}>
      <aside className={`auth-visual auth-visual--${variant}`}>
        <Brand />
        <div className="auth-copy">
          <h1>{title}</h1>
          <p>{text}</p>
        </div>
        {variant === "security" ? <SecurityArtwork /> : <AnalyticsArtwork />}
      </aside>
      <section className="auth-panel">{children}</section>
    </main>
  );
}

function AnalyticsArtwork() {
  return (
    <div className="analytics-art" aria-hidden="true">
      <div className="orb orb-a" />
      <div className="cube cube-a" />
      <div className="cube cube-b" />
      <div className="mini-card ai-card">
        <b>AI Insights</b>
        <span>Projects on track</span>
        <strong>92%</strong>
        <div className="sparkline" />
      </div>
      <div className="timeline-card">
        <b>Project Timeline</b>
        {["Planning", "Design", "Development", "Testing", "Launch"].map((item, index) => (
          <div className="timeline-row" key={item}>
            <span>{item}</span>
            <i style={{ "--offset": index, "--width": 30 + index * 7 }} />
          </div>
        ))}
      </div>
      <div className="mini-card workload-card">
        <b>Team Workload</b>
        <div className="avatar-row">
          <span />
          <span />
          <span />
          <span />
          <em>+3</em>
        </div>
      </div>
      <div className="mini-card tasks-card">
        <b>Tasks Completed</b>
        <strong>1,248</strong>
        <span>+18% vs last week</span>
      </div>
    </div>
  );
}

function SecurityArtwork() {
  return (
    <div className="security-art" aria-hidden="true">
      <div className="shield">
        <div className="lock">
          <span />
        </div>
      </div>
      <div className="check-badge">OK</div>
      <div className="user-badge">U</div>
      <div className="password-dots">***</div>
    </div>
  );
}
