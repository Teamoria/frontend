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
import { useRealtimePrivateChannel } from "../lib/RealtimeContext.jsx";
import { usePreferences } from "../lib/PreferencesContext.jsx";
import "../styles/ai-chat.css";

const aiChatCopy = {
  ar: {
    title: "مساعد Teamoria",
    subtitle: "اسأل عن المشاريع والمهام والملفات والمخاطر، واحصل على إجابة مرتبطة بسياقك.",
    newChat: "محادثة جديدة",
    chats: "المحادثات",
    conversations: (count) => `${count} محادثة`,
    noConversations: "لا توجد محادثات بعد",
    noConversationsText: "ابدأ محادثة واسأل عن عمل فريقك وسياقه.",
    newConversation: "محادثة جديدة",
    sourcesCount: (count) => `${count} مصدر مرفق أو مُستشهد به`,
    contextReady: "سياق مساحة العمل جاهز",
    startHint: "ابدأ بسؤال أو اختر محادثة",
    addSource: "إضافة مصدر",
    assistantQuestion: "كيف أساعدك في Teamoria اليوم؟",
    assistantHint: "اسأل عن خطر مشروع أو مهمة أو ملف مرفوع أو حالة التسليم.",
    placeholder: "اكتب سؤالك إلى مساعد Teamoria…",
    thinking: "يفكّر",
    send: "إرسال",
    connected: "متصل عبر Reverb",
    connecting: "جارٍ الاتصال اللحظي",
    fallback: "التحديث عبر الاستعلام الاحتياطي",
    prompts: ["ما أبرز مخاطر التسليم الآن؟", "لخّص آخر القرارات المرتبطة بالمشروع", "ما المهام المتوقفة ومن المسؤول عنها؟"]
  },
  en: {
    title: "Teamoria Assistant",
    subtitle: "Ask about projects, tasks, files, and risks, with answers grounded in your workspace context.",
    newChat: "New chat",
    chats: "Chats",
    conversations: (count) => `${count} conversations`,
    noConversations: "No conversations yet",
    noConversationsText: "Start a chat and ask about your team's work and context.",
    newConversation: "New conversation",
    sourcesCount: (count) => `${count} sources attached or cited`,
    contextReady: "Workspace context ready",
    startHint: "Start with a question or choose a chat",
    addSource: "Add source",
    assistantQuestion: "How can I help with Teamoria today?",
    assistantHint: "Ask about project risk, tasks, uploaded files, or delivery status.",
    placeholder: "Message Teamoria AI…",
    thinking: "Thinking",
    send: "Send",
    connected: "Connected through Reverb",
    connecting: "Connecting realtime",
    fallback: "Using polling fallback",
    prompts: null
  }
};

export default function AiChatPage() {
  const { user } = useAuth();
  const { language } = usePreferences();
  const copy = aiChatCopy[language] || aiChatCopy.en;
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
  const conversationMessagesRef = useRef({});
  const thinkingTimersRef = useRef({});
  const pollingWatchdogsRef = useRef({});
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const activeConversationIdRef = useRef("");
  const userId = user?.id || user?.user_id;
  const { configured: isRealtimeConfigured, connectionStatus, isReady: isRealtimeReady, subscriptionStatus } = useRealtimePrivateChannel({
    channelName: userId ? `chat.${userId}` : "",
    eventName: ".ai.message.received",
    enabled: Boolean(userId),
    onEvent: (event) => handleRealtimeAiMessage(event?.message || event)
  });
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
    conversationMessagesRef.current = conversationMessages;
  }, [conversationMessages]);

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
    Object.keys(pollingWatchdogsRef.current).forEach(cancelMessagePollingWatchdog);
  }, []);

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
    const previousServerMessageCount = messages.filter((item) => !item.isThinking && !String(item.id || "").startsWith("user-")).length;
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
      conversationMessagesRef.current = { ...conversationMessagesRef.current, [conversationId]: nextUserMessages };
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
      const immediateAssistantMessage = extractImmediateAssistantMessage(data);
      const serverMessagesBeforeMerge = serverConversationId !== conversationId
        ? conversationMessagesRef.current[serverConversationId] || []
        : [];
      const hasRealtimeReplyBeforeMerge = hasConcreteAssistantMessage(serverMessagesBeforeMerge);
      let hasResolvedAssistantReply = Boolean(immediateAssistantMessage) || hasRealtimeReplyBeforeMerge;

      setActiveConversationId(serverConversationId);
      setConversationMessages((current) => {
        const currentMessages = current[conversationId] || nextUserMessages;
        const existingServerMessages = serverConversationId !== conversationId ? current[serverConversationId] || [] : [];
        const hasRealtimeReply = hasConcreteAssistantMessage(existingServerMessages);
        const mergedMessages = existingServerMessages.length
          ? mergeLoadedMessages(currentMessages, existingServerMessages, { hasNewAiReply: hasRealtimeReply })
          : currentMessages;
        const resolvedMessages = immediateAssistantMessage
          ? replaceThinkingMessage(mergedMessages, processingMessageId, immediateAssistantMessage)
          : hasRealtimeReply
            ? removeThinkingMessages(mergedMessages)
            : mergedMessages;
        const next = { ...current, [serverConversationId]: resolvedMessages };
        hasResolvedAssistantReply = hasResolvedAssistantReply || hasRealtimeReply;
        if (serverConversationId !== conversationId) {
          delete next[conversationId];
          moveThinkingProgress(conversationId, serverConversationId, processingMessageId);
        }
        if (activeConversationIdRef.current === conversationId || activeConversationIdRef.current === serverConversationId) {
          setMessages(resolvedMessages);
        }
        conversationMessagesRef.current = next;
        return next;
      });
      if (hasResolvedAssistantReply) {
        stopThinkingProgress(serverConversationId);
        if (immediateAssistantMessage) {
          setMessages((current) => replaceThinkingMessage(current, processingMessageId, immediateAssistantMessage));
        }
      } else {
        setMessages((current) => current.map((item) => (
          item.id === processingMessageId ? { ...item, content: "Searching workspace context..." } : item
        )));
      }
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
      if (!immediateAssistantMessage) {
        startMessagePollingWatchdog(
          serverConversationId,
          { submittedAt, previousAssistantCount, previousServerMessageCount, userContent: message },
          { initialDelay: isRealtimeReady ? 5000 : 1200 }
        );
      }
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

  function startMessagePollingWatchdog(conversationId, replyCheck = {}, { initialDelay = 5000 } = {}) {
    cancelMessagePollingWatchdog(conversationId);

    const watchdog = { cancelled: false, timeoutId: null };
    pollingWatchdogsRef.current[conversationId] = watchdog;

    async function poll(attempt) {
      if (watchdog.cancelled) return;

      try {
        const payload = await listChatSessionMessages(conversationId);
        if (watchdog.cancelled) return;

        const nextMessages = extractMessages(getPayloadData(payload) || payload);
        const hasNewAiReply = hasAssistantReplyForLatestQuestion(nextMessages, replyCheck);
        if (hasNewAiReply) {
          cancelMessagePollingWatchdog(conversationId);
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
          schedule(attempt + 1, 3000);
        } else if (!hasNewAiReply) {
          finishMessagePollingWatchdog(conversationId, watchdog);
        }
      } catch {
        if (watchdog.cancelled) return;
        if (attempt < 3) {
          schedule(attempt + 1, 3000);
        } else {
          finishMessagePollingWatchdog(conversationId, watchdog);
        }
      }
    }

    function schedule(attempt, delay) {
      if (watchdog.cancelled) return;
      watchdog.timeoutId = window.setTimeout(() => poll(attempt), delay);
    }

    schedule(1, initialDelay);
  }

  function cancelMessagePollingWatchdog(conversationId) {
    const watchdog = pollingWatchdogsRef.current[conversationId];
    if (!watchdog) return;
    watchdog.cancelled = true;
    if (watchdog.timeoutId) {
      window.clearTimeout(watchdog.timeoutId);
    }
    delete pollingWatchdogsRef.current[conversationId];
  }

  function finishMessagePollingWatchdog(conversationId, watchdog) {
    if (pollingWatchdogsRef.current[conversationId] === watchdog) {
      delete pollingWatchdogsRef.current[conversationId];
    }
  }

  function handleRealtimeAiMessage(rawMessage) {
    const nextMessage = normalizeMessage(rawMessage);
    const conversationId = rawMessage?.chat_session_id || rawMessage?.session_id || rawMessage?.conversation_id;

    if (!conversationId || !nextMessage.content) {
      return;
    }

    cancelMessagePollingWatchdog(conversationId);

    setConversationMessages((current) => {
      stopThinkingProgress(conversationId);
      const existingMessages = current[conversationId] || [];
      const withoutProcessing = existingMessages.filter(
        (message) => !(message.role === "assistant" && String(message.id || "").startsWith("processing-"))
      );
      const alreadyExists = withoutProcessing.some((message) => message.id === nextMessage.id);
      const nextMessages = alreadyExists ? withoutProcessing : [...withoutProcessing, nextMessage];
      const next = { ...current, [conversationId]: nextMessages };
      conversationMessagesRef.current = next;
      return next;
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
    window.clearInterval(timerId);
    delete thinkingTimersRef.current[fromConversationId];
    updateThinkingMessage(toConversationId, messageId, "Searching workspace context...");
    startThinkingProgress(toConversationId, messageId);
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
        title={copy.title}
        subtitle={copy.subtitle}
        actions={(
          <div className="ai-chat-page-actions">
            <span className={`ai-realtime-pill ${isRealtimeReady ? "is-connected" : connectionStatus === "connecting" || subscriptionStatus === "subscribing" ? "is-connecting" : "is-fallback"}`} role="status" aria-live="polite">
              <i aria-hidden="true" />
              {isRealtimeReady ? copy.connected : isRealtimeConfigured && (connectionStatus === "connecting" || subscriptionStatus === "subscribing") ? copy.connecting : copy.fallback}
            </span>
            <button className="product-button" type="button" onClick={startConversation}>
              <FiPlus aria-hidden="true" />
              {copy.newChat}
            </button>
          </div>
        )}
      >
      <section className="ai-chat-command">
        <aside className="ai-chat-sidebar" aria-label={copy.chats}>
          <div className="ai-sidebar-head">
            <div>
              <h2>{copy.chats}</h2>
              <span>{copy.conversations(conversations.length)}</span>
            </div>
            <button type="button" onClick={startConversation}>
              <FiPlus aria-hidden="true" />
              {copy.newChat}
            </button>
          </div>

          <div className="ai-conversation-list">
            {status.loadingConversations ? <ConversationSkeleton /> : null}
            {!status.loadingConversations && conversations.length === 0 ? (
              <div className="ai-chat-empty">
                <FiZap aria-hidden="true" />
                <h2>{copy.noConversations}</h2>
                <p>{copy.noConversationsText}</p>
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
              <h2>{activeConversation?.title || copy.newConversation}</h2>
              <span>{sourceCount ? copy.sourcesCount(sourceCount) : activeConversation ? copy.contextReady : copy.startHint}</span>
            </div>
            <div className="ai-thread-actions">
              <label>
                <input type="file" multiple onChange={handleFiles} />
                <FiFilePlus aria-hidden="true" />
                {copy.addSource}
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
                <h2>{copy.assistantQuestion}</h2>
                <p>{copy.assistantHint}</p>
                <div className="ai-prompt-grid">
                  {(copy.prompts || SUGGESTED_PROMPTS).map((prompt) => (
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
                placeholder={copy.placeholder}
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
                <span>{status.sending ? copy.thinking : copy.send}</span>
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
    role: normalizeRole(message.role || message.sender || message.type || message.author || message.source),
    content: message.content || message.message_content || message.message || message.answer || message.reply || message.response || message.text || "",
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
  if (["assistant", "ai", "bot", "model", "agent", "teamoria_ai", "ai_assistant"].includes(value)) return "assistant";
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

function hasConcreteAssistantMessage(messages) {
  return messages.some((message) => message.role === "assistant" && !message.isThinking);
}

function removeThinkingMessages(messages) {
  return messages.filter((message) => !message.isThinking && !String(message.id || "").startsWith("processing-"));
}

function hasAssistantReplyForLatestQuestion(messages, { submittedAt, previousAssistantCount = 0, previousServerMessageCount = 0, userContent = "" } = {}) {
  const assistantMessages = messages.filter((message) => message.role === "assistant" && !message.isThinking);
  if (assistantMessages.length > previousAssistantCount) return true;
  if (messages.length > previousServerMessageCount + 1 && assistantMessages.length) return true;
  if (hasAssistantAfterSubmittedUser(messages, userContent)) return true;
  if (!submittedAt) return assistantMessages.length > 0;

  const submittedTime = new Date(submittedAt).getTime();
  if (Number.isNaN(submittedTime)) return false;

  return assistantMessages.some((message) => {
    const createdTime = new Date(message.created_at || "").getTime();
    return !Number.isNaN(createdTime) && createdTime >= submittedTime;
  });
}

function hasAssistantAfterSubmittedUser(messages, userContent) {
  const needle = normalizeComparableText(userContent);
  if (!needle) return false;
  const submittedUserIndex = messages.findIndex((message) => (
    message.role === "user" && normalizeComparableText(message.content) === needle
  ));
  if (submittedUserIndex < 0) return false;

  const laterMessages = messages.slice(submittedUserIndex + 1);
  const earlierMessages = messages.slice(0, submittedUserIndex);
  return laterMessages.some((message) => message.role === "assistant")
    || earlierMessages.some((message) => message.role === "assistant" && messages[0]?.role === "assistant");
}

function extractImmediateAssistantMessage(data = {}) {
  const candidates = [
    data.assistant_message,
    data.ai_message,
    data.reply_message,
    data.response_message,
    data.data?.assistant_message,
    data.data?.ai_message,
    data.data?.reply_message,
    data.data?.response_message
  ].filter(Boolean);

  for (const candidate of candidates) {
    const normalized = typeof candidate === "string"
      ? createLocalMessage({ role: "assistant", content: candidate })
      : normalizeMessage(candidate);
    if (normalized.content && normalized.role === "assistant") return normalized;
  }

  const content = data.reply || data.answer || data.response || data.ai_response || data.data?.reply || data.data?.answer || data.data?.response;
  return content ? createLocalMessage({ role: "assistant", content }) : null;
}

function replaceThinkingMessage(messages, thinkingMessageId, assistantMessage) {
  const normalizedAssistant = {
    ...assistantMessage,
    role: "assistant",
    isThinking: false,
    id: assistantMessage.id || `assistant-${Date.now()}`,
    created_at: assistantMessage.created_at || new Date().toISOString()
  };
  const hasThinkingMessage = messages.some((message) => message.id === thinkingMessageId || message.isThinking);
  if (!hasThinkingMessage) return [...messages, normalizedAssistant];
  return messages.map((message) => (
    message.id === thinkingMessageId || message.isThinking ? normalizedAssistant : message
  ));
}

function normalizeComparableText(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
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
