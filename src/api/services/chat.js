import { apiRequest } from "../http.js";

export function listChatSessions() {
  return apiRequest("/chat/sessions", { auth: true });
}

export function listChatSessionMessages(sessionId, cursor) {
  return apiRequest(`/chat/sessions/${encodeURIComponent(sessionId)}/messages`, {
    auth: true,
    query: { cursor }
  });
}

export function sendChatMessage({ project_id, session_id, message, message_content }) {
  const cleanBody = {
    session_id: session_id || undefined,
    project_id: session_id ? undefined : project_id || undefined,
    message_content: message_content || message || ""
  };

  return apiRequest("/chat/messages", {
    method: "POST",
    auth: true,
    body: cleanBody
  });
}

export const listAiConversations = listChatSessions;
export const getAiConversationMessages = (conversationId) => listChatSessionMessages(conversationId);
export const sendAiConversationMessage = (conversationId, body = {}) => sendChatMessage({
  project_id: body.project_id,
  session_id: conversationId,
  message_content: body.message_content || body.question || body.message || ""
});

export function createAiConversation(body = {}) {
  return Promise.resolve({
    success: true,
    data: {
      conversation: {
        id: `local-${Date.now()}`,
        title: body.title || "New chat",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  });
}

export function deleteAiConversation(conversationId) {
  return Promise.resolve({ success: true, data: { id: conversationId } });
}

export function updateAiConversation(conversationId, body) {
  return Promise.resolve({ success: true, data: { id: conversationId, ...body } });
}
