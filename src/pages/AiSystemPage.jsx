import AppShell, { PageHeader, Panel } from "../components/app/AppShell.jsx";
import {
  aiArchitectureFlows,
  aiFutureImprovements,
  aiLimitations,
  aiToolingMap,
  mcpToolCatalog
} from "../data/teamoriaData.js";

const architectureNodes = [
  { x: 120, y: 90, label: "React Frontend", tone: "blue" },
  { x: 350, y: 90, label: "PHP Backend", tone: "violet" },
  { x: 580, y: 90, label: "Service Router", tone: "green" },
  { x: 220, y: 260, label: "Upload Processing", tone: "amber" },
  { x: 420, y: 260, label: "RAG Chat", tone: "blue" },
  { x: 620, y: 260, label: "Agent Service", tone: "violet" },
  { x: 420, y: 420, label: "Workspace Graph", tone: "green" }
];

const architectureLines = [
  [210, 90, 260, 90],
  [440, 90, 490, 90],
  [560, 118, 250, 232],
  [580, 124, 420, 232],
  [600, 124, 620, 232],
  [620, 292, 455, 392],
  [220, 292, 385, 392],
  [420, 292, 420, 392]
];

export default function AiSystemPage() {
  return (
    <AppShell active="AI System">
      <PageHeader
        title="Teamoria AI System"
        eyebrow="Algorithms, tools, services, and architecture flows from the full system documentation."
        actions={(
          <>
            <a className="filter-button" href="#/uploads">Upload Pipeline</a>
            <a className="filter-button" href="#/ai-chat">RAG Chat</a>
            <a className="product-button" href="#/agent-runs">Agent Runs</a>
          </>
        )}
      />

      <section className="ai-system-hero">
        <Panel title="System Architecture">
          <svg className="ai-architecture-map" viewBox="0 0 740 500" role="img" aria-label="Teamoria AI architecture map">
            {architectureLines.map(([x1, y1, x2, y2]) => (
              <line x1={x1} y1={y1} x2={x2} y2={y2} key={`${x1}-${y1}-${x2}-${y2}`} />
            ))}
            {architectureNodes.map((node) => (
              <SystemNode key={node.label} {...node} />
            ))}
          </svg>
        </Panel>

        <Panel title="Tooling Map">
          <div className="tooling-table">
            <div className="tooling-row tooling-row--head">
              <span>Area</span>
              <span>Main file</span>
              <span>Tool</span>
              <span>Algorithm</span>
            </div>
            {aiToolingMap.map(([area, file, tool, algorithm]) => (
              <div className="tooling-row" key={area}>
                <b>{area}</b>
                <code>{file}</code>
                <span>{tool}</span>
                <span>{algorithm}</span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="ai-flow-grid">
        {aiArchitectureFlows.map((flow, index) => (
          <article className="diagram-card ai-flow-card" key={flow.title}>
            <span className={`flow-index flow-index--${index % 4}`}>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <b>{flow.title}</b>
              <p>{flow.summary}</p>
            </div>
            <div className="flow-node-list">
              {flow.nodes.map((node, nodeIndex) => (
                <span key={`${flow.title}-${node}`}>{nodeIndex + 1}. {node}</span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="ai-system-lower">
        <Panel title="MCP Tool Integration">
          <div className="mcp-tool-list">
            {mcpToolCatalog.map(([name, description]) => (
              <article key={name}>
                <code>{name}</code>
                <span>{description}</span>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Current AI Limitations">
          <div className="limitation-list">
            {aiLimitations.map(([title, description]) => (
              <article key={title}>
                <b>{title}</b>
                <span>{description}</span>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Future Improvements">
          <div className="future-list">
            {aiFutureImprovements.map((item, index) => (
              <article key={item}>
                <span>{index + 1}</span>
                <b>{item}</b>
              </article>
            ))}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}

function SystemNode({ x, y, label, tone }) {
  return (
    <g className={`system-node system-node--${tone}`}>
      <rect x={x - 88} y={y - 30} width="176" height="60" rx="8" />
      <text x={x} y={y + 5}>{label}</text>
    </g>
  );
}
