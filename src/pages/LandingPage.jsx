import Brand from "../components/Brand.jsx";
import MarketingHeader from "../components/marketing/MarketingHeader.jsx";

const featureRail = ["Upload intelligence", "Meeting memory", "AI copilots", "Task extraction", "Permission control", "Executive reports"];

const statCards = [
  ["12 min", "from upload to searchable knowledge"],
  ["94%", "answers include trusted citations"],
  ["286", "tasks extracted from meetings"],
  ["4 roles", "with permission-aware workspaces"]
];

const capabilityCards = [
  ["01", "Capture", "Upload videos, audio, PDFs, docs, and images into one governed company memory."],
  ["02", "Understand", "Generate summaries, decisions, risks, and follow-up work from every source."],
  ["03", "Execute", "Turn knowledge into assigned tasks, role dashboards, and measurable delivery flow."],
  ["04", "Answer", "Give every employee an AI workspace that responds with scoped, cited answers."]
];

const workflowSteps = [
  ["Upload", "Roadmap_Call.mp4 received"],
  ["Transcribe", "Speakers and timeline detected"],
  ["Summarize", "Decisions and risks extracted"],
  ["Assign", "Tasks routed by role"],
  ["Answer", "Workspace bot ready"]
];

const assuranceItems = [
  "Role-based visibility",
  "Source-grounded answers",
  "Company workspace graph",
  "Operational dashboards"
];

export default function LandingPage() {
  return (
    <main className="site-page clickup-style-page marketing-clean-page landing-overview-page">
      <MarketingHeader page="home" />

      <section className="saas-hero">
        <div className="saas-hero-copy">
          <span className="pill">Teamoria Enterprise AI Workspace</span>
          <h1>Turn company knowledge into measurable execution.</h1>
          <p>
            Teamoria transforms meetings, files, and project context into summaries, assigned tasks,
            specialist AI copilots, and permission-aware answers for every role in the company.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="#/signup">Start workspace</a>
            <a className="secondary-link" href="#/dashboard">View executive demo</a>
          </div>
          <div className="hero-trust-row">
            {assuranceItems.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div className="hero-product-console" aria-label="Teamoria product preview">
          <div className="hero-console-top">
            <Brand compact />
            <span>Live workspace</span>
          </div>
          <div className="hero-console-grid">
            <article className="hero-console-main">
              <small>Upload intelligence</small>
              <h2>Roadmap_Call.mp4</h2>
              <p>Four tasks, two decisions, one delivery risk, and a specialist chatbot were created from the meeting.</p>
              <div className="hero-progress-track"><span /></div>
            </article>
            <article>
              <small>AI answer quality</small>
              <strong>94%</strong>
              <p>Responses cite approved workspace sources.</p>
            </article>
            <article>
              <small>New tasks</small>
              <strong>18</strong>
              <p>Assigned to project managers and employees.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="feature-rail-section">
        <div className="feature-rail">
          {featureRail.map((item) => <span key={item}>{item}</span>)}
        </div>
      </section>

      <section className="homepage-map-section landing-capabilities-section">
        <div className="section-center">
          <span className="page-kicker">One workspace operating system</span>
          <h2>From raw meetings and documents to accountable work.</h2>
        </div>
        <div className="homepage-map-grid">
          {capabilityCards.map(([number, title, text]) => (
            <article key={title}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="product-preview-section">
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
                  <small>Executive workspace</small>
                  <h2>AI Platform Launch</h2>
                </div>
                <button type="button">Board Ready</button>
              </div>
              <div className="preview-pipeline">
                {workflowSteps.map(([step, detail], index) => (
                  <article className={index < 4 ? "done" : "current"} key={step}>
                    <span>{index + 1}</span>
                    <b>{step}</b>
                    <small>{detail}</small>
                  </article>
                ))}
              </div>
              <div className="preview-lower">
                <article>
                  <b>Leadership Summary</b>
                  <p>Delivery priorities, blockers, and decisions are presented in one readable brief.</p>
                </article>
                <article>
                  <b>Specialist Copilot</b>
                  <p>Ask role-scoped questions with answers grounded in the approved workspace.</p>
                </article>
                <article>
                  <b>Execution Graph</b>
                  <p>People, files, meetings, projects, and tasks stay connected automatically.</p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="saas-stats-section">
        {statCards.map(([value, label]) => (
          <article key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>

      <section className="final-cta-section">
        <h2>Build the workspace your client can defend with confidence.</h2>
        <p>Show a platform that turns scattered knowledge into governed AI, operational clarity, and real execution.</p>
        <a className="primary-link" href="#/signup">Create Workspace</a>
      </section>
    </main>
  );
}
