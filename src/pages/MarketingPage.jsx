import MarketingHeader from "../components/marketing/MarketingHeader.jsx";

const coreScreenLinks = [
  ["Admin", "#/Admin"],
  ["Owner", "#/Owner"],
  ["Manager", "#/Manager"],
  ["Member", "#/Member"],
  ["Upload", "#/uploads"],
  ["AI Chat", "#/ai-chat"]
];

function MarketingCta({ title, text, action = "Create Workspace" }) {
  return (
    <section className="marketing-cta-clean">
      <div>
        <span className="page-kicker">Teamoria AI Workspace</span>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <a className="primary-link" href="#/signup">{action}</a>
    </section>
  );
}

function CoreScreensStrip() {
  return (
    <section className="marketing-core-strip">
      <div>
        <span className="page-kicker">Live Screens</span>
        <h2>Open the real product views.</h2>
      </div>
      <div>
        {coreScreenLinks.map(([label, href]) => (
          <a href={href} key={label}>{label}</a>
        ))}
      </div>
    </section>
  );
}

function ProductPage() {
  const tour = [
    ["01", "Upload intelligence", "Convert video, audio, PDFs, docs, and images into searchable workspace memory."],
    ["02", "Meeting understanding", "Generate transcripts, summaries, decisions, and follow-up tasks from every meeting."],
    ["03", "Specialized AI bots", "Create a bot per file, meeting, or workspace with source-grounded answers."],
    ["04", "Execution graph", "Connect people, tasks, meetings, files, and permissions in one operational map."]
  ];

  return (
    <>
      <section className="marketing-hero-split product-hero">
        <div>
          <span className="pill">Product Tour</span>
          <h1>Run meetings, documents, tasks, and company knowledge from one AI workspace.</h1>
          <p>
            Teamoria gives every company a clean place to upload knowledge, extract work, ask grounded questions, and see project context without losing permissions.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="#/signup">Start workspace</a>
            <a className="secondary-link" href="#/dashboard">Open demo</a>
          </div>
        </div>
        <div className="product-console">
          <div className="mini-browser-bar"><span /><span /><span /><b>Teamoria Command Center</b></div>
          <div className="console-grid">
            <article className="console-panel wide">
              <span>AI Upload</span>
              <h3>Roadmap meeting.mp4</h3>
              <div className="processing-line"><i style={{ width: "82%" }} /></div>
              <p>Transcript, action items, bot, and citations are ready.</p>
            </article>
            <article className="console-panel">
              <span>Tasks</span>
              <strong>18</strong>
              <p>Extracted this week</p>
            </article>
            <article className="console-panel">
              <span>Bots</span>
              <strong>43</strong>
              <p>Knowledge assistants</p>
            </article>
            <article className="console-panel wide">
              <span>Grounded answer</span>
              <p>Sarah owns the permission review and needs finance approval before Friday.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="product-tour-section">
        <div className="section-title-row">
          <span className="page-kicker">How it works</span>
          <h2>From raw company input to usable execution.</h2>
        </div>
        <div className="product-tour-grid">
          {tour.map(([step, title, text]) => (
            <article key={step}>
              <span>{step}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="platform-layers">
        {["React frontend", "FastAPI backend", "OpenAI + Pinecone + PostgreSQL"].map((item, index) => (
          <article key={item}>
            <span>{index + 1}</span>
            <h3>{item}</h3>
            <p>{index === 0 ? "A polished user interface for every role." : index === 1 ? "Auth, routing, scoping, uploads, and agents." : "Grounded answers, vector search, and persistent storage."}</p>
          </article>
        ))}
      </section>

      <CoreScreensStrip />

      <MarketingCta
        title="Build the product experience your team can actually use."
        text="Start with the full visual MVP, then connect APIs when the backend is ready."
      />
    </>
  );
}

function FeaturesPage() {
  const features = [
    ["Upload Center", "Drag and drop files, show AI processing stages, and prepare source bots."],
    ["AI Chat", "Ask workspace-specific questions with citations and suggested prompts."],
    ["Meeting AI", "Transcription, summaries, sentiment, decisions, and action items."],
    ["Task Hub", "Kanban, list, calendar modes, priorities, due dates, and AI source badges."],
    ["Agent Runs", "Visualize authorization, tool calls, step logs, and final synthesis."],
    ["Workspace Graph", "Interactive relationships between files, people, projects, and meetings."],
    ["Permissions", "Role-based views for admins, executives, project managers, and employees."],
    ["Reports", "Readable AI analytics for leadership and project visibility."]
  ];

  return (
    <>
      <section className="marketing-feature-hero">
        <span className="pill">Feature System</span>
        <h1>Every Teamoria feature has a clear job.</h1>
        <p>
          Instead of repeating the same story, this page shows the actual feature set your platform includes and what each part does.
        </p>
      </section>

      <section className="feature-matrix-section">
        <div className="feature-matrix-grid">
          {features.map(([title, text]) => (
            <article key={title}>
              <span>AI</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="comparison-section">
        <article>
          <span>Before Teamoria</span>
          <h2>Work is scattered.</h2>
          <p>Meetings stay in recordings, PDFs stay unread, decisions disappear, and employees ask the same questions repeatedly.</p>
        </article>
        <article className="active">
          <span>With Teamoria</span>
          <h2>Knowledge becomes action.</h2>
          <p>Files become bots, meetings become tasks, answers include sources, and every role sees only what they are allowed to see.</p>
        </article>
      </section>

      <CoreScreensStrip />

      <MarketingCta
        title="Turn the feature list into a working SaaS demo."
        text="Use the existing visual pages to present the full AI workspace story with confidence."
        action="View live demo"
      />
    </>
  );
}

function SolutionsPage() {
  const roles = [
    ["Company Admin", "Manage companies, users, roles, workspace access, and AI governance.", "Users, permissions, security"],
    ["General Manager", "See project health, extracted decisions, risks, and cross-company reporting.", "Reports, dashboards, insights"],
    ["Project Manager", "Track meetings, AI tasks, team workload, and delivery follow-ups.", "Tasks, meetings, uploads"],
    ["Employee", "Ask trusted questions about assigned files, meetings, and tasks.", "AI chat, personal tasks, profile"]
  ];

  return (
    <>
      <section className="solutions-hero">
        <div>
          <span className="pill">Role-Based Platform</span>
          <h1>Different roles. Different pages. One connected company brain.</h1>
          <p>
            Teamoria should not show the same workspace to everyone. Each role gets the pages, actions, and knowledge scope that match their responsibility.
          </p>
        </div>
        <div className="role-orbit">
          {roles.map(([role], index) => <span className={`role-dot dot-${index}`} key={role}>{role}</span>)}
        </div>
      </section>

      <section className="solution-role-section">
        <div className="solution-role-grid">
          {roles.map(([role, text, access]) => (
            <article key={role}>
              <span>{access}</span>
              <h3>{role}</h3>
              <p>{text}</p>
              <a href="#/signup">Configure role</a>
            </article>
          ))}
        </div>
      </section>

      <section className="role-workflow-strip">
        {["Company setup", "Workspace scope", "AI source access", "Task visibility", "Reports"].map((item, index) => (
          <article key={item}>
            <span>{index + 1}</span>
            <b>{item}</b>
          </article>
        ))}
      </section>

      <CoreScreensStrip />

      <MarketingCta
        title="Design the platform around real company responsibilities."
        text="Admins control structure, managers see outcomes, and employees get focused help without permission leaks."
      />
    </>
  );
}

function PricingPage() {
  const plans = [
    ["Starter", "$0", "For MVP demos and small validation teams.", ["Upload demo files", "AI task previews", "Basic dashboard", "Single workspace"]],
    ["Business", "$19", "For teams running real projects and meetings.", ["Unlimited workspaces", "Meeting AI", "Role permissions", "Reports and graphs"]],
    ["Enterprise", "Custom", "For multi-company deployments and governance.", ["Advanced security", "Custom AI limits", "Dedicated support", "Company-level controls"]]
  ];

  return (
    <>
      <section className="pricing-hero-clean">
        <span className="pill">Pricing</span>
        <h1>Simple plans without repeating the marketing pages.</h1>
        <p>Choose the level that matches how much AI workspace intelligence the company needs today.</p>
      </section>

      <section className="pricing-plans-clean">
        {plans.map(([name, price, text, features], index) => (
          <article className={index === 1 ? "plan-card featured" : "plan-card"} key={name}>
            <span>{index === 1 ? "Most useful" : "Teamoria"}</span>
            <h2>{name}</h2>
            <strong>{price}</strong>
            <p>{text}</p>
            <ul>
              {features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <a className={index === 1 ? "primary-link" : "secondary-link"} href="#/signup">Start plan</a>
          </article>
        ))}
      </section>

      <section className="pricing-note-strip">
        <article>
          <span>AI usage</span>
          <p>Usage can be priced by processed hours, storage, or generated answers later.</p>
        </article>
        <article>
          <span>Security</span>
          <p>Role visibility and company boundaries stay central to every plan.</p>
        </article>
        <article>
          <span>MVP ready</span>
          <p>The frontend can show the complete buying story before backend billing exists.</p>
        </article>
      </section>

      <CoreScreensStrip />
    </>
  );
}

const pageMap = {
  product: ProductPage,
  features: FeaturesPage,
  solutions: SolutionsPage,
  pricing: PricingPage
};

export default function MarketingPage({ page }) {
  const Page = pageMap[page] || ProductPage;

  return (
    <main className="site-page marketing-page-v2 marketing-clean-page">
      <MarketingHeader page={page} />
      <Page />
    </main>
  );
}
