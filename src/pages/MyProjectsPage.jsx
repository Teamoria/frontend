import AppShell, { AvatarStack, Badge, PageHeader } from "../components/app/AppShell.jsx";
import { projects } from "../data/teamoriaData.js";

export default function MyProjectsPage() {
  return (
    <AppShell active="My Projects" roleId="manager">
      <PageHeader
        title="My Projects"
        eyebrow="Projects visible to this user based on company role and assignment."
        actions={(
          <>
            <button className="filter-button" type="button">Filter</button>
            <button className="product-button" type="button">Create Project</button>
          </>
        )}
      />

      <section className="projects-grid-modern">
        {projects.map((project) => (
          <article className="project-hub-card" key={project.title}>
            <div className="project-card-head">
              <span className={`project-icon accent-${project.accent}`}>{project.icon}</span>
              <div>
                <h2>{project.title}</h2>
                <p>{project.description}</p>
              </div>
              <Badge tone={project.health === "At Risk" ? "orange" : "green"}>{project.health}</Badge>
            </div>
            <div className="project-card-copy">
              <div className="project-meta">Due: {project.due} - {project.members} members - {project.files} files</div>
              <div className="progress-row">
                <div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div>
                <b>{project.progress}%</b>
              </div>
            </div>
            <div className="project-card-foot">
              <AvatarStack people={project.team} />
              <a className="add-task-link" href="#/project-details">Open project</a>
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
