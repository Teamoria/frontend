import MarketingHeader from "../components/marketing/MarketingHeader.jsx";

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

function ProductPage() {
  const tour = [
    ["01", "Ingest company knowledge", "Bring meetings, documents, audio, video, and project files into a governed workspace."],
    ["02", "Extract operational context", "Identify summaries, decisions, risks, owners, and due work from every uploaded source."],
    ["03", "Route work by responsibility", "Turn knowledge into scoped tasks, role dashboards, and permission-aware action."],
    ["04", "Answer with evidence", "Give teams AI responses grounded in approved company sources, not generic guesses."]
  ];

  return (
    <>
      <section className="marketing-hero-split product-hero">
        <div>
          <span className="pill">Product Platform</span>
          <h1>One workspace where knowledge becomes execution.</h1>
          <p>
            Teamoria connects uploads, meetings, employees, projects, tasks, and AI copilots into one operating layer for modern teams.
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
              <span>Workspace intelligence</span>
              <h3>AI Platform Launch</h3>
              <div className="processing-line"><i style={{ width: "82%" }} /></div>
              <p>Meeting brief, action board, source citations, and specialist copilots are ready.</p>
            </article>
            <article className="console-panel">
              <span>Open tasks</span>
              <strong>18</strong>
              <p>Routed by role</p>
            </article>
            <article className="console-panel">
              <span>AI copilots</span>
              <strong>43</strong>
              <p>Grounded assistants</p>
            </article>
            <article className="console-panel wide">
              <span>Permission-aware answer</span>
              <p>The launch risk is tied to API authorization review and the finance approval dependency due Friday.</p>
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
        {["Experience layer", "Operations engine", "Knowledge intelligence"].map((item, index) => (
          <article key={item}>
            <span>{index + 1}</span>
            <h3>{item}</h3>
            <p>{index === 0 ? "A polished workspace for every role and workflow." : index === 1 ? "Secure routing, access control, uploads, tasks, and agent activity." : "Grounded answers, search, citations, and company memory."}</p>
          </article>
        ))}
      </section>

      <MarketingCta
        title="Give every team a workspace that knows the work."
        text="Teamoria turns operational knowledge into tasks, answers, reports, and trusted company context."
      />
    </>
  );
}

function FeaturesPage() {
  const features = [
    ["Upload Intelligence", "Process files, recordings, and documents into structured workspace memory."],
    ["Grounded AI Chat", "Ask questions with source citations, scoped access, and suggested next steps."],
    ["Meeting Understanding", "Convert calls into transcripts, decisions, risks, summaries, and follow-up work."],
    ["Task Command", "Manage extracted and manual work through priorities, owners, deadlines, and AI context."],
    ["Agent Runs", "Track AI execution with authorization, tool calls, step logs, and final synthesis."],
    ["Workspace Graph", "See how people, projects, files, meetings, and tasks connect across the company."],
    ["Governed Permissions", "Keep every page and answer aligned with company, role, project, and workspace scope."],
    ["Executive Reports", "Give leadership readable insight into project health, knowledge usage, and delivery risks."]
  ];

  return (
    <>
      <section className="marketing-feature-hero">
        <span className="pill">Feature System</span>
        <h1>Enterprise AI features built around real work.</h1>
        <p>
          Each module has a specific role in the operational workflow: capture knowledge, understand it, protect it, and convert it into action.
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

      <MarketingCta
        title="Bring AI into the workflow without losing control."
        text="Teamoria gives teams speed, traceability, and permissions in the same product experience."
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
          <h1>Every role gets the right workspace, context, and control.</h1>
          <p>
            Teamoria adapts the product experience to company admins, executives, project managers, and employees while keeping knowledge boundaries intact.
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

      <MarketingCta
        title="Design AI around company responsibility."
        text="Admins control governance, managers see outcomes, and employees get focused answers without permission leaks."
      />
    </>
  );
}

function PricingPage() {
  const plans = [
    ["Starter", "$0", "For focused pilots and small validation teams.", ["Upload sample files", "AI task previews", "Basic dashboard", "Single workspace"]],
    ["Business", "$19", "For teams running real projects and meetings.", ["Unlimited workspaces", "Meeting AI", "Role permissions", "Reports and graphs"]],
    ["Enterprise", "Custom", "For multi-company deployments and governance.", ["Advanced security", "Custom AI limits", "Dedicated support", "Company-level controls"]]
  ];

  return (
    <>
      <section className="pricing-hero-clean">
        <span className="pill">Pricing</span>
        <h1>Plans that scale from pilot workspace to enterprise deployment.</h1>
        <p>Choose the operating level that matches your team size, governance needs, and AI knowledge volume.</p>
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
          <p>AI capacity can scale by processed hours, storage, source volume, and generated answers.</p>
        </article>
        <article>
          <span>Security</span>
          <p>Role visibility and company boundaries stay central to every plan.</p>
        </article>
        <article>
          <span>Pilot ready</span>
          <p>Start with a focused workspace and expand into governed company-wide intelligence.</p>
        </article>
      </section>
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
