import { apiRequest, blobRequest, uploadRequestWithProgress } from "../http.js";

function normalizeUploadListFilters(filters = {}) {
  return {
    per_page: 15,
    ...filters
  };
}

export function uploadFiles({
  files,
  scope = "personal",
  visibility = "private",
  company_id,
  project_id,
  task_id,
  shared_with_user_ids,
  document_type,
  job_description,
  category,
  onUploadProgress
}) {
  const formData = new FormData();

  Array.from(files || []).forEach((file) => {
    formData.append("files[]", file);
  });

  formData.append("scope", scope);
  if (visibility) formData.append("visibility", visibility);
  if (company_id) formData.append("company_id", company_id);
  if (project_id) formData.append("project_id", project_id);
  if (task_id) formData.append("task_id", task_id);
  if (document_type && document_type !== "auto") formData.append("document_type", document_type);
  if (job_description) formData.append("job_description", job_description);
  if (category) formData.append("category", category);

  Array.from(shared_with_user_ids || []).forEach((userId) => {
    formData.append("shared_with_user_ids[]", userId);
  });

  if (typeof onUploadProgress === "function") {
    return uploadRequestWithProgress("/uploads", {
      method: "POST",
      auth: true,
      body: formData,
      onUploadProgress
    });
  }

  return apiRequest("/uploads", {
    method: "POST",
    auth: true,
    body: formData,
    includeInternalHeaders: true
  });
}

export function listUploads(filters = {}) {
  return apiRequest("/uploads", {
    auth: true,
    query: normalizeUploadListFilters(filters),
    includeInternalHeaders: true
  });
}

export function listUploadCollection(filters = {}) {
  return apiRequest("/uploads/list", {
    auth: true,
    query: normalizeUploadListFilters(filters),
    includeInternalHeaders: true
  });
}

export function listMyUploads(filters = {}) {
  return apiRequest("/uploads/mine", {
    auth: true,
    query: normalizeUploadListFilters(filters),
    includeInternalHeaders: true
  });
}

export function listProjectUploads(projectId, filters = {}) {
  return apiRequest(`/uploads/${projectId}/list`, {
    auth: true,
    query: normalizeUploadListFilters(filters),
    includeInternalHeaders: true
  });
}

export function getUpload(uploadId) {
  return apiRequest(`/uploads/${uploadId}`, { auth: true, includeInternalHeaders: true });
}

export function getUploadStatus(uploadId) {
  return apiRequest(`/uploads/${uploadId}/status`, { auth: true, includeInternalHeaders: true });
}

export function downloadUpload(uploadId) {
  return blobRequest(`/uploads/${uploadId}/download`, { auth: true });
}

export function previewUpload(uploadId) {
  return downloadUpload(uploadId);
}

export function updateUploadPermissions(uploadId, body) {
  return apiRequest(`/uploads/${uploadId}/permissions`, {
    method: "POST",
    auth: true,
    body,
    includeInternalHeaders: true
  });
}

export function deleteUploadPermission(uploadId, userId) {
  return apiRequest(`/uploads/${uploadId}/permissions/${userId}`, {
    method: "DELETE",
    auth: true,
    includeInternalHeaders: true
  });
}

export function deleteUpload(uploadId) {
  return apiRequest(`/uploads/${uploadId}`, {
    method: "DELETE",
    auth: true,
    includeInternalHeaders: true
  });
}
