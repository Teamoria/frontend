import AppShell, { AvatarStack } from "../components/app/AppShell.jsx";
import { meetingActions, meetingDecisions, meetingSummary, meetings } from "../data/teamoriaData.js";

export default function MeetingsPage() {
  return (
    <AppShell active="Meetings" user="Jane Cooper" role="Product Manager">
      <section className="meeting-workspace">
        <div className="meeting-brand-title">
          <h1>Meeting Alchemy</h1>
          <p>Smart Summaries powered by <b>AI</b></p>
        </div>
        <div className="meetings-layout">
          <aside className="meetings-list">
            <h2>All Meetings</h2>
            {renderMeetings()}
            <button className="filter-button" type="button">Load more meetings</button>
          </aside>

          <section>
            <div className="meeting-title-row">
              <div>
                <h1>Product Roadmap Sync</h1>
                <p>May 22, 2025 - 10:00 AM to 11:00 AM - 6 Participants</p>
              </div>
              <div className="page-actions">
                <button className="filter-button" type="button">Share</button>
                <button className="product-button" type="button">Export</button>
              </div>
            </div>

            <div className="meeting-tabs">
              <button className="active" type="button">AI Summary</button>
              <button type="button">Transcript</button>
              <button type="button">Notes</button>
              <button type="button">Highlights</button>
            </div>

            <div className="meeting-grid">
              <article className="meeting-detail-card">
                <h2>AI Summary</h2>
                <p>{meetingSummary}</p>
                <div className="page-actions">
                  <span className="status-badge status-badge--green">Generated in 28s</span>
                  <span className="status-badge status-badge--green">Powered by Teamoria AI</span>
                </div>
              </article>

              <article className="meeting-detail-card">
                <h2>Action Items</h2>
                <div className="action-list">
                  {meetingActions.map(([task, owner, date]) => (
                    <label className="action-item" key={task}>
                      <input type="checkbox" />
                      <b>{task}</b>
                      <span>{owner}</span>
                      <time>{date}</time>
                    </label>
                  ))}
                </div>
                <a className="add-task-link" href="#/tasks">Add new action item</a>
              </article>

              <article className="meeting-detail-card">
                <h2>Key Decisions</h2>
                <ul>
                  {meetingDecisions.map((decision) => <li key={decision}>{decision}</li>)}
                </ul>
              </article>

              <article className="meeting-detail-card">
                <h2>Sentiment Analysis</h2>
                <div className="sentiment-card">
                  <div className="sentiment-ring"><small>Overall</small>Positive<br />78%</div>
                  <div className="sentiment-bars">
                    <div><span>Positive</span><i style={{ "--bar-color": "#45b45b", "--bar-width": "78%" }} /><b>78%</b></div>
                    <div><span>Neutral</span><i style={{ "--bar-color": "#f1c40f", "--bar-width": "17%" }} /><b>17%</b></div>
                    <div><span>Negative</span><i style={{ "--bar-color": "#ef4444", "--bar-width": "5%" }} /><b>5%</b></div>
                  </div>
                </div>
              </article>

              <div className="audio-player">
                <button className="play-button" type="button">▶</button>
                <span>00:00</span>
                <div className="waveform" />
                <span>60:00</span>
                <button className="filter-button" type="button">1x</button>
              </div>
            </div>
          </section>
        </div>
      </section>
    </AppShell>
  );
}

function renderMeetings() {
  let currentGroup = "";
  return meetings.map((meeting) => {
    const showGroup = meeting.group !== currentGroup;
    currentGroup = meeting.group;
    return (
      <div key={meeting.title}>
        {showGroup ? <div className="meeting-group">{meeting.group}</div> : null}
        <article className={`meeting-card ${meeting.active ? "active" : ""}`}>
          <span className="meeting-card-icon" />
          <div>
            <h3>{meeting.title}</h3>
            <p>{meeting.time}</p>
            <AvatarStack people={meeting.participants} />
          </div>
          <span className="meeting-ai-dot" />
        </article>
      </div>
    );
  });
}
