export const processingStatuses = ["queued", "processing"];
export const terminalStatuses = ["processed", "failed"];

export function getUploadId(upload) {
  return upload?.id || upload?.uuid || upload?.upload_id || upload?.file_id || "";
}

export function getUploadName(upload) {
  return upload?.file_name || upload?.name || upload?.title || upload?.original_name || "Upload";
}

export function getProcessingStatus(upload) {
  return String(upload?.processing_status || upload?.status || "").toLowerCase();
}

export function shouldPollUpload(upload) {
  return processingStatuses.includes(getProcessingStatus(upload));
}

export function isFailedUpload(upload) {
  return getProcessingStatus(upload) === "failed";
}

export function uploadStatusTone(upload) {
  const status = getProcessingStatus(upload);
  if (status === "processed") return "processed";
  if (status === "failed") return "failed";
  if (status === "processing") return "processing";
  if (status === "queued") return "queued";
  return "default";
}

export function formatUploadSize(value) {
  const size = Number(value);
  if (!Number.isFinite(size) || size <= 0) return value || "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function safeValue(value) {
  if (value === undefined || value === null || value === "") return "-";
  return value;
}

export function getDownloadFilename(result, upload) {
  return result?.filename || upload?.file_name || upload?.name || "download";
}

export function canAttemptPreview(upload) {
  const name = String(getUploadName(upload)).toLowerCase();
  const type = String(upload?.mime_type || upload?.type || upload?.content_type || "").toLowerCase();
  return (
    type.startsWith("image/") ||
    type.includes("pdf") ||
    type.startsWith("text/") ||
    /\.(png|jpe?g|gif|webp|pdf|txt|csv|md)$/i.test(name)
  );
}

export function previewKind(upload, blobType = "") {
  const name = String(getUploadName(upload)).toLowerCase();
  const type = String(blobType || upload?.mime_type || upload?.type || upload?.content_type || "").toLowerCase();
  if (type.startsWith("image/") || /\.(png|jpe?g|gif|webp)$/i.test(name)) return "image";
  if (type.includes("pdf") || /\.pdf$/i.test(name)) return "pdf";
  if (type.startsWith("text/") || /\.(txt|csv|md)$/i.test(name)) return "text";
  return "unsupported";
}
