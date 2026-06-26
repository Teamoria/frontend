import AppShell, { Badge, PageHeader, Panel } from "../components/app/AppShell.jsx";
import { teamMembers } from "../data/systemFlowData.js";

export default function CompanyTeamPage() {
  return (
    <AppShell active="Team" roleId="owner">
      <PageHeader
        title="Team Management"
        eyebrow="Invite members, assign managers, update roles, and remove access."
        actions={<button className="product-button" type="button">Invite Member</button>}
      />

      <section className="employees-layout">
        <Panel title="Members">
          <div className="data-table">
            <div className="admin-data-row admin-data-row--head"><b>Member</b><b>Role</b><b>Projects</b><b>Status</b><b>Last Seen</b><b>Actions</b></div>
            {teamMembers.map((member) => (
              <div className="admin-data-row admin-data-row--team" key={member.email}>
                <span><b>{member.name}</b><small>{member.email}</small></span>
                <span>{member.role}</span>
                <span>{member.projects}</span>
                <Badge tone={member.status === "Invited" ? "orange" : "green"}>{member.status}</Badge>
                <span>{member.lastSeen}</span>
                <span className="row-actions">
                  <button type="button">Change Role</button>
                  <button type="button">Remove</button>
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Role Permissions">
          <div className="permission-grid">
            {[
              ["Owner", "Billing, settings, team, projects, subscription."],
              ["Manager", "Create projects, create tasks, assign members."],
              ["Member", "Work on tasks, upload files, use AI Chat."],
              ["Admin", "Platform-only role outside company workspace."]
            ].map(([role, copy]) => (
              <article key={role}><b>{role}</b><span>{copy}</span></article>
            ))}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
