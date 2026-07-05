import {
  FiBookOpen,
  FiClock,
  FiFileText,
  FiImage,
  FiLink,
  FiMic,
  FiMoreHorizontal,
  FiPaperclip,
  FiSend,
  FiUploadCloud,
  FiZap
} from "react-icons/fi";
import AppShell from "../components/app/AppShell.jsx";
import "../styles/ai-chat.css";

const conversations = [
  ["Q3 Roadmap Analysis", "Delivery risks and next steps", "2 hours ago", true],
  ["Resource Allocation AI", "Team capacity planning", "Yesterday"],
  ["Risk Mitigation Strategy", "Executive summary", "Oct 12, 2026"]
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
            <h1>AI Chat</h1>
            <p>Ask about projects, meetings, files, risks, and decisions.</p>
          </div>
          <div className="ai-chat-header-actions">
            <button type="button"><FiUploadCloud /> Add Source</button>
            <button className="primary" type="button"><FiZap /> New Chat</button>
          </div>
        </header>

        <div className="ai-chat-grid">
          <aside className="ai-context-rail">
            <div className="ai-rail-head">
              <h2>Conversations</h2>
              <button type="button" aria-label="New chat">+</button>
            </div>
            <div className="ai-history-list">
              {conversations.map(([title, summary, time, active]) => (
                <button className={active ? "active" : ""} type="button" key={title}>
                  <b>{title}</b>
                  <span>{summary}</span>
                  <time>{time}</time>
                </button>
              ))}
            </div>
          </aside>

          <main className="ai-chat-surface">
            <div className="ai-chat-thread-head">
              <div>
                <h2>Q3 Roadmap Analysis</h2>
                <span>3 sources available</span>
              </div>
              <details className="ai-advanced-menu">
                <summary aria-label="Advanced tools">
                  <FiMoreHorizontal aria-hidden="true" />
                </summary>
                <div>
                  <button type="button"><FiZap /> AI Assistant</button>
                  <button type="button"><FiBookOpen /> Ask Source</button>
                  <button type="button"><FiFileText /> Cite</button>
                  <button type="button"><FiClock /> History</button>
                  <hr />
                  {promptChips.map((prompt) => <button type="button" key={prompt}>{prompt}</button>)}
                  <hr />
                  {activeSources.map(([name, type]) => (
                    <button type="button" key={name}>
                      <span className={`source-type source-type--${type}`}>{type.toUpperCase()}</span>
                      {name}
                    </button>
                  ))}
                </div>
              </details>
            </div>

            <section className="ai-message-window" aria-label="AI chat messages">
              <article className="ai-message ai-message--user">
                <p>Based on the Alpha project specification, what are the key risks for the next phase?</p>
                <time>10:42 AM</time>
              </article>

              <article className="ai-message ai-message--assistant">
                <div className="ai-message-label">
                  <FiZap aria-hidden="true" />
                  <span>Teamoria AI</span>
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
              </article>
            </section>

            <section className="ai-composer-panel">
              <textarea placeholder="Message Teamoria AI..." rows="2" />
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
            </section>
          </main>
        </div>
      </section>
    </AppShell>
  );
}
