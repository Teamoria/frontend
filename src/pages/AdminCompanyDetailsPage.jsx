import AppShell, { Badge, PageHeader, Panel } from "../components/app/AppShell.jsx";
import { payments, projectWorkload, teamMembers } from "../data/systemFlowData.js";

export default function AdminCompanyDetailsPage() {
  return (
    <AppShell active="Companies" roleId="admin">
      <PageHeader
        title="Taqat Digital"
        eyebrow="Company owner, subscription, team, projects, payment history, and platform actions."
        actions={(
          <>
            <button className="filter-button" type="button">Suspend</button>
            <button className="filter-button" type="button">Restore</button>
            <button className="product-button" type="button">Activate Subscription</button>
          </>
        )}
      />

      <section className="company-detail-admin">
        <Panel title="Company Snapshot">
          <div className="company-profile-block">
            <span className="company-logo-mark">TD</span>
            <div>
              <h2>Taqat Digital</h2>
              <p>Owner: Ahmed Alyazouri - Enterprise plan - Trial ends in 3 days</p>
              <div className="page-actions">
                <Badge tone="orange">Trialing</Badge>
                <Badge>64 members</Badge>
                <Badge>8 projects</Badge>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Subscription Controls">
          <div className="subscription-action-stack">
            {["Confirm payment and activate", "Reject latest bank transfer", "Extend trial by 7 days", "Switch company plan"].map((item) => (
              <button type="button" key={item}>{item}</button>
            ))}
          </div>
        </Panel>

        <Panel title="Projects">
          <div className="compact-list">
            {projectWorkload.map((project) => (
              <article key={project.title}>
                <b>{project.title}</b>
                <span>{project.manager} - {project.tasks} tasks - {project.files} files</span>
                <div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Team">
          <div className="compact-list">
            {teamMembers.slice(0, 3).map((member) => (
              <article key={member.email}>
                <b>{member.name}</b>
                <span>{member.role} - {member.projects} projects - {member.status}</span>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Payment History">
          <div className="compact-list">
            {payments.map((payment) => (
              <article key={payment.id}>
                <b>{payment.id} - {payment.amount}</b>
                <span>{payment.reference} - {payment.status} - {payment.submitted}</span>
              </article>
            ))}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
