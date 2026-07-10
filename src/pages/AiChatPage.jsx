import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiCheck,
  FiEdit3,
  FiFilePlus,
  FiMic,
  FiMoreVertical,
  FiPaperclip,
  FiPlus,
  FiRefreshCw,
  FiSend,
  FiTrash2,
  FiX,
  FiZap
} from "react-icons/fi";
import AppShell, { AppPageLayout } from "../components/app/AppShell.jsx";
import {
  getPayloadData,
  deleteAiConversation,
  listChatSessionMessages,
  listChatSessions,
  sendChatMessage,
  updateAiConversation
} from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { getEcho, isRealtimeChatConfigured } from "../lib/reverb.js";
import "../styles/ai-chat.css";

export default function AiChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationMessages, setConversationMessages] = useState({});
  const [draft, setDraft] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [status, setStatus] = useState({ loadingConversations: true, loadingMessages: false, sending: false, error: "" });
  const [openMenuId, setOpenMenuId] = useState("");
  const [renamingConversationId, setRenamingConversationId] = useState("");
  const [renameDraft, setRenameDraft] = useState("");
  const thinkingTimersRef = useRef({});
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const activeConversationIdRef = useRef("");
  const sourceCount = useMemo(
    () => messages.reduce((total, message) => total + (Array.isArray(message.sources) ? message.sources.length : 0), 0) + selectedFiles.length,
    [messages, selectedFiles]
  );

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

  useEffect(() => () => {
    Object.values(thinkingTimersRef.current).forEach((timerId) => window.clearInterval(timerId));
  }, []);

  useEffect(() => {
    const userId = user?.id || user?.user_id;
    if (!userId || !isRealtimeChatConfigured()) {
      return undefined;
    }

    const echo = getEcho();
    if (!echo) {
      return undefined;
    }

    const channelName = `chat.${userId}`;
    const channel = echo.private(channelName);

    channel.listen(".ai.message.received", (event) => {
      handleRealtimeAiMessage(event?.message || event);
    });

    return () => {
      echo.leave(channelName);
    };
  }, [user?.id, user?.user_id]);

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
      setConversationMessages((current) => {
        const mergedMessages = mergeLoadedMessages(current[conversationId] || [], nextMessages);
        if (activeConversationIdRef.current === conversationId) {
          setMessages(mergedMessages);
        }
        return { ...current, [conversationId]: mergedMessages };
      });
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
    const processingMessageId = `processing-${Date.now()}`;
    const submittedAt = new Date().toISOString();
    const previousAssistantCount = messages.filter((item) => item.role === "assistant" && !item.isThinking).length;
    setStatusPatch({ sending: true, error: "" });

    try {
      const userMessage = createLocalMessage({ id: tempMessageId, content: message, role: "user", created_at: submittedAt });
      const assistantThinkingMessage = createLocalMessage({
        id: processingMessageId,
        content: getThinkingStep(0),
        role: "assistant",
        isThinking: true
      });
      const nextUserMessages = [...messages, userMessage, assistantThinkingMessage];

      setActiveConversationId(conversationId);
      setConversationMessages((current) => ({ ...current, [conversationId]: nextUserMessages }));
      setMessages(nextUserMessages);
      startThinkingProgress(conversationId, processingMessageId);
      setDraft("");
      resizeComposer("");

      const payload = await sendChatMessage({
        session_id: activeConversationId || undefined,
        project_id: activeConversation?.project_id || null,
        message_content: message
      });
      const data = getPayloadData(payload) || payload || {};
      const serverConversationId = data.session_id || data.chat_session_id || conversationId;

      setActiveConversationId(serverConversationId);
      setConversationMessages((current) => {
        const currentMessages = current[conversationId] || nextUserMessages;
        const next = { ...current, [serverConversationId]: currentMessages };
        if (serverConversationId !== conversationId) {
          delete next[conversationId];
          moveThinkingProgress(conversationId, serverConversationId, processingMessageId);
        }
        return next;
      });
      setMessages((current) => current.map((item) => (
        item.id === processingMessageId ? { ...item, content: "Searching workspace context..." } : item
      )));
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
      scheduleMessageRefresh(serverConversationId, 1, { submittedAt, previousAssistantCount });
    } catch (error) {
      stopThinkingProgress(conversationId);
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

  function applyPrompt(prompt) {
    setDraft(prompt);
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
      resizeComposer(prompt);
    });
  }

  function resizeComposer(value) {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(160, Math.max(48, textareaRef.current.scrollHeight || value.length))}px`;
  }

  function handleFiles(event) {
    setSelectedFiles(Array.from(event.target.files || []));
  }

  function scheduleMessageRefresh(conversationId, attempt = 1, replyCheck = {}) {
    const delay = attempt === 1 ? 1500 : 3000;
    window.setTimeout(async () => {
      try {
        const payload = await listChatSessionMessages(conversationId);
        const nextMessages = extractMessages(getPayloadData(payload) || payload);
        const hasNewAiReply = hasAssistantReplyForLatestQuestion(nextMessages, replyCheck);
        if (hasNewAiReply) {
          stopThinkingProgress(conversationId);
        }
        setConversationMessages((current) => {
          const mergedMessages = mergeLoadedMessages(current[conversationId] || [], nextMessages, { hasNewAiReply });
          if (activeConversationIdRef.current === conversationId) {
            setMessages(mergedMessages);
          }
          return { ...current, [conversationId]: mergedMessages };
        });
        if (!hasNewAiReply && attempt < 10) {
          scheduleMessageRefresh(conversationId, attempt + 1, replyCheck);
        }
      } catch {
        if (attempt < 3) {
          scheduleMessageRefresh(conversationId, attempt + 1, replyCheck);
        }
      }
    }, delay);
  }

  function handleRealtimeAiMessage(rawMessage) {
    const nextMessage = normalizeMessage(rawMessage);
    const conversationId = rawMessage?.chat_session_id || rawMessage?.session_id || rawMessage?.conversation_id;

    if (!conversationId || !nextMessage.content) {
      return;
    }

    setConversationMessages((current) => {
      stopThinkingProgress(conversationId);
      const existingMessages = current[conversationId] || [];
      const withoutProcessing = existingMessages.filter(
        (message) => !(message.role === "assistant" && String(message.id || "").startsWith("processing-"))
      );
      const alreadyExists = withoutProcessing.some((message) => message.id === nextMessage.id);
      const nextMessages = alreadyExists ? withoutProcessing : [...withoutProcessing, nextMessage];
      return { ...current, [conversationId]: nextMessages };
    });

    if (activeConversationIdRef.current === conversationId) {
      setMessages((current) => {
        const withoutProcessing = current.filter(
          (message) => !(message.role === "assistant" && String(message.id || "").startsWith("processing-"))
        );
        const alreadyExists = withoutProcessing.some((message) => message.id === nextMessage.id);
        return alreadyExists ? withoutProcessing : [...withoutProcessing, nextMessage];
      });
    }

    setConversations((current) => upsertConversation(current, {
      id: conversationId,
      summary: nextMessage.content,
      updated_at: nextMessage.created_at || new Date().toISOString()
    }));
  }

  function startThinkingProgress(conversationId, messageId) {
    stopThinkingProgress(conversationId);
    let step = 0;
    thinkingTimersRef.current[conversationId] = window.setInterval(() => {
      step = Math.min(step + 1, THINKING_STEPS.length - 1);
      updateThinkingMessage(conversationId, messageId, getThinkingStep(step));
    }, 1800);
  }

  function moveThinkingProgress(fromConversationId, toConversationId, messageId) {
    const timerId = thinkingTimersRef.current[fromConversationId];
    if (!timerId || fromConversationId === toConversationId) return;
    delete thinkingTimersRef.current[fromConversationId];
    thinkingTimersRef.current[toConversationId] = timerId;
    updateThinkingMessage(toConversationId, messageId, "Searching workspace context...");
  }

  function stopThinkingProgress(conversationId) {
    const timerId = thinkingTimersRef.current[conversationId];
    if (!timerId) return;
    window.clearInterval(timerId);
    delete thinkingTimersRef.current[conversationId];
  }

  function updateThinkingMessage(conversationId, messageId, content) {
    setConversationMessages((current) => {
      const currentMessages = current[conversationId] || [];
      const nextMessages = currentMessages.map((message) => (
        message.id === messageId ? { ...message, content } : message
      ));
      if (activeConversationIdRef.current === conversationId) {
        setMessages(nextMessages);
      }
      return { ...current, [conversationId]: nextMessages };
    });
  }

  function beginRename(conversation) {
    setOpenMenuId("");
    setRenamingConversationId(conversation.id);
    setRenameDraft(conversation.title || "");
  }

  async function saveConversationRename(conversationId) {
    const title = renameDraft.trim();
    if (!title) return;
    setConversations((current) => current.map((conversation) => (
      conversation.id === conversationId ? { ...conversation, title, updated_at: new Date().toISOString() } : conversation
    )));
    setRenamingConversationId("");
    setRenameDraft("");
    try {
      await updateAiConversation(conversationId, { title });
    } catch (error) {
      setStatusPatch({ error: error.message || "Unable to rename conversation." });
    }
  }

  async function deleteConversation(conversationId) {
    setOpenMenuId("");
    const conversation = conversations.find((item) => item.id === conversationId);
    const ok = window.confirm(`Delete "${conversation?.title || "this conversation"}"? This will remove it from the list.`);
    if (!ok) return;
    setConversations((current) => current.filter((item) => item.id !== conversationId));
    setConversationMessages((current) => {
      const next = { ...current };
      delete next[conversationId];
      return next;
    });
    if (activeConversationId === conversationId) {
      setActiveConversationId("");
      setMessages([]);
    }
    try {
      await deleteAiConversation(conversationId);
    } catch (error) {
      setStatusPatch({ error: error.message || "Unable to delete conversation." });
      await loadConversations({ silent: true });
    }
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
            <div>
              <h2>Chats</h2>
              <span>{conversations.length} conversations</span>
            </div>
            <button type="button" onClick={startConversation}>
              <FiPlus aria-hidden="true" />
              New
            </button>
          </div>

          <div className="ai-conversation-list">
            {status.loadingConversations ? <ConversationSkeleton /> : null}
            {!status.loadingConversations && conversations.length === 0 ? (
              <div className="ai-chat-empty">
                <FiZap aria-hidden="true" />
                <h2>No conversations yet</h2>
                <p>Start a new chat to ask about projects, files, tasks, and risks.</p>
              </div>
            ) : null}
            {!status.loadingConversations ? conversations.map((conversation) => (
              <article
                className={conversation.id === activeConversationId ? "is-active" : ""}
                key={conversation.id}
              >
                {renamingConversationId === conversation.id ? (
                  <form className="ai-conversation-rename" onSubmit={(event) => {
                    event.preventDefault();
                    saveConversationRename(conversation.id);
                  }}>
                    <input
                      autoFocus
                      value={renameDraft}
                      onChange={(event) => setRenameDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          setRenamingConversationId("");
                          setRenameDraft("");
                        }
                      }}
                    />
                    <button type="submit" aria-label="Save conversation name"><FiCheck aria-hidden="true" /></button>
                    <button type="button" aria-label="Cancel rename" onClick={() => setRenamingConversationId("")}><FiX aria-hidden="true" /></button>
                  </form>
                ) : (
                  <>
                    <button className="ai-conversation-main" type="button" onClick={() => setActiveConversationId(conversation.id)}>
                      <b>{getDisplayConversationTitle(conversation, conversations)}</b>
                      <span>{conversation.summary || "No messages yet"}</span>
                      <time>{formatConversationTime(conversation.updated_at || conversation.created_at) || "Recent"}</time>
                    </button>
                    <button
                      className="ai-conversation-menu-button"
                      type="button"
                      aria-label="Conversation actions"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenMenuId((current) => current === conversation.id ? "" : conversation.id);
                      }}
                    >
                      <FiMoreVertical aria-hidden="true" />
                    </button>
                    {openMenuId === conversation.id ? (
                      <div className="ai-conversation-menu">
                        <button type="button" onClick={() => beginRename(conversation)}><FiEdit3 aria-hidden="true" />Rename</button>
                        <button type="button" onClick={() => deleteConversation(conversation.id)}><FiTrash2 aria-hidden="true" />Delete</button>
                      </div>
                    ) : null}
                  </>
                )}
              </article>
            )) : null}
          </div>
        </aside>

        <main className="ai-chat-surface">
          <header className="ai-chat-thread-head">
            <div>
              <h2>{activeConversation?.title || "New conversation"}</h2>
              <span>{sourceCount ? `${sourceCount} sources attached or cited` : activeConversation ? "Workspace context ready" : "Start with a question or choose a chat"}</span>
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
              {activeConversation ? (
                <>
                  <button type="button" onClick={() => beginRename(activeConversation)} aria-label="Rename conversation">
                    <FiEdit3 aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => deleteConversation(activeConversation.id)} aria-label="Delete conversation">
                    <FiTrash2 aria-hidden="true" />
                  </button>
                </>
              ) : null}
            </div>
          </header>

          {status.error ? <p className="ai-chat-alert">{status.error}</p> : null}

          <section className="ai-message-window" aria-label="AI chat messages">
            {status.loadingMessages ? <MessageSkeleton /> : null}
            {!status.loadingMessages && messages.length === 0 ? (
              <div className="ai-message-empty">
                <FiZap aria-hidden="true" />
                <h2>How can I help with Teamoria today?</h2>
                <p>Ask about project risk, tasks, uploaded files, meetings, or company delivery status.</p>
                <div className="ai-prompt-grid">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button type="button" key={prompt} onClick={() => applyPrompt(prompt)}>{prompt}</button>
                  ))}
                </div>
              </div>
            ) : null}
            {!status.loadingMessages ? messages.map((message) => <ChatMessage key={message.id} message={message} />) : null}
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
                <span>{status.sending ? "Thinking" : "Send"}</span>
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
    <article className={`ai-message ${isUser ? "ai-message--user" : "ai-message--assistant"} ${message.isThinking ? "ai-message--thinking" : ""}`}>
      {!isUser ? (
        <div className="ai-message-label">
          <FiZap aria-hidden="true" />
          <span>Teamoria AI</span>
        </div>
      ) : null}
      <p>{message.content}</p>
      {message.isThinking ? (
        <div className="ai-thinking-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      ) : null}
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

function ConversationSkeleton() {
  return (
    <div className="ai-conversation-skeleton" aria-label="Loading conversations">
      {[0, 1, 2, 3].map((item) => <span key={item} />)}
    </div>
  );
}

function MessageSkeleton() {
  return (
    <div className="ai-message-skeleton" aria-label="Loading messages">
      <span />
      <span />
      <span />
    </div>
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

function createLocalMessage({ id, content, role, sources = [], isThinking = false, created_at }) {
  return {
    id: id || `${role}-${Date.now()}`,
    role,
    content,
    sources,
    isThinking,
    created_at: created_at || new Date().toISOString()
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

function getDisplayConversationTitle(conversation, conversations) {
  if (conversation.title && conversation.title !== "Untitled chat") return conversation.title;
  if (conversation.summary) return getConversationTitle(conversation.summary);
  const index = conversations.findIndex((item) => item.id === conversation.id);
  return `Workspace chat ${index + 1}`;
}

function mergeLoadedMessages(currentMessages, serverMessages, { hasNewAiReply } = {}) {
  const hasServerAssistant = serverMessages.some((message) => message.role === "assistant");
  if (hasNewAiReply || (!currentMessages.some((message) => message.isThinking) && hasServerAssistant)) {
    return serverMessages.filter((message) => !message.isThinking);
  }
  const thinkingMessages = currentMessages.filter((message) => message.isThinking);
  if (!thinkingMessages.length) return serverMessages;
  const localOnly = currentMessages.filter((message) => String(message.id || "").startsWith("user-"));
  const baseMessages = serverMessages.length ? serverMessages : localOnly;
  return [...baseMessages, ...thinkingMessages];
}

function hasAssistantReplyForLatestQuestion(messages, { submittedAt, previousAssistantCount = 0 } = {}) {
  const assistantMessages = messages.filter((message) => message.role === "assistant" && !message.isThinking);
  if (assistantMessages.length > previousAssistantCount) return true;
  if (!submittedAt) return assistantMessages.length > 0;

  const submittedTime = new Date(submittedAt).getTime();
  if (Number.isNaN(submittedTime)) return false;

  return assistantMessages.some((message) => {
    const createdTime = new Date(message.created_at || "").getTime();
    return !Number.isNaN(createdTime) && createdTime >= submittedTime;
  });
}

const THINKING_STEPS = [
  "Teamoria AI is thinking...",
  "Understanding your question...",
  "Searching workspace context...",
  "Drafting answer..."
];

const SUGGESTED_PROMPTS = [
  "Summarize project risks",
  "Show overdue tasks",
  "Analyze uploaded files",
  "Create task plan"
];

function getThinkingStep(index) {
  return THINKING_STEPS[Math.min(index, THINKING_STEPS.length - 1)];
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
