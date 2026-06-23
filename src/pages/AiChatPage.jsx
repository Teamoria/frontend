import AppShell, { PageHeader, Panel } from "../components/app/AppShell.jsx";
import { chatMessages } from "../data/teamoriaData.js";

export default function AiChatPage() {
  return (
    <AppShell active="AI Chat">
      <PageHeader
        title="Workspace AI Chat"
        eyebrow="Permission-aware RAG answers with visible sources."
        actions={<button className="product-button" type="button">New Chat</button>}
      />

      <section className="chat-layout">
        <aside className="chat-sidebar">
          <button className="product-button" type="button">New Chat</button>
          <div className="bot-list-title">Available bots</div>
          {[
            ["BOT", "Technical Sprint Meeting Assistant", "Source: uploaded Zoom video"],
            ["PDF", "Employee Handbook Assistant", "Source: uploaded PDF"]
          ].map(([icon, title, source], index) => (
            <a className={`bot-card-link ${index === 0 ? "active" : ""}`} href="#/ai-chat" key={title}>
              <span>{icon}</span>
              <b>{title}</b>
              <small>{source}</small>
            </a>
          ))}
        </aside>

        <Panel className="chat-panel">
          <div className="suggested-prompts">
            {[
              "What tasks were assigned to Sarah in the meeting?",
              "Summarize the hiring policy changes.",
              "Which risks were mentioned in the Sprint video?"
            ].map((prompt) => (
              <button type="button" key={prompt}>{prompt}</button>
            ))}
          </div>
          <div className="chat-window">
            {chatMessages.map((message, index) => (
              <article className={`chat-message chat-message--${message.side}`} key={`${message.side}-${index}`}>
                <p>{message.text}</p>
                {message.sources ? (
                  <div className="source-list">
                    {message.sources.map((source) => <span key={source}>{source}</span>)}
                  </div>
                ) : null}
                {message.side === "ai" ? (
                  <div className="message-actions">
                    <button type="button">Copy</button>
                    <button type="button">Create task</button>
                    <button type="button">Regenerate</button>
                  </div>
                ) : null}
              </article>
            ))}
            <div className="typing-indicator" aria-label="AI is preparing response">
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="chat-composer">
            <input placeholder="Ask about this workspace..." />
            <button className="product-button" type="button">Send</button>
          </div>
        </Panel>

        <Panel title="Related Context">
          <div className="related-list">
            {["Related tasks", "Related documents", "Meeting sources", "Visible project scope"].map((item) => (
              <article key={item}><b>{item}</b><span>Scoped to your current workspace permissions.</span></article>
            ))}
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}
