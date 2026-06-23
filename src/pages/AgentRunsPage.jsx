import AppShell, { PageHeader, Panel } from "../components/app/AppShell.jsx";
import { agentRuns } from "../data/teamoriaData.js";

export default function AgentRunsPage() {
  return (
    <AppShell active="Agent Runs">
      <PageHeader
        title="Agent Runs"
        eyebrow="Track tool execution, context routing, and final AI synthesis."
        actions={<a className="product-button" href="#/agent-run-details">Open Latest Run</a>}
      />
      <div className="agent-grid">
        {agentRuns.map((run) => (
          <Panel key={run.id}>
            <article className="agent-run-card">
              <span className={`run-status run-status--${run.status.toLowerCase()}`}>{run.status}</span>
              <h2>{run.title}</h2>
              <p>{run.id} - {run.owner}</p>
              <div className="agent-meta">
                <span>Tool: {run.tool}</span>
                <span>Duration: {run.duration}</span>
              </div>
              <a className="add-task-link" href="#/agent-run-details">View run details</a>
            </article>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
