import AppShell, { PageHeader, Panel } from "../components/app/AppShell.jsx";

const profileStats = [
  ["Assigned Workspaces", "3"],
  ["Open Tasks", "18"],
  ["Meetings Joined", "27"],
  ["AI Questions", "142"]
];

const accessItems = [
  ["AI Platform Workspace", "Project manager access", "Upload, tasks, meetings, AI chat"],
  ["Client Portal Launch", "Project manager access", "Reports, sprint board, team members"],
  ["Mobile Delivery Team", "Contributor access", "Assigned tasks and meeting sources"]
];

const activity = [
  ["Reviewed extracted tasks", "AI Sprint Planning", "12 min ago"],
  ["Uploaded meeting recording", "Upload Center", "48 min ago"],
  ["Asked workspace AI about risks", "AI Chat", "Today"],
  ["Changed task priority", "Task Hub", "Yesterday"]
];

export default function ProfilePage() {
  return (
    <AppShell active="Profile">
      <PageHeader
        title="Profile"
        eyebrow="Personal details, assigned role, company scope, activity, and workspace access."
        actions={(
          <>
            <button className="filter-button" type="button">Edit Profile</button>
            <button className="product-button profile-save-button" type="button">Save Changes</button>
          </>
        )}
      />
      <section className="profile-layout">
        <Panel className="profile-hero-panel">
          <div className="profile-hero">
            <div className="profile-cover" />
            <div className="profile-main-row">
              <div className="profile-avatar-wrap">
                <div className="avatar-image avatar-image--large" />
                <span className="presence-dot" />
              </div>
              <div>
                <h2>Sarah Johnson</h2>
                <p>Project Manager - Taqat Digital</p>
                <div className="profile-badges">
                  <span>Active account</span>
                  <span>Verified email</span>
                  <span>Project scope only</span>
                </div>
              </div>
              <div className="profile-score">
                <small>Delivery score</small>
                <strong>94%</strong>
              </div>
            </div>
            <div className="profile-stat-grid">
              {profileStats.map(([label, value]) => (
                <article key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </article>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Account Details">
          <div className="profile-fields">
            <label><span>Full name</span><input defaultValue="Sarah Johnson" /></label>
            <label><span>Work email</span><input defaultValue="sarah@teamoria.ai" /></label>
            <label><span>Job title</span><input defaultValue="Project Manager" /></label>
            <label><span>Company</span><input defaultValue="Taqat Digital" /></label>
          </div>
        </Panel>

        <Panel title="Access Scope">
          <div className="access-timeline">
            {accessItems.map(([name, level, detail]) => (
              <article key={name}>
                <span />
                <div>
                  <b>{name}</b>
                  <small>{level}</small>
                  <p>{detail}</p>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Role Permissions">
          <div className="permission-list">
            {[
              ["Can manage workspace tasks", true],
              ["Can upload files and meetings", true],
              ["Can invite company admins", false],
              ["Can change AI model settings", false],
              ["Can view cited AI answers", true]
            ].map(([label, allowed]) => (
              <div className={allowed ? "allowed" : "blocked"} key={label}>
                <span className="permission-switch" aria-hidden="true"><i /></span>
                <b>{label}</b>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Recent Activity">
          <div className="activity-feed">
            {activity.map(([title, area, time]) => (
              <article key={title}>
                <div />
                <b>{title}</b>
                <span>{area}</span>
                <time>{time}</time>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Preferences">
          <div className="settings-list">
            {["Arabic + English interface", "Light interface", "Email meeting summaries", "Show AI citations by default"].map((item) => (
              <label key={item}><span>{item}</span><input defaultChecked type="checkbox" /></label>
            ))}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
