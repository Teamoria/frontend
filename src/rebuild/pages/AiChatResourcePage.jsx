import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiPlus, FiRefreshCw, FiWifi, FiWifiOff } from "react-icons/fi";
import { useAuth } from "../../lib/AuthContext.jsx";
import { usePreferences } from "../../lib/PreferencesContext.jsx";
import { useRealtimePrivateChannel } from "../../lib/RealtimeContext.jsx";
import {
  extractPagination,
  extractRows,
  getPayloadData,
  listChatSessionMessages,
  listChatSessions,
  listCompanyProjects,
  sendChatMessage
} from "../../lib/api.js";
import { Button, PageHeader } from "../ui.jsx";
import ChatComposer from "./chat/ChatComposer.jsx";
import ChatMessages from "./chat/ChatMessages.jsx";
import ChatProjectSelector from "./chat/ChatProjectSelector.jsx";
import ChatSessionList from "./chat/ChatSessionList.jsx";
import {
  hasAssistantReply,
  mergeMessages,
  normalizeCursor,
  normalizeMessage,
  normalizeMessages,
  normalizeProject,
  normalizeSession,
  safeErrorMessage
} from "./chat/chatHelpers.js";
import "./chat/chat.css";

const copyMap = {
  ar: {
    title: "مساعد Teamoria",
    subtitle: "اسأل داخل مشروع محدد فقط. هذا القيد حماية من الواجهة حتى يدعم الباك اند نطاقًا إلزاميًا.",
    eyebrow: "AI CHAT",
    newChat: "محادثة جديدة",
    sessions: "المحادثات",
    sessionCount: (count) => `${count} محادثة`,
    noSessions: "لا توجد محادثات بعد",
    noSessionsText: "اختر مشروعًا ثم ابدأ سؤالًا جديدًا.",
    sessionsError: "تعذر تحميل المحادثات.",
    messages: "رسائل المحادثة",
    messagesError: "تعذر تحميل الرسائل.",
    emptyTitle: "ابدأ بسؤال عن مشروعك",
    emptyText: "اختر مشروعًا قبل أول رسالة. بعد بدء الجلسة يبقى المشروع مقفلاً.",
    assistantName: "Teamoria AI",
    projectScope: "نطاق المشروع",
    chooseProject: "اختر مشروعًا",
    loadingProjects: "تحميل المشاريع...",
    retryProjects: "إعادة تحميل المشاريع",
    projectUnavailable: "مشروع غير متوفر",
    unknownProject: "مشروع محفوظ",
    frontendSafeguard: "حماية من الواجهة فقط: لا يتم إرسال محادثة جديدة دون project_id.",
    placeholder: "اكتب سؤالك عن هذا المشروع...",
    send: "إرسال",
    processing: "جاري المعالجة",
    retry: "إعادة المحاولة",
    retrySessions: "إعادة تحميل المحادثات",
    retrySend: "إعادة الإرسال",
    sendFailed: "فشل إرسال الرسالة. بقي النص محفوظًا.",
    loadMore: "تحميل المزيد",
    selectProjectFirst: "اختر مشروعًا قبل بدء محادثة جديدة.",
    noProjects: "لا توجد مشاريع متاحة لهذا الحساب.",
    realtimeConnected: "متصل لحظيًا",
    realtimeFallback: "تحديث بالاستعلام",
    sourcesLimitation: "المصادر غير معروضة لأن العقد الحالي لا يرجع مصادر منظمة.",
    refresh: "تحديث"
  },
  en: {
    title: "Teamoria assistant",
    subtitle: "Ask inside one selected project. This is a frontend safeguard until the backend requires project scope.",
    eyebrow: "AI CHAT",
    newChat: "New chat",
    sessions: "Sessions",
    sessionCount: (count) => `${count} sessions`,
    noSessions: "No sessions yet",
    noSessionsText: "Choose a project, then start with a question.",
    sessionsError: "Unable to load sessions.",
    messages: "Chat messages",
    messagesError: "Unable to load messages.",
    emptyTitle: "Start with a project question",
    emptyText: "Choose a project before the first message. Once a session starts, the project stays locked.",
    assistantName: "Teamoria AI",
    projectScope: "Project scope",
    chooseProject: "Choose a project",
    loadingProjects: "Loading projects...",
    retryProjects: "Reload projects",
    projectUnavailable: "Project unavailable",
    unknownProject: "Saved project",
    frontendSafeguard: "Frontend safeguard only: new chats are never sent without project_id.",
    placeholder: "Ask about this project...",
    send: "Send",
    processing: "Processing",
    retry: "Retry",
    retrySessions: "Reload sessions",
    retrySend: "Retry send",
    sendFailed: "Message failed. Your draft was preserved.",
    loadMore: "Load more",
    selectProjectFirst: "Choose a project before starting a new chat.",
    noProjects: "No projects are available for this account.",
    realtimeConnected: "Realtime connected",
    realtimeFallback: "Polling updates",
    sourcesLimitation: "Sources are hidden because the current contract does not return structured citations.",
    refresh: "Refresh"
  }
};

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 120000;

export default function AiChatResourcePage() {
  const { user } = useAuth();
  const { direction, language } = usePreferences();
  const copy = copyMap[language] || copyMap.en;
  const [sessions, setSessions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [messagesBySession, setMessagesBySession] = useState({});
  const [messageCursorBySession, setMessageCursorBySession] = useState({});
  const [draft, setDraft] = useState("");
  const [failedSend, setFailedSend] = useState(null);
  const [pendingBySession, setPendingBySession] = useState({});
  const [status, setStatus] = useState({
    sessions: "loading",
    projects: "loading",
    messages: "idle",
    sending: false,
    error: ""
  });
  const activeSessionRef = useRef("");
  const pollingRef = useRef({});
  const messagesEndRef = useRef(null);
  const userId = user?.id || user?.user_id || "";

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) || null,
    [activeSessionId, sessions]
  );
  const activeMessages = activeSessionId ? messagesBySession[activeSessionId] || [] : messagesBySession.new || [];
  const activeCursor = activeSessionId ? messageCursorBySession[activeSessionId] : null;
  const selectedProject = projects.find((project) => project.id === selectedProjectId) || null;
  const disabledReason = useMemo(() => {
    if (activeSession) return "";
    if (status.projects === "loading") return copy.loadingProjects;
    if (status.projects === "ready" && projects.length === 0) return copy.noProjects;
    if (!selectedProjectId) return copy.selectProjectFirst;
    return "";
  }, [activeSession, copy, projects.length, selectedProjectId, status.projects]);

  const realtime = useRealtimePrivateChannel({
    channelName: userId ? `chat.${userId}` : "",
    eventName: ".ai.message.received",
    enabled: Boolean(userId),
    onEvent: (event) => handleRealtimeMessage(event?.message || event)
  });

  useEffect(() => {
    loadProjects();
    loadSessions();
    return () => stopAllPolling();
  }, []);

  useEffect(() => {
    activeSessionRef.current = activeSessionId;
    if (activeSessionId) {
      stopPollingExcept(activeSessionId);
      loadMessages(activeSessionId);
    } else {
      stopAllPolling();
    }
  }, [activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [activeMessages.length, status.sending]);

  const loadProjects = useCallback(async () => {
    setStatus((current) => ({ ...current, projects: "loading" }));
    try {
      const firstPayload = await listCompanyProjects({ page: 1 });
      const firstData = getPayloadData(firstPayload);
      const firstRows = extractRows(firstData, ["projects"]).map(normalizeProject).filter((project) => project.id);
      const pagination = extractPagination(firstData);
      const lastPage = Math.min(Number(pagination?.last_page || pagination?.lastPage || 1) || 1, 5);
      const extraPayloads = [];
      for (let page = 2; page <= lastPage; page += 1) {
        extraPayloads.push(listCompanyProjects({ page }));
      }
      const extraRows = (await Promise.all(extraPayloads))
        .flatMap((payload) => extractRows(getPayloadData(payload), ["projects"]))
        .map(normalizeProject)
        .filter((project) => project.id);
      const nextProjects = dedupeById([...firstRows, ...extraRows]);
      setProjects(nextProjects);
      setStatus((current) => ({ ...current, projects: "ready" }));
    } catch (error) {
      setStatus((current) => ({ ...current, projects: "error", error: safeErrorMessage(error, copy.noProjects) }));
    }
  }, [copy.noProjects]);

  const loadSessions = useCallback(async () => {
    setStatus((current) => ({ ...current, sessions: "loading", error: "" }));
    try {
      const payload = await listChatSessions();
      const rows = extractRows(getPayloadData(payload), ["sessions", "conversations"])
        .map(normalizeSession)
        .filter((session) => session.id);
      setSessions(rows);
      setStatus((current) => ({ ...current, sessions: "ready", error: "" }));
    } catch (error) {
      setStatus((current) => ({ ...current, sessions: "error", error: safeErrorMessage(error, copy.sessionsError) }));
    }
  }, [copy.sessionsError]);

  async function loadMessages(sessionId, { cursor = "", append = false, silent = false } = {}) {
    if (!sessionId) return;
    if (!silent) setStatus((current) => ({ ...current, messages: "loading", error: "" }));
    try {
      const payload = await listChatSessionMessages(sessionId, cursor);
      const data = getPayloadData(payload);
      const nextMessages = normalizeMessages(data);
      setMessagesBySession((current) => ({
        ...current,
        [sessionId]: append ? mergeMessages(current[sessionId] || [], nextMessages) : nextMessages
      }));
      setMessageCursorBySession((current) => ({ ...current, [sessionId]: normalizeCursor(data) }));
      setStatus((current) => ({ ...current, messages: "ready", error: "" }));
      if (hasAssistantReply(nextMessages, pendingBySession[sessionId]?.submittedAt)) {
        clearPending(sessionId);
      }
    } catch (error) {
      setStatus((current) => ({ ...current, messages: "error", error: safeErrorMessage(error, copy.messagesError) }));
    }
  }

  function startNewChat() {
    stopAllPolling();
    setActiveSessionId("");
    setMessagesBySession((current) => ({ ...current, new: [] }));
    setFailedSend(null);
    setDraft("");
  }

  async function submitMessage(event, retryMessage) {
    event?.preventDefault?.();
    const message = String(retryMessage || draft).trim();
    if (!message || status.sending) return;

    const existingSessionId = activeSession?.id || "";
    const projectId = existingSessionId ? "" : selectedProjectId;
    if (!existingSessionId && !projectId) return;

    const localSessionKey = existingSessionId || "new";
    const submittedAt = new Date().toISOString();
    const userMessage = normalizeMessage({
      id: `local-user-${Date.now()}`,
      role: "user",
      content: message,
      created_at: submittedAt
    });
    const processingMessage = normalizeMessage({
      id: `processing-${Date.now()}`,
      role: "assistant",
      content: copy.processing,
      isProcessing: true,
      created_at: new Date().toISOString()
    });

    setStatus((current) => ({ ...current, sending: true, error: "" }));
    setFailedSend(null);
    setMessagesBySession((current) => ({
      ...current,
      [localSessionKey]: [...(current[localSessionKey] || []), userMessage, processingMessage]
    }));
    setDraft("");

    try {
      const payload = await sendChatMessage({
        session_id: existingSessionId || undefined,
        project_id: existingSessionId ? undefined : projectId,
        message_content: message
      });
      const data = getPayloadData(payload) || {};
      const nextSessionId = data.session_id || data.chat_session_id || existingSessionId;

      if (nextSessionId && nextSessionId !== localSessionKey) {
        const project = selectedProject || {};
        setSessions((current) => dedupeById([
          normalizeSession({
            id: nextSessionId,
            project_id: projectId,
            project: { id: projectId, name: project.name },
            created_at: submittedAt,
            updated_at: submittedAt
          }),
          ...current
        ]));
        setMessagesBySession((current) => {
          const localMessages = current[localSessionKey] || [];
          const next = { ...current, [nextSessionId]: mergeMessages(current[nextSessionId] || [], localMessages) };
          delete next[localSessionKey];
          return next;
        });
        setActiveSessionId(nextSessionId);
      }

      const pollingSessionId = nextSessionId || existingSessionId;
      setPendingBySession((current) => ({ ...current, [pollingSessionId]: { submittedAt, message } }));
      setStatus((current) => ({ ...current, sending: false }));
      loadSessions();
      startPolling(pollingSessionId, submittedAt);
    } catch (error) {
      setDraft(message);
      setFailedSend({ message });
      setMessagesBySession((current) => ({
        ...current,
        [localSessionKey]: (current[localSessionKey] || []).filter((item) => item.id !== userMessage.id && item.id !== processingMessage.id)
      }));
      setStatus((current) => ({ ...current, sending: false, error: safeErrorMessage(error, copy.sendFailed) }));
    }
  }

  function handleRealtimeMessage(rawMessage = {}) {
    const sessionId = rawMessage.chat_session_id || rawMessage.session_id;
    if (!sessionId) return;
    const message = normalizeMessage(rawMessage);
    if (!message.content || message.role !== "assistant") return;

    stopPolling(sessionId);
    setMessagesBySession((current) => ({
      ...current,
      [sessionId]: mergeMessages(current[sessionId] || [], [message], { removeProcessing: true })
    }));
    clearPending(sessionId);
  }

  function startPolling(sessionId, submittedAt) {
    if (!sessionId) return;
    stopPolling(sessionId);
    const startedAt = Date.now();
    pollingRef.current[sessionId] = window.setInterval(async () => {
      if (activeSessionRef.current !== sessionId || Date.now() - startedAt > POLL_TIMEOUT_MS) {
        stopPolling(sessionId);
        setMessagesBySession((current) => ({
          ...current,
          [sessionId]: (current[sessionId] || []).filter((message) => !message.isProcessing)
        }));
        return;
      }
      try {
        const payload = await listChatSessionMessages(sessionId);
        const nextMessages = normalizeMessages(getPayloadData(payload));
        const resolved = hasAssistantReply(nextMessages, submittedAt);
        setMessagesBySession((current) => ({
          ...current,
          [sessionId]: mergeMessages(current[sessionId] || [], nextMessages, { removeProcessing: resolved })
        }));
        if (resolved) {
          stopPolling(sessionId);
          clearPending(sessionId);
        }
      } catch {
        // Keep the visible processing state; the manual retry controls remain available.
      }
    }, POLL_INTERVAL_MS);
  }

  function stopPolling(sessionId) {
    const interval = pollingRef.current[sessionId];
    if (interval) window.clearInterval(interval);
    delete pollingRef.current[sessionId];
  }

  function stopPollingExcept(sessionId) {
    Object.keys(pollingRef.current).forEach((key) => {
      if (key !== sessionId) stopPolling(key);
    });
  }

  function stopAllPolling() {
    Object.keys(pollingRef.current).forEach(stopPolling);
  }

  function clearPending(sessionId) {
    setPendingBySession((current) => {
      const next = { ...current };
      delete next[sessionId];
      return next;
    });
  }

  return (
    <div className="t2-page ai-chat-resource-page" dir={direction}>
      <PageHeader
        action={<Button icon={FiPlus} onClick={startNewChat}>{copy.newChat}</Button>}
        eyebrow={copy.eyebrow}
        subtitle={copy.subtitle}
        title={copy.title}
      />

      <section className="ai-chat-command" data-chat-page="resource">
        <ChatSessionList
          activeSessionId={activeSessionId}
          copy={copy}
          language={language}
          loading={status.sessions === "loading"}
          onNewChat={startNewChat}
          onRefresh={loadSessions}
          onSelect={setActiveSessionId}
          sessions={sessions}
          status={status.sessions}
        />

        <main className="ai-chat-surface">
          <header className="ai-chat-thread-head">
            <div>
              <h2>{activeSession?.title || copy.newChat}</h2>
              <span>{copy.sourcesLimitation}</span>
            </div>
            <div className="ai-chat-header-actions">
              <span className={`ai-realtime-pill ${realtime.isReady ? "is-connected" : "is-fallback"}`}>
                {realtime.isReady ? <FiWifi aria-hidden="true" /> : <FiWifiOff aria-hidden="true" />}
                {realtime.isReady ? copy.realtimeConnected : copy.realtimeFallback}
              </span>
              <button aria-label={copy.refresh} onClick={() => activeSessionId ? loadMessages(activeSessionId) : loadSessions()} type="button">
                <FiRefreshCw aria-hidden="true" />
              </button>
            </div>
          </header>

          <ChatProjectSelector
            activeSession={activeSession}
            copy={copy}
            disabled={status.sending}
            onChange={setSelectedProjectId}
            onRetry={loadProjects}
            projects={projects}
            selectedProjectId={selectedProjectId}
            status={status.projects}
          />

          {status.error ? <p className="ai-chat-alert" role="alert">{status.error}</p> : null}

          <ChatMessages
            copy={copy}
            cursor={activeCursor}
            language={language}
            loading={status.messages === "loading"}
            messages={activeMessages}
            messagesEndRef={messagesEndRef}
            onLoadMore={() => activeSessionId && loadMessages(activeSessionId, { cursor: activeCursor?.nextCursor, append: true, silent: true })}
            onRetry={() => activeSessionId && loadMessages(activeSessionId)}
            status={activeSessionId ? status.messages : "ready"}
          />

          <ChatComposer
            copy={copy}
            disabledReason={disabledReason}
            draft={draft}
            failedSend={failedSend}
            onChange={setDraft}
            onRetrySend={() => failedSend?.message && submitMessage(null, failedSend.message)}
            onSubmit={submitMessage}
            sending={status.sending}
          />
        </main>
      </section>
    </div>
  );
}

function dedupeById(rows) {
  const map = new Map();
  rows.forEach((row) => {
    if (row?.id) map.set(String(row.id), row);
  });
  return Array.from(map.values());
}
