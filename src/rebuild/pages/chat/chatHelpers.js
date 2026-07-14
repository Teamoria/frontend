export function normalizeSession(session = {}, index = 0) {
  const project = session.project && typeof session.project === "object" ? session.project : null;
  const id = session.id || session.session_id || session.chat_session_id || "";
  const projectName = project?.name || session.project_name || "";

  return {
    id,
    title: session.title || session.name || projectName || `Project chat ${index + 1}`,
    project_id: session.project_id || project?.id || "",
    project_name: projectName,
    created_at: session.created_at || "",
    updated_at: session.updated_at || session.created_at || ""
  };
}

export function normalizeProject(project = {}) {
  return {
    id: project.id || project.project_id || "",
    name: project.name || project.title || "Untitled project",
    status: project.status || "",
    updated_at: project.updated_at || project.created_at || ""
  };
}

export function normalizeMessage(message = {}) {
  const role = normalizeRole(message.role || message.sender || message.type || message.author);
  return {
    id: message.id || message.message_id || `${role}-${message.created_at || Date.now()}-${Math.random()}`,
    role,
    content: message.content || message.message_content || message.text || "",
    created_at: message.created_at || message.updated_at || "",
    isProcessing: Boolean(message.isProcessing)
  };
}

export function normalizeMessages(data) {
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(data?.messages)
      ? data.messages
      : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.data?.messages)
          ? data.data.messages
          : [];

  return rows.map(normalizeMessage).filter((message) => message.content || message.isProcessing);
}

export function normalizeCursor(data) {
  const source = data && typeof data === "object" ? data : {};
  return {
    nextCursor: source.next_cursor || source.nextCursor || extractCursor(source.next_page_url),
    previousCursor: source.prev_cursor || source.previous_cursor || source.previousCursor || extractCursor(source.prev_page_url),
    perPage: source.per_page || source.perPage || null
  };
}

export function mergeMessages(currentMessages, incomingMessages, { removeProcessing = false } = {}) {
  const map = new Map();
  const base = removeProcessing ? currentMessages.filter((message) => !message.isProcessing) : currentMessages;
  [...base, ...incomingMessages].forEach((message) => {
    const key = message.id || `${message.role}-${message.created_at}-${message.content}`;
    map.set(key, message);
  });
  return Array.from(map.values()).sort(sortByCreatedAt);
}

export function hasAssistantReply(messages, submittedAt) {
  const submittedTime = submittedAt ? new Date(submittedAt).getTime() : 0;
  return messages.some((message) => {
    if (message.role !== "assistant" || message.isProcessing) return false;
    if (!submittedTime) return true;
    const messageTime = new Date(message.created_at || "").getTime();
    return Number.isNaN(messageTime) || messageTime >= submittedTime;
  });
}

export function formatShortDate(value, language = "en") {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(language === "ar" ? "ar" : "en", {
    month: "short",
    day: "numeric"
  }).format(date);
}

export function formatMessageTime(value, language = "en") {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(language === "ar" ? "ar" : "en", {
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export function safeErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function normalizeRole(role) {
  const value = String(role || "").toLowerCase();
  if (["ai", "assistant", "bot", "model", "teamoria_ai"].includes(value)) return "assistant";
  return "user";
}

function sortByCreatedAt(a, b) {
  const left = new Date(a.created_at || 0).getTime();
  const right = new Date(b.created_at || 0).getTime();
  if (Number.isNaN(left) || Number.isNaN(right) || left === right) return 0;
  return left - right;
}

function extractCursor(url) {
  if (!url) return "";
  try {
    return new URL(url).searchParams.get("cursor") || "";
  } catch {
    return "";
  }
}
