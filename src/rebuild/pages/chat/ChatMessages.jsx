import { FiRefreshCw, FiZap } from "react-icons/fi";
import { formatMessageTime } from "./chatHelpers.js";

export default function ChatMessages({
  copy,
  cursor,
  language,
  loading,
  messages,
  messagesWindowRef,
  onLoadMore,
  onRetry,
  status
}) {
  return (
    <section className="ai-message-window" aria-label={copy.messages} aria-live="polite" ref={messagesWindowRef}>
      {status === "loading" ? <MessageSkeleton /> : null}
      {status === "error" ? (
        <div className="ai-chat-state is-error">
          <p>{copy.messagesError}</p>
          <button onClick={onRetry} type="button">
            <FiRefreshCw aria-hidden="true" />
            {copy.retry}
          </button>
        </div>
      ) : null}
      {status !== "loading" && cursor?.nextCursor ? (
        <button className="ai-load-more" disabled={loading} onClick={onLoadMore} type="button">{copy.loadMore}</button>
      ) : null}
      {status === "ready" && messages.length === 0 ? (
        <div className="ai-message-empty">
          <FiZap aria-hidden="true" />
          <h2>{copy.emptyTitle}</h2>
          <p>{copy.emptyText}</p>
        </div>
      ) : null}
      {status !== "loading" ? messages.map((message) => <ChatMessage copy={copy} key={message.id} language={language} message={message} />) : null}
    </section>
  );
}

function ChatMessage({ copy, language, message }) {
  const isUser = message.role === "user";
  return (
    <article className={`ai-message ${isUser ? "is-user" : "is-assistant"} ${message.isProcessing ? "is-processing" : ""}`}>
      {!isUser ? <strong>{copy.assistantName}</strong> : null}
      <p dir="auto">{message.content}</p>
      {message.isProcessing ? (
        <div className="ai-thinking-dots" aria-label={copy.processing}>
          <span />
          <span />
          <span />
        </div>
      ) : null}
      {message.created_at ? <time>{formatMessageTime(message.created_at, language)}</time> : null}
    </article>
  );
}

function MessageSkeleton() {
  return (
    <div className="ai-message-skeleton" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}
