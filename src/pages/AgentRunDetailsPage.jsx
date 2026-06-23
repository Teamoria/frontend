import AppShell, { PageHeader, Panel } from "../components/app/AppShell.jsx";
import { agentSteps } from "../data/teamoriaData.js";

export default function AgentRunDetailsPage() {
  return (
    <AppShell active="Agent Runs">
      <PageHeader
        title="RUN-1042 - Summarize roadmap meeting"
        eyebrow="Full execution trail from authorization to completion."
        actions={<button className="filter-button" type="button">Export Log</button>}
      />

      <section className="run-detail-layout">
        <Panel title="Execution Timeline">
          <div className="run-steps">
            {agentSteps.map(([title, text, status], index) => (
              <article key={title}>
                <span>{index + 1}</span>
                <div>
                  <b>{title}</b>
                  <p>{text}</p>
                </div>
                <em>{status}</em>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Available MCP Tools">
          <div className="tool-grid">
            {["list_tasks", "search_meetings", "get_project_status", "echo_test"].map((tool) => (
              <button type="button" key={tool}>{tool}</button>
            ))}
          </div>
          <p className="muted-copy">Tools are scoped to company, workspace, user role, and project visibility.</p>
        </Panel>
      </section>
    </AppShell>
  );
}
