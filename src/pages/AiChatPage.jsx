import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiFilePlus,
  FiMic,
  FiPaperclip,
  FiPlus,
  FiRefreshCw,
  FiSend,
  FiTrash2,
  FiZap
} from "react-icons/fi";
import AppShell, { AppPageLayout } from "../components/app/AppShell.jsx";
import {
  createAiConversation,
  deleteAiConversation,
  getAiConversationMessages,
  getPayloadData,
  listAiConversations,
  sendAiConversationMessage
} from "../lib/api.js";
import "../styles/ai-chat.css";

export default function AiChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [status, setStatus] = useState({ loadingConversations: true, loadingMessages: false, sending: false, error: "" });
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) || null,
    [activeConversationId, conversations]
  );

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      if (!String(activeConversationId).startsWith("local-")) {
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

  async function loadConversations() {
    setStatusPatch({ loadingConversations: true, error: "" });

    try {
      const payload = await listAiConversations();
      const nextConversations = extractConversations(getPayloadData(payload));
      setConversations(nextConversations);
      setActiveConversationId((current) => current || nextConversations[0]?.id || "");
      setStatusPatch({ loadingConversations: false, error: "" });
    } catch (error) {
      setConversations([]);
      setActiveConversationId("");
      setStatusPatch({ loadingConversations: false, error: error.message || "Unable to load conversations." });
    }
  }

  async function loadMessages(conversationId) {
    setStatusPatch({ loadingMessages: true, error: "" });

    try {
      const payload = await getAiConversationMessages(conversationId);
      setMessages(extractMessages(getPayloadData(payload)));
      setStatusPatch({ loadingMessages: false, error: "" });
    } catch (error) {
      setMessages([]);
      setStatusPatch({ loadingMessages: false, error: error.message || "Unable to load messages." });
    }
  }

  async function startConversation() {
    setStatusPatch({ error: "" });

    try {
      const payload = await createAiConversation({ title: "New chat" });
      const conversation = normalizeConversation(getPayloadData(payload)?.conversation || getPayloadData(payload));
      if (!conversation.id) {
        await loadConversations();
        return;
      }
      setConversations((current) => [conversation, ...current.filter((item) => item.id !== conversation.id)]);
      setActiveConversationId(conversation.id);
      setMessages([]);
    } catch (error) {
      setStatusPatch({ error: error.message || "Unable to create a new chat." });
    }
  }

  async function removeConversation(conversationId) {
    setStatusPatch({ error: "" });

    try {
      await deleteAiConversation(conversationId);
      setConversations((current) => current.filter((conversation) => conversation.id !== conversationId));
      if (activeConversationId === conversationId) {
        const nextConversation = conversations.find((conversation) => conversation.id !== conversationId);
        setActiveConversationId(nextConversation?.id || "");
      }
    } catch (error) {
      setStatusPatch({ error: error.message || "Unable to delete this chat." });
    }
  }

  async function submitMessage(event) {
    event.preventDefault();
    const message = draft.trim();

    if (!message || status.sending) return;

    let conversationId = activeConversationId;
    setStatusPatch({ sending: true, error: "" });

    try {
      if (!conversationId) {
        const conversationPayload = await createAiConversation({ title: getConversationTitle(message) });
        const conversation = normalizeConversation(getPayloadData(conversationPayload)?.conversation || getPayloadData(conversationPayload));
        conversationId = conversation.id;

        if (!conversationId) {
          throw new Error("The AI service did not return a conversation id.");
        }

        setConversations((current) => [conversation, ...current]);
        setActiveConversationId(conversationId);
      }

      const userMessage = createLocalMessage({ content: message, role: "user" });
      setMessages((current) => [...current, userMessage]);
      setDraft("");
      resizeComposer("");

      const payload = await sendAiConversationMessage(conversationId, {
        message,
        source_ids: [],
        project_id: null
      });
      const aiMessage = normalizeAiAnswer(getPayloadData(payload));

      setMessages((current) => [...current, aiMessage]);
      setConversations((current) => current.map((conversation) => (
        conversation.id === conversationId
          ? { ...conversation, title: conversation.title || getConversationTitle(message), summary: message, updated_at: new Date().toISOString() }
          : conversation
      )));
      setSelectedFiles([]);
      setStatusPatch({ sending: false, error: "" });
    } catch (error) {
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
              <span>{activeConversation ? "Backend AI/RAG conversation" : "Create or select a conversation"}</span>
            </div>
            <div className="ai-thread-actions">
              <label>
                <input type="file" multiple onChange={handleFiles} />
                <FiFilePlus aria-hidden="true" />
                Add Source
              </label>
              <button type="button" onClick={loadConversations} aria-label="Refresh conversations">
                <FiRefreshCw aria-hidden="true" />
              </button>
              {activeConversation ? (
                <button type="button" onClick={() => removeConversation(activeConversation.id)} aria-label="Delete conversation">
                  <FiTrash2 aria-hidden="true" />
                </button>
              ) : null}
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
                {status.sending ? "Sending" : "Send"}
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
  const rows = data?.conversations || data?.data || data?.items || data || [];
  return Array.isArray(rows) ? rows.map(normalizeConversation).filter((conversation) => conversation.id) : [];
}

function normalizeConversation(conversation = {}) {
  return {
    id: conversation.id || conversation.conversation_id || conversation.uuid || "",
    title: conversation.title || conversation.name || "Untitled chat",
    summary: conversation.summary || conversation.last_message || conversation.preview || "",
    created_at: conversation.created_at || conversation.createdAt || "",
    updated_at: conversation.updated_at || conversation.updatedAt || conversation.created_at || ""
  };
}

function extractMessages(data) {
  const rows = data?.messages || data?.data || data?.items || data || [];
  return Array.isArray(rows) ? rows.map(normalizeMessage).filter((message) => message.id || message.content) : [];
}

function normalizeMessage(message = {}) {
  return {
    id: message.id || message.uuid || `${message.role || "message"}-${message.created_at || Math.random()}`,
    role: normalizeRole(message.role || message.sender || message.type),
    content: message.content || message.message || message.answer || message.text || "",
    sources: Array.isArray(message.sources) ? message.sources : [],
    created_at: message.created_at || message.createdAt || ""
  };
}

function normalizeAiAnswer(data = {}) {
  const payload = data?.message || data?.data || data;
  return {
    id: payload.id || `assistant-${Date.now()}`,
    role: "assistant",
    content: payload.answer || payload.content || payload.message || "",
    sources: Array.isArray(payload.sources) ? payload.sources : [],
    created_at: payload.created_at || new Date().toISOString()
  };
}

function createLocalMessage({ content, role }) {
  return {
    id: `${role}-${Date.now()}`,
    role,
    content,
    sources: [],
    created_at: new Date().toISOString()
  };
}

function normalizeRole(role) {
  const value = String(role || "").toLowerCase();
  if (["assistant", "ai", "bot"].includes(value)) return "assistant";
  return "user";
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
