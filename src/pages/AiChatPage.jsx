import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiFilePlus,
  FiMic,
  FiPaperclip,
  FiPlus,
  FiRefreshCw,
  FiSend,
  FiZap
} from "react-icons/fi";
import AppShell, { AppPageLayout } from "../components/app/AppShell.jsx";
import {
  getPayloadData,
  listChatSessionMessages,
  listChatSessions,
  sendChatMessage
} from "../lib/api.js";
import "../styles/ai-chat.css";

export default function AiChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationMessages, setConversationMessages] = useState({});
  const [draft, setDraft] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [status, setStatus] = useState({ loadingConversations: true, loadingMessages: false, sending: false, error: "" });
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const activeConversationIdRef = useRef("");

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) || null,
    [activeConversationId, conversations]
  );

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;

    if (activeConversationId) {
      if (isTemporaryConversationId(activeConversationId)) {
        setMessages(conversationMessages[activeConversationId] || []);
      } else {
        loadMessages(activeConversationId);
      }
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status.sending]);

  function setStatusPatch(patch) {
    setStatus((current) => ({ ...current, ...patch }));
  }

  async function loadConversations({ silent = false } = {}) {
    if (!silent) {
      setStatusPatch({ loadingConversations: true, error: "" });
    }

    try {
      const payload = await listChatSessions();
      const nextConversations = extractConversations(getPayloadData(payload) || payload);
      setConversations(nextConversations);
      setStatusPatch({ loadingConversations: false, error: "" });
    } catch (error) {
      setStatusPatch({ loadingConversations: false, error: error.message || "Unable to load conversations." });
    }
  }

  async function loadMessages(conversationId, { silent = false } = {}) {
    if (!conversationId) return;
    if (!silent) {
      setStatusPatch({ loadingMessages: true, error: "" });
    }

    try {
      const payload = await listChatSessionMessages(conversationId);
      const nextMessages = extractMessages(getPayloadData(payload) || payload);
      setConversationMessages((current) => ({ ...current, [conversationId]: nextMessages }));
      setMessages(nextMessages);
      setStatusPatch({ loadingMessages: false, error: "" });
    } catch (error) {
      setStatusPatch({ loadingMessages: false, error: error.message || "Unable to load messages." });
    }
  }

  async function startConversation() {
    setStatusPatch({ error: "" });
    setActiveConversationId("");
    setMessages([]);
    setDraft("");
    resizeComposer("");
  }

  async function submitMessage(event) {
    event.preventDefault();
    const message = draft.trim();

    if (!message || status.sending) return;

    const conversationId = activeConversationId || `pending-${Date.now()}`;
    const tempMessageId = `user-${Date.now()}`;
    setStatusPatch({ sending: true, error: "" });

    try {
      const userMessage = createLocalMessage({ id: tempMessageId, content: message, role: "user" });
      const nextUserMessages = [...messages, userMessage];

      setActiveConversationId(conversationId);
      setConversationMessages((current) => ({ ...current, [conversationId]: nextUserMessages }));
      setMessages(nextUserMessages);
      setDraft("");
      resizeComposer("");

      const payload = await sendChatMessage({
        session_id: activeConversationId || undefined,
        project_id: activeConversation?.project_id || null,
        message_content: message
      });
      const data = getPayloadData(payload) || payload || {};
      const serverConversationId = data.session_id || data.chat_session_id || conversationId;
      const assistantMessage = createLocalMessage({
        id: data.message_id ? `processing-${data.message_id}` : `processing-${Date.now()}`,
        content: "Message is being processed. The AI reply will appear here when it is ready.",
        role: "assistant"
      });
      const nextMessages = [...nextUserMessages, assistantMessage];

      setActiveConversationId(serverConversationId);
      setConversationMessages((current) => {
        const next = { ...current, [serverConversationId]: nextMessages };
        if (serverConversationId !== conversationId) {
          delete next[conversationId];
        }
        return next;
      });
      setMessages(nextMessages);
      setConversations((current) => upsertConversation(current, {
        id: serverConversationId,
        title: activeConversation?.title || getConversationTitle(message),
        summary: message,
        project_id: activeConversation?.project_id || "",
        updated_at: new Date().toISOString()
      }));
      setSelectedFiles([]);
      setStatusPatch({ sending: false, error: "" });
      await loadConversations({ silent: true });
      scheduleMessageRefresh(serverConversationId);
    } catch (error) {
      const rollbackMessages = messages;
      setConversationMessages((current) => ({ ...current, [conversationId]: rollbackMessages }));
      setMessages(rollbackMessages);
      setStatusPatch({ sending: false, error: error.message || "Unable to send message." });
    }
  }

  function updateDraft(value) {
    setDraft(value);
    resizeComposer(value);
  }

  function resizeComposer(value) {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(160, Math.max(48, textareaRef.current.scrollHeight || value.length))}px`;
  }

  function handleFiles(event) {
    setSelectedFiles(Array.from(event.target.files || []));
  }

  function scheduleMessageRefresh(conversationId, attempt = 1) {
    const delay = attempt === 1 ? 1500 : 3000;
    window.setTimeout(async () => {
      try {
        const payload = await listChatSessionMessages(conversationId);
        const nextMessages = extractMessages(getPayloadData(payload) || payload);
        setConversationMessages((current) => ({ ...current, [conversationId]: nextMessages }));
        if (activeConversationIdRef.current === conversationId) {
          setMessages(nextMessages);
        }

        const hasAiReply = nextMessages.some((message) => message.role === "assistant");
        if (!hasAiReply && attempt < 6) {
          scheduleMessageRefresh(conversationId, attempt + 1);
        }
      } catch {
        if (attempt < 3) {
          scheduleMessageRefresh(conversationId, attempt + 1);
        }
      }
    }, delay);
  }

  return (
    <AppShell active="AI Chat">
      <AppPageLayout
        className="ai-chat-page"
        title="AI Chat"
        subtitle="Ask Teamoria AI about projects, files, tasks, and risks."
        actions={(
          <button className="product-button" type="button" onClick={startConversation}>
            <FiPlus aria-hidden="true" />
            New Chat
          </button>
        )}
      >
      <section className="ai-chat-command">
        <aside className="ai-chat-sidebar" aria-label="Conversations">
          <div className="ai-sidebar-head">
            <h2>Conversations</h2>
          </div>

          <div className="ai-conversation-list">
            {status.loadingConversations ? <p className="ai-chat-state">Loading conversations...</p> : null}
            {!status.loadingConversations && conversations.length === 0 ? (
              <div className="ai-chat-empty">
                <FiZap aria-hidden="true" />
                <h2>No conversations yet</h2>
                <p>Start a new chat to ask about projects, files, tasks, and risks.</p>
              </div>
            ) : null}
            {!status.loadingConversations ? conversations.map((conversation) => (
              <button
                className={conversation.id === activeConversationId ? "is-active" : ""}
                key={conversation.id}
                type="button"
                onClick={() => setActiveConversationId(conversation.id)}
              >
                <b>{conversation.title}</b>
                <span>{conversation.summary || "No messages yet"}</span>
                <time>{formatConversationTime(conversation.updated_at || conversation.created_at)}</time>
              </button>
            )) : null}
          </div>
        </aside>

        <main className="ai-chat-surface">
          <header className="ai-chat-thread-head">
            <div>
              <h2>{activeConversation?.title || "New conversation"}</h2>
              <span>{activeConversation ? "Teamoria AI service conversation" : "Create or select a conversation"}</span>
            </div>
            <div className="ai-thread-actions">
              <label>
                <input type="file" multiple onChange={handleFiles} />
                <FiFilePlus aria-hidden="true" />
                Add Source
              </label>
              <button type="button" onClick={() => loadConversations()} aria-label="Refresh conversations">
                <FiRefreshCw aria-hidden="true" />
              </button>
            </div>
          </header>

          {status.error ? <p className="ai-chat-alert">{status.error}</p> : null}

          <section className="ai-message-window" aria-label="AI chat messages">
            {status.loadingMessages ? <p className="ai-chat-state">Loading messages...</p> : null}
            {!status.loadingMessages && messages.length === 0 ? (
              <div className="ai-message-empty">
                <FiZap aria-hidden="true" />
                <h2>Ask Teamoria AI</h2>
                <p>Choose a conversation or send a first message. Answers will appear here with sources when the backend returns them.</p>
              </div>
            ) : null}
            {!status.loadingMessages ? messages.map((message) => <ChatMessage key={message.id} message={message} />) : null}
            {status.sending ? (
              <article className="ai-message ai-message--assistant ai-message--loading">
                <span />
                <span />
                <span />
              </article>
            ) : null}
            <div ref={messagesEndRef} />
          </section>

          <form className="ai-composer-panel" onSubmit={submitMessage}>
            {selectedFiles.length > 0 ? (
              <div className="ai-selected-sources">
                {selectedFiles.map((file) => <span key={`${file.name}-${file.size}`}>{file.name}</span>)}
              </div>
            ) : null}
            <div className="ai-composer-row">
              <label className="ai-composer-icon-button" title="Attach files">
                <input type="file" multiple onChange={handleFiles} />
                <FiPaperclip aria-hidden="true" />
              </label>
              <textarea
                ref={textareaRef}
                placeholder="Message Teamoria AI..."
                rows="1"
                value={draft}
                onChange={(event) => updateDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submitMessage(event);
                  }
                }}
              />
              <button className="ai-composer-icon-button" type="button" title="Record voice">
                <FiMic aria-hidden="true" />
              </button>
              <button className="ai-send-button" type="submit" disabled={!draft.trim() || status.sending}>
                {status.sending ? "Waiting" : "Send"}
                <FiSend aria-hidden="true" />
              </button>
            </div>
          </form>
        </main>
      </section>
      </AppPageLayout>
    </AppShell>
  );
}

function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <article className={`ai-message ${isUser ? "ai-message--user" : "ai-message--assistant"}`}>
      {!isUser ? (
        <div className="ai-message-label">
          <FiZap aria-hidden="true" />
          <span>Teamoria AI</span>
        </div>
      ) : null}
      <p>{message.content}</p>
      {message.sources?.length ? (
        <div className="ai-citation-block">
          <b>Sources</b>
          <div>
            {message.sources.map((source, index) => (
              <a href={source.url || "#"} key={source.id || source.title || index}>
                [{index + 1}] {source.title || source.name || "Source"}
              </a>
            ))}
          </div>
        </div>
      ) : null}
      <time>{formatMessageTime(message.created_at)}</time>
    </article>
  );
}

function extractConversations(data) {
  const rows = data?.sessions || data?.conversations || data?.data?.sessions || data?.data || data?.items || data || [];
  return Array.isArray(rows) ? rows.map(normalizeConversation).filter((conversation) => conversation.id) : [];
}

function mergeConversations(currentConversations, nextConversations) {
  return nextConversations.reduce(
    (merged, conversation) => upsertConversation(merged, conversation),
    currentConversations
  );
}

function normalizeConversation(conversation = {}) {
  const lastMessage = conversation.last_message || conversation.latest_message || conversation.message || null;

  return {
    id: conversation.id || conversation.session_id || conversation.chat_session_id || conversation.conversation_id || conversation.uuid || "",
    title: conversation.title || conversation.name || conversation.project?.name || "Untitled chat",
    summary: conversation.summary || lastMessage?.content || lastMessage?.message_content || conversation.preview || "",
    project_id: conversation.project_id || conversation.project?.id || "",
    created_at: conversation.created_at || conversation.createdAt || "",
    updated_at: conversation.updated_at || conversation.updatedAt || conversation.created_at || ""
  };
}

function extractMessages(data) {
  const rows = data?.messages || data?.data?.messages || data?.data || data?.items || data?.records || data || [];
  return Array.isArray(rows) ? rows.map(normalizeMessage).filter((message) => message.id || message.content) : [];
}

function normalizeMessage(message = {}) {
  return {
    id: message.id || message.message_id || message.uuid || `${message.role || "message"}-${message.created_at || Math.random()}`,
    role: normalizeRole(message.role || message.sender || message.type),
    content: message.content || message.message_content || message.message || message.answer || message.text || "",
    sources: Array.isArray(message.sources) ? message.sources : [],
    created_at: message.created_at || message.createdAt || ""
  };
}

function createLocalMessage({ id, content, role, sources = [] }) {
  return {
    id: id || `${role}-${Date.now()}`,
    role,
    content,
    sources,
    created_at: new Date().toISOString()
  };
}

function upsertConversation(conversations, nextConversation) {
  const normalized = normalizeConversation(nextConversation);
  const existing = conversations.find((conversation) => conversation.id === normalized.id);
  const merged = existing ? { ...existing, ...normalized } : normalized;

  return [merged, ...conversations.filter((conversation) => conversation.id !== normalized.id)];
}

function normalizeRole(role) {
  const value = String(role || "").toLowerCase();
  if (["assistant", "ai", "bot"].includes(value)) return "assistant";
  return "user";
}

function isTemporaryConversationId(value) {
  return String(value || "").startsWith("pending-") || String(value || "").startsWith("local-");
}

function getConversationTitle(message) {
  return message.length > 42 ? `${message.slice(0, 42)}...` : message;
}

function formatConversationTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function formatMessageTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(date);
}
