import { FiCheckCircle, FiEdit2, FiFileText, FiMessageCircle, FiTrendingUp, FiUploadCloud } from "react-icons/fi";
import AppShell from "../components/app/AppShell.jsx";
import "../styles/profile.css";

const profileStats = [
  ["Assigned Workspaces", "3"],
  ["Open Tasks", "18"],
  ["Meetings Joined", "27"],
  ["Questions Asked", "142"]
];

const accessItems = [
  ["AI Platform Workspace", "Project manager access", "Upload, tasks, meetings, AI chat"],
  ["Client Portal Launch", "Project manager access", "Reports, sprint board, team members"],
  ["Mobile Delivery Team", "Contributor access", "Assigned tasks and meeting sources"]
];

const activityItems = [
  [FiCheckCircle, "Reviewed extracted tasks", "AI Sprint Planning", "12 min ago"],
  [FiUploadCloud, "Uploaded meeting recording", "Upload Center", "45 min ago"],
  [FiMessageCircle, "Asked workspace AI about risks", "AI Chat", "Today"],
  [FiEdit2, "Changed task priority", "Task Hub", "Yesterday"]
];

const permissions = [
  ["Can manage workspace tasks", true],
  ["Can upload files and meetings", true],
  ["Can invite company admins", false],
  ["Can change AI model settings", true],
  ["Can view cited AI answers", true]
];

const preferences = [
  "Arabic + English Interface",
  "Light Interface",
  "Email meeting summaries",
  "Show AI citations by default"
];

export default function ProfilePage() {
  return (
    <AppShell active="Profile" user="Sarah Johnson" role="Project Manager">
      <main className="profile-command-page">
        <section className="profile-command-main">
          <section className="profile-banner">
            <div className="profile-delivery-score">
              <small>Delivery Score</small>
              <strong>94%</strong>
              <FiTrendingUp aria-hidden="true" />
            </div>
            <div className="profile-banner-user">
              <div className="profile-photo">SJ</div>
              <div>
                <h1>Sarah Johnson</h1>
                <p>Project Manager - Taqat Digital</p>
                <div>
                  <span>AI Assessment</span>
                  <span>Verified Email</span>
                  <span>Project Scope Only</span>
                </div>
              </div>
            </div>
          </section>

          <section className="profile-command-stats">
            {profileStats.map(([label, value]) => (
              <article key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </article>
            ))}
          </section>

          <section className="profile-command-section">
            <h2>Access Scope</h2>
            <div className="profile-access-grid">
              {accessItems.map(([title, level, detail]) => (
                <article key={title}>
                  <div><i aria-hidden="true" /><b>{title}</b></div>
                  <strong>{level}</strong>
                  <p>{detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="profile-command-section">
            <div className="profile-section-head">
              <h2>Recent Activity</h2>
              <button type="button">View All</button>
            </div>
            <div className="profile-activity-list">
              {activityItems.map(([Icon, title, source, time]) => (
                <article key={title}>
                  <div>
                    <Icon aria-hidden="true" />
                    <b>{title}</b>
                  </div>
                  <span>{source}</span>
                  <time>{time}</time>
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="profile-control-panel">
          <div className="profile-control-head">
            <h2>Account Controls</h2>
            <div>
              <button type="button">Edit Profile</button>
              <button type="button">Save Changes</button>
            </div>
          </div>

          <section>
            <h3>Account Details</h3>
            <div className="profile-form-stack">
              <label><span>Full name</span><input defaultValue="Sarah Johnson" /></label>
              <label><span>Work email</span><input defaultValue="sarahj@teamoria.ai" /></label>
              <label><span>Job title</span><input defaultValue="Project Manager" /></label>
              <label><span>Company</span><input defaultValue="Taqat Digital" /></label>
            </div>
          </section>

          <section>
            <h3>Role Permissions</h3>
            <div className="profile-toggle-list">
              {permissions.map(([label, active]) => (
                <article className={active ? "is-on" : ""} key={label}>
                  <span>{label}</span>
                  <i aria-hidden="true" />
                </article>
              ))}
            </div>
          </section>

          <section>
            <h3>Preferences</h3>
            <div className="profile-preference-list">
              {preferences.map((preference) => (
                <label key={preference}>
                  <span>{preference}</span>
                  <input type="checkbox" defaultChecked />
                </label>
              ))}
            </div>
          </section>

          <section className="profile-source-card">
            <FiFileText aria-hidden="true" />
            <div>
              <b>Permission source</b>
              <span>Synced from company role matrix</span>
            </div>
          </section>
        </aside>
      </main>
    </AppShell>
  );
}
