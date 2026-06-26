import AppShell, { AvatarStack, Badge, PageHeader, Panel } from "../components/app/AppShell.jsx";
import { projects, recentTasks, uploads } from "../data/teamoriaData.js";

export default function ProjectDetailsFlowPage() {
  const project = projects[0];
  return (
    <AppShell active="My Projects" roleId="manager">
      <PageHeader
        title={project.title}
        eyebrow="Project details, assigned team, tasks, uploads, and AI knowledge in one scoped workspace."
        actions={(
          <>
            <a className="filter-button" href="#/tasks">Open Board</a>
            <a className="filter-button" href="#/uploads">Upload File</a>
            <a className="product-button" href="#/ai-chat">Ask AI</a>
          </>
        )}
      />

      <div className="workspace-tabs">
        {["Overview", "Team", "Tasks", "Uploads", "AI Context"].map((tab, index) => (
          <button className={index === 0 ? "active" : ""} type="button" key={tab}>{tab}</button>
        ))}
      </div>

      <section className="workspace-detail-grid">
        <Panel title="Overview">
          <div className="workspace-hero-card">
            <span className={`project-icon accent-${project.accent}`}>{project.icon}</span>
            <div>
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              <div className="progress-row">
                <div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div>
                <b>{project.progress}%</b>
              </div>
            </div>
            <Badge>{project.health}</Badge>
          </div>
        </Panel>

        <Panel title="Assigned Team">
          <AvatarStack people={project.team} />
          <div className="permission-grid">
            {["Owner can configure billing", "Manager can create tasks", "Member can update status", "AI answers use project scope"].map((item) => (
              <article key={item}><b>{item}</b><span>Permission-aware access</span></article>
            ))}
          </div>
        </Panel>

        <Panel title="Project Tasks">
          <div className="task-table">
            {recentTasks.slice(0, 4).map(([task, source, date, priority]) => (
              <label className="task-row" key={task}>
                <input type="checkbox" />
                <b>{task}</b>
                <span>{source}</span>
                <span>{date}</span>
                <em className={`priority priority--${priority}`}>{priority}</em>
              </label>
            ))}
          </div>
        </Panel>

        <Panel title="Uploads & AI Results">
          <div className="upload-mini-list">
            {uploads.map((file) => (
              <article key={file.name}>
                <b>{file.name}</b>
                <span>{file.type} - {file.status} - {file.summary}</span>
                <div className="progress-track"><span style={{ width: `${file.progress}%` }} /></div>
              </article>
            ))}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
