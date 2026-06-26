import AppShell, { PageHeader, Panel } from "../components/app/AppShell.jsx";

export default function CompanySettingsPage() {
  return (
    <AppShell active="Company Settings" roleId="owner">
      <PageHeader title="Company Settings" eyebrow="Control company identity, workspace defaults, security, and AI access." />

      <section className="settings-grid">
        {[
          ["Company Profile", ["Company name", "Legal email", "Billing contact", "Default language"]],
          ["Workspace Defaults", ["Default project visibility", "Task priority rules", "Upload approval", "Member invite policy"]],
          ["Security", ["Require strong passwords", "Session lifetime", "Manager role approval", "Suspended access lock"]],
          ["AI Controls", ["AI Chat enabled", "Source citations required", "Project-scope filtering", "Upload processing enabled"]]
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
