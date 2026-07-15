import { useMemo, useState } from "react";
import { FiMessageSquare, FiPlus, FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import { formatShortDate } from "./chatHelpers.js";

export default function ChatSessionList({
  activeSessionId,
  copy,
  language,
  loading,
  onClose,
  onNewChat,
  onRefresh,
  onSelect,
  sessions,
  status
}) {
  const [query, setQuery] = useState("");
  const filteredSessions = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return sessions;
    return sessions.filter((session) => {
      const haystack = [
        session.title,
        session.scope,
        session.project_name,
        formatShortDate(session.updated_at || session.created_at, language)
      ].join(" ").toLowerCase();
      return haystack.includes(cleanQuery);
    });
  }, [language, query, sessions]);

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
          <button aria-label={copy.closeSessions || copy.sessions} className="ai-session-close" onClick={onClose} type="button">
            <FiX aria-hidden="true" />
          </button>
          <button onClick={onNewChat} type="button">
            <FiPlus aria-hidden="true" />
            {copy.newChat}
          </button>
        </div>
      </header>

      <label className="ai-session-search">
        <FiSearch aria-hidden="true" />
        <input
          aria-label={copy.searchSessions || copy.sessions}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={copy.searchSessions || copy.sessions}
          type="search"
          value={query}
        />
      </label>

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
        {status === "ready" && sessions.length > 0 && filteredSessions.length === 0 ? (
          <div className="ai-chat-state">
            <FiSearch aria-hidden="true" />
            <h3>{copy.noSearchResults || copy.noSessions}</h3>
            <p>{copy.noSearchResultsText || copy.noSessionsText}</p>
          </div>
        ) : null}
        {status !== "loading" ? filteredSessions.map((session) => {
          const scope = normalizeScope(session.scope);
          return (
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
                  <span className="ai-session-scope">{scopeLabel(scope, copy)}</span>
                  {scopeMeta(scope, session, copy)}
                </small>
              </span>
              <time>{formatShortDate(session.updated_at || session.created_at, language)}</time>
            </button>
          );
        }) : null}
      </div>
    </aside>
  );
}

function normalizeScope(scope) {
  if (scope === "project" || scope === "company") return scope;
  return "general";
}

function scopeLabel(scope, copy) {
  if (scope === "project") return copy.projectScope;
  if (scope === "company") return copy.companyScope;
  return copy.generalScope;
}

function scopeMeta(scope, session, copy) {
  if (scope === "project") return ` - ${session.project_name || copy.projectUnavailable}`;
  if (scope === "company") return ` - ${copy.companySessionDetail}`;
  return ` - ${copy.generalSessionDetail}`;
}

function SessionSkeleton() {
  return (
    <div className="ai-session-skeleton" aria-hidden="true">
      {[0, 1, 2, 3].map((item) => <span key={item} />)}
    </div>
  );
}
