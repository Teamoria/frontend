import AppShell, { PageHeader, Panel } from "../components/app/AppShell.jsx";

export default function SettingsPage() {
  return (
    <AppShell active="Settings" user="Ahmed Alyazouri" role="Company Admin" roleId="admin">
      <PageHeader title="Settings" eyebrow="Company, security, AI, notification, and language preferences." />
      <section className="settings-grid">
        {[
          ["General", ["Company name", "Default language", "Timezone", "Workspace naming"]],
          ["Security", ["Password policy", "Session lifetime", "MFA requirement", "Invite approval"]],
          ["AI Settings", ["Model configuration", "AI permissions", "Source citation mode", "RAG scope filtering"]],
          ["Notifications", ["Email notifications", "In-app notifications", "Meeting digest", "Task reminders"]]
        ].map(([title, items]) => (
          <Panel title={title} key={title}>
            <div className="settings-list">
              {items.map((item) => (
                <label key={item}>
                  <span>{item}</span>
                  <input defaultChecked type="checkbox" />
                </label>
              ))}
            </div>
          </Panel>
        ))}
      </section>
    </AppShell>
  );
}
