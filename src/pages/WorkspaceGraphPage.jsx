import AppShell, { PageHeader, Panel } from "../components/app/AppShell.jsx";

export default function WorkspaceGraphPage() {
  return (
    <AppShell active="Workspace Graph">
      <PageHeader
        title="Workspace Graph"
        eyebrow="Interactive visibility map for employees, tasks, files, notes, and dependencies."
        actions={(
          <>
            <button className="filter-button" type="button">Zoom In</button>
            <button className="filter-button" type="button">Expand Nodes</button>
          </>
        )}
      />

      <section className="graph-layout">
        <Panel title="Filters">
          <div className="graph-filters">
            {["Employees", "Tasks", "Files", "Meetings", "Dependencies", "Risks"].map((filter, index) => (
              <label key={filter}><input defaultChecked={index < 4} type="checkbox" /> {filter}</label>
            ))}
          </div>
        </Panel>

        <Panel className="graph-panel">
          <svg className="workspace-graph" viewBox="0 0 900 520" role="img" aria-label="Workspace graph">
            <line x1="450" y1="95" x2="220" y2="235" />
            <line x1="450" y1="95" x2="450" y2="245" />
            <line x1="450" y1="95" x2="680" y2="235" />
            <line x1="220" y1="235" x2="180" y2="390" />
            <line x1="220" y1="235" x2="350" y2="392" />
            <line x1="450" y1="245" x2="525" y2="390" />
            <line x1="680" y1="235" x2="720" y2="390" />
            <GraphNode x="450" y="80" label="AI Platform Workspace" tone="blue" />
            <GraphNode x="220" y="235" label="Ahmed - Admin" tone="green" />
            <GraphNode x="450" y="245" label="Sprint Tasks" tone="violet" />
            <GraphNode x="680" y="235" label="Meeting Files" tone="amber" />
            <GraphNode x="180" y="390" label="Permissions" tone="soft" />
            <GraphNode x="350" y="392" label="Agent Logs" tone="soft" />
            <GraphNode x="525" y="390" label="Blocked Task" tone="danger" />
            <GraphNode x="720" y="390" label="Source Chunks" tone="soft" />
          </svg>
        </Panel>
      </section>
    </AppShell>
  );
}

function GraphNode({ x, y, label, tone }) {
  return (
    <g className={`graph-node graph-node--${tone}`}>
      <rect x={x - 92} y={y - 28} width="184" height="56" rx="8" />
      <text x={x} y={y + 5}>{label}</text>
    </g>
  );
}
