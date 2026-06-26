import Brand from "../components/Brand.jsx";
import MarketingHeader from "../components/marketing/MarketingHeader.jsx";

const featureRail = ["Uploads", "Meetings", "AI Chat", "Tasks", "Workspace Graph", "Agent Runs", "Reports", "Permissions"];

const statCards = [
  ["43", "chatbots created"],
  ["286", "tasks extracted"],
  ["1.2k", "AI answers"],
  ["94%", "answers cited"]
];

const overviewCards = [
  ["Product", "See the full AI workspace flow from upload to grounded answer.", "#/product"],
  ["Features", "Explore the exact modules included in the Teamoria platform.", "#/features"],
  ["Solutions", "Understand what each company role sees and controls.", "#/solutions"],
  ["Pricing", "Review simple plans for MVP, business, and enterprise use.", "#/pricing"]
];

const coreScreens = [
  ["Admin Panel", "Platform dashboard, plans, companies, payments, and stats.", "#/Admin", "AD"],
  ["Company Owner", "Company dashboard, team, projects, billing, and settings.", "#/Owner", "OW"],
  ["Manager Workspace", "Assigned workspace, project board, uploads, and AI actions.", "#/Manager", "MG"],
  ["Member Workspace", "My projects, task updates, notes, uploads, and AI answers.", "#/Member", "MB"],
  ["Upload Center", "Upload videos, audio, PDFs, docs, and track AI processing.", "#/uploads", "UP"],
  ["AI Chat", "Ask permission-aware questions with documents and task sources.", "#/ai-chat", "AI"]
];

export default function LandingPage() {
  return (
    <main className="site-page clickup-style-page marketing-clean-page landing-overview-page">
      <MarketingHeader page="home" />

      <section className="saas-hero">
        <div className="saas-hero-copy landing-shell">
          <span className="pill">Teamoria AI Workspace</span>
          <h1>Turn every meeting and document into action.</h1>
          <p>
            Upload videos, audio, PDFs, and docs. Teamoria creates summaries, tasks, specialist chatbots,
            and permission-aware answers for every employee.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="#/signup">Get started. It's free</a>
            <a className="secondary-link" href="#/dashboard">View live demo</a>
          </div>
          <div className="hero-trust-row">
            <span>No credit card</span>
            <span>MVP ready</span>
            <span>Built for teams</span>
          </div>
        </div>
      </section>

      <section className="feature-rail-section">
        <div className="feature-rail landing-shell">
          {featureRail.map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>

      <section className="homepage-map-section landing-shell">
        <div className="section-center">
          <span className="page-kicker">Explore Teamoria</span>
          <h2>Explore the Teamoria platform.</h2>
        </div>
        <div className="homepage-map-grid">
          {overviewCards.map(([title, text, href], index) => (
            <a href={href} key={title}>
              <span>{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="core-screens-section landing-shell">
        <div className="section-title-row">
          <div>
            <span className="page-kicker">Core Screens</span>
            <h2>الشاشات الأساسية للنظام</h2>
          </div>
          <a className="filter-button" href="#/signin">View demo users</a>
        </div>
        <div className="core-screens-grid">
          {coreScreens.map(([title, text, href, icon]) => (
            <a href={href} key={title}>
              <span>{icon}</span>
              <b>{title}</b>
              <p>{text}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="product-preview-section landing-shell">
        <div className="browser-preview">
          <div className="browser-bar">
            <span />
            <span />
            <span />
            <b>teamoria.app/workspace</b>
          </div>
          <div className="preview-grid">
            <aside>
              <Brand compact />
              {["Dashboard", "Upload Center", "AI Chat", "Tasks", "Graph"].map((item, index) => (
                <span className={index === 1 ? "active" : ""} key={item}>{item}</span>
              ))}
            </aside>
            <div className="preview-main">
              <div className="preview-head">
                <div>
                  <small>Upload intelligence</small>
                  <h2>Roadmap_Call.mp4</h2>
                </div>
                <button type="button">Bot Ready</button>
              </div>
              <div className="preview-pipeline">
                {["Upload", "Transcribe", "Summarize", "Extract Tasks", "Create Bot"].map((step, index) => (
                  <article className={index < 4 ? "done" : "current"} key={step}>
                    <span>{index + 1}</span>
                    <b>{step}</b>
                  </article>
                ))}
              </div>
              <div className="preview-lower">
                <article>
                  <b>AI Summary</b>
                  <p>Four tasks, two decisions, and one role-visibility risk were detected.</p>
                </article>
                <article>
                  <b>Specialist Bot</b>
                  <p>Ask: What tasks were assigned to Sarah?</p>
                </article>
                <article>
                  <b>Workspace Graph</b>
                  <p>Files, meetings, employees, and tasks are linked automatically.</p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="saas-stats-section landing-shell">
        {statCards.map(([value, label]) => (
          <article key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>

      <section className="final-cta-section landing-shell">
        <h2>Start building your AI workspace.</h2>
        <p>Give every employee a chatbot grounded in your meetings, files, tasks, and permissions.</p>
        <a className="primary-link" href="#/signup">Create Workspace</a>
      </section>
    </main>
  );
}
