import AppShell, { PageHeader, Panel } from "../components/app/AppShell.jsx";

const pageCopy = {
  "Upload Center": {
    title: "Upload Center",
    text: "Upload files and track AI processing.",
    items: ["PDF, DOCX, TXT support", "Audio and video processing", "OCR pipeline", "Indexed source metadata"]
  },
  "AI Chat": {
    title: "AI Chat",
    text: "Ask questions about workspace knowledge with permission-aware citations.",
    items: ["RAG retrieval", "Context builder", "Source ranking", "Saved conversations"]
  },
  Employees: {
    title: "Employees",
    text: "Manage users, roles, and activity.",
    items: ["Employee list", "Employee profile", "Search and filters", "Role assignment"]
  },
  Reports: {
    title: "Reports",
    text: "MVP analytics for projects, tasks, meetings, and employees.",
    items: ["Analytics charts", "Export PDF", "Export Excel", "Audit logs"]
  }
};

export default function WorkspacePlaceholderPage({ active }) {
  const copy = pageCopy[active] || pageCopy.Reports;

  return (
    <AppShell active={active}>
      <PageHeader
        title={copy.title}
        eyebrow={copy.text}
        actions={<button className="product-button" type="button">＋ New</button>}
      />
      <div className="dashboard-grid-modern">
        <Panel title={`${copy.title} roadmap`}>
          <div className="foundation-grid">
            {copy.items.map((item) => (
              <article key={item}>
                <b>{item}</b>
                <p>Prepared from the Teamoria MVP prototype and ready for the next sprint implementation.</p>
              </article>
            ))}
          </div>
        </Panel>
        <Panel className="ai-recommendation">
          <h2>✦ AI-ready module</h2>
          <h3>{copy.title} connects to Teamoria intelligence</h3>
          <p>This screen keeps the same interface system while the backend and AI pipelines are added sprint by sprint.</p>
          <a className="white-action" href="#/dashboard">Back to Dashboard →</a>
        </Panel>
      </div>
    </AppShell>
  );
}
