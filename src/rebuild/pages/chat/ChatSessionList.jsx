import { FiMessageSquare, FiPlus, FiRefreshCw } from "react-icons/fi";
import { formatShortDate } from "./chatHelpers.js";

export default function ChatSessionList({
  activeSessionId,
  copy,
  language,
  loading,
  onNewChat,
  onRefresh,
  onSelect,
  sessions,
  status
}) {
  return (
    <aside className="ai-session-panel" aria-label={copy.sessions}>
      <header>
        <div>
          <h2>{copy.sessions}</h2>
          <span>{copy.sessionCount(sessions.length)}</span>
        </div>
        <div>
          <button aria-label={copy.retrySessions} disabled={loading} onClick={onRefresh} type="button">
            <FiRefreshCw aria-hidden="true" />
          </button>
          <button onClick={onNewChat} type="button">
            <FiPlus aria-hidden="true" />
            {copy.newChat}
          </button>
        </div>
      </header>

      <div className="ai-session-list">
        {status === "loading" ? <SessionSkeleton /> : null}
        {status === "error" ? (
          <div className="ai-chat-state is-error">
            <p>{copy.sessionsError}</p>
            <button onClick={onRefresh} type="button">{copy.retry}</button>
          </div>
        ) : null}
        {status === "ready" && sessions.length === 0 ? (
          <div className="ai-chat-state">
            <FiMessageSquare aria-hidden="true" />
            <h3>{copy.noSessions}</h3>
            <p>{copy.noSessionsText}</p>
          </div>
        ) : null}
        {status !== "loading" ? sessions.map((session) => (
          <button
            className={session.id === activeSessionId ? "is-active" : ""}
            key={session.id}
            onClick={() => onSelect(session.id)}
            type="button"
          >
            <FiMessageSquare aria-hidden="true" />
            <span>
              <strong>{session.title}</strong>
              <small>
                <span className="ai-session-scope">{session.scope === "project" ? copy.projectScope : copy.companyScope}</span>
                {session.scope === "project" ? ` - ${session.project_name || copy.projectUnavailable}` : ` - ${copy.companySessionDetail}`}
              </small>
            </span>
            <time>{formatShortDate(session.updated_at || session.created_at, language)}</time>
          </button>
        )) : null}
      </div>
    </aside>
  );
}

function SessionSkeleton() {
  return (
    <div className="ai-session-skeleton" aria-hidden="true">
      {[0, 1, 2, 3].map((item) => <span key={item} />)}
    </div>
  );
}
