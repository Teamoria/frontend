import AppShell, { AvatarStack, Badge, PageHeader, Panel } from "../components/app/AppShell.jsx";
import { projects, recentTasks, uploads } from "../data/teamoriaData.js";

export default function WorkspaceDetailsPage() {
  const workspace = projects[0];
  return (
    <AppShell active="Projects">
      <PageHeader
        title={workspace.title}
        eyebrow={`${workspace.company} - ${workspace.members} members - ${workspace.files} indexed files`}
        actions={(
          <>
            <button className="filter-button" type="button">Add Member</button>
            <button className="filter-button" type="button">Create Task</button>
            <a className="product-button" href="#/uploads">Upload File</a>
          </>
        )}
      />

      <div className="workspace-tabs">
        {["Overview", "Team", "Tasks", "Uploads", "Reports"].map((tab, index) => (
          <button className={index === 0 ? "active" : ""} type="button" key={tab}>{tab}</button>
        ))}
      </div>

      <section className="workspace-detail-grid">
        <Panel title="Workspace Overview">
          <div className="workspace-hero-card">
            <span className={`project-icon accent-${workspace.accent}`}>{workspace.icon}</span>
            <div>
              <h2>{workspace.ar}</h2>
              <p>{workspace.description}</p>
              <div className="progress-row">
                <div className="progress-track"><span style={{ width: `${workspace.progress}%` }} /></div>
                <b>{workspace.progress}%</b>
              </div>
            </div>
            <Badge>{workspace.health}</Badge>
          </div>
        </Panel>

        <Panel title="Team Scope">
          <AvatarStack people={workspace.team} />
          <div className="role-list">
            {["Company Admin", "General Manager", "Project Manager", "Employee"].map((role) => (
              <div key={role}><b>{role}</b><span>Permission scoped access</span></div>
            ))}
          </div>
        </Panel>

        <Panel title="Recent Tasks">
          <div className="task-table">
            {recentTasks.slice(0, 4).map(([task, project, date, priority]) => (
              <label className="task-row" key={task}>
                <input type="checkbox" />
                <b>{task}</b>
                <span>{project}</span>
                <span>{date}</span>
                <em className={`priority priority--${priority}`}>{priority}</em>
              </label>
            ))}
          </div>
        </Panel>

        <Panel title="Latest Uploads">
          <div className="upload-mini-list">
            {uploads.slice(0, 3).map((file) => (
              <article key={file.name}>
                <b>{file.name}</b>
                <span>{file.type} - {file.status}</span>
                <div className="progress-track"><span style={{ width: `${file.progress}%` }} /></div>
              </article>
            ))}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
