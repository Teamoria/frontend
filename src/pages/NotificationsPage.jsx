import AppShell, { Badge, PageHeader, Panel } from "../components/app/AppShell.jsx";
import { notifications } from "../data/systemFlowData.js";

export default function NotificationsPage() {
  return (
    <AppShell active="Notifications" roleId="manager">
      <PageHeader
        title="Notifications"
        eyebrow="Workspace alerts for billing, tasks, AI processing, invitations, and account activity."
        actions={<button className="filter-button" type="button">Mark all as read</button>}
      />

      <section className="notifications-layout">
        <Panel title="Inbox">
          <div className="notification-list">
            {notifications.map((item) => (
              <article className={item.unread ? "unread" : ""} key={`${item.title}-${item.time}`}>
                <span className="notification-dot" />
                <div>
                  <div className="list-title-row">
                    <b>{item.title}</b>
                    <Badge tone={item.unread ? "orange" : "green"}>{item.type}</Badge>
                  </div>
                  <p>{item.detail}</p>
                  <small>{item.time}</small>
                </div>
                <button type="button">Read</button>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Notification Rules">
          <div className="settings-list">
            {["Task status changes", "Upload processing results", "Payment review updates", "Team invitations", "AI answer failures"].map((item) => (
              <label key={item}>
                <span>{item}</span>
                <input defaultChecked type="checkbox" />
              </label>
            ))}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
