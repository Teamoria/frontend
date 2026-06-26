import AppShell, { AvatarStack, Badge, PageHeader } from "../components/app/AppShell.jsx";
import { projects } from "../data/teamoriaData.js";

export default function ProjectsPage() {
  return (
    <AppShell active="Projects" roleId="owner">
      <PageHeader
        title="Workspace Hub"
        eyebrow="Company workspaces with progress, health, files, members, and AI activity."
        actions={(
          <>
            <button className="filter-button" type="button">Filters</button>
            <button className="select-button" type="button">All Workspaces</button>
            <a className="product-button" href="#/workspace">New Workspace</a>
          </>
        )}
      />

      <section className="projects-grid-modern">
        {projects.map((project) => (
          <article className="project-hub-card" data-risk={project.health === "At Risk"} key={project.title}>
            <div className="project-card-head">
              <span className={`project-icon accent-${project.accent}`}>{project.icon}</span>
              <div>
                <h2>{project.title}</h2>
                <p>{project.description}</p>
              </div>
              <Badge tone={project.status === "At Risk" ? "orange" : "green"}>{project.status}</Badge>
            </div>

            <div className="project-card-copy">
              <div className="project-meta">Due: {project.due} - {project.company}</div>
              <div className="workspace-card-metrics">
                <span>{project.members} members</span>
                <span>{project.files} files</span>
                <span>AI indexed</span>
              </div>
              <div className="progress-row">
                <div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div>
                <b>{project.progress}%</b>
              </div>
            </div>

            <div className="project-card-foot">
              <AvatarStack people={project.team} />
              <Badge tone={project.health === "At Risk" ? "orange" : "green"}>{project.health}</Badge>
            </div>
          </article>
        ))}
      </section>
      <p className="project-count">Showing 4 of 4 workspaces</p>
    </AppShell>
  );
}
