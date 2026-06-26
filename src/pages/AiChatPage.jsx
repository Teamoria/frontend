import {
  FiBookOpen,
  FiClock,
  FiFileText,
  FiImage,
  FiLink,
  FiMic,
  FiPaperclip,
  FiSearch,
  FiSend,
  FiUploadCloud,
  FiZap
} from "react-icons/fi";
import AppShell from "../components/app/AppShell.jsx";

const conversations = [
  ["Q3 Roadmap Analysis", "2 hours ago", true],
  ["Resource Allocation AI", "Yesterday"],
  ["Risk Mitigation Strategy", "Oct 12, 2026"]
];

const activeSources = [
  ["Project_Alpha_Spec.pdf", "pdf", "risk requirements"],
  ["Standup_Notes_Oct15.docx", "doc", "meeting actions"],
  ["Q4_Budget_Export.xlsx", "sheet", "budget signals"]
];

const citations = [
  "Project_Alpha_Spec.pdf",
  "Standup_Notes_Oct15.docx",
  "Security_Log.log"
];

const promptChips = [
  "Analyze project risks",
  "Summarize active sources",
  "Create mitigation tasks"
];

export default function AiChatPage() {
  return (
    <AppShell active="AI Chat">
      <section className="ai-chat-command">
        <header className="ai-chat-header">
          <div>
            <span className="section-kicker">AI Workspace Intelligence</span>
            <h1>Chat Intelligence</h1>
            <p>Ask Teamoria about projects, meetings, files, risks, and decisions with visible sources.</p>
          </div>
          <div className="ai-chat-header-actions">
            <button type="button"><FiUploadCloud /> Add Source</button>
            <button className="primary" type="button"><FiZap /> New Chat</button>
          </div>
        </header>

        <div className="ai-chat-grid">
          <aside className="ai-context-rail">
            <section>
              <h2>Conversation History</h2>
              <div className="ai-history-list">
                {conversations.map(([title, time, active]) => (
                  <button className={active ? "active" : ""} type="button" key={title}>
                    <b>{title}</b>
                    <span>{time}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2>Active Sources</h2>
              <div className="ai-source-list">
                {activeSources.map(([name, type, note]) => (
                  <article key={name}>
                    <span className={`source-type source-type--${type}`}>{type.toUpperCase()}</span>
                    <div>
                      <b>{name}</b>
                      <small>{note}</small>
                    </div>
                    <button type="button" aria-label={`Remove ${name}`}>×</button>
                  </article>
                ))}
              </div>
              <button className="ai-dashed-action" type="button">+ Add Source</button>
            </section>
          </aside>

          <main className="ai-chat-surface">
            <div className="ai-chat-search">
              <FiSearch aria-hidden="true" />
              <input placeholder="Search insights, citations, or previous chats..." />
            </div>

            <div className="ai-prompt-strip">
              {promptChips.map((prompt) => <button type="button" key={prompt}>{prompt}</button>)}
            </div>

            <section className="ai-message-window" aria-label="AI chat messages">
              <article className="ai-empty-greeting">
                <span><FiZap aria-hidden="true" /></span>
                <h2>How can I help with Teamoria today?</h2>
                <p>I can analyze project specs, summarize meetings, or forecast resource pressure based on your active sources.</p>
              </article>

              <article className="ai-message ai-message--user">
                <p>Based on the Alpha project specification, what are the key risks for the next phase?</p>
                <time>10:42 AM</time>
              </article>

              <article className="ai-message ai-message--assistant">
                <div className="ai-message-label">
                  <FiZap aria-hidden="true" />
                  <span>AI Intelligence</span>
                </div>
                <p>
                  I found three high-impact risks across the project specification and the latest standup notes:
                </p>
                <ul>
                  <li><b>Delivery delay:</b> Core dependencies have a 30% delay probability because of regional logistics constraints.</li>
                  <li><b>Resource overlap:</b> Senior developers are assigned to two overlapping November milestones.</li>
                  <li><b>Security review gap:</b> Phase B code review is behind the planned checkpoint.</li>
                </ul>
                <div className="ai-citation-block">
                  <b>Sources</b>
                  <div>
                    {citations.map((source, index) => (
                      <button type="button" key={source}>
                        <FiLink aria-hidden="true" />
                        [{index + 1}] {source}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="ai-message-actions">
                  <button type="button">Create Tasks</button>
                  <button type="button">Generate Risk Register</button>
                  <button type="button">Copy</button>
                </div>
              </article>
            </section>

            <section className="ai-composer-panel">
              <textarea placeholder="Ask Teamoria anything about your projects..." rows="3" />
              <div>
                <div className="ai-composer-tools">
                  <button type="button" title="Attach files"><FiPaperclip /></button>
                  <button type="button" title="Record voice"><FiMic /></button>
                  <button type="button" title="Capture image"><FiImage /></button>
                </div>
                <button className="ai-send-button" type="button">
                  <span>Send Message</span>
                  <FiSend aria-hidden="true" />
                </button>
              </div>
              <small>AI-generated content may be inaccurate. Verify critical decisions with team leads.</small>
            </section>
          </main>

          <aside className="ai-insight-rail">
            <section>
              <h2>Context Health</h2>
              <div className="ai-health-score">
                <strong>94%</strong>
                <span>3 active sources indexed</span>
              </div>
            </section>

            <section>
              <h2>Quick Tools</h2>
              <div className="ai-tool-list">
                <button type="button"><FiZap /> AI Assistant</button>
                <button type="button"><FiBookOpen /> Ask Source</button>
                <button type="button"><FiFileText /> Cite</button>
                <button type="button"><FiClock /> History</button>
              </div>
            </section>

            <section>
              <h2>Suggested Actions</h2>
              <div className="ai-suggestion-list">
                <article>
                  <b>Create risk tasks</b>
                  <span>Convert the three detected risks into actionable tasks.</span>
                </article>
                <article>
                  <b>Notify managers</b>
                  <span>Send a short summary to the project manager and delivery lead.</span>
                </article>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}
