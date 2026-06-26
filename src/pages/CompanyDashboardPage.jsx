import AppShell, { Badge, PageHeader, Panel, StatCard } from "../components/app/AppShell.jsx";
import { companyMetrics, projectWorkload, subscriptionStates, teamMembers } from "../data/systemFlowData.js";

export default function CompanyDashboardPage() {
  const trial = subscriptionStates[0];
  return (
    <AppShell active="Company Dashboard" roleId="owner">
      <PageHeader
        title="Taqat Digital Workspace"
        eyebrow="Company owner view for projects, billing, team access, files, tasks, and AI activity."
        actions={(
          <>
            <a className="filter-button" href="#/company/team">Invite Member</a>
            <a className="product-button" href="#/company/billing">Manage Billing</a>
          </>
        )}
      />

      <section className="subscription-banner subscription-banner--blue">
        <div>
          <span className="page-kicker">{trial.state}</span>
          <h2>{trial.label}</h2>
          <p>{trial.copy} Submit payment before the deadline to avoid limited access.</p>
        </div>
        <a className="white-action" href="#/company/billing">Submit Bank Transfer</a>
      </section>

      <div className="stats-grid-modern">
        {companyMetrics.map((item) => <StatCard item={item} key={item.label} />)}
      </div>

      <section className="owner-dashboard-grid">
        <Panel title="Project Portfolio">
          <div className="compact-list">
            {projectWorkload.map((project) => (
              <article key={project.title}>
                <div className="list-title-row">
                  <b>{project.title}</b>
                  <Badge tone={project.status === "At Risk" ? "orange" : "green"}>{project.status}</Badge>
                </div>
                <span>{project.manager} - {project.tasks} tasks - {project.files} files</span>
                <div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Team Access">
          <div className="compact-list">
            {teamMembers.map((member) => (
              <article key={member.email}>
                <div className="list-title-row">
                  <b>{member.name}</b>
                  <Badge tone={member.status === "Invited" ? "orange" : "green"}>{member.status}</Badge>
                </div>
                <span>{member.role} - {member.projects} projects - Last seen {member.lastSeen}</span>
              </article>
            ))}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
